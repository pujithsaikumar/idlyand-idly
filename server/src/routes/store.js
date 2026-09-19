import express from 'express';
import pool, { isDbConnected } from '../db.js';
import { authenticateStaffToken } from '../middleware/auth.js';

const router = express.Router();

// Store settings state (fallback & initial)
let storeSettingsState = {
  isStoreOpen: true,
  deliveryTimeEstimate: '20–25 mins',
  announcementText: '⚡ 100% Free Hostel Delivery on orders ≥ ₹100',
  customPrices: {},
  outOfStockItemIds: [],
  customMenuItems: []
};

// -------------------------------------------------------------
// GET /api/store (Public: Fetch live store status, delivery time, prices & stock)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const result = await pool.query('SELECT settings_data FROM store_config WHERE id = 1;');
        if (result.rows.length > 0 && result.rows[0].settings_data) {
          storeSettingsState = {
            ...storeSettingsState,
            ...result.rows[0].settings_data
          };
          if (!Array.isArray(storeSettingsState.customMenuItems)) {
            storeSettingsState.customMenuItems = [];
          }
        }
      } catch (dbErr) {
        // Fall back to in-memory state
      }
    }
    return res.json({ success: true, settings: storeSettingsState });
  } catch (err) {
    console.error('Fetch store settings error:', err);
    return res.json({ success: true, settings: storeSettingsState });
  }
});

// Helper to save store settings to Postgres
async function persistStoreSettings() {
  if (isDbConnected()) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_config (
          id INT PRIMARY KEY,
          settings_data JSONB NOT NULL
        );
        INSERT INTO store_config (id, settings_data)
        VALUES (1, $1)
        ON CONFLICT (id) DO UPDATE SET settings_data = $1;
      `, [JSON.stringify(storeSettingsState)]);
    } catch (dbErr) {
      console.warn('Postgres store_config update warning:', dbErr.message);
    }
  }
}

// -------------------------------------------------------------
// PATCH /api/store (Staff/Admin Only: Update live store settings)
// -------------------------------------------------------------
router.patch('/', authenticateStaffToken, async (req, res) => {
  try {
    const {
      isStoreOpen,
      deliveryTimeEstimate,
      announcementText,
      customPrices,
      outOfStockItemIds,
      customMenuItems
    } = req.body;

    if (isStoreOpen !== undefined) storeSettingsState.isStoreOpen = Boolean(isStoreOpen);
    if (deliveryTimeEstimate !== undefined) storeSettingsState.deliveryTimeEstimate = String(deliveryTimeEstimate);
    if (announcementText !== undefined) storeSettingsState.announcementText = String(announcementText);
    if (customPrices !== undefined) storeSettingsState.customPrices = customPrices;
    if (outOfStockItemIds !== undefined) storeSettingsState.outOfStockItemIds = outOfStockItemIds;
    if (customMenuItems !== undefined && Array.isArray(customMenuItems)) {
      storeSettingsState.customMenuItems = customMenuItems;
    }

    await persistStoreSettings();

    return res.json({
      success: true,
      message: 'Store settings updated successfully across all devices!',
      settings: storeSettingsState
    });
  } catch (err) {
    console.error('Update store settings error:', err);
    return res.status(500).json({ error: 'Failed to update store settings.' });
  }
});

// -------------------------------------------------------------
// POST /api/store/items (Admin Only: Create New Menu Item)
// -------------------------------------------------------------
router.post('/items', authenticateStaffToken, async (req, res) => {
  try {
    const { name, price, category = 'tiffins', portion = '1 portion', desc = '', emoji = '🥞', badge = '' } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Item name and price are required.' });
    }

    const newItem = {
      id: `custom_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      price: parseFloat(price) || 0,
      category: category || 'tiffins',
      portion: portion || '1 portion',
      desc: desc || '',
      emoji: emoji || '🥞',
      badge: badge || '',
      badgeType: badge ? 'special' : '',
      rating: '5.0',
      ordersCount: 'New Item'
    };

    if (!Array.isArray(storeSettingsState.customMenuItems)) {
      storeSettingsState.customMenuItems = [];
    }

    storeSettingsState.customMenuItems.unshift(newItem);
    await persistStoreSettings();

    return res.status(201).json({
      success: true,
      message: `Menu item "${newItem.name}" added successfully!`,
      item: newItem,
      settings: storeSettingsState
    });
  } catch (err) {
    console.error('Add menu item error:', err);
    return res.status(500).json({ error: 'Failed to add menu item.' });
  }
});

// -------------------------------------------------------------
// DELETE /api/store/items/:id (Admin Only: Delete Custom Menu Item)
// -------------------------------------------------------------
router.delete('/items/:id', authenticateStaffToken, async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!Array.isArray(storeSettingsState.customMenuItems)) {
      storeSettingsState.customMenuItems = [];
    }

    storeSettingsState.customMenuItems = storeSettingsState.customMenuItems.filter(i => i.id !== itemId);
    
    // Also clean up customPrices if existed
    if (storeSettingsState.customPrices && storeSettingsState.customPrices[itemId]) {
      delete storeSettingsState.customPrices[itemId];
    }

    await persistStoreSettings();

    return res.json({
      success: true,
      message: 'Item removed successfully!',
      settings: storeSettingsState
    });
  } catch (err) {
    console.error('Delete menu item error:', err);
    return res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

export default router;
