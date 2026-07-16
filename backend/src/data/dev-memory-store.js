import { seedData } from './seed-data.js';
import { normalizeAboutPage } from '../utils/about-page.js';
import { toApiProject, toApiArticle, parseJsonRows } from '../db/pool.js';

function notFound() {
  const error = new Error('Not found');
  error.status = 404;
  throw error;
}

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function createInitialState() {
  return {
    page: structuredClone(seedData.aboutPage),
    team: seedData.teamMembers.map((member, index) => ({
      id: index + 1,
      name: member.name,
      role: member.role,
      bio: member.bio,
      sort_order: member.sort_order ?? index + 1,
    })),
    technologies: seedData.technologies.map((name, index) => ({
      id: index + 1,
      name,
      sort_order: index + 1,
    })),
    values: seedData.values.map((value, index) => ({
      id: index + 1,
      title: value.title,
      description: value.description,
      sort_order: value.sort_order ?? index + 1,
    })),
    projects: seedData.projects.map(project => ({
      slug: project.slug,
      category: project.category || 'web',
      title: project.title,
      problem: project.problem,
      description: project.description,
      technologies: project.technologies || [],
      live_link: project.live_link || '',
      preview_image: project.preview_image || null,
      roles: project.roles || [],
      featured: project.featured ? 1 : 0,
      sort_order: project.sort_order ?? 0,
      published: 1,
    })),
    testimonials: seedData.testimonials.map((item, index) => ({
      id: index + 1,
      name: item.name,
      role: item.role,
      rating: item.rating ?? 5,
      quote: item.quote,
      published: 1,
      sort_order: item.sort_order ?? index + 1,
    })),
    pricing: seedData.pricingPackages.map((item, index) => ({
      id: index + 1,
      name: item.name,
      price: item.price,
      description: item.description,
      features: item.features || [],
      published: 1,
      sort_order: item.sort_order ?? index + 1,
    })),
    serviceCategories: seedData.serviceCategories.map(cat => ({
      slug: cat.slug,
      title: cat.title,
      items: cat.items || [],
      sort_order: cat.sort_order ?? 0,
    })),
    homeServices: seedData.homeServices.map((item, index) => ({
      id: index + 1,
      title: item.title,
      description: item.description,
      icon: item.icon || '01',
      sort_order: item.sort_order ?? index + 1,
    })),
    articles: [],
    contacts: [],
    quotes: [],
    settings: structuredClone(seedData.siteSettings),
    nextTeamId: seedData.teamMembers.length + 1,
    nextTechId: seedData.technologies.length + 1,
    nextValueId: seedData.values.length + 1,
    nextTestimonialId: seedData.testimonials.length + 1,
    nextPricingId: seedData.pricingPackages.length + 1,
    nextHomeServiceId: seedData.homeServices.length + 1,
    nextArticleId: 1,
    nextContactId: 1,
    nextQuoteId: 1,
    projectTypes: seedData.projectTypes.map((name, index) => ({
      id: index + 1,
      name,
      sort_order: index + 1,
    })),
    budgetRanges: seedData.budgetRanges.map((name, index) => ({
      id: index + 1,
      name,
      sort_order: index + 1,
    })),
    nextProjectTypeId: seedData.projectTypes.length + 1,
    nextBudgetRangeId: seedData.budgetRanges.length + 1,
  };
}

let state = createInitialState();

