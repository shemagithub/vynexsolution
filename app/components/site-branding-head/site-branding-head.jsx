import { useEffect } from 'react';
import { resolveMediaUrl } from '~/utils/media-url';

function mimeFromHref(href) {
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

function upsertLink({ rel, href, type, media, marker }) {
  if (!href) return;

  const selector = `link[rel="${rel}"][data-branding="${marker}"]`;
  let link = document.querySelector(selector);

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    link.setAttribute('data-branding', marker);
    document.head.appendChild(link);
  }

  link.href = href;
  const resolvedType = type || mimeFromHref(href);
  if (resolvedType) {
    link.type = resolvedType;
  } else {
    link.removeAttribute('type');
  }
  if (media) {
    link.media = media;
  } else {
    link.removeAttribute('media');
  }
}

function removeDefaultIcons() {
  const links = document.querySelectorAll(
    'link[rel="icon"]:not([data-branding]), link[rel="shortcut icon"]:not([data-branding]), link[rel="apple-touch-icon"]:not([data-branding])'
  );
  links.forEach(link => link.parentNode?.removeChild(link));
}

export function SiteBrandingHead({ siteConfig, theme, apiUrl }) {
  const logoLight = resolveMediaUrl(siteConfig?.logoLight, apiUrl);
  const logoDark = resolveMediaUrl(siteConfig?.logoDark, apiUrl);
  const appleTouchIcon = resolveMediaUrl(
    siteConfig?.appleTouchIcon || siteConfig?.logoDark || siteConfig?.logoLight,
    apiUrl
  );

  useEffect(() => {
    const activeFavicon = theme === 'dark' ? logoLight || logoDark : logoDark || logoLight;

    if (activeFavicon) {
      removeDefaultIcons();
    }

    if (logoDark) {
      upsertLink({
        rel: 'icon',
        href: logoDark,
        media: '(prefers-color-scheme: light)',
        marker: 'logo-dark-on-light',
      });
    }

    if (logoLight) {
      upsertLink({
        rel: 'icon',
        href: logoLight,
        media: '(prefers-color-scheme: dark)',
        marker: 'logo-light-on-dark',
      });
    }

    if (activeFavicon) {
      upsertLink({
        rel: 'icon',
        href: activeFavicon,
        marker: 'active',
      });
    }

    if (appleTouchIcon) {
      upsertLink({
        rel: 'apple-touch-icon',
        href: appleTouchIcon,
        marker: 'apple',
      });
    }
  }, [logoLight, logoDark, appleTouchIcon, theme]);

  return null;
}
