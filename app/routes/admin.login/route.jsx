import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import { redirect as clientRedirect } from '@remix-run/react';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Input } from '~/components/input';
import { Text } from '~/components/text';
import { useFormInput } from '~/hooks';
import { baseMeta } from '~/utils/meta';
import { adminLogin } from '~/utils/admin-fetch';
import {
  clearAdminSession,
  getValidAdminSessionClient,
  setAdminSession,
} from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

export const meta = () => {
  return baseMeta({
    title: 'Admin Login',
    description: 'Sign in to the Vynex Solutions admin portal.',
    prefix: '',
    robots: 'noindex, nofollow',
    pathname: '/admin/login',
  });
};

export async function loader({ request, context }) {
  const { getValidAdminSession, destroyAdminSession } = await import(
    '~/utils/admin-session.server'
  );
  const { user, invalid } = await getValidAdminSession(request, context.cloudflare?.env);

  if (user) {
    throw redirect('/admin');
  }

  if (invalid) {
    return json(
      {},
      {
        headers: { 'Set-Cookie': await destroyAdminSession(request) },
      }
    );
  }

  return json({});
}

export async function clientLoader() {
  const { user, invalid } = await getValidAdminSessionClient();

  if (user) {
    throw clientRedirect('/admin');
  }

  if (invalid) {
    clearAdminSession();
  }

  return {};
}

export async function action({ request, context }) {
  const { adminLogin: serverAdminLogin } = await import('~/utils/admin-api.server');
  const { createAdminSession, commitAdminSession } = await import('~/utils/admin-session.server');
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const env = context?.cloudflare?.env;

  try {
    const data = await serverAdminLogin(email, password, env);
    const session = await createAdminSession(data.token, data.user);
    return redirect('/admin', {
      headers: { 'Set-Cookie': await commitAdminSession(session) },
    });
  } catch (error) {
    const status = error?.status || 500;
    const message = error?.message || 'Login failed. Please try again.';

    return json({ error: message }, { status: status === 401 ? 401 : status >= 500 ? 503 : 400 });
  }
}

export async function clientAction({ request }) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const data = await adminLogin(email, password);
    setAdminSession(data.token, data.user);
    throw clientRedirect('/admin');
  } catch (error) {
    if (error?.status === 302 || error?.status === 301) throw error;
    const status = error?.status || 500;
    const message = error?.message || 'Login failed. Please try again.';
    return { error: message, status: status === 401 ? 401 : status >= 500 ? 503 : 400 };
  }
}

export default function AdminLogin() {
  const actionData = useActionData();
  const email = useFormInput('');
  const password = useFormInput('');

  return (
    <section className={styles.login}>
      <Form method="post" className={styles.loginCard}>
        <Heading level={3} as="h1" className={styles.loginTitle}>
          Admin Portal
        </Heading>
        <Text secondary size="s" className={styles.loginSubtitle}>
          Sign in to manage Vynex Solutions website content.
        </Text>
        <Input
          required
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
          {...email}
        />
        <Input
          required
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          {...password}
        />
        {actionData?.error && <p className={styles.error}>{actionData.error}</p>}
        <Button type="submit" icon="arrow-right">
          Sign in
        </Button>
      </Form>
    </section>
  );
}
