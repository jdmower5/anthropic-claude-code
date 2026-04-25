import {
  addDraft,
  ContentChannel,
  ContentDraft,
  getStore,
  logActivity,
  recordCycle,
} from "./marketing-store";

export const BUSINESS_PROFILE = {
  name: "Green Touch",
  industry: "Residential & commercial lawn care and landscaping",
  serviceArea: "the Triangle area (Chapel Hill, Durham, Raleigh)",
  services: [
    "Weekly lawn mowing & edging",
    "Spring & fall cleanups",
    "Mulching & bed maintenance",
    "Hedge & shrub trimming",
    "Landscape design & installation",
    "HOA & commercial property maintenance",
  ],
  voice: "warm, neighborly, dependable, lightly enthusiastic — never pushy",
  differentiators: [
    "Locally owned, fully insured crews",
    "Same-day quote response within service hours",
    "Eco-friendly fertilizers and battery-powered tools where possible",
    "Transparent flat-rate pricing",
  ],
} as const;

interface GenerateInput {
  channel: ContentChannel;
  topic: string;
  tone?: string;
  audience?: string;
}

const CHANNEL_PROMPTS: Record<ContentChannel, { length: string; format: string }> = {
  facebook: {
    length: "2-4 short sentences (under 80 words)",
    format: "A friendly post with one clear call to action and 2-3 relevant hashtags.",
  },
  instagram: {
    length: "1-2 punchy lines (under 50 words)",
    format: "An eye-catching caption with an emoji, a single CTA, and 4-6 hashtags.",
  },
  email: {
    length: "100-160 words",
    format: "A short email with a subject line as the headline, a 2-paragraph body, and a clear CTA.",
  },
  blog: {
    length: "180-260 words",
    format: "A blog teaser with a hook, 2-3 short paragraphs, and a CTA closing line.",
  },
  sms: {
    length: "Under 280 characters total",
    format: "A concise SMS with a single offer and a call-to-action link placeholder.",
  },
  google: {
    length: "Headline under 30 chars, body under 90 chars",
    format: "A Google search ad with one headline and one description, ending in a CTA.",
  },
};

const TOPIC_ROTATION: Array<{ channel: ContentChannel; topic: string; tone: string }> = [
  { channel: "facebook", topic: "Spring cleanup booking is open — limited weekend slots", tone: "friendly" },
  { channel: "instagram", topic: "Before/after of a freshly mulched bed", tone: "upbeat" },
  { channel: "email", topic: "Reactivation offer for last-season customers", tone: "warm" },
  { channel: "blog", topic: "Mowing height tips for healthy summer lawns", tone: "helpful expert" },
  { channel: "sms", topic: "Weekend appointment reminder + referral bonus", tone: "concise" },
  { channel: "google", topic: "Same-day lawn care quotes near me", tone: "direct" },
  { channel: "facebook", topic: "Meet the crew Friday — neighborhood spotlight", tone: "neighborly" },
  { channel: "instagram", topic: "Eco-friendly fertilizer reel", tone: "informative" },
];

function buildPrompt({ channel, topic, tone, audience }: GenerateInput): string {
  const guide = CHANNEL_PROMPTS[channel];
  return [
    `You are the in-house marketing agent for ${BUSINESS_PROFILE.name}, ${BUSINESS_PROFILE.industry} serving ${BUSINESS_PROFILE.serviceArea}.`,
    `Brand voice: ${BUSINESS_PROFILE.voice}.`,
    `Differentiators to lean on when relevant: ${BUSINESS_PROFILE.differentiators.join("; ")}.`,
    `Channel: ${channel}. Length target: ${guide.length}. Format: ${guide.format}`,
    `Topic: ${topic}.`,
    tone ? `Tone: ${tone}.` : "",
    audience ? `Audience: ${audience}.` : "",
    "",
    "Return STRICT JSON with this shape and nothing else:",
    `{"headline": string, "body": string, "callToAction": string, "hashtags": string[]}`,
    "Keep it specific to lawn care/landscaping, avoid clichés, and never make up customer testimonials or guarantees.",
  ]
    .filter(Boolean)
    .join("\n");
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
}

async function callAnthropic(prompt: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    type AnthropicSDK = {
      default: new (config: { apiKey: string }) => {
        messages: {
          create: (args: {
            model: string;
            max_tokens: number;
            messages: Array<{ role: string; content: string }>;
          }) => Promise<AnthropicMessageResponse>;
        };
      };
    };

    const mod = (await import("@anthropic-ai/sdk").catch(() => null)) as AnthropicSDK | null;
    if (!mod) return null;

    const client = new mod.default({ apiKey });
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const block = res.content?.find((c) => c.type === "text");
    return block?.text ?? null;
  } catch {
    return null;
  }
}

