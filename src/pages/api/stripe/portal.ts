import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseClient } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data } = await supabaseClient
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!data?.stripe_customer_id) {
    return res.status(400).json({ error: "No Stripe customer" });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
  });

  return res.redirect(303, session.url);
}
