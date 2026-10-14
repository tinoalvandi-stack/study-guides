/* valentino guides · offline copies, network first.
   Online, every request goes to the network exactly as without this file, and a copy of each page or file that loads is kept.
   Offline (the network request fails), the kept copy answers; a page that was never opened shows /offline.
   Left alone: anything that is not a GET, other sites (the feedback form), Vercel's analytics, audio (range requests),
   and any answer that is not a plain 200 from this site. Nothing here can serve an old page while the network works.
   Switch it off everywhere: see "Offline copies" in CLAUDE.md (replace this file with the kill switch, push). */
"use strict";
const V = "vg-offline-1"; // bump to drop every kept copy
const CORE = ["/", "/offline", "/site.css", "/site-data.js", "/site-topics.js", "/site.js",
  "/fonts/source-sans-3-latin.woff2", "/fonts/source-serif-4-latin.woff2", "/favicon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range")) return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.startsWith("/_vercel/") || /\.(mp3|m4a|wav|ogg)$/i.test(u.pathname)) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r);
      if (res.status === 200 && res.type === "basic" && !res.redirected) {
        const copy = res.clone();
        e.waitUntil(caches.open(V).then(async c => {   // one copy per path: drop older ?v= versions of the same file
          const ks = await c.keys();
          await Promise.all(ks.filter(k => { const x = new URL(k.url); return x.pathname === u.pathname && x.search !== u.search; }).map(k => c.delete(k)));
          await c.put(r, copy);
        }).catch(() => {}));
      }
      return res;
    } catch (err) {
      const hit = await caches.match(r, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      if (r.mode === "navigate") { const off = await caches.match("/offline", { ignoreSearch: true }); if (off) return off; }
      throw err;
    }
  })());
});
