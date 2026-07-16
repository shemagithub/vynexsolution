import { getApiUrl } from '~/utils/api-url';

function createApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function adminFetch(path, { env, token, method = 'GET', body } = {}) {
  const apiUrl = getApiUrl(env);
  const res = await fetch(`${apiUrl}/api/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw createApiError(res.status, data.error || 'Request failed');
  }
  return data;
}

export async function adminLogin(email, password, env) {
  const apiUrl = getApiUrl(env);

  let res;
  try {
    res = await fetch(`${apiUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    console.error('[admin] login request failed:', apiUrl, error?.message || error);
    throw createApiError(
      503,
      `Cannot reach backend at ${apiUrl}. Check that the API is running.`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data.error ||
      (res.status >= 500
        ? `Backend error (${apiUrl}). Try again later.`
        : 'Invalid email or password.');
    throw createApiError(res.status, message);
  }

  return data;
}
