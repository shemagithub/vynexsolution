import config from '~/config.json';
import seoData from '~/data/seo.json';

const siteUrl = String(config.url || '').replace(/\/$/, '');

export const DEFAULT_KEYWORDS = seoData.defaultKeywords;
export const SEO_PAGES = seoData.pages;

export function absoluteUrl(pathname = '/') {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === '/') return `${siteUrl}/`;
  return `${siteUrl}${path.replace(/\/$/, '')}/`;
}

export function keywordsToString(keywords = DEFAULT_KEYWORDS) {
  return [...new Set(keywords.filter(Boolean))].join(', ');
}

export function getPageSeo(pathname = '/') {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return SEO_PAGES[normalized] || null;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/logo.png`,
    email: config.email,
    telephone: config.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: config.location || 'Kigali',
      addressCountry: 'RW',
    },
    sameAs: [
      config.github ? `https://github.com/${config.github}` : null,
      config.linkedin ? `https://www.linkedin.com/company/${config.linkedin}` : null,
      config.instagram ? `https://www.instagram.com/${config.instagram}` : null,
    ].filter(Boolean),
    knowsAbout: [
      'Website development',
      'Web development',
      'Systems design',
      'Software development',
      'Mobile app development',
      'IoT systems',
      'Smart systems',
      'UI/UX design',
      'SEO',
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: `${siteUrl}/`,
    description:
      'Website development, systems design, mobile apps, IoT and smart systems by Vynex Solutions.',
    publisher: {
      '@type': 'Organization',
      name: config.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/articles/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function professionalServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: config.name,
    url: `${siteUrl}/`,
    image: `${siteUrl}/social-image.png`,
    description:
      'Vynex Solutions provides website development, systems design, custom software, mobile apps, IoT, and smart systems.',
    areaServed: ['RW', 'Africa', 'Worldwide'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: config.location || 'Kigali',
      addressCountry: 'RW',
    },
    telephone: config.phone,
    email: config.email,
    priceRange: '$$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Technology services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Website development',
            description: 'Custom websites and web applications for businesses.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Systems design',
            description: 'Business systems, SaaS platforms, and software architecture.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mobile app development',
            description: 'Android, iOS, and cross-platform mobile applications.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'IoT and smart systems',
            description: 'IoT devices, sensors, automation, and embedded solutions.',
          },
        },
      ],
    },
  };
}

export function breadcrumbJsonLd(pathname = '/') {
  const page = getPageSeo(pathname);
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${siteUrl}/`,
    },
  ];

  if (page && page.path !== '/') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: page.title.split('—')[0].trim(),
      item: absoluteUrl(page.path),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function homeJsonLd() {
  return [organizationJsonLd(), websiteJsonLd(), professionalServiceJsonLd()];
}
