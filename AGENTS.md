# Class Interactives

- This is a React 18/Create React App site. Use Node 20 as in CI, `npm ci` to install, `npm start` for development, and `npm run check` for the unit and browser checks before finishing a change. Set up Chromium with `npx playwright install chromium`.
- Activity IDs are public identifiers. Preserve existing IDs, query parameters, compressed text, saved `.txt` data markers, media, and any syntax accepted by activity players. Keep examples representative of existing formats. Keep Free Entry available alongside each builder.
- Reuse the site theme and shared controls for authoring and navigation. Keep activity-specific play and layout in the activity component. Verify changes to shared surfaces at phone, tablet, and desktop widths and with keyboard input.
- Keep shared celebrations silent and respect reduced motion. Timers has a separate audible completion cue.
- `main` deploys to GitHub Pages. Verify both the updated site and the pinned legacy snapshot at `/archive/` with `npm run build:site` before releasing. Keep archive changes limited to mounting and navigation compatibility.

- Update the fixtures or browser scenarios when adding an activity or changing its authoring, run, or sharing flow. Keep browser tests independent of public network access. Each activity needs a player scenario in tests/activity-ui.spec.js.
