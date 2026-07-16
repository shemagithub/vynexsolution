const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

const routeFiles = [
  'app/routes/home/route.js',
  'app/routes/about/route.js',
  'app/routes/portfolio/route.js',
  'app/routes/services/route.js',
  'app/routes/pricing/route.js',
  'app/routes/quote/route.js',
  'app/routes/projects.$slug/route.js',
  'app/routes/contact/route.js',
  'app/routes/admin/route.jsx',
  'app/routes/admin._index/route.jsx',
  'app/routes/admin.login/route.jsx',
  'app/routes/admin.logout/route.jsx',
  'app/routes/admin.about/route.jsx',
  'app/routes/admin.contacts/route.jsx',
  'app/routes/admin.mail/route.jsx',
  'app/routes/admin.pricing/route.jsx',
  'app/routes/admin.projects/route.jsx',
  'app/routes/admin.quotes/route.jsx',
  'app/routes/admin.services/route.jsx',
  'app/routes/admin.settings/route.jsx',
  'app/routes/admin.testimonials/route.jsx',
  'app/routes/admin.quote-options/route.jsx',
  'app/routes/admin.articles/route.jsx',
  'app/routes/articles_._index/route.jsx',
  'app/routes/articles.$slug/route.jsx',
];

const backups = new Map();

function removeExportFunctions(source, names) {
  let result = source;

  for (const name of names) {
    const pattern = new RegExp(`export async function ${name}\\s*\\([^)]*\\)\\s*\\{`, 'g');
    let match = pattern.exec(result);

    while (match) {
      const start = match.index;
      let index = start + match[0].length;
      let depth = 1;

      while (index < result.length && depth > 0) {
        const char = result[index];
        if (char === '{') depth += 1;
        if (char === '}') depth -= 1;
        index += 1;
      }

      result = result.slice(0, start) + result.slice(index);
      pattern.lastIndex = start;
      match = pattern.exec(result);
    }
  }

  return result;
}

function stripServerOnlyExports(source) {
  if (/export async function (loader|action)\s*\(/.test(source)) {
    return removeExportFunctions(source, ['loader', 'action']);
  }

  return source
    .replace(/\bloader\b,?\s*/g, '')
    .replace(/\baction\b,?\s*/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/{\s*,/g, '{ ')
    .replace(/,\s*}/g, ' }');
}

function patchForSpaBuild() {
  for (const rel of routeFiles) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) continue;
    const original = fs.readFileSync(file, 'utf8');
    backups.set(rel, original);
    fs.writeFileSync(file, stripServerOnlyExports(original));
  }

  const rootPath = path.join(root, 'app/root.jsx');
  const spaRootPath = path.join(root, 'app/root.spa.jsx');
  backups.set('app/root.jsx', fs.readFileSync(rootPath, 'utf8'));
  fs.copyFileSync(spaRootPath, rootPath);
}

function restorePatches() {
  for (const [rel, original] of backups) {
    fs.writeFileSync(path.join(root, rel), original);
  }
  backups.clear();
}

patchForSpaBuild();

try {
  execSync('remix vite:build --config vite.cpanel.config.js', {
    cwd: root,
    stdio: 'inherit',
  });
} finally {
  restorePatches();
}

execSync('node scripts/prepare-cpanel.cjs', { cwd: root, stdio: 'inherit' });
