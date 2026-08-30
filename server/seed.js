import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';
import { inMemoryDB } from './src/db.js';

dotenv.config();

const { Pool } = pg;

async function seed() {
  const email = process.env.STAFF_EMAIL || 'staff@idlyandidly.com';
  const password = process.env.STAFF_PASSWORD || 'Staff@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log(`Seeding staff user...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
      // Create tables if not exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS staff_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'staff',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          customer_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          hostel VARCHAR(100) NOT NULL,
          room_number VARCHAR(50) NOT NULL,
          notes TEXT,
          subtotal NUMERIC(10, 2) NOT NULL,
          parcel_fee NUMERIC(10, 2) NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
          payment_method VARCHAR(20) NOT NULL DEFAULT 'cod',
          payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          order_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          razorpay_payment_id VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          item_name VARCHAR(150) NOT NULL,
          quantity INT NOT NULL,
          unit_price NUMERIC(10, 2) NOT NULL
        );
      `);

      // Upsert Staff User
      const res = await pool.query(
        `INSERT INTO staff_users (email, password_hash, role)
         VALUES ($1, $2, 'admin')
         ON CONFLICT (email) 
         DO UPDATE SET password_hash = $2
         RETURNING id, email, role;`,
        [email.toLowerCase(), passwordHash]
      );
      console.log('Successfully seeded database user:', res.rows[0]);
    } catch (err) {
      console.error('Error seeding Postgres database:', err);
    } finally {
      await pool.end();
    }
  } else {
    // Seed in-memory store
    inMemoryDB.staffUsers.push({
      id: 1,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'admin'
    });
    console.log('Seeded in-memory staff user successfully.');
  }
}

seed();
