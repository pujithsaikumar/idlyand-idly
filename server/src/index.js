import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import storeRoutes from './routes/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

import pool, { isDbConnected } from './db.js';

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Idly & Idly Backend Service',
    time: new Date().toISOString()
  });
});

// Database Status & Supabase Rows Diagnostic Endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    if (isDbConnected()) {
      const result = await pool.query('SELECT count(*) FROM orders;');
      const recent = await pool.query('SELECT id, customer_name, hostel, total, payment_method, upi_utr, created_at FROM orders ORDER BY created_at DESC LIMIT 10;');
      return res.json({
        database: 'connected',
        type: 'PostgreSQL (Supabase)',
        total_orders_in_supabase: parseInt(result.rows[0].count),
        recent_orders: recent.rows
      });
    } else {
      return res.json({
        database: 'in-memory-fallback',
        message: 'PostgreSQL pool is not connected'
      });
    }
  } catch (err) {
    return res.status(500).json({
      database: 'error',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/store', storeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Idly & Idly Backend Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`==================================================`);
});
