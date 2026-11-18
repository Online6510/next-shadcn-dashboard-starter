# V2 acceptance results

The baseline at commit 575c49f passed its four tests and production build. V2 passed frozen installation, 17 unit and integration tests, type checking, lint and the production build under Node 22.23.5 and Bun 1.4.4. Lint reports nine warnings in inherited components and parsers.

| Check | Observation |
| --- | --- |
| Browser journey | Search and filter → create trip → add, edit and reorder stops → select map pin → record, edit and delete expense → upload two WebPs → reload → lightbox, edit, remove photo and delete entry → edit/delete trip. The suggested itinerary was also saved and reopened. |
| Money | A 120,000 ₮ expense against 1,500,000 ₮ produced 1,380,000 ₮ remaining after refresh. Editing it to 130,000 ₮ produced 1,370,000 ₮. |
| Media | JPEG and PNG conversion, mismatched formats, corrupt bytes, count limits and partial-batch cleanup tested. A new server process read a photo created by the earlier process. Removed photos returned HTTP 404. |
| Legacy data | V1 demo entries with only the image field render normally. Existing IDs and the SQLite tables are preserved. |
| Map | Tested both directions of timeline/Leaflet selection with tile fixtures. Simulated tile errors restored the schematic. The cloud proxy returned HTTP 403 for live OSM tile access. |
| Responsive | Four core routes checked for horizontal overflow at 360, 390, 430, 768, 1024, 1440 and 1920 px. Production Chromium screenshots at 390×844 and 1440×900 in screenshots/v2/. |
| Accessibility | Automated axe checks for WCAG A/AA rules on six initial route states reported zero violations. Escape closed the lightbox and the mobile menu restored keyboard focus. A full assistive-technology audit is outstanding. |
| Lighthouse | Mobile emulation against local production, home and sample journal: performance 88, accessibility 100, best practices 100 on each measured page. Performance was below the target of 90. |

## Reproduce the browser test

Use a dedicated data directory for the test server. The browser script creates and removes test trips, and captures real screenshots in the repository. Run from the repository root.

```bash
bun install --frozen-lockfile
bun test
bun run typecheck
bun run lint
bun run build
WANDERLY_DATA_DIR=/tmp/wanderly-qa bun run start --hostname 127.0.0.1 --port 3100
```

In a second terminal run `bunx playwright install chromium` if Chromium is not already installed, then `node scripts/check-v2.cjs`. Set `CHROMIUM_PATH` for a system Chromium executable and `WANDERLY_TEST_URL` for another test port.
