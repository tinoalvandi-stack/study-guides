#!/usr/bin/env node
/* Dependency-free checks of the actual template functions and print-filter CSS.
   Run: node --test tools/test-guide-regressions.mjs
   GUIDE_TEMPLATE may point to a previous template when checking regressions. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(process.env.GUIDE_TEMPLATE || new URL("../template/guide-template.html", import.meta.url), "utf8");
const between = (start, end) => {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Template section missing: ${start}`);
  return source.slice(a, b);
};

/* Small event/element doubles keep these tests focused on card state. They do
   not simulate browser layout; responsive and rendered print QA is separate. */
class Element {
  constructor(tag = "div", classes = "", html = "") {
    this.tagName = tag.toUpperCase();
    this.innerHTML = html;
    this.hidden = false;
    this.children = [];
    this.events = new Map();
    this.queries = new Map();
    const set = new Set(classes.split(" "));
    this.classList = {
      contains: c => set.has(c),
      add: c => set.add(c),
      remove: c => set.delete(c),
      toggle(c, on = !set.has(c)) { on ? set.add(c) : set.delete(c); return on; }
    };
  }
  set innerHTML(html) { this.html = html; this.queries?.clear(); }
  get innerHTML() { return this.html; }
  setAttribute(name, value) { this[name] = value; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(selector) {
    if (!this.queries.has(selector)) {
      const n = new Element();
      const face = selector.match(/^\.([fb])(?: \.face-value)?$/);
      if (face) {
        const html = this.innerHTML.match(new RegExp(`<div class="${face[1]}"[^>]*>([\\s\\S]*?)</div>`))?.[1] || "";
        n.textContent = html.match(/class="face-value">([\s\S]*?)<\/span>/)?.[1] || "";
      }
      this.queries.set(selector, n);
    }
    return this.queries.get(selector);
  }
  addEventListener(name, fn) { this.events.set(name, fn); }
  dispatch(name, event = {}) { this.events.get(name)?.(event); }
  focus() { this.focused = true; }
}
function cards(count = 4) {
  const nodes = new Map(), events = new Map();
  const sec = new Element("section", "on");
  const math = Object.create(Math); math.random = () => 0;
  const context = vm.createContext({
    GUIDE: { cls: "Test course", cards: Array.from({ length: count }, (_, i) => ({ f: `term-${i}`, b: `answer-${i}` })) },
    el(tag, classes, html) { const n = new Element(tag, classes, html); nodes.set(classes, n); return n; },
    plain: String, esc: String, shead: () => new Element(), OPEN: false, Math: math,
    addEventListener(name, fn) { events.set(name, fn); }
  });
  vm.runInContext(between("function buildCards(sec){", "\n/* timeline */"), context);
  context.buildCards(sec);
  const get = name => nodes.get(name);
  const control = (group, action) => get(group).querySelector(`[data-a="${action}"]`);
  return {
    current: () => Number(get("fc").innerHTML.match(/term-(\d+)/)[1]),
    finished: () => !get("ddone").hidden,
    summary: () => get("ddone").innerHTML,
    marked: () => get("dstudy").querySelector(".mk").textContent,
    accessibility() {
      const help = get("deck").children.find(n => n.id === get("fc")["aria-describedby"]);
      const status = get("deck").children.find(n => n.role === "status");
      return {
        name: get("fc")["aria-label"], description: help?.textContent,
        frontHidden: get("fc").querySelector(".f")["aria-hidden"],
        backHidden: get("fc").querySelector(".b")["aria-hidden"],
        announcement: status?.textContent, live: status?.["aria-live"], atomic: status?.["aria-atomic"]
      };
    },
    flip() { get("fc").dispatch("click"); },
    nav(action) { control("dnav", action).dispatch("click"); },
    rate(action = "got") {
      if (!get("fc").classList.contains("flip")) control("dstudy", "flip").dispatch("click");
      assert.equal(control("dstudy", action).hidden, false);
      control("dstudy", action).dispatch("click");
    },
    restart(action) { get("ddone").dispatch("click", { target: { closest: () => ({ dataset: { a: action } }) } }); },
    key(key) { events.get("keydown")({ key, target: { tagName: "BODY" } }); },
    swipe(dx) { get("fc").dispatch("touchstart", { touches: [{ clientX: 100 }] }); get("fc").dispatch("touchend", { changedTouches: [{ clientX: 100 + dx }] }); },
    seek(id) { for (let n = 0; this.current() !== id && n < count; n++) this.nav("next"); assert.equal(this.current(), id); }
  };
}

test("rating the last card does not finish an otherwise unchecked deck", () => {
  const deck = cards();
  deck.nav("prev"); assert.equal(deck.current(), 3);
  deck.rate(); assert.equal(deck.finished(), false); assert.equal(deck.current(), 0);
  deck.rate(); deck.rate(); assert.equal(deck.finished(), false);
  deck.rate(); assert.equal(deck.finished(), true);
});

test("re-rating a card changes its review mark without counting it twice", () => {
  const deck = cards();
  deck.rate("again"); assert.match(deck.marked(), /1 marked/);
  deck.seek(0); deck.rate(); assert.equal(deck.marked(), "");
  assert.equal(deck.current(), 1); assert.equal(deck.finished(), false);
  deck.rate(); deck.rate(); assert.equal(deck.finished(), false);
  deck.rate(); assert.match(deck.summary(), /All 4 cards checked/);
});

test("shuffle preserves ratings by card identity, independently of position", () => {
  const deck = cards();
  deck.rate(); deck.nav("shuf");
  deck.seek(3); deck.rate(); assert.equal(deck.finished(), false);
  deck.seek(0); deck.rate(); assert.equal(deck.finished(), false);
  deck.seek(1); deck.rate(); assert.equal(deck.finished(), false);
  deck.seek(2); deck.rate(); assert.equal(deck.finished(), true);
});

test("review subsets and full-deck restarts require fresh ratings", () => {
  const deck = cards();
  deck.rate("again"); deck.rate(); deck.rate("again"); deck.rate();
  assert.match(deck.summary(), /Review marked cards \(2\)/);
  deck.restart("rev"); assert.equal(deck.current(), 0);
  deck.nav("prev"); assert.equal(deck.current(), 2);
  deck.rate(); assert.equal(deck.finished(), false); assert.equal(deck.current(), 0);
  deck.rate("again"); assert.equal(deck.finished(), true);
  assert.match(deck.summary(), /Review marked cards \(1\)/);
  deck.restart("full"); deck.nav("prev"); deck.rate();
  assert.equal(deck.finished(), false);
  deck.rate(); deck.rate(); deck.rate(); assert.match(deck.summary(), /All 4 cards checked/);
});

test("keyboard and swipe navigation do not count as ratings", () => {
  const deck = cards();
  deck.key("ArrowLeft"); assert.equal(deck.current(), 3);
  deck.swipe(-60); assert.equal(deck.current(), 0);
  deck.swipe(60); assert.equal(deck.current(), 3);
  deck.rate(); assert.equal(deck.finished(), false);
});

test("one-card decks finish after their one rating", () => {
  const deck = cards(1); deck.rate();
  assert.equal(deck.finished(), true); assert.match(deck.summary(), /All 1 cards checked/);
});

test("flashcards expose and announce only the visible face through flips and navigation", () => {
  const deck = cards();
  const face = (term, index) => {
    const a = deck.accessibility();
    assert.equal(a.name, `${term ? "Term" : "Answer"}: ${term ? "term" : "answer"}-${index}`);
    assert.equal(a.frontHidden, String(!term));
    assert.equal(a.backHidden, String(term));
    assert.match(a.description, new RegExp(`Card ${index + 1} of 4`));
    assert.match(a.description, new RegExp(`show the ${term ? "answer" : "term"}`));
    assert.equal(a.announcement, `Card ${index + 1} of 4. ${a.name}`);
    assert.equal(a.live, "polite"); assert.equal(a.atomic, "true");
    if (term) assert(!a.announcement.includes("answer-"), "Unrevealed answer is not announced");
  };
  face(true, 0);
  deck.flip(); face(false, 0);
  deck.flip(); face(true, 0);
  deck.nav("next"); face(true, 1);
  deck.flip(); face(false, 1);
  deck.rate(); face(true, 2);
  deck.key("ArrowLeft"); face(true, 1);
  deck.swipe(60); face(true, 0);
});

function routing(hash, current = null) {
  const calls = [];
  const context = vm.createContext({
    location: { hash }, PANES: ["outline", "practice"], CUR: current,
    document: { getElementById: id => id === "s-3" ? { closest: () => ({ id: "p-outline" }) } : null },
    show(id, user) { context.CUR = id; calls.push(["show", id, user]); },
    goTo(id, instant) { calls.push(["goTo", id, instant]); },
    requestAnimationFrame(fn) { fn(); }
  });
  vm.runInContext(between("function route(instant){", "\nroute(true);"), context);
  context.route(true);
  return { calls, current: context.CUR };
}

test("malformed percent encodings fall back without interrupting initialization", () => {
  for (const hash of ["#%", "#%ZZ", "#%E0%A4%A", "#%ED%A0%80", "#%F0%28%8C%28"]) {
    assert.equal(routing(hash).current, "outline", hash);
    assert.equal(routing(hash, "practice").current, "outline", hash);
  }
});

test("valid pane/lesson hashes and existing unknown-hash behavior stay intact", () => {
  assert.deepEqual(routing("#%70ractice").calls, [["show", "practice", false]]);
  assert.deepEqual(routing("#s%2D3").calls, [["show", "outline", false], ["goTo", "s-3", true]]);
  assert.equal(routing("#missing").current, "outline");
  assert.equal(routing("#missing", "practice").current, "practice");
  assert.equal(routing("", "practice").current, "outline");
});

function cssRules(css, media = [], rules = []) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let pos = 0;
  while (pos < css.length) {
    const start = css.indexOf("{", pos); if (start < 0) break;
    const selector = css.slice(pos, start).trim();
    let end = start + 1, depth = 1;
    while (depth && end < css.length) { if (css[end] === "{") depth++; if (css[end] === "}") depth--; end++; }
    assert.equal(depth, 0, "Balanced CSS blocks");
    const body = css.slice(start + 1, end - 1);
    if (selector.startsWith("@media")) cssRules(body, [...media, selector.slice(6).trim()], rules);
    else if (!selector.startsWith("@")) rules.push({ selector, body, media });
    pos = end;
  }
  return rules;
}

test("search hiding is screen-only and print does not override native item display", () => {
  const rules = cssRules(source.match(/<style>([\s\S]*?)<\/style>/)[1]);
  const sx = rules.filter(r => r.selector.split(",").map(s => s.trim()).includes(".sx"));
  assert(sx.some(r => /display\s*:\s*none\s*!important/.test(r.body)), "Screen search still filters");
  assert(sx.every(r => r.media.some(m => /^screen(?:\s|$)/.test(m))), "Search filter must not apply to print");
  assert(rules.some(r => r.media.includes("print") && r.selector.split(",").includes(".nores") && /display\s*:\s*none\s*!important/.test(r.body)), "No-results UI stays out of print");
});

test("every inline script in the template parses", () => {
  for (const script of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});
