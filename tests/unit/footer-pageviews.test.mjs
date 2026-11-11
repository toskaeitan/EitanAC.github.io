import assert from "node:assert/strict";
import test from "node:test";
import { canTrackPageviews, createPageviewGate, pageviewText } from "../../src/utils/footer-pageviews-runtime.mjs";
const host = "eitan.chronoresearch.org";
test("only enabled production canonical host can request pageviews", () => {
 assert.equal(canTrackPageviews(true, true, host, host), true);
 for (const other of ["localhost", "127.0.0.1", "toskaeitan.github.io", "preview.chronoresearch.org"]) assert.equal(canTrackPageviews(true, true, other, host), false);
 assert.equal(canTrackPageviews(false, true, host, host), false);
 assert.equal(canTrackPageviews(true, false, host, host), false);
 assert.equal(canTrackPageviews(true, true, host, host, "/preview/reading/"), false);
});
test("initial/hook duplicates and hash jumps do not count but real navigation does", () => {
 const claim = createPageviewGate();
 assert.equal(claim(`https://${host}/`), true);
 assert.equal(claim(`https://${host}/`), false);
 assert.equal(claim(`https://${host}/#section`), false);
 assert.equal(claim(`https://${host}/projects/`), true);
 assert.equal(claim(`https://${host}/projects/#etf`), false);
 assert.equal(claim(`https://${host}/`), true);
});
test("missing/failed responses display a dash, never a fabricated count", () => {
 for (const bad of [undefined, null, NaN, -1, "12", {}]) assert.equal(pageviewText(bad), "—");
 assert.equal(pageviewText(0), "0");
 assert.equal(pageviewText(120), "120");
});

test("runtime makes no local request, binds once, and retains dash on SDK failure", async () => {
 const { startFooterPageviews } = await import("../../src/utils/footer-pageviews-runtime.mjs");
 const previous = Object.fromEntries(["document", "window", "location", "MutationObserver"].map(k => [k, globalThis[k]]));
 let appended = 0;
 let pageView;
 const value = { textContent: "—" };
 const root = { dataset: { production: "true", hostname: host }, querySelector: () => value };
 globalThis.MutationObserver = class { observe() {} disconnect() {} };
 globalThis.document = {
  querySelector: () => root,
  createElement: () => ({ remove() {} }),
  scripts: [],
  head: { appendChild(script) { appended++; queueMicrotask(() => script.onerror()); } },
  addEventListener() {},
 };
 globalThis.window = { swup: { hooks: { on(_event, callback) { pageView = callback; } } } };
 globalThis.location = { hostname: "localhost", pathname: "/", href: "http://localhost/" };
 const flush = () => new Promise(resolve => setImmediate(resolve));
 try {
  startFooterPageviews(); await flush(); assert.equal(appended, 0);
  globalThis.location = { hostname: host, pathname: "/", href: `https://${host}/` };
  startFooterPageviews(); await flush(); assert.equal(appended, 1); assert.equal(value.textContent, "—");
  startFooterPageviews(); pageView(); await flush(); assert.equal(appended, 1);
  globalThis.location.href += "#anchor"; pageView(); await flush(); assert.equal(appended, 1);
  globalThis.location.href = `https://${host}/projects/`; pageView(); await flush(); assert.equal(appended, 2); assert.equal(value.textContent, "—");
 } finally {
  for (const [key, old] of Object.entries(previous)) { if (old === undefined) delete globalThis[key]; else globalThis[key] = old; }
 }
});
