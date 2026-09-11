import { seedData } from './seed-data.js';
import { devMemoryStore } from './dev-memory-store.js';
import { toApiServiceCategory, toApiPricing } from '../db/pool.js';

export const devFallback = {
  projects() {
    return devMemoryStore.getProjects();
  },

  testimonials() {
    return devMemoryStore.getTestimonials();
  },

  pricing() {
    return devMemoryStore.getPricing();
  },

  contacts() {
    return devMemoryStore.getContacts();
  },

  quotes() {
    return devMemoryStore.getQuotes();
  },

  settings() {
    return devMemoryStore.getSettings();
  },

  articles() {
    return devMemoryStore.getArticles();
  },

  services() {
    return devMemoryStore.getServices();
  },

  about() {
    return devMemoryStore.getAbout();
  },

  aboutPublic() {
    return devMemoryStore.getAboutPublic();
  },

  dashboard() {
    return devMemoryStore.getDashboard();
  },

  content() {
    const about = devMemoryStore.getAbout();
    const services = devMemoryStore.getServices();
    return {
      projects: devMemoryStore.getProjects(),
      serviceCategories: services.categories.map(toApiServiceCategory),
      homeServices: services.homeServices.map(row => ({
        title: row.title,
        description: row.description,
        icon: row.icon,
      })),
      testimonials: devMemoryStore.getTestimonials().map(row => ({
        name: row.name,
        role: row.role,
        rating: row.rating,
        quote: row.quote,
      })),
      pricingPackages: devMemoryStore.getPricing().map(row => toApiPricing(row)),
      team: about.team.map(row => ({
        name: row.name,
        role: row.role,
        bio: row.bio,
      })),
      technologies: about.technologies.map(row => row.name),
      values: about.values.map(row => ({
        title: row.title,
        description: row.description,
      })),
      projectTypes: seedData.projectTypes,
      budgetRanges: seedData.budgetRanges,
      filterCategories: [
        { label: 'All', value: 'all' },
        { label: 'Web', value: 'web' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'IoT', value: 'iot' },
      ],
      siteConfig: devMemoryStore.getSettings(),
      homeAbout: about.page?.home || seedData.aboutPage.home,
      warning: 'Database unavailable — using in-memory dev store.',
    };
  },

  projectBySlug(slug) {
    return devMemoryStore.getProjectBySlug(slug);
  },

  quoteOptions() {
    return devMemoryStore.getQuoteOptionsPublic();
  },

  quoteOptionsAdmin() {
    return devMemoryStore.getQuoteOptionsAdmin();
  },
};
