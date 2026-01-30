import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

type PageProps = {
  results: any[];
  countries: string[];
  q?: string;
  country?: string;
  days: number;
};

export default function Home({
  results,
  countries,
  q,
  country,
  days,
}: PageProps) {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        currentQuery={q}
        currentCountry={country}
        currentDays={days}
      />

      {results.length === 0 && <p>No results found.</p>}

      {results.map((item) => (
        <div key={item.id} style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}>
          <strong>{item.request_category || "Buyer Intent"}</strong>
          <p>{item.clean_text}</p>
          <small>
            {item.country || "Unknown"} ·{" "}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
        </div>
      ))}
    </main>
  );
}

export async function getServerSideProps({ query }: any) {
  const q = query.q ?? "";
  const country = query.country ?? "";
  const days = Number(query.days) || 7;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  let dbQuery = supabase
    .from("buyer_intents")
    .select("*")
    .gte("created_at", fromDate)
    .order("created_at", { ascending: false })
    .limit(20);

  if (q) {
    dbQuery = dbQuery.or(
      `clean_text.ilike.%${q}%,intent_summary.ilike.%${q}%`
    );
  }

  if (country) {
    dbQuery = dbQuery.eq("country", country);
  }

  const { data } = await dbQuery;

  const { data: countryRows } = await supabase
    .from("buyer_intents")
    .select("country")
    .not("country", "is", null);

  const countries = Array.from(
    new Set((countryRows ?? []).map((r) => r.country))
  ).sort();

  return {
    props: {
      results: data ?? [],
      countries,
      q,
      country,
      days,
    },
  };
}
