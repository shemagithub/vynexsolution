import config from '~/config.json';

export const navLinks = [
  { label: 'Services', pathname: '/services', key: 'services' },
  { label: 'Portfolio', pathname: '/portfolio', key: 'portfolio' },
  { label: 'Packages', pathname: '/pricing', key: 'pricing' },
  { label: 'About', pathname: '/about', key: 'about' },
  { label: 'Blog', pathname: '/articles', key: 'blog' },
  { label: 'Contact', pathname: '/contact', key: 'contact' },
];

export function getSocialLinks(siteConfig = config) {
  return [
    {
      label: 'LinkedIn',
      url: `https://www.linkedin.com/company/${siteConfig.linkedin || config.linkedin}`,
      icon: 'linkedin',
    },
    {
      label: 'Github',
      url: `https://github.com/${siteConfig.github || config.github}`,
      icon: 'github',
    },
    {
      label: 'Instagram',
      url: `https://www.instagram.com/${siteConfig.instagram || config.instagram}`,
      icon: 'instagram',
    },
  ];
}

/** @deprecated Use getSocialLinks(siteConfig) instead */
export const socialLinks = getSocialLinks();
