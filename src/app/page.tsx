export const dynamic = "force-dynamic";
export const revalidate = 0;

import FeedUI from "../components/FeedUI";
import { getSupabase } from "../lib/supabase";

const PAGE_SIZE = 15;

export default async function Page({
  searchParams,
}: {
  searchParams: {
    days?: string;
    q?: string;
    country?: string;
    industry?: string;
    source_type?: string;
  };
}) {
  const supabase = getSupabase();

  const days = searchParams.days === "14" ? 14 : 7;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  let query = supabase
    .from("buyer_intents")
    .select("*")
    .gte("created_at", fromDate)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (searchParams.q) {
    query = query.or(
      `clean_text.ilike.%${searchParams.q}%,request_category.ilike.%${searchParams.q}%`
    );
  }

  if (searchParams.country) {
    query = query.eq("country", searchParams.country);
  }

  if (searchParams.industry) {
    query = query.eq("industry", searchParams.industry);
  }

  if (searchParams.source_type) {
    query = query.eq("source_type", searchParams.source_type);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Error loading feed</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const { data: countryRows } = await supabase
    .from("buyer_intents")
    .select("country")
    .not("country", "is", null);

  const countries = Array.from(
    new Set((countryRows ?? []).map((r) => r.country))
  );

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      {/* 🔴 PROOF THE SERVER IS RE-RUNNING */}
      <p style={{ color: "red", fontWeight: 700 }}>
        SERVER RENDER: {new Date().toISOString()}
      </p>

      <pre style={{ background: "#f5f5f5", padding: 8 }}>
        searchParams = {JSON.stringify(searchParams, null, 2)}
      </pre>

      <FeedUI
        countries={countries}
        currentDays={days}
        currentQuery={searchParams.q ?? ""}
        currentCountry={searchParams.country ?? ""}
        currentIndustry={searchParams.industry ?? ""}
        currentSourceType={searchParams.source_type ?? ""}
      />

      <p style={{ marginTop: 12 }}>
        Showing {(data ?? []).length} results
      </p>

      {(data ?? []).map((item) => (
        <div
          key={item.id}
          style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}
        >
          <strong>
            {(item.request_category || "Buyer Request").replace(/^=+/, "")}
          </strong>

          <p>{item.clean_text?.replace(/^=+/, "")}</p>

          <small style={{ color: "#666" }}>
            {item.country || "Unknown"} ·{" "}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
        </div>
      ))}
    </main>
  );
}
