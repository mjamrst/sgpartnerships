import type {
  AudienceDefinition,
  Brand,
  IdeaBrief,
  Lane,
  Property,
  Scope,
  Score,
} from "./types";
export const seedProperties: Property[] = [
  {
    id: "harbor",
    name: "Los Angeles Harbor",
    type: "team",
    dealTerms: {
      term: "2026–2029 · 3 years",
      relationship: "Official banking partner",
      activated: ["Courtside signage"],
      unused: [
        "2 player appearances per year",
        "Northstar Vault programming",
        "Community financial-literacy program",
      ],
    },
    assets: [
      "Courtside signage",
      "2 player appearances per year (individual releases required)",
      "Approved team marks, jersey-patch-adjacent usage",
      "The Northstar Vault in-arena branded lounge",
      "Community financial-literacy program",
    ],
  },
  {
    id: "pacific",
    name: "Pacific Open",
    type: "event",
    dealTerms: {
      term: "2026–2028",
      relationship: "Title sponsor · golf event",
      activated: ["VIP hospitality tent"],
      unused: ["Title sponsorship storytelling", "Guest welcome experiences"],
    },
    assets: [
      "Event title sponsorship",
      "Approved event marks",
      "VIP hospitality tent",
      "Guest welcome experiences",
    ],
  },
  {
    id: "solstice",
    name: "Solstice Music Festival",
    type: "festival",
    dealTerms: {
      term: "2026–2027",
      relationship: "Official hospitality partner",
      activated: ["Guest hospitality"],
      unused: ["Hospitality lounge programming"],
    },
    assets: [
      "Branded hospitality lounge",
      "Guest hospitality allocation",
      "Approved hospitality-area signage",
    ],
  },
];
export const seedBrand: Brand = {
  id: "northstar",
  name: "Northstar Financial",
  category: "Consumer banking + wealth",
  objectives: [
    "Grow affluent-adjacent customers aged 25–40",
    "Modernize brand perception",
    "Drive qualified app sign-ups",
    "Deepen local relevance in Los Angeles",
  ],
  history: [
    "Own Your Next (2025): 18,400 app sign-ups from practical creator tutorials.",
    "Courtside Perks (2025): high entries, only 8% 30-day activation; avoid giveaway-led acquisition.",
    "LA Small Wins (2026): neighborhood portraits improved local relevance by 6 points in the fictional demo study.",
    "Kai Mercer: retired-guard literacy workshops worked. Jules Park: practical lifestyle content drove saves. Generic celebrity endorsement had poor recall.",
  ],
  toneOfVoice:
    "Assured, warm, observant, useful. Quiet confidence, never preachy or ostentatious.",
  constraints: [
    "No gambling adjacency",
    "No crypto",
    "No under-18 targeting",
    "No financial advice or performance promises",
    "Paid partnerships require disclosure",
    "No game-footage or broadcast rights",
    "Player appearances require scheduling and releases",
  ],
  sources: [
    "Brand discovery interview (fictional)",
    "Harbor Discord excerpts (mock)",
    "Reddit fan threads (mock)",
    "Brand-owned social comments (mock)",
  ],
  properties: seedProperties,
};
const audience = (
  name: string,
  seedAccounts: string[],
  interests: string[],
  behaviors: string[],
  platforms: string[],
  ageBand: string,
): AudienceDefinition => ({
  name,
  seedAccounts,
  interests,
  behaviors,
  platforms,
  geo: "Los Angeles metro",
  ageBand,
  exclusions: [
    "Under 18",
    "Gambling",
    "Crypto promotion",
    "Known spam accounts",
  ],
});
export const seedAudiences: AudienceDefinition[] = [
  audience(
    "Harbor Diehards",
    ["@laharbor", "@harbor.fieldnotes"],
    ["Los Angeles basketball", "fan rituals", "local sports"],
    [
      "Engages with Harbor posts weekly",
      "Participates in postgame conversations",
    ],
    ["Instagram", "X", "Reddit", "Discord"],
    "25–40",
  ),
  audience(
    "LA Culture Crossovers",
    ["@la.smallwins", "@tunnel.notes"],
    ["Streetwear", "LA food", "music", "tunnel fits"],
    ["Shares game-day style", "Follows local makers and cultural venues"],
    ["Instagram", "TikTok", "YouTube"],
    "25–40",
  ),
  audience(
    "Young Money",
    ["@moneyinprogress", "@smallstep.club"],
    ["Financial confidence", "career progress", "saving goals"],
    [
      "Saves money check-in videos",
      "Engages with practical fintech explainers",
    ],
    ["TikTok", "YouTube", "Reddit"],
    "22–34",
  ),
  audience(
    "Basketball Creator Economy",
    ["@hoops.workshop", "@courtsidecollective"],
    ["Basketball storytelling", "short-form editing", "creator tools"],
    ["Posts original hoops content", "Remixes fan formats"],
    ["TikTok", "Instagram", "YouTube", "Twitch"],
    "22–40",
  ),
  audience(
    "Courtside Affluents",
    ["@quietcourtside", "@cityhost.la"],
    ["Premium hospitality", "design", "local dining"],
    [
      "Engages with premium event experiences",
      "Follows LA hospitality tastemakers",
    ],
    ["Instagram", "YouTube", "X"],
    "30–55",
  ),
];
export function discoveryMarkdown(
  brand: Brand,
  property: Property | null,
  answers: { questionKey: string; answer: string }[],
) {
  const answer = (key: string, fallback: string) =>
    answers.find((a) => a.questionKey === key)?.answer || fallback;
  return `## Executive summary\n${brand.name} has permission to be useful at the intersection of fandom, local culture, and personal progress. Its opportunity is to turn existing partnership access into moments people choose to share—and give the app a practical role after the moment. ${property ? `Start with ${property.name}.` : "Build a consistent idea across the portfolio, adapting to each deal’s rights."}\n\n## Objective hierarchy\n${brand.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nSuccess measures: ${answer("kpis", "Qualified app activation, consideration, and voluntary sharing.")}\n\n## Portfolio asset map\n${brand.properties.map((p) => `### ${p.name}\n- Used: ${p.dealTerms.activated.join("; ") || "None recorded"}\n- Untapped: ${p.dealTerms.unused.join("; ") || "Review rights inventory"}\n- Contracted assets: ${p.assets.join("; ")}`).join("\n\n")}\n\n## Audience hypotheses\nCore fans offer credibility; culture crossovers offer new relevance; financially curious adults offer a natural product bridge. Premium guests want thoughtful care rather than visible extravagance. Test these hypotheses with the audience definitions before treating them as findings.\n\n## Tensions & risks\n${brand.constraints.map((c) => `- ${c}`).join("\n")}\n- ${answer("approvals", "Confirm brand, compliance, property, and talent approvals before production.")}\n- The appearance allocation is finite: ideas are alternatives, not a promise that every player idea can run.\n- Demo social signals are fictional and cannot substantiate market claims.\n\n## Recommended audiences for SocialGlass\n${seedAudiences.map((a) => `- **${a.name}** — ${a.interests.join(", ")}; ages ${a.ageBand}.`).join("\n")}\n\n## Creative direction\n${answer("voice", brand.toneOfVoice)}\n\n${answer("community", "Build with community hosts, pay for their expertise, and make participation useful before asking for a conversion.")}\n\n*Curated demo synthesis. Review and edit before sharing with a client.*`;
}
const ideaTemplates: Record<
  Lane,
  {
    title: string;
    hook: string;
    mechanic: string;
    talent?: string;
    image?: string;
  }[]
