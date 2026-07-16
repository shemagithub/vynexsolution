import { adminFetch } from '~/utils/admin-fetch';

function addressText(list = []) {
  return list.map(item => item.text || item.address).join(', ');
}

function buildComposeDefaults(message, mode) {
  if (!message) return { to: '', subject: '', text: '' };

  if (mode === 'forward') {
    return {
      to: '',
      subject: message.subject?.startsWith('Fwd:') ? message.subject : `Fwd: ${message.subject}`,
      text: `\n\n---------- Forwarded message ----------\nFrom: ${addressText(message.from)}\nDate: ${new Date(message.date).toLocaleString()}\nSubject: ${message.subject}\n\n${message.text}`,
    };
  }

  if (mode === 'reply-all') {
    const recipients = [...(message.to || []), ...(message.cc || [])]
      .map(item => item.address)
      .filter(address => address && address !== message.from?.[0]?.address)
      .join(', ');
    const replyTo = addressText(message.from);
    const subject = message.subject?.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
    const quoted = (message.text || '').replace(/^/gm, '> ');

    return {
      to: replyTo,
      cc: recipients,
      subject,
      text: `\n\n${quoted}`,
      inReplyTo: message.messageId,
      references: [message.messageId, ...(message.references || [])].filter(Boolean).join(' '),
    };
  }

  const replyTo = addressText(message.from);
  const subject = message.subject?.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
  const quoted = (message.text || '').replace(/^/gm, '> ');

  return {
    to: replyTo,
    subject,
    text: `\n\n${quoted}`,
    inReplyTo: message.messageId,
    references: [message.messageId, ...(message.references || [])].filter(Boolean).join(' '),
  };
}

export async function loadMailData({ token, request }) {
  const url = new URL(request.url);
  const folder = url.searchParams.get('folder') || 'INBOX';
  const uid = url.searchParams.get('uid');
  const q = url.searchParams.get('q') || '';
  const view = url.searchParams.get('view');
  const replyUid = url.searchParams.get('reply');
  const replyAllUid = url.searchParams.get('replyAll');
  const forwardUid = url.searchParams.get('forward');

  const status = await adminFetch('/mail/status', { token }).catch(() => ({ configured: false }));

  if (!status.configured) {
    return { configured: false };
  }

  try {
    const [foldersData, listData] = await Promise.all([
      adminFetch('/mail/folders', { token }),
      adminFetch(`/mail/messages?folder=${encodeURIComponent(folder)}&q=${encodeURIComponent(q)}`, {
        token,
      }),
    ]);

    let message = null;
    let composeDefaults = null;

    if (view === 'compose') {
      const sourceUid = replyUid || replyAllUid || forwardUid;
      if (sourceUid) {
        const source = await adminFetch(
          `/mail/messages/${sourceUid}?folder=${encodeURIComponent(folder)}`,
          { token }
        );
        const mode = forwardUid ? 'forward' : replyAllUid ? 'reply-all' : 'reply';
        composeDefaults = buildComposeDefaults(source, mode);
      } else {
        composeDefaults = { to: '', subject: '', text: '' };
      }
    } else if (uid) {
      message = await adminFetch(`/mail/messages/${uid}?folder=${encodeURIComponent(folder)}`, {
        token,
      });
    }

    return {
      configured: true,
      folder,
      q,
      view,
      folders: foldersData.folders,
      account: foldersData.account,
      messages: listData.messages,
      total: listData.total,
      message,
      composeDefaults,
    };
  } catch (error) {
    return {
      configured: true,
      error:
        error?.message ||
        'Unable to load mailbox. If the API and email share a cPanel server, set MAIL_IMAP_HOST=localhost and restart the backend.',
      folder,
      q,
    };
  }
}

export async function handleMailAction({ token, formData }) {
  const intent = String(formData.get('intent'));
  const folder = String(formData.get('folder') || 'INBOX');

  if (intent === 'send') {
    await adminFetch('/mail/send', {
      token,
      method: 'POST',
      body: {
        to: String(formData.get('to')),
        cc: String(formData.get('cc') || ''),
        bcc: String(formData.get('bcc') || ''),
        subject: String(formData.get('subject')),
        text: String(formData.get('text')),
        inReplyTo: String(formData.get('inReplyTo') || '') || undefined,
        references: String(formData.get('references') || '') || undefined,
      },
    });
    return { redirect: `/admin/mail?folder=${encodeURIComponent(folder)}` };
  }

  if (intent === 'draft') {
    await adminFetch('/mail/drafts', {
      token,
      method: 'POST',
      body: {
        to: String(formData.get('to')),
        cc: String(formData.get('cc') || ''),
        bcc: String(formData.get('bcc') || ''),
        subject: String(formData.get('subject')),
        text: String(formData.get('text')),
      },
    });
    return { redirect: `/admin/mail?folder=${encodeURIComponent('Drafts')}` };
  }

  if (intent === 'delete') {
    await adminFetch(`/mail/messages/${formData.get('uid')}?folder=${encodeURIComponent(folder)}`, {
      token,
      method: 'DELETE',
    });
    return { redirect: `/admin/mail?folder=${encodeURIComponent(folder)}` };
  }

  if (intent === 'toggle-star') {
    await adminFetch(`/mail/messages/${formData.get('uid')}?folder=${encodeURIComponent(folder)}`, {
      token,
      method: 'PATCH',
      body: { flagged: formData.get('flagged') === 'true' },
    });
    return {
      redirect: `/admin/mail?folder=${encodeURIComponent(folder)}&uid=${formData.get('uid')}`,
    };
  }

  if (intent === 'mark-unread') {
    await adminFetch(`/mail/messages/${formData.get('uid')}?folder=${encodeURIComponent(folder)}`, {
      token,
      method: 'PATCH',
      body: { seen: false },
    });
    return {
      redirect: `/admin/mail?folder=${encodeURIComponent(folder)}&uid=${formData.get('uid')}`,
    };
  }

  return { success: false, status: 400 };
}
