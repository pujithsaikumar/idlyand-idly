import express from 'express';
import pool, { inMemoryDB, isDbConnected } from '../db.js';
import { authenticateStaffToken } from '../middleware/auth.js';

const router = express.Router();

const VALID_HOSTELS = [
  'Leaders Hostel',
  'B3 Hostel',
  'Prince Hostel',
  'Kings Hostel',
  'Titans Hostel',
  'Queens Hostel',
  'VVH Hostel',
  'IGH Hostel'
];

const VALID_ORDER_STATUSES = ['pending', 'preparing', 'en_route', 'delivered', 'cancelled'];

function generateOrderId() {
  const timePart = Date.now().toString().slice(-5);
  const randPart = Math.floor(100 + Math.random() * 900).toString();
  return `IDLY-${timePart}${randPart}`;
}

// -------------------------------------------------------------
// POST /api/orders (Customer Checkout Endpoint)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      hostel,
      room_number,
      notes,
      items,
      payment_method = 'cod',
      payment_status = 'pending',
      razorpay_payment_id = null,
      upi_utr = null
    } = req.body;

    // 1. Validation Checks
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    const cleanPhone = phone ? phone.toString().replace(/\D/g, '') : '';
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }

    if (!hostel || !VALID_HOSTELS.includes(hostel)) {
      return res.status(400).json({ error: `Hostel must be one of: ${VALID_HOSTELS.join(', ')}.` });
    }

    const cleanUpiUtr = upi_utr ? upi_utr.toString().trim() : '';
    if (payment_method === 'upi') {
      if (!cleanUpiUtr) {
        return res.status(400).json({ error: 'UPI Reference / UTR number is required for GPay / PhonePe payments.' });
      }
      if (cleanUpiUtr.length < 6) {
        return res.status(400).json({ error: 'Please enter a valid UPI Reference / UTR number (at least 6-12 digits).' });
      }
    }

    const cleanRoomNumber = room_number ? room_number.toString().trim() : '';

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one item.' });
    }

    // 2. Calculate totals
    let subtotal = 0;
    let biryaniParcel = 0;
    let halfPortionCount = 0;
    let fullPortionCount = 0;

    const validatedItems = items.map(item => {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;
      subtotal += price * qty;

      const itemName = (item.name || item.item_name || '').toLowerCase();
      const isBiryani = (item.category || '').toLowerCase() === 'biryani' || itemName.includes('biryani') || itemName.includes('biriyani');

      if (isBiryani) {
        biryaniParcel += 10 * qty;
      } else if (itemName.includes('2 pcs') || itemName.includes('2pcs')) {
        halfPortionCount += qty;
      } else {
        fullPortionCount += qty;
      }

      return {
        item_name: item.name || item.item_name,
        quantity: qty,
        unit_price: price
      };
    });

    const halfPortionParcel = Math.ceil(halfPortionCount / 2) * 5;
    const fullPortionParcel = fullPortionCount * 5;
    const parcel_fee = biryaniParcel + halfPortionParcel + fullPortionParcel;

    let delivery_fee = 0;
    if (subtotal < 100) {
      delivery_fee = (hostel === 'VVH Hostel' || hostel === 'IGH Hostel') ? 20 : 10;
    }

    const total = subtotal + parcel_fee + delivery_fee;
    const orderId = generateOrderId();
    const orderStatus = 'pending';

    // 3. Attempt PostgreSQL Database Save
    if (isDbConnected()) {
      let client = null;
      try {
        client = await pool.connect();
        await client.query('BEGIN');

        const insertOrderQuery = `
          INSERT INTO orders (
            id, customer_name, phone, hostel, room_number, notes,
            subtotal, parcel_fee, delivery_fee, total, payment_method, payment_status,
            order_status, razorpay_payment_id, upi_utr
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *;
        `;
        const orderResult = await client.query(insertOrderQuery, [
          orderId,
          customer_name.trim(),
          cleanPhone,
          hostel,
          cleanRoomNumber,
          notes || '',
          subtotal,
          parcel_fee,
          delivery_fee,
          total,
          payment_method,
          payment_status,
          orderStatus,
          razorpay_payment_id,
          cleanUpiUtr || null
        ]);

        const insertItemQuery = `
          INSERT INTO order_items (order_id, item_name, quantity, unit_price)
          VALUES ($1, $2, $3, $4);
        `;

        for (const item of validatedItems) {
          await client.query(insertItemQuery, [orderId, item.item_name, item.quantity, item.unit_price]);
        }

        await client.query('COMMIT');

        const createdOrder = orderResult.rows[0];
        createdOrder.items = validatedItems;

        return res.status(201).json({
          success: true,
          message: 'Order created successfully!',
          orderId,
          order: createdOrder
        });
      } catch (dbErr) {
        if (client) {
          try { await client.query('ROLLBACK'); } catch (_) {}
        }
        console.warn('Postgres order creation failed, using memory store:', dbErr.message);
      } finally {
        if (client) {
          client.release();
        }
      }
    }

    // 4. In-Memory Fallback
    const newOrder = {
      id: orderId,
      customer_name: customer_name.trim(),
      phone: cleanPhone,
      hostel,
      room_number: cleanRoomNumber,
      notes: notes || '',
      subtotal,
      parcel_fee,
      delivery_fee,
      total,
      payment_method,
      payment_status,
      order_status: orderStatus,
      razorpay_payment_id,
      upi_utr: cleanUpiUtr || null,
      created_at: new Date().toISOString(),
      items: validatedItems
    };

    inMemoryDB.orders.unshift(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      orderId,
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// -------------------------------------------------------------
// GET /api/orders (Staff-Only: Returns all orders with items)
// -------------------------------------------------------------
router.get('/', authenticateStaffToken, async (req, res) => {
  try {
    const { status } = req.query;

    if (isDbConnected()) {
      try {
        let queryText = `
          SELECT o.*, 
                 COALESCE(json_agg(
                   json_build_object(
                     'id', i.id,
                     'item_name', i.item_name,
                     'quantity', i.quantity,
                     'unit_price', i.unit_price
                   )
                 ) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
          FROM orders o
          LEFT JOIN order_items i ON o.id = i.order_id
        `;

        const params = [];
        if (status && VALID_ORDER_STATUSES.includes(status)) {
          queryText += ` WHERE o.order_status = $1`;
          params.push(status);
        }

        queryText += ` GROUP BY o.id ORDER BY o.created_at DESC;`;

        const result = await pool.query(queryText, params);
        return res.json({ orders: result.rows });
      } catch (dbErr) {
        console.warn('Postgres fetch orders failed, falling back to memory:', dbErr.message);
      }
    }

    let filtered = [...inMemoryDB.orders];
    if (status && VALID_ORDER_STATUSES.includes(status)) {
      filtered = filtered.filter(o => o.order_status === status);
    }
    return res.json({ orders: filtered });
  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// -------------------------------------------------------------
// GET /api/orders/:id (Public Customer Polling Endpoint)
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (isDbConnected()) {
      try {
        const queryText = `
          SELECT o.*, 
                 COALESCE(json_agg(
                   json_build_object(
                     'id', i.id,
                     'item_name', i.item_name,
                     'quantity', i.quantity,
                     'unit_price', i.unit_price
                   )
                 ) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
          FROM orders o
          LEFT JOIN order_items i ON o.id = i.order_id
          WHERE o.id = $1
          GROUP BY o.id;
        `;
        const result = await pool.query(queryText, [orderId]);
        if (result.rows.length > 0) {
          return res.json({ order: result.rows[0] });
        }
      } catch (dbErr) {
        console.warn('Postgres fetch single order failed, falling back to memory:', dbErr.message);
      }
    }

    const order = inMemoryDB.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order });
  } catch (err) {
    console.error('Fetch single order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order status.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:id/status (Staff-Only Status Update)
// -------------------------------------------------------------
router.patch('/:id/status', authenticateStaffToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_status } = req.body;

    if (!order_status || !VALID_ORDER_STATUSES.includes(order_status)) {
      return res.status(400).json({
        error: `Invalid order_status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
      });
    }

    const shouldVerifyPayment = order_status === 'delivered';

    if (isDbConnected()) {
      try {
        const updateQuery = shouldVerifyPayment
          ? `UPDATE orders SET order_status = $1, payment_status = 'paid' WHERE id = $2 RETURNING *;`
          : `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *;`;

        const result = await pool.query(updateQuery, [order_status, orderId]);
        if (result.rows.length > 0) {
          return res.json({ message: 'Order status updated successfully', order: result.rows[0] });
        }
      } catch (dbErr) {
        console.warn('Postgres status update failed, falling back to memory:', dbErr.message);
      }
    }

    const order = inMemoryDB.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    order.order_status = order_status;
    if (shouldVerifyPayment) {
      order.payment_status = 'paid';
    }
    return res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:id/verify-payment (Staff-Only Manual Verification)
// -------------------------------------------------------------
router.patch('/:id/verify-payment', authenticateStaffToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    if (isDbConnected()) {
      try {
        const result = await pool.query(
          `UPDATE orders SET payment_status = 'paid' WHERE id = $1 RETURNING *;`,
          [orderId]
        );
        if (result.rows.length > 0) {
          return res.json({ message: 'Payment verified successfully', order: result.rows[0] });
        }
      } catch (dbErr) {
        console.warn('Postgres verify payment failed, falling back to memory:', dbErr.message);
      }
    }

    const order = inMemoryDB.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    order.payment_status = 'paid';
    return res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:id/modify (Public 3-Minute Order Modification)
// -------------------------------------------------------------
router.patch('/:id/modify', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { customer_name, phone, hostel, items, notes } = req.body;

    let targetOrder = null;

    if (isDbConnected()) {
      try {
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1;', [orderId]);
        if (orderRes.rows.length > 0) {
          targetOrder = orderRes.rows[0];
        }
      } catch (dbErr) {
        console.warn('Postgres modify fetch failed, falling back to memory:', dbErr.message);
      }
    }

    if (!targetOrder) {
      targetOrder = inMemoryDB.orders.find(o => o.id === orderId);
    }

    if (!targetOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (targetOrder.order_status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be edited once kitchen preparation has started.' });
    }

    const createdAt = new Date(targetOrder.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - createdAt) / 1000);

    if (elapsedSeconds > 180) {
      return res.status(400).json({ error: 'Order edit window has expired (3 minutes limit reached).' });
    }

    const updatedName = customer_name ? customer_name.trim() : targetOrder.customer_name;
    const cleanPhone = phone ? phone.toString().replace(/\D/g, '') : targetOrder.phone;
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }

    const updatedHostel = hostel && VALID_HOSTELS.includes(hostel) ? hostel : targetOrder.hostel;
    const updatedItemsList = Array.isArray(items) && items.length > 0 ? items : (targetOrder.items || []);

    let subtotal = 0;
    let biryaniParcel = 0;
    let halfPortionCount = 0;
    let fullPortionCount = 0;

    const validatedItems = updatedItemsList.map(item => {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price || item.unit_price) || 0;
      subtotal += price * qty;

      const itemName = (item.name || item.item_name || '').toLowerCase();
      const isBiryani = (item.category || '').toLowerCase() === 'biryani' || itemName.includes('biryani') || itemName.includes('biriyani');

      if (isBiryani) {
        biryaniParcel += 10 * qty;
      } else if (itemName.includes('2 pcs') || itemName.includes('2pcs')) {
        halfPortionCount += qty;
      } else {
        fullPortionCount += qty;
      }

      return {
        item_name: item.name || item.item_name,
        quantity: qty,
        unit_price: price
      };
    });

    const halfPortionParcel = Math.ceil(halfPortionCount / 2) * 5;
    const fullPortionParcel = fullPortionCount * 5;
    const parcel_fee = biryaniParcel + halfPortionParcel + fullPortionParcel;

    let delivery_fee = 0;
    if (subtotal < 100) {
      delivery_fee = (updatedHostel === 'VVH Hostel' || updatedHostel === 'IGH Hostel') ? 20 : 10;
    }
    const total = subtotal + parcel_fee + delivery_fee;

    if (isDbConnected()) {
      let client = null;
      try {
        client = await pool.connect();
        await client.query('BEGIN');

        const updateOrderQuery = `
          UPDATE orders
          SET customer_name = $1, phone = $2, hostel = $3, notes = COALESCE($4, notes),
              subtotal = $5, parcel_fee = $6, delivery_fee = $7, total = $8
          WHERE id = $9
          RETURNING *;
        `;
        const updatedRes = await client.query(updateOrderQuery, [
          updatedName, cleanPhone, updatedHostel, notes, subtotal, parcel_fee, delivery_fee, total, orderId
        ]);

        await client.query('DELETE FROM order_items WHERE order_id = $1;', [orderId]);

        const insertItemQuery = `
          INSERT INTO order_items (order_id, item_name, quantity, unit_price)
          VALUES ($1, $2, $3, $4);
        `;
        for (const item of validatedItems) {
          await client.query(insertItemQuery, [orderId, item.item_name, item.quantity, item.unit_price]);
        }

        await client.query('COMMIT');

        const finalOrder = updatedRes.rows[0];
        finalOrder.items = validatedItems;

        return res.json({
          message: 'Order modified successfully',
          order: finalOrder
        });
      } catch (dbErr) {
        if (client) {
          try { await client.query('ROLLBACK'); } catch (_) {}
        }
        console.warn('Postgres modify failed, falling back to memory:', dbErr.message);
      } finally {
        if (client) {
          client.release();
        }
      }
    }

    targetOrder.customer_name = updatedName;
    targetOrder.phone = cleanPhone;
    targetOrder.hostel = updatedHostel;
    targetOrder.notes = notes || targetOrder.notes;
    targetOrder.items = validatedItems;
    targetOrder.subtotal = subtotal;
    targetOrder.parcel_fee = parcel_fee;
    targetOrder.delivery_fee = delivery_fee;
    targetOrder.total = total;

    return res.json({
      message: 'Order modified successfully',
      order: targetOrder
    });
  } catch (err) {
    console.error('Modify order error:', err);
    return res.status(500).json({ error: 'Failed to modify order.' });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:id/cancel (Public 3-Minute Customer Order Cancel)
// -------------------------------------------------------------
router.patch('/:id/cancel', async (req, res) => {
  try {
    const orderId = req.params.id;
    let targetOrder = null;

    if (isDbConnected()) {
      try {
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1;', [orderId]);
        if (orderRes.rows.length > 0) {
          targetOrder = orderRes.rows[0];
        }
      } catch (dbErr) {
        console.warn('Postgres cancel fetch failed, falling back to memory:', dbErr.message);
      }
    }

    if (!targetOrder) {
      targetOrder = inMemoryDB.orders.find(o => o.id === orderId);
    }

    if (!targetOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (targetOrder.order_status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled once kitchen preparation has started.' });
    }

    const createdAt = new Date(targetOrder.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - createdAt) / 1000);

    if (elapsedSeconds > 180) {
      return res.status(400).json({ error: 'Order cancellation window has expired (3 minutes limit reached).' });
    }

    if (isDbConnected()) {
      try {
        const result = await pool.query(
          `UPDATE orders SET order_status = 'cancelled' WHERE id = $1 RETURNING *;`,
          [orderId]
        );
        if (result.rows.length > 0) {
          return res.json({
            message: 'Order cancelled successfully',
            order: result.rows[0]
          });
        }
      } catch (dbErr) {
        console.warn('Postgres cancel update failed, falling back to memory:', dbErr.message);
      }
    }

    targetOrder.order_status = 'cancelled';
    return res.json({
      message: 'Order cancelled successfully',
      order: targetOrder
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    return res.status(500).json({ error: 'Failed to cancel order.' });
  }
});

export default router;
