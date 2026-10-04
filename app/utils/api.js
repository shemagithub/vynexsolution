import * as staticContent from '~/data/content';
import config from '~/config.json';
import { mergeSiteConfig } from '~/utils/site-config';
import { getApiUrl } from '~/utils/api-url';
import { resolveSiteConfigLogos } from '~/utils/media-url';
import { formatTimecode, readingTime } from '~/utils/timecode';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const FETCH_TIMEOUT_MS = 1800;

export async function apiRequest(path, env, init = {}) {
  const apiUrl = getApiUrl(env);
  const url = `${apiUrl}/api${path}`;
  const controller = new AbortController();
  const timeoutMs = Number.isFinite(init.timeoutMs) ? init.timeoutMs : FETCH_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { timeoutMs: _timeoutMs, signal, ...rest } = init;
    const response = await fetch(url, {
      ...rest,
      signal: signal || controller.signal,
      headers: {
        Accept: 'application/json',
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...rest.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(response.status, data.error || `Request failed (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function getStaticContent() {
  return {
    projects: staticContent.projects,
    serviceCategories: staticContent.serviceCategories,
    homeServices: staticContent.homeServices,
    testimonials: staticContent.testimonials,
    pricingPackages: staticContent.pricingPackages,
    team: staticContent.team,
    technologies: staticContent.technologies,
    values: staticContent.values,
    projectTypes: staticContent.projectTypes,
    budgetRanges: staticContent.budgetRanges,
    filterCategories: staticContent.filterCategories,
    siteConfig: resolveSiteConfigLogos(mergeSiteConfig(config)),
    homeAbout: staticContent.aboutPage.home,
    _source: 'static',
  };
}

function staticAboutPayload() {
  return {
    page: staticContent.aboutPage,
    team: staticContent.team,
    technologies: staticContent.technologies,
    values: staticContent.values,
    _source: 'static',
  };
}

export async function getAbout(env) {
  try {
    const data = await apiRequest('/about', env);
    return { ...data, _source: 'api' };
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] getAbout fallback:', error.message);
    }
    return staticAboutPayload();
  }
}

export async function getContent(env) {
  try {
    const data = await apiRequest('/content', env);
    return {
      ...data,
      siteConfig: resolveSiteConfigLogos(mergeSiteConfig(data.siteConfig), getApiUrl(env)),
      _source: 'api',
    };
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] getContent fallback:', error.message);
    }
    return getStaticContent();
  }
}

function toBlogPost(article) {
  const content = article.content || '';
  const date = article.createdAt || article.created_at || article.date || new Date().toISOString();
  const readTime = readingTime(content || article.abstract || article.title || '');

  return {
    slug: article.slug,
    timecode: formatTimecode(readTime),
    content,
    frontmatter: {
      title: article.title,
      abstract: article.abstract,
      date,
      featured: Boolean(article.featured),
      banner: article.banner || '',
    },
  };
}

export async function getArticles(env) {
  try {
    const data = await apiRequest('/articles', env);
    const articles = Array.isArray(data) ? data : [];
    if (articles.length) {
      return {
        articles: articles.map(toBlogPost),
        _source: 'api',
      };
    }
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] getArticles fallback:', error.message);
    }
  }

  return {
    articles: (staticContent.articles || []).map(toBlogPost),
    _source: 'static',
  };
}

export async function getServices(env) {
  try {
    const data = await apiRequest('/services', env);
    return {
      serviceCategories: Array.isArray(data.serviceCategories) ? data.serviceCategories : [],
      homeServices: Array.isArray(data.homeServices) ? data.homeServices : [],
      _source: 'api',
    };
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] getServices fallback:', error.message);
    }
    return {
      serviceCategories: staticContent.serviceCategories || [],
      homeServices: staticContent.homeServices || [],
      _source: 'static',
    };
  }
}

export async function getArticleBySlug(slug, env) {
  try {
    const data = await apiRequest(`/articles/${slug}`, env);
    return { ...toBlogPost(data), _source: 'api' };
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] getArticleBySlug fallback:', error.message);
    }
    const article = (staticContent.articles || []).find(item => item.slug === slug);
    return article ? { ...toBlogPost(article), _source: 'static' } : null;
  }
}

export async function getSiteConfig(env) {
  return fetchSiteConfig(env);
}

let siteConfigCache = null;
let siteConfigCacheKey = '';
let siteConfigInflight = null;
const SITE_CONFIG_TTL_MS = 30_000;

async function fetchSiteConfig(env) {
  const cacheKey = getApiUrl(env);
  const now = Date.now();

  if (
    siteConfigCache &&
    siteConfigCacheKey === cacheKey &&
    now - siteConfigCache.fetchedAt < SITE_CONFIG_TTL_MS
  ) {
    return siteConfigCache.value;
  }

  if (siteConfigInflight && siteConfigCacheKey === cacheKey) {
    return siteConfigInflight;
  }

  siteConfigCacheKey = cacheKey;
  siteConfigInflight = (async () => {
    try {
      const data = await apiRequest('/config', env);
      const value = resolveSiteConfigLogos(
        { ...mergeSiteConfig(data), _source: 'api' },
        cacheKey
      );
      siteConfigCache = { value, fetchedAt: Date.now() };
      return value;
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.warn('[api] getSiteConfig fallback:', error.message);
      }
      const value = resolveSiteConfigLogos(
        { ...mergeSiteConfig(config), _source: 'static' },
        cacheKey
      );
      siteConfigCache = { value, fetchedAt: Date.now() };
      return value;
    } finally {
      siteConfigInflight = null;
    }
  })();

  return siteConfigInflight;
}

export function clearSiteConfigCache() {
  siteConfigCache = null;
  siteConfigInflight = null;
}

export async function getProjectBySlug(slug, env) {
  try {
    const data = await apiRequest(`/projects/${slug}`, env);
    return { ...data, _source: 'api' };
  } catch (error) {
    const fallback = staticContent.getProjectBySlug(slug);
    if (fallback) return { ...fallback, _source: 'static' };
    return null;
  }
}

export async function postToApi(path, body, env) {
  return apiRequest(path, env, {
    method: 'POST',
    body: JSON.stringify(body),
    timeoutMs: 12000,
  });
}

export async function fetchApi(path, env) {
  return apiRequest(path, env);
}

export { getApiUrl };
