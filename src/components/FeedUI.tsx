"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FeedUI({
  countries,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
}: {
  countries: string[];
  currentDays: number;
  currentQuery: string;
  currentCountry: string;
  currentIndustry: string;
  currentSourceType: string;
}) {
  const router = useRouter();

  const [q, setQ] = useState(currentQuery);
  const [days, setDays] = useState(String(currentDays));
  const [country, setCountry] = useState(currentCountry);
  const [industry, setIndustry] = useState(currentIndustry);
  const [sourceType, setSourceType] = useState(currentSourceType);

  function applyFilters() {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    params.set("days", days);
    if (country) params.set("country", country);
    if (industry) params.set("industry", industry);
    if (sourceType) params.set("source_type", sourceType);

    const url = `/?${params.toString()}`;

    console.log("NAVIGATING TO:", url);

    router.replace(url, { scroll: false });
    router.refresh(); // 🔥 FORCE SERVER RE-RENDER
  }

  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: "2px solid #ddd",
        borderRadius: 8,
        background: "#fafafa",
      }}
    >
      <h3>Search Filters</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search keyword"
          style={{ padding: 10 }}
        />

        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
        </select>

        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Industry"
          style={{ padding: 10 }}
        />

        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          <option value="">All sources</option>
          <option value="twitter">Twitter</option>
          <option value="reddit">Reddit</option>
          <option value="forum">Forum</option>
        </select>

        <button
          onClick={applyFilters}
          style={{
            marginTop: 8,
            padding: "14px 18px",
            fontSize: 16,
            fontWeight: 700,
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          🔍 Apply Search Filters
        </button>
      </div>
    </div>
  );
}
