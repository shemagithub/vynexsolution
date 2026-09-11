import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import {
  AdminAlert,
  AdminButtonRow,
  AdminField,
  AdminPageHeader,
  AdminSection,
} from '~/layouts/admin/admin-ui';
import { adminFetch } from '~/utils/admin-fetch';
import { runAdminAction } from '~/utils/admin-action';
import { requireAdminClient } from '~/utils/admin-session.client';
import { toWhatsAppNumber } from '~/utils/whatsapp';
import styles from '~/layouts/admin/admin.module.css';
import { LogoSettingsFields } from './logo-settings-fields';
import { handleSettingsAction } from './settings-actions';

function buildSettingsBody(formData) {
  const whatsappRaw = String(formData.get('whatsapp') || '').trim();
  const phoneRaw = String(formData.get('phone') || '').trim();
  const whatsapp = whatsappRaw
    ? `+${toWhatsAppNumber(whatsappRaw)}`
    : phoneRaw
      ? `+${toWhatsAppNumber(phoneRaw)}`
      : '';

  return {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    phone: phoneRaw,
    whatsapp,
    location: String(formData.get('location')),
    url: String(formData.get('url')),
    role: String(formData.get('role')),
    disciplines: String(formData.get('disciplines'))
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    github: String(formData.get('github')),
    linkedin: String(formData.get('linkedin')),
    instagram: String(formData.get('instagram')),
    logoLight: String(formData.get('logoLight') || ''),
    logoDark: String(formData.get('logoDark') || ''),
  };
}

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const settings = await serverAdminFetch('/settings', { env: context.cloudflare?.env, token });
  return json({ settings });
}

export async function clientLoader() {
  const { token } = await requireAdminClient();
  const settings = await adminFetch('/settings', { token });
  return { settings };
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { adminFetch: serverAdminFetch } = await import('~/utils/admin-api.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(async () => {
    const intentResult = await handleSettingsAction({
      token,
      formData,
      env: context.cloudflare?.env,
    });

    if (intentResult) return intentResult;

    await serverAdminFetch('/settings', {
      env: context.cloudflare?.env,
      token,
      method: 'PUT',
      body: buildSettingsBody(formData),
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
    const intentResult = await handleSettingsAction({ token, formData });

    if (intentResult) return intentResult;

    await adminFetch('/settings', {
      token,
      method: 'PUT',
      body: buildSettingsBody(formData),
    });

    return { success: true };
  });
}

export default function AdminSettings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();

  return (
    <>
      <AdminPageHeader title="Site Settings" meta="Contact info, social media, and brand assets" />

      {actionData?.success && <AdminAlert>Settings saved successfully.</AdminAlert>}
      {actionData?.error && <AdminAlert variant="error">{actionData.error}</AdminAlert>}

      <Form method="post" className={`${styles.form} ${styles.formWide}`}>
        <AdminSection title="Company">
          <div className={styles.formRow}>
            <AdminField label="Company name">
              <input className={styles.select} name="name" defaultValue={settings.name || ''} />
            </AdminField>
            <AdminField label="Website URL">
              <input className={styles.select} name="url" defaultValue={settings.url || ''} />
            </AdminField>
          </div>
          <AdminField label="Tagline">
            <input className={styles.select} name="role" defaultValue={settings.role || ''} />
          </AdminField>
          <AdminField label="Disciplines (comma-separated)">
            <input
              className={styles.select}
              name="disciplines"
              defaultValue={(settings.disciplines || []).join(', ')}
            />
          </AdminField>
        </AdminSection>

        <AdminSection title="Contact information">
          <Text secondary size="s">
            These appear on the contact page, footer, and WhatsApp button across the site.
          </Text>
          <div className={styles.formRow}>
            <AdminField label="Email address">
              <input
                className={styles.select}
                name="email"
                type="email"
                defaultValue={settings.email || ''}
                placeholder="hello@example.com"
              />
            </AdminField>
            <AdminField label="Phone number">
              <input
                className={styles.select}
                name="phone"
                type="tel"
                defaultValue={settings.phone || ''}
                placeholder="+250 788 000 000"
              />
            </AdminField>
          </div>
          <div className={styles.formRow}>
            <AdminField label="WhatsApp number">
              <input
                className={styles.select}
                name="whatsapp"
                type="tel"
                defaultValue={settings.whatsapp || ''}
                placeholder="+250 788 000 000"
              />
              <Text secondary size="s">
                Include country code (e.g. +250…). Local numbers like 0788… are converted
                automatically.
              </Text>
            </AdminField>
            <AdminField label="Location">
              <input
                className={styles.select}
                name="location"
                defaultValue={settings.location || ''}
                placeholder="Kigali, Rwanda"
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection title="Social media">
          <Text secondary size="s">
            Enter the username/handle only (not the full URL). Leave blank to hide a network.
          </Text>
          <div className={styles.formRow}>
            <AdminField label="Instagram handle">
              <input
                className={styles.select}
                name="instagram"
                defaultValue={settings.instagram || ''}
                placeholder="vynexsolutions"
              />
            </AdminField>
            <AdminField label="LinkedIn (company slug)">
              <input
                className={styles.select}
                name="linkedin"
                defaultValue={settings.linkedin || ''}
                placeholder="vynex-solutions"
              />
            </AdminField>
          </div>
          <AdminField label="GitHub username">
            <input
              className={styles.select}
              name="github"
              defaultValue={settings.github || ''}
              placeholder="vynexsolutions"
            />
          </AdminField>
        </AdminSection>

        <AdminSection title="Brand assets">
          <LogoSettingsFields logoLight={settings.logoLight} logoDark={settings.logoDark} />
        </AdminSection>

        <AdminButtonRow>
          <Button type="submit">Save settings</Button>
        </AdminButtonRow>
      </Form>
    </>
  );
}
