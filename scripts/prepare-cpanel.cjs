const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clientDir = path.join(root, 'build/client');
const htaccessSrc = path.join(root, 'deploy/cpanel-frontend.htaccess');
const htaccessDest = path.join(clientDir, '.htaccess');
const deployDir = path.join(root, 'deploy/cpanel-frontend');

if (!fs.existsSync(clientDir)) {
  console.error('Run npm run build first.');
  process.exit(1);
}

fs.copyFileSync(htaccessSrc, htaccessDest);

if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

for (const entry of fs.readdirSync(clientDir)) {
  const src = path.join(clientDir, entry);
  const dest = path.join(deployDir, entry);
  fs.cpSync(src, dest, { recursive: true });
}

const zipPath = path.join(root, 'deploy/embedixe-frontend-cpanel.zip');
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath);
}

const { execSync } = require('node:child_process');
execSync(`cd "${deployDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });

console.log('cPanel frontend bundle ready: deploy/cpanel-frontend/');
console.log('Zip archive ready: deploy/embedixe-frontend-cpanel.zip');
console.log('Upload and extract into public_html on embedixe.korasmart.com');
