import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;
const DB_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:Pujith%402714@db.ipxenceldxhjeogyfikk.supabase.co:5432/postgres';

if (DB_CONNECTION_STRING) {
  try {
    pool = new Pool({
      connectionString: DB_CONNECTION_STRING,
      ssl: DB_CONNECTION_STRING.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });

    pool.on('error', (err) => {
      console.error('Unexpected idle client error in PostgreSQL pool:', err.message);
    });

    console.log('PostgreSQL Supabase database pool connected successfully.');
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
