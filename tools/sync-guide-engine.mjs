#!/usr/bin/env node
/* Rebuild template-built guides without changing their GUIDE data, page meta, or the Spanish guide's translation
   protection. Each guide is checked against the engine of its own template version:

     "guide template v5"  →  template/guide-template.html      (canonical; every new guide; approved Nov 1 2026 design)
     "guide template v4"  →  template/guide-template-v4.html   (frozen October 22 engine; the older guides stay byte-for-byte)

   A guide listed in PINNED keeps a legacy engine on purpose: it is never rewritten, and its normalized engine must
   still hash to the pinned value (a changed pinned engine is an error, not drift).

     node tools/sync-guide-engine.mjs                  rebuild drifted v4/v5 guides from their own template
     node tools/sync-guide-engine.mjs --check          verify only; exit 1 on drift
     node tools/sync-guide-engine.mjs --to-v5 a.html   move one guide onto the v5 engine (GUIDE and page meta kept)  */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, relative, basename, sep } from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const START = "const GUIDE = ";
const MACH = "/* ═══ machinery. nothing below needs editing. ═══ */";
const META = /<!-- page meta\b[\s\S]*?<!-- \/page meta -->/;
const CHECK = process.argv.includes("--check");
const TO_V5 = process.argv.includes("--to-v5") ? process.argv[process.argv.indexOf("--to-v5") + 1] : null;
const hash = text => createHash("sha256").update(text).digest("hex");
const VERSIONS = [
  { mark: "guide template v5", file: "template/guide-template.html" },
  { mark: "guide template v4", file: "template/guide-template-v4.html" },
];
/* physics-intro-dynamics.html was restored on October 7 with the engine it shipped with; keep it exactly as published. */
const PINNED = { "physics-intro-dynamics.html": "88bea2af06bc6f63070617c36b6af87479166c3f4b555436fea2521b99e8153c" };

function parts(html, file) {
  const a = html.indexOf(START), b = html.indexOf(MACH, a);
  const meta = html.match(META);
  if (a < 0 || b < a || !meta || meta.index > a || html.indexOf(START, a + START.length) >= 0)
    throw new Error(`${file}: ambiguous or missing guide blocks`);
  return { guide: html.slice(a, b), meta: meta[0], a, b };
}
const engine = html => {
  const p = parts(html, "engine");
  return (html.slice(0, p.a) + "GUIDE_BLOCK\n" + html.slice(p.b))
    .replace(META, "PAGE_META")
    .replace('<html lang="en" translate="no" class="notranslate">', '<html lang="en">')
    .replace('<meta name="google" content="notranslate">\n', "");
};
for (const v of VERSIONS) {
  v.template = readFileSync(resolve(ROOT, v.file), "utf8");
  if (!v.template.includes(v.mark) || VERSIONS.some(o => o !== v && v.template.includes(o.mark)))
    throw new Error(`${v.file}: must carry exactly its own marker "${v.mark}"`);
  v.base = parts(v.template, v.file);
  v.expected = engine(v.template);
}
/* A file that holds a GUIDE block must say which engine built it: exactly one known marker, or a pin. */
const versionOf = (html, file) => {
  const hits = VERSIONS.filter(v => html.includes(v.mark));
  if (hits.length > 1) throw new Error(`${file}: carries more than one template marker`);
  if (!hits.length && html.includes(START)) throw new Error(`${file}: has a GUIDE block but no known template marker (v4 or v5)`);
  return hits[0] || null;
};
/* --to-v5 takes a guide at the repository root; normalize before any pin or marker check so ./x.html or a full path cannot dodge a pin */
function rootFile(arg) {
  if (!arg) throw new Error("--to-v5 needs a guide file name");
  const path = resolve(process.cwd(), arg), rel = relative(ROOT, path);
  if (!rel || rel.startsWith("..") || rel.includes(sep) || !rel.endsWith(".html")) throw new Error(`${arg}: --to-v5 only moves a guide .html at the repository root`);
  return { path, file: basename(path) };
}
function rebuild(old, file, v) {
  const p = parts(old, file);
  let next = (v.template.slice(0, v.base.a) + p.guide + v.template.slice(v.base.b)).replace(META, () => p.meta);
  if (old.includes('<html lang="en" translate="no" class="notranslate">'))
    next = next.replace('<html lang="en">', '<html lang="en" translate="no" class="notranslate">');
  if (old.includes('<meta name="google" content="notranslate">'))
    next = next.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="google" content="notranslate">');
  const after = parts(next, file);
  if (hash(p.guide) !== hash(after.guide) || p.meta !== after.meta || engine(next) !== v.expected)
    throw new Error(`${file}: preservation check failed`);
  return next;
}

