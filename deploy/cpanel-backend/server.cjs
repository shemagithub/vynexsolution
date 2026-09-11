/**
 * cPanel LiteSpeed Node.js entry point.
 * lsnode.js uses require() — this CJS wrapper loads the ESM app via import().
 *
 * In cPanel → Setup Node.js App → Application startup file: server.cjs
 */
const fs = require('fs');
const path = require('path');

const expressDir = path.join(__dirname, 'node_modules', 'express');
if (!fs.existsSync(expressDir)) {
  console.error('');
  console.error('ERROR: Dependencies are missing (express not found).');
  console.error('Fix in cPanel:');
  console.error('  1. Setup Node.js App → open this application');
  console.error('  2. Click "Run NPM Install"');
  console.error('  3. Click Restart');
  console.error('');
  console.error('Or via SSH/Terminal:');
  console.error(`  cd ${__dirname}`);
  console.error('  npm install --production');
  console.error('  # then Restart the Node.js app');
  console.error('');
  process.exit(1);
}

import('./app.js').catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
