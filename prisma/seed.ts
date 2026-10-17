import { PrismaClient, Prisma } from "@prisma/client";
import {
  seedBrand,
  seedProperties,
  seedAudiences,
  discoveryMarkdown,
  makeIdeas,
} from "../lib/seed-data";
import { seedAnswers } from "../lib/discovery";
import { MockSocialGlassAdapter } from "../lib/socialglass/adapter";
const db = new PrismaClient();
const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
async function main() {
  if (await db.engagement.findUnique({ where: { id: "northstar-harbor" } })) {
    console.log(
      "Demo already exists; preserving consultant edits. No records changed.",
    );
    return;
  }
  const { properties, ...brand } = seedBrand;
  await db.brand.upsert({
    where: { id: brand.id },
    create: {
      ...brand,
      objectives: json(brand.objectives),
      history: json(brand.history),
      constraints: json(brand.constraints),
      sources: json(brand.sources),
    },
    update: {},
  });
  for (const p of seedProperties)
    await db.property.upsert({
      where: { id: p.id },
      create: {
        ...p,
        brandId: brand.id,
        dealTerms: json(p.dealTerms),
        assets: json(p.assets),
      },
      update: {},
    });
  const answers = Object.entries(seedAnswers).map(([questionKey, answer]) => ({
    questionKey,
    answer,
    source:
      questionKey === "discord"
        ? "discord"
        : questionKey === "reddit" || questionKey === "comments"
          ? "social"
          : "brand",
  }));
  await db.$transaction(
    async (tx) => {
      const engagement = await tx.engagement.create({
        data: {
          id: "northstar-harbor",
          name: "Northstar × LA Harbor",
          brandId: brand.id,
          propertyId: "harbor",
          scope: "property",
          discoveryBrief: discoveryMarkdown(
            seedBrand,
            seedProperties[0],
            answers,
          ),
          recommendations: json(seedAudiences),
          answers: { create: answers },
        },
      });
      const adapter = new MockSocialGlassAdapter();
      const audienceIds: string[] = [];
      for (const [i, def] of seedAudiences.entries()) {
        const estimate = await adapter.createAudience(def);
        const { size, ...composition } = estimate;
        const a = await tx.audience.create({
          data: {
            id: `demo-audience-${i + 1}`,
            engagementId: engagement.id,
            name: def.name,
            definition: json(def),
            size,
            platforms: json(def.platforms),
            status: "live",
            composition: json(composition),
          },
        });
        audienceIds.push(a.id);
      }
      const end = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Los_Angeles",
      });
      const startDate = new Date(`${end}T12:00:00Z`);
      startDate.setUTCDate(startDate.getUTCDate() - 89);
      const window = { start: startDate.toISOString().slice(0, 10), end };
      const snapshot = await tx.trendSnapshot.create({
        data: {
          engagementId: engagement.id,
          audienceId: audienceIds[0],
          audienceIds: json(audienceIds),
          window: json(window),
        },
      });
      const raw = await adapter.getTrends({
        audienceIds: seedAudiences.map((a) => a.name),
        window,
      });
      const trends = [];
      for (const [i, t] of raw.entries()) {
        const { key, ...rest } = t;
        trends.push(
          await tx.trend.create({
            data: {
              ...rest,
              id: `demo-trend-${key}`,
              snapshotId: snapshot.id,
              platforms: json(t.platforms),
              weeklyVolume: json(t.weeklyVolume),
              exemplars: json(t.exemplars),
              starred: i < 5,
            },
          }),
        );
      }
      for (const idea of makeIdeas(
        seedBrand,
        [seedProperties[0]],
        trends.slice(0, 5),
        "property",
      )) {
        const { seedImage, ...data } = idea;
        await tx.output.create({
          data: {
            ...data,
            engagementId: engagement.id,
            brief: json(data.brief),
            score: json(data.score),
            trendIds: json(data.trendIds),
            ...(seedImage
              ? {
                  renderings: {
                    create: {
                      prompt: data.brief.renderingPrompt!,
                      imageUrl: `/seed/${seedImage}`,
                      provider: "seed · AI concept visualization",
                    },
                  },
                }
              : {}),
          },
        });
      }
    },
    { timeout: 60000 },
  );
  console.log(
    "Seeded Northstar demo: 5 audiences, 16 trends, 12 ideas, 4 concept renderings.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
