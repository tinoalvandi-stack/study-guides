# valentinoguides.com

Static study-guides site. No build step, no backend, no dependencies, no
third-party scripts. Vercel serves the files as-is and redeploys on push to
`main`, usually under a minute.

Repo: `tinoalvandi-stack/study-guides` · Live: https://valentinoguides.com

## Layout

- `index.html` — the entire site. Design, data, search, and theming all live
  in this one file.
- `vercel.json` — security headers and `cleanUrls`. A guide at `foo.html` is
  served at `/foo`, so links never carry the extension.
- `404.html` — any path that does not exist.
- `og-image.png` — link preview card. Its URL in `index.html` is absolute and
  points at valentinoguides.com.
- `apple-touch-icon.png`, `favicon.svg` — home screen and tab icons. The mark is a
  serif "v" with an amber full stop; the "v" is an outline traced from Instrument
  Serif, so it needs no font to render.
- `fonts/` — Instrument Serif and Instrument Sans, self-hosted woff2 (latin
  subset). The CSP allows `font-src 'self'` only; never link Google Fonts.
- Individual guides: one `.html` file per guide at the repo root
  (`psych-unit-0.html`, `precalc-vectors.html`, …). Practice tests ship as
  `.pdf` beside them.
- `_staging/` — untracked scratch. Never commit it.

## Adding a guide

1. Drop the guide's HTML file at the repo root. Name it
   `<class>-<topic>.html`, lowercase, hyphens only. That filename becomes the
   URL: `precalc-vectors.html` → `/precalc-vectors`.
2. Add a unit to the class's `units` array in `CLASSES` in `index.html`,
   newest first:

   ```js
   { t: "Unit 2", url: "/precalc-unit-2", added: "2026-09-20",
     extras: [ { kind: "cram", t: "cram sheet", url: "/precalc-unit-2-cram" },
               { kind: "pdf",  t: "practice a", url: "/precalc-unit-2-practice-a.pdf" } ] }
   ```

   One unit = one row. `extras` are optional chips on that row; `kind` is
   `cram`, `pdf` or `quiz`. `added` drives the "new" tag for seven days. A class
   with no units is kept for its color and glyph but does not show.
3. **Add the same link to the `<noscript>` block near the bottom of
   `index.html`.** That list is hand-maintained, not generated from `CLASSES`.
   Forgetting it is the easy mistake: the site looks fine, but the no-JS and
   crawler view silently misses the guide.
4. Commit and push. Vercel handles the rest.

## Featuring an upcoming test

Add to the `FEATURES` array at the top of the script, in test-date order:

```js
{ classId: "pre", title: "Vectors & trig equations study guide", url: "/precalc-vectors-icf-trig-eq",
  test: "2026-09-04", note: "the test covers sections 6.1 to 6.3 and the unit circle" }
```

The "up next" card shows the soonest test that has not passed; the others list
under it as "also coming up". `note` (optional) is one line on what the test
covers. `end` (optional) is the last day of a multi-day test. Expired entries
drop off on their own; leave them in the array.

## Design system: "stone" (September 2026)

- Type: Instrument Serif for display (one weight, 400, so never ask it for bold)
  and Instrument Sans for everything else. One scale: 12 / 13 / 15 / 16 / 20 /
  26 / 42. Instrument Sans has a narrow space, so body text carries
  `word-spacing: .05em` and serif headings `.08em`.
- Color tokens live in the three blocks at the top of `index.html`: `--paper`
  (page), `--surface` / `--surface2` (cards, nested rows), `--line` / `--line2`
  (hairlines), `--ink` / `--ink2` / `--ink3` (text), `--accent` (navy in light,
  amber in dark: the mark and focus rings), `--hi` (amber highlights), and one
  muted `--c-<id>` per class. Every text token is checked at 4.5:1 or better on
  the surface it sits on. Change all three blocks together.
- Corners: cards 14px, buttons 10px, chips 8px. No ambient glow, no backdrop
  blur, no gloss. Surfaces are flat with a 1px line; shadows only on the search
  results and the feedback card.
- Class marks are line icons in the class color, no tiles.
- Buttons are ink on paper (and paper on ink in dark mode). The class color only
  appears in labels, icons and the date chip.

## Homepage features

- Search is the field under the intro. It filters in place; `/` or ⌘K focus it.
- "Recently opened" and remembered open classes live in the viewer's
  localStorage. Nothing leaves the browser.
- Share on every unit uses the native share sheet, or copies the link.
- Class names may carry the teacher's surname in parentheses when a class has
  several sections at school, e.g. `Catholic Morality (Rinaldo)`. That is the
  only place a teacher is named.

## Guide pages themselves

Each guide is a standalone self-contained HTML file. Conventions that must
hold, because they are what the site's readers rely on:

- Body text at full contrast (white on dark). Highlights, bolds, and varied
  weights carry the emphasis, not dimmed text.
- Whatever weighs most on the test goes first, in the guide and in the study
  order.
- Key vocabulary and terms are bolded or marked, never left in plain weight.
- Visual and colorful, with less to read. Timelines and maps beat paragraphs.
- Colors vary guide to guide. Dark neutral is an option, not the default.
- Universal for classmates: nothing that assumes a resource only Valentino
  has, no artifacts of his own process. Someone landing cold should think
  "this is all I need to study."
- Inside a guide, no teacher is named and there is no third-person attribution
  ("he said", "his outline"). State the facts directly. (The homepage may carry
  a surname next to the class name to tell sections apart; see above.)
- Any abbreviation used gets a key at the bottom listing every one.
- No statistics presented as something to memorize; give the idea in words.

## Guide re-theme

Every guide carries a `<style id="stone">` block right after its first
`</style>`: the four `@font-face` rules, the stone tokens mapped onto the old
glass token names (`--ground`, `--glass`, `--rim-*`, `--amb: 0`, and so on),
`#amb` hidden, `.g` flattened to a 1px line. The guide's own layout is
untouched. A new guide built from the old glass template gets the same block;
`retheme.py` in the project notes generates it. `precalc-quizzes.html` is a
print sheet and is left alone.

## Content Security Policy

`vercel.json` sets a strict CSP: `default-src 'none'`, inline styles and
scripts allowed, images from self and `data:` only. A guide that pulls a font,
script, or image from an external host will silently fail to load it. Inline
everything and embed images as data URIs. If a guide needs to link out to
Google Docs or Drive, that is a link, not a fetch, and is fine.

## Local preview

Plain `python3 -m http.server` does not honor `cleanUrls`, so extensionless
links 404 locally while working fine in production. Either open the `.html`
files directly, or run `vercel dev` to match production routing.

## Before saying it is done

Never report a guide as published on the strength of having written and pushed
it. Verify, then say in one clause what was checked:

- Fetch the deployed URL and confirm it returns 200 with the guide's actual
  content, not the local file. Vercel takes about a minute, so wait and retry
  rather than reporting success early.
- For a practice-test PDF, confirm the page count and that the first page
  renders.
- Confirm the guide appears in both the `CLASSES` array and the `<noscript>`
  list, since the site looks correct when only one of them is updated.

If a check is not possible, say so plainly instead of implying it passed.

## Before handing anything over

Re-read the finished guide, page, or copy as a hostile critic. Name what is
actually weak: buried lead, unmarked vocabulary, a wall of text where a
timeline belongs, dim body text, anything a classmate landing cold would
stumble on. Fix those things, then deliver the fixed version. Do not deliver
the critique unless asked for it.

## History note

Older commits read "Add files via upload" because guides were added through
the GitHub web editor. Work locally and commit normally now.
