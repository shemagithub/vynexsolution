import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import {
  AdminAlert,
  AdminButtonRow,
  AdminCard,
  AdminField,
  AdminModal,
  AdminPageHeader,
} from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

async function handlePricingAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const fetcher = env ? (path, opts) => adminFetch(path, { env, token, ...opts }) : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'delete') {
    await fetcher(`/pricing/${formData.get('id')}`, { method: 'DELETE' });
    return { success: true };
  }

  const payload = {
    name: String(formData.get('name')),
    price: String(formData.get('price')),
    description: String(formData.get('description')),
    features: String(formData.get('features'))
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean),
    published: formData.get('published') === 'on',
    sortOrder: Number(formData.get('sortOrder')) || 0,
  };

  const editId = formData.get('editId');
  if (editId) {
    await fetcher(`/pricing/${editId}`, { method: 'PUT', body: payload });
  } else {
    await fetcher('/pricing', { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const items = await serverAdminFetch('/pricing', { env: context.cloudflare?.env, token });
  return json({ items });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const items = await adminFetch('/pricing', { token });
  return { items };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handlePricingAction({
      token,
      formData,
      env: context.cloudflare?.env,
    })
  );
  if (result.status) return json(result, { status: result.status });
  return json(result);
}

export async function clientAction({ request }) {
  const { token } = await requireAdminClient();
  const formData = await request.formData();
  return runAdminAction(() => handlePricingAction({ token, formData }));
}

function PricingForm({ item, onDone }) {
  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      {item?.id ? <input type="hidden" name="editId" value={item.id} /> : null}
      <div className={styles.formRow}>
        <AdminField label="Name">
          <input className={styles.select} name="name" defaultValue={item?.name || ''} required />
        </AdminField>
        <AdminField label="Price">
          <input className={styles.select} name="price" defaultValue={item?.price || ''} required />
        </AdminField>
      </div>
      <AdminField label="Description">
        <textarea
          className={styles.select}
          name="description"
          rows={2}
          defaultValue={item?.description || ''}
          required
        />
      </AdminField>
      <AdminField label="Features (one per line)">
        <textarea
          className={styles.select}
          name="features"
          rows={4}
          defaultValue={(item?.features || []).join('\n')}
        />
      </AdminField>
      <AdminField label="Sort order">
        <input
          className={styles.select}
          name="sortOrder"
          type="number"
          defaultValue={item?.sort_order || 0}
        />
      </AdminField>
      <label className={styles.checkboxRow}>
        <input type="checkbox" name="published" defaultChecked={item?.published !== false} /> Published
      </label>
      <AdminButtonRow>
        <Button type="submit">{item?.id ? 'Save package' : 'Add package'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

export default function AdminPricing() {
  const { items } = useLoaderData();
  const actionData = useActionData();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader title="Pricing" meta={`${items.length} packages`}>
        <Button onClick={() => setAddOpen(true)}>Add package</Button>
      </AdminPageHeader>

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Pricing package saved successfully.</AdminAlert>}

      <div className={styles.cardGrid}>
        {items.map(item => (
          <AdminCard
            key={item.id}
            title={item.name}
            meta={<Text size="l">{item.price}</Text>}
            footer={
              <AdminButtonRow>
                <Button secondary type="button" onClick={() => setEditTarget(item)}>
                  Edit
                </Button>
                <Button secondary type="button" onClick={() => setDeleteTarget(item)}>
                  Delete
                </Button>
              </AdminButtonRow>
            }
          >
            <Text secondary size="s">
              {item.description}
            </Text>
          </AdminCard>
        ))}
      </div>

      <AdminModal open={addOpen} title="Add package" onClose={() => setAddOpen(false)}>
        <PricingForm onDone={() => setAddOpen(false)} />
      </AdminModal>

      <AdminModal open={Boolean(editTarget)} title="Edit package" onClose={() => setEditTarget(null)}>
        {editTarget ? <PricingForm item={editTarget} onDone={() => setEditTarget(null)} /> : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete package?"
        onClose={() => setDeleteTarget(null)}
        footer={
          deleteTarget ? (
            <>
              <Form method="post" className={styles.buttonRow}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={deleteTarget.id} />
                <Button type="submit">Delete</Button>
              </Form>
              <Button secondary type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
            </>
          ) : null
        }
      >
        <Text size="s">
          Remove <strong>{deleteTarget?.name}</strong>?
        </Text>
      </AdminModal>
    </>
  );
}
