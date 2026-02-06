import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
//import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ Stripe client (env var must exist)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// =========================
// Read raw request body
// =========================
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
  // =========================
  // Method guard
  // =========================
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // =========================
  // Signature guard
  // =========================
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  // =========================
  // Verify webhook signature
  // =========================
  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // =========================
  // IDEMPOTENCY CHECK
  // =========================
  const { data: existingEvent } = await supabaseAdmin
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle(); // ✅ safer than .single()

  if (existingEvent) {
    // Stripe retry → ignore safely
    return res.json({ received: true, duplicate: true });
  }

  // Record event immediately (prevents race conditions)
  await supabaseAdmin.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  });

  // =========================
  // HANDLE EVENTS
  // =========================
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_email;
      const customerId = session.customer as string | null;

      // Defensive guards
      if (!email || !customerId) {
        console.warn(
          "checkout.session.completed missing email or customer",
          session.id
        );
        break;
      }

      await supabaseAdmin
        .from("users") // public.users
        .update({
          plan: "pro",
          stripe_customer_id: customerId,
        })
        .eq("email", email);

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string | null;

      if (!customerId) break;

      await supabaseAdmin
        .from("users")
        .update({ plan: "free" })
        .eq("stripe_customer_id", customerId);

      break;
    }

    // Optional: explicitly ignore other events
    default:
      break;
  }

  return res.json({ received: true });
}
