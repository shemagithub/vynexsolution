import { fileURLToPath } from 'url';
import { pool } from './pool.js';
import { ensureDatabase } from './ensure-database.js';

export { runSchemaSql, seedIfEmpty, ensureDatabase } from './ensure-database.js';

async function seed() {
  await ensureDatabase();
  console.log('Database seeded successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .catch(err => {
      console.error('Seed failed:', err);
      process.exit(1);
    })
    .finally(() => pool.end());
}
