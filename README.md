# Study Guides

Valentino's study-guides site at [valentinoguides.com](https://valentinoguides.com).
Static HTML, CSS, and JavaScript with no build step or server-side application.
Assets are self-hosted. Vercel Web Analytics supplies anonymous, cookieless
visitor counts; the optional feedback form submits to Google Forms.

## Design and public listings

The approved October 22, 2026 design uses near-black, ivory, and muted blue:
dark `#101719 / #f0eadc / #a0bed0`, light `#f3efe6 / #212526 / #34596e`.
Source Serif 4 headings, Source Sans 3 body text, flat class/topic rows, fine
rules, compact controls, and 18px guide prose keep the pages readable.
New visitors start in dark mode; saved `light`, `dark`, and `auto` choices are
respected. Auto follows the system theme and is stored explicitly as `"auto"`.

Public discovery lists the eight Bishop Gorman classes. UC Scout AP Spanish
remains in source data and existing guide/PDF/audio files, but is excluded from
catalogs, search, suggestions, recents, counts, requests, upcoming tests, and
the homepage's no-JavaScript list. Its direct material URLs remain available;
the retained `/spanish` shell currently reports that the class is not on the
site. Do not restore public Spanish listings or delete its files during a sync.

## Files

- `index.html`: homepage shell with Classes, Find a guide, upcoming tests,
  recently opened guides, feedback, and the public `<noscript>` guide list.
- `site-data.js`: source `CLASSES` and `FEATURES`, including retained Spanish
  data. Public filtering lives in `site.js`.
- `site-topics.js`: generated lesson topics for search and class pages.
- `site.js` / `site.css`: homepage and class-page behavior and styles.
- `apush.html`, `physics.html`, `psych.html`, `business.html`, `morality.html`,
  `precalc.html`, `lang.html`, `seminar.html`: public class-page shells.
  `spanish.html` is a retained legacy shell.
- `template/guide-template.html`: canonical standalone guide engine. Copy it
  and edit only the `GUIDE` object for a new guide. The installed Claude skill
  **Valentino Guides Template** provides the authoring workflow.
- Root guide `.html` files and their practice PDFs. Clean URLs omit `.html`:
  `psych-unit-0.html` is served at `/psych-unit-0`.
- `tools/sync-guide-engine.mjs`: rebuilds template-v4 guides while preserving
  their GUIDE data, page metadata, and Spanish translation protection.
- `tools/sync-guides.mjs`: derives page metadata and `site-topics.js` from GUIDE.
  Both tools support `--check`. `template/` and `tools/` are not deployed.
- `vercel.json`: security headers and clean URLs; `404.html`: missing paths.
- `og-image.png`, `og/*.png`, `apple-touch-icon.png`, `favicon.svg`: share cards
  and icons. These retained assets are separate from the page-style rollout.
- `sw.js`, `offline.html`: network-first offline copies of pages already opened.

## Adding or updating a guide

1. Copy the canonical template to `<class>-<topic>.html` at the repo root and
   fill in its `GUIDE` object. Keep study content, definitions, citations,
   answers, and worked steps complete.
2. Add a unit to the correct `CLASSES` entry in `site-data.js`, newest first:
   `{ t: "Unit 2", url: "/precalc-unit-2", added: "2026-10-05" }`.
   Keep printable labels accurate and include `(PDF)`.
3. For a publicly listed guide, add its link to the hand-maintained
   `<noscript>` list in `index.html`. Spanish remains excluded.
4. Run `node tools/sync-guides.mjs`, then both checks below. If changing the
   shared engine, edit the template and rebuild every guide first:

   ```sh
   node tools/sync-guide-engine.mjs
   node tools/sync-guides.mjs
   node tools/sync-guide-engine.mjs --check
   node tools/sync-guides.mjs --check
   ```

5. Follow the content, baseline-preservation, browser interaction, mobile,
   accessibility, PDF, and live verification requirements in [CLAUDE.md](CLAUDE.md).
   Engine changes must preserve each GUIDE block exactly and its parsed object.
6. Commit and push when authorized. Pushing to the deployed branch triggers
   Vercel; verify the deployed URL and actual content before calling it published.

## Upcoming tests

Add `classId`, `title`, `url`, and `test` (`YYYY-MM-DD`) to `FEATURES` in test-date
order. Up next shows unexpired public tests as compact rows with dates. Spanish
is filtered out. Expired entries stop displaying automatically and may remain
in the source data.

## Content rules

Use course names only, with no teacher names or period numbers. Keep the study guides and practice
files in this repository so their core content needs no external login. Source
citations and explicitly authored external resource links are allowed under
[CLAUDE.md](CLAUDE.md)'s URL and content-security rules. Preserve the guide
engine's existing navigation and link behavior.

## Local preview

Use `vercel dev`, or a static server that maps `/name` to `name.html`.
Plain `python3 -m http.server` does not resolve the site's extensionless links.
