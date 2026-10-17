# SG Partnerships

A working consulting prototype: **Discovery → Audiences → Trends → Outputs**.

**Live demo:** https://sgpartnerships.vercel.app

**Repository:** https://github.com/mjamrst/sgpartnerships

**Vercel:** https://vercel.com/mjamrsts-projects/sgpartnerships

The hosted app requires a shared password. The initial generated password is saved **only on the owner's computer** in `.vercel/demo-access.txt`, never in Git. Change `APP_PASSWORD` in Vercel and redeploy to rotate access and invalidate existing sessions.

## Run locally

Requires Node.js 24 and pnpm 11.25.0 (pinned).

```sh
git clone https://github.com/mjamrst/sgpartnerships.git
cd sgpartnerships
pnpm install
pnpm seed
pnpm dev
```

Open http://localhost:3000. No API keys or environment file are required for the complete demo. The default database is `prisma/dev.db`. The seed is idempotent and preserves an existing demo and consultant edits.

Local development uses Webpack to avoid repeated refreshes observed with Turbopack and the SQLite workspace. Production builds use Next.js's default Turbopack build.

To add optional provider keys, copy `.env.example` to `.env.local`. Keep `DATABASE_URL="file:./dev.db"` for SQLite. Restart after environment changes. When changing database provider, rerun `pnpm seed` and restart; the client is generated for the selected provider.

## Demo walkthrough

1. Open **Northstar × LA Harbor** and follow its four-step process map.
2. **Discovery:** edit source-tagged answers, upload text exports, edit the brand/portfolio, synthesize, and revise the brief. Initial synthesis populates draft audiences if none exist.
3. **Audiences:** add/edit/delete segments, push to mock SocialGlass, inspect platform mix, affinities, and overlaps.
4. **Trends:** choose audiences/dates, capture a snapshot, switch table/cards/2×2, inspect three exemplar posts, and star useful signals. Previous snapshots remain available.
5. **Outputs:** select starred signals and a brand-wide or property scope, generate ideas, edit all brief fields, resize budget, regenerate, and override scores.
6. **Experiential:** inspect prompts, re-render, or choose an alternate location. Three distinct AI-generated seed images support four sample experiences. Without an image key, new concepts show a placeholder; existing seed images remain available.
7. **Build Client Deck:** download one HTML file with embedded images, discovery, audiences, trends, ideas, and execution briefs. Open it and use **Print / Save PDF**. The stylesheet specifies A4 landscape and page breaks; enable background graphics for the sage palette. JSON export preserves structured records.

The seed includes a brief, 26 source-tagged answers, five audiences, a 16-trend snapshot, and four ideas per lane. All brands, measurements, and posts are fictional. There is no actual SocialGlass data access.

## Environment variables

| Variable                | Purpose / default                                       | Production                                                                           |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`          | `file:./dev.db`; a Postgres URL selects that datasource | Required; connected Neon database                                                    |
| `APP_PASSWORD`          | Optional locally                                        | Required for access; missing password fails closed                                   |
| `SOCIALGLASS_MODE`      | `mock`                                                  | `mock` configured; `live` fails explicitly until a real adapter is implemented       |
| `ANTHROPIC_API_KEY`     | Optional; absent uses labeled curated demo results      | Add for fresh synthesis, audience recommendations, scores, ideas, and deck narrative |
| `ANTHROPIC_MODEL`       | `claude-sonnet-5-5`                                     | Optional account-accessible Sonnet model override                                    |
| `OPENAI_API_KEY`        | Optional; absent gives rendering placeholders           | Add for fresh renderings                                                             |
| `IMAGE_MODEL`           | `gpt-image-1`                                           | Optional compatible model override                                                   |
| `BLOB_READ_WRITE_TOKEN` | Unneeded locally; uses `public/generated/`              | Configured private Blob token; needed before live production image generation        |

No AI keys are set in the deployed demo. The features work with a database alone; the hosted instance additionally requires `APP_PASSWORD` for the requested privacy gate. Credentials stay server-side and must not use `NEXT_PUBLIC_*` names.

The Claude default was verified against [Anthropic's model overview](https://platform.claude.com/docs/en/models/overview) on October 17, 2026. Provider calls use structured tool schemas and validate returned data; failures preserve saved work.

## Database and deployment

Prisma 6.19.3 is pinned for one model definition shared by SQLite and Postgres. `prisma/schema.prisma` is canonical; `scripts/db.mjs` creates an ignored `schema.generated.prisma` with the selected provider and generates Prisma Client. Production uses **sgpartnerships-db**, a Neon database in `iad1`.

Vercel is linked to the repository: pushes to `main` deploy automatically. `vercel.json` defines the Next.js framework, build/install commands, region, and 300-second action limit.

```sh
vercel link --project sgpartnerships --scope mjamrsts-projects
vercel --prod --scope mjamrsts-projects
# Initial setup or intentional schema update only:
vercel env pull .vercel/production.env --environment production
pnpm seed:production
# Restore the local SQLite client before development:
node scripts/db.mjs generate
```

Production has already been seeded. The seed never resets existing records. This prototype uses explicit `prisma db push` for schema setup; introduce reviewed migrations before handling real production data. Builds do not reset or reseed databases.

Vercel can pull secret values as `[SENSITIVE]`. Do not replace working remote secrets with these placeholders. Production seeding only needs a real `DATABASE_URL`. Integration commands may overwrite `.env.local`; preserve an ignored backup and restore the local SQLite URL afterward.

Generated production images use private Blob store **sgpartnerships-renderings**, served by authenticated `/api/renderings/[id]`. Seed images ship in `/public/seed/` and are explicitly included in serverless tracing. The image adapter crops a safe landscape composition to 16:9. Exports embed compressed JPEGs below the serverless response-size limit.

## Implementation map

- `app/`: pages and validated HTTP actions.
- `components/`: responsive modules and shadcn-style Radix primitives.
- `lib/prompts/`: eight distinct structured prompts.
- `lib/socialglass/adapter.ts`: replaceable SocialGlass boundary; see its mock-data README.
- `lib/socialglass/mock-data/trends.ts`: 27 hand-authored signals; 16 per deterministic run.
- `lib/images/provider.ts`: image-provider interface, OpenAI implementation, private Blob/local storage.
- `lib/ideation.ts`: generation, resizing, and exact rights/trend/scope checks.
- `lib/export.ts`: escaped standalone decks with embedded images.
- `proxy.ts`, `lib/auth.ts`: password gate and signed seven-day HttpOnly sessions. Next.js 16 calls middleware “Proxy”.
- `public/seed/PROMPTS.md`: exact prompts and provenance for built-in ImageGen assets.

## Validation

```sh
pnpm typecheck
pnpm test
pnpm build
# With a local dev server; creates a disposable QA engagement:
node scripts/smoke.mjs
# Hosted verification using the owner's ignored password file:
node scripts/verify-production.mjs
```

The domain suite covers deterministic data, rights/scope validation, session forgery/expiry/rotation, and export escaping. The smoke test covers the complete no-key workflow, saving, resizing, scores, images, and standalone HTML. Production verification checks the gate, wrong-password rejection, secure cookies, all pages, seed data, experiential images, and both exports.

Live Claude and OpenAI image calls were not exercised because no provider keys were supplied. Their schemas/adapters compile and missing-key behavior is verified. See `DECISIONS.md` for assumptions and limits.
