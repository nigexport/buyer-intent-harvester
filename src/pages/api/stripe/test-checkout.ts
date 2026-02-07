import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: "rasheed_services@yahoo.com", // 👈 important
    line_items: [
      {
        price: process.env.STRIPE_PRICE_STARTER!,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.redirect(303, session.url!);
}
