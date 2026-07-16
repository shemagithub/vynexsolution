import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import {
  AdminAlert,
  AdminButtonRow,
  AdminCheckboxRow,
  AdminField,
  AdminModal,
  AdminPageHeader,
  AdminTableWrap,
} from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';

async function handleProjectsAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const fetcher = env ? (path, opts) => adminFetch(path, { env, token, ...opts }) : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'delete') {
    await fetcher(`/projects/${formData.get('slug')}`, { method: 'DELETE' });
    return { success: true };
  }

  const payload = {
    slug: String(formData.get('slug')),
    category: String(formData.get('category')),
    title: String(formData.get('title')),
    problem: String(formData.get('problem')),
    description: String(formData.get('description')),
    technologies: String(formData.get('technologies'))
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    liveLink: String(formData.get('liveLink')),
    previewImage: String(formData.get('previewImage') || ''),
    roles: String(formData.get('roles'))
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sortOrder: Number(formData.get('sortOrder')) || 0,
  };

  const editSlug = formData.get('editSlug');
  if (editSlug) {
    await fetcher(`/projects/${editSlug}`, { method: 'PUT', body: payload });
  } else {
    await fetcher('/projects', { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const projects = await serverAdminFetch('/projects', { env: context.cloudflare?.env, token });
  return json({ projects });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const projects = await adminFetch('/projects', { token });
  return { projects };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handleProjectsAction({
      token,
      formData,
      env: context.cloudflare?.env,
    })
  );
  if (result.status) {
    return json(result, { status: result.status });
  }
  return json(result);
}

export async function clientAction({ request }) {
  const { token } = await requireAdminClient();
  const formData = await request.formData();
  return runAdminAction(() => handleProjectsAction({ token, formData }));
}

function ProjectForm({ project, onDone }) {
  const isEdit = Boolean(project);

  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      {isEdit ? <input type="hidden" name="editSlug" value={project.slug} /> : null}
      <div className={styles.formRow}>
        <AdminField label="Slug">
          <input
            className={styles.select}
            name="slug"
            defaultValue={project?.slug || ''}
            required
            readOnly={isEdit}
          />
        </AdminField>
        <AdminField label="Category">
          <select className={styles.select} name="category" defaultValue={project?.category || 'web'}>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="iot">IoT</option>
          </select>
        </AdminField>
      </div>
      <AdminField label="Title">
        <input className={styles.select} name="title" defaultValue={project?.title || ''} required />
      </AdminField>
      <AdminField label="Problem">
        <textarea
          className={styles.select}
          name="problem"
          rows={2}
          defaultValue={project?.problem || ''}
          required
        />
      </AdminField>
      <AdminField label="Description">
        <textarea
          className={styles.select}
          name="description"
          rows={3}
          defaultValue={project?.description || ''}
          required
        />
      </AdminField>
      <div className={styles.formRow}>
        <AdminField label="Technologies">
          <input
            className={styles.select}
            name="technologies"
            defaultValue={(project?.technologies || []).join(', ')}
          />
        </AdminField>
        <AdminField label="Live link">
          <input className={styles.select} name="liveLink" defaultValue={project?.liveLink || ''} />
        </AdminField>
      </div>
      <AdminField label="Preview image URL">
        <input
          className={styles.select}
          name="previewImage"
          defaultValue={project?.previewImage || ''}
        />
      </AdminField>
      <AdminField label="Roles">
        <input
          className={styles.select}
          name="roles"
          defaultValue={(project?.roles || []).join(', ')}
        />
      </AdminField>
      <AdminField label="Sort order">
        <input
          className={styles.select}
          name="sortOrder"
          type="number"
          defaultValue={project?.sortOrder || 0}
        />
      </AdminField>
      <AdminCheckboxRow>
        <label>
          <input type="checkbox" name="featured" defaultChecked={project?.featured} /> Featured
        </label>
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={project?.published !== false}
          />{' '}
          Published
        </label>
      </AdminCheckboxRow>
      <AdminButtonRow>
        <Button type="submit">{isEdit ? 'Save project' : 'Add project'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

export default function AdminProjects() {
  const { projects } = useLoaderData();
  const actionData = useActionData();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader title="Projects" meta={`${projects.length} total`}>
        <Button onClick={() => setAddOpen(true)}>Add project</Button>
      </AdminPageHeader>

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Project saved successfully.</AdminAlert>}

      <AdminTableWrap>
        <table className={`${styles.table} ${styles.tableStacked}`}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.slug}>
                <td data-label="Title">
                  <strong>{project.title}</strong>
                  <br />
                  <Text secondary size="s">
                    {project.slug}
                  </Text>
                </td>
                <td data-label="Category">{project.category}</td>
                <td data-label="Status">
                  <span className={`${styles.badge} ${project.published ? styles.badgePublished : ''}`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td data-label="Actions">
                  <AdminButtonRow>
                    <Button secondary type="button" onClick={() => setEditTarget(project)}>
                      Edit
                    </Button>
                    <Button secondary type="button" onClick={() => setDeleteTarget(project)}>
                      Delete
                    </Button>
                  </AdminButtonRow>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableWrap>

      <AdminModal open={addOpen} title="Add project" onClose={() => setAddOpen(false)}>
        <ProjectForm onDone={() => setAddOpen(false)} />
      </AdminModal>

      <AdminModal
        open={Boolean(editTarget)}
        title="Edit project"
        onClose={() => setEditTarget(null)}
      >
        {editTarget ? (
          <ProjectForm project={editTarget} onDone={() => setEditTarget(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete project?"
        onClose={() => setDeleteTarget(null)}
        footer={
          deleteTarget ? (
            <>
              <Form method="post" className={styles.buttonRow}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="slug" value={deleteTarget.slug} />
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
          Remove <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </Text>
      </AdminModal>
    </>
  );
}
