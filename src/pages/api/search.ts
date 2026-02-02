import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

const PAGE_SIZE = 15;

const B2B_INDUSTRIES = new Set([
  "Procurement",
  "Construction",
  "Home & Office",
  "Mining, Oil & Gas",
  "Energy & Renewables",
  "Transport & Spare parts",
  "Electronics & Electrical",
  "Food & Agriculture",
  "Chemicals, Mineral & Raw Material",
  "Tools & Machinery",
  "Clothing & Accessories",
  "Real Estate",
  "Plants & Animal",
  "Timber, Wood, Fuel",
  "Scrap",
  "Services",
  "IT & Telecoms",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    q = "",
    country = "",
    industry = "",
    source = "",
    days = "7",
    page = "1",
  } = req.query;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days));

  let dbQuery = supabase
    .from("buyer_intents")
    .select("*")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false })
    .range(
      (Number(page) - 1) * PAGE_SIZE,
      Number(page) * PAGE_SIZE - 1
    );

  if (q) dbQuery = dbQuery.textSearch("search_vector", String(q));
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

  res.status(200).json({
    results: ranked,
    hasMore: ranked.length === PAGE_SIZE,
  });
}
