import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../uploads');

export async function bootstrap() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  if (config.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET || config.jwtSecret === 'dev-secret-change-me') {
      console.warn('WARNING: Set a strong JWT_SECRET environment variable in production.');
    }
    if (!process.env.ADMIN_PASSWORD || config.adminPassword === 'admin123') {
      console.warn('WARNING: Change ADMIN_PASSWORD before going live.');
    }
  }

  try {
    await pool.query('SELECT 1');
    console.log('MySQL database connected');
    await runMigrations();
  } catch (err) {
    console.warn('MySQL not available:', err.message);
    console.warn('Create the database in cPanel, import db/schema.sql, then run: npm run seed');
  }
}
