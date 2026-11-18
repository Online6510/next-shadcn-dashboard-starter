# Wanderly V3 — Visual QA report

## Design goal
Reference: the Wanderly cinematic travel collage and the V3 visual spec in the existing design starter pack. This is an independent Next.js implementation, not pixel-for-pixel traced artwork.

## Browser-verified screenshots
CI run 44368621913 passed:
- 17 unit/integration tests, typecheck, lint and production build
- V2 interactive browser regression workflow
- V3 Playwright screenshot/theming checks on 1440x900 and 390x844 screens
- Artifact: https://github.com/Online6510/next-shadcn-dashboard-starter/actions/runs/44368621913/artifacts

Routes checked: Home, Explore, Trip, Journal, Budget, rule-based Planner, Appearance.

## Findings from the real screenshots
- Home: full-screen imagery, overlay navigation, two action buttons, fact-based highlights; readable and visually close to cinematic reference. Existing lake imagery was preserved instead of inventing a yurt/horses photograph.
- Explore: strong editorial heading, contextual photograph, soft-bordered filter controls and a high-quality three-column photo gallery. Existing 16-place data and filters preserved.
- Trip: compact photo header, dark forest in-workspace sidebar, daily timeline and map appear together within the first 900px on desktop. On mobile, V2 map/budget tabs remain.
- Journal: scrapbook styles and paper spread exist, but initial screenshot showed too much cover/banner whitespace and paper spread too far below the fold. Follow-up CSS reduces the banner and moves scrapbook higher.
- Budget: data-backed donut is implemented, but initial screenshot targeted the route hash without scrolling the section into view. Follow-up screenshot script now explicitly scrolls to Budget.
- Planner: elegant form/preview with honest rule-based description. No AI API is claimed.
- Appearance: swatch-based theme selector works with reload persistence; large heading reduced after initial screenshot comparison.

## Not claimed
No road routing, public share links, external LLM integration, fabricated user counts/ratings, or multi-user auth. SQLite/upload persistence is unchanged from V2.

## Follow-up QA
Because visual tweaks were committed after the passing run, review the newest workflow after this report. If it passes, inspect the newly generated screenshot artifact for Journal, Budget and mobile. The PR stays draft until manual review.
