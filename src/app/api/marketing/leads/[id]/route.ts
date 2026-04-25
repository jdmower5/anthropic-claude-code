import { NextRequest, NextResponse } from "next/server";
import { LeadStatus, updateLeadStatus } from "@/lib/marketing-store";

const VALID: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const status = payload.status;
  if (typeof status !== "string" || !VALID.includes(status as LeadStatus)) {
    return NextResponse.json(
      { error: `status must be one of ${VALID.join(", ")}` },
      { status: 400 },
    );
  }
  const lead = updateLeadStatus(id, status as LeadStatus);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  return NextResponse.json({ lead });
}
