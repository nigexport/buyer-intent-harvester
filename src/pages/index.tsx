import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";

const PAGE_SIZE = 15;

export default function Home({
  results,
  q,
  hasMore,
}: any) {
  return (
    <>
      <Head>
        <title>Buyer Intent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        <Link href="/" className="logo">
          <img src="/logo.svg" alt="Buyer Intent" />
        </Link>

        <FeedUI initialQuery={q} initialResults={results} hasMore={hasMore} />
      </main>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 16px;
        }
        .logo img {
          height: 36px;
        }
      `}</style>
    </>
  );
}

/* ================= SERVER ================= */

export async function getServerSideProps({ query }: any) {
  const q = query.q ?? "";
  const page = Number(query.page ?? 1);

  let dbQuery = supabase
    .from("buyer_intents")
    .select(
      `
      *,
      rank:ts_rank(search_vector, plainto_tsquery('english', ${q ? `'${q}'` : "''"}))
      `,
      { count: "exact" }
    )
    .order("rank", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) {
    dbQuery = dbQuery.textSearch("search_vector", q);
  }

  const { data, count } = await dbQuery;

  // 🔥 B2B > B2C boost
  const B2B = new Set([
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


  const ranked = (data ?? []).sort((a: any, b: any) => {
    const aB2B = B2B.has(a.industry);
    const bB2B = B2B.has(b.industry);
    if (aB2B !== bB2B) return aB2B ? -1 : 1;
    return (b.rank ?? 0) - (a.rank ?? 0);
  });

  return {
    props: {
      results: ranked,
      q,
      hasMore: page * PAGE_SIZE < (count ?? 0),
    },
  };
}
