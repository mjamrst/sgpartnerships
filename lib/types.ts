export type Scope = "brand" | "property";
export type Lane = "athlete_creator" | "experiential" | "social";
export type Budget = "S" | "M" | "L";
export interface AudienceDefinition {
  name: string;
  seedAccounts: string[];
  interests: string[];
  behaviors: string[];
  platforms: string[];
  geo: string;
  ageBand: string;
  exclusions: string[];
}
export interface Composition {
  platformMix: { name: string; percentage: number }[];
  topAffinities: { name: string; percentage: number }[];
  overlaps: { name: string; percentage: number }[];
}
export interface AudienceEstimate extends Composition {
  size: number;
}
export interface DateRange {
  start: string;
  end: string;
}
export interface Exemplar {
  handle: string;
  caption: string;
  platform: string;
  engagements: number;
}
export interface TrendRaw {
  key: string;
  title: string;
  summary: string;
  category: string;
  velocity: string;
  volume: number;
  growth: number;
  relevanceScore: number;
  propertyScore: number;
  platforms: string[];
  exemplars: Exemplar[];
  weeklyVolume: number[];
  whyItMatters: string;
}
export interface Trend extends TrendRaw {
  id: string;
  snapshotId: string;
  starred: boolean;
}
export interface Audience {
  id: string;
  name: string;
  definition: AudienceDefinition;
  size: number;
  platforms: string[];
  status: string;
  composition: Composition;
}
export interface Property {
  id: string;
  name: string;
  type: string;
  dealTerms: {
    term: string;
    relationship: string;
    activated: string[];
    unused: string[];
  };
  assets: string[];
}
export interface Brand {
  id: string;
  name: string;
  category: string;
  objectives: string[];
  history: string[];
  toneOfVoice: string;
  constraints: string[];
  sources: string[];
  properties: Property[];
}
export interface IdeaBrief {
  objective: string;
  rights: string[];
  budget: Budget;
  timing: string;
  risks: string[];
  measurement: string;
  fanReason: string;
  talent?: string;
  ask?: string;
  deliverables?: string[];
  storyline?: string[];
  coBranding?: string;
  location?: string;
  footprint?: string;
  ritual?: string;
  capture?: string;
  renderingPrompt?: string;
  alternateLocations?: { name: string; description: string }[];
  platform?: string;
  format?: string;
  openingHook?: string;
  posts?: { concept: string; caption: string }[];
  publisher?: string;
  cadence?: string;
  provenance: string;
}
export interface Score {
  originality: number;
  brandFit: number;
  feasibility: number;
  socialVelocity: number;
}
export interface Rendering {
  id: string;
  prompt: string;
  imageUrl: string;
  provider: string;
  createdAt: string;
}
export interface Idea {
  id: string;
  lane: Lane;
  trendIds: string[];
  title: string;
  hook: string;
  concept: string;
  brief: IdeaBrief;
  score: Score;
  status: string;
  scope: Scope;
  propertyId: string | null;
  renderings: Rendering[];
}
export interface Answer {
  id?: string;
  questionKey: string;
  answer: string;
  source: string;
}
export interface Snapshot {
  id: string;
  capturedAt: string;
  window: DateRange;
  audienceIds: string[];
  trends: Trend[];
}
export interface Engagement {
  id: string;
  name: string;
  scope: Scope;
  propertyId: string | null;
  status: string;
  createdAt: string;
  discoveryBrief: string;
  recommendations: AudienceDefinition[];
  brand: Brand;
  property: Property | null;
  answers: Answer[];
  audiences: Audience[];
  snapshots: Snapshot[];
  outputs: Idea[];
}
export const laneLabels: Record<Lane, string> = {
  athlete_creator: "Athlete & Creator",
  experiential: "Experiential",
  social: "Social Content",
};
export const platforms = [
  "Instagram",
  "TikTok",
  "X",
  "YouTube",
  "Reddit",
  "Discord",
  "Twitch",
];