function parseJsonish(raw: string): {
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
} | null {
  // Anthropic sometimes wraps JSON in code fences.
  const cleaned = raw
    .replace(/```json\s*/i, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof obj.headline !== "string" || typeof obj.body !== "string") return null;
    return {
      headline: obj.headline,
      body: obj.body,
      callToAction: typeof obj.callToAction === "string" ? obj.callToAction : "Get a free quote today.",
      hashtags: Array.isArray(obj.hashtags) ? obj.hashtags.map((h: unknown) => String(h)) : [],
    };
  } catch {
    return null;
  }
}

function fallbackContent({ channel, topic, tone }: GenerateInput): {
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
} {
  const t = tone || "friendly";
  const cta = "Reply or call us — we'll have a free quote out the same day.";
  const baseHashtags = ["#GreenTouch", "#LawnCare", "#TriangleNC", "#Landscaping"];

  switch (channel) {
    case "facebook":
      return {
        headline: topic,
        body: `Neighbors — ${topic.toLowerCase()}. Green Touch crews are booking ${new Date().toLocaleDateString(
          "en-US",
          { month: "long" },
        )} now, and we're keeping a few weekend slots open for ${BUSINESS_PROFILE.serviceArea}. Locally owned, fully insured, and same-day quotes during business hours.`,
        callToAction: cta,
        hashtags: baseHashtags,
      };
    case "instagram":
      return {
        headline: topic,
        body: `${topic} 🌿 Locally owned crews, eco-friendly tools, and quotes back the same day.`,
        callToAction: "Tap the link in bio for a free quote.",
        hashtags: [...baseHashtags, "#CurbAppeal", "#LawnGoals"],
      };
    case "email":
      return {
        headline: `${topic} — a quick note from Green Touch`,
        body: `Hi neighbor,\n\n${topic}. If your yard could use a hand this season, our crews are out across ${BUSINESS_PROFILE.serviceArea} and we're keeping the calendar tight so we can show up on time, every time.\n\nFlat-rate pricing, fully insured, and we'll have a quote in your inbox the same day you ask.`,
        callToAction: "Reply with your address and we'll send a free quote within the day.",
        hashtags: [],
      };
    case "blog":
      return {
        headline: topic,
        body: `${topic}.\n\nA few quick pointers from the Green Touch crews: keep mower blades sharp, water deeply but less often, and don't scalp the lawn in the first cut of the season. Small habits compound — the difference between a tired yard and a great one is usually a handful of consistent choices, not a single big project.\n\nIf you'd rather hand it off, that's what we're here for. We work across ${BUSINESS_PROFILE.serviceArea} with flat-rate pricing and fully insured crews.`,
        callToAction: "Want a free quote? Send your address and we'll have one back the same day.",
        hashtags: [],
      };
    case "sms":
      return {
        headline: topic,
        body: `Green Touch: ${topic}. Same-day quotes, flat-rate pricing. Reply YES for an estimate or visit greentouch.example/quote.`,
        callToAction: "Reply YES for a same-day quote.",
        hashtags: [],
      };
    case "google":
      return {
        headline: "Same-Day Lawn Care Quotes",
        body: `${topic}. Locally owned, fully insured, flat-rate pricing across ${BUSINESS_PROFILE.serviceArea}.`,
        callToAction: "Get a free quote",
        hashtags: [],
      };
    default:
      return {
        headline: topic,
        body: `${topic} — written in a ${t} tone for Green Touch.`,
        callToAction: cta,
        hashtags: baseHashtags,
      };
  }
}

export async function generateContent(input: GenerateInput): Promise<ContentDraft> {
  const prompt = buildPrompt(input);
  const raw = await callAnthropic(prompt);
  const parsed = raw ? parseJsonish(raw) : null;
  const content = parsed ?? fallbackContent(input);
  return addDraft({
    channel: input.channel,
    topic: input.topic,
    tone: input.tone || "friendly",
    headline: content.headline,
    body: content.body,
    callToAction: content.callToAction,
    hashtags: content.hashtags,
    generatedBy: parsed ? "anthropic" : "fallback",
  });
}

export async function runAgentCycle(): Promise<{
  cycleCount: number;
  lastCycleAt: string;
  draft: ContentDraft;
}> {
  const store = getStore();
  const next = TOPIC_ROTATION[store.cycleCount % TOPIC_ROTATION.length];
  const draft = await generateContent(next);

  // Surface follow-up suggestions for any new leads idling in the pipeline.
  const stale = store.leads.filter((l) => {
    if (l.status !== "new") return false;
    const ageHours = (Date.now() - new Date(l.createdAt).getTime()) / 3_600_000;
    return ageHours >= 24;
  });
  for (const lead of stale.slice(0, 3)) {
    logActivity({
      type: "campaign_idea",
      message: `Suggest a personal follow-up to ${lead.name} (${lead.source}) — they've been "new" for over a day.`,
      meta: { leadId: lead.id },
    });
  }

  const { cycleCount, lastCycleAt } = recordCycle({
    channel: draft.channel,
    topic: draft.topic,
    staleLeadsFlagged: stale.length,
  });
  return { cycleCount, lastCycleAt: lastCycleAt!, draft };
}
