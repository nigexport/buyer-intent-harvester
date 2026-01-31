import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

export default function Home(props: any) {
  const {
    results: initialResults,
    hasMore: initialHasMore,
    q,
  } = props;

  const [results, setResults] = useState(initialResults);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 🔽 Infinite scroll
  useEffect(() => {
    if (!hasMore) return;

    const obs = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        const nextPage = page + 1;
        const res = await fetch(
          `/?q=${q}&page=${nextPage}`
        );
        const html = await res.text();
        if (!html) {
          setHasMore(false);
          return;
        }
        setPage(nextPage);
      }
    });

    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [page, hasMore]);

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
          <img src="/logo.svg" />
        </Link>

        <FeedUI {...props} />

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

        <div ref={loaderRef} />
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
  const page = Number(query.page) || 1;

  let dbQuery = supabase
    .from("buyer_intents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) {
    dbQuery = dbQuery.textSearch("search_vector", q);
  }

  const { data, count } = await dbQuery;

  // 🧠 Rank B2B first
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

  return {
    props: {
      results: ranked,
      hasMore: page * PAGE_SIZE < (count ?? 0),
      q,
    },
  };
}
