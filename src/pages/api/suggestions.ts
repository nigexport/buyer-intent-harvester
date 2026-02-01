import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error } = await supabase
    .from("popular_keywords_7d")
    .select("keyword")
    .order("total", { ascending: false })
    .limit(8);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(
    (data ?? []).map((r: any) => r.keyword)
  );
}
