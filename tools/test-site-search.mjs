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
  scrollIntoView(options) { this.scrollRequests.push(options); }
  focus() { this.focused = true; }
  blur() { this.focused = false; }
}

function searchPage() {
  const body = new Element("body");
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
    matchMedia: () => ({ matches: false }), Date: FixedDate
  });
  vm.runInContext([
    data, topics,
    between("const PUBLIC_CLASSES", "/* ═══ class covers:"),
    between("function recordOpen(c,u){", "/* countdown ring:"),
    between("  /* fast find */", '  document.addEventListener("click",e=>{const b=e.target.closest(".eg")'),
    "globalThis.searchState = () => ({ hits: LAST, selected: SEL });"
  ].join("\n"), context, { filename: "actual-homepage-search.js" });
  return {
    get, body, opened,
    state: () => context.searchState(),
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
  test(`all 17 ranked ${JSON.stringify(query)} results are rendered and match the displayed count`, () => {
    const page = searchPage(); page.input(query);
    assert.equal(page.state().hits.length, 17, "The real catalogue supplies the regression case");
    assert.equal(page.get("inlinen").textContent, "17 guides");
    assert.equal(page.rows().length, 17, "No ranked result may be absent from the rendered list");
    assert.equal(new Set(page.rows().map(row => row.href)).size, 17);
    assert.equal(page.body.classList.contains("searching"), true);
    assert.equal(page.get("hint").hidden, true);
  });
}

test("arrows reach results beyond eight, mark only that row, announce it, and request visibility", () => {
  const page = searchPage(); page.input("unit");
  for (let presses = 1; presses <= 17; presses++) {
    const event = page.key("ArrowDown"), position = presses % 17;
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
    assert(announcement.startsWith(`Result ${position + 1} of 17: `));
    assert(announcement.includes(page.state().hits[position].it.u.t));
    assert(announcement.endsWith("Press Enter to open."));
  }
  page.key("ArrowUp");
  assert.equal(page.rows()[16].getAttribute("aria-current"), "true", "ArrowUp wraps to the last rendered result");
  assert.match(page.get("searchSelection").textContent, /^Result 17 of 17:/);
});

test("Enter after eight ArrowDown presses opens the ninth visible result", () => {
  const page = searchPage(); page.input("unit");
  for (let n = 0; n < 8; n++) page.key("ArrowDown");
  const selected = page.rows().find(row => row.classList.contains("sel"));
  assert(selected, "The ninth result must be visible before opening it");
  assert.equal(selected.href, "/bus-unit-1");
  assert.equal(page.get("searchSelection").textContent, "Result 9 of 17: Business Principles, Unit 1. Press Enter to open.");
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
