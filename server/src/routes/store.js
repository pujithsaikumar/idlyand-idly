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
  outOfStockItemIds: []
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
      outOfStockItemIds
    } = req.body;

    if (isStoreOpen !== undefined) storeSettingsState.isStoreOpen = Boolean(isStoreOpen);
    if (deliveryTimeEstimate !== undefined) storeSettingsState.deliveryTimeEstimate = String(deliveryTimeEstimate);
    if (announcementText !== undefined) storeSettingsState.announcementText = String(announcementText);
    if (customPrices !== undefined) storeSettingsState.customPrices = customPrices;
    if (outOfStockItemIds !== undefined) storeSettingsState.outOfStockItemIds = outOfStockItemIds;

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

export default router;
