# Wanderly V4 Atlas — implementation and deployment gates

Branch: feat/wanderly-v4-atlas-experience (base feat/wanderly-supabase-production).

## Design system and fidelity
- User-approved design direction: scenic dark-navy hero with bold lime headings and buttons; staggered photographic travel cards; white discovery; dark sidebar trip workspace; bright budget graphics; mobile five-tab navigation; map-first discovery.
- Source assets: local scenic images in public/images; not an exact reproduction of the concept picture.
- V4 CSS token layer in src/app/wanderly-v4.css over V3. No wholesale import of a third-party registry or unnecessary paid design blocks; reusable React UI with keyboard and reduced-motion support.
- Real screenshots from GitHub Action \`Wanderly V4 Visual QA\` for desktop 1440x900 and mobile 390x844: Home, Explore, Map, Trip, Login. The Trip screenshot uses the same TripLayout React component with seeded preview data, enabled only by WANDERLY_VISUAL_PREVIEW=1 in CI.

## Arbitrary location / map flows
- A signed-in user creates a trip, goes to a day, opens \`Зогсоол нэмэх\`, chooses either one of the curated Mongolian places **or** \`Миний сонгосон газар\`. They may search by name, click anywhere on the real Leaflet map, or manually enter name, latitude and longitude.
- All custom stops are validated with Zod, saved into the owner-scoped Supabase wanderly_trips document, and retain editable title, address, coordinates, time, cost, duration, day and notes.
- The separate public /map view allows guest map exploration and curated pins. Signed-in users can save the selected custom pin into a chosen existing trip/date from the map inspector.
- The default trip map displays OpenStreetMap raster tiles and actual markers, with a schematic fallback if tile loading fails. Tile availability requires network.
- \`GET /api/geo/search?q=\` returns curated place matches without an external key. With GEOAPIFY_API_KEY configured and the user signed in it additionally requests Geoapify's full place geocoding results and enforces an owner-scoped 80/day combined geo-API-use quota.
- \`POST /api/geo/route\` calls Geoapify for real driving/walking/biking/hiking route geometry and the provider's estimated time and distance. It will explicitly return HTTP 503 when key is missing. There is **no fake route line and no guessed road time**; simple distance is separate geodesic information.
- OpenStreetMap attribution is visible. Do not use the public Nominatim server for unbounded autocomplete and do not remove provider attribution. For public high-traffic hosting use a licensed commercial map tile provider; the public OSM tile service has usage expectations.

## Auth, Persistence, AI
- Supabase Auth, Row Level Security, private journal Storage and V3 CRUD remain.
- Critical V3 bug repaired: server action now awaits \`updateTrip\` for stop, expense, journal and move operations before revalidating and redirecting.
- AI gateway Gemini model is wired in a separate assistant page. **Real authenticated inference has not yet been independently E2E verified**. Users may always manually plan any location even when AI is down.
- Existing AI suggested destinations are still curated for hallucination safety. AI output does not guarantee current road conditions, pricing, weather, or a booking.

## Environment and outstanding production gates
- Vercel project: wanderly-mongolia
- Supabase project: wanderly-mongolia, own private project, already applied \`wanderly_geo_usage\` table RLS.
- Required for worldwide name search and provider-backed route: a **real Geoapify account API key** in Vercel as encrypted \`GEOAPIFY_API_KEY\` in Preview/Production. This key is NOT currently connected; map click and manually named coordinates work without it. A free or paid account is subject to provider limits.
- Required before declaring user-ready: Supabase Dashboard Auth URL configuration, email confirmation, successful authenticated create/edit/delete trip with two test users, private image upload/read/delete, and successful live AI Gateway call; verify geo name search and directions once a valid Geoapify key is supplied.
- Current Supabase Security Advisor reports \`Leaked Password Protection Disabled\`; enable leaked-password blocking in Supabase Auth settings when plan permits.
- Current V4 branch is preview-only; do not merge/replace \`main\` or promote to the main production alias until above gates pass.
- API rate limits in application/SQL are not a replacement for hard provider billing budgets.
- Legacy V2 SQLite data is not migrated into Supabase; do not delete it.

## QA commands
\`\`\`bash
bun install --frozen-lockfile
bun test
bun run typecheck
bun run lint
bun run build
\`\`\`
For browser QA start Next.js with WANDERLY_VISUAL_PREVIEW=1 only in isolated development/CI, then run \`node scripts/check-v4-browser.cjs\` against port 3100.
