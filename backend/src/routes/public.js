import { Router } from 'express';
import { pool, toApiProject, toApiServiceCategory, toApiPricing, toApiArticle } from '../db/pool.js';
import { asyncHandler } from '../utils/async-handler.js';
import { withDb, withDbWrite } from '../utils/with-db.js';
import { devFallback } from '../data/dev-fallback.js';
import { devMemoryStore } from '../data/dev-memory-store.js';
import { seedData } from '../data/seed-data.js';
import { normalizeAboutPage, loadAboutPageConfig } from '../utils/about-page.js';
import {
  sendContactAdminNotificationEmail,
  sendQuoteAdminNotificationEmail,
  sendQuoteConfirmationEmail,
} from '../services/mail.js';

const router = Router();

router.get('/projects', asyncHandler(async (req, res) => {
  const publishedOnly = req.query.published !== 'false';
  const rows = await withDb(async () => {
    const sql = publishedOnly
      ? 'SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM projects ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql);
    return rows.map(toApiProject);
  }, devFallback.projects);
  res.json(rows);
}));

router.get('/projects/:slug', asyncHandler(async (req, res) => {
  const project = await withDb(async () => {
    const [rows] = await pool.query('SELECT * FROM projects WHERE slug = ? LIMIT 1', [req.params.slug]);
    if (!rows.length) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    return toApiProject(rows[0]);
  }, () => devFallback.projectBySlug(req.params.slug));

  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
}));

router.get('/services', asyncHandler(async (_req, res) => {
  const data = await withDb(async () => {
    const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY sort_order ASC');
    const [homeServices] = await pool.query('SELECT * FROM home_services ORDER BY sort_order ASC');
    return {
      serviceCategories: categories.map(toApiServiceCategory),
      homeServices: homeServices.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon,
        sortOrder: row.sort_order,
      })),
    };
  }, () => {
    const fallback = devFallback.content();
    return {
      serviceCategories: fallback.serviceCategories,
      homeServices: fallback.homeServices,
    };
  });
  res.json(data);
}));

router.get('/testimonials', asyncHandler(async (_req, res) => {
  const rows = await withDb(async () => {
    const [rows] = await pool.query(
      'SELECT * FROM testimonials WHERE published = 1 ORDER BY sort_order ASC'
    );
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      rating: row.rating,
      quote: row.quote,
    }));
  }, () =>
    devFallback.content().testimonials.map((row, index) => ({
      id: index + 1,
      ...row,
    }))
  );
  res.json(rows);
}));

router.get('/pricing', asyncHandler(async (_req, res) => {
  const rows = await withDb(async () => {
    const [rows] = await pool.query(
      'SELECT * FROM pricing_packages WHERE published = 1 ORDER BY sort_order ASC'
    );
    return rows.map(toApiPricing);
  }, () => devFallback.content().pricingPackages);
  res.json(rows);
}));

router.get('/about', asyncHandler(async (_req, res) => {
  const data = await withDb(async () => {
    const [team] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC');
    const [technologies] = await pool.query('SELECT name FROM technologies ORDER BY sort_order ASC');
    const [values] = await pool.query('SELECT * FROM company_values ORDER BY sort_order ASC');
    const page = await loadAboutPageConfig(pool);
    return {
      page,
      team: team.map(row => ({ name: row.name, role: row.role, bio: row.bio })),
      technologies: technologies.map(row => row.name),
      values: values.map(row => ({ title: row.title, description: row.description })),
    };
  }, devFallback.aboutPublic);
  res.json(data);
}));

router.get('/quote-options', asyncHandler(async (_req, res) => {
  const data = await withDb(async () => {
    const [projectTypes] = await pool.query('SELECT name FROM project_types ORDER BY sort_order ASC');
    const [budgetRanges] = await pool.query('SELECT name FROM budget_ranges ORDER BY sort_order ASC');
    return {
      projectTypes: projectTypes.map(row => row.name),
      budgetRanges: budgetRanges.map(row => row.name),
    };
  }, devFallback.quoteOptions);
  res.json(data);
}));

