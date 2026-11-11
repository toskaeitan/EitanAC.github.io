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

test("runtime makes no local request, binds once, and retains dash on counter failure", async () => {
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
  startFooterPageviews(); await flush(); assert.equal(appended, 1); assert.equal(value.textContent, "—"); assert.equal(root.dataset.state, "error");
  startFooterPageviews(); pageView(); await flush(); assert.equal(appended, 1);
  globalThis.location.href += "#anchor"; pageView(); await flush(); assert.equal(appended, 1);
  globalThis.location.href = `https://${host}/projects/`; pageView(); await flush(); assert.equal(appended, 2); assert.equal(value.textContent, "—");
 } finally {
  for (const [key, old] of Object.entries(previous)) { if (old === undefined) delete globalThis[key]; else globalThis[key] = old; }
 }
});

test("direct transport replays captured real JSONP and cleans up its callback", async () => {
 const vm = await import("node:vm");
 const fs = await import("node:fs/promises");
 const source = (await fs.readFile(new URL("../../src/utils/footer-pageviews-runtime.mjs", import.meta.url), "utf8")).replace(/^export /gm, "");
 const captured = 'try{BusuanziDiagnosticOnce({"site_uv":1,"page_pv":1,"version":2.4,"site_pv":1});}catch(e){}';
 const value = { textContent: "—" };
 const root = { dataset: { production: "true", hostname: host }, querySelector: () => value };
 let requests = 0, removed = 0, context;
 const document = { querySelector: () => root, createElement: () => ({ remove() { removed++; } }), addEventListener() {}, head: { appendChild(script) {
  requests++;
  const callback = new URL(script.src).searchParams.get("jsonpCallback");
  queueMicrotask(() => vm.runInContext(captured.replace("BusuanziDiagnosticOnce", callback), context));
 } } };
 context = vm.createContext({ document, location: { hostname: host, pathname: "/", href: `https://${host}/` }, URL, Math, Promise, setTimeout, clearTimeout, queueMicrotask });
 context.window = context;
 vm.runInContext(source + "\nstartFooterPageviews();", context);
 await new Promise(resolve => setImmediate(resolve));
 assert.equal(value.textContent, "1"); assert.equal(root.dataset.state, "ready"); assert.equal(requests, 1); assert.equal(removed, 1);
 assert.equal(Object.keys(context).filter(k => k.startsWith("EitanBusuanzi_")).length, 0);
});

test("a silent JSONP failure times out with dash and cleans script/callback", async () => {
 const vm = await import("node:vm");
 const fs = await import("node:fs/promises");
 const source = (await fs.readFile(new URL("../../src/utils/footer-pageviews-runtime.mjs", import.meta.url), "utf8")).replace(/^export /gm, "");
 const value = { textContent: "—" }, root = { dataset: { production: "true", hostname: host }, querySelector: () => value };
 let requests = 0, removed = 0;
 const document = { querySelector: () => root, createElement: () => ({ remove() { removed++; } }), addEventListener() {}, head: { appendChild() { requests++; } } };
 const context = vm.createContext({ document, location: { hostname: host, pathname: "/", href: `https://${host}/` }, URL, Math, Promise, queueMicrotask, setTimeout(callback, delay) { assert.equal(delay, 24000); queueMicrotask(callback); return 1; }, clearTimeout() {} });
 context.window = context;
 vm.runInContext(source + "\nstartFooterPageviews();", context);
 await new Promise(resolve => setImmediate(resolve));
 assert.equal(value.textContent, "—"); assert.equal(root.dataset.state, "timeout"); assert.equal(requests, 1); assert.equal(removed, 1);
 assert.equal(Object.keys(context).filter(k => k.startsWith("EitanBusuanzi_")).length, 0);
});
