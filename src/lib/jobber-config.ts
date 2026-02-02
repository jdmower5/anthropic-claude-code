// Jobber OAuth 2.0 Configuration
// Set these in your .env.local file:
//   JOBBER_CLIENT_ID=your_client_id
//   JOBBER_CLIENT_SECRET=your_client_secret
//   NEXT_PUBLIC_BASE_URL=http://localhost:3000

export const JOBBER_CONFIG = {
  authorizationUrl: "https://api.getjobber.com/api/oauth/authorize",
  tokenUrl: "https://api.getjobber.com/api/oauth/token",
  graphqlUrl: "https://api.getjobber.com/api/graphql",
  clientId: process.env.JOBBER_CLIENT_ID || "",
  clientSecret: process.env.JOBBER_CLIENT_SECRET || "",
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/jobber/callback`,
  scopes: [
    "read_clients",
    "read_jobs",
    "read_invoices",
    "read_quotes",
    "read_users",
  ],
};

// In-memory token store (in production, use a database or encrypted session)
let tokenStore: {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
} = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

export function getTokens() {
  return { ...tokenStore };
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  tokenStore = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

export function clearTokens() {
  tokenStore = { accessToken: null, refreshToken: null, expiresAt: null };
}

export function isConnected() {
  return tokenStore.accessToken !== null;
}

export function isTokenExpired() {
  if (!tokenStore.expiresAt) return true;
  return Date.now() >= tokenStore.expiresAt - 60000; // Refresh 1 min before expiry
}

export async function refreshAccessToken(): Promise<boolean> {
  if (!tokenStore.refreshToken) return false;

  try {
    const response = await fetch(JOBBER_CONFIG.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: JOBBER_CONFIG.clientId,
        client_secret: JOBBER_CONFIG.clientSecret,
        refresh_token: tokenStore.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!isConnected()) return null;
  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }
  return tokenStore.accessToken;
}
