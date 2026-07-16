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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function handleArticlesAction({ token, formData, env }) {
  const intent = formData.get('intent');
  const fetcher = env
    ? (path, opts) => adminFetch(path, { env, token, ...opts })
    : (path, opts) => adminFetch(path, { token, ...opts });

  if (intent === 'delete') {
    await fetcher(`/articles/${formData.get('slug')}`, { method: 'DELETE' });
    return { success: true };
  }

  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim() || slugify(title);
  const payload = {
    slug,
    title,
    abstract: String(formData.get('abstract') || '').trim(),
    content: String(formData.get('content') || '').trim(),
    published: formData.get('published') === 'on',
  };

  if (!payload.slug || !payload.title || !payload.abstract) {
    const error = new Error('Slug, title, and abstract are required.');
    error.status = 400;
    throw error;
  }

  const editSlug = formData.get('editSlug');
  if (editSlug) {
    await fetcher(`/articles/${editSlug}`, { method: 'PUT', body: payload });
  } else {
    await fetcher('/articles', { method: 'POST', body: payload });
  }

  return { success: true };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const articles = await serverAdminFetch('/articles', {
    env: context.cloudflare?.env,
    token,
  });
  return json({ articles });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const articles = await adminFetch('/articles', { token });
  return { articles };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() =>
    handleArticlesAction({
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
  return runAdminAction(() => handleArticlesAction({ token, formData }));
}

function ArticleForm({ article, onDone }) {
  const isEdit = Boolean(article);

  return (
    <Form method="post" className={styles.form} onSubmit={onDone}>
      {isEdit ? <input type="hidden" name="editSlug" value={article.slug} /> : null}
      <AdminField label="Title">
        <input
          className={styles.select}
          name="title"
          defaultValue={article?.title || ''}
          required
        />
      </AdminField>
      <AdminField label="Slug">
        <input
          className={styles.select}
          name="slug"
          defaultValue={article?.slug || ''}
          placeholder="auto-from-title"
          required={!isEdit}
          readOnly={isEdit}
        />
      </AdminField>
      <AdminField label="Abstract">
        <textarea
          className={styles.select}
          name="abstract"
          rows={3}
          defaultValue={article?.abstract || ''}
          required
        />
      </AdminField>
      <AdminField label="Content (Markdown)">
        <textarea
          className={styles.select}
          name="content"
          rows={12}
          defaultValue={article?.content || ''}
          placeholder="Write the full blog post in Markdown…"
        />
      </AdminField>
      <AdminCheckboxRow>
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={article?.published !== false}
          />{' '}
          Published
        </label>
      </AdminCheckboxRow>
      <AdminButtonRow>
        <Button type="submit">{isEdit ? 'Save article' : 'Add article'}</Button>
        {onDone && (
          <Button secondary type="button" onClick={onDone}>
            Cancel
          </Button>
        )}
      </AdminButtonRow>
    </Form>
  );
}

export default function AdminArticles() {
  const { articles } = useLoaderData();
  const actionData = useActionData();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <>
      <AdminPageHeader title="Blog" meta={`${articles.length} articles`}>
        <Button onClick={() => setAddOpen(true)}>Add article</Button>
      </AdminPageHeader>

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>Article saved successfully.</AdminAlert>}

      {articles.length === 0 ? (
        <p className={styles.empty}>No blog articles yet. Add your first post.</p>
      ) : (
        <AdminTableWrap>
          <table className={`${styles.table} ${styles.tableStacked}`}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.slug}>
                  <td data-label="Title">
                    <strong>{article.title}</strong>
                    {article.abstract ? (
                      <>
                        <br />
                        <Text secondary size="s">
                          {article.abstract.slice(0, 100)}
                          {article.abstract.length > 100 ? '…' : ''}
                        </Text>
                      </>
                    ) : null}
                  </td>
                  <td data-label="Slug">{article.slug}</td>
                  <td data-label="Status">
                    <span
                      className={`${styles.badge} ${
                        article.published ? styles.badgePublished : ''
                      }`}
                    >
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <AdminButtonRow>
                      <Button secondary type="button" onClick={() => setEditTarget(article)}>
                        Edit
                      </Button>
                      <Button secondary type="button" onClick={() => setDeleteTarget(article)}>
                        Delete
                      </Button>
                    </AdminButtonRow>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableWrap>
      )}

      <AdminModal open={addOpen} title="Add article" onClose={() => setAddOpen(false)}>
        <ArticleForm onDone={() => setAddOpen(false)} />
      </AdminModal>

      <AdminModal
        open={Boolean(editTarget)}
        title="Edit article"
        onClose={() => setEditTarget(null)}
      >
        {editTarget ? (
          <ArticleForm article={editTarget} onDone={() => setEditTarget(null)} />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Delete article?"
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
