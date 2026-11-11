# GreenChain — Food Redistribution Platform

GreenChain is a full-stack food redistribution application that connects donors and receivers/NGOs through donation listing, claiming, pickup, and verification workflows. The current codebase combines a Next.js client, Express API, Supabase PostgreSQL storage, and a separate FastAPI prediction service.

> **Project status:** Full-stack prototype. The repository includes real application routes and database integration, but some integrations and verification behavior remain partial or simulated. It should not be described as a fully deployed blockchain system.

## Features in the codebase

- JWT-based registration and login with role-aware API routes.
- Donation creation, browsing, and claim workflows backed by Supabase.
- Image upload through Supabase Storage.
- Location-aware donation logic using latitude / longitude and distance utilities.
- Priority scoring that attempts to call a local FastAPI prediction endpoint and falls back to rule-based scoring if that service is unavailable.
- Gemini-based food-spoilage guidance with a rule-based fallback.
- WhatsApp / Twilio messaging integration and webhook routes.
- Admin, user, claim, donation, verification, and AI route modules.
- A Next.js frontend and a separate Python FastAPI ML service.

## Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend API | Node.js, Express |
| Database / storage | Supabase PostgreSQL, Supabase Storage |
| Authentication | JWT, bcryptjs |
| ML service | Python, FastAPI, scikit-learn, pandas, NumPy, joblib |
| Generative AI | Gemini API |
| Messaging | Twilio |
| Deployment configuration | AWS / Amplify configuration and service-specific deployment files |

## Architecture

```text
Next.js frontend
    │
    ▼
Express API (default port 3001)
    ├── Supabase PostgreSQL / Storage
    ├── Gemini food-safety guidance
    ├── Twilio WhatsApp integration
    └── FastAPI ML service (default local URL used by controller: localhost:8000)
            └── spoilage-risk prediction
```

The FastAPI prediction service is called by the donation controller using a local URL. For a multi-container or cloud deployment, configure service discovery / the ML service URL rather than assuming `localhost` refers to the other service.

## Repository structure

- `frontend/` — Next.js app.
- `backend/server.js` — Express application entry point.
- `backend/routes/` — API route modules.
- `backend/controllers/` — auth, donation, claim, AI, verification, user, and WhatsApp logic.
- `backend/utils/` — Supabase client, location, and async helpers.
- `backend/*.sql`, `backend/migrations/` — SQL migrations and schema updates.
- `ml_service/` — FastAPI prediction endpoint and model files.
- `amplify.yml` — frontend build configuration.

## Run locally

Configure the required environment variables first. The names documented in the service code include:

- Backend: `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `FRONTEND_URL`, plus JWT and Twilio settings used by the corresponding modules.
- Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.
- ML service: use the model artifact and dependency files included under `ml_service/`.

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

ML service:

```bash
cd ml_service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Check service-specific configuration and SQL migration instructions before connecting to an existing Supabase project. The repository's backend starts the API on port 3001 by default.

## Limitations and security considerations

- The donation controller calls the ML service at a hard-coded local URL and falls back to legacy heuristic priority scoring on failure.
- The ML service output is a model-derived risk / priority estimate, not a certified food-safety determination.
- Gemini spoilage suggestions are general advisory estimates and must not replace food-safety procedures or human inspection.
- The verification workflow currently generates mock transaction hashes; this is not evidence of on-chain verification or a deployed smart contract.
- The frontend stores JWTs in browser-accessible storage in the current implementation; this carries XSS exposure risk. Prefer secure, HttpOnly cookie handling and a suitable CSRF strategy.
- Verify Supabase Row Level Security policies, server-side role checks, upload permissions, and Twilio webhook authentication before production use.
- README / interview-guide claims should be checked against the current route implementations and deployment environment before describing the platform as production-ready.

## License

See repository license and third-party service/model terms.
