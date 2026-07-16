const mailState = {
  folder: 'INBOX',
  uid: null,
  view: 'list',
  q: '',
  compose: null,
};

function formatMailDate(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function addressText(list = []) {
  return list.map(item => item.text || item.address).join(', ');
}

function senderName(from = []) {
  const first = from[0];
  if (!first) return 'Unknown';
  return first.name || first.address?.split('@')[0] || 'Unknown';
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function renderMail(api, content) {
  content.innerHTML = '<p class="empty">Loading mail...</p>';

  try {
    const status = await api('/mail/status');
    if (!status.configured) {
      content.innerHTML =
        '<p class="empty">Mail is not configured on the server. Set MAIL_USER and MAIL_PASS in the backend environment, then restart the app.</p>';
      return;
    }

    const [foldersData, listData] = await Promise.all([
      api('/mail/folders'),
      api(
        `/mail/messages?folder=${encodeURIComponent(mailState.folder)}&q=${encodeURIComponent(mailState.q)}`
      ),
    ]);

    if (mailState.view === 'compose') {
      renderCompose(api, content, foldersData);
      return;
    }

    if (mailState.view === 'read' && mailState.uid) {
      const message = await api(
        `/mail/messages/${mailState.uid}?folder=${encodeURIComponent(mailState.folder)}`
      );
      renderRead(api, content, foldersData, message);
      return;
    }

    renderList(content, foldersData, listData);
  } catch (err) {
    content.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

function renderList(content, foldersData, listData) {
  content.innerHTML = `
    <div class="mail-shell">
      <aside class="mail-folders">
        <div class="mail-account">${escapeHtml(foldersData.account || '')}</div>
        ${foldersData.folders
          .map(
            folder => `
          <button type="button" class="mail-folder-btn ${folder.path === mailState.folder ? 'active' : ''}" data-folder="${escapeHtml(folder.path)}">
            ${escapeHtml(folder.label)}
          </button>`
          )
          .join('')}
      </aside>
      <section class="mail-panel">
        <div class="mail-toolbar">
          <button type="button" class="btn-primary" id="mail-compose">Compose</button>
          <input type="search" id="mail-search" placeholder="Search mail" value="${escapeHtml(mailState.q)}" />
          <button type="button" id="mail-refresh">Refresh</button>
        </div>
        <div class="mail-list">
          ${
            listData.messages?.length
              ? listData.messages
                  .map(
                    msg => `
              <button type="button" class="mail-item ${msg.seen ? '' : 'unread'}" data-uid="${msg.uid}">
                <div class="mail-item-top">
                  <strong>${escapeHtml(senderName(msg.from))}</strong>
                  <span>${formatMailDate(msg.date)}</span>
                </div>
                <div class="mail-item-subject">${escapeHtml(msg.subject)}</div>
                <div class="mail-item-preview">${escapeHtml(msg.preview || '')}</div>
              </button>`
                  )
                  .join('')
              : '<p class="empty">No messages in this folder.</p>'
          }
        </div>
      </section>
    </div>`;

  content.querySelector('#mail-compose').onclick = () => {
    mailState.view = 'compose';
    mailState.compose = { to: '', subject: '', text: '' };
    renderMail(window.__adminApi, content);
  };

  content.querySelector('#mail-refresh').onclick = () => {
    mailState.view = 'list';
    renderMail(window.__adminApi, content);
  };

  content.querySelector('#mail-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      mailState.q = e.target.value.trim();
      mailState.view = 'list';
      renderMail(window.__adminApi, content);
    }
  });

  content.querySelectorAll('.mail-folder-btn').forEach(btn => {
    btn.onclick = () => {
      mailState.folder = btn.dataset.folder;
      mailState.uid = null;
      mailState.view = 'list';
      renderMail(window.__adminApi, content);
    };
  });

  content.querySelectorAll('.mail-item').forEach(btn => {
    btn.onclick = () => {
      mailState.uid = btn.dataset.uid;
      mailState.view = 'read';
      renderMail(window.__adminApi, content);
    };
  });
}

function renderRead(api, content, foldersData, message) {
  content.innerHTML = `
    <div class="mail-shell">
      <aside class="mail-folders">
        <div class="mail-account">${escapeHtml(foldersData.account || '')}</div>
        ${foldersData.folders
          .map(
            folder => `
          <button type="button" class="mail-folder-btn ${folder.path === mailState.folder ? 'active' : ''}" data-folder="${escapeHtml(folder.path)}">
            ${escapeHtml(folder.label)}
          </button>`
          )
          .join('')}
      </aside>
      <section class="mail-panel">
        <div class="mail-toolbar">
          <button type="button" id="mail-back">Back</button>
          <button type="button" id="mail-reply">Reply</button>
          <button type="button" class="danger" id="mail-delete">Delete</button>
        </div>
        <article class="mail-read">
          <h3>${escapeHtml(message.subject)}</h3>
          <p class="mail-meta"><strong>From:</strong> ${escapeHtml(addressText(message.from))}</p>
          <p class="mail-meta"><strong>To:</strong> ${escapeHtml(addressText(message.to))}</p>
          <p class="mail-meta"><strong>Date:</strong> ${new Date(message.date).toLocaleString()}</p>
          <div class="mail-body">${escapeHtml(message.text || '').replace(/\n/g, '<br>')}</div>
        </article>
      </section>
    </div>`;

  content.querySelector('#mail-back').onclick = () => {
    mailState.view = 'list';
    mailState.uid = null;
    renderMail(api, content);
  };

  content.querySelector('#mail-reply').onclick = () => {
    const replyTo = addressText(message.from);
    const subject = message.subject?.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
    const quoted = (message.text || '').replace(/^/gm, '> ');
    mailState.view = 'compose';
    mailState.compose = {
      to: replyTo,
      subject,
      text: `\n\n${quoted}`,
      inReplyTo: message.messageId,
      references: [message.messageId, ...(message.references || [])].filter(Boolean).join(' '),
    };
    renderMail(api, content);
  };

  content.querySelector('#mail-delete').onclick = async () => {
    if (!confirm('Move this message to trash?')) return;
    await api(`/mail/messages/${message.uid}?folder=${encodeURIComponent(mailState.folder)}`, {
      method: 'DELETE',
    });
    mailState.view = 'list';
    mailState.uid = null;
    renderMail(api, content);
  };

  content.querySelectorAll('.mail-folder-btn').forEach(btn => {
    btn.onclick = () => {
      mailState.folder = btn.dataset.folder;
      mailState.uid = null;
      mailState.view = 'list';
      renderMail(api, content);
    };
  });
}

function renderCompose(api, content, foldersData) {
  const compose = mailState.compose || { to: '', subject: '', text: '' };

  content.innerHTML = `
    <div class="mail-shell">
      <aside class="mail-folders">
        <div class="mail-account">${escapeHtml(foldersData.account || '')}</div>
        ${foldersData.folders
          .map(
            folder => `
          <button type="button" class="mail-folder-btn ${folder.path === mailState.folder ? 'active' : ''}" data-folder="${escapeHtml(folder.path)}">
            ${escapeHtml(folder.label)}
          </button>`
          )
          .join('')}
      </aside>
      <section class="mail-panel">
        <form id="mail-compose-form" class="mail-compose">
          <div class="mail-toolbar">
            <button type="button" id="mail-back">Cancel</button>
            <button type="submit" class="btn-primary">Send</button>
          </div>
          <label>To<input name="to" required value="${escapeHtml(compose.to || '')}"></label>
          <label>Subject<input name="subject" required value="${escapeHtml(compose.subject || '')}"></label>
          <label>Message<textarea name="text" required>${escapeHtml(compose.text || '')}</textarea></label>
        </form>
      </section>
    </div>`;

  content.querySelector('#mail-back').onclick = () => {
    mailState.view = mailState.uid ? 'read' : 'list';
    renderMail(api, content);
  };

  content.querySelector('#mail-compose-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/mail/send', {
      method: 'POST',
      body: JSON.stringify({
        to: fd.get('to'),
        subject: fd.get('subject'),
        text: fd.get('text'),
        inReplyTo: compose.inReplyTo,
        references: compose.references,
      }),
    });
    mailState.view = 'list';
    mailState.compose = null;
    alert('Message sent.');
    renderMail(api, content);
  };

  content.querySelectorAll('.mail-folder-btn').forEach(btn => {
    btn.onclick = () => {
      mailState.folder = btn.dataset.folder;
      mailState.uid = null;
      mailState.view = 'list';
      renderMail(api, content);
    };
  });
}

export function resetMailState() {
  mailState.folder = 'INBOX';
  mailState.uid = null;
  mailState.view = 'list';
  mailState.q = '';
  mailState.compose = null;
}
