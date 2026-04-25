import fs from "fs";
import path from "path";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type ContentChannel =
  | "facebook"
  | "instagram"
  | "email"
  | "blog"
  | "sms"
  | "google";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  zip?: string;
  source: string;
  service?: string;
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContentDraft {
  id: string;
  channel: ContentChannel;
  topic: string;
  tone: string;
  headline: string;
  body: string;
  callToAction: string;
  hashtags?: string[];
  generatedBy: "anthropic" | "fallback";
  createdAt: string;
}

export type ActivityType =
  | "lead_captured"
  | "content_generated"
  | "agent_cycle"
  | "lead_followup"
  | "campaign_idea";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface MarketingStore {
  leads: Lead[];
  drafts: ContentDraft[];
  activity: ActivityEntry[];
  lastCycleAt?: string;
  cycleCount: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "marketing.json");

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

function seed(): MarketingStore {
  const now = new Date().toISOString();
  return {
    leads: [
      {
        id: "L-1001",
        name: "Aisha Patel",
        email: "aisha.patel@example.com",
        phone: "(555) 010-2233",
        zip: "27514",
        source: "website",
        service: "Spring cleanup",
        notes: "Half-acre lot, prefers Friday visits.",
        status: "new",
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        id: "L-1002",
        name: "Marcus Bell",
        email: "marcus.bell@example.com",
        zip: "27517",
        source: "facebook",
        service: "Weekly mowing",
        status: "contacted",
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
      },
      {
        id: "L-1003",
        name: "Henson Park HOA",
        email: "board@hensonpark.example.com",
        phone: "(555) 018-8842",
        zip: "27516",
        source: "google",
        service: "Common-area maintenance",
        notes: "RFP closes 5/10. Wants quarterly walkthroughs.",
        status: "qualified",
        createdAt: daysAgo(9),
        updatedAt: daysAgo(2),
      },
    ],
    drafts: [],
    activity: [
      {
        id: "A-seed-1",
        type: "agent_cycle",
        message: "Marketing agent online. Monitoring for new leads and promo opportunities.",
        createdAt: now,
      },
    ],
    cycleCount: 0,
  };
}

let cache: MarketingStore | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load(): MarketingStore {
  if (cache) return cache;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      cache = JSON.parse(raw) as MarketingStore;
      return cache;
    }
  } catch {
    // fall through to seed
  }
  cache = seed();
  persist();
  return cache;
}

function persist() {
  if (!cache) return;
  try {
    ensureDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(cache, null, 2), "utf8");
  } catch {
    // best-effort persistence; in-memory cache still serves the session
  }
}

export function getStore(): MarketingStore {
  return load();
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)
    .toString(36)
    .padStart(3, "0")}`;
}

export function addLead(input: Omit<Lead, "id" | "status" | "createdAt" | "updatedAt"> & {
  status?: LeadStatus;
}): Lead {
  const store = load();
  const now = new Date().toISOString();
  const lead: Lead = {
    id: nextId("L"),
    status: input.status ?? "new",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  store.leads.unshift(lead);
  logActivity({
    type: "lead_captured",
    message: `Captured new lead: ${lead.name} via ${lead.source}${lead.service ? ` — ${lead.service}` : ""}`,
    meta: { leadId: lead.id },
  });
  persist();
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus): Lead | null {
  const store = load();
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  logActivity({
    type: "lead_followup",
    message: `Lead ${lead.name} moved to ${status}.`,
    meta: { leadId: lead.id, status },
  });
  persist();
  return lead;
}

export function addDraft(draft: Omit<ContentDraft, "id" | "createdAt">): ContentDraft {
  const store = load();
  const entry: ContentDraft = {
    id: nextId("D"),
    createdAt: new Date().toISOString(),
    ...draft,
  };
  store.drafts.unshift(entry);
  if (store.drafts.length > 50) store.drafts.length = 50;
  logActivity({
    type: "content_generated",
    message: `Drafted ${entry.channel} content: "${entry.headline}"`,
    meta: { draftId: entry.id, channel: entry.channel },
  });
  persist();
  return entry;
}

export function logActivity(entry: Omit<ActivityEntry, "id" | "createdAt">): ActivityEntry {
  const store = load();
  const item: ActivityEntry = {
    id: nextId("A"),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  store.activity.unshift(item);
  if (store.activity.length > 200) store.activity.length = 200;
  // Caller decides whether to persist; persist here for safety
  persist();
  return item;
}

export function recordCycle(meta?: Record<string, unknown>) {
  const store = load();
  store.cycleCount += 1;
  store.lastCycleAt = new Date().toISOString();
  logActivity({
    type: "agent_cycle",
    message: `Agent cycle #${store.cycleCount} completed.`,
    meta,
  });
  persist();
  return { cycleCount: store.cycleCount, lastCycleAt: store.lastCycleAt };
}
