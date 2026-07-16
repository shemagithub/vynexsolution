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

async function handleTestimonialsAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const fetcher = env ? (path, opts) => adminFetch(path, { env, token, ...opts }) : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'delete') {
    await fetcher(`/testimonials/${formData.get('id')}`, { method: 'DELETE' });
    return { success: true };
  }

  const payload = {
    name: String(formData.get('name')),
    role: String(formData.get('role')),
    rating: Number(formData.get('rating')) || 5,
    quote: String(formData.get('quote')),
    published: formData.get('published') === 'on',
    sortOrder: Number(formData.get('sortOrder')) || 0,
  };

  const editId = formData.get('editId');
  if (editId) {
    await fetcher(`/testimonials/${editId}`, { method: 'PUT', body: payload });
  } else {
    await fetcher('/testimonials', { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const items = await serverAdminFetch('/testimonials', { env: context.cloudflare?.env, token });
  return json({ items });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const items = await adminFetch('/testimonials', { token });
  return { items };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handleTestimonialsAction({
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
  return runAdminAction(() => handleTestimonialsAction({ token, formData }));
}

function TestimonialForm({ item, onDone }) {
  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      {item?.id ? <input type="hidden" name="editId" value={item.id} /> : null}
      <div className={styles.formRow}>
        <AdminField label="Name">
          <input className={styles.select} name="name" defaultValue={item?.name || ''} required />
        </AdminField>
        <AdminField label="Role">
          <input className={styles.select} name="role" defaultValue={item?.role || ''} required />
        </AdminField>
      </div>
      <AdminField label="Quote">
        <textarea
          className={styles.select}
          name="quote"
          rows={3}
          defaultValue={item?.quote || ''}
          required
        />
      </AdminField>
      <div className={styles.formRow}>
        <AdminField label="Rating">
          <input
            className={styles.select}
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={item?.rating ?? 5}
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
      </div>
      <label className={styles.checkboxRow}>
        <input type="checkbox" name="published" defaultChecked={item?.published !== false} /> Published
      </label>
      <AdminButtonRow>
        <Button type="submit">{item?.id ? 'Save testimonial' : 'Add testimonial'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

export default function AdminTestimonials() {
  const { items } = useLoaderData();
  const actionData = useActionData();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader title="Testimonials" meta={`${items.length} total`}>
        <Button onClick={() => setAddOpen(true)}>Add testimonial</Button>
      </AdminPageHeader>

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Testimonial saved successfully.</AdminAlert>}

      <div className={styles.cardGrid}>
        {items.map(item => (
          <AdminCard
            key={item.id}
            title={item.name}
            meta={
              <Text secondary size="s">
                {item.role} · {'★'.repeat(item.rating)}
              </Text>
            }
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
            <Text size="s">&ldquo;{item.quote}&rdquo;</Text>
          </AdminCard>
        ))}
      </div>

      <AdminModal open={addOpen} title="Add testimonial" onClose={() => setAddOpen(false)}>
        <TestimonialForm onDone={() => setAddOpen(false)} />
      </AdminModal>

      <AdminModal
        open={Boolean(editTarget)}
        title="Edit testimonial"
        onClose={() => setEditTarget(null)}
      >
        {editTarget ? (
          <TestimonialForm item={editTarget} onDone={() => setEditTarget(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete testimonial?"
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
          Remove testimonial from <strong>{deleteTarget?.name}</strong>?
        </Text>
      </AdminModal>
    </>
  );
}
