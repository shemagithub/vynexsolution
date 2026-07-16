import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import { adminFetch } from './admin-api.server';

const storage = createCookieSessionStorage({
  cookie: {
    name: '__admin_session',
    httpOnly: true,
    maxAge: 604_800,
    path: '/',
    sameSite: 'lax',
    secrets: ['admin-session-secret'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getAdminSession(request) {
  return storage.getSession(request.headers.get('Cookie'));
}

async function redirectToLogin(session) {
  throw redirect('/admin/login', {
    headers: { 'Set-Cookie': await storage.destroySession(session) },
  });
}

export async function requireAdmin(request, env) {
  const session = await getAdminSession(request);
  const token = session.get('token');

  if (!token) {
    throw redirect('/admin/login');
  }

  try {
    const data = await adminFetch('/me', { env, token });
    return { session, token, user: data.user };
  } catch {
    await redirectToLogin(session);
  }
}

export async function getValidAdminSession(request, env) {
  const session = await getAdminSession(request);
  const token = session.get('token');

  if (!token) {
    return { session, token: null, user: null };
  }

  try {
    const data = await adminFetch('/me', { env, token });
    return { session, token, user: data.user };
  } catch {
    return { session, token: null, user: null, invalid: true };
  }
}

export async function createAdminSession(token, user) {
  const session = await storage.getSession();
  session.set('token', token);
  session.set('user', user);
  return session;
}

export async function commitAdminSession(session) {
  return storage.commitSession(session);
}

export async function destroyAdminSession(request) {
  const session = await getAdminSession(request);
  return storage.destroySession(session);
}
