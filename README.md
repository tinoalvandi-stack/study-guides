# Study Guides

Valentino's study-guides site. Replaces the old Linktree. Static pages, no
build step, no backend, no third-party scripts. There is nothing to breach
because nothing runs server-side and nothing loads from anywhere else. Visitor
counts come from Vercel Web Analytics: cookieless, anonymous, served from this
domain.

## Files

- `index.html`: the homepage shell (search, up next, the class catalog,
  feedback, and a `<noscript>` list of every guide).
- `site-data.js`: the data. `CLASSES` (the eight classes, their welcome pages
  and units) and `FEATURES` (upcoming tests).
- `site.js` / `site.css`: render and style the homepage and the class pages.
- `apush.html`, `physics.html`, `psych.html`, `business.html`, `morality.html`,
  `precalc.html`, `lang.html`, `seminar.html`: one welcome page per class.
- `vercel.json`: security headers plus clean URLs. Vercel serves the rest as-is.
- `404.html`: served for any path that does not exist.
- `og-image.png`, `apple-touch-icon.png`, `favicon.svg`: share card and icons.
- One `.html` file per guide at the repo root (`psych-unit-0.html`,
  `morality-ch1-2.html`, ...). The filename is the URL: `/psych-unit-0`.
  Practice-test PDFs sit beside them.
- `template/guide-template.html`: the starting file for a new guide. Copy it,
  fill in the `GUIDE` object, save at the root. It is listed in
  `.vercelignore`, so it is not served.

## Adding a guide

1. Drop the guide's HTML file at the repo root, named `<class>-<topic>.html`.
2. In `site-data.js`, add one unit to the right class in `CLASSES`, newest
   first: `{ t: "Unit 2", url: "/precalc-unit-2", added: "2026-10-05" }`.
   The homepage catalog and the class page update on their own.
3. Add the same link to the `<noscript>` list near the bottom of `index.html`.
4. Commit. Vercel redeploys on its own in under a minute.

## New test coming up

Add an entry to the `FEATURES` array in `site-data.js`, in test-date order:
`classId`, `title`, `url`, and `test` as `YYYY-MM-DD`. Up next shows a card for
every test that has not passed, soonest first, and each drops off on its own.

## Rules baked in

- Course names only. No teacher names, no period numbers, anywhere.
- Every guide is a file in this repo. Nothing links out to Claude, Google
  Docs, or any other host, so no guide can expire, move, or hit a login wall.
- Guide links open in a new tab with `rel="noopener noreferrer"`.

## Local preview

`vercel dev`, or any static server that maps `/name` to `name.html` (the site
uses clean URLs).
