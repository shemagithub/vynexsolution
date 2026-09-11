import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { config } from '../config.js';

const FOLDER_LABELS = {
  INBOX: 'Inbox',
  Sent: 'Sent',
  'INBOX.Sent': 'Sent',
  Drafts: 'Drafts',
  'INBOX.Drafts': 'Drafts',
  Trash: 'Trash',
  'INBOX.Trash': 'Trash',
  Junk: 'Spam',
  'INBOX.Junk': 'Spam',
  Spam: 'Spam',
  'INBOX.Spam': 'Spam',
};

const IMAP_CONNECT_TIMEOUT_MS = 12_000;

export function isMailConfigured() {
  return Boolean(config.mail.user && config.mail.pass);
}

function mailNotConfiguredError() {
  const error = new Error(
    'Mail not configured. Add MAIL_USER and MAIL_PASS to backend/.env'
  );
  error.status = 503;
  return error;
}

function tlsOptions() {
  // Shared hosting mail certs often fail strict hostname checks.
  const strict =
    process.env.MAIL_TLS_REJECT_UNAUTHORIZED === 'true' ||
    process.env.MAIL_TLS_REJECT_UNAUTHORIZED === '1';
  return { rejectUnauthorized: strict };
}

function isConnectionError(error) {
  const code = error?.code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'EHOSTUNREACH' ||
    code === 'ECONNRESET' ||
    code === 'EAI_AGAIN' ||
    code === 'ERR_SOCKET_CONNECTION_TIMEOUT' ||
    /econnrefused|etimedout|enotfound|connection timeout|connect econn/i.test(
      `${error?.code || ''} ${error?.message || ''}`
    )
  );
}

export function normalizeMailError(error) {
  if (!error) {
    const unknown = new Error('Mail server error');
    unknown.status = 502;
    return unknown;
  }
  if (error.status) return error;

  if (isConnectionError(error)) {
    const host = config.mail.imapHost;
    const port = config.mail.imapPort;
    const normalized = new Error(
      `Cannot connect to mail server at ${host}:${port}. ` +
        `If this API runs on the same cPanel server as your email, set MAIL_IMAP_HOST=localhost and MAIL_SMTP_HOST=localhost in backend/.env, then restart the app.`
    );
    normalized.status = 503;
    return normalized;
  }

  if (
    error.authenticationFailed ||
    error.code === 'AUTHENTICATIONFAILED' ||
    /invalid credentials|authentication failed|login failed/i.test(error.message || '')
  ) {
    const normalized = new Error('Mail login failed. Check MAIL_USER and MAIL_PASS.');
    normalized.status = 401;
    return normalized;
  }

  const normalized = new Error(error.responseText || error.message || 'Mail server error');
  normalized.status = 502;
  return normalized;
}

function imapHostCandidates() {
  const configured = (config.mail.imapHost || '').trim() || 'localhost';
  const candidates = [configured];
  if (configured !== 'localhost' && configured !== '127.0.0.1') {
    candidates.push('localhost', '127.0.0.1');
  }
  return [...new Set(candidates)];
}

function createImapClient(host = config.mail.imapHost) {
  if (!isMailConfigured()) throw mailNotConfiguredError();

  return new ImapFlow({
    host,
    port: config.mail.imapPort,
    secure: true,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
    logger: false,
    connectionTimeout: IMAP_CONNECT_TIMEOUT_MS,
    greetingTimeout: IMAP_CONNECT_TIMEOUT_MS,
    socketTimeout: 60_000,
    tls: tlsOptions(),
  });
}

function createSmtpTransport() {
  if (!isMailConfigured()) throw mailNotConfiguredError();

  const port = config.mail.smtpPort;
  const configured = (config.mail.smtpHost || '').trim() || 'localhost';
  const hosts =
    configured === 'localhost' || configured === '127.0.0.1'
      ? [configured]
      : [configured, 'localhost', '127.0.0.1'];

  return { hosts: [...new Set(hosts)], port };
}

async function createWorkingSmtpTransport() {
  const { hosts, port } = createSmtpTransport();
  let lastError;

  for (const host of hosts) {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
      connectionTimeout: IMAP_CONNECT_TIMEOUT_MS,
      tls: tlsOptions(),
    });

    try {
      await transport.verify();
      return transport;
    } catch (error) {
      lastError = error;
      try {
        transport.close();
      } catch {
        /* ignore */
      }
      if (!isConnectionError(error)) throw normalizeMailError(error);
    }
  }

  throw normalizeMailError(lastError);
}

