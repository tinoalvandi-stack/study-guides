#!/usr/bin/env node
/* Dependency-free regression checks of the actual homepage search functions.
   Run: node --test tools/test-site-search.mjs
   SITE_JS and SITE_INDEX_HTML can point at an earlier revision for comparison.
   The DOM double checks rendered nodes, events, attributes and scroll requests;
   it does not claim to measure browser layout or screen-reader speech. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(process.env.SITE_JS || new URL("../site.js", import.meta.url), "utf8");
const html = readFileSync(process.env.SITE_INDEX_HTML || new URL("../index.html", import.meta.url), "utf8");
const data = readFileSync(new URL("../site-data.js", import.meta.url), "utf8");
const topics = readFileSync(new URL("../site-topics.js", import.meta.url), "utf8");
function between(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Search source section missing: ${start}`);
  return source.slice(a, b);
}

class Element {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.events = new Map();
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.dataset = {};
    this.hidden = false;
    this.value = "";
    this.scrollRequests = [];
    this.className = "";
    const classes = () => new Set(this.className.split(/\s+/).filter(Boolean));
    this.classList = {
      contains: name => classes().has(name),
      add: (...names) => { this.className = [...new Set([...classes(), ...names])].join(" "); },
      remove: (...names) => { this.className = [...classes()].filter(name => !names.includes(name)).join(" "); },
      toggle: (name, on = !classes().has(name)) => {
        this.classList[on ? "add" : "remove"](name); return on;
      }
    };
  }
  set textContent(value) { this.children = []; this.text = String(value); }
  get textContent() { return (this.text || "") + this.children.map(child => child.textContent).join(""); }
  set innerHTML(value) {
    this.children = []; this.text = ""; this.markup = value;
    // Search uses HTML only for decorative SVGs and chip labels. Keep an SVG
    // child so the real guideLink/appendExtras code can move or remove it.
    if (value.includes("<svg")) this.append(new Element("svg"));
  }
  get innerHTML() { return this.markup || ""; }
  get firstChild() { return this.children[0] || null; }
  append(...children) {
    for (let child of children) {
      if (typeof child === "string") { const text = new Element("#text"); text.textContent = child; child = text; }
      assert(child instanceof Element, "Only DOM nodes or text may be appended");
      child.remove(); child.parent = this; this.children.push(child);
    }
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
    this.parent = null;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelectorAll(selector) {
    const descendants = node => node.children.flatMap(child => [child, ...descendants(child)]);
    const matches = (node, part) => part.startsWith(".") ? node.classList.contains(part.slice(1))
      : part.startsWith("#") ? node.getAttribute("id") === part.slice(1) : node.tagName === part.toUpperCase();
    const results = selector.split(",").flatMap(group => group.trim().split(/\s+/).reduce(
      (nodes, part) => nodes.flatMap(node => descendants(node).filter(child => matches(child, part))), [this]));
    return [...new Set(results)];
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, handler) { this.events.set(type, [...(this.events.get(type) || []), handler]); }
  dispatch(type, detail = {}) {
    const event = { target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...detail };
    for (const handler of this.events.get(type) || []) handler(event);
    return event;
  }
  // A small scroll model for the selection-clearance checks. Only the sticky
  // bar and boxes placed by layout() have a position; every other node reports
  // an empty rectangle.
  get scrollModel() { let node = this; while (node.parent) node = node.parent; return node.model || null; }
  getBoundingClientRect() {
    const view = this.scrollModel;
    if (view && this.sticky) return { top: 0, bottom: view.bar, height: view.bar };
    if (!view || !this.box) return { top: 0, bottom: 0, height: 0 };
    const top = this.box.top - view.scrollY;
    return { top, bottom: top + this.box.height, height: this.box.height };
  }
  scrollIntoView(options) {
    this.scrollRequests.push(options);
    const view = this.scrollModel;
    if (!view || !this.box || options?.block !== "nearest") return;
    // CSSOM View "nearest" alignment; scroll-margin counts only when the
    // simulated engine honors it in scrollIntoView.
    const margin = side => view.honorsScrollMargin ? parseFloat(this.style[side]) || 0 : 0;
    const a = this.box.top - margin("scrollMarginTop"), b = this.box.top + this.box.height + margin("scrollMarginBottom");
    const top = view.scrollY, bottom = top + view.height, size = b - a;
    if (a < top && b > bottom) return;
    if ((a < top && size < view.height) || (b > bottom && size > view.height)) view.scrollTo(a);
    else if ((a < top && size > view.height) || (b > bottom && size < view.height)) view.scrollTo(b - view.height);
  }
  focus() { this.focused = true; }
  blur() { this.focused = false; }
}

function searchPage({ bar = 77, viewport = 900, honorsScrollMargin = true } = {}) {
  const body = new Element("body");
  const view = body.model = { bar, height: viewport, scrollY: 0, docHeight: viewport, honorsScrollMargin,
    outline: { width: 2, offset: 2 }, scrollBys: [],
    scrollTo(y) { this.scrollY = Math.max(0, Math.min(y, this.docHeight - this.height)); } };
  const stickyBar = new Element("header"); stickyBar.className = "bar"; stickyBar.sticky = true; body.append(stickyBar);
  const ids = new Set(["find", "findw", "hint", "searchSelection", "top", "inlinelist", "empty", "tophd", "otherhd", "inlinen", "findclr"]);
  // Take IDs and accessibility attributes from the real homepage, not a
  // hand-written substitute that would hide a missing status region.
  for (const tag of html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    if (!ids.has(tag[2])) continue;
    const node = new Element(tag[1]);
    for (const attr of tag[0].matchAll(/([\w-]+)="([^"]*)"/g)) node.setAttribute(attr[1], attr[2]);
    body.append(node);
  }
  const get = id => body.querySelector(`#${id}`);
  get("tophd").append(new Element("h2"));
  const opened = [], storage = new Map();
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ["2026-10-22T12:00:00Z"])); }
    static now() { return Date.parse("2026-10-22T12:00:00Z"); }
    getTimezoneOffset() { return 0; }
  }
  const context = vm.createContext({
    document: { body, querySelector: selector => body.querySelector(selector), createElement: tag => new Element(tag),
      createTextNode: text => { const node = new Element("#text"); node.textContent = text; return node; } },
    window: { open: (...args) => opened.push(args) },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    matchMedia: () => ({ matches: false }), Date: FixedDate,
    getComputedStyle: node => node.classList.contains("sel")
      ? { outlineStyle: "solid", outlineWidth: `${view.outline.width}px`, outlineOffset: `${view.outline.offset}px` }
      : { outlineStyle: "none", outlineWidth: "0px", outlineOffset: "0px" },
    scrollBy: (x, y) => { view.scrollBys.push(y); view.scrollTo(view.scrollY + y); },
    get innerHeight() { return view.height; }
  });
  vm.runInContext([
    data, topics,
    between("const PUBLIC_CLASSES", "/* ═══ class covers:"),
    between("function recordOpen(c,u){", "/* countdown ring:"),
    between("  /* fast find */", '  document.addEventListener("click",e=>{const b=e.target.closest(".eg")'),
    "globalThis.searchState = () => ({ hits: LAST, selected: SEL });"
  ].join("\n"), context, { filename: "actual-homepage-search.js" });
  return {
    get, body, opened, view,
    state: () => context.searchState(),
    // Place the top match and the list rows on a page taller than the window.
    layout({ top = 380, topHeight = 190, first = 600, rowHeight = 80, footer = 700 } = {}) {
      const rows = this.rows();
      rows.forEach((row, i) => { row.box = i ? { top: first + (i - 1) * rowHeight, height: rowHeight - 6 } : { top, height: topHeight }; });
      const last = rows.at(-1).box; view.docHeight = last.top + last.height + footer;
    },
    rows: () => [...get("top").querySelectorAll(".topm"), ...get("inlinelist").querySelectorAll(".unit")],
    input(query) { get("find").value = query; get("find").dispatch("input"); },
    key(key) { return get("find").dispatch("keydown", { key }); },
    enter() {
      // A browser's unhandled Enter in this search input implicitly submits
      // its form. Deliver that native default action to the real submit hook.
      const event = this.key("Enter");
      if (!event.defaultPrevented) return get("findw").dispatch("submit");
      return event;
    }
  };
}

