# Wanderly AI — Card-free GroqCloud Free tier

Wanderly's AI Chat (`/api/ai/chat`) and structured travel suggestions (`/api/ai/trip`) now use GroqCloud **Free** directly instead of Vercel AI Gateway.

## One-time, card-free setup

1. Create a **Free** GroqCloud account at https://console.groq.com/
2. Create an API key at https://console.groq.com/keys . Do **not** upgrade to Developer or add a payment card.
3. In Vercel Project **wanderly-mongolia → Settings → Environment Variables**, create `GROQ_API_KEY` as a **Sensitive / encrypted server-side** value. Apply to Preview. Apply to Production only when releasing the reviewed branch.
4. Redeploy the feature-branch Preview. Next.js server functions receive the variable at runtime; nothing is exposed in NEXT_PUBLIC.
5. Sign into Wanderly → `/ai`, ask one travel question. Then try `/trips/suggest` for a structured plan.

**Provider:** `openai/gpt-oss-20b` hosted on GroqCloud Free plan. A Free plan has request limits, can be paused/throttled and is not suitable for unlimited commercial public traffic. When quota is exhausted, the app displays an error rather than sending requests to the paid Vercel AI Gateway.

## Security and model scope

- No fallback to Vercel AI Gateway. The existing Vercel OIDC project setting alone cannot trigger paid model usage from these endpoints.
- All keys remain server-side, never committed, logged or passed to clients.
- Shared atomic Supabase quota is 5 per user per rolling 24 h for chat+planner combined.
- Logged-in Supabase users only; structured output is constrained by a strict JSON schema, then checked again with Zod and only approved catalog IDs saved.
- Map click and manual waypoints remain unbounded by the curated AI plan list.
- No model can guarantee real routes, prices, reservations or weather.
- Real model inference requires a valid Free-tier key and is **not confirmed by passing build/tests alone**.

## Verified provider references
- https://console.groq.com/docs/billing-faqs
- https://console.groq.com/docs/models
- https://console.groq.com/docs/structured-outputs

## Billing
Stay on the Free plan. If a service asks for payment, do not upgrade; stop and verify the plan. Provider terms, quotas and model availability may change.
