"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface FeedUIProps {
  results: any[];
  initialQuery: string;
  initialIndustry: string;
  initialDays: number;
  initialCountry: string;
}

export default function FeedUI({
  results,
  initialQuery,
  initialIndustry,
  initialDays,
  initialCountry,
}: FeedUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQuery);
  const [industry, setIndustry] = useState(initialIndustry);
  const [days, setDays] = useState(initialDays);
  const [country, setCountry] = useState(initialCountry);

  function updateURL(overrides: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, String(value));
    });

    router.push(`/?${params.toString()}`);
  }

  return (
    <>
      {/* 🔎 SEARCH BAR */}
      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search buyer intent…"
          className="border px-3 py-2 w-full"
        />

        <button
          onClick={() => updateURL({ q })}
          className="bg-black text-white px-4 py-2"
        >
          Search
        </button>
      </div>

      {/* 🎛 FILTERS */}
      <div className="flex gap-3 mb-6">
        <select
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            updateURL({ industry: e.target.value });
          }}
          className="border px-2 py-2"
        >
          <option value="">All industries</option>
          <option value="Procurement">Procurement</option>
          <option value="Construction">Construction</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Oil & Gas">Oil & Gas</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Retail">Retail</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={days}
          onChange={(e) => {
            const d = Number(e.target.value);
            setDays(d);
            updateURL({ days: d });
          }}
          className="border px-2 py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* 🔥 POPULAR SEARCHES */}
      <div className="flex gap-2 mb-6 text-sm">
        {["rfq", "looking for supplier", "inspection services"].map((term) => (
          <button
            key={term}
            onClick={() => updateURL({ q: term })}
            className="border px-3 py-1 rounded"
          >
            {term}
          </button>
        ))}
      </div>

      {/* 📋 RESULTS */}
      <div className="space-y-4">
        {results.length === 0 && (
          <p className="text-gray-500">No results found</p>
        )}

        {results.map((item, i) => (
          <div key={i} className="border p-4 rounded">
            <div className="text-sm text-gray-500 mb-1">
              {item.industry ?? "Unknown"} • {item.country ?? "Global"}
            </div>

            <div className="font-medium mb-1">{item.clean_text}</div>

            {item.intent_summary && (
              <div className="text-sm text-gray-700">
                {item.intent_summary}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