export const devMemoryStore = {
  getAbout() {
    return {
      page: structuredClone(state.page),
      team: structuredClone(state.team),
      technologies: structuredClone(state.technologies),
      values: structuredClone(state.values),
    };
  },

  getAboutPublic() {
    const data = devMemoryStore.getAbout();
    return {
      page: data.page,
      team: data.team.map(row => ({ name: row.name, role: row.role, bio: row.bio })),
      technologies: data.technologies.map(row => row.name),
      values: data.values.map(row => ({ title: row.title, description: row.description })),
    };
  },

  updatePage(patch) {
    state.page = normalizeAboutPage({
      ...state.page,
      ...patch,
      home: {
        ...(state.page.home || {}),
        ...(patch.home || {}),
      },
    });
    return structuredClone(state.page);
  },

  addTeam({ name, role, bio, sortOrder }) {
    const row = { id: state.nextTeamId++, name, role, bio, sort_order: sortOrder || 0 };
    state.team.push(row);
    return row;
  },

  updateTeam(id, { name, role, bio, sortOrder }) {
    const row = state.team.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.role = role;
    row.bio = bio;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteTeam(id) {
    state.team = state.team.filter(item => item.id !== Number(id));
  },

  addValue({ title, description, sortOrder }) {
    const row = { id: state.nextValueId++, title, description, sort_order: sortOrder || 0 };
    state.values.push(row);
    return row;
  },

  updateValue(id, { title, description, sortOrder }) {
    const row = state.values.find(item => item.id === Number(id));
    if (!row) return null;
    row.title = title;
    row.description = description;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteValue(id) {
    state.values = state.values.filter(item => item.id !== Number(id));
  },

  addTechnology({ name, sortOrder }) {
    const row = { id: state.nextTechId++, name, sort_order: sortOrder || 0 };
    state.technologies.push(row);
    return row;
  },

  updateTechnology(id, { name, sortOrder }) {
    const row = state.technologies.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteTechnology(id) {
    state.technologies = state.technologies.filter(item => item.id !== Number(id));
  },

  getProjects() {
    return [...state.projects]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.slug.localeCompare(b.slug))
      .map(toApiProject);
  },

  getProjectBySlug(slug) {
    const row = state.projects.find(item => item.slug === slug);
    return row ? toApiProject(row) : null;
  },

  addProject(data) {
    if (state.projects.some(item => item.slug === data.slug)) {
      const error = new Error('Project slug already exists');
      error.status = 409;
      throw error;
    }
    state.projects.push({
      slug: data.slug,
      category: data.category || 'web',
      title: data.title,
      problem: data.problem,
      description: data.description,
      technologies: data.technologies || [],
      live_link: data.liveLink || '',
      preview_image: data.previewImage || null,
      roles: data.roles || [],
      featured: data.featured ? 1 : 0,
      sort_order: data.sortOrder || 0,
      published: data.published !== false ? 1 : 0,
    });
  },

  updateProject(slug, data) {
    const row = state.projects.find(item => item.slug === slug);
    if (!row) notFound();
    row.category = data.category;
    row.title = data.title;
    row.problem = data.problem;
    row.description = data.description;
    row.technologies = data.technologies || [];
    row.live_link = data.liveLink || '';
    row.preview_image = data.previewImage || null;
    row.roles = data.roles || [];
    row.featured = data.featured ? 1 : 0;
    row.sort_order = data.sortOrder || 0;
    row.published = data.published !== false ? 1 : 0;
  },

  deleteProject(slug) {
    const before = state.projects.length;
    state.projects = state.projects.filter(item => item.slug !== slug);
    if (state.projects.length === before) notFound();
  },

  getTestimonials() {
    return structuredClone(
      [...state.testimonials].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    );
  },

  addTestimonial({ name, role, rating, quote, published, sortOrder }) {
    const row = {
      id: state.nextTestimonialId++,
      name,
      role,
      rating: rating || 5,
      quote,
      published: published !== false ? 1 : 0,
      sort_order: sortOrder || 0,
    };
    state.testimonials.push(row);
    return row;
  },

  updateTestimonial(id, { name, role, rating, quote, published, sortOrder }) {
    const row = state.testimonials.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.role = role;
    row.rating = rating;
    row.quote = quote;
    row.published = published ? 1 : 0;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteTestimonial(id) {
    state.testimonials = state.testimonials.filter(item => item.id !== Number(id));
  },

  getPricing() {
    return structuredClone(
      parseJsonRows(
        [...state.pricing].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        ['features']
      )
    );
  },

  addPricing({ name, price, description, features, published, sortOrder }) {
    const row = {
      id: state.nextPricingId++,
      name,
      price,
      description,
      features: features || [],
      published: published !== false ? 1 : 0,
      sort_order: sortOrder || 0,
    };
    state.pricing.push(row);
    return row;
  },

  updatePricing(id, { name, price, description, features, published, sortOrder }) {
    const row = state.pricing.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.price = price;
    row.description = description;
    row.features = features || [];
    row.published = published ? 1 : 0;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deletePricing(id) {
    state.pricing = state.pricing.filter(item => item.id !== Number(id));
  },

  getServices() {
    return {
      categories: structuredClone(
        parseJsonRows(
          [...state.serviceCategories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
          ['items']
        )
      ),
      homeServices: structuredClone(
        [...state.homeServices].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      ),
    };
  },

  updateServiceCategory(slug, { title, items, sortOrder }) {
    const row = state.serviceCategories.find(item => item.slug === slug);
    if (!row) return null;
    row.title = title;
    row.items = items || [];
    row.sort_order = sortOrder || 0;
    return row;
  },

  addHomeService({ title, description, icon, sortOrder }) {
    const row = {
      id: state.nextHomeServiceId++,
      title,
      description,
      icon: icon || '01',
      sort_order: sortOrder || 0,
    };
    state.homeServices.push(row);
    return row;
  },

  updateHomeService(id, { title, description, icon, sortOrder }) {
    const row = state.homeServices.find(item => item.id === Number(id));
    if (!row) return null;
    row.title = title;
    row.description = description;
    row.icon = icon;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteHomeService(id) {
    state.homeServices = state.homeServices.filter(item => item.id !== Number(id));
  },

  getArticles() {
    return structuredClone(
      [...state.articles]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(toApiArticle)
    );
  },

  getArticleBySlug(slug) {
    const row = state.articles.find(item => item.slug === slug);
    return row ? toApiArticle(row) : null;
  },

  addArticle({ slug, title, abstract, content, published }) {
    const timestamp = now();
    const row = {
      id: state.nextArticleId++,
      slug,
      title,
      abstract,
      content,
      published: published ? 1 : 0,
      created_at: timestamp,
      updated_at: timestamp,
    };
    state.articles.push(row);
    return row;
  },

  updateArticle(slug, { title, abstract, content, published }) {
    const row = state.articles.find(item => item.slug === slug);
    if (!row) return null;
    row.title = title;
    row.abstract = abstract;
    row.content = content;
    row.published = published ? 1 : 0;
    row.updated_at = now();
    return row;
  },

  deleteArticle(slug) {
    state.articles = state.articles.filter(item => item.slug !== slug);
  },

  getContacts() {
    return structuredClone(
      [...state.contacts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    );
  },

  addContact({ email, message }) {
    const row = {
      id: state.nextContactId++,
      email,
      message,
      status: 'new',
      created_at: now(),
    };
    state.contacts.push(row);
    return row;
  },

  updateContactStatus(id, status) {
    const row = state.contacts.find(item => item.id === Number(id));
    if (!row) return null;
    row.status = status;
    return row;
  },

  getQuotes() {
    return structuredClone(
      [...state.quotes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    );
  },

  addQuote({ email, projectType, budget, deadline, message }) {
    const row = {
      id: state.nextQuoteId++,
      email,
      project_type: projectType,
      budget: budget || null,
      deadline: deadline || null,
      message,
      status: 'new',
      created_at: now(),
    };
    state.quotes.push(row);
    return row;
  },

  updateQuoteStatus(id, status) {
    const row = state.quotes.find(item => item.id === Number(id));
    if (!row) return null;
    row.status = status;
    return row;
  },

  getSettings() {
    return structuredClone(state.settings);
  },

  updateSettings(patch) {
    state.settings = { ...state.settings, ...patch };
    return structuredClone(state.settings);
  },

  getQuoteOptionsAdmin() {
    return {
      projectTypes: structuredClone(
        [...state.projectTypes].sort((a, b) => a.sort_order - b.sort_order)
      ),
      budgetRanges: structuredClone(
        [...state.budgetRanges].sort((a, b) => a.sort_order - b.sort_order)
      ),
    };
  },

  getQuoteOptionsPublic() {
    const data = devMemoryStore.getQuoteOptionsAdmin();
    return {
      projectTypes: data.projectTypes.map(row => row.name),
      budgetRanges: data.budgetRanges.map(row => row.name),
    };
  },

  addProjectType({ name, sortOrder }) {
    const row = {
      id: state.nextProjectTypeId++,
      name,
      sort_order: sortOrder || 0,
    };
    state.projectTypes.push(row);
    return row;
  },

  updateProjectType(id, { name, sortOrder }) {
    const row = state.projectTypes.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteProjectType(id) {
    state.projectTypes = state.projectTypes.filter(item => item.id !== Number(id));
  },

  addBudgetRange({ name, sortOrder }) {
    const row = {
      id: state.nextBudgetRangeId++,
      name,
      sort_order: sortOrder || 0,
    };
    state.budgetRanges.push(row);
    return row;
  },

  updateBudgetRange(id, { name, sortOrder }) {
    const row = state.budgetRanges.find(item => item.id === Number(id));
    if (!row) return null;
    row.name = name;
    row.sort_order = sortOrder || 0;
    return row;
  },

  deleteBudgetRange(id) {
    state.budgetRanges = state.budgetRanges.filter(item => item.id !== Number(id));
  },

  getDashboard() {
    return {
      stats: {
        projects: state.projects.length,
        testimonials: state.testimonials.length,
        newContacts: state.contacts.filter(item => item.status === 'new').length,
        newQuotes: state.quotes.filter(item => item.status === 'new').length,
        articles: state.articles.length,
      },
      warning: 'Database unavailable — using in-memory dev store.',
    };
  },
};