function getNotificationRecipient() {
  return config.mail.notifyTo || config.mail.user;
}

function getReplyToAddress() {
  return config.mail.user || config.siteEmail;
}

async function closeImapClient(client) {
  if (!client) return;
  try {
    if (client.usable) {
      await client.logout();
    } else {
      client.close();
    }
  } catch {
    try {
      client.close();
    } catch {
      /* ignore */
    }
  }
}

async function withImap(fn) {
  let lastError;
  const hosts = imapHostCandidates();

  for (const host of hosts) {
    const client = createImapClient(host);
    try {
      await client.connect();
    } catch (error) {
      await closeImapClient(client);
      lastError = error;
      if (!isConnectionError(error)) throw normalizeMailError(error);
      continue;
    }

    try {
      const result = await fn(client);
      await closeImapClient(client);
      return result;
    } catch (error) {
      await closeImapClient(client);
      throw normalizeMailError(error);
    }
  }

  throw normalizeMailError(lastError);
}

function formatAddressList(list = []) {
  return list.map(item => ({
    name: item.name || '',
    address: item.address || '',
    text: item.name ? `${item.name} <${item.address}>` : item.address,
  }));
}

function folderLabel(path) {
  return FOLDER_LABELS[path] || path.replace(/^INBOX\.?/, '') || path;
}

