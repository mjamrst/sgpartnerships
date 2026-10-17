import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
const base = process.env.SMOKE_URL || "http://localhost:3000";
const request = async (path, body) => {
  const r = await fetch(base + path, {
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await r.json();
  assert.ok(r.ok, `${path}: ${JSON.stringify(data)}`);
  return data;
};
const demo = await request(
  "/api/engagements/northstar-harbor/export?format=json&scope=property&propertyId=harbor",
);
assert.equal(demo.audiences.length, 5);
assert.ok(demo.snapshots[0].trends.length >= 12);
for (const lane of ["athlete_creator", "experiential", "social"])
  assert.ok(demo.outputs.filter((i) => i.lane === lane).length >= 4);
for (const image of demo.outputs
  .filter((o) => o.lane === "experiential")
  .map((o) => o.renderings[0])) {
  const response = await fetch(base + "/api/renderings/" + image.id);
  assert.equal(response.status, 200);
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
}
const created = await request("/api/engagements", {
  name: "QA smoke test",
  brandId: "new",
  brandName: "QA Example Bank",
  scope: "property",
  propertyName: "QA Arena",
});
const id = created.id;
const action = (name, body = {}) =>
  request(`/api/engagements/${id}/${name}`, body);
let current = (
  await action("save-discovery", {
    answers: [
      {
        questionKey: "objectives",
        answer:
          "Make local fans feel welcome and grow qualified app activation",
        source: "brand",
      },
      {
        questionKey: "budget",
        answer: "S $15–40k; M $40–100k; L $100–250k",
        source: "consultant",
      },
    ],
  })
).engagement;
current = (
  await action("save-brand", {
    name: "QA smoke test",
    brand: {
      ...current.brand,
      objectives: ["Grow app activation"],
      constraints: ["No gambling", "No crypto", "No under-18 targeting"],
    },
    properties: current.brand.properties.map((p) => ({
      ...p,
      assets: [
        "Branded hospitality lounge",
        "2 player appearances per year (individual releases required)",
        "Approved team marks",
      ],
    })),
  })
).engagement;
await action("synthesize");
current = (await action("recommend-audiences")).engagement;
assert.equal(current.audiences.length, 5);
current = (
  await action("push-audience", { audienceId: current.audiences[0].id })
).engagement;
assert.equal(current.audiences[0].status, "live");
current = (
  await action("run-tracking", {
    audienceIds: current.audiences.map((a) => a.id),
    window: { start: "2026-07-20", end: "2026-10-17" },
  })
).engagement;
assert.equal(current.snapshots[0].trends.length, 16);
const trend = current.snapshots[0].trends[0];
await action("star-trend", { trendId: trend.id, starred: true });
current = (
  await action("generate-ideas", {
    scope: "property",
    propertyId: current.brand.properties[0].id,
    trendIds: [trend.id],
  })
).engagement;
assert.equal(current.outputs.length, 12);
const idea = current.outputs.find((i) => i.lane === "experiential");
current = (await action("resize", { outputId: idea.id, direction: "smaller" }))
  .engagement;
assert.equal(current.outputs.find((i) => i.id === idea.id).brief.budget, "S");
await action("score-output", {
  outputId: idea.id,
  score: { originality: 3, brandFit: 4, feasibility: 5, socialVelocity: 2 },
});
await action("regenerate", { outputId: idea.id });
await action("render", { outputId: idea.id });
const html = await fetch(
  base +
    "/api/engagements/northstar-harbor/export?format=html&scope=property&propertyId=harbor",
);
assert.ok(html.ok);
const deck = await html.text();
assert.ok(deck.includes("data:image/jpeg;base64,"));
assert.ok(deck.includes("@page"));
assert.ok(!deck.includes('src="/seed/'));
mkdirSync(".vercel/qa", { recursive: true });
writeFileSync(".vercel/qa/client-deck.html", deck);
writeFileSync(
  ".vercel/qa/smoke-engagement.json",
  JSON.stringify({ id, brandId: current.brand.id }),
);
console.log(
  `Smoke checks passed: all four modules, scoped generation, resize, score, regenerate, no-key rendering, seed images, and standalone HTML (${Math.round(Buffer.byteLength(deck) / 1024)} KB).`,
);
console.log(
  `Disposable QA engagement saved to .vercel/qa/smoke-engagement.json for cleanup.`,
);
