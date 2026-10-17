export const discoverySections = [
  {
    key: "basics",
    title: "Brand basics",
    description: "Start with what the business needs to change.",
    questions: [
      ["category", "Category", "Describe the category and core product."],
      [
        "positioning",
        "Positioning",
        "What does the brand stand for in one sentence?",
      ],
      [
        "objectives",
        "Business objectives",
        "List 3–5 priorities for the next 12 months.",
      ],
      [
        "kpis",
        "Success measures",
        "Which outcomes and KPIs will make this investment worthwhile?",
      ],
      [
        "customer",
        "Target customer",
        "Include demographics, mindset, and unmet needs.",
      ],
      [
        "geography",
        "Geographic priorities",
        "Where do you need to earn relevance?",
      ],
    ],
  },
  {
    key: "portfolio",
    title: "Partnership portfolio",
    description: "Map the rights you have to the opportunities ahead.",
    questions: [
      [
        "properties",
        "Properties under contract",
        "Include property type, deal term, and partnership role.",
      ],
      [
        "rights",
        "Contracted rights & assets",
        "Signage, IP, hospitality, appearances, content, and community rights.",
      ],
      [
        "activated",
        "Activated so far",
        "What has already been used, and what happened?",
      ],
      [
        "unused",
        "Untapped assets",
        "Which rights are waiting for a better idea?",
      ],
    ],
  },
  {
    key: "history",
    title: "History & learnings",
    description: "Keep the learning. Leave the predictable ideas behind.",
    questions: [
      [
        "campaigns",
        "Last three campaigns",
        "Campaign, result, and the useful lesson.",
      ],
      [
        "partners",
        "Previous athlete & creator partners",
        "Who worked, who did not, and why?",
      ],
      [
        "win",
        "What a win looks like",
        "Make the commercial and cultural ambition concrete.",
      ],
      [
        "rejected",
        "Tried or rejected",
        "Where should we avoid repeating the past?",
      ],
    ],
  },
  {
    key: "voice",
    title: "Voice & constraints",
    description: "Define the creative room and the guardrails.",
    questions: [
      ["voice", "Tone of voice", "How should the brand sound?"],
      [
        "visual",
        "Visual identity",
        "Colors, materials, composition, and logo treatment.",
      ],
      [
        "legal",
        "Legal & compliance no-gos",
        "Document hard exclusions and disclosure requirements.",
      ],
      [
        "exclusivity",
        "Category exclusivities",
        "What adjacent brands or categories are restricted?",
      ],
      [
        "approvals",
        "Approval process",
        "Who signs off, and how long does it take?",
      ],
      ["budget", "Activation budget", "Small, medium, and large budget bands."],
    ],
  },
  {
    key: "hypotheses",
    title: "Audience hypotheses",
    description: "Separate what we know from what we need to test.",
    questions: [
      [
        "fans",
        "Who you think your audience is",
        "Describe existing customers and fans.",
      ],
      [
        "underindex",
        "Communities to reach",
        "Where is the brand missing from the conversation?",
      ],
      [
        "competitors",
        "Competitor set",
        "Include financial and cultural competitors.",
      ],
    ],
  },
  {
    key: "community",
    title: "Community signals",
    description: "Bring the unfiltered voice of the community into the room.",
    questions: [
      [
        "discord",
        "Discord exports",
        "Paste text or upload a .txt, .md, .csv, or .json export.",
      ],
      [
        "reddit",
        "Reddit threads",
        "Paste discussion excerpts with community context.",
      ],
      [
        "comments",
        "Brand social comments",
        "Include recurring questions and friction, not just praise.",
      ],
    ],
  },
] as const;
export const seedAnswers: Record<string, string> = {
  category: "Consumer banking + wealth platform",
  positioning:
    "A bank for the life you are building, with a real stake in your city.",
  objectives:
    "Grow affluent-adjacent customers aged 25–40; modernize brand perception; drive app sign-ups; deepen local relevance in Los Angeles.",
  kpis: "Qualified app sign-ups, 30-day activation, consideration lift, LA brand relevance, saves and voluntary shares.",
  customer:
    "25–40, urban professionals and independent creatives; building financial confidence, not necessarily wealthy yet. Values access, taste, and practical progress.",
  geography: "Los Angeles metro first, with scalable national concepts.",
  properties:
    "Los Angeles Harbor — fictional NBA team, official banking partner, 2026–2029. Pacific Open — golf event title partner, 2026–2028. Solstice Music Festival — hospitality partner, 2026–2027.",
  rights:
    "Harbor: courtside signage, 2 player appearances per year, approved team marks (jersey-patch-adjacent), Northstar Vault in-arena lounge, community financial-literacy program. No game-footage, broadcast, or unlimited player content rights.",
  activated:
    "Harbor courtside signage; Pacific Open VIP tent; Solstice guest hospitality.",
  unused:
    "Northstar Vault cultural programming; both annual player appearances; community literacy workshops; fan content within approved spaces.",
  campaigns:
    "2025 Own Your Next: 18,400 app sign-ups, strong practical creator tutorials. 2025 Courtside Perks: high entries but only 8% 30-day activation. 2026 LA Small Wins: local business portraits improved relevance by 6 points in a fictional study.",
  partners:
    "Retired guard Kai Mercer: strong financial-literacy workshops, modest reach. Lifestyle creator Jules Park: strong saves. Generic celebrity endorsement: costly, weak product recall.",
  win: "A fan actively shares the experience and has a useful reason to try the app. Measure retained activation rather than only impressions.",
  rejected:
    "Gated sweepstakes with low-quality entries; a generic player holding a banking card; cash-cannon stunts; advice-heavy jargon.",
  voice:
    "Assured, warm, observant, useful. Quiet confidence; never preachy or flexing wealth.",
  visual:
    "Deep evergreen, pale sage, warm neutrals, natural materials. Neutral star logo placeholder. Photography feels lived-in, not corporate stock.",
  legal:
    "No gambling adjacency, no crypto, no under-18 targeting. No personalized financial advice or performance promises. Paid creators disclose sponsorship. Never collect balances on a public display.",
  exclusivity:
    "Banking category exclusivity; avoid competitor payment apps and unlicensed team/player marks.",
  approvals:
    "Brand marketing + compliance: 5 business days. Team IP: 7 business days. Player participation requires scheduling and individual releases; reserve appearances before launch.",
  budget:
    "S: $15k–$40k; M: $40k–$100k; L: $100k–$250k. Estimates exclude rights fees and media. Start M with a credible S pilot.",
  fans: "Core local Harbor fans, growing independent earners, young professionals, and premium hospitality clients.",
  underindex:
    "LA music and streetwear communities; financially curious creators; women-led basketball communities; local food discovery.",
  competitors:
    "Fictional Meridian Bank, Currentline, and Atlas Wealth; attention competitors are creators, fashion drops, and live music.",
  discord:
    "#harbor-after-hours: We hang out after the game but everything closes. A room with good food and a fit cam beats another sponsor giveaway. Mock community sample; adults only.",
  reddit:
    "r/HarborHoops: The tunnel fits get more group-chat attention than the final score. Where are the local brands? Mock discussion excerpt.",
  comments:
    "@northstar: Show how you make room for small wins, not another perfect budget. Can you spotlight actual LA neighborhoods? Mock social comments.",
};