async function formatListMessage(message) {
  let preview = '';
  if (message.source) {
    const parsed = await simpleParser(message.source);
    preview = (parsed.text || parsed.html || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  return {
    uid: message.uid,
    subject: message.envelope?.subject || '(No subject)',
    from: formatAddressList(message.envelope?.from),
    to: formatAddressList(message.envelope?.to),
    date: message.envelope?.date || message.internalDate,
    seen: message.flags?.has('\\Seen') || false,
    flagged: message.flags?.has('\\Flagged') || false,
    preview,
  };
}

function normalizeFolder(path) {
  if (!path) return 'INBOX';
  return path;
}

export async function listMailFolders() {
  return withImap(async client => {
    const mailboxes = await client.list();
    const preferred = ['INBOX', 'Sent', 'Drafts', 'Trash', 'Junk', 'Spam'];
    const folders = mailboxes
      .filter(box => !box.flags?.has('\\Noselect'))
      .map(box => ({
        path: box.path,
        label: folderLabel(box.path),
        special: preferred.some(name => box.path === name || box.path.endsWith(`.${name}`)),
      }))
      .sort((a, b) => {
        const order = name => {
          if (name === 'INBOX') return 0;
          if (name.includes('Sent')) return 1;
          if (name.includes('Draft')) return 2;
          if (name.includes('Trash')) return 3;
          if (name.includes('Junk') || name.includes('Spam')) return 4;
          return 5;
        };
        const diff = order(a.path) - order(b.path);
        return diff !== 0 ? diff : a.label.localeCompare(b.label);
      });

    return {
      account: config.mail.user,
      folders,
    };
  });
}

export async function listMailMessages(folderPath, { limit = 40, page = 1, query = '' } = {}) {
  const folder = normalizeFolder(folderPath);

  return withImap(async client => {
    const lock = await client.getMailboxLock(folder);
    try {
      const total = client.mailbox.exists || 0;
      if (!total) {
        return { folder, total: 0, page, messages: [] };
      }

      let messages = [];

      if (query?.trim()) {
        const uids = await client.search({ text: query.trim() }, { uid: true });
        uids.reverse();
        const slice = uids.slice((page - 1) * limit, page * limit);
        if (!slice.length) {
          return { folder, total: uids.length, page, messages: [] };
        }

        for await (const message of client.fetch(slice.join(','), {
          uid: true,
          envelope: true,
          flags: true,
          internalDate: true,
          source: { start: 0, maxLength: 800 },
        }, { uid: true })) {
          messages.push(await formatListMessage(message));
        }
        messages.sort((a, b) => new Date(b.date) - new Date(a.date));
        return { folder, total: uids.length, page, messages };
      }

      const end = total - (page - 1) * limit;
      const start = Math.max(1, end - limit + 1);
      if (end < 1) {
        return { folder, total, page, messages: [] };
      }

      for await (const message of client.fetch(`${start}:${end}`, {
        uid: true,
        envelope: true,
        flags: true,
        internalDate: true,
        source: { start: 0, maxLength: 800 },
      })) {
        messages.push(await formatListMessage(message));
      }

      messages.reverse();
      return { folder, total, page, messages };
    } finally {
      lock.release();
    }
  });
}

export async function getMailMessage(folderPath, uid) {
  const folder = normalizeFolder(folderPath);

  return withImap(async client => {
    const lock = await client.getMailboxLock(folder);
    try {
      const message = await client.fetchOne(
        Number(uid),
        { source: true, envelope: true, flags: true, internalDate: true },
        { uid: true }
      );

      if (!message) {
        const error = new Error('Message not found');
        error.status = 404;
        throw error;
      }

      const parsed = await simpleParser(message.source);

      if (!message.flags?.has('\\Seen')) {
        await client.messageFlagsAdd({ uid: Number(uid) }, ['\\Seen'], { uid: true });
      }

      return {
        uid: message.uid,
        folder,
        subject: parsed.subject || message.envelope?.subject || '(No subject)',
        from: formatAddressList(parsed.from?.value || message.envelope?.from),
        to: formatAddressList(parsed.to?.value || message.envelope?.to),
        cc: formatAddressList(parsed.cc?.value || message.envelope?.cc),
        bcc: formatAddressList(parsed.bcc?.value || message.envelope?.bcc),
        date: parsed.date || message.envelope?.date || message.internalDate,
        seen: true,
        flagged: message.flags?.has('\\Flagged') || false,
        text: parsed.text || '',
        html: parsed.html || '',
        messageId: parsed.messageId || '',
        inReplyTo: parsed.inReplyTo || '',
        references: parsed.references || [],
        attachments: (parsed.attachments || []).map(file => ({
          filename: file.filename,
          contentType: file.contentType,
          size: file.size,
        })),
      };
    } finally {
      lock.release();
    }
  });
}

export async function updateMailFlags(folderPath, uid, { seen, flagged }) {
  const folder = normalizeFolder(folderPath);

  return withImap(async client => {
    const lock = await client.getMailboxLock(folder);
    try {
      const target = { uid: Number(uid) };
      if (seen === true) await client.messageFlagsAdd(target, ['\\Seen'], { uid: true });
      if (seen === false) await client.messageFlagsRemove(target, ['\\Seen'], { uid: true });
      if (flagged === true) await client.messageFlagsAdd(target, ['\\Flagged'], { uid: true });
      if (flagged === false) await client.messageFlagsRemove(target, ['\\Flagged'], { uid: true });
      return { success: true };
    } finally {
      lock.release();
    }
  });
}

async function resolveTrashFolder(client) {
  const mailboxes = await client.list();
  return (
    mailboxes.find(box => box.path === 'Trash')?.path ||
    mailboxes.find(box => box.path === 'INBOX.Trash')?.path ||
    'Trash'
  );
}

export async function deleteMailMessage(folderPath, uid) {
  const folder = normalizeFolder(folderPath);

  return withImap(async client => {
    const lock = await client.getMailboxLock(folder);
    try {
      const trash = await resolveTrashFolder(client);
      if (folder === trash) {
        await client.messageDelete({ uid: Number(uid) }, { uid: true });
      } else {
        await client.messageMove({ uid: Number(uid) }, trash, { uid: true });
      }
      return { success: true };
    } finally {
      lock.release();
    }
  });
}

export async function sendMailMessage({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  replyTo,
  inReplyTo,
  references,
}) {
  try {
    const transport = await createWorkingSmtpTransport();
    try {
      const info = await transport.sendMail({
        from: `"${config.mail.fromName}" <${config.mail.user}>`,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        text,
        html: html || undefined,
        replyTo,
        inReplyTo,
        references,
      });
      return { success: true, messageId: info.messageId };
    } finally {
      transport.close();
    }
  } catch (error) {
    throw normalizeMailError(error);
  }
}

const BRAND = {
  get name() {
    return config.mail.fromName || 'Vynex Solutions';
  },
  get url() {
    return process.env.SITE_URL || 'https://vynexsoultions.com';
  },
  bg: '#0d0d0f',
  card: '#161619',
  cardBorder: '#2a2a30',
  panel: '#1d1d21',
  accent: '#25d0c4',
  accentSoft: 'rgba(37, 208, 196, 0.14)',
  text: '#f5f5f7',
  textMuted: '#a1a1aa',
  heading: '#ffffff',
};

function renderDetailRows(items = []) {
  return items
    .filter(item => item && item.value)
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.cardBorder};color:${BRAND.textMuted};font-size:13px;letter-spacing:0.04em;text-transform:uppercase;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.cardBorder};color:${BRAND.text};font-size:15px;font-weight:600;vertical-align:top;">${value}</td>
        </tr>`
    )
    .join('');
}

/**
 * Email-client-safe (table-based, inline CSS) layout matching the dark
 * Vynex Solutions web app with its cyan accent.
 */
function renderEmailLayout({ preheader = '', eyebrow, heading, bodyHtml, footerNote }) {
  const siteEmail = getReplyToAddress();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};color:${BRAND.text};-webkit-font-smoothing:antialiased;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:8px 8px 24px;">
              <a href="${BRAND.url}" style="text-decoration:none;color:${BRAND.heading};font-size:22px;font-weight:700;letter-spacing:0.02em;">
                ${escapeHtml(BRAND.name)}<span style="color:${BRAND.accent};">.</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.card};border:1px solid ${BRAND.cardBorder};border-radius:16px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px;background-color:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:36px 36px 32px;">
                    ${
                      eyebrow
                        ? `<p style="margin:0 0 12px;display:inline-block;padding:6px 12px;background-color:${BRAND.accentSoft};color:${BRAND.accent};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;border-radius:999px;">${escapeHtml(eyebrow)}</p>`
                        : ''
                    }
                    <h1 style="margin:0 0 20px;color:${BRAND.heading};font-size:24px;line-height:1.3;font-weight:700;">${escapeHtml(heading)}</h1>
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 8px;color:${BRAND.textMuted};font-size:13px;line-height:1.6;">
              ${
                footerNote
                  ? `<p style="margin:0 0 8px;">${footerNote}</p>`
                  : ''
              }
              <p style="margin:0;">
                ${escapeHtml(BRAND.name)} · <a href="mailto:${siteEmail}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(siteEmail)}</a> · <a href="${BRAND.url}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(BRAND.url.replace(/^https?:\/\//, ''))}</a>
              </p>
              <p style="margin:8px 0 0;color:#6b6b73;">&copy; ${new Date().getFullYear()} ${escapeHtml(BRAND.name)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 16px;color:${BRAND.textMuted};font-size:15px;line-height:1.7;">${text}</p>`;
}

