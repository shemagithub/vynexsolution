import { adminFetch } from '~/utils/admin-fetch';
import { clearSiteConfigCache } from '~/utils/api';
import { fileToBase64 } from '~/utils/file-base64';

export async function handleSettingsAction({ token, formData, env }) {
  const intent = String(formData.get('intent') || '');

  if (intent === 'upload-logo-light' || intent === 'upload-logo-dark') {
    const variant = intent === 'upload-logo-light' ? 'light' : 'dark';
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: 'Choose an image file to upload.', status: 400 };
    }

    const result = await adminFetch('/settings/logo', {
      env,
      token,
      method: 'POST',
      body: {
        variant,
        data: await fileToBase64(file),
        filename: file.name,
      },
    });

    clearSiteConfigCache();

    return {
      success: true,
      message: `${variant === 'light' ? 'Light mode' : 'Dark mode'} logo uploaded.`,
      variant,
      logoLight: result.logoLight,
      logoDark: result.logoDark,
      uploadedUrl: result.url,
    };
  }

  if (intent === 'remove-logo-light' || intent === 'remove-logo-dark') {
    const variant = intent === 'remove-logo-light' ? 'light' : 'dark';
    const result = await adminFetch(`/settings/logo/${variant}`, {
      env,
      token,
      method: 'DELETE',
    });

    clearSiteConfigCache();

    return {
      success: true,
      message: `${variant === 'light' ? 'Light mode' : 'Dark mode'} logo reset to default.`,
      variant,
      logoLight: result.logoLight,
      logoDark: result.logoDark,
    };
  }

  return null;
}
