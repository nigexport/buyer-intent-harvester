import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

const PAGE_SIZE = 15;

type Props = {
  results: any[];
  countries: string[];
  industries: string[];
  sources: string[];
  popularKeywords: string[];
  q: string;
  country: string;
  industry: string;
  source: string;
  days: number;
  page: number;
  totalPages: number;
};

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
  page,
  totalPages,
}: Props) {
  return (
    <>
      <Head>
        <title>Buyer Intent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        {/* LOGO */}
        <Link href="/" className="logo">
          <img src="/logo.svg" alt="Buyer Intent" />
        </Link>

        {/* FILTER UI */}
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

        {/* RESULTS */}
        {results.length === 0 && <p>No results found.</p>}

        {results.map((item) => (
          <div key={item.id} className="card">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="title"
            >
              {item.request_category || "Buyer Intent"}
            </a>

            <p>{item.clean_text}</p>

            <small>
              {item.country || "Unknown"} ·{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}

        {/* PAGINATION */}
        <div className="pagination">
          {page > 1 && (
            <Link
              href={{
                pathname: "/",
                query: { q, country, industry, source, days, page: page - 1 },
              }}
            >
              ← Prev
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={{
                pathname: "/",
                query: { q, country, industry, source, days, page: page + 1 },
              }}
            >
              Next →
            </Link>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 16px;
        }
        .logo img {
          height: 40px;
          cursor: pointer;
        }
        .card {
          border-bottom: 1px solid #eee;
          padding: 16px 0;
        }
        .title {
          font-weight: 600;
          color: #000;
          text-decoration: none;
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          margin: 24px 0;
        }
      `}</style>
    </>
  );
}

/* ================= SERVER SIDE ================= */

export async function getServerSideProps({ query }: any) {
  const q = query.q ?? "";
  const country = query.country ?? "";
  const industry = query.industry ?? "";
  const source = query.source ?? "";
  const days = Number(query.days) || 7;
  const page = Number(query.page) || 1;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  /* MAIN QUERY */
  let dbQuery = supabase
    .from("buyer_intents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .gte("created_at", cutoff.toISOString());

  // 🔍 FULL TEXT SEARCH
  if (q) {
    dbQuery = dbQuery.textSearch("search_vector", q, {
      type: "plain",
      config: "english",
    });
  }

  // FILTERS
  if (country) dbQuery = dbQuery.eq("country", country);
  if (industry) dbQuery = dbQuery.eq("industry", industry);
  if (source) dbQuery = dbQuery.eq("source_type", source);

  // PAGINATION
  dbQuery = dbQuery.range(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE - 1
  );

  const { data, count } = await dbQuery;

  /* DISTINCT FILTER VALUES (CLEAN) */
  const distinct = async (field: string) => {
    const { data } = await supabase
      .from("buyer_intents")
      .select(field)
      .not(field, "is", null);
    return [...new Set(data?.map((r: any) => r[field]))].sort();
  };

  const VALID_SOURCES = ["twitter", "linkedin", "web", "tenders", "rss"];

  const rawSources = await distinct("source_type");
  const sources = rawSources.filter((s) =>
    VALID_SOURCES.includes(String(s).toLowerCase())
  );

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return {
    props: {
      results: data ?? [],
      q,
      country,
      industry,
      source,
      days,
      page,
      totalPages,
      countries: await distinct("country"),
      industries: await distinct("industry"),
      sources,
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
