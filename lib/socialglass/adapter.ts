import type {
  AudienceDefinition,
  AudienceEstimate,
  Composition,
  DateRange,
  TrendRaw,
} from "@/lib/types";
import { trendLibrary } from "./mock-data/trends";
export interface SocialGlassAdapter {
  createAudience(def: AudienceDefinition): Promise<AudienceEstimate>;
  getTrends(params: {
    audienceIds: string[];
    window: DateRange;
  }): Promise<TrendRaw[]>;
  getAudienceComposition(audienceId: string): Promise<Composition>;
}
export function seededRandom(key: string) {
  let seed = [...key].reduce(
    (a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0,
    2166136261,
  );
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function composition(
  key: string,
  platforms = ["Instagram", "TikTok", "YouTube"],
): Composition {
  const rng = seededRandom(key);
  const weights = platforms.map(() => 10 + rng() * 80);
  const total = weights.reduce((a, b) => a + b, 0);
  const mix = weights.map((w, i) => ({
    name: platforms[i],
    percentage: Math.floor((w / total) * 100),
  }));
  if (mix.length)
    mix[0].percentage += 100 - mix.reduce((n, p) => n + p.percentage, 0);
  return {
    platformMix: mix,
    topAffinities: [
      "Basketball culture",
      "LA food & neighborhoods",
      "Personal progress",
    ].map((name) => ({ name, percentage: 42 + Math.floor(rng() * 42) })),
    overlaps: [
      {
        name: "Adjacent fan communities",
        percentage: 18 + Math.floor(rng() * 20),
      },
      {
        name: "Financially curious audiences",
        percentage: 12 + Math.floor(rng() * 20),
      },
    ],
  };
}
export class MockSocialGlassAdapter implements SocialGlassAdapter {
  async createAudience(def: AudienceDefinition): Promise<AudienceEstimate> {
    return {
      size:
        Math.round(
          (80000 + seededRandom(JSON.stringify(def))() * 640000) / 1000,
        ) * 1000,
      ...composition(def.name, def.platforms),
    };
  }
  async getAudienceComposition(audienceId: string) {
    return composition(audienceId);
  }
  async getTrends({
    audienceIds,
    window,
  }: {
    audienceIds: string[];
    window: DateRange;
  }): Promise<TrendRaw[]> {
    const rng = seededRandom(
      [...audienceIds].sort().join("|") + window.start + window.end,
    );
    const anchors = new Set([
      "tunnel",
      "food",
      "checkin",
      "afterhours",
      "save",
    ]);
    const core = trendLibrary
      .filter((row) => anchors.has(row[0]))
      .map((row) => ({ row, order: 0 }));
    const library = [
      ...core,
      ...trendLibrary
        .filter((row) => !anchors.has(row[0]))
        .map((row) => ({ row, order: rng() }))
        .sort((a, b) => a.order - b.order)
        .slice(0, 11),
    ];
    return library.map(({ row }, i) => {
      const [
        key,
        title,
        summary,
        category,
        velocity,
        platformText,
        whyItMatters,
      ] = row;
      const platforms = platformText.split(",");
      const growth =
        velocity === "fading"
          ? -18 - Math.floor(rng() * 20)
          : velocity === "peaking"
            ? 30 + Math.floor(rng() * 45)
            : 65 + Math.floor(rng() * 180);
      const base = 1500 + rng() * 12000;
      const weeklyVolume = Array.from({ length: 13 }, (_, w) =>
        Math.round(
          base *
            (0.6 +
              ((velocity === "fading" ? (12 - w) / 12 : w / 12) *
                Math.abs(growth)) /
                100) *
            (0.85 + rng() * 0.3),
        ),
      );
      return {
        key,
        title,
        summary,
        category,
        velocity,
        volume: weeklyVolume.reduce((a, b) => a + b, 0),
        growth,
        relevanceScore: 72 + Math.floor(rng() * 27),
        propertyScore: 68 + Math.floor(rng() * 31),
        platforms,
        whyItMatters,
        weeklyVolume,
        exemplars: [
          "Here’s our version. Small details, good people, and a game-night story worth keeping.",
          "The comments made this better. What would your neighborhood add?",
          "Keeping it real: the useful part is the ritual, not the perfect result.",
        ].map((caption, j) => ({
          handle: [
            "@harbor.fieldnotes",
            "@la.smallwins",
            "@courtsidecollective",
          ][j],
          caption: `${title}: ${caption}`,
          platform: platforms[j % platforms.length],
          engagements: 1300 + Math.floor(rng() * 27000),
        })),
      };
    });
  }
}
export function getSocialGlass(): SocialGlassAdapter {
  if (process.env.SOCIALGLASS_MODE === "live")
    throw new Error(
      "Live SocialGlass is not configured. Implement RealSocialGlassAdapter or use SOCIALGLASS_MODE=mock.",
    );
  return new MockSocialGlassAdapter();
}