function messageBlock(label, message) {
  return `
    <p style="margin:24px 0 8px;color:${BRAND.heading};font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(label)}</p>
    <div style="background-color:${BRAND.panel};border:1px solid ${BRAND.cardBorder};border-radius:12px;padding:16px 18px;color:${BRAND.text};font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`;
}

export async function sendQuoteConfirmationEmail({
  email,
  projectType,
  budget,
  deadline,
  message,
}) {
  if (!isMailConfigured()) {
    console.warn('Quote confirmation email skipped: mail not configured');
    return { skipped: true };
  }

  const siteEmail = getReplyToAddress();
  const siteName = BRAND.name;
  const budgetText = budget?.trim() || 'Not specified';
  const deadlineText = deadline?.trim() || 'Not specified';

  const text = [
    `Thank you for requesting a quote from ${siteName}.`,
    '',
    'We have received your project details and will review them shortly. Our team aims to get back to you within 48 hours.',
    '',
    'Your request summary:',
    `Project type: ${projectType}`,
    `Budget: ${budgetText}`,
    `Deadline: ${deadlineText}`,
    '',
    'Project description:',
    message,
    '',
    `If you have any questions in the meantime, reply to this email or contact us at ${siteEmail}.`,
    '',
    `— ${siteName}`,
  ].join('\n');

  const bodyHtml = `
    ${paragraph(`Thanks for reaching out! We've received your project details and our team is already reviewing them. Expect to hear back within <strong style="color:${BRAND.text};">48 hours</strong>.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      ${renderDetailRows([
        { label: 'Project type', value: escapeHtml(projectType) },
        { label: 'Budget', value: escapeHtml(budgetText) },
        { label: 'Deadline', value: escapeHtml(deadlineText) },
      ])}
    </table>
    ${messageBlock('Project description', message)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
      <tr>
        <td style="border-radius:10px;background-color:${BRAND.accent};">
          <a href="${BRAND.url}" style="display:inline-block;padding:13px 26px;color:#06201d;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">Visit our website</a>
        </td>
      </tr>
    </table>`;

  const html = renderEmailLayout({
    preheader: 'We received your quote request and will reply within 48 hours.',
    eyebrow: 'Quote received',
    heading: 'Your request is in good hands',
    bodyHtml,
    footerNote: `Have a question? Just reply to this email or contact us at <a href="mailto:${siteEmail}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(siteEmail)}</a>.`,
  });

  return sendMailMessage({
    to: email,
    subject: `We received your quote request — ${siteName}`,
    text,
    html,
    replyTo: siteEmail,
  });
}

