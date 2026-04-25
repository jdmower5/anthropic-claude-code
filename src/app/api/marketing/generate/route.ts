import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/marketing-agent";
import { ContentChannel } from "@/lib/marketing-store";

const CHANNELS: ContentChannel[] = ["facebook", "instagram", "email", "blog", "sms", "google"];

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const channel = payload.channel;
  const topic = payload.topic;
  if (typeof channel !== "string" || !CHANNELS.includes(channel as ContentChannel)) {
    return NextResponse.json(
      { error: `channel must be one of ${CHANNELS.join(", ")}` },
      { status: 400 },
    );
  }
  if (typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const draft = await generateContent({
    channel: channel as ContentChannel,
    topic: topic.trim(),
    tone: typeof payload.tone === "string" ? payload.tone : undefined,
    audience: typeof payload.audience === "string" ? payload.audience : undefined,
  });

  return NextResponse.json({ draft });
}
