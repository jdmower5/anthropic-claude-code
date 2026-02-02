import { NextResponse } from "next/server";
import { isConnected, getTokens } from "@/lib/jobber-config";

export async function GET() {
  const connected = isConnected();
  const tokens = getTokens();

  return NextResponse.json({
    connected,
    expiresAt: tokens.expiresAt,
  });
}
