export function UpgradeCTA() {
  return (
    <div className="mt-3 text-sm bg-yellow-50 border border-yellow-200 p-3 rounded">
      <p className="mb-2">
        You’ve reached your plan limit.
      </p>

      <a
        href="/upgrade"
        className="inline-block bg-black text-white px-4 py-2 rounded text-sm"
      >
        Upgrade to Pro
      </a>
    </div>
  );
}
