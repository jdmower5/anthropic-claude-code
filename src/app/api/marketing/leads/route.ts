import { NextRequest, NextResponse } from "next/server";
import { addLead, getStore, LeadStatus } from "@/lib/marketing-store";

export async function GET() {
  return NextResponse.json({ leads: getStore().leads });
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const email = typeof payload.email === "string" ? payload.email.trim() : undefined;
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : undefined;
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Provide an email or phone so we can reach you." },
      { status: 400 },
    );
  }

  const lead = addLead({
    name,
    email,
    phone,
    zip: typeof payload.zip === "string" ? payload.zip.trim() : undefined,
    source: typeof payload.source === "string" && payload.source ? payload.source : "website",
    service: typeof payload.service === "string" ? payload.service : undefined,
    notes: typeof payload.notes === "string" ? payload.notes : undefined,
    status: typeof payload.status === "string" ? (payload.status as LeadStatus) : "new",
  });

  return NextResponse.json({ lead }, { status: 201 });
}
