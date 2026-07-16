export function isDbConnectionError(error) {
  const code = error?.code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ER_ACCESS_DENIED_ERROR' ||
    code === 'ER_BAD_DB_ERROR' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    error?.fatal === true
  );
}

export function normalizeDbError(error) {
  if (!error) {
    const unknown = new Error('Internal server error');
    unknown.status = 500;
    return unknown;
  }

  if (error.status) return error;

  if (error.code === 'ER_DUP_ENTRY') {
    const duplicate = new Error('A record with that identifier already exists.');
    duplicate.status = 409;
    return duplicate;
  }

  if (isDbConnectionError(error)) {
    const unavailable = new Error(
      'Database unavailable. Check database credentials and that MySQL is running.'
    );
    unavailable.status = 503;
    return unavailable;
  }

  const message = error.sqlMessage || error.message || 'Internal server error';
  const normalized = new Error(message);
  normalized.status = 500;
  return normalized;
}
