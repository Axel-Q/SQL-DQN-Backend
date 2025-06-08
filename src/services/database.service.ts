import pg from 'pg';
import dotenv from 'dotenv';
import { DbConfig } from '../types/types';

dotenv.config();

// Database singleton instance
let pool: pg.Pool | null = null;

/**
 * Get database configuration from environment variables
 */
export function getDbConfig(): DbConfig {
  const config: DbConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_DATABASE || 'matrix_sql'
  };

  // 只有在环境变量明确设置为 'true' 时才启用SSL
  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  return config;
}

/**
 * Initialize database connection pool
 */
export function initDbPool(config?: DbConfig): pg.Pool {
  if (pool) return pool;
  
  const dbConfig = config || getDbConfig();
  pool = new pg.Pool(dbConfig);
  
  // Add error handler to prevent app crashes on connection issues
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  // Set search path on each new connection
  pool.on('connect', async (client) => {
    try {
      await client.query('SET search_path TO public, "Cyberpunk", "Fantasy", "RealWorld"');
      console.log('Database search path set to include all schemas');
    } catch (error) {
      console.error('Failed to set database search path:', error);
    }
  });
  
  return pool;
}

/**
 * Get the database pool instance
 */
export function getDbPool(): pg.Pool {
  if (!pool) {
    return initDbPool();
  }
  return pool;
}

/**
 * Close the database pool connection
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}