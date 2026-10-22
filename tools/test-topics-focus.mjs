#!/usr/bin/env node
/* Dependency-free behavioral checks of the template's actual Topics menu code.
   Run: node --test tools/test-topics-focus.mjs
   GUIDE_TEMPLATE can select another template or a generated guide.
   These doubles model focus and the existing [hidden]/.sx visibility rules;
   they do not replace browser layout, screen-reader, or rendered-focus QA. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const template = process.env.GUIDE_TEMPLATE || new URL("../template/guide-template.html", import.meta.url);
const source = readFileSync(template, "utf8");
const start = source.indexOf("let OPEN=null, OPENBY=null;");
const end = source.indexOf("/* go to a lesson", start);
assert(start >= 0 && end > start, "Template menu section is available for execution");
const menuSource = source.slice(start, end);

class Element {
  constructor(document, tag = "div", attributes = {}) {
    this.ownerDocument = document;
    this.tagName = tag.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.dataset = {};
    this.focusAttempts = 0;
    const classes = new Set();
    this.classList = {
      contains: name => classes.has(name),
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      toggle(name, force = !classes.has(name)) {
        force ? classes.add(name) : classes.delete(name);
        return force;
      }
    };
    for (const [name, value] of Object.entries(attributes)) this.setAttribute(name, value);
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "class") this.classList.add(...String(value).split(/\s+/).filter(Boolean));
    if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  get id() { return this.getAttribute("id") || ""; }
  get hidden() { return this.hasAttribute("hidden"); }
  set hidden(value) { value ? this.setAttribute("hidden", "") : this.removeAttribute("hidden"); }
  get disabled() { return this.hasAttribute("disabled"); }
  get offsetParent() { return this.isDisplayed() ? (this.parentElement || this.ownerDocument.body) : null; }
  get offsetWidth() { return this.isDisplayed() ? 320 : 0; }
  isDisplayed() {
    for (let node = this; node; node = node.parentElement) {
      if (node.hidden || node.classList.contains("sx")) return false;
    }
    return true;
  }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  matches(selector) {
    return selector.split(",").some(part => {
      let simple = part.trim();
      let excluded = false;
      simple = simple.replace(/:not\(([^)]+)\)/g, (_, inner) => {
        if (this.matches(inner)) excluded = true;
        return "";
      });
      if (excluded) return false;
      const tag = simple.match(/^[a-z][\w-]*/i)?.[0];
      if (tag && this.tagName !== tag.toUpperCase()) return false;
      for (const match of simple.matchAll(/#([\w-]+)/g)) if (this.id !== match[1]) return false;
      for (const match of simple.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(match[1])) return false;
      for (const match of simple.matchAll(/\[([\w-]+)(?:\s*=\s*["']?([^\]"']+)["']?)?\]/g)) {
        if (!this.hasAttribute(match[1])) return false;
        if (match[2] !== undefined && this.getAttribute(match[1]) !== match[2]) return false;
      }
      return true;
    });
  }
  closest(selector) {
    for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node;
    return null;
  }
  querySelectorAll(selector) {
    const result = [];
    const visit = node => {
      for (const child of node.children) {
        if (child.matches(selector)) result.push(child);
        visit(child);
      }
    };
    visit(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  contains(other) {
    for (let node = other; node; node = node.parentElement) if (node === this) return true;
    return false;
  }
  getBoundingClientRect() { return { left: 24, right: 124, top: 80, bottom: 124, width: 100, height: 44 }; }
  focus() {
    this.focusAttempts++;
    // A hidden element cannot take browser focus. Crucially, trying it leaves
    // focus on the trigger rather than making the regression appear to pass.
    if (!this.isDisplayed() || this.disabled) return;
    if (!this.matches('a[href],button,input,[tabindex]')) return;
    this.ownerDocument.activeElement = this;
  }
}

function topics({ current = 0, filtered = [0] } = {}) {
  const events = new Map();
  const document = {
    documentElement: { clientWidth: 1280 },
    addEventListener(name, fn) {
      if (!events.has(name)) events.set(name, []);
      events.get(name).push(fn);
    }
  };
  document.body = new Element(document, "body");
  document.activeElement = document.body;
  document.querySelectorAll = selector => document.body.querySelectorAll(selector);
  document.getElementById = id => document.body.querySelector(`#${id}`);
  const append = (parent, tag, attributes) => parent.appendChild(new Element(document, tag, attributes));
  const trigger = append(document.body, "button", { id: "topics-trigger", "data-menu": "m-jump", "aria-expanded": "false" });
  const after = append(document.body, "button", { id: "next-control" });
  const menu = append(document.body, "div", { id: "m-jump", class: "menu", hidden: "" });
  const items = Array.from({ length: 3 }, (_, index) => append(menu, "a", {
    id: `topic-${index + 1}`, class: `mi${filtered.includes(index) ? " sx" : ""}`,
    href: `#s-${index + 1}`, "aria-current": String(index === current)
  }));
  const context = vm.createContext({ document, innerHeight: 900, bar: trigger, addEventListener() {} });
  vm.runInContext(menuSource, context, { filename: String(template) });
  trigger.focus();
  return {
    document, trigger, after, menu, items,
    open(keyboard = false) { context.openMenu(menu.id, trigger, keyboard); },
    active: () => document.activeElement.id,
    key(key, extra = {}) {
      const event = { key, target: document.activeElement, shiftKey: false, defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; }, ...extra };
      for (const fn of events.get("keydown") || []) fn(event);
      return event;
    }
  };
}

