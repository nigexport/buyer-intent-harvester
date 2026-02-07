import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient } from "@/lib/supabaseClient";
import { PLAN_LIMITS } from "@/lib/plans";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user, query, country, industry, source } = req.body;

  if (!user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 🔑 Determine plan + limits
  const plan = (user.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[plan];

  // 🔢 Count existing saved searches
  const { count, error: countError } = await supabaseClient
    .from("saved_searches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    console.error("Count error:", countError);
    return res.status(500).json({ error: "Failed to check plan limits" });
  }

  const safeCount = count ?? 0;

  if (safeCount >= limits.maxSavedSearches) {
    return res.status(403).json({
      error: "Plan limit reached. Upgrade to save more searches.",
    });
  }

  // ✅ Insert saved search with enforced frequency
  const { error: insertError } = await supabaseClient
    .from("saved_searches")
    .insert({
      user_id: user.id,
      query,
      country,
      industry,
      source_type: source, // 🔥 normalized
      frequency: limits.frequency, // 🔥 enforced by plan
    });

  if (insertError) {
    console.error("Insert error:", insertError);
    return res.status(500).json({ error: "Failed to save search" });
  }

  return res.json({ ok: true });
}
