import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

type FeedUIProps = {
  countries: string[];
  industries: string[];
  sources: string[];
  popularKeywords: string[];

  currentQuery?: string;
  currentCountry?: string;
  currentIndustry?: string;
  currentSource?: string;
  currentDays: number;
};

export default function FeedUI({
  countries,
  industries,
  sources,
  popularKeywords,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSource,
  currentDays,
}: FeedUIProps) {
  const router = useRouter();

  const [q, setQ] = useState(currentQuery ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<any>(null);

  function nav(params: Record<string, string | number | undefined>) {
    router.push({
      pathname: "/",
      query: {
        ...router.query,
        ...params,
        page: 1,
      },
    });
  }

  function clearFilters() {
    setQ("");
    router.push({ pathname: "/" });
  }

  // 🔁 Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q !== currentQuery) {
        nav({ q });
      }
    }, 400);
  }, [q]);

  // 💡 Suggestions (simple + fast)
  useEffect(() => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      popularKeywords.filter((k) =>
        k.toLowerCase().includes(q.toLowerCase())
      )
    );
  }, [q, popularKeywords]);

  // ⭐ Save search (local only)
  function saveSearch() {
    const saved = JSON.parse(
      localStorage.getItem("saved_searches") || "[]"
    );
    const next = Array.from(new Set([...saved, q]));
    localStorage.setItem("saved_searches", JSON.stringify(next));
    alert("Search saved (local)");
  }

  return (
    <>
      {/* SEARCH */}
      <div className="search-row">
        <input
          type="text"
          placeholder="Search buyer intent…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={() => nav({ q })}>Search</button>
        <button className="clear" onClick={clearFilters}>
          Clear
        </button>
        <button className="save" onClick={saveSearch}>
          Save
        </button>
      </div>

      {/* SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s) => (
            <div key={s} onClick={() => nav({ q: s })}>
              {s}
            </div>
          ))}
        </div>
      )}

      {/* DAYS */}
      <div className="chips">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            className={currentDays === d ? "active" : ""}
            onClick={() => nav({ days: d })}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* COUNTRY */}
      <select
        value={currentCountry ?? ""}
        onChange={(e) => nav({ country: e.target.value })}
      >
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* INDUSTRY */}
      <select
        value={currentIndustry ?? ""}
        onChange={(e) => nav({ industry: e.target.value })}
      >
        <option value="">All Industries</option>
        {industries.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      {/* SOURCE */}
      <select
        value={currentSource ?? ""}
        onChange={(e) => nav({ source: e.target.value })}
      >
        <option value="">All Sources</option>
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* POPULAR KEYWORDS */}
      <div className="chips">
        {popularKeywords.map((k) => (
          <button key={k} onClick={() => nav({ q: k })}>
            {k}
          </button>
        ))}
      </div>

      <style jsx>{`
        .search-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        input {
          flex: 1;
          padding: 10px;
        }
        button {
          padding: 10px 12px;
          cursor: pointer;
        }
        .clear {
          background: #eee;
        }
        .save {
          background: #0a7;
          color: #fff;
        }
        .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 12px 0;
        }
        .chips .active {
          background: #000;
          color: #fff;
        }
        .suggestions {
          border: 1px solid #ccc;
          background: #fff;
          margin-bottom: 8px;
        }
        .suggestions div {
          padding: 8px;
          cursor: pointer;
        }
        .suggestions div:hover {
          background: #f0f0f0;
        }
      `}</style>
    </>
  );
}
