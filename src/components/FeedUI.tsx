"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  countries: string[];
  keywords: { keyword: string; total: number }[];
  currentDays: number;
  currentQuery: string;
  currentCountry: string;
  currentIndustry: string;
  currentSourceType: string;
};

export default function FeedUI({
  countries,
  keywords,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(currentQuery);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete(key);
    else params.set(key, value);

    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* SEARCH */}
      <input
        placeholder="Search buyer intent…"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === "Enter" && updateParam("q", q)}
        style={{ width: "100%", padding: 8 }}
      />

      {/* 7 / 14 DAY TOGGLE */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => updateParam("days", "7")}
          disabled={currentDays === 7}
        >
          Last 7 days
        </button>
        <button
          onClick={() => updateParam("days", "14")}
          disabled={currentDays === 14}
          style={{ marginLeft: 8 }}
        >
          Last 14 days
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <select
          value={currentCountry}
          onChange={e => updateParam("country", e.target.value)}
        >
          <option value="">All countries</option>
          {countries.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={currentIndustry}
          onChange={e => updateParam("industry", e.target.value)}
        >
          <option value="">All industries</option>
          <option value="Procurement">Procurement</option>
          <option value="Construction">Construction</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Oil & Gas">Oil & Gas</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* POPULAR SEARCHES */}
      <div style={{ marginTop: 12 }}>
        <strong>Popular searches:</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {keywords.map(k => (
            <button
              key={k.keyword}
              onClick={() => updateParam("q", k.keyword)}
            >
              {k.keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
