"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FeedUI({
  countries,
  keywords,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
}: {
  countries: string[];
  keywords: { keyword: string; total: number }[];
  currentDays: number;
  currentQuery: string;
  currentCountry: string;
  currentIndustry: string;
  currentSourceType: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ LOCAL STATE (THIS WAS MISSING)
  const [q, setQ] = useState(currentQuery);
  const [days, setDays] = useState(String(currentDays));
  const [country, setCountry] = useState(currentCountry);
  const [industry, setIndustry] = useState(currentIndustry);
  const [sourceType, setSourceType] = useState(currentSourceType);

  function applyFilters() {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (days) params.set("days", days);
    if (country) params.set("country", country);
    if (industry) params.set("industry", industry);
    if (sourceType) params.set("source_type", sourceType);

    const url = `/?${params.toString()}`;

    const currentUrl =
      window.location.pathname + window.location.search;

    if (url === currentUrl) {
      console.log("URL unchanged — forcing refresh");
      router.refresh(); // 🔥 THIS IS THE KEY
      return;
    }

    router.replace(url, { scroll: false });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>Filters</h3>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search keyword"
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

      {/* ✅ THIS BUTTON WAS MISSING */}
      <div style={{ marginTop: 12 }}>
        <button onClick={applyFilters}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}
console.log("SERVER RENDER:", new Date().toISOString());
