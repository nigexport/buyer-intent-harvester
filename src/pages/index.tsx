import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

const PAGE_SIZE = 15;

const B2B_INDUSTRIES = new Set([
  "Procurement",
  "Construction",
  "Home & Office",
  "Oil & Gas",
  "Energy",
  "Transportation",
  "Electronics & Electrical",
  "Food & Agriculture",
  "Solid Minerals",
  "Tools & Machinery",
  "Clothing & Accessories",
  "Real Estate",
  "Plants & Animal",
  "Timber, Wood, Fuel",
  "Scrap",
  "Renewables",
  "IT & Software",
]);

export default function Home({
  results,
  countries,
  industries,
  sources,
  popularKeywords,
  q,
  country,
  industry,
  source,
  days,
}: any) {
  function highlight(text: string) {
    if (!q) return text;
    return text.replace(
      new RegExp(`(${q})`, "gi"),
      "<mark>$1</mark>"
    );
  }

  return (
    <>
      <Head>
        <title>Buyer Intent</title>
      </Head>

      <main className="container">
        <Link href="/" className="logo">
          <img src="/logo.svg" alt="Buyer Intent" />
        </Link>

        <FeedUI
          countries={countries}
          industries={industries}
          sources={sources}
          popularKeywords={popularKeywords}
          currentQuery={q}
          currentCountry={country}
          currentIndustry={industry}
          currentSource={source}
          currentDays={days}
        />

        {results.map((item: any) => (
          <div key={item.id} className="card">
            <a href={item.source_url} target="_blank">
              {item.request_category || "Buyer Intent"}
            </a>
            <p
              dangerouslySetInnerHTML={{
                __html: highlight(item.clean_text),
              }}
            />
            <small>
              {item.industry || "Other"} ·{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </main>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 16px;
        }
        .card {
          border-bottom: 1px solid #eee;
          padding: 16px 0;
        }
        mark {
          background: yellow;
        }
      `}</style>
    </>
  );
}

/* ================= SERVER ================= */

export async function getServerSideProps({ query }: any) {
  const q = query.q ?? "";
  const country = query.country ?? "";
  const industry = query.industry ?? "";
  const source = query.source ?? "";
  const days = Number(query.days) || 7;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let dbQuery = supabase
    .from("buyer_intents")
    .select("*", { count: "exact" })
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });

  if (q) {
    dbQuery = dbQuery.textSearch("search_vector", q);
  }

  if (country) dbQuery = dbQuery.eq("country", country);
  if (industry) dbQuery = dbQuery.eq("industry", industry);
  if (source) dbQuery = dbQuery.eq("source_type", source);

  const { data } = await dbQuery;

  // ✅ Rank B2B higher (JS-side, SAFE)
  const ranked =
    data?.sort((a: any, b: any) => {
      const aB2B = B2B_INDUSTRIES.has(a.industry);
      const bB2B = B2B_INDUSTRIES.has(b.industry);
      if (aB2B !== bB2B) return aB2B ? -1 : 1;
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    }) ?? [];

  // Distinct filters
  const distinct = async (field: string) => {
    const { data } = await supabase
      .from("buyer_intents")
      .select(field)
      .not(field, "is", null);
    return [...new Set(data?.map((r: any) => r[field]))].sort();
  };

  return {
    props: {
      results: ranked,
      q,
      country,
      industry,
      source,
      days,
      countries: await distinct("country"),
      industries: await distinct("industry"),
      sources: await distinct("source_type"),
      popularKeywords:
        (
          await supabase
            .from("popular_keywords_7d")
            .select("keyword")
            .order("total", { ascending: false })
            .limit(10)
        ).data?.map((k: any) => k.keyword) ?? [],
    },
  };
}
