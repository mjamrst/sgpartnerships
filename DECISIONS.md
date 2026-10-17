# SG Partnerships — decisions and verification

## Deployment

- Live URL: **https://sgpartnerships.vercel.app**.
- Built in the requested, initially empty `mjamrst/sgpartnerships` repository on `main`. Each specified build stage was separately committed and pushed.
- Vercel project `mjamrsts-projects/sgpartnerships` is linked to GitHub for main-branch deployments.
- Provisioned free Neon `sgpartnerships-db` in `iad1` after the owner confirmed marketplace-term acceptance. Seeded production after the first manual deployment.
- Provisioned private Vercel Blob `sgpartnerships-renderings`. Images are served through the app gate, not public Blob URLs.
- Generated a shared password; it is configured in Vercel and stored locally in ignored `.vercel/demo-access.txt`. No secrets are committed. Rotation invalidates existing session signatures.
- “Only DATABASE_URL” means no required AI credentials. The hosted app also requires `APP_PASSWORD` and fails closed without it, prioritizing the explicit access-gate requirement. Local development may omit it.
- The user's Next.js/Vercel requirement overrides the Sites skill's default hosting stack.

## Architecture and design

- Next.js 16.4.2, App Router, TypeScript, React, Tailwind 4, and accessible Radix/shadcn-style primitives. Node 24 and pnpm 11.25.0 are pinned.
- Local development explicitly uses Webpack: browser verification exposed a repeated Turbopack refresh loop in the SQLite workspace. Webpack keeps forms stable; production builds continue using Turbopack.
- Prisma 6.19.3 supports a straightforward SQLite/Postgres datasource switch. This is a compatibility choice, not a claim to use the latest Prisma major. An ignored generated schema selects the provider from `DATABASE_URL`.
- Prototype schema setup uses explicit `db push` and an idempotent seed. Builds only regenerate the client. Existing consultant data is not reset.
- Added required UI fields: discovery brief/recommendations, audience composition, trend star/weekly volume/growth/property relevance, and output hook/scope/property/date. A snapshot records all selected audience IDs and one optional primary audience because runs aggregate multiple segments.
- No Figma file or screenshot was attached. Implemented the described sage four-card process map, deep green accents, arrows, and persistent navigation. Local Arial/Helvetica avoids font-download dependence; Georgia headlines provide an editorial feel.
- Every module has a Context drawer. Forms save explicitly. Async controls show progress and errors. Prisma owns durable state; browser local storage does not.
- Single-user prototype, no roles or tenant isolation. The password gate protects pages, APIs, seed assets, generated images, and exports. Sessions last seven days with signed HttpOnly, SameSite cookies, Secure in production.

## Demo and editing

- All names, brands, properties, campaigns, creators, posts, audience sizes, growth, and results are fictional. No actual research or licenses are implied.
- All discovery questions and brand/portfolio metadata are editable. Sources are unique per question/source. Reddit uses `social`, matching the requested enum.
- Community uploads accept text, Markdown, CSV, and JSON up to 250 KB. PDF/Word parsing and live community ingestion are outside this paste/export prototype.
- Core questionnaire fields and structured brand metadata synchronize. Brand editing updates canonical brand-source answers; re-synthesis stays explicit to preserve edited briefs.
- New engagements can use an existing brand or create a brand/property. First synthesis adds recommended draft audiences if absent. Further recommendations preserve existing segments.
- Budget defaults: S $15–40k, M $40–100k, L $100–250k, excluding rights fees/media. These illustrative assumptions are editable.
- Default window: 90 inclusive days ending on the current Los Angeles date at seed time. Existing snapshots remain historical; dates and audiences are selectable.
- The mock library has 27 hand-authored signals. Five anchors keep the default story coherent; eleven additional signals and metrics vary deterministically by audience names and dates. Identical inputs intentionally reproduce a run.
- Velocity includes a category, weekly sparkline, and growth. Matrix thresholds are explicit: brand relevance 85/100 and growth 100%. Reach estimates include overlaps and are labeled accordingly.
- Snapshots survive audience deletion. Starred signals across snapshots can feed ideation. New generations append ideas to preserve prior work.
- The seed has four ideas per lane. Four experiential records use three distinct generated illustrations; the fourth reuses the communal lounge as a concept reference.

## AI, renderings, and rights

- Claude defaults to `claude-sonnet-5-5`, verified against [Anthropic's model overview](https://platform.claude.com/docs/en/models/overview) on October 17, 2026. `ANTHROPIC_MODEL` overrides it.
- Eight separate system prompts receive JSON context. Tool-use schemas and Zod validation enforce structured output. Community excerpts are untrusted evidence, not instructions.
- Generated ideas must reference supplied trends and an in-scope property, with rights copied from that property's actual asset inventory. Brand-wide generation may span the portfolio; property scope cannot.
- Player ideas are alternatives against the two-appearance annual allowance. Releases, content permissions, offsite permits, and approvals are not assumed. No broadcast/game-footage rights are invented.
- No-key synthesis/ideation uses labeled curated templates, not fresh model reasoning. Templates incorporate names, objectives, selected signals, and rights. Arbitrary new categories need consultant refinement or a provider key.
- With a Claude key, synthesis, audience recommendations, tracking scores, all idea lanes, regeneration/resizing, alternate rendering prompts, and deck narrative call the provider. Provider failures preserve existing work.
- Runtime image provider: OpenAI `gpt-image-1`, behind a replaceable interface. Its 1536×1024 output uses a centered safe composition cropped to 1536×864 (16:9), then JPEG storage. Production uses private Blob; local development uses ignored filesystem storage.
- Missing image credentials do not crash. New ideas show placeholders with prompts; existing seed images remain. Rendering failures preserve prior images. Alternate locations requiring new permissions stay hypothetical.
- Three seed PNGs were generated using built-in ImageGen, visually inspected, and copied to `public/seed/`. Exact prompts and provenance are in `public/seed/PROMPTS.md`.
- Resizing changes execution details and budget, without increasing contracted appearances. Prior images remain concept references until re-rendered.

## Export and verification

- Export is standalone HTML, not PPTX. It includes cover, discovery, audiences, signals, concept pages, execution briefs, scorecards, renderings, and next steps. All dynamic text is escaped.
- Images are compressed JPEG data URIs so the deck works offline without app access. The verified 12-idea demo deck is approximately 714 KB. JSON includes structured records and provenance.
- Output export respects selected brand/property scope while retaining discovery context. A 4 MB guard prevents oversized serverless responses after many image-heavy generation rounds.
- A4-landscape styling and deliberate page breaks support printing. Browser settings and unusually long edits may alter pagination; HTML/CSS and visual layout are checked, not every possible PDF/printer combination.
- Four domain tests passed: reproducible/varied data and composition; rights/scope/trend validation; session signature/expiry/rotation; export escaping and filtering.
- Local end-to-end smoke passed: engagement creation, discovery save/synthesis, audiences/push, tracking/star, 12-idea generation, resizing, score override, regeneration, missing-key rendering, seed image serving, and standalone HTML export.
- Production builds passed locally and on Vercel. Hosted checks passed: unauthenticated redirect, API denial, wrong password, secure cookie, every page, five audiences, 16 trends, 12 ideas, all four rendering records, and HTML/JSON exports.
- Local and hosted browser inspection supplement API checks. Live Claude/OpenAI requests cannot be claimed as tested: no provider keys were supplied.
