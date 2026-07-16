import config from '~/config.json';

const PRODUCTION_API_URL = (config.apiUrl || 'https://test.guzekustomz.com').replace(/\/$/, '');
const LOCAL_API_URL = 'http://localhost:4000';

function readEnvApiUrl(env) {
  return (
    env?.API_URL?.replace(/\/$/, '') ||
    (typeof import.meta !== 'undefined' ? import.meta.env?.API_URL?.replace(/\/$/, '') : undefined) ||
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
    const isLocal = cleaned.includes('localhost') || cleaned.includes('127.0.0.1');
    if (!isLocal && cleaned.startsWith('http://')) {
      return cleaned.replace(/^http:\/\//, 'https://');
    }
  }

  return cleaned;
}

export function getApiUrl(env) {
  const fromEnv = readEnvApiUrl(env);
  if (fromEnv) return normalizeApiUrl(fromEnv);

  const fromMeta = readMetaApiUrl();
  if (fromMeta) return normalizeApiUrl(fromMeta);

  return PRODUCTION_API_URL;
}

export function isLocalApi(url = getApiUrl()) {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

export { PRODUCTION_API_URL, LOCAL_API_URL };