router.get('/articles', asyncHandler(async (_req, res) => {
  const rows = await withDb(async () => {
    const [rows] = await pool.query(
      'SELECT id, slug, title, abstract, content, published, created_at, updated_at FROM articles WHERE published = 1 ORDER BY created_at DESC'
    );
    return rows.map(row => ({
      slug: row.slug,
      title: row.title,
      abstract: row.abstract,
      content: row.content,
      published: Boolean(row.published),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }, () =>
    (devFallback.articles() || [])
      .filter(article => article.published)
      .map(article => ({
        slug: article.slug,
        title: article.title,
        abstract: article.abstract,
        content: article.content,
        published: Boolean(article.published),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }))
  );
  res.json(rows);
}));

router.get('/articles/:slug', asyncHandler(async (req, res) => {
  const article = await withDb(async () => {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE slug = ? AND published = 1 LIMIT 1',
      [req.params.slug]
    );
    if (!rows.length) {
      const error = new Error('Article not found');
      error.status = 404;
      throw error;
    }
    return toApiArticle(rows[0]);
  }, () => {
    const row = devMemoryStore.getArticleBySlug(req.params.slug);
    return row?.published ? row : null;
  });

  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
}));

router.get('/config', asyncHandler(async (_req, res) => {
  const configData = await withDb(async () => {
    const [rows] = await pool.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'site_config' LIMIT 1"
    );
    if (!rows.length) return {};
    const value = rows[0].setting_value;
    return typeof value === 'string' ? JSON.parse(value) : value;
  }, devFallback.settings);
  res.json(configData);
}));

router.get('/content', asyncHandler(async (_req, res) => {
  const content = await withDb(async () => {
    const [
      [projects],
      [categories],
      [homeServices],
      [testimonials],
      [pricing],
      [team],
      [technologies],
      [values],
      [projectTypes],
      [budgetRanges],
      [settings],
    ] = await Promise.all([
      pool.query('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM service_categories ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM home_services ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM testimonials WHERE published = 1 ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM pricing_packages WHERE published = 1 ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM team_members ORDER BY sort_order ASC'),
      pool.query('SELECT name FROM technologies ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM company_values ORDER BY sort_order ASC'),
      pool.query('SELECT name FROM project_types ORDER BY sort_order ASC'),
      pool.query('SELECT name FROM budget_ranges ORDER BY sort_order ASC'),
      pool.query("SELECT setting_value FROM site_settings WHERE setting_key = 'site_config' LIMIT 1"),
    ]);

    const siteConfig = settings[0]
      ? typeof settings[0].setting_value === 'string'
        ? JSON.parse(settings[0].setting_value)
        : settings[0].setting_value
      : {};

    const aboutPage = await loadAboutPageConfig(pool);

    return {
      projects: projects.map(toApiProject),
      serviceCategories: categories.map(toApiServiceCategory),
      homeServices: homeServices.map(row => ({
        title: row.title,
        description: row.description,
        icon: row.icon,
      })),
      testimonials: testimonials.map(row => ({
        name: row.name,
        role: row.role,
        rating: row.rating,
        quote: row.quote,
      })),
      pricingPackages: pricing.map(toApiPricing),
      team: team.map(row => ({ name: row.name, role: row.role, bio: row.bio })),
      technologies: technologies.map(row => row.name),
      values: values.map(row => ({ title: row.title, description: row.description })),
      projectTypes: projectTypes.map(row => row.name),
      budgetRanges: budgetRanges.map(row => row.name),
      filterCategories: [
        { label: 'All', value: 'all' },
        { label: 'Web', value: 'web' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'IoT', value: 'iot' },
      ],
      siteConfig,
      homeAbout: aboutPage.home || seedData.aboutPage.home,
    };
  }, devFallback.content);
  res.json(content);
}));

router.post('/contact', asyncHandler(async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }
  await withDbWrite(
    async () => {
      await pool.query('INSERT INTO contact_messages (email, message) VALUES (?, ?)', [email, message]);
    },
    () => {
      devMemoryStore.addContact({ email, message });
    }
  );

  try {
    await sendContactAdminNotificationEmail({ email, message });
  } catch (err) {
    console.error('Failed to send contact notification email:', err.message);
  }

  res.status(201).json({ success: true });
}));

router.post('/quote', asyncHandler(async (req, res) => {
  const { email, projectType, budget, deadline, message } = req.body;
  if (!email || !projectType || !message) {
    return res.status(400).json({ error: 'Email, project type, and message are required' });
  }
  await withDbWrite(
    async () => {
      await pool.query(
        'INSERT INTO quote_requests (email, project_type, budget, deadline, message) VALUES (?, ?, ?, ?, ?)',
        [email, projectType, budget || null, deadline || null, message]
      );
    },
    () => {
      devMemoryStore.addQuote({ email, projectType, budget, deadline, message });
    }
  );

  try {
    await sendQuoteAdminNotificationEmail({ email, projectType, budget, deadline, message });
  } catch (err) {
    console.error('Failed to send quote admin notification:', err.message);
  }

  try {
    await sendQuoteConfirmationEmail({ email, projectType, budget, deadline, message });
  } catch (err) {
    console.error('Failed to send quote confirmation email:', err.message);
  }

  res.status(201).json({ success: true });
}));

export default router;
