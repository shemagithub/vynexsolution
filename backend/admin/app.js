import { renderMail } from './mail.js';

let token = localStorage.getItem('admin_token');
let currentView = 'overview';
let modalCallback = null;

const API = '/api/admin';

const $ = sel => document.querySelector(sel);
const content = $('#content');
const modal = $('#modal');
const modalBody = $('#modal-body');

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) {
    logout();
    throw new Error('Session expired');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

window.__adminApi = api;

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function logout() {
  token = null;
  localStorage.removeItem('admin_token');
  hide($('#dashboard'));
  show($('#login-screen'));
}

function openModal(fields, onSave) {
  modalBody.innerHTML = fields
    .map(
      f => `
    <label>${f.label}
      ${
        f.type === 'textarea'
          ? `<textarea name="${f.name}" ${f.required ? 'required' : ''}>${f.value || ''}</textarea>`
          : f.type === 'select'
            ? `<select name="${f.name}">${f.options.map(o => `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select>`
            : f.type === 'checkbox'
              ? `<input type="checkbox" name="${f.name}" ${f.value ? 'checked' : ''}>`
              : `<input type="${f.type || 'text'}" name="${f.name}" value="${f.value || ''}" ${f.required ? 'required' : ''}>`
      }
    </label>`
    )
    .join('');
  modalCallback = onSave;
  modal.showModal();
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const errEl = $('#login-error');
  errEl.classList.add('hidden');

  try {
    const data = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    }).then(r => r.json());

    if (data.error) throw new Error(data.error);
    token = data.token;
    localStorage.setItem('admin_token', token);
    $('#user-name').textContent = data.user.name;
    hide($('#login-screen'));
    show($('#dashboard'));
    renderView('overview');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

$('#logout-btn').addEventListener('click', logout);
$('#modal-cancel').addEventListener('click', () => modal.close());
$('#modal-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {};
  fd.forEach((v, k) => {
    const input = modalBody.querySelector(`[name="${k}"]`);
    data[k] = input?.type === 'checkbox' ? input.checked : v;
  });
  if (modalCallback) await modalCallback(data);
  modal.close();
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderView(btn.dataset.view);
  });
});

async function renderView(view) {
  currentView = view;
  const titles = {
    overview: 'Dashboard',
    projects: 'Projects',
    services: 'Services',
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    articles: 'Articles',
    contacts: 'Contact Messages',
    quotes: 'Quote Requests',
    mail: 'Mail',
    settings: 'Site Settings',
  };
  $('#page-title').textContent = titles[view] || view;
  content.innerHTML = '<p class="empty">Loading...</p>';

  try {
    switch (view) {
      case 'overview': return renderOverview();
      case 'projects': return renderProjects();
      case 'services': return renderServices();
      case 'testimonials': return renderTestimonials();
      case 'pricing': return renderPricing();
      case 'articles': return renderArticles();
      case 'contacts': return renderContacts();
      case 'quotes': return renderQuotes();
      case 'mail': return renderMail(api, content);
      case 'settings': return renderSettings();
    }
  } catch (err) {
    content.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

async function renderOverview() {
  const { stats } = await api('/dashboard');
  content.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${stats.projects}</div><div class="label">Projects</div></div>
      <div class="stat-card"><div class="value">${stats.testimonials}</div><div class="label">Testimonials</div></div>
      <div class="stat-card"><div class="value">${stats.newContacts}</div><div class="label">New Messages</div></div>
      <div class="stat-card"><div class="value">${stats.newQuotes}</div><div class="label">New Quotes</div></div>
      <div class="stat-card"><div class="value">${stats.articles}</div><div class="label">Articles</div></div>
    </div>`;
}

async function renderProjects() {
  const projects = await api('/projects');
  content.innerHTML = `
    <div class="toolbar">
      <p>${projects.length} projects</p>
      <button class="btn-primary" id="add-project">Add Project</button>
    </div>
    <table>
      <thead><tr><th>Title</th><th>Category</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${projects
          .map(
            p => `<tr>
          <td><strong>${p.title}</strong><br><small style="color:var(--muted)">${p.slug}</small></td>
          <td>${p.category}</td>
          <td>${p.featured ? '★' : '—'}</td>
          <td><span class="badge ${p.published ? 'published' : 'draft'}">${p.published ? 'Published' : 'Draft'}</span></td>
          <td class="actions">
            <button class="btn-sm edit-project" data-slug="${p.slug}">Edit</button>
            <button class="btn-sm danger delete-project" data-slug="${p.slug}">Delete</button>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  $('#add-project').onclick = () => showProjectForm();
  content.querySelectorAll('.edit-project').forEach(btn => {
    btn.onclick = async () => {
      const p = projects.find(x => x.slug === btn.dataset.slug);
      showProjectForm(p);
    };
  });
  content.querySelectorAll('.delete-project').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete this project?')) {
        await api(`/projects/${btn.dataset.slug}`, { method: 'DELETE' });
        renderProjects();
      }
    };
  });
}

