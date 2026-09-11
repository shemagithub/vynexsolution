import mysql from 'mysql2/promise';
import { config } from '../config.js';

const dbConfig = config.db.socketPath
  ? {
      socketPath: config.db.socketPath,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    }
  : {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    };

export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export function parseJsonFields(row, fields) {
  if (!row) return row;
  const parsed = { ...row };
  for (const field of fields) {
    if (parsed[field] && typeof parsed[field] === 'string') {
      parsed[field] = JSON.parse(parsed[field]);
    }
  }
  return parsed;
}

export function parseJsonRows(rows, fields) {
  return rows.map(row => parseJsonFields(row, fields));
}

export function toApiProject(row) {
  if (!row) return null;
  const parsed = parseJsonFields(row, ['technologies', 'roles']);
  return {
    id: parsed.slug,
    slug: parsed.slug,
    category: parsed.category,
    title: parsed.title,
    problem: parsed.problem,
    description: parsed.description,
    technologies: parsed.technologies,
    liveLink: parsed.live_link,
    previewImage: parsed.preview_image || '',
    roles: parsed.roles,
    featured: Boolean(parsed.featured),
    published: Boolean(parsed.published),
    sortOrder: parsed.sort_order,
  };
}

export function toApiServiceCategory(row) {
  if (!row) return null;
  const parsed = parseJsonFields(row, ['items']);
  return {
    id: parsed.slug,
    title: parsed.title,
    items: parsed.items,
    sortOrder: parsed.sort_order,
  };
}

export function toApiPricing(row) {
  if (!row) return null;
  const parsed = parseJsonFields(row, ['features']);
  return {
    id: parsed.id,
    name: parsed.name,
    price: parsed.price,
    description: parsed.description,
    features: parsed.features,
    published: Boolean(parsed.published),
    sortOrder: parsed.sort_order,
  };
}

export function toApiArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    abstract: row.abstract,
    content: row.content,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
