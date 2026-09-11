import { Router } from 'express';
import { pool, toApiProject, toApiArticle, parseJsonRows } from '../db/pool.js';
import { requireAuth, comparePassword, signToken, hashPassword, isConfiguredAdminCredentials } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { withDb, withDbWrite } from '../utils/with-db.js';
import { devFallback } from '../data/dev-fallback.js';
import { devMemoryStore } from '../data/dev-memory-store.js';
import { saveUploadedImage } from '../utils/uploads.js';
import { normalizeAboutPage, loadAboutPageConfig, saveAboutPageConfig, mergeAboutHomeImage } from '../utils/about-page.js';
import mailRoutes from './mail.js';

async function getAboutPageConfig() {
  try {
    return await loadAboutPageConfig(pool);
  } catch {
    return devMemoryStore.getAbout().page;
  }
}

const DEFAULT_LOGOS = {
  light: '/logo-light.svg',
  dark: '/logo-dark.svg',
};

async function getSiteSettings() {
  return withDb(async () => {
    const [rows] = await pool.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'site_config' LIMIT 1"
    );
    if (!rows.length) return {};
    const value = rows[0].setting_value;
    return typeof value === 'string' ? JSON.parse(value) : value;
  }, devFallback.settings);
}

async function saveSiteSettings(settings) {
  await withDbWrite(
    async () => {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('site_config', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [JSON.stringify(settings)]
      );
    },
    () => {
      devMemoryStore.updateSettings(settings);
    }
  );
}

const router = Router();

router.use('/mail', mailRoutes);

async function ensureAdminUser(email, password) {
  try {
    const hash = await hashPassword(password);
    const [rows] = await pool.query('SELECT id, email, name FROM admin_users WHERE email = ? LIMIT 1', [
      email,
    ]);

    if (rows.length) {
      await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, rows[0].id]);
      return rows[0];
    }

    const [result] = await pool.query(
      'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, 'Admin']
    );

    return { id: result.insertId, email, name: 'Admin' };
  } catch {
    return { id: 0, email, name: 'Admin' };
  }
}

function sendAuthResponse(res, user) {
  const token = signToken(user);
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ? LIMIT 1', [email]);

      if (rows.length) {
        const user = rows[0];
        const valid = await comparePassword(password, user.password_hash);
        if (valid) {
          return sendAuthResponse(res, user);
        }
      }

      if (isConfiguredAdminCredentials(email, password)) {
        const user = await ensureAdminUser(email, password);
        return sendAuthResponse(res, user);
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (dbError) {
      if (isConfiguredAdminCredentials(email, password)) {
        return sendAuthResponse(res, { id: 0, email, name: 'Admin' });
      }

      console.error('Admin login DB error:', dbError.message || dbError);
      return res.status(503).json({ error: 'Database unavailable. Try again later.' });
    }
  })
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get(
  '/dashboard',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await withDb(async () => {
      const [[projects], [testimonials], [contacts], [quotes], [articles]] = await Promise.all([
        pool.query('SELECT COUNT(*) AS count FROM projects'),
        pool.query('SELECT COUNT(*) AS count FROM testimonials'),
        pool.query("SELECT COUNT(*) AS count FROM contact_messages WHERE status = 'new'"),
        pool.query("SELECT COUNT(*) AS count FROM quote_requests WHERE status = 'new'"),
        pool.query('SELECT COUNT(*) AS count FROM articles'),
      ]);

      return {
        stats: {
          projects: projects[0].count,
          testimonials: testimonials[0].count,
          newContacts: contacts[0].count,
          newQuotes: quotes[0].count,
          articles: articles[0].count,
        },
      };
    }, devFallback.dashboard);
    res.json(data);
  })
);

router.get(
  '/projects',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC');
      return rows.map(toApiProject);
    }, devFallback.projects);
    res.json(rows);
  })
);

