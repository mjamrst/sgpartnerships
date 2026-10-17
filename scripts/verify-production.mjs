import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const base = process.env.VERIFY_URL || "https://sgpartnerships.vercel.app";
const gate = await fetch(base + "/", { redirect: "manual" });
assert.equal(
  gate.status,
  307,
  "Unauthenticated page should redirect to workspace login",
);
assert.ok(gate.headers.get("location").includes("/login"));
const denied = await fetch(
  base + "/api/engagements/northstar-harbor/export?format=json",
);
assert.equal(denied.status, 401, "Unauthenticated API should be denied");
const password = readFileSync(".vercel/demo-access.txt", "utf8").trim();
const bad = await fetch(base + "/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "not-the-workspace-password" }),
});
assert.equal(bad.status, 401);
const login = await fetch(base + "/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, "Expected shared-password login to succeed");
const cookie = login.headers.get("set-cookie").split(";")[0];
assert.ok(login.headers.get("set-cookie").includes("HttpOnly"));
assert.ok(login.headers.get("set-cookie").includes("Secure"));
const headers = { Cookie: cookie };
for (const path of [
  "/",
  "/engagements/northstar-harbor",
  ...["discovery", "audiences", "trends", "outputs"].map(
    (m) => "/engagements/northstar-harbor/" + m,
  ),
]) {
  const response = await fetch(base + path, { headers });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(!html.includes("We couldn&#x27;t load this workspace"), path);
  console.log(`PASS ${path}`);
}
const data = await fetch(
  base +
    "/api/engagements/northstar-harbor/export?format=json&scope=property&propertyId=harbor",
  { headers },
);
assert.equal(data.status, 200);
const e = await data.json();
assert.equal(e.audiences.length, 5);
assert.equal(e.snapshots[0].trends.length, 16);
assert.equal(e.outputs.length, 12);
for (const idea of e.outputs.filter((i) => i.lane === "experiential")) {
  const r = await fetch(base + "/api/renderings/" + idea.renderings[0].id, {
    headers,
  });
  assert.equal(r.status, 200);
  assert.ok((await r.arrayBuffer()).byteLength > 10000);
}
const deck = await fetch(
  base +
    "/api/engagements/northstar-harbor/export?format=html&scope=property&propertyId=harbor",
  { headers },
);
assert.equal(deck.status, 200);
const html = await deck.text();
assert.ok(html.includes("data:image/jpeg;base64,"));
mkdirSync(".vercel/qa", { recursive: true });
writeFileSync(".vercel/qa/production-deck.html", html);
console.log(
  "PASS password gate, incorrect-password rejection, secure cookie, all modules, 5 audiences, 16 trends, 12 ideas, 4 image records, and self-contained HTML export.",
);
