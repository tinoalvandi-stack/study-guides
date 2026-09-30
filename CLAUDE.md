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
  bold "v" with a terracotta full stop; the "v" is an outline traced from
  Bricolage Grotesque (weight 700), so it needs no font to render. Icons and
  fonts are cached for a week, so when one changes, bump the `?v=` on its
  `<link>` / `og:image` URL in `index.html` or browsers keep the old one.
- `fonts/` — Bricolage Grotesque (display, variable 200–800 with an optical
  size axis) and Figtree (text, variable 300–900, plus italic), self-hosted
  woff2 (latin subset from Google Fonts). The CSP allows `font-src 'self'`
  only; never link Google Fonts.
- Individual guides: one `.html` file per guide at the repo root
  (`psych-unit-0.html`, `precalc-vectors.html`, …). Practice tests ship as
  `.pdf` beside them.
- `template/guide-template.html` — the guide template on the current design
  system (same tokens, type and components as the homepage). Copy it, edit
  the `GUIDE` object, save as `<class>-<topic>.html` at the root. Listed in
  `.vercelignore`, so it is in the repo but not on the site. The `glass-guides`
  skill (its name is historical) is the how-to.
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
4. Make sure the page carries the analytics tag right before `</body>`
   (the template already has it):
   `<script defer src="/_vercel/insights/script.js"></script>`
5. Commit and push. Vercel handles the rest.

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
`pin: true` (optional) puts that entry first in "up next" while it is live,
ahead of earlier-dated entries; it still drops off after its date.

## Design system: "indigo & kinari" (September 2026)

- Type: Bricolage Grotesque for display (`--display`, weight `--w-d` 600,
  tracking `--ls-d` -.025em, optical sizing on) and Figtree for everything else
  (`--sans`; 400 body, 500 row names, 600 buttons and labels). One scale: 12 /
  13 / 15 / 16 / 20 / 26 / 42; the hero heading is `clamp(26px, 8.6vw, 34px)`
  on phones so "what are you studying?" stays on one line down to 360px, and
  44px from 560px up. No word-spacing hacks; Figtree spaces normally.
  (Instrument Serif / Sans, September 11–13, was replaced the same week: too
  thin at display size, and its kerning showed gaps in the wordmark.)
- Color tokens live in the three blocks at the top of `index.html`: `--paper`
  (page, warm unbleached `#EEE8DC` / `#151B20`), `--surface` / `--surface2`
  (cards `#FBF8F1` / `#1D252A`, nested rows), `--line` / `--line2` (hairlines),
  `--ink` / `--ink2` / `--ink3` (text `#20272B` / `#F2ECDF`, secondary
  `#5E5A52` / `#B9B2A7`), `--accent` (indigo `#294A5E` light, `#8FB7CA` dark:
  buttons, the mark, focus rings, selected states) with `--on-accent` (the card
  color) as its label, `--hi` (terracotta `#944B34` / `#E18A67`: "new", the date
  chip, the logo dot, nothing else), and one muted `--c-<id>` per class. Every
  text token is checked at 4.5:1 or better on the surface it sits on. Change all
  three blocks together. The source values are the "Indigo & Kinari" palette in
  `claude/perplexity-ui-research-2026-09-13.md` in the Claude project.
- Corners: cards 14px, buttons 10px, chips 8px. No ambient glow, no backdrop
  blur, no gloss. Surfaces are flat with a 1px line; shadows only on the search
  results and the feedback card.
- Class marks are line icons in the class color, no tiles.
- Buttons are the accent with a card-colored label. The class color only appears
  in labels, icons, the date chip and the top-match rail.

## Homepage features

- Wordmark: the header reads "valentino guides" (lowercase chrome) next to the
  mark; the tab title and `og:title` are "Valentino guides". Matches the
  domain; keep them in sync if it is ever renamed.
