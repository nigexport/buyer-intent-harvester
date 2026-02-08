import { PLAN_LIMITS } from "@/lib/plans";

type Props = {
  user: any;
  savedCount: number;
  onSave: () => void;
};

export default function SaveSearchPanel({
  user,
  savedCount,
  onSave,
}: Props) {
  const plan = (user.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const limit = PLAN_LIMITS[plan].maxSavedSearches;
  const reachedLimit = savedCount >= limit;

  return (
    <div className="border rounded p-4 mb-4">
      {/* 🔹 Current plan */}
      <p className="text-xs text-gray-600 mb-1">
        Current plan: <strong>{plan.toUpperCase()}</strong>
      </p>

      {/* 🔹 Usage */}
      <p className="text-sm mb-2">
        Saved searches:{" "}
        {limit === Infinity
          ? `${savedCount} / unlimited`
          : `${savedCount} / ${limit}`}
      </p>

      {/* 🔹 Action */}
      <button
        onClick={onSave}
        disabled={reachedLimit}
        className={`px-4 py-2 rounded text-white ${
          reachedLimit ? "bg-gray-400" : "bg-black hover:bg-gray-800"
        }`}
      >
        Save search
      </button>

      {/* 🔹 Upgrade CTA */}
      {reachedLimit && plan !== "pro" && (
        <div className="mt-3 text-sm">
          <p className="text-red-600 mb-1">
            You’ve reached your plan limit.
          </p>
          <a
            href="/upgrade"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );
}
