import assert from "node:assert/strict";
import test from "node:test";
import { resolveFooterDates } from "../../src/utils/footer-stats.ts";
const launch = "2026-11-11T00:00:00+08:00";
test("running days count complete elapsed days from the Shanghai launch", () => {
 assert.equal(resolveFooterDates(launch, launch, [], Date.parse("2026-11-11T23:59:59+08:00")).days, 0);
 assert.equal(resolveFooterDates(launch, launch, [], Date.parse("2026-11-12T00:00:00+08:00")).days, 1);
});
test("last update is the latest release or content date, independent of visits", () => {
 const commit = "2026-11-11T15:00:00Z";
 const activity = "2026-11-12T10:00:00+08:00";
 assert.equal(resolveFooterDates(launch, commit, [undefined, activity], Date.parse("2027-01-01")).updatedAt, new Date(activity).toISOString());
 assert.equal(resolveFooterDates(launch, commit, [launch]).updatedAt, commit.replace("Z", ".000Z"));
});
test("no content and no git retain a stable launch date", () => {
 assert.equal(resolveFooterDates(launch, launch, []).updatedAt, new Date(launch).toISOString());
});
