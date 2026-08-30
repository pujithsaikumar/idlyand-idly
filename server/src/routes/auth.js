import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { inMemoryDB, isDbConnected } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_idly_and_idly_2026';

// Default fallback staff user credentials if DB is uninitialized
const DEFAULT_STAFF_EMAIL = (process.env.STAFF_EMAIL || 'staff@idlyandidly.com').toLowerCase();
const DEFAULT_STAFF_PASS = process.env.STAFF_PASSWORD || 'Staff@123';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let staffUser = null;

    if (isDbConnected()) {
      const result = await pool.query('SELECT * FROM staff_users WHERE email = $1', [cleanEmail]);
      if (result.rows.length > 0) {
        staffUser = result.rows[0];
      }
    }

    // Check in-memory store or fallback credentials if not found in DB
    if (!staffUser) {
      const inMem = inMemoryDB.staffUsers.find(u => u.email === cleanEmail);
      if (inMem) {
        staffUser = inMem;
      } else if (cleanEmail === DEFAULT_STAFF_EMAIL) {
        // Create default on the fly
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(DEFAULT_STAFF_PASS, salt);
        staffUser = { id: 1, email: DEFAULT_STAFF_EMAIL, password_hash: hash, role: 'admin' };
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