> = {
  athlete_creator: [
    {
      title: "The fit has a backstory",
      hook: "Every game-day look has a story. Let the city tell it.",
      mechanic:
        "a local style creator interviews a player about a meaningful, well-worn piece, then invites adult fans to tell the story behind their own game-day look",
      talent: "Local-born player + independent LA stylist",
    },
    {
      title: "Rookie moves. Real progress.",
      hook: "Big-league energy for the smallest personal wins.",
      mechanic:
        "the rookie and a practical money creator trade honest stories about being beginners, ending each beat with one small action they can actually repeat",
      talent: "The rookie + financially curious adult creator",
    },
    {
      title: "Home-court knowledge",
      hook: "The veteran knows the game. The neighborhood knows the city.",
      mechanic:
        "a veteran player swaps expertise with a paid neighborhood food host in a moderated conversation that makes both people a beginner",
      talent: "Veteran leader + neighborhood food creator",
    },
    {
      title: "The assist you never see",
      hook: "Put the people behind the progress in the frame.",
      mechanic:
        "a local-born player introduces the community mentor who helped them build a routine, then a creator gathers equivalent stories from adult fans",
      talent: "Local-born player + community storyteller",
    },
  ],
  experiential: [
    {
      title: "Your walk. Your moment.",
      hook: "The tunnel walk belongs to the fans tonight.",
      mechanic:
        "a ribbed green portrait tunnel turns a lounge arrival into a twelve-second personal entrance, captured by an opt-in camera and returned privately to each adult participant",
      image: "vault-tunnel.png",
    },
    {
      title: "A table for the whole city",
      hook: "One long table. A different LA neighborhood every home stand.",
      mechanic:
        "a communal oak tasting table hosts paid local food makers and adult fan hosts, with a seat card inviting each guest to share one local discovery",
      image: "neighborhood-table.png",
    },
    {
      title: "A portrait of what's next",
      hook: "Make the next memory feel close enough to start.",
      mechanic:
        "three softly glowing portrait alcoves invite adults to choose an experience they are looking forward to, capture a private future-self portrait, and optionally explore a savings-goal feature",
      image: "future-self.png",
    },
    {
      title: "The third-half living room",
      hook: "Give the group chat somewhere to sit.",
      mechanic:
        "a hosted lounge circle pairs comfortable seats and a communal portrait camera with a short, creator-led conversation about the evening’s small wins",
      image: "neighborhood-table.png",
    },
  ],
  social: [
    {
      title: "A night out, on your terms",
      hook: "Same game. Three budgets. No wrong answers.",
      mechanic:
        "three adult creators show different ways to build a satisfying game night using fictional sample budgets, with transit, food, and personal priorities visible in the edit",
    },
    {
      title: "The Sunday reset, Harbor edition",
      hook: "The score is final. Your next week isn't.",
      mechanic:
        "a creator shares a thirty-second Sunday planning ritual after game night, using a deliberately fictional app demo and one attainable next step",
    },
    {
      title: "What the group chat saved",
      hook: "The best part of game night was never on the scoreboard.",
      mechanic:
        "fans submit opt-in original portraits of a detail worth keeping and a community host edits three into a short carousel with a neighborhood recommendation",
    },
    {
      title: "Small wins deserve a replay",
      hook: "A standing ovation for something wonderfully ordinary.",
      mechanic:
        "adult creators celebrate a small practical win with an original two-beat reaction format that fans can remake without game footage or player likenesses",
    },
  ],
};
export function makeIdeas(
  brand: Brand,
  properties: Property[],
  trends: { id: string; title: string }[],
  scope: Scope,
  variant = 0,
) {
  return (Object.keys(ideaTemplates) as Lane[]).flatMap((lane) =>
    ideaTemplates[lane].map((item, i) => {
      const property = properties[i % properties.length];
      const preferred: Record<Lane, string[]> = {
        athlete_creator: ["tunnel", "check-in", "bite", "memory"],
        experiential: ["tunnel", "bite", "memory", "group chat"],
        social: ["receipt", "check-in", "group chat", "memory"],
      };
      const trend =
        (variant === 0
          ? trends.find((t) =>
              t.title.toLowerCase().includes(preferred[lane][i]),
            )
          : undefined) ?? trends[(i + variant) % trends.length];
      const assets = property?.assets ?? [];
      const lounge = assets.find((a) => /lounge|hospitality|tent/i.test(a));
      const appearance = assets.find((a) => /appearance/i.test(a));
      const right =
        lane === "experiential"
          ? lounge || assets[0]
          : lane === "athlete_creator"
            ? appearance || assets[0]
            : assets.find((a) => /mark|signage|community/i.test(a)) ||
              assets[0];
      const location =
        lounge ||
        `Partner-approved activation area at ${property?.name ?? "the property"}`;
      const objective =
        brand.objectives[i % brand.objectives.length] ||
        "Build meaningful brand consideration";
      const mechanic =
        lane === "athlete_creator" && !appearance
          ? item.mechanic.replace(
              /a player|the rookie|a veteran player|a local-born player/g,
              "an independently contracted adult creator",
            )
          : item.mechanic;
      const prompt = `Photoreal architectural event visualization, 16:9. ${location}, modern venue in Los Angeles, evening, warm practical lighting, adult crowds in neutral green and cream. Installation: ${mechanic}. Brand presence: neutral four-point star placeholder emblem and deep green #2f5d50; sage and warm oak materials. ${brand.name} concept only. No readable text, no real player likenesses, no real team marks, no children, no financial figures.`;
      const brief: IdeaBrief = {
        objective,
        rights: right ? [right] : [],
        budget: i === 2 ? "L" : "M",
        timing:
          "Pilot at the next eligible home stand after a 3–4 week approval and production window.",
        risks: [
          ...brand.constraints.slice(0, 3),
          "Confirm property, compliance, accessibility, and participant releases before launch.",
          ...(lane === "athlete_creator"
            ? [
                "Reserve within the two-appearance annual allocation; these concepts are alternatives.",
              ]
            : []),
        ],
        measurement:
          "Track voluntary shares and saves, opt-in app sign-ups with a unique link, and 30-day activation; compare against a pre-agreed baseline.",
        fanReason:
          "A personal story with friends, useful local knowledge, and an asset worth keeping—not a forced sponsor post.",
        provenance:
          "Curated demo concept; illustrative estimates and hypothetical outcomes.",
      };
      if (lane === "athlete_creator")
        Object.assign(brief, {
          talent: appearance
            ? item.talent
            : "Independent adult creator; player participation not included in this property’s rights",
          ask: "One moderated appearance and a separately approved capture plan. No implied endorsement beyond the signed release.",
          deliverables: [
            "1 hosted appearance within the annual allocation",
            "1 approved 45-second original recap",
            "3 creator cutdowns, subject to individual content releases",
          ],
          storyline: [
            "Reveal the human detail behind the ritual",
            "Let a community member add their version",
            "Invite a small, useful next step",
          ],
          coBranding: `${brand.name} as host; approved ${property?.name} marks only. No footage or implied extra player rights.`,
        });
      if (lane === "experiential")
        Object.assign(brief, {
          location,
          footprint:
            i === 1
              ? "8 × 5 m; 18 seated adults; accessible aisle"
              : "6 × 4 m; accessible circulation; 2 hosts",
          ritual: item.hook,
          capture:
            "Opt-in original portrait or 12-second clip, delivered privately; sharing is optional and never required for access.",
          renderingPrompt: prompt,
          alternateLocations: [
            {
              name: "Lounge entry",
              description:
                "A compact version within the existing contracted lounge footprint.",
            },
            {
              name: "Community-program venue",
              description:
                "Subject to separate venue permission, access review, and community-program rights.",
            },
            {
              name: "Neighborhood pop-up",
              description:
                "Optional extension requiring a separate site agreement and permits; not included in current rights.",
            },
          ],
        });
      if (lane === "social")
        Object.assign(brief, {
          platform: i === 2 ? "Instagram" : "TikTok + Instagram",
          format: i === 2 ? "Carousel" : "Reels / TikTok",
          openingHook: item.hook,
          posts: [
            {
              concept: "The honest first take",
              caption: `A little progress, on your terms. ${item.hook} #PaidPartnership`,
            },
            {
              concept: "The neighborhood version",
              caption:
                "Your city has a few good ideas. Save this one for game night. #PaidPartnership",
            },
            {
              concept: "The community response",
              caption:
                "What would your version look like? Keep your numbers private; share the ritual. #PaidPartnership",
            },
          ],
          publisher: "Creator-led, with approved brand-handle amplification",
          cadence: "3 posts over 10 days, then a community response edit",
        });
      const concept = `Built around “${trend?.title ?? "fan rituals"},” this idea makes ${brand.name} a useful host in ${property?.name ?? "the partnership"}. In practice, ${mechanic}. The experience starts with something fans already care about and gives them a personal way to join in.\n\nUse ${right ?? "only separately confirmed rights"} as the contracted foundation. Keep the brand’s role quiet and clear: cover the cost of good hosting, pay community collaborators, and make the experience easy to understand. Participation is for adults, with an accessible route and a genuine option to enjoy the moment without posting or signing up.\n\nThe product connection comes after the useful moment. Offer an optional, clearly disclosed link to a relevant app feature, with a fictional demonstration where needed; never ask people to reveal balances, promise financial outcomes, or turn a social experience into personalized advice. Fans have a reason to share because the result belongs to their own story and their friends.\n\nStart with one controlled pilot, confirm property and compliance approvals, then compare voluntary sharing and retained app activation with the agreed baseline. The objective is specific: ${objective.toLowerCase()}. If the ritual earns repeat participation, expand the footprint without adding rights the agreement does not contain.`;
      return {
        lane,
        trendIds: trend ? [trend.id] : [],
        title: item.title + (variant ? ` · Route ${variant + 1}` : ""),
        hook: item.hook,
        concept,
        brief,
        score: {
          originality: 4,
          brandFit: 5,
          feasibility: i === 2 ? 3 : 4,
          socialVelocity: 4,
        } as Score,
        status: "draft",
        scope,
        propertyId: property?.id ?? null,
        seedImage: lane === "experiential" ? item.image : undefined,
      };
    }),
  );
}
