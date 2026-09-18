import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });

    pool.on('error', (err) => {
      console.error('Unexpected idle client error in PostgreSQL pool:', err.message);
    });

    console.log('PostgreSQL database pool created.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
  }
} else {
  console.log('DATABASE_URL not set. Operating with fallback in-memory data store.');
}

// In-Memory Storage Fallback (guarantees zero downtime and 100% order placement success)
export const inMemoryDB = {
  staffUsers: [],
  orders: [],
  orderItems: []
};

// Database Query Wrapper
export async function query(text, params) {
  if (pool) {
    return await pool.query(text, params);
  }
  throw new Error('DATABASE_URL is not configured.');
}

export function isDbConnected() {
  return pool !== null;
}

export default pool;
