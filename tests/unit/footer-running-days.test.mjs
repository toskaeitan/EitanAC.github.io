import assert from "node:assert/strict";
import test from "node:test";
import { defineRunningDays } from "../../src/utils/footer-running-days.ts";
test("persistent running days refresh across midnight and clean up one timer", () => {
 const keys = ["HTMLElement", "customElements", "document", "setInterval", "clearInterval"];
 const previous = Object.fromEntries(keys.map(k => [k, globalThis[k]]));
 const realNow = Date.now;
 let now = Date.parse("2026-11-11T23:59:59+08:00");
 Date.now = () => now;
 const registry = new Map(), timers = new Map(), listeners = new Map();
 let nextTimer = 0;
 globalThis.HTMLElement = class { dataset = { launchedAt: "2026-11-11T00:00:00+08:00" }; textContent = ""; };
 globalThis.customElements = { get: key => registry.get(key), define: (key, value) => registry.set(key, value) };
 globalThis.setInterval = callback => { timers.set(++nextTimer, callback); return nextTimer; };
 globalThis.clearInterval = id => timers.delete(id);
 globalThis.document = { visibilityState: "visible", addEventListener: (name, cb) => listeners.set(name, cb), removeEventListener: (name, cb) => { if(listeners.get(name) === cb) listeners.delete(name); } };
 try {
  defineRunningDays(); defineRunningDays();
  const element = new (registry.get("site-running-days"))();
  element.connectedCallback(); element.connectedCallback();
  assert.equal(element.textContent, "0"); assert.equal(timers.size, 1);
  now = Date.parse("2026-11-12T00:01:00+08:00"); [...timers.values()][0](); assert.equal(element.textContent, "1");
  now = Date.parse("2026-11-13T08:00:00+08:00"); listeners.get("visibilitychange")(); assert.equal(element.textContent, "2");
  now = Date.parse("2026-11-14T08:00:00+08:00"); listeners.get("swup:page:view")(); assert.equal(element.textContent, "3");
  element.disconnectedCallback(); assert.equal(timers.size, 0); assert.equal(listeners.size, 0);
 } finally { Date.now = realNow; for(const [key, value] of Object.entries(previous)) { if(value === undefined) delete globalThis[key]; else globalThis[key] = value; } }
});