function showProjectForm(project = {}) {
  openModal(
    [
      { label: 'Slug', name: 'slug', value: project.slug, required: true },
      { label: 'Title', name: 'title', value: project.title, required: true },
      {
        label: 'Category',
        name: 'category',
        type: 'select',
        value: project.category || 'web',
        options: [
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' },
          { value: 'iot', label: 'IoT' },
        ],
      },
      { label: 'Problem', name: 'problem', type: 'textarea', value: project.problem, required: true },
      { label: 'Description', name: 'description', type: 'textarea', value: project.description, required: true },
      { label: 'Technologies (comma-separated)', name: 'technologies', value: (project.technologies || []).join(', ') },
      { label: 'Live Link', name: 'liveLink', value: project.liveLink },
      { label: 'Roles (comma-separated)', name: 'roles', value: (project.roles || []).join(', ') },
      { label: 'Sort Order', name: 'sortOrder', type: 'number', value: project.sortOrder || 0 },
      { label: 'Featured', name: 'featured', type: 'checkbox', value: project.featured },
      { label: 'Published', name: 'published', type: 'checkbox', value: project.published !== false },
    ],
    async data => {
      const payload = {
        ...data,
        technologies: data.technologies.split(',').map(s => s.trim()).filter(Boolean),
        roles: data.roles.split(',').map(s => s.trim()).filter(Boolean),
        sortOrder: Number(data.sortOrder),
      };
      if (project.slug) {
        await api(`/projects/${project.slug}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/projects', { method: 'POST', body: JSON.stringify(payload) });
      }
      renderProjects();
    }
  );
}

async function renderTestimonials() {
  const items = await api('/testimonials');
  content.innerHTML = `
    <div class="toolbar">
      <p>${items.length} testimonials</p>
      <button class="btn-primary" id="add-testimonial">Add Testimonial</button>
    </div>
    <div class="card-grid">
      ${items
        .map(
          t => `<div class="card">
        <h3>${t.name}</h3>
        <p>${t.role} · ${'★'.repeat(t.rating)}</p>
        <p>&ldquo;${t.quote}&rdquo;</p>
        <div class="actions">
          <button class="btn-sm edit-testimonial" data-id="${t.id}">Edit</button>
          <button class="btn-sm danger delete-testimonial" data-id="${t.id}">Delete</button>
        </div>
      </div>`
        )
        .join('')}
    </div>`;

  $('#add-testimonial').onclick = () => showTestimonialForm();
  content.querySelectorAll('.edit-testimonial').forEach(btn => {
    btn.onclick = () => showTestimonialForm(items.find(t => t.id == btn.dataset.id));
  });
  content.querySelectorAll('.delete-testimonial').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete?')) {
        await api(`/testimonials/${btn.dataset.id}`, { method: 'DELETE' });
        renderTestimonials();
      }
    };
  });
}

function showTestimonialForm(item = {}) {
  openModal(
    [
      { label: 'Name', name: 'name', value: item.name, required: true },
      { label: 'Role', name: 'role', value: item.role, required: true },
      { label: 'Rating (1-5)', name: 'rating', type: 'number', value: item.rating || 5 },
      { label: 'Quote', name: 'quote', type: 'textarea', value: item.quote, required: true },
      { label: 'Sort Order', name: 'sortOrder', type: 'number', value: item.sort_order || 0 },
      { label: 'Published', name: 'published', type: 'checkbox', value: item.published !== 0 },
    ],
    async data => {
      const payload = { ...data, rating: Number(data.rating), sortOrder: Number(data.sortOrder) };
      if (item.id) {
        await api(`/testimonials/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      }
      renderTestimonials();
    }
  );
}

async function renderPricing() {
  const items = await api('/pricing');
  content.innerHTML = `
    <div class="toolbar">
      <p>${items.length} packages</p>
      <button class="btn-primary" id="add-pricing">Add Package</button>
    </div>
    <div class="card-grid">
      ${items
        .map(
          p => `<div class="card">
        <h3>${p.name}</h3>
        <p><strong>${p.price}</strong></p>
        <p>${p.description}</p>
        <ul style="color:var(--muted);font-size:0.85rem;margin:8px 0 12px;padding-left:18px">
          ${(p.features || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
        <div class="actions">
          <button class="btn-sm edit-pricing" data-id="${p.id}">Edit</button>
          <button class="btn-sm danger delete-pricing" data-id="${p.id}">Delete</button>
        </div>
      </div>`
        )
        .join('')}
    </div>`;

  $('#add-pricing').onclick = () => showPricingForm();
  content.querySelectorAll('.edit-pricing').forEach(btn => {
    btn.onclick = () => showPricingForm(items.find(p => p.id == btn.dataset.id));
  });
  content.querySelectorAll('.delete-pricing').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete?')) {
        await api(`/pricing/${btn.dataset.id}`, { method: 'DELETE' });
        renderPricing();
      }
    };
  });
}

