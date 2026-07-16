import { json, redirect } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigate, useNavigation, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/button';
import { Text } from '~/components/text';
import { AdminAlert } from '~/layouts/admin/admin-ui';
import adminStyles from '~/layouts/admin/admin.module.css';
import { requireAdminClient } from '~/utils/admin-session.client';
import { runAdminAction } from '~/utils/admin-action';
import styles from './mail.module.css';
import { handleMailAction, loadMailData } from './mail-handlers';

const PANEL_BREAKPOINT = 1040;

function usePanelLayout() {
  const [isPanelLayout, setIsPanelLayout] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${PANEL_BREAKPOINT}px)`);
    const update = () => setIsPanelLayout(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isPanelLayout;
}

function formatMailDate(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function addressText(list = []) {
  return list.map(item => item.text || item.address).join(', ');
}

function senderName(from = []) {
  const first = from[0];
  if (!first) return 'Unknown';
  return first.name || first.address?.split('@')[0] || 'Unknown';
}

function senderInitials(from = []) {
  const name = senderName(from);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function accountInitials(email = '') {
  return email.slice(0, 2).toUpperCase();
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

export async function loader({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const data = await loadMailData({ token, request });
  return json(data);
}

export async function clientLoader({ request }) {
  const { token } = await requireAdminClient();
  return loadMailData({ token, request });
}

export async function action({ request, context }) {
  const { requireAdmin } = await import('~/utils/admin-session.server');
  const { token } = await requireAdmin(request, context.cloudflare?.env);
  const formData = await request.formData();
  const result = await runAdminAction(() => handleMailAction({ token, formData }));
  if (result.redirect) {
    return redirect(result.redirect);
  }
  if (result.status) {
    return json(result, { status: result.status });
  }
  return json(result);
}

export async function clientAction({ request }) {
  const { redirect: clientRedirect } = await import('@remix-run/react');
  const { token } = await requireAdminClient();
  const formData = await request.formData();
  const result = await runAdminAction(() => handleMailAction({ token, formData }));
  if (result.redirect) {
    throw clientRedirect(result.redirect);
  }
  return result;
}

export default function AdminMail() {
  const data = useLoaderData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPanelLayout = usePanelLayout();
  const [activePanel, setActivePanel] = useState('list');

  const isComposeEarly = data?.view === 'compose';

  useEffect(() => {
    if (!isPanelLayout || !data?.configured || data?.error) return;
    if (isComposeEarly || data?.message) {
      setActivePanel('detail');
      return;
    }
    setActivePanel('list');
  }, [isPanelLayout, isComposeEarly, data?.message, data?.folder, data?.q, data?.configured, data?.error]);

  if (!data.configured) {
    return (
      <AdminAlert variant="info">
        Mail not configured. Add MAIL_USER and MAIL_PASS to <code>backend/.env</code>, then restart
        the API server.
      </AdminAlert>
    );
  }

  if (data.error) {
    return <AdminAlert variant="error">{data.error}</AdminAlert>;
  }

  const {
    folder,
    q,
    view,
    folders,
    account,
    messages,
    total,
    composeDefaults,
  } = data;
  const busy = navigation.state !== 'idle';
  const activeFolder = folders.find(item => item.path === folder);
  const message = data.message ?? null;
  const isCompose = view === 'compose';

  const folderLink = path => {
    const params = new URLSearchParams();
    params.set('folder', path);
    if (q) params.set('q', q);
    return `/admin/mail?${params.toString()}`;
  };

  const backToList = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('uid');
    params.delete('view');
    params.delete('reply');
    params.delete('replyAll');
    params.delete('forward');
    setActivePanel('list');
    navigate(`/admin/mail?${params.toString()}`);
  };

  const openCompose = () => {
    const params = new URLSearchParams(searchParams);
    params.set('view', 'compose');
    params.delete('uid');
    setActivePanel('detail');
    navigate(`/admin/mail?${params.toString()}`);
  };

  return (
    <div className={styles.mailShell}>
      {busy && <div className={styles.loadingBar} aria-hidden />}

      <div className={styles.mailToolbar}>
        <div className={styles.toolbarPrimary}>
          <Button type="button" className={styles.composeButton} icon="send" onClick={openCompose}>
            Compose
          </Button>
          <label className={styles.folderSelect}>
            <span className={styles.folderSelectLabel}>Folder</span>
            <select
              className={adminStyles.select}
              value={folder}
              onChange={event => {
                const params = new URLSearchParams(searchParams);
                params.set('folder', event.target.value);
                params.delete('uid');
                params.delete('view');
                params.delete('reply');
                params.delete('replyAll');
                params.delete('forward');
                setActivePanel('list');
                navigate(`/admin/mail?${params.toString()}`);
              }}
            >
              {folders.map(item => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Form method="get" className={styles.searchForm}>
          <input type="hidden" name="folder" value={folder} />
          <input
            className={styles.searchInput}
            name="q"
            defaultValue={q}
            placeholder="Search mail"
            aria-label="Search mail"
          />
          {q ? (
            <Link
              to={`/admin/mail?folder=${encodeURIComponent(folder)}`}
              className={styles.clearSearch}
              aria-label="Clear search"
            >
              Clear
            </Link>
          ) : null}
          <Button secondary type="submit" className={styles.searchButton}>
            Search
          </Button>
        </Form>
        {busy ? (
          <Text secondary size="s" className={styles.loadingText}>
            Syncing…
          </Text>
        ) : null}
      </div>

      <div className={styles.panelNav} aria-label="Mail panels">
        <button
          type="button"
          className={styles.panelNavButton}
          data-active={activePanel === 'folders' || undefined}
          onClick={() => setActivePanel('folders')}
        >
          Folders
        </button>
        <button
          type="button"
          className={styles.panelNavButton}
          data-active={activePanel === 'list' || undefined}
          onClick={() => setActivePanel('list')}
        >
          {activeFolder?.label || 'Inbox'}
        </button>
        <button
          type="button"
          className={styles.panelNavButton}
          data-active={activePanel === 'detail' || undefined}
          onClick={() => setActivePanel('detail')}
          disabled={!message && !isCompose}
        >
          {isCompose ? 'Compose' : message ? 'Read' : 'Message'}
        </button>
      </div>

      <div className={styles.mailLayout} data-active-panel={activePanel}>
        <aside className={styles.mailFolders}>
          <div className={styles.accountChip}>
            <span className={styles.accountAvatar} aria-hidden>
              {accountInitials(account)}
            </span>
            <span className={styles.accountEmail}>{account}</span>
          </div>
          <p className={styles.foldersTitle}>Folders</p>
          {folders.map(item => (
            <Link
              key={item.path}
              to={folderLink(item.path)}
              className={styles.folderButton}
              data-active={folder === item.path || undefined}
              onClick={() => setActivePanel('list')}
            >
              {item.label}
            </Link>
          ))}
        </aside>

        <section className={styles.mailList}>
          <div className={styles.listHeader}>
            <h2 className={styles.listHeaderTitle}>{activeFolder?.label || 'Inbox'}</h2>
            <span className={styles.listHeaderMeta}>
              {total} message{total === 1 ? '' : 's'}
              {q ? ` · “${q}”` : ''}
            </span>
          </div>
          <div className={styles.messageList}>
            {messages.length === 0 ? (
              <div className={styles.listEmpty}>
                <div className={styles.emptyIcon} aria-hidden>
                  ✉
                </div>
                <p className={styles.emptyTitle}>No messages</p>
                <p className={styles.emptyText}>This folder is empty. Try another folder or compose a new email.</p>
              </div>
            ) : (
              messages.map(item => {
                const params = new URLSearchParams(searchParams);
                params.set('folder', folder);
                params.set('uid', String(item.uid));
                params.delete('view');
                params.delete('reply');
                params.delete('replyAll');
                params.delete('forward');
                return (
                  <Link
                    key={item.uid}
                    to={`/admin/mail?${params.toString()}`}
                    className={styles.messageRow}
                    data-active={message?.uid === item.uid || undefined}
                    data-unread={!item.seen || undefined}
                    onClick={() => setActivePanel('detail')}
                  >
                    <span className={styles.messageAvatar} aria-hidden>
                      {senderInitials(item.from)}
                    </span>
                    <div className={styles.messageContent}>
                      <div className={styles.messageRowTop}>
                        <span className={styles.messageFromName}>
                          <span className={styles.unreadDot} aria-hidden />
                          {item.flagged ? <span className={styles.starIcon}>★</span> : null}
                          <span className={styles.messageFromText}>
                            {senderName(item.from)}
                          </span>
                        </span>
                        <span className={styles.messageDate}>{formatMailDate(item.date)}</span>
                      </div>
                      <div className={styles.messageSubject}>{item.subject}</div>
                      {item.preview ? (
                        <div className={styles.messagePreview}>{item.preview}</div>
                      ) : null}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className={styles.mailDetail}>
          {(message || isCompose) && (
            <div className={styles.panelBack}>
              <button type="button" className={styles.panelBackButton} onClick={backToList}>
                ← Back to messages
              </button>
            </div>
          )}

          {isCompose ? (
            <Form method="post" className={styles.composePanel}>
              <div className={styles.composeHeader}>
                <h2 className={styles.composeTitle}>New message</h2>
              </div>
              <input type="hidden" name="folder" value={folder} />
              <input type="hidden" name="inReplyTo" value={composeDefaults?.inReplyTo || ''} />
              <input type="hidden" name="references" value={composeDefaults?.references || ''} />
              <div className={styles.composeFields}>
                <div className={styles.composeFieldRow}>
                  <span className={styles.composeLabel}>To</span>
                  <input
                    className={styles.composeInput}
                    name="to"
                    placeholder="Recipients"
                    defaultValue={composeDefaults?.to || ''}
                    required
                  />
                </div>
                <div className={styles.composeFieldRow}>
                  <span className={styles.composeLabel}>Cc</span>
                  <input
                    className={styles.composeInput}
                    name="cc"
                    placeholder="Optional"
                    defaultValue={composeDefaults?.cc || ''}
                  />
                </div>
                <div className={styles.composeFieldRow}>
                  <span className={styles.composeLabel}>Bcc</span>
                  <input className={styles.composeInput} name="bcc" placeholder="Optional" />
                </div>
                <div className={styles.composeFieldRow}>
                  <span className={styles.composeLabel}>Subject</span>
                  <input
                    className={styles.composeInput}
                    name="subject"
                    placeholder="Subject line"
                    defaultValue={composeDefaults?.subject || ''}
                    required
                  />
                </div>
              </div>
              <textarea
                className={styles.composeBody}
                name="text"
                placeholder="Write your message…"
                defaultValue={composeDefaults?.text || ''}
                required
              />
              <div className={styles.composeFooter}>
                <Button type="submit" name="intent" value="send" icon="send">
                  Send
                </Button>
                <Button secondary type="submit" name="intent" value="draft">
                  Save draft
                </Button>
                <Button secondary type="button" onClick={backToList}>
                  Discard
                </Button>
              </div>
            </Form>
          ) : message ? (
            <>
              <div className={styles.detailHeader}>
                <div className={styles.detailTop}>
                  <span className={styles.detailAvatar} aria-hidden>
                    {senderInitials(message.from)}
                  </span>
                  <div className={styles.detailTopContent}>
                    <h2 className={styles.detailSubject}>{message.subject}</h2>
                    <div className={styles.detailMeta}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>From</span>
                        <span className={styles.metaValue}>{addressText(message.from)}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>To</span>
                        <span className={styles.metaValue}>{addressText(message.to)}</span>
                      </div>
                      {message.cc?.length > 0 ? (
                        <div className={styles.metaRow}>
                          <span className={styles.metaLabel}>Cc</span>
                          <span className={styles.metaValue}>{addressText(message.cc)}</span>
                        </div>
                      ) : null}
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Date</span>
                        <span className={styles.metaValue}>
                          {new Date(message.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.detailActions}>
                  <Button
                    secondary
                    href={`/admin/mail?view=compose&folder=${encodeURIComponent(folder)}&reply=${message.uid}`}
                    icon="arrow-right"
                    onClick={() => setActivePanel('detail')}
                  >
                    Reply
                  </Button>
                  <Button
                    secondary
                    href={`/admin/mail?view=compose&folder=${encodeURIComponent(folder)}&replyAll=${message.uid}`}
                    onClick={() => setActivePanel('detail')}
                  >
                    Reply all
                  </Button>
                  <Button
                    secondary
                    href={`/admin/mail?view=compose&folder=${encodeURIComponent(folder)}&forward=${message.uid}`}
                    onClick={() => setActivePanel('detail')}
                  >
                    Forward
                  </Button>
                  <Form method="post" className={styles.detailActionForm}>
                    <input type="hidden" name="intent" value="toggle-star" />
                    <input type="hidden" name="folder" value={folder} />
                    <input type="hidden" name="uid" value={message.uid} />
                    <input
                      type="hidden"
                      name="flagged"
                      value={message.flagged ? 'false' : 'true'}
                    />
                    <Button secondary type="submit">
                      {message.flagged ? 'Unstar' : 'Star'}
                    </Button>
                  </Form>
                  <Form method="post" className={styles.detailActionForm}>
                    <input type="hidden" name="intent" value="mark-unread" />
                    <input type="hidden" name="folder" value={folder} />
                    <input type="hidden" name="uid" value={message.uid} />
                    <Button secondary type="submit">
                      Mark unread
                    </Button>
                  </Form>
                  <Form method="post" className={styles.detailActionForm}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="folder" value={folder} />
                    <input type="hidden" name="uid" value={message.uid} />
                    <Button secondary type="submit">
                      Delete
                    </Button>
                  </Form>
                </div>
              </div>
              <div className={styles.detailBody}>
                <div className={styles.detailBodyInner}>
                  {message.html ? (
                    <div
                      className={styles.detailBodyHtml}
                      dangerouslySetInnerHTML={{ __html: message.html }}
                    />
                  ) : (
                    <pre className={styles.detailBodyText}>{message.text || '(No content)'}</pre>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <div className={styles.emptyIcon} aria-hidden>
                📬
              </div>
              <h3 className={styles.emptyTitle}>Select a message</h3>
              <p className={styles.emptyText}>
                Choose an email from the list or tap Compose to write a new one.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
