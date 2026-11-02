#!/usr/bin/env node
/* Up-next calendar checks on the actual site.js code (no browser). Run: node --test tools/test-calendar.mjs
   Covers Pacific civil "today" from any viewer zone (subprocesses with other TZ values), UTC civil-date arithmetic across
   month, year, leap-day and DST edges, inclusive test..end ranges, current/next week choice and empty weeks, exclusion of
   Spanish, unconfirmed or unlisted entries, and the controller: day filter and toggle, whole-week reset, week arrows,
   keyboard movement, today marking, refresh on a day change, and recordOpen on agenda links. A DOM double stands in for
   the page; it does not measure layout or screen-reader speech. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const read = f => readFileSync(new URL(f, ROOT), "utf8");
const SRC = read("site.js");
const part = (a, b) => { const i = SRC.indexOf(a), j = SRC.indexOf(b, i); assert(i >= 0 && j > i, `missing ${a}`); return SRC.slice(i, j + b.length); };
const HELPERS = part("/* ═══ up next calendar: civil-date helpers", "/* end of calendar helpers */");
const CONTROLLER = part("/* ═══ up next calendar: one week strip", "/* end of calendar controller */");
const DATA = read("site-data.js");

class El {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.doc = doc; this.children = []; this.attrs = new Map(); this.events = new Map(); this.dataset = {}; this.text = ""; this.tabIndex = -1; this.className = ""; this.hidden = false; }
  set textContent(v) { this.children = []; this.text = String(v); }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(""); }
  append(...xs) { for (const x of xs) { const n = typeof x === "string" ? Object.assign(new El("#text", this.doc), { text: x }) : x; n.parent = this; this.children.push(n); } }
  replaceChildren(...xs) {
    const a = this.doc.activeElement;
    if (a && this.children.some(c => c === a || c.all().includes(a))) this.doc.activeElement = null;   // focus falls to the body, as in a browser
    for (const c of this.children) c.parent = null;
    this.children = []; this.append(...xs);
  }
  get parentNode() { return this.parent || null; }
  set href(v) { this.attrs.set("href", String(v)); }       // reflected like a real anchor
  get href() { return this.attrs.get("href"); }
  get connected() { let n = this; while (n.parent) n = n.parent; return !!n.isRoot; }
  setAttribute(k, v) { this.attrs.set(k, String(v)); if (k === "id") this.id = String(v); }
  getAttribute(k) { return this.attrs.get(k) ?? null; }
  addEventListener(t, f) { this.events.set(t, [...(this.events.get(t) || []), f]); }
  fire(t, extra = {}) { const ev = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra }; for (const f of this.events.get(t) || []) f(ev); return ev; }
  focus() { if (this.connected) this.doc.activeElement = this; }
  all() { return this.children.flatMap(c => [c, ...c.all()]); }
  querySelector(s) { return this.all().find(n => n.id === s.slice(1)) || null; }
}
function page(nowISO, features) {
  const doc = { activeElement: null };
  doc.createElement = t => new El(t, doc);
  const root = new El("section", doc); root.isRoot = true;
  for (const id of ["calprev", "callabel", "calnext", "caldays", "calagenda"]) { const n = new El(id.startsWith("calagenda") || id === "caldays" ? "div" : "button", doc); n.setAttribute("id", id); root.append(n); }
  const opened = [];
  let now = new Date(nowISO);
  const ctx = vm.createContext({ document: doc, Intl, Date, opened });
  vm.runInContext(DATA + `
    const baseUrl=u=>String(u).split("#")[0];
    const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e};
    const recordOpen=(c,u)=>opened.push([c.id,u.url,u.t]);
    const PUBLIC_CLASSES=CLASSES.filter(c=>c.id!=="span");
    let PUBLIC_FEATURES=FEATURES.filter(f=>f.classId!=="span");` + HELPERS + CONTROLLER, ctx, { filename: "site.js calendar" });
  ctx.__F = features || null;
  ctx.__root = root; ctx.__now = () => now;
  const cal = vm.runInContext("makeCalendar(__root, calEvents(__F || PUBLIC_FEATURES, PUBLIC_CLASSES), __now)", ctx);
  const q = id => root.querySelector("#" + id);
  return {
    ctx, cal, doc, opened, q,
    setNow(iso) { now = new Date(iso); },
    days: () => q("caldays").children,
    day: key => q("caldays").children.find(b => b.dataset.date === key),
    rows: () => q("calagenda").children.filter(n => n.className === "evt"),
    empty: () => q("calagenda").children.find(n => n.className === "cnone")?.textContent || null,
  };
}
const H = vm.createContext({ Intl, Date });
vm.runInContext('const baseUrl=u=>String(u).split("#")[0];' + HELPERS + DATA + ";globalThis.X={civilToday,addDays,mondayOf,dowOf,validDay,weekLabel,rangeLabel,defaultWeek,calEvents,onDay,inWeek,CLASSES,FEATURES}", H);
const X = H.X;

