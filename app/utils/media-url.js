import config from '~/config.json';
import { getApiUrl } from '~/utils/api-url';

export function resolveMediaUrl(src, apiUrl = getApiUrl()) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  if (src.startsWith('/uploads/')) {
    return `${apiUrl.replace(/\/$/, '')}${src}`;
  }
  return src;
}

function faviconMimeType(href) {
  if (!href) return undefined;
  const path = href.split('?')[0].toLowerCase();
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.ico')) return 'image/x-icon';
  return undefined;
}

export function resolveSiteConfigLogos(siteConfig = {}, apiUrl = getApiUrl()) {
  const logoLight = resolveMediaUrl(siteConfig.logoLight, apiUrl);
  const logoDark = resolveMediaUrl(siteConfig.logoDark, apiUrl);
  const favicon = resolveMediaUrl(
    siteConfig.favicon || siteConfig.logoDark || siteConfig.logoLight,
    apiUrl
  );
  const appleTouchIcon = resolveMediaUrl(
    siteConfig.appleTouchIcon || siteConfig.logoDark || siteConfig.logoLight,
    apiUrl
  );

  return {
    ...siteConfig,
    logoLight,
    logoDark,
    favicon,
    appleTouchIcon,
    faviconType: faviconMimeType(favicon),
  };
}

export function resolveAboutHomeImages(home = {}, apiUrl = getApiUrl()) {
  const imagePath = home.image?.trim() || '';
  const imageLargePath = home.imageLarge?.trim() || imagePath;
  const image = imagePath ? resolveMediaUrl(imagePath, apiUrl) : '';
  const imageLarge = imageLargePath ? resolveMediaUrl(imageLargePath, apiUrl) : '';

  return {
    ...home,
    image,
    imageLarge,
  };
}

export function resolveProjectMedia(project = {}, apiUrl = getApiUrl()) {
  return {
    ...project,
    previewImage: resolveMediaUrl(project.previewImage, apiUrl),
  };
}

export { config as siteDefaults };
