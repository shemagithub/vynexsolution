import { redirect } from '@remix-run/cloudflare';
import { redirect as clientRedirect } from '@remix-run/react';
import { clearAdminSession } from '~/utils/admin-session.client';

export async function action({ request }) {
  const { destroyAdminSession } = await import('~/utils/admin-session.server');
  const cookie = await destroyAdminSession(request);
  return redirect('/admin/login', {
    headers: { 'Set-Cookie': cookie },
  });
}

export async function loader() {
  return redirect('/admin/login');
}

export async function clientAction() {
  clearAdminSession();
  throw clientRedirect('/admin/login');
}

export async function clientLoader() {
  clearAdminSession();
  throw clientRedirect('/admin/login');
}
