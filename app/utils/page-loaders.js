import { aboutPage } from '~/data/content';
import {
  getAbout,
  getArticleBySlug,
  getArticles,
  getContent,
  getServices,
  getSiteConfig,
} from '~/utils/api';
import { getApiUrl } from '~/utils/api-url';
import { resolveAboutHomeImages, resolveProjectMedia } from '~/utils/media-url';

export async function loadHomePageData(env) {
  const apiUrl = getApiUrl(env);
  const [content, about] = await Promise.all([getContent(env), getAbout(env)]);

  const rawHomeAbout = content.homeAbout || about.page?.home || aboutPage.home;
  const publishedProjects = (content.projects || []).filter(
    project => project.published !== false
  );
  const featured = publishedProjects.filter(project => project.featured);
  const rest = publishedProjects.filter(project => !project.featured);
  const homeProjects = [...featured, ...rest]
    .slice(0, 3)
    .map(project => resolveProjectMedia(project, apiUrl));

  return {
    homeServices: content.homeServices,
    testimonials: content.testimonials,
    featuredProjects: homeProjects,
    homeAbout: resolveAboutHomeImages(rawHomeAbout, apiUrl),
    _source: content._source === 'api' ? 'api' : 'static',
  };
}

export async function loadAboutPageData(env) {
  const [about, siteConfig] = await Promise.all([getAbout(env), getSiteConfig(env)]);

  return {
    page: about.page,
    team: about.team,
    technologies: about.technologies,
    values: about.values,
    siteConfig,
    _source: about._source === 'api' ? 'api' : 'static',
  };
}

export async function loadPortfolioPageData(env) {
  const apiUrl = getApiUrl(env);
  const content = await getContent(env);

  return {
    projects: content.projects.map(project => resolveProjectMedia(project, apiUrl)),
    filterCategories: content.filterCategories,
    _source: content._source,
  };
}

export async function loadServicesPageData(env) {
  const data = await getServices(env);
  const serviceCategories = (data.serviceCategories || [])
    .map(category => ({
      ...category,
      id: category.id || category.slug,
      items: Array.isArray(category.items) ? category.items : [],
    }))
    .filter(category => category.title && category.items.length > 0);

  const homeServices = (data.homeServices || [])
    .map((service, index) => ({
      id: service.id || index + 1,
      title: service.title,
      description: service.description || '',
      icon: service.icon || String(index + 1).padStart(2, '0'),
      sortOrder: service.sortOrder ?? index,
    }))
    .filter(service => service.title)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    serviceCategories,
    homeServices,
    _source: data._source,
  };
}

export async function loadPricingPageData(env) {
  const content = await getContent(env);

  return {
    pricingPackages: content.pricingPackages,
    _source: content._source,
  };
}

export async function loadQuotePageData(env) {
  const content = await getContent(env);

  return {
    projectTypes: content.projectTypes,
    budgetRanges: content.budgetRanges,
    _source: content._source,
  };
}

export async function loadBlogPageData(env) {
  const { articles, _source } = await getArticles(env);
  const withFeatured = articles.map((post, index) => ({
    ...post,
    frontmatter: {
      ...post.frontmatter,
      featured: index === 0 || post.frontmatter.featured,
    },
  }));
  const featured = withFeatured.find(post => post.frontmatter.featured) || null;
  const posts = withFeatured.filter(post => post.slug !== featured?.slug);

  return {
    posts,
    featured,
    _source,
  };
}

export async function loadArticlePageData(slug, env) {
  const article = await getArticleBySlug(slug, env);
  if (!article) return null;
  return article;
}

export async function refreshFromApi(serverLoader, reload) {
  const serverData = await serverLoader();
  if (serverData._source === 'api') {
    return serverData;
  }

  try {
    const fresh = await reload();
    if (fresh._source === 'api') {
      return fresh;
    }
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.warn('[api] client refresh failed:', error.message);
    }
  }

  return serverData;
}
