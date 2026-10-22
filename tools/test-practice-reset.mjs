#!/usr/bin/env node
/* Run: node --test tools/test-practice-reset.mjs
 * GUIDE_TEMPLATE=/absolute/path/to/template.html selects a candidate.
 * Executes the real buildPractice and search/Show answers setup from the file.
 * DOM doubles model card state/events, not visual layout or browser rendering.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(process.env.GUIDE_TEMPLATE || new URL("../template/guide-template.html", import.meta.url), "utf8");
function between(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Actual template section missing: ${start}`);
  return source.slice(a, b);
}

class Element {
  constructor(tag = "div", owner, classes = "") {
    this.tagName = tag.toUpperCase(); this.ownerDocument = owner;
    this.children = []; this.parentElement = null; this.attributes = new Map();
    this.dataset = {}; this.events = new Map(); this.style = {};
    this.hidden = false; this.disabled = false; this.value = ""; this._text = "";
    const classesSet = new Set();
    this.classList = {
      contains: name => classesSet.has(name),
      add: (...names) => names.forEach(name => classesSet.add(name)),
      remove: (...names) => names.forEach(name => classesSet.delete(name)),
      toggle(name, force = !classesSet.has(name)) { force ? classesSet.add(name) : classesSet.delete(name); return force; },
      toString: () => [...classesSet].join(" ")
    };
    this.className = classes;
  }
  set className(value) { for (const name of this.classList.toString().split(/\s+/)) this.classList.remove(name); this.classList.add(...String(value).split(/\s+/).filter(Boolean)); }
  get className() { return this.classList.toString(); }
  setAttribute(name, value) {
    value = String(value); this.attributes.set(name, value);
    if (name === "class") this.className = value;
    else if (name === "id") this.id = value;
    else if (name === "hidden") this.hidden = true;
    else if (name === "disabled") this.disabled = true;
    else if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  getAttribute(name) { return name === "class" ? this.className : this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); if (name === "hidden") this.hidden = false; if (name === "disabled") this.disabled = false; }
  appendChild(child) { child.remove(); child.parentElement = this; this.children.push(child); return child; }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  prepend(child) { this.insertBefore(child, this.firstChild); }
  insertBefore(child, before) { child.remove(); child.parentElement = this; const i = this.children.indexOf(before); this.children.splice(i < 0 ? this.children.length : i, 0, child); return child; }
  remove() { if (this.parentElement) { const p = this.parentElement; p.children.splice(p.children.indexOf(this), 1); this.parentElement = null; } }
  get firstChild() { return this.children[0] || null; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
  set textContent(value) { this.children.forEach(child => { child.parentElement = null; }); this.children = []; this._text = String(value); }
  set innerHTML(html) {
    this.textContent = "";
    const stack = [this];
    for (const token of String(html).match(/<[^>]+>|[^<]+/g) || []) {
      if (token.startsWith("</")) { stack.pop(); continue; }
      if (token.startsWith("<")) {
        const match = token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);
        if (!match) continue;
        const child = new Element(match[1], this.ownerDocument);
        for (const attribute of match[2].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) child.setAttribute(attribute[1], attribute[2] ?? attribute[3] ?? attribute[4] ?? "");
        stack.at(-1).appendChild(child);
        if (!/^(input|br|hr|img|meta|link)$/i.test(match[1]) && !token.endsWith("/>")) stack.push(child);
      } else stack.at(-1)._text += token;
    }
  }
  insertAdjacentHTML(position, html) {
    const fragment = new Element("fragment", this.ownerDocument); fragment.innerHTML = html;
    for (const child of [...fragment.children]) {
      if (position === "beforebegin") { assert(this.parentElement); this.parentElement.insertBefore(child, this); }
      else if (position === "beforeend") this.appendChild(child);
      else throw new Error(`Unsupported insertion ${position}`);
    }
  }
  matches(selector) {
    const s = selector.trim();
    const attrs = [...s.matchAll(/\[([^=\]]+)(?:=["']?([^\]"']*)["']?)?\]/g)];
    if (attrs.some(([, name, value]) => this.getAttribute(name) === null || (value !== undefined && this.getAttribute(name) !== value))) return false;
    const base = s.replace(/\[[^\]]+\]/g, "");
    const tag = base.match(/^[\w-]+/)?.[0];
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    const id = base.match(/#([\w-]+)/)?.[1];
    if (id && this.id !== id) return false;
    return [...base.matchAll(/\.([\w-]+)/g)].every(([, name]) => this.classList.contains(name));
  }
  querySelectorAll(selector) {
    const result = [];
    const match = (node, branch) => {
      const parts = branch.trim().split(/\s+(?![^\[]*\])/); let i = parts.length - 1;
      if (!node.matches(parts[i--])) return false;
      for (let parent = node.parentElement; i >= 0 && parent; parent = parent.parentElement) if (parent.matches(parts[i])) i--;
      return i < 0;
    };
    const visit = parent => { for (const child of parent.children) { if (selector.split(",").some(branch => match(child, branch))) result.push(child); visit(child); } };
    visit(this); return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let n = this; n; n = n.parentElement) if (n.matches(selector)) return n; return null; }
  addEventListener(type, callback) { const list = this.events.get(type) || []; list.push(callback); this.events.set(type, list); }
  dispatch(type, details = {}) { const event = { target: this, currentTarget: this, preventDefault() {}, ...details }; for (const callback of this.events.get(type) || []) callback(event); }
  click() { if (!this.disabled) this.dispatch("click"); }
  focus() { this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = this.ownerDocument.body; }
  scrollIntoView() {}
  getBoundingClientRect() { return { top: 100, bottom: 150, left: 0, right: 500 }; }
}

function practice() {
  const document = { activeElement: null };
  const body = document.body = new Element("body", document);
  document.activeElement = body;
  document.querySelector = selector => body.querySelector(selector);
  document.querySelectorAll = selector => body.querySelectorAll(selector);
  const el = (tag, classes, html) => { const element = new Element(tag, document, classes || ""); if (html != null) element.innerHTML = html; return element; };
  const add = (id, parent = body, tag = "div", classes = "") => { const n = el(tag, classes); n.setAttribute("id", id); parent.appendChild(n); return n; };
  const root = add("root"), sec = add("p-practice", root, "section", "pane on");
  const score = add("score"); add("scn", score).textContent = "0"; add("sct", score); add("reset", score, "button");
  const bar = add("bar"); bar.offsetHeight = 60;
  const show = add("showall", body, "button"); show.hidden = true; show.setAttribute("aria-pressed", "false"); show.innerHTML = '<span class="mt">Show answers</span>';
  for (const id of ["q", "srch", "sstat", "qx", "sbtn", "gctl", "printb"]) add(id);
  let now = 1000, nextTimer = 1; const timers = new Map();
  const context = vm.createContext({
    document, root, bar, CUR: "practice", PANES: [], REDUCED: true, innerHeight: 800, scrollY: 0,
    GUIDE: { practice: [
      { q: "single zero", opts: ["yes", "no", "other"], a: 0, why: "zero" },
      { q: "single one", opts: ["no", "yes", "other"], a: 1, why: "one" },
      { q: "multiple", opts: ["yes", "no", "yes"], a: [0, 2], why: "two choices" }
    ] },
    $: selector => document.querySelector(selector), el, plain: String, esc: String, has: value => Array.isArray(value) && value.length > 0,
    performance: { now: () => now }, closeMenu() {}, addEventListener() {}, scrollTo() {}, print() {},
    setTimeout(fn, delay = 0) { const id = nextTimer++; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(between("let SCORE=", "\n/* problems: steps"), context);
  context.buildPractice(sec);
  vm.runInContext(between("/* search: filters every pane", "\n/* theme (shared"), context);
  const grid = sec.querySelector(".qgrid"), cards = grid.querySelectorAll(".q"), rbar = sec.querySelector(".rbar");
  return {
    document, cards, grid, rbar,
    score: () => JSON.parse(vm.runInContext("JSON.stringify(SCORE)", context)),
    advance(ms = 501) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); } },
    choose(i, option) { cards[i].querySelectorAll(".opt")[option].click(); },
    check(i) { const button = cards[i].querySelector(".mchk .btn"); button.focus(); button.click(); },
    reset() { document.querySelector("#reset").click(); },
    retry() { document.querySelector("#retry").click(); },
    showAnswers() { if (!root.classList.contains("showall")) show.click(); },
    showingAnswers: () => root.classList.contains("showall"),
    showControl: () => ({ pressed: show.getAttribute("aria-pressed"), label: show.querySelector(".mt").textContent }),
    retryControl: () => document.querySelector("#retry"),
    roundText: () => rbar.querySelector(".rst").textContent
  };
}

test("REGRESSION: start over after Show answers restores hidden answers and answer input", () => {
  const p = practice();
  p.choose(0, 1); p.choose(1, 1); p.showAnswers();
  assert.equal(p.showingAnswers(), true);
  assert.deepEqual(p.showControl(), { pressed: "true", label: "Hide answers" });
  p.advance(); p.reset(); p.advance();
  assert.equal(p.showingAnswers(), false, "Reset must leave Show answers mode, not merely clear scores");
  assert.deepEqual(p.showControl(), { pressed: "false", label: "Show answers" });
  assert.deepEqual(p.score(), { done: 0, right: 0, total: 3 });
  p.choose(0, 0);
  assert.deepEqual(p.score(), { done: 1, right: 1, total: 3 }, "A fresh answer must be accepted after the debounce interval");
});

test("REGRESSION: answer input is usable after reset from Show answers", () => {
  const p = practice(); p.showAnswers(); p.reset(); p.advance(); p.choose(0, 0);
  assert.deepEqual(p.score(), { done: 1, right: 1, total: 3 }, "Show answers must not keep reset questions locked");
});

test("first tries count once; duplicate answer clicks do not revise the score", () => {
  const p = practice();
  p.choose(0, 1); p.choose(0, 0); p.choose(1, 1);
  p.choose(2, 0); p.choose(2, 2); p.check(2); p.check(2);
  assert.deepEqual(p.score(), { done: 3, right: 2, total: 3 });
  assert.equal(p.retryControl().hidden, false);
  assert.equal(p.retryControl().textContent, "retry missed (1)");
});

test("retry disables Show answers, preserves first-try score and guards the moved controls", () => {
  const p = practice(); p.choose(0, 1); p.choose(1, 1); p.showAnswers();
  p.retry();
  assert.equal(p.showingAnswers(), false);
  assert.deepEqual(p.showControl(), { pressed: "false", label: "Show answers" });
  assert.match(p.roundText(), /retry round 1: 0 of 1/);
  assert.equal(p.cards[0].classList.contains("rx"), false);
  assert.equal(p.cards[1].classList.contains("rx"), true);
  p.choose(0, 0); p.reset();
  assert.deepEqual(p.score(), { done: 2, right: 1, total: 3 }, "Immediate second click cannot answer or reset");
  assert.equal(p.cards[0].classList.contains("done"), false);
  p.advance(); p.choose(0, 0); p.choose(0, 1);
  assert.deepEqual(p.score(), { done: 2, right: 1, total: 3 });
  assert.match(p.roundText(), /all fixed/);
  assert.match(p.roundText(), /first-try score stays 1 of 3/);
});

test("further retry rounds keep their missed subset and first-try score", () => {
  const p = practice(); p.choose(0, 1); p.choose(1, 1); p.retry(); p.advance(); p.choose(0, 1);
  assert.match(p.roundText(), /round 1 done: 0 of 1 now right, 1 still missed/);
  p.retry(); p.retry();
  assert.match(p.roundText(), /retry round 2: 0 of 1/);
  p.advance(); p.choose(0, 0);
  assert.deepEqual(p.score(), { done: 2, right: 1, total: 3 });
  assert.match(p.roundText(), /all fixed/);
});

test("ordinary reset clears retry, feedback and multi-select state without bypassing its debounce", () => {
  const p = practice(); p.choose(0, 1); p.choose(2, 1); p.check(2); p.retry(); p.advance(); p.reset();
  assert.deepEqual(p.score(), { done: 0, right: 0, total: 3 });
  assert.equal(p.retryControl().hidden, true); assert.equal(p.rbar.hidden, true);
  assert.equal(p.document.activeElement, p.grid);
  for (const card of p.cards) {
    assert.equal(card.classList.contains("done"), false); assert.equal(card.classList.contains("rx"), false);
    assert.equal(card.querySelectorAll(".right,.wrong,.sel,.ftag").length, 0);
    assert.equal(card.querySelector(".vh").textContent, "");
  }
  p.choose(0, 0); assert.equal(p.score().done, 0);
  p.advance(); p.choose(0, 0); assert.deepEqual(p.score(), { done: 1, right: 1, total: 3 });
});