test("search selection has an atomic polite status region in the actual homepage", () => {
  const region = searchPage().get("searchSelection");
  assert(region, "Search selection status region must exist");
  assert.equal(region.getAttribute("role"), "status");
  assert.equal(region.getAttribute("aria-live"), "polite");
  assert.equal(region.getAttribute("aria-atomic"), "true");
});

for (const query of ["unit", "practice"]) {
  test(`all ranked ${JSON.stringify(query)} results are rendered and match the displayed count`, () => {
    const page = searchPage(); page.input(query);
    const total = page.state().hits.length;
    assert(total > 8, "The real catalogue supplies more than eight results");
    assert.equal(page.get("inlinen").textContent, `${total} guides`);
    assert.equal(page.rows().length, total, "No ranked result may be absent from the rendered list");
    assert.equal(new Set(page.rows().map(row => row.href)).size, total);
    assert.equal(page.body.classList.contains("searching"), true);
    assert.equal(page.get("hint").hidden, true);
  });
}

test("arrows reach results beyond eight, mark only that row, announce it, and request visibility", () => {
  const page = searchPage(); page.input("unit");
  const total = page.state().hits.length;
  for (let presses = 1; presses <= total; presses++) {
    const event = page.key("ArrowDown"), position = presses % total;
    assert.equal(event.defaultPrevented, true);
    const rows = page.rows(), selected = rows.filter(row => row.classList.contains("sel"));
    assert.equal(selected.length, 1, `ArrowDown ${presses}: selected result must be rendered`);
    assert.equal(selected[0], rows[position]);
    assert.deepEqual(rows.filter(row => row.getAttribute("aria-current") === "true").map(row => row.href), selected.map(row => row.href));
    const request = selected[0].scrollRequests.at(-1);
    assert(request, `Result ${position + 1} must be scrolled into view`);
    assert.equal(request.block, "nearest");
    assert.equal(request.behavior, "auto");
    const announcement = page.get("searchSelection")?.textContent || "";
    assert(announcement.startsWith(`Result ${position + 1} of ${total}: `));
    assert(announcement.includes(page.state().hits[position].it.u.t));
    assert(announcement.endsWith("Press Enter to open."));
  }
  page.key("ArrowUp");
  assert.equal(page.rows()[total - 1].getAttribute("aria-current"), "true", "ArrowUp wraps to the last rendered result");
  assert(page.get("searchSelection").textContent.startsWith(`Result ${total} of ${total}:`));
});

