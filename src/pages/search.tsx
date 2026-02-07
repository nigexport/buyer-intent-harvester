import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { PLAN_LIMITS } from "@/lib/plans";

export default function SearchPage() {
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<keyof typeof PLAN_LIMITS>("free");
  const [savedCount, setSavedCount] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  // 🔹 Load user + plan + saved count
  useEffect(() => {
    async function loadUser() {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) return;

      const { data: profile } = await supabaseClient
        .from("users")
        .select("plan")
        .eq("id", auth.user.id)
        .single();

      const { count } = await supabaseClient
        .from("saved_searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id);

      setUser(auth.user);
      setPlan(profile?.plan ?? "free");
      setSavedCount(count ?? 0);
    }

    loadUser();
  }, []);

  // 🔹 Fetch search results
  useEffect(() => {
    async function fetchResults() {
      const res = await fetch("/api/search?q=rfq");
      const data = await res.json();
      setResults(data.results);
    }

    fetchResults();
  }, []);

  const limit = PLAN_LIMITS[plan].maxSavedSearches;
  const reachedLimit = savedCount >= limit;

  async function saveSearch() {
    const res = await fetch("/api/save-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user,
        query: "rfq",
        country: null,
        industry: null,
        source: null,
      }),
    });

    if (res.status === 403) {
      alert("Upgrade to save more searches");
      return;
    }

    if (res.ok) {
      setSavedCount((c) => c + 1);
      alert("Search saved");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Search results</h1>

      {/* Save Search Panel */}
      {user && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 20 }}>
          <p>
            Saved searches:{" "}
            {limit === Infinity
              ? `${savedCount} / unlimited`
              : `${savedCount} / ${limit}`}
          </p>

          <button
            onClick={saveSearch}
            disabled={reachedLimit}
            style={{
              padding: "8px 12px",
              background: reachedLimit ? "#aaa" : "#000",
              color: "#fff",
              border: "none",
              cursor: reachedLimit ? "not-allowed" : "pointer",
            }}
          >
            Save this search
          </button>

          {reachedLimit && (
            <p style={{ marginTop: 8 }}>
              <a href="/upgrade">Upgrade to Pro</a>
            </p>
          )}
        </div>
      )}

      {/* Results */}
      <ul>
        {results.map((r) => (
          <li key={r.id}>
            <a href={r.source_url} target="_blank">
              {r.clean_text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
