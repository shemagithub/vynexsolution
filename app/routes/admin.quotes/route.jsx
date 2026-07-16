import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { AdminAlert, AdminPageHeader, AdminTableWrap } from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

function formatDeadline(value) {
  if (!value) return '—';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return value;
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const items = await serverAdminFetch('/quotes', { env: context.cloudflare?.env, token });
  return json({ items });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const items = await adminFetch('/quotes', { token });
  return { items };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(async () => {
    await serverAdminFetch(`/quotes/${formData.get('id')}`, {
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
    await adminFetch(`/quotes/${formData.get('id')}`, {
      token,
      method: 'PATCH',
      body: { status: String(formData.get('status')) },
    });
    return { success: true };
  });
}

export default function AdminQuotes() {
  const { items } = useLoaderData();
  const actionData = useActionData();

  return (
    <>
      <AdminPageHeader title="Quote Requests" meta={`${items.length} total`} />

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Status updated.</AdminAlert>}

      {items.length === 0 ? (
        <p className={styles.empty}>No quote requests yet.</p>
      ) : (
        <AdminTableWrap>
          <table className={`${styles.table} ${styles.tableStacked}`}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td data-label="Email">{item.email}</td>
                  <td data-label="Type">{item.project_type}</td>
                  <td data-label="Budget">{item.budget || '—'}</td>
                  <td data-label="Deadline">{formatDeadline(item.deadline)}</td>
                  <td data-label="Message">
                    {item.message.slice(0, 80)}
                    {item.message.length > 80 ? '…' : ''}
                  </td>
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
                        <option value="quoted">quoted</option>
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
