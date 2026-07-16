import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAllowedOrigin } from './config.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { pool } from './db/pool.js';
import { normalizeDbError } from './utils/db-errors.js';
import { normalizeMailError } from './services/mail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    }
  });

  app.use('/api', publicRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/admin', express.static(path.join(__dirname, '../admin')));
  app.get('/admin/*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
  });

  app.use((err, _req, res, _next) => {
    const isMail =
      err?.authenticationFailed ||
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'ETIMEDOUT' ||
      err?.code === 'ENOTFOUND' ||
      /mail|imap|smtp|credentials/i.test(err?.message || '');
    const normalized = isMail ? normalizeMailError(err) : normalizeDbError(err);
    console.error('API error:', normalized.message || err);
    res.status(normalized.status || 500).json({ error: normalized.message || 'Internal server error' });
  });

  return app;
}

const app = createApp();
export default app;
