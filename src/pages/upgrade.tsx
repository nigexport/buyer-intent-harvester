import { supabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function UpgradePage() {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<
    "free" | "starter" | "pro"
  >("free");

  // Load logged-in user + current plan
  useEffect(() => {
    async function loadUserAndPlan() {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) return;

      setUser(auth.user);

      const { data } = await supabaseClient
        .from("users")
        .select("plan")
        .eq("id", auth.user.id)
        .single();

      setCurrentPlan((data?.plan as any) ?? "free");
    }

    loadUserAndPlan();
  }, []);

  function goToCheckout(plan: "starter" | "pro") {
    if (!user) {
      alert("Please log in first");
      return;
    }

    window.location.href = `/api/stripe/create-checkout?plan=${plan}`;
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Upgrade your plan</h1>
      <p style={{ marginBottom: 30 }}>
        Unlock more saved searches and faster alerts.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* STARTER PLAN */}
        <div style={{ border: "1px solid #ddd", padding: 20 }}>
          <h2>Starter</h2>
          <p>
            <strong>$29 / month</strong>
          </p>
          <ul>
            <li>✔ 3 saved searches</li>
            <li>✔ Daily alerts</li>
            <li>✔ Email notifications</li>
          </ul>

          <button
            disabled={currentPlan === "starter"}
            onClick={() => goToCheckout("starter")}
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background:
                currentPlan === "starter" ? "#aaa" : "#000",
              color: "#fff",
              border: "none",
              cursor:
                currentPlan === "starter"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {currentPlan === "starter"
              ? "Current plan"
              : "Upgrade to Starter"}
          </button>
        </div>

        {/* PRO PLAN */}
        <div
          style={{
            border: "2px solid black",
            padding: 20,
            background: "#fafafa",
          }}
        >
          <h2>Pro 🚀</h2>
          <p>
            <strong>$79 / month</strong>
          </p>
          <ul>
            <li>✔ Unlimited saved searches</li>
            <li>✔ Daily alerts</li>
            <li>✔ Email notifications</li>
            <li>✔ Priority signals</li>
          </ul>

          <button
            disabled={currentPlan === "pro"}
            onClick={() => goToCheckout("pro")}
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background:
                currentPlan === "pro" ? "#aaa" : "black",
              color: "white",
              border: "none",
              cursor:
                currentPlan === "pro"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {currentPlan === "pro"
              ? "Current plan"
              : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      {/* MANAGE BILLING (Starter / Pro only) */}
      {currentPlan !== "free" && (
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid #ddd",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: 10 }}>
            Manage your subscription, payment method, or invoices
          </p>

          <a href="/api/stripe/portal">
            <button
              style={{
                padding: "10px 16px",
                background: "#eee",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              Manage billing
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
