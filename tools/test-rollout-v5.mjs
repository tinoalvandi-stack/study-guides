#!/usr/bin/env node
/* Checks for the November 1, 2026 minimal-design rollout. Run: node --test tools/test-rollout-v5.mjs
   Static checks of the real files (no browser): public listings, shell guides and their topic anchors, nothing private
   or remote in public pages, unconfirmed dates kept out of "up next", the theme storage contract, and lowercase scope. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const read = f => readFileSync(new URL(f, ROOT), "utf8");
const html = readdirSync(ROOT).filter(f => f.endsWith(".html"));
const data = vm.runInNewContext(read("site-data.js") + ";({CLASSES,FEATURES})");
const PUBLIC = data.CLASSES.filter(c => c.id !== "span");
const CLASS_PAGES = ["seminar", "business", "morality", "precalc", "apush", "psych", "lang", "physics"];
const SHELLS = html.filter(f => read(f).includes("<!-- guide shell v5 head:"));

test("three new guides are standalone shell guides with guide-meta and sequential topic anchors", () => {
  assert.deepEqual(SHELLS.sort(), ["apush-unit-3a.html", "precalc-limits-1-1-1-2.html", "psych-unit-2-7-2-8.html"]);
  for (const f of SHELLS) {
    const h = read(f), meta = JSON.parse(h.match(/<script type="application\/json" id="guide-meta">([\s\S]*?)<\/script>/)[1]);
    const ids = [...h.matchAll(/\sid="s-(\d+)"/g)].map(m => +m[1]);
    assert.deepEqual(ids, meta.outline.map((_, i) => i + 1), `${f}: one anchor per outline lesson, in order`);
    assert.match(h, /^<!doctype html>/i, `${f}: standards mode`);
    assert(h.includes(`<meta property="og:url" content="https://valentinoguides.com/${f.slice(0, -5)}">`), `${f}: page meta synced`);
    assert(h.includes('id="vg-thm"') && h.includes('id="vg-print"'), `${f}: reader chrome present`);
    assert(h.includes('<script defer src="/_vercel/insights/script.js"></script>'), `${f}: analytics line`);
  }
});

test("public pages carry no private class links, remote fonts or authoring artifacts", () => {
  const banned = /classroom\.google|drive\.google|docs\.google\.com\/(document|presentation|spreadsheets)|youtube\.com|fonts\.googleapis|fonts\.gstatic|claude:viewport/;
  for (const f of html) assert(!banned.test(read(f)), `${f} contains a private or remote reference`);
  for (const f of SHELLS) assert(!/Said in class|Class notes, Oct|Not read<|DeltaMath was not|Sources read|Still unknown|Source map/.test(read(f)), `${f}: workflow notes removed`);
});

test("every public guide resolves to a file, is in its class data and in the no-JavaScript list", () => {
  const index = read("index.html"), noscript = index.slice(index.indexOf("<noscript>"), index.indexOf("</noscript>"));
  for (const c of PUBLIC) for (const u of c.units) {
    const path = u.url.split("#")[0].slice(1);
    assert(existsSync(new URL(path + ".html", ROOT)), `${u.url} has a file`);
    assert(noscript.includes(`href="${u.url}"`), `${u.url} is in the <noscript> list`);
  }
  assert(!/spanish/i.test(noscript), "Spanish stays out of public discovery");
  for (const u of ["/apush-unit-3a", "/psych-unit-2-7-2-8", "/precalc-limits-1-1-1-2"])
    assert(PUBLIC.some(c => c.units[0].url === u), `${u} is the newest unit of its class`);
});

test("only the directly confirmed test date is featured", () => {
  const urls = data.FEATURES.map(f => f.url);
  assert(urls.includes("/apush-unit-3a"), "Unit 3/A (Nov 6, confirmed) is in up next");
  assert(!urls.includes("/psych-unit-2-7-2-8") && !urls.includes("/precalc-limits-1-1-1-2"), "unconfirmed dates are not featured");
  assert.match(read("psych-unit-2-7-2-8.html"), /Date not confirmed/);
  assert.match(read("precalc-limits-1-1-1-2.html"), /Date not confirmed/);
});

test("home and the eight class pages share the new shell and asset versions", () => {
  for (const f of ["index", ...CLASS_PAGES]) {
    const h = read(f + ".html");
    for (const s of ['id="thm"', 'class="bin"', "/site.css?v=9", "/site-data.js?v=7", "/site-topics.js?v=2", "/site.js?v=8"]) assert(h.includes(s), `${f}: ${s}`);
    assert(!h.includes('class="seg" role="group" aria-label="theme"'), `${f}: old theme switch removed`);
  }
  for (const f of CLASS_PAGES) assert(read(f + ".html").includes(`data-course="`), `${f}: class shell`);
});

function themeRun(saved) {
  const src = read("site.js"), a = src.indexOf("/* ═══ theme:"), b = src.indexOf("/* ═══ toast, share, recent ═══ */");
  const dataset = {}, btn = { dataset: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v }, addEventListener(t, f) { this.click = f } };
  const store = new Map(saved == null ? [] : [["theme", saved]]);
  const ctx = vm.createContext({ document: { documentElement: { dataset } }, localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    $: s => s === "#thm" ? btn : null, REDUCED: true });
  vm.runInContext(src.slice(a, b), ctx);
  return { dataset, btn, store };
}
test("theme keeps the localStorage contract: auto, light and dark, new visitors dark", () => {
  assert.equal(themeRun(null).dataset.theme, "dark");
  assert.equal(themeRun("light").dataset.theme, "light");
  assert.equal(themeRun("auto").dataset.theme, undefined);
  const r = themeRun("auto"); r.btn.click(); assert.equal(r.store.get("theme"), "light"); r.btn.click(); assert.equal(r.store.get("theme"), "dark");
  r.btn.click(); assert.equal(r.store.get("theme"), "auto"); assert.equal(r.dataset.theme, undefined);
  assert.match(r.btn.attrs["aria-label"], /^theme: auto\. switch to light$/);
});

