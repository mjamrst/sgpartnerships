import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getEngagement } from "@/lib/data";
import { hasAI, structured } from "@/lib/ai";
import {
  answerSchema,
  audienceDefinitionSchema,
  brandSchema,
  propertySchema,
  briefSchema,
  scoreSchema,
} from "@/lib/validation";
import { discoveryMarkdown, seedAudiences } from "@/lib/seed-data";
import { getSocialGlass } from "@/lib/socialglass/adapter";
import { generateIdeas } from "@/lib/ideation";
import type { Budget } from "@/lib/types";
import { getImageProvider } from "@/lib/images/provider";
export const runtime = "nodejs";
export const maxDuration = 300;
const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  try {
    if (
      req.headers.get("origin") &&
      new URL(req.headers.get("origin")!).host !== req.headers.get("host")
    )
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
    const { id, action } = await params;
    const e = await getEngagement(id);
    if (!e)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 },
      );
    const body = await req.json();
    let notice = "Saved to your workspace.";
    switch (action) {
      case "save-discovery": {
        const { answers } = z
          .object({ answers: z.array(answerSchema).max(200) })
          .parse(body);
        const keys = answers.map((a) => a.questionKey + "|" + a.source);
        if (new Set(keys).size !== keys.length)
          throw Error(
            "Each question can have only one answer per source. Choose a different source or combine the text.",
          );
        await db.$transaction(async (tx) => {
          await tx.discoveryAnswer.deleteMany({ where: { engagementId: id } });
          if (answers.length)
            await tx.discoveryAnswer.createMany({
              data: answers.map((a) => ({ ...a, engagementId: id })),
            });
          const primary = (key: string) =>
            answers.find(
              (a) =>
                a.questionKey === key &&
                a.source === "consultant" &&
                a.answer.trim(),
            )?.answer ??
            answers.find(
              (a) =>
                a.questionKey === key &&
                a.source === "brand" &&
                a.answer.trim(),
            )?.answer;
          const category = primary("category"),
            objectives = primary("objectives"),
            history = primary("campaigns"),
            toneOfVoice = primary("voice"),
            constraints = primary("legal");
          await tx.brand.update({
            where: { id: e.brand.id },
            data: {
              ...(category ? { category } : {}),
              ...(objectives
                ? {
                    objectives: objectives
                      .split(/[;\n]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }
                : {}),
              ...(history
                ? { history: history.split("\n").filter(Boolean) }
                : {}),
              ...(toneOfVoice ? { toneOfVoice } : {}),
              ...(constraints
                ? {
                    constraints: constraints
                      .split(/[;\n]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }
                : {}),
            },
          });
        });
        notice =
          "Discovery inputs saved. Synthesize again to refresh the brief.";
        break;
      }
      case "save-brand": {
        const v = z
          .object({
            name: z.string().trim().min(1).max(100),
            brand: brandSchema,
            properties: z.array(propertySchema).min(1).max(20),
          })
          .parse(body);
        await db.$transaction(async (tx) => {
          await tx.brand.update({ where: { id: e.brand.id }, data: v.brand });
          await tx.engagement.update({ where: { id }, data: { name: v.name } });
          const syncedAnswers: Record<string, string> = {
            category: v.brand.category,
            objectives: v.brand.objectives.join("\n"),
            campaigns: v.brand.history.join("\n"),
            voice: v.brand.toneOfVoice,
            legal: v.brand.constraints.join("\n"),
            properties: v.properties
              .map(
                (p) =>
                  `${p.name} · ${p.type} · ${p.dealTerms.term} · ${p.dealTerms.relationship}`,
              )
              .join("\n"),
            rights: v.properties
              .map((p) => `${p.name}: ${p.assets.join("; ")}`)
              .join("\n"),
            activated: v.properties
              .map((p) => `${p.name}: ${p.dealTerms.activated.join("; ")}`)
              .join("\n"),
            unused: v.properties
              .map((p) => `${p.name}: ${p.dealTerms.unused.join("; ")}`)
              .join("\n"),
          };
          for (const [questionKey, answer] of Object.entries(syncedAnswers))
            await tx.discoveryAnswer.upsert({
              where: {
                engagementId_questionKey_source: {
                  engagementId: id,
                  questionKey,
                  source: "brand",
                },
              },
              create: {
                engagementId: id,
                questionKey,
                source: "brand",
                answer,
              },
              update: { answer },
            });
          for (const p of v.properties) {
            const { id: propertyId, ...data } = p;
            if (propertyId && !propertyId.startsWith("new-")) {
              if (!e.brand.properties.some((p) => p.id === propertyId))
                throw Error("Property does not belong to this brand.");
              await tx.property.update({ where: { id: propertyId }, data });
            } else
              await tx.property.create({
                data: { ...data, brandId: e.brand.id },
              });
          }
        });
        notice =
          "Brand and portfolio saved. Re-synthesize to update the discovery brief.";
        break;
      }
      case "save-brief": {
        const { markdown } = z
          .object({ markdown: z.string().max(100000) })
          .parse(body);
        await db.engagement.update({
          where: { id },
          data: { discoveryBrief: markdown },
        });
        break;
      }
      case "synthesize": {
        if (!e.answers.some((a) => a.answer.trim()))
          throw Error("Add some discovery answers before synthesizing.");
        const result = hasAI()
          ? await structured(
              "discovery",
              e,
              z.object({
                markdown: z.string().min(100),
                audiences: z.array(audienceDefinitionSchema).min(4).max(6),
              }),
            )
          : {
              markdown: discoveryMarkdown(e.brand, e.property, e.answers),
              audiences: seedAudiences,
            };
        await db.$transaction(async (tx) => {
          await tx.engagement.update({
            where: { id },
            data: {
              discoveryBrief: result.markdown,
              recommendations: json(result.audiences),
            },
          });
          if (!e.audiences.length)
            await tx.audience.createMany({
              data: result.audiences.map((def) => ({
                engagementId: id,
                name: def.name,
                definition: json(def),
                platforms: json(def.platforms),
                composition: json({
                  platformMix: [],
                  topAffinities: [],
                  overlaps: [],
                }),
              })),
            });
        });
        notice = hasAI()
          ? "Fresh discovery synthesis created with Claude."
          : "Curated demo synthesis refreshed from your inputs. Add an Anthropic key for new strategic analysis.";
        break;
      }
      case "recommend-audiences": {
        if (!e.discoveryBrief)
          throw Error("Synthesize discovery before building audiences.");
        const definitions = hasAI()
          ? (
              await structured(
                "audiences",
                e,
                z.object({
                  audiences: z.array(audienceDefinitionSchema).min(4).max(6),
                }),
              )
            ).audiences
          : e.recommendations;
        if (!definitions.length)
          throw Error(
            "No recommendations in this brief. Synthesize again or add an audience.",
          );
        const existing = new Set(e.audiences.map((a) => a.name.toLowerCase()));
        await db.audience.createMany({
          data: definitions
            .filter((a) => !existing.has(a.name.toLowerCase()))
            .map((def) => ({
              engagementId: id,
              name: def.name,
              definition: json(def),
              platforms: json(def.platforms),
              composition: json({
                platformMix: [],
                topAffinities: [],
                overlaps: [],
              }),
            })),
        });
        notice = hasAI()
          ? "Fresh audience recommendations added. Existing segments were preserved."
          : "Recommended demo audiences added. Existing segments were preserved.";
        break;
      }
      case "save-audience": {
        const { audienceId, definition } = z
          .object({
            audienceId: z.string().optional(),
            definition: audienceDefinitionSchema,
          })
          .parse(body);
        const data = {
          name: definition.name,
          definition: json(definition),
          platforms: json(definition.platforms),
          status: "draft",
          size: 0,
          composition: json({
            platformMix: [],
            topAffinities: [],
            overlaps: [],
          }),
        };
        if (audienceId) {
          if (!e.audiences.some((a) => a.id === audienceId))
            throw Error("Audience not found in this engagement.");
          await db.audience.update({ where: { id: audienceId }, data });
        } else
          await db.audience.create({ data: { ...data, engagementId: id } });
        notice =
          "Audience saved as a draft. Push to SocialGlass to estimate its composition.";
        break;
      }
      case "push-audience": {
        const { audienceId } = z.object({ audienceId: z.string() }).parse(body);
        const a = e.audiences.find((a) => a.id === audienceId);
        if (!a) throw Error("Audience not found.");
        const { size, ...composition } = await getSocialGlass().createAudience(
          a.definition,
        );
        await db.audience.update({
          where: { id: audienceId },
          data: { size, composition: json(composition), status: "live" },
        });
        notice =
          "Audience connected to mock SocialGlass. Estimate and composition refreshed.";
        break;
      }
      case "delete-audience": {
        const { audienceId } = z.object({ audienceId: z.string() }).parse(body);
        if (!e.audiences.some((a) => a.id === audienceId))
          throw Error("Audience not found.");
        await db.audience.delete({ where: { id: audienceId } });
        notice = "Audience removed. Historic snapshots were preserved.";
        break;
      }
      case "run-tracking": {
        const v = z
          .object({
            audienceIds: z.array(z.string()).min(1).max(30),
            window: z.object({ start: z.iso.date(), end: z.iso.date() }),
          })
          .parse(body);
        const duration =
          (Date.parse(v.window.end) - Date.parse(v.window.start)) / 86400000;
        if (duration < 0 || duration > 365)
          throw Error("Choose a tracking window between 1 and 366 days.");
        const audiences = e.audiences.filter((a) =>
          v.audienceIds.includes(a.id),
        );
        if (audiences.length !== new Set(v.audienceIds).size)
          throw Error("One or more audiences are not in this engagement.");
        const raw = await getSocialGlass().getTrends({
          audienceIds: audiences.map((a) => a.name),
          window: v.window,
        });
        const scored = hasAI()
          ? (
              await structured(
                "scoring",
                {
                  discovery: e.discoveryBrief,
                  brand: e.brand,
                  property: e.property,
                  trends: raw.map((t) => ({ ...t, id: t.key })),
                  window: v.window,
                },
                z.object({
                  scores: z
                    .array(
                      z.object({
                        id: z.string(),
                        brandRelevance: z.number().int().min(0).max(100),
                        propertyRelevance: z.number().int().min(0).max(100),
                        whyItMatters: z.string(),
                      }),
                    )
                    .min(raw.length)
                    .max(raw.length),
                }),
              )
            ).scores
          : null;
        if (
          scored &&
          (new Set(scored.map((s) => s.id)).size !== raw.length ||
            raw.some((t) => !scored.some((s) => s.id === t.key)))
        )
          throw Error(
            "Claude returned incomplete trend scores. Please retry; the last snapshot was preserved.",
          );
        await db.trendSnapshot.create({
          data: {
            engagementId: id,
            audienceId: audiences[0].id,
            audienceIds: json(audiences.map((a) => a.id)),
            window: json(v.window),
            trends: {
              create: raw.map((t) => {
                const { key, ...rest } = t;
                const score = scored?.find((s) => s.id === key);
                return {
                  ...rest,
                  platforms: json(t.platforms),
                  exemplars: json(t.exemplars),
                  weeklyVolume: json(t.weeklyVolume),
                  relevanceScore: score?.brandRelevance ?? t.relevanceScore,
                  propertyScore: score?.propertyRelevance ?? t.propertyScore,
                  whyItMatters: score?.whyItMatters ?? t.whyItMatters,
                };
              }),
            },
          },
        });
        notice = hasAI()
          ? "New mock trend snapshot captured with fresh Claude relevance scores."
          : "New snapshot captured from the curated mock library. Star signals to take into ideation.";
        break;
      }
      case "star-trend": {
        const { trendId, starred } = z
          .object({ trendId: z.string(), starred: z.boolean() })
          .parse(body);
        if (!e.snapshots.some((s) => s.trends.some((t) => t.id === trendId)))
          throw Error("Trend not found in this engagement.");
        await db.trend.update({ where: { id: trendId }, data: { starred } });
        notice = starred
          ? "Signal added to your creative shortlist."
          : "Signal removed from your shortlist.";
        break;
      }
      case "generate-ideas": {
        const v = z
          .object({
            scope: z.enum(["brand", "property"]),
            propertyId: z.string().nullable(),
            trendIds: z.array(z.string()).min(1).max(30),
          })
          .parse(body);
        const trends = e.snapshots
          .flatMap((s) => s.trends)
          .filter((t) => v.trendIds.includes(t.id) && t.starred);
        if (trends.length !== new Set(v.trendIds).size)
          throw Error(
            "Select only starred trends belonging to this engagement.",
          );
        if (
          v.scope === "property" &&
          !e.brand.properties.some((p) => p.id === v.propertyId)
        )
          throw Error("Choose a property from this brand's portfolio.");
        const ideas = await generateIdeas(e, v.scope, v.propertyId, trends);
        await db.$transaction(async (tx) => {
          await tx.engagement.update({
            where: { id },
            data: {
              scope: v.scope,
              propertyId: v.scope === "property" ? v.propertyId : null,
            },
          });
          await tx.output.createMany({
            data: ideas.map((i) => ({
              ...i,
              engagementId: id,
              brief: json(i.brief),
              score: json(i.score),
              trendIds: json(i.trendIds),
            })),
          });
        });
        notice = hasAI()
          ? `${ideas.length} fresh ideas generated by Claude. Existing concepts are preserved.`
          : `${ideas.length} curated demo concepts created using your selected signals and rights. Existing concepts are preserved.`;
        break;
      }
      case "regenerate":
      case "resize": {
        const v = z
          .object({
            outputId: z.string(),
            direction: z.enum(["smaller", "bigger"]).optional(),
          })
          .parse(body);
        const original = e.outputs.find((o) => o.id === v.outputId);
        if (!original) throw Error("Idea not found.");
        const trends = e.snapshots
          .flatMap((s) => s.trends)
          .filter((t) => original.trendIds.includes(t.id));
        let budget: Budget | undefined;
        if (action === "resize") {
          if (!v.direction) throw Error("Choose a budget direction.");
          const bands: Budget[] = ["S", "M", "L"];
          budget =
            bands[
              Math.max(
                0,
                Math.min(
                  2,
                  bands.indexOf(original.brief.budget) +
                    (v.direction === "bigger" ? 1 : -1),
                ),
              )
            ];
        }
        const [next] = await generateIdeas(
          e,
          original.scope,
          original.propertyId,
          trends,
          original.lane,
          original,
          budget,
        );
        await db.output.update({
          where: { id: original.id },
          data: {
            ...next,
            brief: json(next.brief),
            score: json(next.score),
            trendIds: json(next.trendIds),
          },
        });
        notice = budget
          ? `Idea re-scoped to ${budget}. Execution details updated; existing rendering is a previous concept visualization.`
          : hasAI()
            ? "Idea regenerated with Claude. Existing renderings are preserved as prior concept references."
            : "Curated alternative created. Add an Anthropic key for fresh creative generation.";
        break;
      }
      case "save-output": {
        const v = z
          .object({
            outputId: z.string(),
            title: z.string().trim().min(1).max(200),
            hook: z.string().max(500),
            concept: z.string().min(1).max(20000),
            brief: briefSchema,
          })
          .parse(body);
        if (!e.outputs.some((o) => o.id === v.outputId))
          throw Error("Idea not found.");
        const { outputId, ...data } = v;
        await db.output.update({
          where: { id: outputId },
          data: { ...data, brief: json(v.brief) },
        });
        notice =
          "Idea updated. Review its rights and constraints before client use.";
        break;
      }
      case "score-output": {
        const v = z
          .object({ outputId: z.string(), score: scoreSchema })
          .parse(body);
        if (!e.outputs.some((o) => o.id === v.outputId))
          throw Error("Idea not found.");
        await db.output.update({
          where: { id: v.outputId },
          data: { score: json(v.score) },
        });
        notice = "Consultant scores saved.";
        break;
      }
      case "render": {
        const v = z
          .object({
            outputId: z.string(),
            location: z.string().max(200).optional(),
            automatic: z.boolean().optional(),
          })
          .parse(body);
        const idea = e.outputs.find((o) => o.id === v.outputId);
        if (!idea || idea.lane !== "experiential")
          throw Error("Experiential idea not found.");
        const location = v.location
          ? idea.brief.alternateLocations?.find((l) => l.name === v.location)
          : null;
        if (v.location && !location)
          throw Error("Choose one of this idea's alternate locations.");
        let prompt = idea.brief.renderingPrompt || "";
        if (location)
          prompt = hasAI()
            ? (
                await structured(
                  "rendering",
                  { idea, location },
                  z.object({ prompt: z.string().min(100) }),
                )
              ).prompt
            : `${prompt}\nLocation variation: ${location.name}. ${location.description}. Adapt the same installation to this location. No readable text, no real player likenesses, no real team marks.`;
        if (!prompt) throw Error("Add a rendering prompt to the idea first.");
        const result = await getImageProvider().generate(prompt);
        if (result) {
          await db.rendering.create({ data: { outputId: idea.id, ...result } });
          notice = "New concept rendering saved.";
        } else
          notice =
            "Rendering: add image provider key. Your concept, prompt, and existing seeded images are preserved.";
        if (location && result)
          await db.output.update({
            where: { id: idea.id },
            data: { brief: json({ ...idea.brief, renderingPrompt: prompt }) },
          });
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 404 });
    }
    return NextResponse.json({ engagement: await getEngagement(id), notice });
  } catch (err) {
    console.error(
      "Workspace action failed",
      err instanceof Error ? err.name : "unknown",
    );
    const message =
      err instanceof z.ZodError
        ? `Check your inputs: ${err.issues
            .slice(0, 2)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}`
        : err instanceof Prisma.PrismaClientKnownRequestError
          ? "The database could not save this change. Check the connection and try again."
          : err instanceof Error
            ? err.message
            : "Unable to complete this action.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
