import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { PLAN_LIMITS } from "@/lib/plans";
import Link from "next/link";

export default function SavedSearchesPage() {
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<keyof typeof PLAN_LIMITS>("free");
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }

      setUser(auth.user);

      const { data: profile } = await supabaseClient
        .from("users")
        .select("plan")
        .eq("id", auth.user.id)
        .single();

      setPlan((profile?.plan as any) ?? "free");

      const { data } = await supabaseClient
        .from("saved_searches")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      setSavedSearches(data ?? []);
      setLoading(false);
    }

    loadData();
  }, []);

  async function updateFrequency(id: string, frequency: "daily" | "weekly") {
    if (plan !== "pro" && frequency === "daily") return;

    await supabaseClient
      .from("saved_searches")
      .update({ frequency })
      .eq("id", id);

    setSavedSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, frequency } : s
      )
    );
  }

  async function deleteSearch(id: string) {
    const confirmed = confirm("Delete this saved search?");
    if (!confirmed) return;

    await supabaseClient.from("saved_searches").delete().eq("id", id);

    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>;

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <p>Please log in to view saved searches.</p>
      </div>
    );
  }

  const limit = PLAN_LIMITS[plan].maxSavedSearches;
  const used = savedSearches.length;
  const reachedLimit = used >= limit;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Saved searches</h1>

      <p style={{ marginBottom: 20 }}>
        Current plan: <strong>{plan.toUpperCase()}</strong> —{" "}
        {limit === Infinity
          ? `${used} / unlimited`
          : `${used} / ${limit} used`}
      </p>

      {reachedLimit && plan !== "pro" && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: 12,
            marginBottom: 20,
          }}
        >
          <p>
            You’ve reached your saved search limit.
            <Link href="/upgrade">
              <strong> Upgrade to Pro</strong>
            </Link>{" "}
            to unlock unlimited searches and daily alerts.
          </p>
        </div>
      )}

      {savedSearches.length === 0 ? (
        <p>No saved searches yet.</p>
      ) : (
        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th align="left">Query</th>
              <th align="left">Filters</th>
              <th align="left">Frequency</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {savedSearches.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td><strong>{s.query}</strong></td>
                <td>
                  {[s.industry, s.country, s.source_type]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td>
                  <select
                    value={s.frequency}
                    disabled={plan !== "pro"}
                    onChange={(e) =>
                      updateFrequency(
                        s.id,
                        e.target.value as "daily" | "weekly"
                      )
                    }
                  >
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>

                  {plan !== "pro" && (
                    <div style={{ fontSize: 12 }}>
                      <a href="/upgrade">Upgrade for daily</a>
                    </div>
                  )}
                </td>
                <td align="right">
                  <button
                    onClick={() => deleteSearch(s.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#c00",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 30 }}>
        <Link href="/search">
          <button
            style={{
              padding: "8px 14px",
              background: "black",
              color: "white",
              border: "none",
            }}
          >
            Find new buyer intents
          </button>
        </Link>
      </div>
    </div>
  );
}
