import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { config } from '../config.js';
import { seedData } from '../data/seed-data.js';
import { runMigrations } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runSchemaSql() {
  const schemaPath = path.join(__dirname, '../../db/schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(
      s =>
        s.length > 0 &&
        !s.startsWith('--') &&
        !s.toUpperCase().startsWith('CREATE DATABASE') &&
        !s.toUpperCase().startsWith('USE ')
    );

  for (const statement of statements) {
    await pool.query(statement);
  }
}

export async function seedIfEmpty() {
  const [adminRows] = await pool.query('SELECT id FROM admin_users LIMIT 1');
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash(config.adminPassword, 12);
    await pool.query(
      'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
      [config.adminEmail, hash, 'Admin']
    );
    console.log(`Admin user created: ${config.adminEmail}`);
  }

  const [projectRows] = await pool.query('SELECT id FROM projects LIMIT 1');
  if (projectRows.length === 0) {
    for (const project of seedData.projects) {
      await pool.query(
        `INSERT INTO projects (slug, category, title, problem, description, technologies, live_link, roles, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.slug,
          project.category,
          project.title,
          project.problem,
          project.description,
          JSON.stringify(project.technologies),
          project.live_link,
          JSON.stringify(project.roles),
          project.featured,
          project.sort_order,
        ]
      );
    }
  }

  const [serviceRows] = await pool.query('SELECT id FROM service_categories LIMIT 1');
  if (serviceRows.length === 0) {
    for (const cat of seedData.serviceCategories) {
      await pool.query(
        'INSERT INTO service_categories (slug, title, items, sort_order) VALUES (?, ?, ?, ?)',
        [cat.slug, cat.title, JSON.stringify(cat.items), cat.sort_order]
      );
    }
  }

  const [homeServiceRows] = await pool.query('SELECT id FROM home_services LIMIT 1');
  if (homeServiceRows.length === 0) {
    for (const service of seedData.homeServices) {
      await pool.query(
        'INSERT INTO home_services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)',
        [service.title, service.description, service.icon, service.sort_order]
      );
    }
  }

  const [testimonialRows] = await pool.query('SELECT id FROM testimonials LIMIT 1');
  if (testimonialRows.length === 0) {
    for (const item of seedData.testimonials) {
      await pool.query(
        'INSERT INTO testimonials (name, role, rating, quote, sort_order) VALUES (?, ?, ?, ?, ?)',
        [item.name, item.role, item.rating, item.quote, item.sort_order]
      );
    }
  }

  const [pricingRows] = await pool.query('SELECT id FROM pricing_packages LIMIT 1');
  if (pricingRows.length === 0) {
    for (const pkg of seedData.pricingPackages) {
      await pool.query(
        'INSERT INTO pricing_packages (name, price, description, features, sort_order) VALUES (?, ?, ?, ?, ?)',
        [pkg.name, pkg.price, pkg.description, JSON.stringify(pkg.features), pkg.sort_order]
      );
    }
  }

  const [teamRows] = await pool.query('SELECT id FROM team_members LIMIT 1');
  if (teamRows.length === 0) {
    for (const member of seedData.teamMembers) {
      await pool.query(
        'INSERT INTO team_members (name, role, bio, sort_order) VALUES (?, ?, ?, ?)',
        [member.name, member.role, member.bio, member.sort_order]
      );
    }
  }

  const [techRows] = await pool.query('SELECT id FROM technologies LIMIT 1');
  if (techRows.length === 0) {
    for (let index = 0; index < seedData.technologies.length; index++) {
      await pool.query('INSERT INTO technologies (name, sort_order) VALUES (?, ?)', [
        seedData.technologies[index],
        index + 1,
      ]);
    }
  }

  const [valueRows] = await pool.query('SELECT id FROM company_values LIMIT 1');
  if (valueRows.length === 0) {
    for (const value of seedData.values) {
      await pool.query(
        'INSERT INTO company_values (title, description, sort_order) VALUES (?, ?, ?)',
        [value.title, value.description, value.sort_order]
      );
    }
  }

  const [typeRows] = await pool.query('SELECT id FROM project_types LIMIT 1');
  if (typeRows.length === 0) {
    for (let index = 0; index < seedData.projectTypes.length; index++) {
      await pool.query('INSERT INTO project_types (name, sort_order) VALUES (?, ?)', [
        seedData.projectTypes[index],
        index + 1,
      ]);
    }
  }

  const [budgetRows] = await pool.query('SELECT id FROM budget_ranges LIMIT 1');
  if (budgetRows.length === 0) {
    for (let index = 0; index < seedData.budgetRanges.length; index++) {
      await pool.query('INSERT INTO budget_ranges (name, sort_order) VALUES (?, ?)', [
        seedData.budgetRanges[index],
        index + 1,
      ]);
    }
  }

  const [articleRows] = await pool.query('SELECT id FROM articles LIMIT 1');
  if (articleRows.length === 0 && seedData.articles?.length) {
    for (const article of seedData.articles) {
      await pool.query(
        'INSERT INTO articles (slug, title, abstract, content, published) VALUES (?, ?, ?, ?, ?)',
        [
          article.slug,
          article.title,
          article.abstract || '',
          article.content || '',
          article.published === false ? 0 : 1,
        ]
      );
    }
  }

  const [settingsRows] = await pool.query('SELECT setting_key FROM site_settings');
  const existingKeys = new Set(settingsRows.map(row => row.setting_key));
  if (!existingKeys.has('site_config')) {
    await pool.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
      ['site_config', JSON.stringify(seedData.siteSettings)]
    );
  }
  if (!existingKeys.has('about_page')) {
    await pool.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
      ['about_page', JSON.stringify(seedData.aboutPage)]
    );
  }
}

/**
 * Create missing tables, apply migrations, and seed empty tables.
 * Safe to run on every app start (idempotent).
 */
export async function ensureDatabase() {
  await pool.query('SELECT 1');
  console.log('Creating/verifying database tables...');
  await runSchemaSql();
  await runMigrations();
  await seedIfEmpty();
  console.log('Database ready.');
  return true;
}
