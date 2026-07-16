import { fileURLToPath } from 'url';
import { pool } from './pool.js';

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].count) > 0;
}

async function tableExists(table) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return Number(rows[0].count) > 0;
}

const migrations = [
  {
    name: 'projects_preview_image',
    async up() {
      if (!(await columnExists('projects', 'preview_image'))) {
        await pool.query(
          'ALTER TABLE projects ADD COLUMN preview_image VARCHAR(512) DEFAULT NULL AFTER live_link'
        );
      }
    },
  },
  {
    name: 'site_settings_table',
    async up() {
      if (!(await tableExists('site_settings'))) {
        await pool.query(`
          CREATE TABLE site_settings (
            setting_key VARCHAR(255) PRIMARY KEY,
            setting_value JSON NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
      }
    },
  },
  {
    name: 'project_types_table',
    async up() {
      if (!(await tableExists('project_types'))) {
        await pool.query(`
          CREATE TABLE project_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            sort_order INT NOT NULL DEFAULT 0
          )
        `);
      }
    },
  },
  {
    name: 'budget_ranges_table',
    async up() {
      if (!(await tableExists('budget_ranges'))) {
        await pool.query(`
          CREATE TABLE budget_ranges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            sort_order INT NOT NULL DEFAULT 0
          )
        `);
      }
    },
  },
];

export async function runMigrations() {
  try {
    await pool.query('SELECT 1');
  } catch {
    return false;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const migration of migrations) {
    const [rows] = await pool.query('SELECT name FROM schema_migrations WHERE name = ?', [
      migration.name,
    ]);
    if (rows.length > 0) continue;

    await migration.up();
    await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [migration.name]);
    console.log(`Migration applied: ${migration.name}`);
  }

  return true;
}

async function main() {
  try {
    const ok = await runMigrations();
    if (!ok) {
      console.error('Database not available — run migrations after MySQL is up.');
      process.exit(1);
    }
    console.log('Database migrations complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
