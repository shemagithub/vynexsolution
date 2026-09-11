import { config } from '../config.js';
import { isDbConnectionError, normalizeDbError } from './db-errors.js';

export function dbUnavailableError() {
  const error = new Error(
    'Database unavailable. Start MySQL with: docker compose up -d mysql && cd backend && npm run seed'
  );
  error.status = 503;
  return error;
}

async function runWithFallback(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    if (error?.status) throw error;

    if (fallback !== undefined && isDbConnectionError(error)) {
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }

    if (config.nodeEnv !== 'production' && fallback !== undefined) {
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }

    throw normalizeDbError(error);
  }
}

export async function withDb(fn, fallback) {
  return runWithFallback(fn, fallback);
}

export async function withDbWrite(fn, fallback) {
  return runWithFallback(fn, fallback);
}
