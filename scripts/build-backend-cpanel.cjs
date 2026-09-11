#!/usr/bin/env node
/**
 * Package backend for cPanel Node.js hosting.
 * Output: deploy/vynex-backend-cpanel.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const backendDir = path.join(root, 'backend');
const stagingDir = path.join(root, 'deploy/cpanel-backend');
const zipPath = path.join(root, 'deploy/vynex-backend-cpanel.zip');

const excludeNames = new Set([
  'node_modules',
  '.env',
  '.git',
  '.DS_Store',
]);

function shouldSkip(name) {
  return excludeNames.has(name) || name.endsWith('.log');
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      if (shouldSkip(entry)) continue;
      if (entry === 'uploads') {
        fs.mkdirSync(path.join(dest, 'uploads'), { recursive: true });
        fs.writeFileSync(path.join(dest, 'uploads', '.gitkeep'), '');
        continue;
      }
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.copyFileSync(src, dest);
}

if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

copyRecursive(backendDir, stagingDir);

if (!fs.existsSync(path.join(stagingDir, 'package-lock.json'))) {
  console.warn('Warning: package-lock.json missing — run npm install in backend/ first.');
}

fs.writeFileSync(
  path.join(stagingDir, '.env.example'),
  `# =============================================================================
# Vynex Solutions Backend — cPanel production
# Copy this file to .env and fill in DB + mail passwords.
# =============================================================================

NODE_ENV=production
PORT=4000

# MySQL (cPanel → MySQL Databases — use the FULL prefixed names)
DB_HOST=localhost
DB_PORT=3306
# If localhost fails, uncomment and set socket from cPanel MySQL connections:
# DB_SOCKET=/var/lib/mysql/mysql.sock
DB_USER=YOURCPANEL_vynex
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=YOURCPANEL_vynex

# Security — change these before going live
JWT_SECRET=replace-with-a-long-random-string
ADMIN_EMAIL=admin@vynexsoultions.com
ADMIN_PASSWORD=replace-with-a-strong-password

# Frontend allowed origins
CORS_ORIGIN=https://vynexsoultions.com
CORS_ORIGINS=https://www.vynexsoultions.com,https://vynexsoultions.com

# Mail — same cPanel server → use localhost (recommended)
MAIL_IMAP_HOST=localhost
MAIL_IMAP_PORT=993
MAIL_SMTP_HOST=localhost
MAIL_SMTP_PORT=465
MAIL_USER=info@vynexsoultions.com
MAIL_PASS=YOUR_MAIL_PASSWORD
MAIL_FROM_NAME=Vynex Solutions
MAIL_NOTIFY_TO=info@vynexsoultions.com
SITE_EMAIL=info@vynexsoultions.com
SITE_URL=https://vynexsoultions.com
MAIL_TLS_REJECT_UNAUTHORIZED=false
`
);

fs.writeFileSync(
  path.join(stagingDir, 'CPANEL-SETUP.txt'),
  `Vynex Solutions — Backend cPanel / Node.js setup
================================================

ZIP CONTENTS
------------
Extract this zip into the Node app folder, for example:
  /home/YOURUSER/backend.vynexsoultions.com

Do NOT put this inside public_html unless you know how to protect it.


STEP 1 — Create MySQL database
------------------------------
1. cPanel → MySQL Databases
2. Create database (example name: vynex)
3. Create a MySQL user with a strong password
4. Add the user to the database with ALL PRIVILEGES
5. Note the FULL names cPanel shows, e.g.:
     Database: youruser_vynex
     User:     youruser_vynex

Tables are created AUTOMATICALLY when the Node app starts
(as long as DB_* env vars are correct). You do NOT need to
import schema.sql by hand.


STEP 2 — Create Node.js app
---------------------------
1. cPanel → Setup Node.js App → Create Application
2. Settings:
   - Node.js version: 18.x or 20.x (recommended)
   - Application mode: Production
   - Application root: path to the extracted backend folder
       Example: backend.vynexsoultions.com
   - Application URL: backend.vynexsoultions.com (or your API host)
   - Application startup file: server.cjs
3. Click Create


STEP 3 — Environment variables
------------------------------
In the Node.js app page, set Environment variables (or create .env
in the application root). Required:

  NODE_ENV=production
  PORT=4000

  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=youruser_vynex
  DB_PASSWORD=your-db-password
  DB_NAME=youruser_vynex

  JWT_SECRET=long-random-secret
  ADMIN_EMAIL=admin@vynexsoultions.com
  ADMIN_PASSWORD=choose-a-strong-password

  CORS_ORIGIN=https://vynexsoultions.com
  CORS_ORIGINS=https://www.vynexsoultions.com,https://vynexsoultions.com

  MAIL_IMAP_HOST=localhost
  MAIL_IMAP_PORT=993
  MAIL_SMTP_HOST=localhost
  MAIL_SMTP_PORT=465
  MAIL_USER=info@vynexsoultions.com
  MAIL_PASS=your-mailbox-password
  MAIL_FROM_NAME=Vynex Solutions
  MAIL_NOTIFY_TO=info@vynexsoultions.com
  SITE_EMAIL=info@vynexsoultions.com
  SITE_URL=https://vynexsoultions.com
  MAIL_TLS_REJECT_UNAUTHORIZED=false

Notes:
- Use FULL cPanel DB names (with the account prefix).
- Same server as mail → use localhost for MAIL_*_HOST.


STEP 4 — Install dependencies (REQUIRED)
----------------------------------------
This fixes: Cannot find package 'express'

In the Node.js App page, click "Run NPM Install"
  OR via Terminal / SSH:

  cd ~/backend.vynexsoultions.com
  source ~/nodevenv/backend.vynexsoultions.com/*/bin/activate
  npm install --production

Then Restart the app.

Without this step the app cannot start.


STEP 5 — Start / Restart
------------------------
cPanel → Setup Node.js App → Restart.

On first start the app will:
  - create all MySQL tables
  - seed projects, services, team, settings, admin user

Test:
  https://backend.vynexsoultions.com/health
  https://backend.vynexsoultions.com/api/config

You should see JSON. Check Logs if not.


STEP 6 — Frontend
-----------------
Point the site API_URL to:
  https://backend.vynexsoultions.com

CORS_ORIGIN / CORS_ORIGINS must include your site domain.


ADMIN LOGIN
-----------
https://vynexsoultions.com/admin/login
Use ADMIN_EMAIL + ADMIN_PASSWORD from the environment.


TROUBLESHOOTING
---------------
- Cannot find package 'express'
    → Run NPM Install, then Restart. Confirm Application root
      contains package.json and node_modules/express after install.
- Table '....projects' doesn't exist
    → App could not connect or create tables. Fix DB_* vars, Restart.
      Or manually: npm run db:ensure
- Access denied MySQL → wrong DB_USER / DB_PASSWORD / DB_NAME prefix
- Mail refused → MAIL_*_HOST=localhost and restart
- CORS errors → add frontend domain to CORS_ORIGINS

Startup file must stay: server.cjs
`
);

if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath);
}

execSync(`cd "${stagingDir}" && zip -r "${zipPath}" . -x "*.DS_Store"`, {
  stdio: 'inherit',
});

const sizeMb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
console.log(`cPanel backend package ready: deploy/cpanel-backend/`);
console.log(`Zip archive ready: deploy/vynex-backend-cpanel.zip (${sizeMb} MB)`);
console.log('Upload the zip to cPanel, extract, then follow CPANEL-SETUP.txt');
