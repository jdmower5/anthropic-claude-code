import { NextResponse } from "next/server";
import { JOBBER_CONFIG } from "@/lib/jobber-config";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: JOBBER_CONFIG.clientId,
    redirect_uri: JOBBER_CONFIG.redirectUri,
    response_type: "code",
    state,
  });

  const authUrl = `${JOBBER_CONFIG.authorizationUrl}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