test("Pacific civil today does not depend on the viewer's time zone", () => {
  const cases = [["2026-11-02T07:59:59Z", "2026-11-01"], ["2026-11-02T08:00:00Z", "2026-11-02"],   // after DST ends, UTC-8
    ["2026-11-01T08:30:00Z", "2026-11-01"], ["2026-11-01T06:59:00Z", "2026-10-31"],                   // the 1 a.m. repeat
    ["2027-03-14T09:59:00Z", "2027-03-14"], ["2027-03-15T06:59:00Z", "2027-03-14"], ["2027-03-15T07:00:00Z", "2027-03-15"], // DST starts, UTC-7
    ["2026-12-31T23:30:00Z", "2026-12-31"], ["2027-01-01T08:00:00Z", "2027-01-01"]];
  for (const [iso, want] of cases) assert.equal(X.civilToday(new Date(iso)), want, iso);
  const helper = HELPERS.replace(/^/, 'const baseUrl=u=>u;');
  for (const tz of ["Pacific/Kiritimati", "Etc/GMT+12", "Asia/Kolkata", "UTC", "America/New_York"]) {
    const code = helper + ';console.log(JSON.stringify(' + JSON.stringify(cases.map(c => c[0])) + '.map(i=>civilToday(new Date(i))))+"|"+addDays("2026-11-01",1)+"|"+mondayOf("2026-11-01"))';
    const r = spawnSync(process.execPath, ["-e", code], { env: { ...process.env, TZ: tz }, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), JSON.stringify(cases.map(c => c[1])) + "|2026-11-02|2026-10-26", `viewer zone ${tz}`);
  }
});

