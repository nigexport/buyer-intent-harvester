"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type FeedUIProps = {
  countries: string[];
  currentDays: number;
  currentQuery?: string;
  currentCountry?: string;
  currentIndustry?: string;
  currentSourceType?: string;
};

export default function FeedUI({
  countries,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
}: FeedUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(currentQuery ?? "");

  function updateParam(key: string, value?: string | number) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete(key);
    else params.set(key, String(value));

    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* SEARCH */}
      <input
        value={q}
        placeholder="Search buyer intent..."
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("q", q);
        }}
      />
      <button onClick={() => updateParam("q", q)}>Search</button>

      {/* DAYS */}
      <div>
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            style={{ fontWeight: currentDays === d ? "bold" : "normal" }}
            onClick={() => updateParam("days", d)}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* COUNTRY */}
      <select
        value={currentCountry ?? ""}
        onChange={(e) => updateParam("country", e.target.value)}
      >
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