- The page opens on "what are you studying?" and the search field (Fast Find).
  Typing replaces the page with one **top match** card (class, display title,
  chips for extras, an open button) and compact **other matches**. Enter or the
  iPhone keyboard's Search key opens the top match; arrow keys move the
  selection. Ranking is a small weighted score in `rank()`: exact title 100,
  class-only query 60, title prefix 45, every word 30, a kind word (cram,
  practice, quiz) that the unit actually has 20, recently opened 8, up next 6.
  `ALIAS` holds the shorthand students type (`apush`, `rinaldo`, `math`,
  `trig`); add to it when a new class arrives. `norm()` folds `u1b`, `unit1`
  and `1/b` together. A partial-only result is labelled "closest match"; no
  result shows class chips and a "request a guide" link into the feedback card.
- `/` or ⌘K focus the field.
- "Recently opened" and remembered open classes live in the viewer's
  localStorage. Nothing leaves the browser.
- Share on every unit uses the native share sheet, or copies the link.
- Class names may carry the teacher's surname in parentheses when a class has
  several sections at school, e.g. `Catholic Morality (Rinaldo)`. That is the
  only place a teacher is named.

## Guide pages themselves

Each guide is a standalone self-contained HTML file. Conventions that must
hold, because they are what the site's readers rely on (reader feedback,
September 2026; the second round on the 29th said the first guides were
over-highlighted and hard to follow):

- Easy to read first. Less to read, more to look at: tables, flows, trees,
  tiles, drawn figures and maps instead of paragraphs. A section has at most
  two short paragraphs; everything else is a shape.
- Key terms are **bold once**, where they are defined or first used. Nothing
  else is marked inline: no highlight boxes, no underlines, no red text. Traps
  and common wrong answers go in the section's one "watch out" box.
- Every tested section carries "on the test" examples: a question in the style
  the class actually tests (a scenario for psych, a stimulus-style question for
  APUSH, a small-business case, a short problem for math and physics), with a
  tap-to-reveal answer and a one-line why.
- Body text at full contrast (white on dark). Weight and color carry the
  emphasis, never dimmed text.
- Whatever weighs most on the test goes first, in the guide and in the study
  order.
- Colors vary guide to guide: each class carries its own color through the
  page. Dark neutral is an option (the theme switch), not the default. Site
  indigo stays on buttons and examples.
- Universal for classmates: nothing that assumes a resource only Valentino
  has, no artifacts of his own process. Someone landing cold should think
  "this is all I need to study."
- Inside a guide, no teacher is named and there is no third-person attribution
  ("he said", "his outline"). State the facts directly. (The homepage may carry
  a surname next to the class name to tell sections apart; see above.)
- Any abbreviation used gets a key at the bottom listing every one.
- No statistics presented as something to memorize; give the idea in words.

## Guide template (v2, September 29, 2026)

Every guide is built from `template/guide-template.html`: one `GUIDE` object
renders the whole page; the CSS and the machinery below the object are never
edited per guide. If a guide needs something the template lacks, change the
template and rebuild every guide.

Layout: the page is up to 1180px wide. On desktop and iPad (960px and up) a
sticky "on this page" menu sits left of the sections and highlights the one
being read; on phones the same menu is a sticky jump bar under the header.
Every section is open (no collapsing). Practice, formulas and cram lay out in
two columns on wide screens; the practice score is a floating pill.

Header fields: `id` (class token: apush psych phys pre sem biz mor lang span
apwh csp), `cls`, `title`, `test` (+ optional `end`), `meta`, `sub`, `pdfs`
(`{t, url}` buttons for printable practice; optional `pdfsNote`), `updated`,
`panes` (tab order; a pane shows only when its data exists), `labels` (tab
renames), `abbr`.

`top`: three to five start-here lines (numbered tiles).

`outline`: sections, heaviest first. Each has `w` (3 tested most, 2 tested,
1 know it), `t`, `d` (one line on what the test asks) and any of these blocks:
- text: `p` (at most two short paragraphs), `pts` (bullets; six or more short
  ones go two-column), `rows` (`[label, line]` pairs), `flow` (an arrow chain,
  up to six short boxes), `steps` (numbered procedure)
