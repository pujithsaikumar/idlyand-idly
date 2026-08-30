import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import pool, { inMemoryDB, isDbConnected } from '../db.js';

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  } catch (e) {
    console.warn('Failed to initialize Razorpay SDK instance:', e.message);
  }
}

// -------------------------------------------------------------
// POST /api/payments/create-order (Create Razorpay Payment Order)
// -------------------------------------------------------------
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);

    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency,
        receipt,
        payment_capture: 1
      };
      const razorpayOrder = await razorpayInstance.orders.create(options);
      return res.json({
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: RAZORPAY_KEY_ID
      });
    } else {
      // Mock mode for local testing before setting live Razorpay credentials
      const mockRazorpayId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
      return res.json({
        id: mockRazorpayId,
        amount: amountInPaise,
        currency,
        key_id: RAZORPAY_KEY_ID || 'rzp_test_mockKey12345',
        isMock: true,
        message: 'Razorpay mock order created (set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in env for live SDK)'
      });
    }
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ error: 'Failed to create payment order.' });
  }
});

// -------------------------------------------------------------
// POST /api/payments/verify (Validate Razorpay Signature & Update Order)
// -------------------------------------------------------------
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required for payment verification.' });
    }

    let isSignatureValid = false;

    if (RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    } else {
      // Allow verification in test/mock mode if razorpay secret is unset
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    // Update order payment status in DB or in-memory
    if (isDbConnected()) {
      await pool.query(
        `UPDATE orders 
         SET payment_status = 'paid', payment_method = 'online', razorpay_payment_id = $1 
         WHERE id = $2;`,
        [razorpay_payment_id || 'pay_mock_123', order_id]
      );
    } else {
      const order = inMemoryDB.orders.find(o => o.id === order_id);
      if (order) {
        order.payment_status = 'paid';
        order.payment_method = 'online';
        order.razorpay_payment_id = razorpay_payment_id || 'pay_mock_123';
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified and order updated successfully.'
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ error: 'Payment verification failed.' });
  }
});

export default router;
