import { NextRequest, NextResponse } from "next/server";
import { JOBBER_CONFIG, setTokens } from "@/lib/jobber-config";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings?error=no_code`
    );
  }

  try {
    const tokenResponse = await fetch(JOBBER_CONFIG.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: JOBBER_CONFIG.clientId,
        client_secret: JOBBER_CONFIG.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: JOBBER_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Jobber token exchange failed:", errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings?error=token_exchange_failed`
      );
    }

    const data = await tokenResponse.json();
    setTokens(data.access_token, data.refresh_token, data.expires_in || 3600);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings?connected=true`
    );
  } catch (error) {
    console.error("Jobber OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings?error=callback_error`
    );
  }
}
