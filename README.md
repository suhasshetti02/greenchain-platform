## GreenChain Platform

GreenChain is a full-stack (Next.js + Express/Supabase) console that connects donors, receivers/NGOs, and volunteers to redistribute surplus food. The app now ships with a shared auth layer, role-aware dashboards, donation lifecycle management, and verification stubs that simulate blockchain anchoring.

---

## Development Setup

### Frontend (Next.js)

```bash
# from repo root
npm install
npm run dev    # http://localhost:3000
npm run lint   # optional
```

### Backend (Express)

```bash
cd backend
npm install
npm run dev    # http://localhost:3001
```

The frontend expects the backend at `http://localhost:3001` by default (`NEXT_PUBLIC_API_URL`), so run both processes in parallel during local development.

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for REST calls (auth, donations, claims, verify). | `http://localhost:3001` |

### Backend (`backend/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Express port (defaults to `3001`). |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used for server-side queries & storage uploads. |
| `JWT_SECRET` | Secret for signing/verifying auth tokens. |
| `FRONTEND_URL` | Allowed origin for CORS (e.g., `http://localhost:3000`). |

Copy the Supabase SQL and storage migrations in `supabase/migrations/` to your project to match the schema expected by the API.

---

## Core Flows & Endpoints

- **Auth** – `POST /api/auth/register` and `POST /api/auth/login` return `{ token, user }`. Tokens are stored under `greenchain:auth` in `localStorage`, and the frontend automatically redirects donors to `/dashboard/donor` and receivers to `/dashboard/receiver`.
- **Donations** – Donors can create/update/delete listings via `/api/donations` (multipart with optional image upload to the Supabase `donations` bucket). NGOs fetch available donations (`GET /api/donations/available`) sorted by urgency.
- **Claims** – Receivers claim donations via `POST /api/donations/:id/claim`, review their claims at `GET /api/claims/mine`, and update statuses with `PATCH /api/claims/:id` (pending → accepted → completed).
- **Verification** – `GET /api/verify/:eventId` returns verification metadata plus the linked donation. `POST /api/verify/:eventId/verify` simulates a blockchain transaction hash.

---

## Frontend Features

- Shared `AppShell` (Navbar + Sidebar) bound to auth context, with protected dashboards.
- Donor dashboard: per-user stats, soon-to-expire alerts, quick links to manage listings.
- Receiver dashboard: smart-prioritized available donations, claim controls, and logistics workflow.
- Donation list/detail/create pages wired to live APIs, including edit/delete for donors and claim actions for NGOs.
- Verification page aligned with backend response names and manual verification trigger.

---

## Deployment Notes

- `vercel.json` documents the public env vars that must be configured (e.g., `NEXT_PUBLIC_API_URL`).
- `next.config.mjs` lists allowed remote image domains; update it if you change storage/CDN providers.

---

## Useful References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [Supabase JS Docs](https://supabase.com/docs/reference/javascript)
