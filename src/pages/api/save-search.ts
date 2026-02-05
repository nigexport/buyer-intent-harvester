import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const user = req.body.user; // injected from auth/session
  const { query, country, industry, source } = req.body;

  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 🔒 FREE PLAN LIMIT
  const { count } = await supabase
    .from("saved_searches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const safeCount = count ?? 0;

  if (user.plan === "free" && safeCount >= 1) {
    return res.status(403).json({
      error: "Upgrade to save more searches",
    });
  }

  const { error } = await supabase.from("saved_searches").insert({
    user_id: user.id,
    query,
    country,
    industry,
    source,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
}
