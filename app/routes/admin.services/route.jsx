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
  AdminSection,
  AdminTableWrap,
} from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

async function handleServicesAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const fetcher = env ? (path, opts) => adminFetch(path, { env, token, ...opts }) : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'update-category') {
    await fetcher(`/services/categories/${formData.get('slug')}`, {
      method: 'PUT',
      body: {
        title: String(formData.get('title')),
        items: String(formData.get('items'))
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true };
  }

  if (intent === 'delete-home-service') {
    await fetcher(`/services/home/${formData.get('id')}`, { method: 'DELETE' });
    return { success: true };
  }

  const payload = {
    title: String(formData.get('title')),
    description: String(formData.get('description')),
    icon: String(formData.get('icon') || '01'),
    sortOrder: Number(formData.get('sortOrder')) || 0,
  };

  const editId = formData.get('editId');
  if (editId) {
    await fetcher(`/services/home/${editId}`, { method: 'PUT', body: payload });
  } else {
    await fetcher('/services/home', { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const data = await serverAdminFetch('/services', { env: context.cloudflare?.env, token });
  return json(data);
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  return adminFetch('/services', { token });
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handleServicesAction({
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
  return runAdminAction(() => handleServicesAction({ token, formData }));
}

function CategoryForm({ category, onDone }) {
  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      <input type="hidden" name="intent" value="update-category" />
      <input type="hidden" name="slug" value={category.slug} />
      <AdminField label="Title">
        <input className={styles.select} name="title" defaultValue={category.title} required />
      </AdminField>
      <AdminField label="Items (one per line)">
        <textarea
          className={styles.select}
          name="items"
          rows={5}
          defaultValue={(category.items || []).join('\n')}
        />
      </AdminField>
      <AdminField label="Sort order">
        <input
          className={styles.select}
          name="sortOrder"
          type="number"
          defaultValue={category.sort_order || 0}
        />
      </AdminField>
      <AdminButtonRow>
        <Button type="submit">Save category</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

function HomeServiceForm({ item, onDone }) {
  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      {item?.id ? <input type="hidden" name="editId" value={item.id} /> : null}
      <AdminField label="Title">
        <input className={styles.select} name="title" defaultValue={item?.title || ''} required />
      </AdminField>
      <AdminField label="Description">
        <textarea
          className={styles.select}
          name="description"
          rows={3}
          defaultValue={item?.description || ''}
          required
        />
      </AdminField>
      <div className={styles.formRow}>
        <AdminField label="Icon">
          <input className={styles.select} name="icon" defaultValue={item?.icon || '01'} />
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
      <AdminButtonRow>
        <Button type="submit">{item?.id ? 'Save service' : 'Add service'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

export default function AdminServices() {
  const { categories, homeServices } = useLoaderData();
  const actionData = useActionData();
  const [categoryTarget, setCategoryTarget] = useState(null);
  const [serviceTarget, setServiceTarget] = useState(null);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader
        title="Services"
        meta={`${categories.length} categories · ${homeServices.length} home services`}
      >
        <Button onClick={() => setAddServiceOpen(true)}>Add home service</Button>
      </AdminPageHeader>

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Service saved successfully.</AdminAlert>}

      <AdminSection title="Service categories (Services page)">
        <div className={styles.cardGrid}>
          {categories.map(category => (
            <AdminCard
              key={category.slug}
              title={category.title}
              footer={
                <Button secondary type="button" onClick={() => setCategoryTarget(category)}>
                  Edit
                </Button>
              }
            >
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(category.items || []).map(item => (
                  <li key={item}>
                    <Text secondary size="s">
                      {item}
                    </Text>
                  </li>
                ))}
              </ul>
            </AdminCard>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Home page services">
        <AdminTableWrap>
          <table className={`${styles.table} ${styles.tableStacked}`}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Icon</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {homeServices.map(item => (
                <tr key={item.id}>
                  <td data-label="Title">{item.title}</td>
                  <td data-label="Description">{item.description}</td>
                  <td data-label="Icon">{item.icon}</td>
                  <td data-label="Actions">
                    <AdminButtonRow>
                      <Button secondary type="button" onClick={() => setServiceTarget(item)}>
                        Edit
                      </Button>
                      <Button secondary type="button" onClick={() => setDeleteTarget(item)}>
                        Delete
                      </Button>
                    </AdminButtonRow>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      </AdminSection>

      <AdminModal
        open={Boolean(categoryTarget)}
        title={`Edit ${categoryTarget?.title || 'category'}`}
        onClose={() => setCategoryTarget(null)}
      >
        {categoryTarget ? (
          <CategoryForm category={categoryTarget} onDone={() => setCategoryTarget(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={addServiceOpen}
        title="Add home service"
        onClose={() => setAddServiceOpen(false)}
      >
        <HomeServiceForm onDone={() => setAddServiceOpen(false)} />
      </AdminModal>

      <AdminModal
        open={Boolean(serviceTarget)}
        title="Edit home service"
        onClose={() => setServiceTarget(null)}
      >
        {serviceTarget ? (
          <HomeServiceForm item={serviceTarget} onDone={() => setServiceTarget(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete home service?"
        onClose={() => setDeleteTarget(null)}
        footer={
          deleteTarget ? (
            <>
              <Form method="post" className={styles.buttonRow}>
                <input type="hidden" name="intent" value="delete-home-service" />
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
          Remove <strong>{deleteTarget?.title}</strong>?
        </Text>
      </AdminModal>
    </>
  );
}
