#!/usr/bin/env node
/* Dependency-free checks of the phone layout rules in the business cram sheet's CSS.
   Run: node --test tools/test-cram-layout.mjs
   CRAM_PAGE may point to an earlier copy to confirm these tests catch the old rules.
   These read the stylesheet only; rendered width at 320px and print preview are checked in a browser. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(process.env.CRAM_PAGE || new URL("../bus-unit-1-cram.html", import.meta.url), "utf8");
const css = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join("\n");

function cssRules(text, media = [], rules = []) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  let pos = 0;
  while (pos < text.length) {
    const start = text.indexOf("{", pos); if (start < 0) break;
    const selector = text.slice(pos, start).trim();
    let end = start + 1, depth = 1;
    while (depth && end < text.length) { if (text[end] === "{") depth++; if (text[end] === "}") depth--; end++; }
    assert.equal(depth, 0, "Balanced CSS blocks");
    const body = text.slice(start + 1, end - 1);
    if (selector.startsWith("@media")) cssRules(body, [...media, selector.slice(6).trim().replace(/\s+/g, " ")], rules);
    else if (!selector.startsWith("@")) rules.push({ selectors: selector.split(",").map(s => s.trim()), body, media });
    pos = end;
  }
  return rules;
}
const rules = cssRules(css);
const decl = (rule, prop) => {
  for (const d of rule.body.split(";")) {
    const i = d.indexOf(":");
    if (i > 0 && d.slice(0, i).trim().toLowerCase() === prop) return d.slice(i + 1).replace(/!important/i, "").trim().toLowerCase().replace(/\s+/g, " ");
  }
  return null;
};
const forSubject = (subject, where) => rules.filter(r => r.selectors.includes(subject) && where(r.media));
const phone = media => media.some(m => /^screen and \(max-width: ?620px\)$/.test(m));

test("on phones the one-column grid lets cards shrink and keeps a wide table inside its card", () => {
  const grid = forSubject(".grid", phone).map(r => decl(r, "grid-template-columns"));
  assert(grid.some(v => /^minmax\(0(px)?, ?1fr\)$/.test(v || "")), "the grid track may shrink below its widest card");
  const card = forSubject(".card", phone);
  assert(card.some(r => /^0(px)?$/.test(decl(r, "min-width") || "")), "cards may shrink below their widest table");
  assert(card.some(r => ["auto", "scroll"].includes(decl(r, "overflow-x"))), "a table wider than its card scrolls instead of widening the page");
});

test("no rule clips or hides cards, the grid, the paper or tables", () => {
  const SUBJECT = /(^|[\s>+~])(\.page|\.grid|\.card(\.wide|\.trap)?|table|thead|tbody|tr|th|td)$/;
  for (const r of rules) for (const s of r.selectors) {
    if (!SUBJECT.test(s)) continue;
    for (const prop of ["overflow", "overflow-x", "overflow-y"]) assert(!/hidden|clip/.test(decl(r, prop) || ""), `${s} ${prop}`);
    assert.notEqual(decl(r, "display"), "none", s);
    assert.notEqual(decl(r, "visibility"), "hidden", s);
    assert.equal(decl(r, "text-overflow"), null, s);
  }
});

test("desktop and print keep two columns, and card sizing rules never reach print", () => {
  assert(forSubject(".grid", m => m.length === 0).map(r => decl(r, "grid-template-columns")).includes("1fr 1fr"), "desktop grid");
  assert(forSubject(".grid", m => m.includes("print")).map(r => decl(r, "grid-template-columns")).includes("1fr 1fr"), "print grid");
  for (const r of forSubject(".card", () => true)) {
    if (decl(r, "overflow-x") === null && decl(r, "overflow") === null && decl(r, "min-width") === null) continue;
    assert(r.media.length && r.media.every(m => /^screen\b/.test(m) && /max-width/.test(m)), `card sizing rule outside phone screens: ${r.media.join(" / ") || "all media"}`);
  }
});
