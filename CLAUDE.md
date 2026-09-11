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
- `apple-touch-icon.png`, `favicon.svg` — home screen and tab icons.
- Individual guides: one `.html` file per guide at the repo root
  (`psych-unit-0.html`, `precalc-vectors.html`, …). Practice tests ship as
  `.pdf` beside them.
- `_staging/` — untracked scratch. Never commit it.

## Adding a guide

1. Drop the guide's HTML file at the repo root. Name it
   `<class>-<topic>.html`, lowercase, hyphens only. That filename becomes the
   URL: `precalc-vectors.html` → `/precalc-vectors`.
2. Add an entry to the `CLASSES` array in `index.html` (marked `DATA` in a
   comment), newest first within its class:

   ```js
   { t: "Unit 2 study guide", tag: "Guide", url: "/precalc-vectors" }
   ```

   `tag` is one of `Guide`, `Flashcards`, `Quiz`, `Folder`. A class showing
   "Soon" flips automatically once its array has an entry.
3. **Add the same link to the `<noscript>` block near the bottom of
   `index.html`.** That list is hand-maintained, not generated from `CLASSES`.
   Forgetting it is the easy mistake: the site looks fine, but the no-JS and
   crawler view silently misses the guide.
4. Commit and push. Vercel handles the rest.

## Featuring an upcoming test

Add to the `FEATURES` array at the top of the script, in test-date order:

```js
{ classId: "precalc", title: "Vectors & trig equations", url: "/precalc-vectors-icf-trig-eq", test: "2026-09-04" }
```

The "up next" card shows the soonest test that has not passed and advances on
its own the day after. Several can sit queued. The date chip hides itself the
same way. Leave the surrounding markup alone.

## Colors

The palette is "crisp" (September 2026). Every token lives in the three
blocks at the top of `index.html`: light, dark by system setting, and dark by
the toggle. Change all three together.

Each class color `--c-<id>` has two companions: `--c-<id>-ink` is its label
text on a card and `--c-<id>-cta` is its "open the guide" button fill. Both are
checked at 4.5:1 or better against what they actually sit on. Gold also has
`--c-biz-on`, dark button text, because white text would force a muddy fill.
A new class needs its color, ink and cta in all three blocks; without them its
card falls back to plain ink and brand blue. Guide pages keep their own
accents.

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
- No teacher named, and no third-person attribution ("he said", "his
  outline"). State the facts directly.
- Any abbreviation used gets a key at the bottom listing every one.
- No statistics presented as something to memorize; give the idea in words.

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