if (TO_V5) {
  const { path, file } = rootFile(TO_V5);
  if (PINNED[file]) throw new Error(`${file} is pinned to its legacy engine`);
  const old = readFileSync(path, "utf8");
  if (!versionOf(old, file)) throw new Error(`${file}: not a template-built guide`);
  const next = rebuild(old, file, VERSIONS[0]);
  if (!CHECK) writeFileSync(path, next);
  console.log(`${file}: ${CHECK ? "would move" : "moved"} to guide template v5; GUIDE (sha256 ${hash(parts(old, file).guide)}) and page meta preserved.`);
  process.exit(0);
}

const pending = [], counts = {};
let pinned = 0;
for (const file of readdirSync(ROOT).filter(f => f.endsWith(".html")).sort()) {
  const path = resolve(ROOT, file), old = readFileSync(path, "utf8");
  if (PINNED[file]) {
    const got = hash(engine(old));
    if (got !== PINNED[file]) throw new Error(`${file}: pinned legacy engine changed (sha256 ${got})`);
    pinned++; continue;
  }
  const v = versionOf(old, file);
  if (!v) continue;
  counts[v.mark] = (counts[v.mark] || 0) + 1;
  const next = rebuild(old, file, v);
  if (old !== next) pending.push({ path, file, next });
}
/* Standalone guides (imported with their own layout) wear the shell from template/guide-shell-v5.html: its head and foot
   chunks must match the canonical copy byte for byte. The header between them is per guide (tools/sync-guides.mjs). */
const SHELL = readFileSync(resolve(ROOT, "template/guide-shell-v5.html"), "utf8");
const shellChunk = (html, name, file) => {
  const open = name === "head" ? "<!-- guide shell v5 head:" : "<!-- guide shell v5 foot -->", close = `<!-- /guide shell v5 ${name} -->`;
  const a = html.indexOf(open), b = html.indexOf(close, a);
  if (a < 0 || b < 0 || html.indexOf(open, a + 1) >= 0) throw new Error(`${file}: missing or repeated shell ${name} chunk`);
  return [a, b + close.length];
};
let shells = 0;
for (const file of readdirSync(ROOT).filter(f => f.endsWith(".html")).sort()) {
  const path = resolve(ROOT, file), old = readFileSync(path, "utf8");
  if (!old.includes("<!-- guide shell v5 head")) continue;
  if (versionOf(old, file)) throw new Error(`${file}: a shell guide cannot also carry a template marker`);
  shells++;
  let next = old;
  for (const name of ["head", "foot"]) {
    const [ca, cb] = shellChunk(SHELL, name, "template/guide-shell-v5.html"), [a, b] = shellChunk(next, name, file);
    next = next.slice(0, a) + SHELL.slice(ca, cb) + next.slice(b);
  }
  if (next !== old) pending.push({ path, file, next });
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (!total) throw new Error("No template-built guides found");
const summary = VERSIONS.map(v => `${counts[v.mark] || 0} on ${v.mark.replace("guide template ", "")}`).join(", ") + `, ${pinned} pinned, ${shells} standalone on the v5 shell`;
if (CHECK && pending.length) {
  console.error("Engine out of sync: " + pending.map(p => p.file).join(", "));
  process.exitCode = 1;
} else {
  if (!CHECK) for (const p of pending) writeFileSync(p.path, p.next);
  console.log(`${total + pinned} guide engines ${CHECK ? "verified" : "synchronized"} (${summary}); ${pending.length} changed; GUIDE and page meta preserved. ` +
    VERSIONS.map(v => `${v.mark.replace("guide template ", "")} engine SHA-256: ${hash(v.expected)}`).join("; "));
}
