import { useRouter } from "next/router";
import { useState } from "react";

type FeedUIProps = {
  countries: string[];
  currentQuery?: string;
  currentCountry?: string;
  currentDays: number;
};

export default function FeedUI({
  countries,
  currentQuery,
  currentCountry,
  currentDays,
}: FeedUIProps) {
  const router = useRouter();
  const [q, setQ] = useState(currentQuery ?? "");

  function navigate(params: Record<string, string | number | undefined>) {
    router.push({
      pathname: "/",
      query: {
        ...router.query,
        ...params,
      },
    });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* SEARCH */}
      <input
        value={q}
        placeholder="Search buyer intent..."
        onChange={(e) => setQ(e.target.value)}
      />
      <button onClick={() => navigate({ q })}>Search</button>

      {/* DAYS */}
      <div>
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            style={{ fontWeight: currentDays === d ? "bold" : "normal" }}
            onClick={() => navigate({ days: d })}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* COUNTRY */}
      <select
        value={currentCountry ?? ""}
        onChange={(e) => navigate({ country: e.target.value })}
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