test("lowercase is scoped to interface labels, never the whole page", () => {
  for (const f of ["site.css"]) assert(!/(^|[}\s])(html|body)\s*\{[^}]*text-transform/.test(read(f)), `${f}: no page-wide text-transform`);
  assert(!/(^|[}\s])(html|body)\s*\{[^}]*text-transform/.test(read("template/guide-template.html")), "template: no page-wide text-transform");
});

test("the paper stack exposes its pause control and hides only the drawing", () => {
  const src = read("site.js");
  assert(src.includes('host.removeAttribute("aria-hidden")'));
  assert(src.includes('<div class="stack" aria-hidden="true">') && src.includes('<div class="orbit" aria-hidden="true">'));
  assert(!read("index.html").includes('id="homeart" aria-hidden'));
});

test("shell guides lowercase their interface chrome only, and topics carry the theory terms search needs", () => {
  for (const f of SHELLS) {
    const skin = read(f).match(/<style id="vg-skin">([\s\S]*?)<\/style>/)[1];
    assert.match(skin, /\{text-transform:lowercase;letter-spacing:0\}/, `${f}: chrome lowercase rule`);
    assert(!/(^|[}\s,])(html|body|h1|h2|h3|h4|p|li|td)\s*[,{][^}]*text-transform:lowercase/.test(skin.replace(/h1\{[^}]*\}/, "")), `${f}: no content-wide lowercase`);
  }
  const topics = vm.runInNewContext(read("site-topics.js") + ";TOPICS");
  const theories = topics["/psych-unit-2-7-2-8"][2];
  for (const t of ["CHC theory", "Cattell-Horn-Carroll", "multiple intelligences", "triarchic theory", "factor analysis"]) assert(theories.includes(t), t);
});

test("v5 guide header keeps a visible 44px home link on phones", () => {
  const t = read("template/guide-template.html");
  assert(t.includes(".bar .home { display:inline-flex; align-items:center; min-height:44px; min-width:44px; }"));
  assert(t.includes('.bar .home h1::before { content:"vg";') && !/max-width:439px\) \{ \.thm \{ width:40px/.test(t));
});

test("morality chapters 4 and 5 keep their exact GUIDE data on the v5 engine", () => {
  const h = read("morality-ch4-5.html"), a = h.indexOf("const GUIDE = "), b = h.indexOf("/* ═══ machinery. nothing below needs editing. ═══ */", a);
  assert.equal(createHash("sha256").update(h.slice(a, b)).digest("hex"), "cc34018027034bc6ee56b852bb61598e5bdc5d440867bc2808bb2b27441bd99c");
  assert(h.includes("guide template v5") && !h.includes("guide template v4"));
});
