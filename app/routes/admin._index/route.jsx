import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Text } from '~/components/text';
import { AdminPageHeader } from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const { stats } = await serverAdminFetch('/dashboard', {
    env: context.cloudflare?.env,
    token,
  });
  return json({ stats });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const { stats } = await adminFetch('/dashboard', { token });
  return { stats };
}

export default function AdminDashboard() {
  const { stats } = useLoaderData();

  const items = [
    { label: 'Projects', value: stats.projects },
    { label: 'Testimonials', value: stats.testimonials },
    { label: 'New Messages', value: stats.newContacts },
    { label: 'New Quotes', value: stats.newQuotes },
    { label: 'Articles', value: stats.articles },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        meta="Overview of your website content and incoming requests."
      />
      <div className={styles.stats}>
        {items.map(item => (
          <div key={item.label} className={styles.stat}>
            <div className={styles.statValue}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
      <Text secondary size="s" style={{ marginTop: 'var(--spaceL)' }}>
        Use the sidebar to manage content, mail, and incoming requests.
      </Text>
    </>
  );
}
