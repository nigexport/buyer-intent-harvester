import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Read raw body safely
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // =========================
  // IDEMPOTENCY CHECK
  // =========================
  const { data: alreadyProcessed } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .single();

  if (alreadyProcessed) {
    // Stripe retry — safely ignore
    return res.json({ received: true, duplicate: true });
  }

  // Record event immediately (prevents race conditions)
  await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  });

  // =========================
  // HANDLE EVENTS
  // =========================
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.customer || !session.customer_email) break;

      await supabase
        .from("users")
        .update({
          plan: "pro",
          stripe_customer_id: session.customer as string,
        })
        .eq("email", session.customer_email);

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await supabase
        .from("users")
        .update({ plan: "free" })
        .eq("stripe_customer_id", sub.customer as string);

      break;
    }
  }

  return res.json({ received: true });
}
