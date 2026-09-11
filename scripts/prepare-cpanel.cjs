const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clientDir = path.join(root, 'build/client');
const htaccessSrc = path.join(root, 'deploy/cpanel-frontend.htaccess');
const htaccessDest = path.join(clientDir, '.htaccess');
const deployDir = path.join(root, 'deploy/cpanel-frontend');
const config = JSON.parse(fs.readFileSync(path.join(root, 'app/config.json'), 'utf8'));
const seoData = JSON.parse(fs.readFileSync(path.join(root, 'app/data/seo.json'), 'utf8'));

if (!fs.existsSync(clientDir)) {
  console.error('Run npm run build first.');
  process.exit(1);
}

const siteUrl = String(config.url || 'https://vynexsoultions.com').replace(/\/$/, '');
const ogImage = `${siteUrl}/social-image.png`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(pathname = '/') {
  if (pathname === '/') return `${siteUrl}/`;
  return `${siteUrl}${pathname.replace(/\/$/, '')}/`;
}

function buildJsonLd(pathname) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: `${siteUrl}/`,
    logo: `${siteUrl}${config.logoLight || '/logo-light.svg'}`,
    email: config.email,
    telephone: config.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: config.location || 'Kigali',
      addressCountry: 'RW',
    },
    knowsAbout: [
      'Website development',
      'Web development',
      'Systems design',
      'Mobile app development',
      'IoT systems',
      'Smart systems',
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: `${siteUrl}/`,
    description:
      'Website development, systems design, mobile apps, IoT and smart systems by Vynex Solutions.',
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: config.name,
    url: `${siteUrl}/`,
    image: ogImage,
    description:
      'Website development, systems design, custom software, mobile apps, IoT, and smart systems.',
    areaServed: ['RW', 'Africa', 'Worldwide'],
    telephone: config.phone,
    email: config.email,
  };

  if (pathname === '/') {
    return [org, website, service];
  }

  const page = seoData.pages[pathname];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${siteUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page?.title?.split('—')[0]?.trim() || 'Page',
          item: absoluteUrl(pathname),
        },
      ],
    },
  ];
}

function seoHeadTags(page) {
  const title = `${config.name} | ${page.title}`;
  const description = page.description;
  const keywords = [...new Set([...(page.keywords || []), ...(seoData.defaultKeywords || [])])].join(
    ', '
  );
  const pageUrl = absoluteUrl(page.path);
  const schemas = buildJsonLd(page.path);

  const schemaTags = schemas
    .map(
      schema =>
        `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n    ');

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="${escapeHtml(config.name)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(config.name)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    ${schemaTags}
`.trim();
}

function injectSeoIntoHtml(html, page) {
  const tags = seoHeadTags(page);
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `    ${tags}\n  </head>`);
  }
  return `${tags}\n${html}`;
}

function writeSeoShell(html, page) {
  const injected = injectSeoIntoHtml(html, page);
  if (page.path === '/') {
    fs.writeFileSync(path.join(clientDir, 'index.html'), injected);
    return;
  }

  const dir = path.join(clientDir, page.path.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), injected);
}

fs.copyFileSync(htaccessSrc, htaccessDest);

const baseHtml = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');
for (const page of Object.values(seoData.pages)) {
  writeSeoShell(baseHtml, page);
}
console.log(`Injected SEO meta into ${Object.keys(seoData.pages).length} HTML shells`);

if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

for (const entry of fs.readdirSync(clientDir)) {
  const src = path.join(clientDir, entry);
  const dest = path.join(deployDir, entry);
  fs.cpSync(src, dest, { recursive: true });
}

const zipPath = path.join(root, 'deploy/vynex-frontend-cpanel.zip');
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath);
}

const { execSync } = require('node:child_process');
execSync(`cd "${deployDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });

console.log('cPanel frontend bundle ready: deploy/cpanel-frontend/');
console.log('Zip archive ready: deploy/vynex-frontend-cpanel.zip');
console.log('Upload and extract into public_html on your Vynex Solutions domain');
