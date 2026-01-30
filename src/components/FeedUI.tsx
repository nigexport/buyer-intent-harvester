import { useRouter } from "next/router";

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

  function nav(params: Record<string, string | number | undefined>) {
    window.scrollTo({ top: 0, behavior: "smooth" });

    router.push({
      pathname: "/",
      query: {
        ...router.query,
        ...params,
        page: 1, // reset pagination on any filter change
      },
    });
  }

  return (
    <>
      {/* SEARCH */}
      <div className="search-row">
        <input
          id="searchInput"
          type="text"
          placeholder="Search buyer intent…"
          defaultValue={currentQuery ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              nav({ q: (e.target as HTMLInputElement).value });
            }
          }}
        />
        <button
          onClick={() => {
            const input =
              document.getElementById("searchInput") as HTMLInputElement | null;
            nav({ q: input?.value });
          }}
        >
          Search
        </button>
      </div>

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

      {/* STYLES */}
      <style jsx>{`
        .search-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .search-row input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .search-row button {
          padding: 10px 14px;
          background: #000;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
        }
        .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 12px 0;
        }
        .chips button.active {
          background: #000;
          color: #fff;
        }
        select {
          width: 100%;
          padding: 10px;
          margin: 6px 0;
          border-radius: 6px;
        }
      `}</style>
    </>
  );
}
