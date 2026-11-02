#!/usr/bin/env node
/* valentino guides · sync the parts of the site that are derived from each guide's GUIDE object.
   Run from the repo root after adding or editing a guide:   node tools/sync-guides.mjs
   Check only (exit 1 if anything is out of date):          node tools/sync-guides.mjs --check

   1. The page meta block in each guide's <head> (between "<!-- page meta" and "<!-- /page meta -->"): the tab title,
      description and link-preview tags, so a shared guide unfurls with its own title and its class's preview card.
   2. site-topics.js: every guide's lesson titles and key terms, which Fast Find searches and the class pages list.
   3. For standalone guides on the v5 shell (template/guide-shell-v5.html), the shell header (wordmark, breadcrumb, print, theme)
      between "<!-- guide shell v5 header" and "<!-- /guide shell v5 header -->", from the guide-meta JSON in the head.
   No dependencies. Only template-built guides ("guide template v4" or "v5", data in GUIDE) and shell guides ("guide shell v5",
   data in <script type="application/json" id="guide-meta">) are touched. Both feed site-topics.js the same way. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const SITE = "https://valentinoguides.com";
const MARK = /guide template v[45]\b/;
const SHELL = "<!-- guide shell v5 head";
const MACH = "/* ═══ machinery. nothing below needs editing. ═══ */";
const OG = { apush: "apush", psych: "psych", phys: "physics", pre: "precalc", biz: "business", mor: "morality", lang: "lang", sem: "seminar", span: "spanish" };
const OG_V = "1"; // bump when the og/*.png cards change
const CHECK = process.argv.includes("--check");

const attr = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = s => String(s || "").replace(/\*\*|==|!!/g, "").replace(/\s+/g, " ").trim();
const clamp = (s, n) => { if (s.length <= n) return s; const cut = s.slice(0, n - 1); return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:·\s]+$/, "") + "…"; };

function readGuide(file, html) {
  if (html.includes(SHELL)) {
    const m = html.match(/<script type="application\/json" id="guide-meta">([\s\S]*?)<\/script>/);
    if (!m) throw new Error(`${file}: shell guide without guide-meta`);
    const g = JSON.parse(m[1]);
    for (const k of ["id", "cls", "page", "title", "outline"]) if (!g[k]) throw new Error(`${file}: guide-meta needs ${k}`);
    return g;
  }
  const a = html.indexOf("const GUIDE = "), b = html.indexOf(MACH, a);
  if (a < 0 || b < 0) throw new Error(`${file}: no GUIDE block`);
  const src = html.slice(a + "const GUIDE = ".length, b).trim().replace(/;$/, "");
  return new Function(`return (${src})`)();
}

function metaBlock(slug, g) {
  const desc = clamp(plain(g.sub) || plain((g.top || [])[0]) || `${g.cls} study guide.`, 160);
  const img = OG[g.id] ? `${SITE}/og/${OG[g.id]}.png?v=${OG_V}` : `${SITE}/og-image.png?v=4`;
  return [
    "<!-- page meta: written per guide from GUIDE by tools/sync-guides.mjs (node tools/sync-guides.mjs). Not engine; do not hand-edit. -->",
    `<title>${attr(`${g.title} · ${g.cls} · Valentino guides`)}</title>`,
    `<meta name="description" content="${attr(desc)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Valentino guides">`,
    `<meta property="og:title" content="${attr(`${g.title} · ${g.cls}`)}">`,
    `<meta property="og:description" content="${attr(desc)}">`,
    `<meta property="og:url" content="${SITE}/${slug}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${attr(`${g.cls} · Valentino guides`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    "<!-- /page meta -->",
  ].join("\n") + "\n";
}

const PRINT = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6V1.8h8V6M4 12H2.5V7.2A1.2 1.2 0 0 1 3.7 6h8.6a1.2 1.2 0 0 1 1.2 1.2V12H12"/><path d="M4 9.5h8v4.7H4z"/></svg>';
function shellHeader(g) {
  return [
    "<!-- guide shell v5 header: written per guide from guide-meta by tools/sync-guides.mjs. -->",
    `<header class="vg-bar"><div class="vg-in"><a class="vg-brand" href="/" aria-label="valentino guides, all classes">valentino guides</a>` +
    `<button type="button" class="vg-ibtn" id="vg-print" aria-label="print this guide">${PRINT}</button>` +
    `<button type="button" class="vg-ibtn" id="vg-thm" aria-label="theme"></button>` +
    `<nav class="vg-crumb" aria-label="breadcrumb"><a href="/">classes</a><span aria-hidden="true">/</span><a href="${attr(g.page)}">${attr(g.cls)}</a>` +
    `<span aria-hidden="true">/</span><span aria-current="page">${attr(g.title)}</span></nav></div></header>`,
    "<!-- /guide shell v5 header -->",
  ].join("\n");
}
const files = readdirSync(".").filter(f => f.endsWith(".html")).sort();
const topics = {};
const stale = [];
for (const f of files) {
  const html = readFileSync(f, "utf8");
  if (!MARK.test(html) && !html.includes(SHELL)) continue;
  const slug = f.slice(0, -5), g = readGuide(f, html);
  const a = html.indexOf("<!-- page meta"), b = html.indexOf("<!-- /page meta -->");
  if (a < 0 || b < 0) throw new Error(`${f}: no page meta block; rebuild it on the current template first`);
  const end = b + "<!-- /page meta -->".length + (html[b + 19] === "\n" ? 1 : 0);
  let next = html.slice(0, a) + metaBlock(slug, g) + html.slice(end);
  if (html.includes(SHELL)) {
    const ha = next.indexOf("<!-- guide shell v5 header"), hb = next.indexOf("<!-- /guide shell v5 header -->", ha);
    if (ha < 0 || hb < 0) throw new Error(`${f}: shell guide without its header block`);
    next = next.slice(0, ha) + shellHeader(g) + next.slice(hb + "<!-- /guide shell v5 header -->".length);
  }
  if (next !== html) { stale.push(f); if (!CHECK) writeFileSync(f, next); }
  topics["/" + slug] = (g.outline || []).map(s => [plain(s.t), ...(s.terms || []).map(plain), plain(s.d)].filter(Boolean));
}

const body = Object.entries(topics).map(([u, l]) => `${JSON.stringify(u)}:${JSON.stringify(l)}`).join(",\n");
const out = `/* valentino guides · lesson topics for Fast Find and the class pages. One entry per guide: each lesson's title, its key terms,
   then its one-line "what the test asks" (d), in the guide's own order (lesson n opens at /<guide>#s-n). Generated by tools/sync-guides.mjs from GUIDE.outline; do not edit by hand. */
"use strict";
const TOPICS={
${body}
};
`;
let old = ""; try { old = readFileSync("site-topics.js", "utf8"); } catch (e) {}
if (out !== old) { stale.push("site-topics.js"); if (!CHECK) writeFileSync("site-topics.js", out); }

if (CHECK) {
  if (stale.length) { console.log("out of date: " + stale.join(", ") + "\nrun: node tools/sync-guides.mjs"); process.exit(1); }
  console.log("guides in sync (" + Object.keys(topics).length + " guides)");
} else console.log((stale.length ? "updated: " + stale.join(", ") : "nothing to update") + " (" + Object.keys(topics).length + " guides)");
