import config from '~/config.json';

export const navLinks = [
  { label: 'Services', pathname: '/services', key: 'services' },
  { label: 'Portfolio', pathname: '/portfolio', key: 'portfolio' },
  { label: 'About', pathname: '/about', key: 'about' },
  { label: 'Blog', pathname: '/articles', key: 'blog' },
  { label: 'Contact', pathname: '/contact', key: 'contact' },
];

export const socialLinks = [
  {
    label: 'LinkedIn',
    url: `https://www.linkedin.com/company/${config.linkedin}`,
    icon: 'link',
  },
  {
    label: 'Github',
    url: `https://github.com/${config.github}`,
    icon: 'github',
  },
  {
    label: 'Instagram',
    url: `https://www.instagram.com/${config.instagram}`,
    icon: 'link',
  },
];
