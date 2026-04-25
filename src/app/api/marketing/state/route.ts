import { NextResponse } from "next/server";
import { getStore } from "@/lib/marketing-store";

export async function GET() {
  const store = getStore();
  return NextResponse.json({
    leads: store.leads,
    drafts: store.drafts,
    activity: store.activity.slice(0, 50),
    cycleCount: store.cycleCount,
    lastCycleAt: store.lastCycleAt ?? null,
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
