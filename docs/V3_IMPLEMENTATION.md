# Wanderly V3 — Visual redesign implementation

**Branch:** feat/wanderly-visual-fidelity-v3
**Base:** feat/wanderly-premium-v2

## Implemented code

- Photographic home hero with translucent top navigation, editorial typography, calls to action, and counters derived from catalog/SQLite (no fabricated user/rating statistics).
- Explore: editorial heading, imagery, photo-focused destination cards; existing search/filters and reset preserved.
- Trip workspace: in-workspace forest-green sidebar, compact photographic header, day timeline and map near the top of desktop viewport. V2 route selection and mobile tabs remain.
- Budget: visual expenditure donut and legend from V2 SQLite budget totals; planned estimates remain distinct from actual expenses; CRUD remains in place.
- Journal: scrapbook styling with paper spread, lightly rotated photo frames, story text and day sections. V2 upload, edit, delete, lightbox, and print code kept.
- Smart planner: visual configuration shell; rule-based algorithm, not AI API.
- Settings: /settings/appearance with three palettes and persisted localStorage choice; early inline theme bootstrap to reduce flash.
- Selective entrance/reveal animation with prefers-reduced-motion support; V2 accessibility features kept.

## What is not claimed

- This version does not invent map routes, remote AI, real tourist ratings, public sharing or multi-user authentication.
- Local SQLite and uploads remain as in V2 and should run on persistent storage.
- A creative mockup is not pixel-perfect browser output: assets and typography respond to device and genuine data.
- Screenshots in docs/screenshots/v2/ document V2, not V3.
- GitHub Actions workflow added here performs checks and creates screenshots as downloadable build artifacts. Until its run is observed passing, CI verification is pending.
- Interactive browser/device screenshot comparison has not been independently executed in the assistant environment; the agent must review screenshots and address defects.

## Verification

Run under Node 22.23.5 and Bun 1.4.4:

    bun install --frozen-lockfile
    bun test
    bun run typecheck
    bun run lint
    bun run build

For browser QA:

    WANDERLY_DATA_DIR=/tmp/wanderly-v3-qa bun run start --hostname 127.0.0.1 --port 3100
    node scripts/check-v2.cjs
    node scripts/check-v3.cjs

If the GitHub Actions workflow succeeds, inspect its wanderly-v3-screenshots artifact before merging. If screenshots differ strongly from references, adjust V3 CSS/UI and rerun checks.
