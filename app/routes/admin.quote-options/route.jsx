import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import {
  AdminAlert,
  AdminButtonRow,
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

async function handleQuoteOptionsAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const kind = formData.get('kind');
  const editId = formData.get('editId');
  const fetcher = env ? (path, opts) => adminFetch(path, { env, token, ...opts }) : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'delete') {
    await fetcher(`/quote-options/${kind}/${formData.get('id')}`, { method: 'DELETE' });
    return { success: true };
  }

  const payload = {
    name: String(formData.get('name')),
    sortOrder: Number(formData.get('sortOrder')) || 0,
  };

  if (editId) {
    await fetcher(`/quote-options/${kind}/${editId}`, { method: 'PUT', body: payload });
  } else {
    await fetcher(`/quote-options/${kind}`, { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const data = await serverAdminFetch('/quote-options', { env: context.cloudflare?.env, token });
  return json(data);
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  return adminFetch('/quote-options', { token });
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handleQuoteOptionsAction({
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
  return runAdminAction(() => handleQuoteOptionsAction({ token, formData }));
}

function OptionForm({ kind, item, onDone }) {
  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      <input type="hidden" name="kind" value={kind} />
      {item?.id ? <input type="hidden" name="editId" value={item.id} /> : null}
      <AdminField label="Label">
        <input className={styles.select} name="name" defaultValue={item?.name || ''} required />
      </AdminField>
      <AdminField label="Sort order">
        <input
          className={styles.select}
          name="sortOrder"
          type="number"
          defaultValue={item?.sort_order || 0}
        />
      </AdminField>
      <AdminButtonRow>
        <Button type="submit">{item?.id ? 'Save' : 'Add'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

function OptionsTable({ title, kind, items, onAdd, onEdit, onDelete }) {
  return (
    <AdminSection title={title}>
      <div className={styles.pageHeaderActions} style={{ marginBottom: 16 }}>
        <Button onClick={onAdd}>Add option</Button>
      </div>
      <AdminTableWrap>
        <table className={`${styles.table} ${styles.tableStacked}`}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td data-label="Label">{item.name}</td>
                <td data-label="Order">{item.sort_order}</td>
                <td data-label="Actions">
                  <AdminButtonRow>
                    <Button secondary type="button" onClick={() => onEdit(item)}>
                      Edit
                    </Button>
                    <Button secondary type="button" onClick={() => onDelete(item)}>
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
  );
}

export default function AdminQuoteOptions() {
  const { projectTypes, budgetRanges } = useLoaderData();
  const actionData = useActionData();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader
        title="Quote form options"
        meta="Project types and budget ranges shown on the quote page"
      />

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Quote option saved successfully.</AdminAlert>}

      <OptionsTable
        title="Project types"
        kind="project-types"
        items={projectTypes}
        onAdd={() => setModal({ kind: 'project-types' })}
        onEdit={item => setModal({ kind: 'project-types', item })}
        onDelete={item => setDeleteTarget({ kind: 'project-types', item })}
      />

      <OptionsTable
        title="Budget ranges"
        kind="budget-ranges"
        items={budgetRanges}
        onAdd={() => setModal({ kind: 'budget-ranges' })}
        onEdit={item => setModal({ kind: 'budget-ranges', item })}
        onDelete={item => setDeleteTarget({ kind: 'budget-ranges', item })}
      />

      <AdminModal
        open={Boolean(modal)}
        title={modal?.item ? 'Edit option' : 'Add option'}
        onClose={() => setModal(null)}
      >
        {modal ? (
          <OptionForm kind={modal.kind} item={modal.item} onDone={() => setModal(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete option?"
        onClose={() => setDeleteTarget(null)}
        footer={
          deleteTarget ? (
            <>
              <Form method="post" className={styles.buttonRow}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="kind" value={deleteTarget.kind} />
                <input type="hidden" name="id" value={deleteTarget.item.id} />
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
          Remove <strong>{deleteTarget?.item?.name}</strong>?
        </Text>
      </AdminModal>
    </>
  );
}
