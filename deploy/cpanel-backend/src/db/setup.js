import { pool } from './pool.js';
import { runSchemaSql } from './ensure-database.js';

async function setup() {
  try {
    await runSchemaSql();
    console.log('Database schema created successfully.');
    console.log('Next step: npm run seed (or restart the app — seed runs automatically).');
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
  }
}

setup();
