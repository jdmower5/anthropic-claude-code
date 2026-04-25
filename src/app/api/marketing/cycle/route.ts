import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/marketing-agent";

export async function POST() {
  const result = await runAgentCycle();
  return NextResponse.json(result);
}
