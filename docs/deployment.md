# Wanderly — Vercel + Supabase production guide

## Current resources

- Supabase project: `wanderly-mongolia` (ap-northeast-2)
- Vercel project: `wanderly-mongolia`
- Git branch: `feat/wanderly-supabase-production`
- Avoid deploying the old `main` branch (that branch still contains V1 SQLite code).

## Supabase

Create only the tables/policies in [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) if provisioning a **fresh** project. The linked Supabase project already has the schema applied. Security Advisor reported zero security lints after setup.

The `wanderly_trips` and `wanderly_ai_usage` tables use Row Level Security based on `auth.uid()`. The journal bucket is **private** and restricts paths to the current user's ID. The Next.js media route always authenticates and downloads under that prefix. No service role or secret Supabase key is required in app code.

### Required Auth dashboard step

In **Supabase Dashboard → Authentication → URL Configuration**, set:
- Site URL to the final app origin.
- Allow redirect URLs for `https://YOUR_DEPLOYMENT_ORIGIN/auth/callback` and your real production URL. Set `http://localhost:3000/auth/callback` only for local development, if used.

Configure email confirmation delivery/template and test a real registration, inbox confirmation, login, sign-out, and second-user isolation. The connector here does not expose the Auth URL configuration operation, so this setting is not automatically modified by the code deployment.

## Vercel environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project HTTPS URL (public).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable project key; never use a secret/service-role key in NEXT_PUBLIC.
- `NEXT_PUBLIC_SITE_URL` — public origin, used for Supabase confirmation callback. Set to the exact deployed origin and redeploy.
- `GROQ_API_KEY` — server-side GroqCloud Free API key for the V4 AI chat and itinerary planner. Add as an encrypted Sensitive variable for Preview; card not required. See [FREE_AI_SETUP.md](FREE_AI_SETUP.md).

Connect Supabase, run the build, create a **Preview** deployment from the Supabase branch, and test sign-up plus full app functionality before promoting to production. Preview deployments may be Vercel Authentication protected.

## AI model costs and safety

V4 AI uses GroqCloud Free with free-tier quota and no paid Gateway fallback. Keep the provider account on **Free**, do not upgrade it. The app enforces a shared 5-per-24-hour quota per signed-in user via a Supabase atomic RPC; GroqCloud independently enforces per-model limits.

AI suggestions are restricted to the curated destinations catalog. Users can review and save a suggestion; road route metrics, live prices, reservations, and weather are **not verified** by the LLM.

## Legacy data

V2 SQLite plus `.wanderly/uploads` were kept untouched in the old branch. They are not automatically imported: do not delete these files before explicit data migration.

## Deployment validation

GitHub CI verifies tests, typecheck, lint, build. Preview HTTP smoke tests verify Home, Explore, Login and unauthenticated `/trips → /login`. A full authenticated end-to-end test and AI inference test must pass before declaring this production-ready. A passing production build alone is not sufficient.
