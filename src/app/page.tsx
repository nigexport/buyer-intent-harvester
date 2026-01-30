// app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import FeedUI from '../components/FeedUI';
import { getSupabase } from '../lib/supabase';

const PAGE_SIZE = 15;

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    days?: string;
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

  const { data: items } = await query;

  // Countries for filter
  const { data: countryRows } = await supabase
    .from("buyer_intents")
    .select("country")
    .not("country", "is", null);

  const countries = Array.from(
    new Set((countryRows ?? []).map(r => r.country))
  );

  // Popular searches (already computed table)
  const { data: keywords } = await supabase
    .from("popular_keywords_7d")
    .select("keyword,total")
    .order("total", { ascending: false })
    .limit(10);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        keywords={keywords ?? []}
        currentDays={days}
        currentQuery={searchParams.q ?? ""}
        currentCountry={searchParams.country ?? ""}
        currentIndustry={searchParams.industry ?? ""}
        currentSourceType={searchParams.source_type ?? ""}
      />

      <div style={{ marginTop: 24 }}>
        {(items ?? []).map(item => (
          <div
            key={item.id}
            style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}
          >
            <p style={{ fontWeight: 600 }}>{item.clean_text}</p>

            {item.intent_summary && <p>{item.intent_summary}</p>}

            <small style={{ color: "#666" }}>
              {item.industry || "Other"}
              {item.country ? ` · ${item.country}` : ""}
              {" · "}
              {new Date(item.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </main>
  );
}


