import { json } from '@remix-run/cloudflare';
import { Outlet, useLoaderData } from '@remix-run/react';
import { AdminLayout } from '~/layouts/admin/admin-layout';
import { requireAdminClient } from '~/utils/admin-session.client';

function normalizePathname(pathname) {
  return pathname.replace(/\/$/, '') || '/';
}

function isPublicAdminPath(pathname) {
  const path = normalizePathname(pathname);
  return path === '/admin/login' || path === '/admin/logout';
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const url = new URL(request.url);

  if (isPublicAdminPath(url.pathname)) {
    return json({
      isPublicAdminPath: true,
      isLoginPage: normalizePathname(url.pathname) === '/admin/login',
    });
  }

  const { user } = await requireAdmin(request, context.cloudflare?.env);
  return json({ isPublicAdminPath: false, isLoginPage: false, user });
}

export async function clientLoader({ request }) {
  const url = new URL(request.url);

  if (isPublicAdminPath(url.pathname)) {
    return {
      isPublicAdminPath: true,
      isLoginPage: normalizePathname(url.pathname) === '/admin/login',
    };
  }

  const { user } = await requireAdminClient();
  return { isPublicAdminPath: false, isLoginPage: false, user };
}

export default function AdminRoute() {
  const { isPublicAdminPath, isLoginPage, user } = useLoaderData();

  if (isPublicAdminPath || isLoginPage) {
    return <Outlet />;
  }

  return <AdminLayout user={user} />;
}