- visuals: `tiles` (`{h, t, k}` cards for parallel items), `tree` (`{t, d, c:[]}`
  hierarchy, stacks into an indented list on narrow cards), `fig` (`{svg, cap}`,
  an inline SVG), `table` (`{h, cols, rows}`), `cmp` (two or three side-by-side
  columns `{h, p:[]}`)
- `ex`: `{q, a, why}` "on the test" cards (tap to show the answer), or
  `{q, opts, a, why}` with `a` the right option's index for tap-to-answer
  multiple choice; use that form whenever the test is multiple choice
- `watch`: the traps, one line each
- `terms`: key-term chips
The engine puts text blocks left and the first `fig`/`tree`/`tiles` right, then
the other visuals, tables and comparisons full width, then examples, the watch
box and the chips.

Figures never hard-code a color. They use the engine's classes so light and
dark both work: strokes `ln lc la lb lg` (+ `dash`), fills `fs fsa fp fc fa fb fg
fi fn`, text `tm tb tc ta tw tbd` (+ `mid`, `end`), arrowheads
`url(#ah) #ahc #aha #ahb`. Keep viewBox widths at 320 to 560 and labels at 12+
units so they stay readable on a phone. A figure must be exactly right; when in
doubt use a table.

Other panes: `practice` (`q`, `opts[]`, `a` index, `why` that also explains the
tempting wrong answer; `a` as an array of indexes makes a select-all question
with a check button), `problems` (`q`, `steps[]`, `ans`; math and physics steps
are `[work, why]` pairs), `formulas` (`n`, `f` plain text, `note`), `cards`
(`f`, `b`; the pane also lists every card), `timeline` (`y`, `t`, `d`),
`checklist` (`t`, `d`), `cram` (`{h, d, items:[{n, y, t}]}`), `tables`
(`{h, d, cols[], rows[[]]}`), and for essay guides `prompts` and `leq`.

Markup: `**term**` only. The engine bolds a term once per section and renders
any legacy `==x==` or `!!x!!` as plain text.

Every guide also gets, from the template alone (nothing to set in `GUIDE`):
a search box beside the tabs (filters every pane as you type, marks the hits,
shows per-tab counts; `/` or the header magnifier jumps to it) and a
"show all answers" toggle (practice keys and whys, problem steps, every "on
the test" answer), shown whenever the guide has any of those. `topTable`
(`{h, cols, rows}`) renders one table under the start-here tiles.

## Guide history

The first guides (August) were hand-built "glass" pages; in September they were
re-themed onto the kinari tokens, then moved onto the first template. On
September 29, 2026 all eighteen guides were rebuilt on template v2 from their
own content (same sections, weights, practice, cards and problems; prose cut,
visuals and examples added). `precalc-quizzes.html` is a print sheet,
`morality-ch3-jeopardy.html` a game, and the two cram pages
(`bus-unit-1-cram`, `morality-ch1-2-cram`) are print-style sheets; those four
stay on their own layouts.

## Content Security Policy

`vercel.json` sets a strict CSP: `default-src 'self'`, inline styles and
scripts allowed, images from self and `data:` only, `connect-src` limited to
`'self'` (Vercel Web Analytics) and `https://docs.google.com` (feedback form). A guide that pulls a font,
script, or image from an external host will silently fail to load it. Inline
everything and embed images as data URIs. If a guide needs to link out to
Google Docs or Drive, that is a link, not a fetch, and is fine.

## Analytics

Vercel Web Analytics (enabled on the Vercel project, Hobby plan). Every
page carries one line before `</body>`:
`<script defer src="/_vercel/insights/script.js"></script>`. The script is
served by Vercel from this domain, sets no cookies, and records page views
anonymously (path, referrer, country/city, device, browser). It cannot tell
who a visitor is. Hobby includes 50k events a month and keeps one month of
history. Numbers live in the Vercel dashboard under the project's Analytics
tab. A page without the line is simply not counted. `sxsw-edu-2027.html` is
left out on purpose (not a guide).

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
