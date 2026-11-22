
# Class Interactives

Classroom activities built with React. Teachers can create activities using a Builder or Free Entry, save them as .txt files, and share them with pupils.

## Work locally

Use Node 20, as used by the deployment workflow.

    npm ci
    npm start

The development server serves both versions. The first start builds the pinned archive and keeps it in the local dependency cache for later starts. All 36 activities open in the compact Builder by default and include Free Entry for editing the original activity text. Saved activities with a layout the Builder cannot represent open in Free Entry. Use the header link to switch versions at /archive/.

## Check the site

    npx playwright install chromium
    npm run check

Run the browser install once after installing dependencies. The checks run unit tests, build both versions, open every built-in activity example, and exercise authoring, loading, sharing, and archive navigation in Chromium. An interaction suite also plays all 36 activities in the current and archived sites. GitHub Actions runs the same checks for pull requests to main and before deployment from main. For a quicker format and component check, run npm run test:unit.

The homepage uses still images of the live players in public/previews. To refresh them after changing a player or adding an activity, run npm run build followed by node scripts/capture-previews.cjs.

## Deploy

Pushes to main publish both versions at www.classinteractives.co.uk through the GitHub Pages workflow. Maintainers can run npm run deploy to run the same checks and publish manually. The archive is built from commit 558638c with its original lockfile and a small adaptation for the subfolder and return link.

See AGENTS.md for development conventions and docs/activity-audit.md for the activity usability list.
