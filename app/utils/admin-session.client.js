import { redirect } from '@remix-run/react';
import { adminFetch } from '~/utils/admin-fetch';

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export function getAdminToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function requireAdminClient() {
  const token = getAdminToken();
  if (!token) {
    throw redirect('/admin/login');
  }

  try {
    const data = await adminFetch('/me', { token });
    return { token, user: data.user };
  } catch {
    clearAdminSession();
    throw redirect('/admin/login');
  }
}

export async function getValidAdminSessionClient() {
  const token = getAdminToken();
  if (!token) {
    return { token: null, user: null };
  }

  try {
    const data = await adminFetch('/me', { token });
    return { token, user: data.user };
  } catch {
    return { token: null, user: null, invalid: true };
  }
}
