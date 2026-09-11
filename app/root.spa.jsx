import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useRouteError,
} from '@remix-run/react';
import { ThemeProvider, themeStyles } from '~/components/theme-provider';
import GothamBook from '~/assets/fonts/gotham-book.woff2';
import GothamMedium from '~/assets/fonts/gotham-medium.woff2';
import BlackOpsOne from '~/assets/fonts/black-ops-one.woff2';
import { useEffect, useState } from 'react';
import { Error } from '~/layouts/error';
import { VisuallyHidden } from '~/components/visually-hidden';
import { Navbar } from '~/layouts/navbar';
import { Progress } from '~/components/progress';
import { LanguageProvider } from '~/components/language-provider/language-provider';
import { WhatsAppButton } from '~/components/whatsapp-button/whatsapp-button';
import { SiteConfigProvider } from '~/components/site-config-provider';
import { SiteBrandingHead } from '~/components/site-branding-head';
import config from '~/config.json';
import { getSiteConfig } from '~/utils/api';
import { getApiUrl, PRODUCTION_API_URL } from '~/utils/api-url';
import { mergeSiteConfig } from '~/utils/site-config';
import styles from './root.module.css';
import './reset.module.css';
import './global.module.css';

export async function clientLoader() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '' : '';
  const canonicalUrl = `${config.url}${pathname}`;
  const savedTheme =
    typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  const isAdmin = pathname.startsWith('/admin');
  const siteConfig = isAdmin ? mergeSiteConfig(config) : await getSiteConfig();

  return {
    canonicalUrl,
    theme,
    isAdmin,
    siteConfig,
    apiUrl: getApiUrl() || PRODUCTION_API_URL,
  };
}

export const links = () => [
  {
    rel: 'preload',
    href: GothamMedium,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: '',
  },
  {
    rel: 'preload',
    href: GothamBook,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: '',
  },
  {
    rel: 'preload',
    href: BlackOpsOne,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: '',
  },
  { rel: 'manifest', href: '/manifest.json' },
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'shortcut_icon', href: '/shortcut.png', type: 'image/png', sizes: '64x64' },
  { rel: 'apple-touch-icon', href: '/icon-256.png', sizes: '256x256' },
  { rel: 'author', href: '/humans.txt', type: 'text/plain' },
];

export function HydrateFallback() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111" />
        <meta name="color-scheme" content="dark light" />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body data-theme="dark">
        <Progress />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { theme: loaderTheme, canonicalUrl, isAdmin, siteConfig, apiUrl } = useLoaderData();
  const { state } = useNavigation();
  const [clientTheme, setClientTheme] = useState(null);

  const activeTheme = clientTheme || loaderTheme;
  const themeColor = activeTheme === 'dark' ? '#111' : '#F2F2F2';
  const colorScheme = activeTheme === 'light' ? 'light dark' : 'dark light';

  useEffect(() => {
    setClientTheme(null);
  }, [loaderTheme]);

  useEffect(() => {
    if (!clientTheme) return;
    const nextColor = clientTheme === 'dark' ? '#111' : '#F2F2F2';
    const nextScheme = clientTheme === 'light' ? 'light dark' : 'dark light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextColor);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', nextScheme);
  }, [clientTheme]);

  function toggleTheme(newTheme) {
    const nextTheme = newTheme || (activeTheme === 'dark' ? 'light' : 'dark');
    setClientTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setClientTheme(saved);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="api-base" content={apiUrl || PRODUCTION_API_URL} />
        <Meta />
        <Links />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="theme-color" content={themeColor} suppressHydrationWarning />
        <meta name="color-scheme" content={colorScheme} suppressHydrationWarning />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <SiteBrandingHead siteConfig={siteConfig} theme={activeTheme} apiUrl={apiUrl} />
      </head>
      <body data-theme={activeTheme} suppressHydrationWarning>
        <ThemeProvider theme={activeTheme} toggleTheme={toggleTheme}>
          <SiteConfigProvider value={siteConfig}>
            <LanguageProvider>
              <Progress />
              <VisuallyHidden showOnFocus as="a" className={styles.skip} href="#main-content">
                Skip to main content
              </VisuallyHidden>
              {!isAdmin && <Navbar siteConfig={siteConfig} />}
              <main
                id="main-content"
                className={styles.container}
                tabIndex={-1}
                data-loading={state === 'loading'}
                data-admin={isAdmin || undefined}
              >
                <Outlet />
              </main>
              {!isAdmin && <WhatsAppButton />}
            </LanguageProvider>
          </SiteConfigProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <meta name="theme-color" content="#111" />
        <meta name="color-scheme" content="dark light" />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body data-theme="dark">
        <Error error={error} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
