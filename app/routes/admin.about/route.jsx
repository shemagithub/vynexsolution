import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import {
  AdminAlert,
  AdminButtonRow,
  AdminCard,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
} from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import styles from '~/layouts/admin/admin.module.css';
import {
  HomeAboutImagePanel,
  HomeAboutTextFields,
  useHomeAboutImages,
} from './home-about-fields';
import { handleAboutAction } from './about-actions';

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const data = await serverAdminFetch('/about', { env: context.cloudflare?.env, token });
  return json(data);
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  return adminFetch('/about', { token });
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() => handleAboutAction({ token, formData }));
  if (result.status) return json(result, { status: result.status });
  return json(result);
}

export async function clientAction({ request }) {
  const { token } = await requireAdminClient();
  const formData = await request.formData();
  return runAdminAction(() => handleAboutAction({ token, formData }));
}

function Section({ title, children }) {
  return <AdminSection title={title}>{children}</AdminSection>;
}

export default function AdminAbout() {
  const { page, team, values, technologies } = useLoaderData();
  const actionData = useActionData();
  const { image, imageLarge, onImageChange } = useHomeAboutImages(page?.home);

  return (
    <>
      <AdminPageHeader title="About Us" meta="Page copy, team, values, and homepage image" />

      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}
      {actionData?.success && <AdminAlert>{actionData.message}</AdminAlert>}

      <Section title="Homepage about section">
        <HomeAboutImagePanel home={page?.home} />

        <Form method="post" className={`${styles.form} ${styles.formWide}`} style={{ marginTop: 24 }}>
          <input type="hidden" name="intent" value="save-page" />
          <HomeAboutTextFields
            home={page?.home}
            image={image}
            imageLarge={imageLarge}
            onImageChange={onImageChange}
          />
          <div className={styles.formRow}>
            <label>
              <Text secondary size="s">
                Page title
              </Text>
              <input className={styles.select} name="headerTitle" defaultValue={page?.headerTitle || ''} required />
            </label>
            <label>
              <Text secondary size="s">
                Page description
              </Text>
              <textarea
                className={styles.select}
                name="headerDescription"
                rows={2}
                defaultValue={page?.headerDescription || ''}
                required
              />
            </label>
          </div>
          <label>
            <Text secondary size="s">
              Our story
            </Text>
            <textarea className={styles.select} name="story" rows={4} defaultValue={page?.story || ''} required />
          </label>
          <div className={styles.formRow}>
            <label>
              <Text secondary size="s">
                Mission
              </Text>
              <textarea className={styles.select} name="mission" rows={3} defaultValue={page?.mission || ''} required />
            </label>
            <label>
              <Text secondary size="s">
                Vision
              </Text>
              <textarea className={styles.select} name="vision" rows={3} defaultValue={page?.vision || ''} required />
            </label>
          </div>
          <Button type="submit">Save page content</Button>
        </Form>
      </Section>

      <Section title="Team members">
        <AdminPanel title="Add team member" defaultOpen={false}>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="intent" value="add-team" />
          <div className={styles.formRow}>
            <label>
              <Text secondary size="s">
                Name
              </Text>
              <input className={styles.select} name="name" required />
            </label>
            <label>
              <Text secondary size="s">
                Role
              </Text>
              <input className={styles.select} name="role" required />
            </label>
          </div>
          <label>
            <Text secondary size="s">
              Bio
            </Text>
            <textarea className={styles.select} name="bio" rows={2} required />
          </label>
          <label>
            <Text secondary size="s">
              Sort order
            </Text>
            <input className={styles.select} name="sortOrder" type="number" defaultValue={team.length + 1} />
          </label>
          <Button type="submit">Add team member</Button>
        </Form>
        </AdminPanel>

        <div className={styles.cardGrid}>
          {team.map(member => (
            <AdminCard key={member.id} title={member.name}>
              <Form method="post" className={styles.form}>
                <input type="hidden" name="intent" value="update-team" />
                <input type="hidden" name="id" value={member.id} />
                <label>
                  <Text secondary size="s">
                    Name
                  </Text>
                  <input className={styles.select} name="name" defaultValue={member.name} required />
                </label>
                <label>
                  <Text secondary size="s">
                    Role
                  </Text>
                  <input className={styles.select} name="role" defaultValue={member.role} required />
                </label>
                <label>
                  <Text secondary size="s">
                    Bio
                  </Text>
                  <textarea className={styles.select} name="bio" rows={2} defaultValue={member.bio} required />
                </label>
                <label>
                  <Text secondary size="s">
                    Sort order
                  </Text>
                  <input
                    className={styles.select}
                    name="sortOrder"
                    type="number"
                    defaultValue={member.sort_order ?? 0}
                  />
                </label>
                <AdminButtonRow>
                  <Button type="submit">Save</Button>
                </AdminButtonRow>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="delete-team" />
                <input type="hidden" name="id" value={member.id} />
                <Button secondary type="submit">
                  Delete
                </Button>
              </Form>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Company values">
        <AdminPanel title="Add value" defaultOpen={false}>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="intent" value="add-value" />
          <div className={styles.formRow}>
            <label>
              <Text secondary size="s">
                Title
              </Text>
              <input className={styles.select} name="title" required />
            </label>
            <label>
              <Text secondary size="s">
                Sort order
              </Text>
              <input className={styles.select} name="sortOrder" type="number" defaultValue={values.length + 1} />
            </label>
          </div>
          <label>
            <Text secondary size="s">
              Description
            </Text>
            <textarea className={styles.select} name="description" rows={2} required />
          </label>
          <Button type="submit">Add value</Button>
        </Form>
        </AdminPanel>

        <div className={styles.cardGrid}>
          {values.map(value => (
            <AdminCard key={value.id} title={value.title}>
              <Form method="post" className={styles.form}>
                <input type="hidden" name="intent" value="update-value" />
                <input type="hidden" name="id" value={value.id} />
                <label>
                  <Text secondary size="s">
                    Title
                  </Text>
                  <input className={styles.select} name="title" defaultValue={value.title} required />
                </label>
                <label>
                  <Text secondary size="s">
                    Description
                  </Text>
                  <textarea
                    className={styles.select}
                    name="description"
                    rows={2}
                    defaultValue={value.description}
                    required
                  />
                </label>
                <label>
                  <Text secondary size="s">
                    Sort order
                  </Text>
                  <input
                    className={styles.select}
                    name="sortOrder"
                    type="number"
                    defaultValue={value.sort_order ?? 0}
                  />
                </label>
                <Button type="submit">Save</Button>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="delete-value" />
                <input type="hidden" name="id" value={value.id} />
                <Button secondary type="submit">
                  Delete
                </Button>
              </Form>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Technologies">
        <AdminPanel title="Add technology" defaultOpen={false}>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="intent" value="add-tech" />
          <div className={styles.formRow}>
            <label>
              <Text secondary size="s">
                Technology name
              </Text>
              <input className={styles.select} name="name" required />
            </label>
            <label>
              <Text secondary size="s">
                Sort order
              </Text>
              <input className={styles.select} name="sortOrder" type="number" defaultValue={technologies.length + 1} />
            </label>
          </div>
          <Button type="submit">Add technology</Button>
        </Form>
        </AdminPanel>

        <div className={styles.cardGrid}>
          {technologies.map(tech => (
            <AdminCard key={tech.id} title={tech.name}>
              <Form method="post" className={styles.form}>
                <input type="hidden" name="intent" value="update-tech" />
                <input type="hidden" name="id" value={tech.id} />
                <label>
                  <Text secondary size="s">
                    Name
                  </Text>
                  <input className={styles.select} name="name" defaultValue={tech.name} required />
                </label>
                <label>
                  <Text secondary size="s">
                    Sort order
                  </Text>
                  <input className={styles.select} name="sortOrder" type="number" defaultValue={tech.sort_order ?? 0} />
                </label>
                <Button type="submit">Save</Button>
              </Form>
              <Form method="post">
                <input type="hidden" name="intent" value="delete-tech" />
                <input type="hidden" name="id" value={tech.id} />
                <Button secondary type="submit">
                  Delete
                </Button>
              </Form>
            </AdminCard>
          ))}
        </div>
      </Section>
    </>
  );
}
