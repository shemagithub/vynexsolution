import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { AdminAlert, AdminPageHeader, AdminTableWrap } from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const items = await serverAdminFetch('/contacts', { env: context.cloudflare?.env, token });
  return json({ items });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const items = await adminFetch('/contacts', { token });
  return { items };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(async () => {
    await serverAdminFetch(`/contacts/${formData.get('id')}`, {
      env: context.cloudflare?.env,
      token,
      method: 'PATCH',
      body: { status: String(formData.get('status')) },
    });
    return { success: true };
  });
  if (result.status) return json(result, { status: result.status });
  return json(result);
}

export async function clientAction({ request }) {
  const { token } = await requireAdminClient();
  const formData = await request.formData();
  return runAdminAction(async () => {
    await adminFetch(`/contacts/${formData.get('id')}`, {
      token,
      method: 'PATCH',
      body: { status: String(formData.get('status')) },
    });
    return { success: true };
  });
}

export default function AdminContacts() {
  const { items } = useLoaderData();
  const actionData = useActionData();

  return (
    <>
      <AdminPageHeader title="Contact Messages" meta={`${items.length} total`} />

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Status updated.</AdminAlert>}

      {items.length === 0 ? (
        <p className={styles.empty}>No messages yet.</p>
      ) : (
        <AdminTableWrap>
          <table className={`${styles.table} ${styles.tableStacked}`}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td data-label="Email">{item.email}</td>
                  <td data-label="Message">{item.message}</td>
                  <td data-label="Date">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td data-label="Status">
                    <Form method="post">
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        className={styles.select}
                        name="status"
                        defaultValue={item.status}
                        onChange={event => event.target.form.requestSubmit()}
                      >
                        <option value="new">new</option>
                        <option value="read">read</option>
                        <option value="replied">replied</option>
                        <option value="archived">archived</option>
                      </select>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      )}
    </>
  );
}
