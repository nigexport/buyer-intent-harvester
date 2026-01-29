"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });

      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Query */}
      <input
        placeholder="Search keyword"
        defaultValue={currentQuery}
        onBlur={(e) => updateParams({ q: e.target.value })}
      />

      {/* Days */}
      <select
        value={currentDays}
        onChange={(e) => updateParams({ days: e.target.value })}
      >
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
      </select>

      {/* Country */}
      <select
        value={currentCountry}
        onChange={(e) => updateParams({ country: e.target.value })}
      >
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Industry */}
      <input
        placeholder="Industry"
        defaultValue={currentIndustry}
        onBlur={(e) => updateParams({ industry: e.target.value })}
      />

      {/* Source */}
      <select
        value={currentSourceType}
        onChange={(e) =>
          updateParams({ source_type: e.target.value })
        }
      >
        <option value="">All sources</option>
        <option value="twitter">Twitter</option>
        <option value="reddit">Reddit</option>
        <option value="forum">Forum</option>
      </select>
    </div>
  );
}
