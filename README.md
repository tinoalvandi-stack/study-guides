# Study Guides

Valentino's study-guides site. Replaces the old Linktree. One static page, no
build step, no backend, no analytics, no third-party scripts. There is nothing
to breach because nothing runs server-side and nothing loads from anywhere else.

## Files

- `index.html`: the whole site. Design, data, and search live here.
- `vercel.json`: security headers plus clean URLs. Vercel serves the rest as-is.
- `404.html`: served for any path that does not exist.
- `og-image.png`: the preview card iMessage and social apps show when the link
  is shared. Its URL in `index.html` is absolute and points at tinoguides.com;
  if the site ends up on a different domain, update the two `og:` URLs in the
  head.
- `apple-touch-icon.png`: the icon when someone saves the site to an iPhone
  home screen.

## Adding a guide

1. Open `index.html` on github.com and hit the pencil (edit).
2. Find the `CLASSES` array (marked `DATA` in a comment). Add one entry to the
   right class, newest first:

   ```js
   { t: "Unit 2 study guide", tag: "Guide", url: "https://..." }
   ```

   `tag` is one of `Guide`, `Flashcards`, `Quiz`, `Folder`. Empty classes show
   "Soon" automatically once their array has an entry, so nothing else changes.
3. Commit. Vercel redeploys on its own in under a minute.

## New test coming up

Edit the `FEATURE` block at the top of the script: title, url, and `test` as
`YYYY-MM-DD`. The date chip hides itself the day after the test. Leave the rest
alone.

## Rules baked in

- Course names only. No teacher names, no period numbers, anywhere.
- Every outbound link opens in a new tab with `rel="noopener noreferrer"`.
- Claude links must be shared (Share menu) before they go in, or classmates
  get a login wall. Google Doc links currently need a school Google login;
  set them to "Anyone with the link, Viewer" to open them up.

## Local preview

Open `index.html` in a browser, or `python3 -m http.server` in the repo folder
and visit `localhost:8000`.
