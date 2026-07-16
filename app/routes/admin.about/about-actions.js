import { adminFetch } from '~/utils/admin-fetch';
import { fileToBase64 } from '~/utils/file-base64';

function buildHomeBody(formData) {
  return {
    title: String(formData.get('homeTitle') || ''),
    tagLabel: String(formData.get('homeTagLabel') || ''),
    paragraph1: String(formData.get('homeParagraph1') || ''),
    paragraph2: String(formData.get('homeParagraph2') || ''),
    image: String(formData.get('homeImage') || ''),
    imageLarge: String(formData.get('homeImageLarge') || ''),
    imageAlt: String(formData.get('homeImageAlt') || ''),
  };
}

export async function handleAboutAction({ token, formData }) {
  const intent = String(formData.get('intent'));

  if (intent === 'save-page') {
    const current = await adminFetch('/about', { token });
    const homeBody = buildHomeBody(formData);

    if (!homeBody.image && current.page?.home?.image) {
      homeBody.image = current.page.home.image;
    }
    if (!homeBody.imageLarge && current.page?.home?.imageLarge) {
      homeBody.imageLarge = current.page.home.imageLarge;
    }

    await adminFetch('/about/page', {
      token,
      method: 'PUT',
      body: {
        headerTitle: String(formData.get('headerTitle')),
        headerDescription: String(formData.get('headerDescription')),
        story: String(formData.get('story')),
        mission: String(formData.get('mission')),
        vision: String(formData.get('vision')),
        home: homeBody,
      },
    });
    return { success: true, message: 'About page content saved.' };
  }

  if (intent === 'upload-home-image') {
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, message: 'Choose an image file to upload.', status: 400 };
    }

    const result = await adminFetch('/about/home-image', {
      token,
      method: 'POST',
      body: {
        data: await fileToBase64(file),
        filename: file.name,
      },
    });

    return {
      success: true,
      message: 'Image saved to database. Refresh the homepage to see it.',
      uploadedUrl: result.url,
      home: result.home,
    };
  }

  if (intent === 'remove-home-image') {
    await adminFetch('/about/home-image', {
      token,
      method: 'DELETE',
    });

    return { success: true, message: 'Custom image removed from database.' };
  }

  if (intent === 'add-team') {
    await adminFetch('/about/team', {
      token,
      method: 'POST',
      body: {
        name: String(formData.get('name')),
        role: String(formData.get('role')),
        bio: String(formData.get('bio')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Team member added.' };
  }

  if (intent === 'update-team') {
    await adminFetch(`/about/team/${formData.get('id')}`, {
      token,
      method: 'PUT',
      body: {
        name: String(formData.get('name')),
        role: String(formData.get('role')),
        bio: String(formData.get('bio')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Team member updated.' };
  }

  if (intent === 'delete-team') {
    await adminFetch(`/about/team/${formData.get('id')}`, {
      token,
      method: 'DELETE',
    });
    return { success: true, message: 'Team member removed.' };
  }

  if (intent === 'add-value') {
    await adminFetch('/about/values', {
      token,
      method: 'POST',
      body: {
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Value added.' };
  }

  if (intent === 'update-value') {
    await adminFetch(`/about/values/${formData.get('id')}`, {
      token,
      method: 'PUT',
      body: {
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Value updated.' };
  }

  if (intent === 'delete-value') {
    await adminFetch(`/about/values/${formData.get('id')}`, {
      token,
      method: 'DELETE',
    });
    return { success: true, message: 'Value removed.' };
  }

  if (intent === 'add-tech') {
    await adminFetch('/about/technologies', {
      token,
      method: 'POST',
      body: {
        name: String(formData.get('name')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Technology added.' };
  }

  if (intent === 'update-tech') {
    await adminFetch(`/about/technologies/${formData.get('id')}`, {
      token,
      method: 'PUT',
      body: {
        name: String(formData.get('name')),
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    return { success: true, message: 'Technology updated.' };
  }

  if (intent === 'delete-tech') {
    await adminFetch(`/about/technologies/${formData.get('id')}`, {
      token,
      method: 'DELETE',
    });
    return { success: true, message: 'Technology removed.' };
  }

  return { success: false, message: 'Unknown action.', status: 400 };
}
