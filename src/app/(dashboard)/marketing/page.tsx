"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StatCard from "@/components/StatCard";

type ContentChannel = "facebook" | "instagram" | "email" | "blog" | "sms" | "google";
type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  zip?: string;
  source: string;
  service?: string;
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

interface ContentDraft {
  id: string;
  channel: ContentChannel;
  topic: string;
  tone: string;
  headline: string;
  body: string;
  callToAction: string;
  hashtags?: string[];
  generatedBy: "anthropic" | "fallback";
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  type: "lead_captured" | "content_generated" | "agent_cycle" | "lead_followup" | "campaign_idea";
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

interface MarketingState {
  leads: Lead[];
  drafts: ContentDraft[];
  activity: ActivityEntry[];
  cycleCount: number;
  lastCycleAt: string | null;
  anthropicConfigured: boolean;
}

const CHANNELS: { value: ContentChannel; label: string }[] = [
  { value: "facebook", label: "Facebook post" },
  { value: "instagram", label: "Instagram caption" },
  { value: "email", label: "Email blast" },
  { value: "blog", label: "Blog teaser" },
  { value: "sms", label: "SMS blast" },
  { value: "google", label: "Google ad" },
];

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-gray-200 text-gray-600",
};

const ACTIVITY_STYLES: Record<ActivityEntry["type"], string> = {
  lead_captured: "bg-blue-100 text-blue-700",
  content_generated: "bg-green-100 text-green-700",
  agent_cycle: "bg-purple-100 text-purple-700",
  lead_followup: "bg-yellow-100 text-yellow-700",
  campaign_idea: "bg-pink-100 text-pink-700",
};

const CYCLE_INTERVAL_MS = 60_000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function MarketingPage() {
  const [state, setState] = useState<MarketingState | null>(null);
  const [autoRun, setAutoRun] = useState(true);
  const [cycleBusy, setCycleBusy] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ContentChannel>("facebook");
  const [topic, setTopic] = useState("Spring cleanup booking is open — limited weekend slots");
  const [tone, setTone] = useState("friendly");
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadState = useCallback(async () => {
    const res = await fetch("/api/marketing/state", { cache: "no-store" });
    if (res.ok) setState(await res.json());
  }, []);

  const runCycle = useCallback(async () => {
    if (cycleBusy) return;
    setCycleBusy(true);
    try {
      await fetch("/api/marketing/cycle", { method: "POST" });
      await loadState();
    } finally {
      setCycleBusy(false);
    }
  }, [cycleBusy, loadState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (!autoRun) {
      if (cycleTimer.current) clearInterval(cycleTimer.current);
      cycleTimer.current = null;
      return;
    }
    cycleTimer.current = setInterval(runCycle, CYCLE_INTERVAL_MS);
    return () => {
      if (cycleTimer.current) clearInterval(cycleTimer.current);
    };
  }, [autoRun, runCycle]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenBusy(true);
    setGenError(null);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, topic, tone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGenError(data.error || "Failed to generate content");
        return;
      }
      await loadState();
    } finally {
      setGenBusy(false);
    }
  };

  const updateLead = async (id: string, status: LeadStatus) => {
    await fetch(`/api/marketing/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadState();
  };

  const stats = useMemo(() => {
    if (!state) return null;
    const newCount = state.leads.filter((l) => l.status === "new").length;
    const qualifiedCount = state.leads.filter((l) => l.status === "qualified").length;
    const wonCount = state.leads.filter((l) => l.status === "won").length;
    return {
      total: state.leads.length,
      newCount,
      qualifiedCount,
      wonCount,
      drafts: state.drafts.length,
    };
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading marketing agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Agent</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center text-green-600 text-xs font-medium">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${
                    autoRun ? "bg-green-400 animate-ping opacity-75" : "bg-gray-300"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    autoRun ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </span>
              {autoRun ? "Working" : "Paused"}
            </span>
            <span className="text-xs text-gray-400">
              {state.cycleCount} cycles
              {state.lastCycleAt ? ` · last ${timeAgo(state.lastCycleAt)}` : ""}
            </span>
            <span className="text-xs text-gray-400">
              · Anthropic SDK {state.anthropicConfigured ? "connected" : "not configured (using templates)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-run every minute
          </label>
          <button
            onClick={runCycle}
            disabled={cycleBusy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {cycleBusy ? "Running..." : "Run cycle now"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Leads in pipeline"
          value={String(stats?.total ?? 0)}
          subtitle={`${stats?.newCount ?? 0} new this week`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
        <StatCard
          title="Qualified leads"
          value={String(stats?.qualifiedCount ?? 0)}
          subtitle="Ready to close"
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Won this season"
          value={String(stats?.wonCount ?? 0)}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <StatCard
          title="Content drafts"
          value={String(stats?.drafts ?? 0)}
          subtitle="Ready to schedule"
          color="yellow"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Lead pipeline</h2>
            <a
              href="/leads/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Open public capture page →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 px-3 font-medium">Lead</th>
                  <th className="py-2 px-3 font-medium">Source</th>
                  <th className="py-2 px-3 font-medium">Service</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {state.leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">
                        {[lead.email, lead.phone].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize text-gray-600">{lead.source}</td>
                    <td className="py-3 px-3 text-gray-600">{lead.service || "—"}</td>
                    <td className="py-3 px-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead.id, e.target.value as LeadStatus)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_STYLES[lead.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{timeAgo(lead.createdAt)}</td>
                  </tr>
                ))}
                {state.leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      No leads yet — share your capture page to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Generate promo content</h2>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ContentChannel)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="What should we promote?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tone</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="friendly, urgent, helpful expert..."
              />
            </div>
            {genError && <p className="text-xs text-red-600">{genError}</p>}
            <button
              type="submit"
              disabled={genBusy}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {genBusy ? "Drafting..." : "Draft content"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent content drafts</h2>
          <div className="space-y-4">
            {state.drafts.slice(0, 8).map((draft) => (
              <div key={draft.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium uppercase tracking-wide">
                    {draft.channel}
                  </span>
                  <span className="text-gray-500">
                    {draft.generatedBy === "anthropic" ? "Claude" : "Template"} · {timeAgo(draft.createdAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{draft.headline}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{draft.body}</p>
                <p className="text-sm font-medium text-green-700 mt-2">{draft.callToAction}</p>
                {draft.hashtags && draft.hashtags.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">{draft.hashtags.join(" ")}</p>
                )}
              </div>
            ))}
            {state.drafts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No drafts yet — run a cycle or generate one above.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Activity feed</h2>
          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {state.activity.map((entry) => (
              <div key={entry.id} className="border-l-2 border-gray-200 pl-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ACTIVITY_STYLES[entry.type]}`}
                  >
                    {entry.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{entry.message}</p>
              </div>
            ))}
            {state.activity.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
