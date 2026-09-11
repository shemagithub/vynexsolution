import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:7777',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@vynexsoultions.com',
  siteEmail: process.env.SITE_EMAIL || process.env.MAIL_USER || 'info@vynexsoultions.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    socketPath: process.env.DB_SOCKET || '',
    user: process.env.DB_USER || 'vynex',
    password: process.env.DB_PASSWORD || 'vynex123',
    database: process.env.DB_NAME || 'vynex',
  },
  mail: {
    imapHost: process.env.MAIL_IMAP_HOST || 'vynexsoultions.com',
    imapPort: Number(process.env.MAIL_IMAP_PORT) || 993,
    smtpHost: process.env.MAIL_SMTP_HOST || 'vynexsoultions.com',
    smtpPort: Number(process.env.MAIL_SMTP_PORT) || 465,
    user: process.env.MAIL_USER || 'info@vynexsoultions.com',
    pass: process.env.MAIL_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'Vynex Solutions',
    notifyTo: process.env.MAIL_NOTIFY_TO || process.env.MAIL_USER || 'info@vynexsoultions.com',
  },
};

export function getCorsOrigins() {
  const origins = new Set();

  for (const value of (process.env.CORS_ORIGINS || '').split(',')) {
    const origin = value.trim();
    if (origin) origins.add(origin);
  }

  if (config.corsOrigin) origins.add(config.corsOrigin);

  origins.add('https://vynexsoultions.com');
  origins.add('https://www.vynexsoultions.com');
  origins.add('https://backend.vynexsoultions.com');
  origins.add('https://vynexsolutions.com');
  origins.add('https://www.vynexsolutions.com');

  return [...origins];
}

// Local dev origins (any localhost / 127.0.0.1 port) are always allowed.
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin / curl / server-to-server
  if (LOCALHOST_ORIGIN_RE.test(origin)) return true;
  return getCorsOrigins().includes(origin);
}
