#!/usr/bin/env node
/* Rebuild template-v4 guides without changing their GUIDE data, page meta,
   or the Spanish guide's translation protection. Use --check to verify only. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const MARK = "guide template v4";
const START = "const GUIDE = ";
const MACH = "/* ═══ machinery. nothing below needs editing. ═══ */";
const META = /<!-- page meta\b[\s\S]*?<!-- \/page meta -->/;
const CHECK = process.argv.includes("--check");
const hash = text => createHash("sha256").update(text).digest("hex");
const template = readFileSync(resolve(ROOT, "template/guide-template.html"), "utf8");

function parts(html, file) {
  const a = html.indexOf(START), b = html.indexOf(MACH, a);
  const meta = html.match(META);
  if (a < 0 || b < a || !meta || meta.index > a || html.indexOf(START, a + START.length) >= 0)
    throw new Error(`${file}: ambiguous or missing guide blocks`);
  return { guide: html.slice(a, b), meta: meta[0], a, b };
}
const base = parts(template, "template");
const engine = html => {
  const p = parts(html, "engine");
  return (html.slice(0, p.a) + "GUIDE_BLOCK\n" + html.slice(p.b))
    .replace(META, "PAGE_META")
    .replace('<html lang="en" translate="no" class="notranslate">', '<html lang="en">')
    .replace('<meta name="google" content="notranslate">\n', "");
};
const expected = engine(template);
const pending = [];
let count = 0;
for (const file of readdirSync(ROOT).filter(f => f.endsWith(".html")).sort()) {
  const path = resolve(ROOT, file), old = readFileSync(path, "utf8");
  if (!old.includes(MARK)) continue;
  count++;
  const p = parts(old, file);
  let next = (template.slice(0, base.a) + p.guide + template.slice(base.b)).replace(META, () => p.meta);
  if (old.includes('<html lang="en" translate="no" class="notranslate">'))
    next = next.replace('<html lang="en">', '<html lang="en" translate="no" class="notranslate">');
  if (old.includes('<meta name="google" content="notranslate">'))
    next = next.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="google" content="notranslate">');
  const after = parts(next, file);
  if (hash(p.guide) !== hash(after.guide) || p.meta !== after.meta || engine(next) !== expected)
    throw new Error(`${file}: preservation check failed`);
  if (old !== next) pending.push({ path, file, next });
}
if (!count) throw new Error("No template-v4 guides found");
if (CHECK && pending.length) {
  console.error("Engine out of sync: " + pending.map(p => p.file).join(", "));
  process.exitCode = 1;
} else {
  if (!CHECK) for (const p of pending) writeFileSync(p.path, p.next);
  console.log(`${count} guide engines ${CHECK ? "verified" : "synchronized"}; ${pending.length} changed; GUIDE and page meta preserved. Engine SHA-256: ${hash(expected)}`);
}
