export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getSupabase } from "../lib/supabase";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    country?: string;
    source_type?: string;
  };
}) {
  const supabase = getSupabase();

  let query = supabase
    .from("buyer_intents")
    .select("id, country, source_type, clean_text")
    .order("created_at", { ascending: false });

  // 🔴 APPLY ONLY ONE FILTER AT A TIME
  if (searchParams.country) {
    query = query.ilike("country::text", `%${searchParams.country}%`);
  }

  if (searchParams.source_type) {
    query = query.ilike("source_type::text", `%${searchParams.source_type}%`);
  }

  if (searchParams.q) {
    query = query.ilike("clean_text", `%${searchParams.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return <pre>ERROR: {error.message}</pre>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🔍 Supabase Filter Diagnostic</h1>

      <p style={{ color: "red", fontWeight: 700 }}>
        SERVER RENDER: {new Date().toISOString()}
      </p>

      <h3>searchParams</h3>
      <pre>{JSON.stringify(searchParams, null, 2)}</pre>

      <h3>Returned rows: {data?.length ?? 0}</h3>

      <h3>Returned IDs</h3>
      <pre>
        {JSON.stringify(
          (data ?? []).map((r) => r.id),
          null,
          2
        )}
      </pre>

      <h3>Sample rows</h3>
      <pre>{JSON.stringify(data?.slice(0, 5), null, 2)}</pre>
    </main>
  );
}