export async function sendQuoteAdminNotificationEmail({
  email,
  projectType,
  budget,
  deadline,
  message,
}) {
  if (!isMailConfigured()) {
    console.warn('Quote admin notification skipped: mail not configured');
    return { skipped: true };
  }

  const adminEmail = getNotificationRecipient();
  const budgetText = budget?.trim() || 'Not specified';
  const deadlineText = deadline?.trim() || 'Not specified';

  const text = [
    `Quote request from ${email}`,
    '',
    `Project type: ${projectType}`,
    `Budget: ${budgetText}`,
    `Deadline: ${deadlineText}`,
    '',
    message,
  ].join('\n');

  const bodyHtml = `
    ${paragraph(`A new quote request just came in from <a href="mailto:${escapeHtml(email)}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(email)}</a>.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      ${renderDetailRows([
        { label: 'From', value: `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(email)}</a>` },
        { label: 'Project type', value: escapeHtml(projectType) },
        { label: 'Budget', value: escapeHtml(budgetText) },
        { label: 'Deadline', value: escapeHtml(deadlineText) },
      ])}
    </table>
    ${messageBlock('Project description', message)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
      <tr>
        <td style="border-radius:10px;background-color:${BRAND.accent};">
          <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:13px 26px;color:#06201d;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">Reply to ${escapeHtml(email)}</a>
        </td>
      </tr>
    </table>`;

  const html = renderEmailLayout({
    preheader: `New quote request from ${email} — ${projectType}`,
    eyebrow: 'New quote request',
    heading: 'You have a new quote request',
    bodyHtml,
    footerNote: 'This is an internal notification from your website.',
  });

  return sendMailMessage({
    to: adminEmail,
    subject: `Quote request from ${email} — ${projectType}`,
    text,
    html,
    replyTo: email,
  });
}

export async function sendContactAdminNotificationEmail({ email, message }) {
  if (!isMailConfigured()) {
    console.warn('Contact admin notification skipped: mail not configured');
    return { skipped: true };
  }

  const adminEmail = getNotificationRecipient();

  const text = `From: ${email}\n\n${message}`;

  const bodyHtml = `
    ${paragraph(`New message from your website's contact form.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      ${renderDetailRows([
        { label: 'From', value: `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND.accent};text-decoration:none;">${escapeHtml(email)}</a>` },
      ])}
    </table>
    ${messageBlock('Message', message)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
      <tr>
        <td style="border-radius:10px;background-color:${BRAND.accent};">
          <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:13px 26px;color:#06201d;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">Reply to ${escapeHtml(email)}</a>
        </td>
      </tr>
    </table>`;

  const html = renderEmailLayout({
    preheader: `New contact message from ${email}`,
    eyebrow: 'New message',
    heading: 'New contact form message',
    bodyHtml,
    footerNote: 'This is an internal notification from your website.',
  });

  return sendMailMessage({
    to: adminEmail,
    subject: `Contact message from ${email}`,
    text,
    html,
    replyTo: email,
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function saveDraft({ to, cc, bcc, subject, text, html }) {
  return withImap(async client => {
    const mailboxes = await client.list();
    const draftsPath =
      mailboxes.find(box => box.path === 'Drafts')?.path ||
      mailboxes.find(box => box.path === 'INBOX.Drafts')?.path ||
      'Drafts';

    const lock = await client.getMailboxLock(draftsPath);
    try {
      const raw = [
        `From: ${config.mail.user}`,
        to ? `To: ${to}` : '',
        cc ? `Cc: ${cc}` : '',
        bcc ? `Bcc: ${bcc}` : '',
        `Subject: ${subject || ''}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        '',
        text || '',
      ]
        .filter(Boolean)
        .join('\r\n');

      await client.append(draftsPath, raw, ['\\Draft', '\\Seen']);
      return { success: true };
    } finally {
      lock.release();
    }
  });
}
