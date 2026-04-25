"use client";

import { useState } from "react";

const SERVICES = [
  "Weekly mowing",
  "Spring cleanup",
  "Mulching & beds",
  "Hedge trimming",
  "Landscape design",
  "HOA / commercial",
  "Other",
];

export default function PublicLeadCapture() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    service: SERVICES[0],
    notes: "",
    source: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("src") || "website" : "website",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">GT</span>
            <span className="text-xl font-bold text-gray-900">Green Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Get a free quote — same day.</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Tell us about your yard and we&apos;ll send a flat-rate quote back the same day. Locally owned,
            fully insured crews serving the Triangle area.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            "Same-day quote response",
            "Flat-rate, no-surprise pricing",
            "Locally owned & fully insured",
          ].map((promise) => (
            <div
              key={promise}
              className="bg-white border border-green-100 rounded-lg px-4 py-3 text-sm text-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {promise}
            </div>
          ))}
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-green-200 p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks — we got it.</h2>
            <p className="text-gray-600">
              A Green Touch crew lead will reach out today with your quote. Keep an eye on your inbox or phone.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP code</label>
                <input
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="27514"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Provide an email or phone so we can send your quote.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you need?</label>
              <select
                value={form.service}
                onChange={(e) => update("service", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                placeholder="Lot size, gates, pets, anything else we should know..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Sending..." : "Send my free quote request"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Green Touch · Triangle-area lawn care & landscaping
        </p>
      </div>
    </div>
  );
}