function showPricingForm(item = {}) {
  openModal(
    [
      { label: 'Name', name: 'name', value: item.name, required: true },
      { label: 'Price', name: 'price', value: item.price, required: true },
      { label: 'Description', name: 'description', type: 'textarea', value: item.description, required: true },
      { label: 'Features (one per line)', name: 'features', type: 'textarea', value: (item.features || []).join('\n') },
      { label: 'Sort Order', name: 'sortOrder', type: 'number', value: item.sort_order || 0 },
      { label: 'Published', name: 'published', type: 'checkbox', value: item.published !== 0 },
    ],
    async data => {
      const payload = {
        ...data,
        features: data.features.split('\n').map(s => s.trim()).filter(Boolean),
        sortOrder: Number(data.sortOrder),
      };
      if (item.id) {
        await api(`/pricing/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/pricing', { method: 'POST', body: JSON.stringify(payload) });
      }
      renderPricing();
    }
  );
}

async function renderServices() {
  const { categories, homeServices } = await api('/services');
  content.innerHTML = `
    <h3 style="margin-bottom:16px">Service Categories</h3>
    <div class="card-grid" style="margin-bottom:32px">
      ${categories
        .map(
          c => `<div class="card">
        <h3>${c.title}</h3>
        <ul style="color:var(--muted);font-size:0.85rem;padding-left:18px">
          ${(c.items || []).map(i => `<li>${i}</li>`).join('')}
        </ul>
        <button class="btn-sm edit-category" data-slug="${c.slug}">Edit</button>
      </div>`
        )
        .join('')}
    </div>
    <div class="toolbar">
      <h3>Home Page Services</h3>
      <button class="btn-primary" id="add-home-service">Add Service</button>
    </div>
    <table>
      <thead><tr><th>Title</th><th>Description</th><th>Icon</th><th>Actions</th></tr></thead>
      <tbody>
        ${homeServices
          .map(
            s => `<tr>
          <td>${s.title}</td>
          <td>${s.description}</td>
          <td>${s.icon}</td>
          <td class="actions">
            <button class="btn-sm edit-home-service" data-id="${s.id}">Edit</button>
            <button class="btn-sm danger delete-home-service" data-id="${s.id}">Delete</button>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  content.querySelectorAll('.edit-category').forEach(btn => {
    btn.onclick = () => {
      const c = categories.find(x => x.slug === btn.dataset.slug);
      openModal(
        [
          { label: 'Title', name: 'title', value: c.title, required: true },
          { label: 'Items (one per line)', name: 'items', type: 'textarea', value: (c.items || []).join('\n') },
          { label: 'Sort Order', name: 'sortOrder', type: 'number', value: c.sort_order || 0 },
        ],
        async data => {
          await api(`/services/categories/${c.slug}`, {
            method: 'PUT',
            body: JSON.stringify({
              title: data.title,
              items: data.items.split('\n').map(s => s.trim()).filter(Boolean),
              sortOrder: Number(data.sortOrder),
            }),
          });
          renderServices();
        }
      );
    };
  });

  $('#add-home-service').onclick = () => showHomeServiceForm();
  content.querySelectorAll('.edit-home-service').forEach(btn => {
    btn.onclick = () => showHomeServiceForm(homeServices.find(s => s.id == btn.dataset.id));
  });
  content.querySelectorAll('.delete-home-service').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete?')) {
        await api(`/services/home/${btn.dataset.id}`, { method: 'DELETE' });
        renderServices();
      }
    };
  });
}

function showHomeServiceForm(item = {}) {
  openModal(
    [
      { label: 'Title', name: 'title', value: item.title, required: true },
      { label: 'Description', name: 'description', type: 'textarea', value: item.description, required: true },
      { label: 'Icon', name: 'icon', value: item.icon || '01' },
      { label: 'Sort Order', name: 'sortOrder', type: 'number', value: item.sort_order || 0 },
    ],
    async data => {
      const payload = { ...data, sortOrder: Number(data.sortOrder) };
      if (item.id) {
        await api(`/services/home/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/services/home', { method: 'POST', body: JSON.stringify(payload) });
      }
      renderServices();
    }
  );
}

async function renderArticles() {
  const items = await api('/articles');
  content.innerHTML = `
    <div class="toolbar">
      <p>${items.length} articles</p>
      <button class="btn-primary" id="add-article">Add Article</button>
    </div>
    <table>
      <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${items
          .map(
            a => `<tr>
          <td>${a.title}</td>
          <td>${a.slug}</td>
          <td><span class="badge ${a.published ? 'published' : 'draft'}">${a.published ? 'Published' : 'Draft'}</span></td>
          <td class="actions">
            <button class="btn-sm edit-article" data-slug="${a.slug}">Edit</button>
            <button class="btn-sm danger delete-article" data-slug="${a.slug}">Delete</button>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  $('#add-article').onclick = () => showArticleForm();
  content.querySelectorAll('.edit-article').forEach(btn => {
    btn.onclick = () => showArticleForm(items.find(a => a.slug === btn.dataset.slug));
  });
  content.querySelectorAll('.delete-article').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete?')) {
        await api(`/articles/${btn.dataset.slug}`, { method: 'DELETE' });
        renderArticles();
      }
    };
  });
}

