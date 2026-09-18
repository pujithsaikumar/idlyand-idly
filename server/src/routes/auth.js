import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { inMemoryDB, isDbConnected } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_idly_and_idly_2026';

// Configured Logins: 1 Admin Account + 2 Dedicated Staff Accounts (Configurable via Environment Variables)
const FALLBACK_STAFF_ACCOUNTS = [
  // 1. Executive Admin (Full access to Analytics, Settings, Pricing & Orders)
  { email: 'admin@idlyandidly.com', pass: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin' },

  // 2. Staff Login 1 (Orders Only)
  { email: 'staff1@idlyandidly.com', pass: process.env.STAFF1_PASSWORD || 'Staff1@123', role: 'staff' },

  // 3. Staff Login 2 (Orders Only)
  { email: 'staff2@idlyandidly.com', pass: process.env.STAFF2_PASSWORD || 'Staff2@123', role: 'staff' },

  // General Staff alias
  { email: 'staff@idlyandidly.com', pass: process.env.STAFF_PASSWORD || 'Staff@123', role: 'staff' }
];

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let staffUser = null;

    if (isDbConnected()) {
      try {
        const result = await pool.query('SELECT * FROM staff_users WHERE email = $1', [cleanEmail]);
        if (result.rows.length > 0) {
          staffUser = result.rows[0];
        }
      } catch (dbErr) {
        console.warn('Database query fallback:', dbErr.message);
      }
    }

    // Check in-memory store or fallback credentials
    if (!staffUser) {
      const inMem = inMemoryDB.staffUsers.find(u => u.email === cleanEmail);
      if (inMem) {
        staffUser = inMem;
      } else {
        const fallbackAcc = FALLBACK_STAFF_ACCOUNTS.find(a => a.email === cleanEmail);
        if (fallbackAcc) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(fallbackAcc.pass, salt);
          staffUser = { id: Math.floor(Math.random() * 1000) + 1, email: fallbackAcc.email, password_hash: hash, role: fallbackAcc.role };
        }
      }
    }

    if (!staffUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, staffUser.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staffUser.id, email: staffUser.email, role: staffUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: staffUser.id,
        email: staffUser.email,
        role: staffUser.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

export default router;