router.post(
  '/projects',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      slug,
      category,
      title,
      problem,
      description,
      technologies,
      liveLink,
      previewImage,
      roles,
      featured,
      sortOrder,
      published,
    } = req.body;

    if (!slug?.trim() || !title?.trim() || !problem?.trim() || !description?.trim()) {
      return res.status(400).json({
        error: 'Slug, title, problem, and description are required.',
      });
    }

    await withDbWrite(
      async () => {
        await pool.query(
          `INSERT INTO projects (slug, category, title, problem, description, technologies, live_link, preview_image, roles, featured, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            slug,
            category || 'web',
            title,
            problem,
            description,
            JSON.stringify(technologies || []),
            liveLink || '#',
            previewImage || null,
            JSON.stringify(roles || []),
            featured ? 1 : 0,
            sortOrder || 0,
            published !== false ? 1 : 0,
          ]
        );
      },
      () => {
        devMemoryStore.addProject({
          slug,
          category,
          title,
          problem,
          description,
          technologies,
          liveLink: liveLink || '#',
          previewImage,
          roles,
          featured,
          sortOrder,
          published,
        });
      }
    );
    res.status(201).json({ success: true });
  })
);

router.put(
  '/projects/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category, title, problem, description, technologies, liveLink, previewImage, roles, featured, sortOrder, published } =
      req.body;
    await withDbWrite(
      async () => {
        const [result] = await pool.query(
          `UPDATE projects SET category=?, title=?, problem=?, description=?, technologies=?, live_link=?, preview_image=?, roles=?, featured=?, sort_order=?, published=?
       WHERE slug=?`,
          [
            category,
            title,
            problem,
            description,
            JSON.stringify(technologies || []),
            liveLink || '#',
            previewImage || null,
            JSON.stringify(roles || []),
            featured ? 1 : 0,
            sortOrder || 0,
            published !== false ? 1 : 0,
            req.params.slug,
          ]
        );
        if (result.affectedRows === 0) {
          const error = new Error('Not found');
          error.status = 404;
          throw error;
        }
      },
      () => {
        devMemoryStore.updateProject(req.params.slug, {
          category,
          title,
          problem,
          description,
          technologies,
          liveLink,
          previewImage,
          roles,
          featured,
          sortOrder,
          published,
        });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/projects/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        const [result] = await pool.query('DELETE FROM projects WHERE slug = ?', [req.params.slug]);
        if (result.affectedRows === 0) {
          const error = new Error('Not found');
          error.status = 404;
          throw error;
        }
      },
      () => {
        devMemoryStore.deleteProject(req.params.slug);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/testimonials',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC');
      return rows;
    }, devFallback.testimonials);
    res.json(rows);
  })
);

router.post(
  '/testimonials',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, role, rating, quote, published, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO testimonials (name, role, rating, quote, published, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [name, role, rating || 5, quote, published !== false ? 1 : 0, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addTestimonial({ name, role, rating, quote, published, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/testimonials/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, role, rating, quote, published, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query(
          'UPDATE testimonials SET name=?, role=?, rating=?, quote=?, published=?, sort_order=? WHERE id=?',
          [name, role, rating, quote, published ? 1 : 0, sortOrder || 0, req.params.id]
        );
      },
      () => {
        devMemoryStore.updateTestimonial(req.params.id, { name, role, rating, quote, published, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/testimonials/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteTestimonial(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/pricing',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM pricing_packages ORDER BY sort_order ASC');
      return parseJsonRows(rows, ['features']);
    }, devFallback.pricing);
    res.json(rows);
  })
);

router.post(
  '/pricing',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, price, description, features, published, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO pricing_packages (name, price, description, features, published, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [name, price, description, JSON.stringify(features || []), published !== false ? 1 : 0, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addPricing({ name, price, description, features, published, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/pricing/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, price, description, features, published, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query(
          'UPDATE pricing_packages SET name=?, price=?, description=?, features=?, published=?, sort_order=? WHERE id=?',
          [name, price, description, JSON.stringify(features || []), published ? 1 : 0, sortOrder || 0, req.params.id]
        );
      },
      () => {
        devMemoryStore.updatePricing(req.params.id, { name, price, description, features, published, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/pricing/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM pricing_packages WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deletePricing(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/services',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await withDb(async () => {
      const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY sort_order ASC');
      const [homeServices] = await pool.query('SELECT * FROM home_services ORDER BY sort_order ASC');
      return {
        categories: parseJsonRows(categories, ['items']),
        homeServices,
      };
    }, devFallback.services);
    res.json(data);
  })
);

router.put(
  '/services/categories/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, items, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE service_categories SET title=?, items=?, sort_order=? WHERE slug=?', [
          title,
          JSON.stringify(items || []),
          sortOrder || 0,
          req.params.slug,
        ]);
      },
      () => {
        devMemoryStore.updateServiceCategory(req.params.slug, { title, items, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.post(
  '/services/home',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, description, icon, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO home_services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)',
          [title, description, icon || '01', sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addHomeService({ title, description, icon, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/services/home/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, description, icon, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE home_services SET title=?, description=?, icon=?, sort_order=? WHERE id=?', [
          title,
          description,
          icon,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateHomeService(req.params.id, { title, description, icon, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/services/home/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM home_services WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteHomeService(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/quote-options',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await withDb(async () => {
      const [projectTypes] = await pool.query('SELECT * FROM project_types ORDER BY sort_order ASC');
      const [budgetRanges] = await pool.query('SELECT * FROM budget_ranges ORDER BY sort_order ASC');
      return { projectTypes, budgetRanges };
    }, devFallback.quoteOptionsAdmin);
    res.json(data);
  })
);

router.post(
  '/quote-options/project-types',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO project_types (name, sort_order) VALUES (?, ?)',
          [name, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addProjectType({ name, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/quote-options/project-types/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE project_types SET name=?, sort_order=? WHERE id=?', [
          name,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateProjectType(req.params.id, { name, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/quote-options/project-types/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM project_types WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteProjectType(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.post(
  '/quote-options/budget-ranges',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO budget_ranges (name, sort_order) VALUES (?, ?)',
          [name, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addBudgetRange({ name, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/quote-options/budget-ranges/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE budget_ranges SET name=?, sort_order=? WHERE id=?', [
          name,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateBudgetRange(req.params.id, { name, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/quote-options/budget-ranges/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM budget_ranges WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteBudgetRange(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/articles',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
      return rows.map(toApiArticle);
    }, devFallback.articles);
    res.json(rows);
  })
);

router.post(
  '/articles',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { slug, title, abstract, content, published } = req.body;

    if (!slug?.trim() || !title?.trim() || !abstract?.trim()) {
      return res.status(400).json({
        error: 'Slug, title, and abstract are required.',
      });
    }

    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO articles (slug, title, abstract, content, published) VALUES (?, ?, ?, ?, ?)',
          [slug, title, abstract, content, published ? 1 : 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addArticle({ slug, title, abstract, content, published });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/articles/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, abstract, content, published } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE articles SET title=?, abstract=?, content=?, published=? WHERE slug=?', [
          title,
          abstract,
          content,
          published ? 1 : 0,
          req.params.slug,
        ]);
      },
      () => {
        devMemoryStore.updateArticle(req.params.slug, { title, abstract, content, published });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/articles/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM articles WHERE slug = ?', [req.params.slug]);
      },
      () => {
        devMemoryStore.deleteArticle(req.params.slug);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/contacts',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      return rows;
    }, devFallback.contacts);
    res.json(rows);
  })
);

router.patch(
  '/contacts/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
      },
      () => {
        devMemoryStore.updateContactStatus(req.params.id, status);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/quotes',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await withDb(async () => {
      const [rows] = await pool.query('SELECT * FROM quote_requests ORDER BY created_at DESC');
      return rows;
    }, devFallback.quotes);
    res.json(rows);
  })
);

router.patch(
  '/quotes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE quote_requests SET status = ? WHERE id = ?', [status, req.params.id]);
      },
      () => {
        devMemoryStore.updateQuoteStatus(req.params.id, status);
      }
    );
    res.json({ success: true });
  })
);

router.get(
  '/settings',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const settings = await getSiteSettings();
    res.json(settings);
  })
);

router.put(
  '/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    await saveSiteSettings(req.body);
    res.json({ success: true });
  })
);

router.post(
  '/settings/logo',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { variant, data, filename } = req.body;

    if (!['light', 'dark'].includes(variant)) {
      return res.status(400).json({ error: 'Invalid logo variant. Use light or dark.' });
    }

    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing image file data' });
    }

    const { url } = await saveUploadedImage({ data, filename });
    const settings = await getSiteSettings();
    const key = variant === 'light' ? 'logoLight' : 'logoDark';
    const updated = { ...settings, [key]: url };

    await saveSiteSettings(updated);

    res.status(201).json({
      success: true,
      url,
      variant,
      logoLight: updated.logoLight,
      logoDark: updated.logoDark,
    });
  })
);

router.delete(
  '/settings/logo/:variant',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { variant } = req.params;

    if (!['light', 'dark'].includes(variant)) {
      return res.status(400).json({ error: 'Invalid logo variant. Use light or dark.' });
    }

    const settings = await getSiteSettings();
    const key = variant === 'light' ? 'logoLight' : 'logoDark';
    const updated = { ...settings, [key]: DEFAULT_LOGOS[variant] };

    await saveSiteSettings(updated);

    res.json({
      success: true,
      variant,
      logoLight: updated.logoLight,
      logoDark: updated.logoDark,
    });
  })
);

router.get(
  '/about',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await withDb(async () => {
      const [team] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC');
      const [technologies] = await pool.query('SELECT * FROM technologies ORDER BY sort_order ASC');
      const [values] = await pool.query('SELECT * FROM company_values ORDER BY sort_order ASC');
      const page = await getAboutPageConfig();
      return { page, team, technologies, values };
    }, devFallback.about);
    res.json(data);
  })
);

router.put(
  '/about/page',
  requireAuth,
  asyncHandler(async (req, res) => {
    const current = await getAboutPageConfig();
    const updated = normalizeAboutPage({
      ...current,
      ...req.body,
      home: {
        ...(current.home || {}),
        ...(req.body.home || {}),
      },
    });

    await withDbWrite(
      async () => {
        await saveAboutPageConfig(pool, updated);
      },
      () => {
        devMemoryStore.updatePage({
          ...req.body,
          home: {
            ...(current.home || {}),
            ...(req.body.home || {}),
          },
        });
      }
    );
    res.json({ success: true, page: updated });
  })
);

router.post(
  '/about/home-image',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, filename, imageAlt } = req.body;

    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing image file data' });
    }

    const { url } = await saveUploadedImage({ data, filename });
    const current = await getAboutPageConfig();
    const updated = mergeAboutHomeImage(current, {
      image: url,
      imageLarge: url,
      ...(imageAlt !== undefined ? { imageAlt } : {}),
    });

    await withDbWrite(
      async () => {
        await saveAboutPageConfig(pool, updated);
      },
      () => {
        devMemoryStore.updatePage(updated);
      }
    );

    res.status(201).json({
      success: true,
      url,
      home: updated.home,
      page: updated,
    });
  })
);

router.delete(
  '/about/home-image',
  requireAuth,
  asyncHandler(async (req, res) => {
    const current = await getAboutPageConfig();
    const updated = mergeAboutHomeImage(current, {
      image: '',
      imageLarge: '',
    });

    await withDbWrite(
      async () => {
        await saveAboutPageConfig(pool, updated);
      },
      () => {
        devMemoryStore.updatePage(updated);
      }
    );

    res.json({
      success: true,
      home: updated.home,
      page: updated,
    });
  })
);

router.post(
  '/upload',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await saveUploadedImage(req.body);
    res.status(201).json(result);
  })
);

router.post(
  '/about/team',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, role, bio, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO team_members (name, role, bio, sort_order) VALUES (?, ?, ?, ?)',
          [name, role, bio, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addTeam({ name, role, bio, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/about/team/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, role, bio, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE team_members SET name=?, role=?, bio=?, sort_order=? WHERE id=?', [
          name,
          role,
          bio,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateTeam(req.params.id, { name, role, bio, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/about/team/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteTeam(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.post(
  '/about/values',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, description, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO company_values (title, description, sort_order) VALUES (?, ?, ?)',
          [title, description, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addValue({ title, description, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/about/values/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, description, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE company_values SET title=?, description=?, sort_order=? WHERE id=?', [
          title,
          description,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateValue(req.params.id, { title, description, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/about/values/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM company_values WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteValue(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

router.post(
  '/about/technologies',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    const result = await withDbWrite(
      async () => {
        const [result] = await pool.query(
          'INSERT INTO technologies (name, sort_order) VALUES (?, ?)',
          [name, sortOrder || 0]
        );
        return result;
      },
      () => {
        const row = devMemoryStore.addTechnology({ name, sortOrder });
        return { insertId: row.id };
      }
    );
    res.status(201).json({ id: result.insertId });
  })
);

router.put(
  '/about/technologies/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, sortOrder } = req.body;
    await withDbWrite(
      async () => {
        await pool.query('UPDATE technologies SET name=?, sort_order=? WHERE id=?', [
          name,
          sortOrder || 0,
          req.params.id,
        ]);
      },
      () => {
        devMemoryStore.updateTechnology(req.params.id, { name, sortOrder });
      }
    );
    res.json({ success: true });
  })
);

router.delete(
  '/about/technologies/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await withDbWrite(
      async () => {
        await pool.query('DELETE FROM technologies WHERE id = ?', [req.params.id]);
      },
      () => {
        devMemoryStore.deleteTechnology(req.params.id);
      }
    );
    res.json({ success: true });
  })
);

export default router;
