import { z } from "zod";
export const stringList = z.array(z.string().trim().max(3000)).max(60);
export const audienceDefinitionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  seedAccounts: stringList,
  interests: stringList,
  behaviors: stringList,
  platforms: z
    .array(
      z.enum([
        "Instagram",
        "TikTok",
        "X",
        "YouTube",
        "Reddit",
        "Discord",
        "Twitch",
      ]),
    )
    .min(1),
  geo: z.string().max(500),
  ageBand: z.string().max(80),
  exclusions: stringList,
});
export const scoreSchema = z.object({
  originality: z.number().int().min(1).max(5),
  brandFit: z.number().int().min(1).max(5),
  feasibility: z.number().int().min(1).max(5),
  socialVelocity: z.number().int().min(1).max(5),
});
export const briefSchema = z.object({
  objective: z.string().min(1),
  rights: stringList,
  budget: z.enum(["S", "M", "L"]),
  timing: z.string(),
  risks: stringList,
  measurement: z.string(),
  fanReason: z.string(),
  talent: z.string().optional(),
  ask: z.string().optional(),
  deliverables: stringList.optional(),
  storyline: stringList.optional(),
  coBranding: z.string().optional(),
  location: z.string().optional(),
  footprint: z.string().optional(),
  ritual: z.string().optional(),
  capture: z.string().optional(),
  renderingPrompt: z.string().optional(),
  alternateLocations: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  openingHook: z.string().optional(),
  posts: z
    .array(z.object({ concept: z.string(), caption: z.string() }))
    .optional(),
  publisher: z.string().optional(),
  cadence: z.string().optional(),
  provenance: z.string(),
});
export const ideaSchema = z.object({
  title: z.string().min(1).max(200),
  hook: z.string().min(1).max(500),
  concept: z.string().min(100).max(12000),
  trendIds: z.array(z.string()).min(1),
  propertyId: z.string(),
  brief: briefSchema,
  score: scoreSchema,
});
export const answerSchema = z.object({
  questionKey: z.string().min(1).max(100),
  answer: z.string().max(300000),
  source: z.enum(["brand", "consultant", "discord", "social", "doc"]),
});
export const propertySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  type: z.enum(["team", "league", "event", "venue", "festival", "athlete"]),
  assets: stringList,
  dealTerms: z.object({
    term: z.string(),
    relationship: z.string(),
    activated: stringList,
    unused: stringList,
  }),
});
export const brandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().max(300),
  objectives: stringList,
  history: stringList,
  toneOfVoice: z.string().max(10000),
  constraints: stringList,
  sources: stringList,
});
