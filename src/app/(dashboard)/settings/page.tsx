"use client";

import { useJobberStatus } from "@/lib/use-jobber";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SettingsContent() {
  const { connected, loading, disconnect, expiresAt } = useJobberStatus();
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "true";
  const error = searchParams.get("error");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your integrations and account settings.</p>
      </div>

      {/* Success Banner */}
      {justConnected && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Successfully connected to Jobber!</span>
          </div>
          <p className="text-sm mt-1">Your dashboard will now show real data from your Jobber account.</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Connection failed</span>
          </div>
          <p className="text-sm mt-1">
            {error === "no_code" && "No authorization code received from Jobber."}
            {error === "token_exchange_failed" && "Failed to exchange authorization code for tokens."}
            {error === "callback_error" && "An error occurred during the OAuth callback."}
            {!["no_code", "token_exchange_failed", "callback_error"].includes(error) && `Error: ${error}`}
          </p>
        </div>
      )}

      {/* Jobber Integration Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Jobber Integration</h2>
            <p className="text-sm text-gray-500">
              Connect your Jobber account to see real clients, jobs, invoices, and financials.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span className="text-sm">Checking connection status...</span>
          </div>
        ) : connected ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">Connected</span>
              {expiresAt && (
                <span className="text-xs text-gray-400 ml-2">
                  Token expires: {new Date(expiresAt).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Your Jobber account is connected. The dashboard pages will automatically pull
              live data from your Jobber account when available, and fall back to sample data otherwise.
            </p>

            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Disconnect Jobber
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Click below to authorize this dashboard to access your Jobber account.
              You&apos;ll be redirected to Jobber to grant permission, then sent back here.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Setup required:</span> You need to set{" "}
                <code className="bg-amber-100 px-1 rounded">JOBBER_CLIENT_ID</code> and{" "}
                <code className="bg-amber-100 px-1 rounded">JOBBER_CLIENT_SECRET</code> in your{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code> file.
                Get these from the{" "}
                <a
                  href="https://developer.getjobber.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-900 underline font-medium"
                >
                  Jobber Developer Center
                </a>.
              </p>
            </div>

            <a
              href="/api/jobber/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect to Jobber
            </a>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      {!connected && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Setup Instructions</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>
                Go to the{" "}
                <a href="https://developer.getjobber.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Jobber Developer Center
                </a>{" "}
                and sign in (or create a developer account).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Create a new app. Set the OAuth Callback URL to <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/jobber/callback</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Enable scopes: <code className="bg-gray-100 px-1 rounded">read_clients</code>, <code className="bg-gray-100 px-1 rounded">read_jobs</code>, <code className="bg-gray-100 px-1 rounded">read_invoices</code>, <code className="bg-gray-100 px-1 rounded">read_quotes</code>, <code className="bg-gray-100 px-1 rounded">read_users</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Copy your Client ID and Client Secret and add them to <code className="bg-gray-100 px-1 rounded">.env.local</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span>Click &quot;Connect to Jobber&quot; above and authorize the app.</span>
            </li>
          </ol>

          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-mono text-gray-600 mb-1"># .env.local</p>
            <pre className="text-xs font-mono text-gray-800">
{`JOBBER_CLIENT_ID=your_client_id_here
JOBBER_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