test("Enter after eight ArrowDown presses opens the ninth visible result", () => {
  const page = searchPage(); page.input("unit");
  for (let n = 0; n < 8; n++) page.key("ArrowDown");
  const selected = page.rows().find(row => row.classList.contains("sel"));
  assert(selected, "The ninth result must be visible before opening it");
  assert.equal(selected.href, "/bus-unit-1");
  assert.equal(page.get("searchSelection").textContent, `Result 9 of ${page.state().hits.length}: Business Principles, Unit 1. Press Enter to open.`);
  assert.equal(page.enter().defaultPrevented, true, "Search submission should not navigate the form");
  assert.deepEqual(page.opened, [["/bus-unit-1", "_blank", "noopener"]]);
});

for (const method of ["clear button", "Escape"]) {
  test(`${method} clears the query, announcement and active search, and prevents stale opens`, () => {
    const page = searchPage(); page.input("unit");
    for (let n = 0; n < 10; n++) page.key("ArrowDown");
    if (method === "clear button") page.get("findclr").dispatch("click");
    else page.key("Escape");
    assert.equal(page.get("find").value, "");
    assert.equal(page.state().hits.length, 0);
    assert.equal(page.body.classList.contains("searching"), false);
    assert.equal(page.get("findw").classList.contains("has"), false);
    assert.equal(page.get("hint").hidden, false);
    assert.equal(page.get("searchSelection")?.textContent || "", "");
    assert.equal(page.get("find").focused, method === "clear button");
    assert.equal(page.key("ArrowDown").defaultPrevented, false);
    page.enter(); assert.deepEqual(page.opened, [], "Cleared search cannot open the previous selection");
    page.input("unit");
    assert.equal(page.state().selected, 0, "A fresh search starts at its first result");
    assert.equal(page.rows().some(row => row.classList.contains("sel") || row.getAttribute("aria-current")), false);
    page.enter(); assert.deepEqual(page.opened, [["/apush-unit-2-leq", "_blank", "noopener"]]);
  });
}

