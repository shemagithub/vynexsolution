import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSchema() {
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

async function setup() {
  try {
    await runSchema();
    console.log('Database schema created successfully.');
    console.log('Next step: npm run seed');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  }
}

setup();
