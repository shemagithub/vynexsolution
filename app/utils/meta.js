import config from '~/config.json';
import {
  DEFAULT_KEYWORDS,
  absoluteUrl,
  getPageSeo,
  homeJsonLd,
  breadcrumbJsonLd,
  keywordsToString,
} from '~/utils/seo';

const { name, url, twitter } = config;
const defaultOgImage = `${String(url || '').replace(/\/$/, '')}/social-image.png`;

/**
 * Build Remix route meta for titles, description, Open Graph, Twitter, keywords, and JSON-LD.
 */
export function baseMeta({
  title,
  description,
  prefix = name,
  ogImage = defaultOgImage,
  pathname,
  keywords,
  robots = 'index, follow, max-image-preview:large',
  jsonLd,
  type = 'website',
} = {}) {
  const titleText = [prefix, title].filter(Boolean).join(' | ');
  const pageUrl = pathname ? absoluteUrl(pathname) : `${String(url || '').replace(/\/$/, '')}/`;
  const keywordList = keywords?.length ? keywords : DEFAULT_KEYWORDS;
  const keywordString = keywordsToString(keywordList);

  const tags = [
    { title: titleText },
    { name: 'description', content: description },
    { name: 'keywords', content: keywordString },
    { name: 'author', content: name },
    { name: 'robots', content: robots },
    { name: 'googlebot', content: robots },
    { tagName: 'link', rel: 'canonical', href: pageUrl },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: `${name} — ${title || 'Website development & systems design'}` },
    { property: 'og:image:width', content: '1280' },
    { property: 'og:image:height', content: '800' },
    { property: 'og:title', content: titleText },
    { property: 'og:site_name', content: name },
    { property: 'og:type', content: type },
    { property: 'og:url', content: pageUrl },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:description', content: description },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:description', content: description },
    { property: 'twitter:title', content: titleText },
    { property: 'twitter:site', content: twitter || `@${config.instagram || 'vynexsolutions'}` },
    { property: 'twitter:image', content: ogImage },
  ];

  if (twitter) {
    tags.push({ property: 'twitter:creator', content: twitter });
  }

  const schemas = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];
  for (const schema of schemas) {
    tags.push({ 'script:ld+json': schema });
  }

  return tags;
}

/** Convenience helper for static marketing pages defined in seo.json */
export function pageMeta(pathname, overrides = {}) {
  const page = getPageSeo(pathname);
  if (!page) {
    return baseMeta({ pathname, ...overrides });
  }

  const isHome = page.path === '/';
  return baseMeta({
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    pathname: page.path,
    jsonLd: isHome
      ? [...homeJsonLd(), breadcrumbJsonLd('/')]
      : [breadcrumbJsonLd(page.path)],
    ...overrides,
  });
}
