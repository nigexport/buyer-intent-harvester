export const dynamic = "force-dynamic";

import { supabase } from "../lib/supabase";
import FeedUI from "../components/FeedUI";


interface PageProps {
  searchParams: {
    q?: string;
    industry?: string;
    days?: string;
    country?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const q = searchParams.q ?? "";
  const industry = searchParams.industry ?? "";
  const days = Number(searchParams.days ?? 7);
  const country = searchParams.country ?? "";

  let query = supabase
    .from("intent_feed")
    .select("*")
    .order("created_at", { ascending: false });

  // 🔍 text search
  if (q) {
    query = query.ilike("clean_text", `%${q}%`);
  }

  // 🏭 industry filter
  if (industry) {
    query = query.eq("industry", industry);
  }

  // 🌍 country filter
  if (country) {
    query = query.eq("country", country);
  }

  // 📅 time filter
  const since = new Date();
  since.setDate(since.getDate() - days);
  query = query.gte("created_at", since.toISOString());

  const { data, error } = await query.limit(50);

  if (error) {
    console.error(error);
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <FeedUI
        results={data ?? []}
        initialQuery={q}
        initialIndustry={industry}
        initialDays={days}
        initialCountry={country}
      />
    </main>
  );
}
