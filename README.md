# NCSSM Durham TSA Hub

The chapter website, member portal and officer admin panel.

| Folder | What | Live |
|---|---|---|
| `website-frontend/` | Public site + member portal (Next.js) | ncssm-tsa-hub.vercel.app |
| `admin-panel/` | Officer admin panel (Next.js) | ncssm-tsa-hub-admin.vercel.app |
| `backend/` | API (FastAPI on Vercel) + Supabase database | ncssm-tsa-hub-api.vercel.app |

Pushing to `main` deploys all three on Vercel.

## Editing the website (no code needed)

Officers sign in to the admin panel with their NCSSM Google account (they must be listed under **Admins**).
Events, key dates, officers, resources, gallery photos and the announcement bar are all edited there and
show up on the site within about a minute (public API responses are cached on Vercel's CDN for 60 seconds).

New school year: update **Officers** and **Admins**, refresh the whitelist under **Users**, and add the season's
**Key Dates**.

## Local development

```bash
# API (needs backend/.env)
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/uvicorn main:app --reload --port 8000

# Website (port 3000) and admin panel (port 3001); each needs its .env.local
cd website-frontend && npm install && npm run dev
cd admin-panel && npm install && npm run dev -- -p 3001
```

Local `.env` files point at the live database, so be careful with test data.

## Checks

GitHub Actions runs lint, type checks and builds for both Next apps and `pytest` for the API on every push
(`.github/workflows/ci.yml`). Run them locally with `npm run lint && npx tsc --noEmit && npm run build` and
`cd backend && .venv/bin/python -m pytest`. Dependabot opens grouped update PRs monthly; merge them when CI is green.

## Database changes

SQL files in `backend/migrations/` are run by hand in the Supabase SQL editor, in number order.
`migrations.sql` + `004_site_content.sql` create a fresh database from scratch.

## Monitoring

- **Analytics:** Vercel dashboard > ncssm-tsa-hub > Analytics.
- **Error alerts:** Sentry, enabled by setting `NEXT_PUBLIC_SENTRY_DSN` (website) and `SENTRY_DSN` (API) in Vercel.