test("keyboard-opened Topics skips the filtered current topic", () => {
  const t = topics();
  t.open(true);
  assert.equal(t.menu.hidden, false);
  assert.equal(t.active(), "topic-2", "Keyboard entry must focus the first visible topic when the current topic is filtered out");
});

for (const key of ["ArrowDown", "Tab"]) {
  test(`${key} from the Topics trigger skips the filtered current topic`, () => {
    const t = topics();
    t.open(false);
    const event = t.key(key);
    assert.equal(event.defaultPrevented, true);
    assert.equal(t.active(), "topic-2", `${key} must enter the visible results rather than attempt to focus a hidden topic`);
  });
}

for (const entry of ["keyboard open", "ArrowDown", "Tab"]) {
  test(`${entry} still prefers a visible current topic over the first topic`, () => {
    const t = topics({ current: 2, filtered: [] });
    t.open(entry === "keyboard open");
    if (entry !== "keyboard open") t.key(entry);
    assert.equal(t.active(), "topic-3");
  });
}

test("pointer opening Topics preserves trigger focus", () => {
  const t = topics();
  t.open(false);
  assert.equal(t.menu.hidden, false);
  assert.equal(t.trigger.getAttribute("aria-expanded"), "true");
  assert.equal(t.active(), "topics-trigger");
  assert.equal(t.items.reduce((sum, item) => sum + item.focusAttempts, 0), 0);
});

test("Escape closes Topics and returns focus to its trigger", () => {
  const t = topics({ current: 1, filtered: [0] });
  t.open(true);
  assert.equal(t.active(), "topic-2");
  const event = t.key("Escape");
  assert.equal(event.defaultPrevented, true);
  assert.equal(t.menu.hidden, true);
  assert.equal(t.trigger.getAttribute("aria-expanded"), "false");
  assert.equal(t.active(), "topics-trigger");
});

test("arrow movement inside Topics skips filtered items and wraps", () => {
  const t = topics({ current: 0, filtered: [1] });
  t.open(true);
  assert.equal(t.active(), "topic-1");
  t.key("ArrowDown");
  assert.equal(t.active(), "topic-3");
  t.key("ArrowDown");
  assert.equal(t.active(), "topic-1");
  t.key("ArrowUp");
  assert.equal(t.active(), "topic-3");
});

test("a fully filtered Topics list keeps focus recoverable with Escape", () => {
  const t = topics({ filtered: [0, 1, 2] });
  t.open(true);
  assert.equal(t.active(), "topics-trigger");
  t.key("ArrowDown");
  assert.equal(t.active(), "topics-trigger");
  t.key("Escape");
  assert.equal(t.menu.hidden, true);
  assert.equal(t.active(), "topics-trigger");
});
