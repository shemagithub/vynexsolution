# Vynex Solutions

Official website and CMS for **Vynex Solutions** — a Kigali-based tech agency building web apps, mobile apps, IoT systems, and smart automation.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Remix 2, React 18, Vite, Framer Motion, Three.js |
| Backend | Express, MySQL, JWT auth |
| Admin | Remix `/admin` portal (content, mail, quotes, settings) |
| Deploy | Cloudflare Pages or cPanel static SPA |

## Quick start

### 1. Backend (API + MySQL)

```bash
# Start MySQL + API with Docker
docker compose up -d

# Or run MySQL yourself, then:
cd backend
cp .env.example .env   # edit DB credentials
npm install
npm run db:setup
npm run seed
npm run dev            # http://localhost:4000
```

Default admin (change in production):

- Email: `admin@vynexsolutions.com`
- Password: `admin123` (or `ADMIN_PASSWORD` from env)

### 2. Frontend

```bash
cp .dev.vars.example .dev.vars   # API_URL=http://localhost:4000
npm install
npm run dev                      # http://localhost:7777
```

### 3. Useful scripts

```bash
npm run backend:dev      # Express API
npm run backend:seed     # Re-seed CMS content
npm run build            # Cloudflare / Remix build
npm run build:cpanel     # Static SPA for cPanel
```

## Site pages

- `/` — Home
- `/services`, `/portfolio`, `/pricing`, `/about`
- `/articles`, `/contact`, `/quote`
- `/projects/:slug` — Project detail
- `/admin` — CMS login

## Configuration

Brand and contact defaults live in:

- `app/config.json` — frontend fallbacks
- Backend seed: `backend/src/data/seed-data.js`
- Runtime site settings: Admin → Settings (stored in MySQL)

Environment:

- Frontend: `.dev.vars` / Wrangler vars (`SITE_URL`, `API_URL`)
- Backend: `backend/.env` (see `.env.example`)

## Deploy

**Cloudflare Pages**

```bash
npm run deploy
```

**cPanel**

```bash
npm run build:cpanel
# Upload build/client (or use .cpanel.yml after setting DEPLOYPATH)
```

**Cloudflare Pages / cPanel**

Set frontend `API_URL` to:

```bash
API_URL=https://backend.vynexsoultions.com
```

Point the backend `CORS_ORIGIN` at your live domain (`https://vynexsoultions.com`).


## License

Private — Vynex Solutions. Built on an open Remix portfolio foundation.
