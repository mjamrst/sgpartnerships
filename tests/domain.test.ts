import { test } from "node:test";
import assert from "node:assert/strict";
import { MockSocialGlassAdapter } from "../lib/socialglass/adapter";
import {
  seedAudiences,
  seedBrand,
  seedProperties,
  makeIdeas,
} from "../lib/seed-data";
import { validateGrounding } from "../lib/ideation";
import { createSession, validSession } from "../lib/auth";
import { escapeHtml, scopeExport } from "../lib/export";
import type { Engagement, Trend } from "../lib/types";
test("mock tracking is reproducible, varies with window, and has realistic shape", async () => {
  const adapter = new MockSocialGlassAdapter();
  const params = {
    audienceIds: seedAudiences.map((a) => a.name),
    window: { start: "2026-07-20", end: "2026-10-17" },
  };
  const a = await adapter.getTrends(params),
    b = await adapter.getTrends(params),
    c = await adapter.getTrends({
      ...params,
      window: { start: "2026-08-20", end: "2026-10-17" },
    });
  assert.deepEqual(a, b);
  assert.notDeepEqual(
    a.map((t) => t.key),
    c.map((t) => t.key),
  );
  assert.equal(a.length, 16);
  assert.equal(new Set(a.map((t) => t.key)).size, 16);
  for (const t of a) {
    assert.equal(t.exemplars.length, 3);
    assert.equal(t.weeklyVolume.length, 13);
    assert.ok(t.relevanceScore >= 0 && t.relevanceScore <= 100);
  }
  const estimate = await adapter.createAudience(seedAudiences[0]);
  assert.equal(
    estimate.platformMix.reduce((s, p) => s + p.percentage, 0),
    100,
  );
});
test("idea generation respects property scope and rejects invented rights and trends", async () => {
  const raw = await new MockSocialGlassAdapter().getTrends({
    audienceIds: ["test"],
    window: { start: "2026-07-20", end: "2026-10-17" },
  });
  const trends = raw.map((t) => ({
    ...t,
    id: t.key,
    snapshotId: "test",
    starred: true,
  })) as Trend[];
  const ideas = makeIdeas(seedBrand, [seedProperties[0]], trends, "property");
  assert.equal(ideas.length, 12);
  for (const lane of ["athlete_creator", "experiential", "social"] as const) {
    const group = ideas
      .filter((i) => i.lane === lane)
      .map((i) => ({ ...i, propertyId: i.propertyId! }));
    assert.equal(group.length, 4);
    validateGrounding(group, [seedProperties[0]], trends, lane);
  }
  const bad = {
    ...ideas[0],
    propertyId: "harbor",
    brief: { ...ideas[0].brief, rights: ["Unlimited broadcast game footage"] },
  };
  assert.throws(
    () =>
      validateGrounding([bad], [seedProperties[0]], trends, "athlete_creator"),
    /rights outside/,
  );
  assert.throws(
    () =>
      validateGrounding(
        [{ ...ideas[0], propertyId: "harbor", trendIds: ["foreign"] }],
        [seedProperties[0]],
        trends,
        "athlete_creator",
      ),
    /outside your selection/,
  );
});
test("shared-password sessions reject forgery, expiration, and a rotated password", async () => {
  const token = await createSession("test-secret");
  assert.equal(await validSession(token, "test-secret"), true);
  assert.equal(await validSession(token, "rotated-secret"), false);
  assert.equal(
    await validSession(token.slice(0, -1) + "z", "test-secret"),
    false,
  );
  assert.equal(await validSession("1." + "a".repeat(64), "test-secret"), false);
  assert.equal(await validSession(undefined, "test-secret"), false);
});
test("exports escape untrusted text and do not mix scopes", () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script>'),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
  const e = {
    brand: { properties: seedProperties },
    property: seedProperties[0],
    propertyId: seedProperties[0].id,
    outputs: [
      { scope: "brand", propertyId: "harbor" },
      { scope: "property", propertyId: "harbor" },
      { scope: "property", propertyId: "pacific" },
    ],
  } as Engagement;
  assert.equal(scopeExport(e, "property", "harbor").outputs.length, 1);
  assert.equal(scopeExport(e, "brand", "").outputs.length, 1);
  assert.equal(scopeExport(e, "brand", "").property, null);
  const emptyPropertyExport = scopeExport(e, "property", seedProperties[2].id);
  assert.equal(emptyPropertyExport.outputs.length, 0);
  assert.equal(emptyPropertyExport.property?.name, seedProperties[2].name);
});
