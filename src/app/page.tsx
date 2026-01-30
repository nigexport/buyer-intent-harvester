export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

const PAGE_SIZE = 15;

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    industry?: string;
    days?: string;
    country?: string;
    source_type?: string;
  };
}) {
  const days = searchParams.days === "14" ? 14 : searchParams.days === "30" ? 30 : 7;

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
      `clean_text.ilike.%${searchParams.q}%,intent_summary.ilike.%${searchParams.q}%`
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

  const { data } = await query;

  // ✅ countries list
  const { data: countryRows } = await supabase
    .from("buyer_intents")
    .select("country")
    .not("country", "is", null);

  const countries = Array.from(
    new Set((countryRows ?? []).map((r) => r.country))
  ).sort();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        currentDays={days}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
        currentIndustry={searchParams.industry}
        currentSourceType={searchParams.source_type}
      />

      {(data ?? []).map((item) => (
        <div key={item.id} style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}>
          <strong>{item.request_category || "Buyer Intent"}</strong>
          <p>{item.clean_text}</p>
          <small>
            {item.country ?? "Unknown"} ·{" "}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
        </div>
      ))}
    </main>
  );
}
