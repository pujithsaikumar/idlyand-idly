import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
  console.log('Usage: DATABASE_URL=your_postgres_url node server/init-db.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('⏳ Connecting to PostgreSQL database...');

    // 1. Create Tables
    await client.query(`
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
        room_number VARCHAR(50) DEFAULT '',
        notes TEXT,
        subtotal NUMERIC(10, 2) NOT NULL,
        parcel_fee NUMERIC(10, 2) NOT NULL,
        delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
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

      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    `);

    console.log('✅ PostgreSQL tables created successfully!');

    // 2. Seed Default Staff User
    const defaultEmail = 'staff@idlyandidly.com';
    const defaultPassword = 'Staff@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    await client.query(`
      INSERT INTO staff_users (email, password_hash, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [defaultEmail, hash]);

    console.log('✅ Default staff user created/seeded:');
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);

    console.log('\n🎉 Database setup & initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
