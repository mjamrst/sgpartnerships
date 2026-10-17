import { readFileSync, writeFileSync, existsSync, mkdirSync, closeSync, openSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";
const production = process.argv.includes("--production");
dotenv.config({ path: production ? ".vercel/production.env" : [".env.local", ".env"], quiet: true });
process.env.DATABASE_URL ||= "file:./dev.db";
if (production && !/^postgres(ql)?:/.test(process.env.DATABASE_URL)) throw new Error("Production seeding requires a Postgres DATABASE_URL in .vercel/production.env or the environment.");
const provider = /^postgres(ql)?:/.test(process.env.DATABASE_URL) ? "postgresql" : "sqlite";
if (provider === "sqlite") {
  const file = resolve("prisma", process.env.DATABASE_URL.replace(/^file:/, ""));
  if (!existsSync(file)) { mkdirSync(dirname(file), { recursive: true }); closeSync(openSync(file, "a")); }
}
const source = readFileSync("prisma/schema.prisma", "utf8");
writeFileSync("prisma/schema.generated.prisma", source.replace('provider = "sqlite"', `provider = "${provider}"`));
function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const schema = ["--schema", "prisma/schema.generated.prisma"];
run(["node_modules/prisma/build/index.js", "generate", ...schema]);
if (["push", "seed"].includes(process.argv[2])) run(["node_modules/prisma/build/index.js", "db", "push", ...schema, "--skip-generate"]);
if (process.argv[2] === "seed") run(["--import", "tsx", "prisma/seed.ts"]);
