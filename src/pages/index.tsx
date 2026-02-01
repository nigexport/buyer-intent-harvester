import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  "Real Estate",
  "Renewables",
  "IT & Software",
]);

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
  onlyLinked: boolean; // ✅ ADD
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
  onlyLinked,
}: Props) {
  /* ---------------- CLIENT STATE ---------------- */
  const [items, setItems] = useState(results);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);




  /* ---------------- KEYWORD HIGHLIGHT ---------------- */
  function highlight(text: string) {
    if (!q) return text;
    return text.replace(
      new RegExp(`(${q})`, "gi"),
      "<mark>$1</mark>"
    );
  }

  /* ---------------- INFINITE SCROLL ---------------- */
  useEffect(() => {
    let ticking = false;

    const onScroll = async () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(async () => {
        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300;

        if (!nearBottom || loading || !hasMore) {
          ticking = false;
          return;
        }

        setLoading(true);

        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&country=${encodeURIComponent(
              country
            )}&industry=${encodeURIComponent(
              industry
            )}&source=${encodeURIComponent(
              source
            )}&days=${days}&page=${pageNum + 1}`
          );

          const json = await res.json();

          if (!json.results || json.results.length === 0) {
            setHasMore(false);
          } else {
            setItems((prev) => [...prev, ...json.results]);
            setPageNum((p) => p + 1);
            setHasMore(json.hasMore);
          }
        } finally {
          setLoading(false);
          ticking = false;
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading, hasMore, q, country, industry, source, days]);

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
        {items.length === 0 && <p>No results found.</p>}

        {items
          .filter((item) =>
            !onlyLinked
              ? true
              : typeof item.source_url === "string" &&
                item.source_url.length > 8 &&
                item.source_url.includes(".")
          )
          .map((item) => {

          const url =
            typeof item.source_url === "string" &&
            item.source_url.length > 8 &&
            item.source_url.includes(".")
              ? item.source_url.startsWith("http")
                ? item.source_url
                : `https://${item.source_url}`
              : null;

          const isTwitter = url?.includes("twitter.com");
          const isLinkedIn = url?.includes("linkedin.com");
          const isB2B = B2B_INDUSTRIES.has(item.industry);
          


          return (
            <div className="title-row">
              {url ? (
                <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPreviewUrl(url);
                }}
                className="title"
              >

                  {isTwitter && "🐦 "}
                  {isLinkedIn && "💼 "}
                  {item.request_category || "Buyer Intent"}
                </a>
              ) : (
                <span className="title no-link">
                  {item.request_category || "Buyer Intent"}
                </span>
              )}

              <span className={`tag ${isB2B ? "b2b" : "b2c"}`}>
                {isB2B ? "B2B" : "B2C"}
              </span>

              {/* 🔍 FALLBACK SEARCH (PASTE WAS ASKED ABOUT THIS PART) */}
              {!url && item.clean_text && (
                <button
                  className="fallback"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/search?q=${encodeURIComponent(
                        item.clean_text.slice(0, 80)
                      )}`,
                      "_blank"
                    )
                  }
                >
                  Search source
                </button>
              )}

              {/* BODY */}
              <p
                dangerouslySetInnerHTML={{
                  __html: highlight(item.clean_text),
                }}
              />

              {/* META */}
              <small>
                {item.industry || "Other"} ·{" "}
                {new Date(item.created_at).toLocaleDateString()}
              </small>
            </div>
          );
        })}

        {loading && <p>Loading more…</p>}

        {previewUrl && (
          <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setPreviewUrl(null)}>
                ✕
              </button>

              <iframe
                src={previewUrl}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tag {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .tag.b2b {
          background: #e6f4ff;
          color: #0958d9;
        }

        .tag.b2c {
          background: #fff1f0;
          color: #a8071a;
        }

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
        .no-link {
          color: #555;
          cursor: default;
        }
        .badge {
          margin-left: 8px;
          font-size: 12px;
          background: #eee;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .fallback {
          margin: 6px 0 10px;
          padding: 6px 10px;
          font-size: 13px;
          background: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        mark {
          background: #ffe58f;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          width: 90%;
          max-width: 900px;
          height: 80%;
          background: #fff;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .modal iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: #000;
          color: #fff;
          border: none;
          padding: 6px 10px;
          cursor: pointer;
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
  const onlyLinked = query.onlyLinked === "1";


  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let dbQuery = supabase
    .from("buyer_intents")
    .select("*")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });

  if (q) dbQuery = dbQuery.textSearch("search_vector", q);
  if (country) dbQuery = dbQuery.eq("country", country);
  if (industry) dbQuery = dbQuery.eq("industry", industry);
  if (source) dbQuery = dbQuery.eq("source_type", source);

  const { data } = await dbQuery;

  // Rank B2B higher
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

  const distinct = async (field: string) => {
    const { data } = await supabase
      .from("buyer_intents")
      .select(field)
      .not(field, "is", null);
    return [...new Set(data?.map((r: any) => r[field]))].sort();
  };

  return {
    props: {
      results: ranked.slice(0, PAGE_SIZE),
      q,
      country,
      industry,
      source,
      days,
      onlyLinked, // ✅ ADD THIS
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
