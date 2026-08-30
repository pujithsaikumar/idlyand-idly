import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log('PostgreSQL database pool created.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
  }
} else {
  console.log('DATABASE_URL not set. Operating with fallback in-memory data store for local development.');
}

// In-Memory Storage Fallback (for instant local execution before connecting Neon PostgreSQL)
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
  // If pool is not configured, fallback logic is handled in route handlers
  throw new Error('DATABASE_URL is not configured in environment variables.');
}

export function isDbConnected() {
  return pool !== null;
}

export default pool;
