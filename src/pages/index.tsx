import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

const PAGE_SIZE = 15;

export default function Home(props: any) {
  const {
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
  } = props;

  return (
    <>
      <Head>
        <title>Buyer Intent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        {/* LOGO / HOME */}
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

        {/* RESULTS */}
        {results.length === 0 && <p>No results found.</p>}

        {results.map((item: any) => (
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
            <Link href={`/?${new URLSearchParams({ ...props, page: page - 1 })}`}>
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link href={`/?${new URLSearchParams({ ...props, page: page + 1 })}`}>
              Next →
            </Link>
          )}
        </div>
      </main>

      {/* MOBILE-FIRST STYLES */}
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

export async function getServerSideProps({ query }: any) {
  const q = query.q ?? "";
  const country = query.country ?? "";
  const industry = query.industry ?? "";
  const source = query.source ?? "";
  const days = Number(query.days) || 7;
  const page = Number(query.page) || 1;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  let baseQuery = supabase
    .from("buyer_intents")
    .select("*", { count: "exact" })
    .gte("created_at", fromDate);

  if (q) {
    baseQuery = baseQuery.or(
      `clean_text.ilike.%${q}%,
      intent_summary.ilike.%${q}%,
      request_category.ilike.%${q}%`
    );
  }

  if (country) baseQuery = baseQuery.eq("country", country);
  if (industry) baseQuery = baseQuery.eq("industry", industry);
  if (source) baseQuery = baseQuery.eq("source_type", source);

  const { data, count } = await baseQuery
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // CLEAN FILTER DATA (NO JUNK)
  const getDistinct = async (field: string) => {
    const { data } = await supabase
      .from("buyer_intents")
      .select(field)
      .not(field, "is", null);
    return [...new Set(data?.map((r: any) => r[field]))].sort();
  };

  const VALID_SOURCES = ["twitter", "linkedin", "web", "tenders", "rss"];

  const rawSources = await getDistinct("source_type");

  const sources = rawSources.filter((s: string) =>
    VALID_SOURCES.includes(s.toLowerCase())
  );

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
      countries: await getDistinct("country"),
      industries: await getDistinct("industry"),
      sources: await getDistinct("source_type"),
      popularKeywords: (
        await supabase
          .from("popular_keywords_7d")
          .select("keyword")
          .order("total", { ascending: false })
          .limit(10)
      ).data?.map((k: any) => k.keyword) ?? [],
    },
  };
}
