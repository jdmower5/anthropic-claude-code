import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/jobber-config";

export async function POST() {
  clearTokens();
  return NextResponse.json({ success: true });
}
