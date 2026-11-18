# Wanderly AI Gateway — Vercel deployment

Wanderly's AI chat and structured itinerary API use AI SDK 7 with the AI Gateway model `google/gemini-2.5-flash-lite` (or `AI_GATEWAY_MODEL`).

## Authentication
Vercel deploys should use the project-scoped automatically refreshed `VERCEL_OIDC_TOKEN`. **Enable "OpenID Connect JSON Web Token generation" in Vercel Project Settings** via `oidcTokenConfig.enabled=true`. The ordinary project environment-variable list does not show this system-injected token. No static provider key or secret is needed on a properly configured Vercel deployment.

For non-Vercel development only, configure an encrypted `AI_GATEWAY_API_KEY` with appropriate spending controls. Never add it to client-side variables, source or docs.

## Validating that AI actually works
- Open /login and sign into a confirmed Supabase account.
- Visit /ai; GET /api/ai/status reveals the logged-in account's quota and whether Gateway credentials exist (configuration alone is not a successful inference).
- Send a short Mongolian travel question; a non-empty reply from the model proves live chat inference.
- Visit /trips/suggest and generate an itinerary; this uses structured output and is separately testable.
- The shared RPC enforces 5 requests per user per rolling 24 hours, including unsuccessful provider requests.
- A 402 means billing credits or configured budget are insufficient; a 403 can require customer verification; a 401 means Gateway OIDC/key authentication is invalid. Check Vercel AI Gateway Logs for the complete reason.
- Every actual model request may incur a small cost. Configure team/project budgets before enabling unrestricted traffic.

Do not publish temporary diagnostic endpoints, API keys, user passwords, or complete model traces. Release production only after real user E2E and Gateway billing checks.
