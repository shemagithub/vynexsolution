import config from '~/config.json';

const PRODUCTION_API_URL = (
  config.apiUrl || 'https://backend.vynexsoultions.com'
).replace(/\/$/, '');

const LOCAL_API_URL = 'http://localhost:4000';

function isLocalHost(url = '') {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function readEnvApiUrl(env) {
  return (
    env?.API_URL?.replace(/\/$/, '') ||
    (typeof import.meta !== 'undefined'
      ? import.meta.env?.API_URL?.replace(/\/$/, '')
      : undefined) ||
    (typeof process !== 'undefined' ? process.env.API_URL?.replace(/\/$/, '') : undefined)
  );
}

function readMetaApiUrl() {
  if (typeof document === 'undefined') return undefined;
  const value = document.querySelector('meta[name="api-base"]')?.getAttribute('content');
  return value?.replace(/\/$/, '') || undefined;
}

function normalizeApiUrl(url) {
  if (!url) return url;
  const cleaned = url.replace(/\/$/, '');

  // HTTPS pages cannot fetch HTTP APIs (mixed content). Upgrade production API URLs.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!isLocalHost(cleaned) && cleaned.startsWith('http://')) {
      return cleaned.replace(/^http:\/\//, 'https://');
    }
  }

  return cleaned;
}

/**
 * Resolve the backend API base URL.
 * When config.apiUrl is a remote host, ignore stale localhost overrides from
 * old .dev.vars / meta tags so admin + public requests hit production.
 */
export function getApiUrl(env) {
  const remoteConfigured = !isLocalHost(PRODUCTION_API_URL);
  const candidates = [readEnvApiUrl(env), readMetaApiUrl(), PRODUCTION_API_URL]
    .filter(Boolean)
    .map(normalizeApiUrl);

  if (remoteConfigured) {
    const remote = candidates.find(url => !isLocalHost(url));
    if (remote) return remote;
    return PRODUCTION_API_URL;
  }

  return candidates[0] || PRODUCTION_API_URL;
}

export function isLocalApi(url = getApiUrl()) {
  return isLocalHost(url);
}

export { PRODUCTION_API_URL, LOCAL_API_URL };