test("civil-date arithmetic crosses month, year, leap and DST edges", () => {
  assert.equal(X.addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(X.addDays("2027-02-28", 1), "2027-03-01");
  assert.equal(X.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(X.addDays("2027-01-01", -1), "2026-12-31");
  assert.equal(X.addDays("2026-11-01", 7), "2026-11-08");   // across the November DST change
  assert.equal(X.addDays("2027-03-08", 7), "2027-03-15");   // across the March DST change
  assert.equal(X.mondayOf("2027-01-01"), "2026-12-28");
  assert.equal(X.mondayOf("2026-11-01"), "2026-10-26");     // Sunday belongs to the week before
  assert.equal(X.mondayOf("2026-11-02"), "2026-11-02");
  assert.equal(X.mondayOf("2028-03-01"), "2028-02-28");
  assert.equal(X.weekLabel("2026-11-02"), "nov 2–8");
  assert.equal(X.weekLabel("2026-10-26"), "oct 26–nov 1");
  assert.equal(X.weekLabel("2026-12-28"), "dec 28–jan 3");
  assert.equal(X.weekLabel("2028-02-28"), "feb 28–mar 5");
  assert.equal(X.validDay("2027-02-29"), false);
  assert.equal(X.validDay("2028-02-29"), true);
  assert.equal(X.rangeLabel({ start: "2026-11-02", end: "2026-11-03" }), "mon 2–3");
  assert.equal(X.rangeLabel({ start: "2026-10-30", end: "2026-11-02" }), "fri 30–nov 2");
  assert.equal(X.rangeLabel({ start: "2026-11-06", end: "2026-11-06" }), "fri 6");
});

test("ranges are inclusive and events come only from public, confirmed, listed entries", () => {
  const evs = X.calEvents(X.FEATURES, X.CLASSES.filter(c => c.id !== "span"));
  const mor = evs.find(e => e.url === "/morality-ch4-5");
  assert(mor && mor.start === "2026-11-02" && mor.end === "2026-11-03");
  assert(X.onDay(mor, "2026-11-02") && X.onDay(mor, "2026-11-03") && !X.onDay(mor, "2026-11-04") && !X.onDay(mor, "2026-11-01"));
  assert(evs.some(e => e.url === "/apush-unit-3a" && e.start === "2026-11-06" && e.end === "2026-11-06"));
  assert(!evs.some(e => /psych-unit-2-7|precalc-limits/.test(e.url)), "unconfirmed guides have no feature");
  const pub = X.CLASSES.filter(c => c.id !== "span");
  const extra = [
    { classId: "span", title: "Spanish", url: "/spanish-ucscout-s1-midterm", test: "2026-11-04" },
    { classId: "psych", title: "Unconfirmed", url: "/psych-unit-2-7-2-8", test: "2026-11-03", unconfirmed: true },
    { classId: "apush", title: "Not a listed guide", url: "/apush-unit-9", test: "2026-11-05" },
    { classId: "apush", title: "Bad date", url: "/apush-unit-3a", test: "2026-02-30" },
    { classId: "nope", title: "Unknown class", url: "/apush-unit-3a", test: "2026-11-05" },
    { classId: "apush", title: "Backwards end", url: "/apush-unit-3a", test: "2026-11-05", end: "2026-11-01" }];
  const got = X.calEvents(extra, pub);
  assert.deepEqual(got.map(e => [e.t, e.start, e.end]), [["Backwards end", "2026-11-05", "2026-11-05"]]);
});

test("default week: current week unless nothing in it is still ahead and next week has a test", () => {
  const evs = X.calEvents(X.FEATURES, X.CLASSES.filter(c => c.id !== "span"));
  assert.equal(X.defaultWeek("2026-11-01", evs), "2026-11-02", "Sunday Nov 1 shows Nov 2–8");
  assert.equal(X.defaultWeek("2026-11-02", evs), "2026-11-02");
  assert.equal(X.defaultWeek("2026-10-28", evs), "2026-10-26", "a test ending today still counts");
  assert.equal(X.defaultWeek("2026-10-29", evs), "2026-11-02", "nothing left this week, next week (Nov 2–8) has tests");
  assert.equal(X.defaultWeek("2026-11-07", evs), "2026-11-02", "nothing ahead and next week empty: stay");
  assert.equal(X.defaultWeek("2027-06-02", evs), "2027-05-31", "empty week stays current");
});

test("controller: Nov 1 Pacific opens on Nov 2–8 with dots, today marking and the whole-week agenda", () => {
  const p = page("2026-11-02T07:30:00Z");                          // 11:30 p.m. Sunday Nov 1 in Los Angeles
  assert.equal(p.q("callabel").textContent, "nov 2–8");
  assert.equal(p.days().length, 7);
  assert.deepEqual(p.days().map(b => b.className.includes("has")), [true, true, false, false, true, false, false]);
  assert(p.days().every(b => b.getAttribute("aria-current") === null), "Nov 1 is not in this week");
  assert.equal(p.days().filter(b => b.tabIndex === 0).length, 1, "one tab stop");
  assert.match(p.day("2026-11-02").getAttribute("aria-label"), /^monday, november 2, 1 test$/);
  assert.deepEqual(p.rows().map(r => r.href), ["/morality-ch4-5", "/apush-unit-3a"]);
  assert.equal(p.rows()[0].children[0].textContent, "mon 2–3");
  assert.equal(p.rows()[0].children[0].getAttribute("datetime"), "2026-11-02");
  p.setNow("2026-11-02T08:05:00Z"); assert.equal(p.cal.refresh(), true);   // midnight in Los Angeles
  assert.equal(p.day("2026-11-02").getAttribute("aria-current"), "date");
  assert.match(p.day("2026-11-02").getAttribute("aria-label"), /, today, 1 test$/);
  assert.equal(p.day("2026-11-02").tabIndex, 0);
});

test("controller: a day filters, a second press clears, the range label resets, and focus stays put", () => {
  const p = page("2026-11-02T18:00:00Z");
  p.day("2026-11-03").fire("click");
  assert.equal(p.day("2026-11-03").getAttribute("aria-pressed"), "true");
  assert.equal(p.doc.activeElement, p.day("2026-11-03"), "focus returns to the re-rendered day");
  assert.deepEqual(p.rows().map(r => r.href), ["/morality-ch4-5"]);
  p.day("2026-11-04").fire("click");
  assert.deepEqual(p.rows(), []); assert.equal(p.empty(), "no tests listed for this day.");
  p.day("2026-11-04").fire("click");
  assert.equal(p.cal.state().sel, null); assert.equal(p.rows().length, 2);
  p.day("2026-11-06").fire("click"); p.q("callabel").fire("click");
  assert.equal(p.cal.state().sel, null); assert.equal(p.rows().length, 2);
  assert(p.days().every(b => b.getAttribute("aria-pressed") === "false"));
});

test("controller: arrows change the week, clear the day and show an honest empty week", () => {
  const p = page("2026-11-02T18:00:00Z");
  p.day("2026-11-06").fire("click");
  p.q("calnext").fire("click");
  assert.equal(p.q("callabel").textContent, "nov 9–15");
  assert.equal(p.cal.state().sel, null); assert.equal(p.cal.state().browsed, true);
  assert.equal(p.empty(), "no tests listed for this week.");
  p.q("calprev").fire("click"); p.q("calprev").fire("click");
  assert.equal(p.q("callabel").textContent, "oct 26–nov 1");
  assert.deepEqual(p.rows().map(r => r.href), ["/bus-unit-2"], "earlier weeks keep their public entries");
  p.q("calnext").fire("click");
  assert.equal(p.cal.state().browsed, false, "back on the default week");
});

test("controller: left, right, Home and End move between days with one tab stop", () => {
  const p = page("2026-11-04T18:00:00Z");
  const wed = p.day("2026-11-04"); assert.equal(wed.tabIndex, 0);
  assert.equal(wed.fire("keydown", { key: "ArrowRight" }).defaultPrevented, true);
  assert.equal(p.doc.activeElement, p.day("2026-11-05"));
  p.day("2026-11-05").fire("keydown", { key: "End" }); assert.equal(p.doc.activeElement, p.day("2026-11-08"));
  p.day("2026-11-08").fire("keydown", { key: "ArrowRight" }); assert.equal(p.doc.activeElement, p.day("2026-11-02"), "wraps");
  p.day("2026-11-02").fire("keydown", { key: "ArrowLeft" }); assert.equal(p.doc.activeElement, p.day("2026-11-08"));
  p.day("2026-11-08").fire("keydown", { key: "Home" }); assert.equal(p.doc.activeElement, p.day("2026-11-02"));
  assert.equal(p.days().filter(b => b.tabIndex === 0).length, 1);
  assert.equal(p.day("2026-11-02").fire("keydown", { key: "a" }).defaultPrevented, false);
});

test("controller: a day change moves the default week, but never a week the reader browsed to", () => {
  const p = page("2026-11-08T20:00:00Z");                          // Sunday Nov 8: nothing ahead, next week empty
  assert.equal(p.q("callabel").textContent, "nov 2–8");
  p.setNow("2026-11-09T09:00:00Z"); p.cal.refresh();               // Monday Nov 9
  assert.equal(p.q("callabel").textContent, "nov 9–15");
  const b = page("2026-11-02T18:00:00Z");
  b.q("calprev").fire("click");
  b.setNow("2026-11-03T18:00:00Z"); assert.equal(b.cal.refresh(), true);
  assert.equal(b.q("callabel").textContent, "oct 26–nov 1", "browsed week kept");
  assert.equal(b.cal.refresh(), false, "same day: no re-render");
});

test("controller: agenda links record the open, and text never goes in as markup", () => {
  const evil = [{ classId: "apush", title: "<img src=x onerror=alert(1)> study guide", url: "/apush-unit-3a", test: "2026-11-06" }];
  const p = page("2026-11-02T18:00:00Z", evil);
  const row = p.rows()[0];
  assert.equal(row.children[1].children[1].textContent, "<img src=x onerror=alert(1)>");
  row.fire("click");
  assert.equal(JSON.stringify(p.opened), JSON.stringify([["apush", "/apush-unit-3a", "<img src=x onerror=alert(1)> study guide"]]));
  assert(!/innerHTML/.test(CONTROLLER) && !/innerHTML/.test(HELPERS), "calendar code uses textContent only");
});

test("homepage markup: calendar in the sidebar, #homeart left for the stack only, old list gone, versions bumped", () => {
  const h = read("index.html");
  assert.match(h, /<div class="side">\s*<section class="cal" id="cal" aria-labelledby="calh" hidden>/);
  assert.match(h, /<\/section>\s*<div class="home-art" id="homeart"><\/div>\s*<\/div>/);
  assert(h.includes('id="calagenda" aria-live="polite"') && h.includes('aria-label="previous week"') && h.includes('aria-label="next week"'));
  assert(!h.includes('id="upnext"'));
  for (const f of ["index", "seminar", "business", "morality", "precalc", "apush", "psych", "lang", "physics"]) {
    const x = read(f + ".html"); assert(x.includes("/site.css?v=10") && x.includes("/site.js?v=9"), f);
  }
  assert(read("spanish.html").includes("/site.css?v=7"), "legacy Spanish shell untouched");
  assert(read("sw.js").includes('const V = "vg-offline-1"'), "offline cache name untouched");
});

test("reading order: the calendar comes before search and the class index in the DOM, with no CSS reordering", () => {
  const h = read("index.html"), css = read("site.css");
  const at = s => { const i = h.indexOf(s); assert(i >= 0, s); return i; };
  const open = at('<div class="opening">'), side = at('<div class="side">'), cal = at('id="cal"'), art = at('id="homeart"'),
        lead = at('<div class="lead">'), find = at('id="findw"'), catalog = at('id="catalog"'), results = at('id="inline"');
  assert(open < side && side < cal && cal < art && art < lead && lead < find && find < catalog && catalog < results,
    "DOM order: side (calendar, stack) then lead (search, classes, results)");
  assert(h.slice(art, lead).includes("</div>\n    </div>"), "#homeart closes the side column before the lead begins");
  assert(!/\.cal\{[^}]*order\s*:/.test(css) && !/\.(side|lead|cal|home-art)[^{]*\{[^}]*\border\s*:/.test(css), "no CSS order on the opening");
  assert(!/\.side\{[^}]*display:contents/.test(css), "the side column is never flattened");
  assert(css.includes("@media (min-width:900px){.opening > .lead{grid-column:1;grid-row:1}.opening > .side{grid-column:2;grid-row:1}}"),
    "wide screens place classes left and calendar right explicitly");
});

test("refresh keeps focus on an agenda link that survives the re-render (DOM detach semantics)", () => {
  const p = page("2026-11-02T18:00:00Z");                          // Monday Nov 2
  const before = p.rows().find(r => r.href === "/morality-ch4-5"); before.focus();
  assert.equal(p.doc.activeElement, before);
  p.setNow("2026-11-03T18:00:00Z"); assert.equal(p.cal.refresh(), true);
  const after = p.doc.activeElement;
  assert(after && after !== before && after.connected, "focus moved to the new, attached link");
  assert.equal(after.href, "/morality-ch4-5");
});

test("refresh moves focus to the range label when the focused event leaves the view", () => {
  const p = page("2026-11-08T20:00:00Z");                          // Sunday Nov 8: week Nov 2–8 shown
  p.rows().find(r => r.href === "/apush-unit-3a").focus();
  p.setNow("2026-11-09T09:00:00Z"); p.cal.refresh();               // Monday Nov 9: default moves to an empty week
  assert.equal(p.q("callabel").textContent, "nov 9–15");
  assert.equal(p.doc.activeElement, p.q("callabel"));
});

test("a day the reader selected keeps its week, filter and focus across midnight", () => {
  const p = page("2026-11-08T20:00:00Z");
  p.day("2026-11-06").fire("click");
  assert.equal(p.doc.activeElement, p.day("2026-11-06"));
  p.setNow("2026-11-09T09:00:00Z"); assert.equal(p.cal.refresh(), true);
  assert.equal(p.q("callabel").textContent, "nov 2–8", "no jump away from the reader's selection");
  assert.equal(p.cal.state().sel, "2026-11-06");
  assert.deepEqual(p.rows().map(r => r.href), ["/apush-unit-3a"]);
  assert.equal(p.doc.activeElement, p.day("2026-11-06"));
  assert.equal(p.cal.state().today, "2026-11-09");
  p.q("callabel").fire("click");                                   // clearing the day keeps the week until the next refresh
  assert.equal(p.cal.state().sel, null); assert.equal(p.q("callabel").textContent, "nov 2–8");
});