// Selection clearance (F1). The bar height and the selection outline are read
// from the page on every move; 77px and 85.5px are the bar heights measured at
// 320px and 1440px wide. Engines that honor and that ignore scroll-margin in
// scrollIntoView are both modeled.
function assertClear(page, label) {
  const row = page.rows().find(r => r.classList.contains("sel"));
  assert(row, `${label}: a result is selected`);
  const rect = row.getBoundingClientRect(), ring = page.view.outline.width + page.view.outline.offset;
  assert(rect.top - ring >= page.view.bar, `${label}: outline top at ${rect.top - ring}px is under the ${page.view.bar}px bar`);
  assert(rect.bottom + ring <= page.view.height, `${label}: outline bottom at ${rect.bottom + ring}px is past the ${page.view.height}px window`);
  const request = row.scrollRequests.at(-1);
  assert.equal(request?.block, "nearest");
  assert.equal(request?.behavior, "auto");
}
const engines = [[true, "scroll-margin honored"], [false, "scroll-margin ignored"]];

for (const bar of [77, 85.5]) {
  for (const [honorsScrollMargin, engine] of engines) {
    test(`every ArrowUp and ArrowDown, both wraps included, keeps the selection clear of a ${bar}px bar (${engine})`, () => {
      const page = searchPage({ bar, honorsScrollMargin }); page.input("unit"); page.layout();
      const n = page.state().hits.length;
      assert(n > 8, "The catalogue makes a list taller than the window");
      for (let press = 1; press <= n + 1; press++) { page.key("ArrowUp"); assertClear(page, `ArrowUp ${press}`); }
      assert.equal(page.state().selected, n - 1, "ArrowUp wrapped from the top match to the last result");
      for (let press = 1; press <= n + 1; press++) { page.key("ArrowDown"); assertClear(page, `ArrowDown ${press}`); }
      assert.equal(page.state().selected, 0, "ArrowDown wrapped from the last result to the top match");
    });
  }
}

for (const [honorsScrollMargin, engine] of engines) {
  test(`a selection already clear of the bar does not move the page (${engine})`, () => {
    const page = searchPage({ honorsScrollMargin }); page.input("unit"); page.layout();
    page.key("ArrowDown"); assertClear(page, "second result");
    assert.equal(page.view.scrollY, 0);
    assert.deepEqual(page.view.scrollBys, []);
  });

  test(`clearance follows the bar and the window as they change size (${engine})`, () => {
    const page = searchPage({ bar: 77, honorsScrollMargin }); page.input("unit"); page.layout();
    for (let press = 0; press < 6; press++) page.key("ArrowUp");
    page.view.bar = 132; // the bar wraps to two lines or grows with text zoom
    for (let press = 1; press <= 6; press++) { page.key("ArrowUp"); assertClear(page, `taller bar, ArrowUp ${press}`); }
    page.view.height = 568; // a shorter window, such as a phone turned sideways
    for (let press = 1; press <= 8; press++) { page.key("ArrowDown"); assertClear(page, `shorter window, ArrowDown ${press}`); }
  });
}
