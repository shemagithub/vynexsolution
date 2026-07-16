import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:7777',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@embedixe.com',
  siteEmail: process.env.SITE_EMAIL || process.env.MAIL_USER || 'info@embedixe.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    socketPath: process.env.DB_SOCKET || '',
    user: process.env.DB_USER || 'embedixe',
    password: process.env.DB_PASSWORD || 'embedixe123',
    database: process.env.DB_NAME || 'embedixe',
  },
  mail: {
    imapHost: process.env.MAIL_IMAP_HOST || 'korasmart.com',
    imapPort: Number(process.env.MAIL_IMAP_PORT) || 993,
    smtpHost: process.env.MAIL_SMTP_HOST || 'korasmart.com',
    smtpPort: Number(process.env.MAIL_SMTP_PORT) || 465,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'EMBEDIXe',
    notifyTo: process.env.MAIL_NOTIFY_TO || process.env.MAIL_USER || '',
  },
};

export function getCorsOrigins() {
  const origins = new Set();

  for (const value of (process.env.CORS_ORIGINS || '').split(',')) {
    const origin = value.trim();
    if (origin) origins.add(origin);
  }

  if (config.corsOrigin) origins.add(config.corsOrigin);

  origins.add('https://embedixe.korasmart.com');
  origins.add('https://www.embedixe.korasmart.com');
  origins.add('https://test.guzekustomz.com');
  origins.add('http://test.guzekustomz.com');
  origins.add('https://api.korasmart.com');
  origins.add('http://api.korasmart.com');
  origins.add('https://korasmart.com');
  origins.add('https://www.korasmart.com');
  origins.add('https://embedixe.com');
  origins.add('https://www.embedixe.com');

  return [...origins];
}

// Local dev origins (any localhost / 127.0.0.1 port) are always allowed.
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin / curl / server-to-server
  if (LOCALHOST_ORIGIN_RE.test(origin)) return true;
  return getCorsOrigins().includes(origin);
}
