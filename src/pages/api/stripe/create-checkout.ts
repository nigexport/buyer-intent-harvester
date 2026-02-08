import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabaseClient } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan } = req.query;

  if (!plan || typeof plan !== "string") {
    return res.status(400).json({ error: "Missing plan" });
  }

  if (!PRICE_MAP[plan]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  // 🔐 Get logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ✅ Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price: PRICE_MAP[plan],
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
    metadata: {
      user_id: user.id,
      plan,
    },
  });

  // 🔁 Redirect to Stripe Checkout
  return res.redirect(303, session.url!);
}
