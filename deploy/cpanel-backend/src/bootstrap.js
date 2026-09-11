import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { ensureDatabase } from './db/ensure-database.js';

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
    await ensureDatabase();
    console.log('MySQL database connected');
  } catch (err) {
    console.warn('MySQL not available:', err.message);
    console.warn(
      'Check DB_HOST / DB_USER / DB_PASSWORD / DB_NAME in the Node.js app environment, then Restart.'
    );
  }
}