function showArticleForm(item = {}) {
  openModal(
    [
      { label: 'Slug', name: 'slug', value: item.slug, required: true },
      { label: 'Title', name: 'title', value: item.title, required: true },
      { label: 'Abstract', name: 'abstract', type: 'textarea', value: item.abstract, required: true },
      { label: 'Content (Markdown)', name: 'content', type: 'textarea', value: item.content || '' },
      { label: 'Published', name: 'published', type: 'checkbox', value: item.published },
    ],
    async data => {
      if (item.slug) {
        await api(`/articles/${item.slug}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/articles', { method: 'POST', body: JSON.stringify(data) });
      }
      renderArticles();
    }
  );
}

async function renderContacts() {
  const items = await api('/contacts');
  content.innerHTML = `
    <table>
      <thead><tr><th>Email</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${items
          .map(
            c => `<tr>
          <td>${c.email}</td>
          <td style="max-width:300px">${c.message.slice(0, 120)}${c.message.length > 120 ? '...' : ''}</td>
          <td><span class="badge ${c.status === 'new' ? 'new' : ''}">${c.status}</span></td>
          <td>${new Date(c.created_at).toLocaleDateString()}</td>
          <td>
            <select class="status-select" data-id="${c.id}">
              ${['new', 'read', 'replied', 'archived'].map(s => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  content.querySelectorAll('.status-select').forEach(sel => {
    sel.onchange = async () => {
      await api(`/contacts/${sel.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value }),
      });
    };
  });
}

async function renderQuotes() {
  const items = await api('/quotes');
  content.innerHTML = `
    <table>
      <thead><tr><th>Email</th><th>Type</th><th>Budget</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${items
          .map(
            q => `<tr>
          <td>${q.email}</td>
          <td>${q.project_type}</td>
          <td>${q.budget || '—'}</td>
          <td><span class="badge ${q.status === 'new' ? 'new' : ''}">${q.status}</span></td>
          <td>${new Date(q.created_at).toLocaleDateString()}</td>
          <td>
            <select class="status-select" data-id="${q.id}">
              ${['new', 'read', 'quoted', 'archived'].map(s => `<option value="${s}" ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  content.querySelectorAll('.status-select').forEach(sel => {
    sel.onchange = async () => {
      await api(`/quotes/${sel.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value }),
      });
    };
  });
}

async function renderSettings() {
  const settings = await api('/settings');
  content.innerHTML = `
    <form id="settings-form" class="form-grid">
      <div class="form-row">
        <label>Company Name<input name="name" value="${settings.name || ''}"></label>
        <label>Email<input name="email" type="email" value="${settings.email || ''}"></label>
      </div>
      <div class="form-row">
        <label>WhatsApp<input name="whatsapp" value="${settings.whatsapp || ''}"></label>
        <label>Location<input name="location" value="${settings.location || ''}"></label>
      </div>
      <label>Website URL<input name="url" value="${settings.url || ''}"></label>
      <label>Tagline / Role<input name="role" value="${settings.role || ''}"></label>
      <label>Disciplines (comma-separated)<input name="disciplines" value="${(settings.disciplines || []).join(', ')}"></label>
      <div class="form-row">
        <label>GitHub<input name="github" value="${settings.github || ''}"></label>
        <label>LinkedIn<input name="linkedin" value="${settings.linkedin || ''}"></label>
      </div>
      <label>Instagram<input name="instagram" value="${settings.instagram || ''}"></label>
      <button type="submit" class="btn-primary" style="width:fit-content">Save Settings</button>
    </form>`;

  $('#settings-form').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.disciplines = data.disciplines.split(',').map(s => s.trim()).filter(Boolean);
    await api('/settings', { method: 'PUT', body: JSON.stringify(data) });
    alert('Settings saved!');
  };
}

if (token) {
  api('/me')
    .then(data => {
      $('#user-name').textContent = data.user.name;
      hide($('#login-screen'));
      show($('#dashboard'));
      renderView('overview');
    })
    .catch(() => logout());
}
