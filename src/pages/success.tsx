import Link from "next/link";

export default function SuccessPage() {
  return (
    <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center" }}>
      <h1>🎉 Payment successful</h1>

      <p style={{ marginTop: 12 }}>
        Your subscription is active. Your account has been upgraded.
      </p>

      <div style={{ marginTop: 30 }}>
        <Link href="/search">
          <button
            style={{
              padding: "10px 16px",
              background: "black",
              color: "white",
              border: "none",
              marginRight: 10,
            }}
          >
            Go to search
          </button>
        </Link>

        <Link href="/upgrade">
          <button
            style={{
              padding: "10px 16px",
              background: "#eee",
              border: "1px solid #ccc",
            }}
          >
            Manage subscription
          </button>
        </Link>
      </div>
    </div>
  );
}
