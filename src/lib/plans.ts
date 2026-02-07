export const PLAN_LIMITS = {
  free: {
    frequency: "weekly",
    maxSavedSearches: 1,
  },
  starter: {
    frequency: "daily",
    maxSavedSearches: 3,
  },
  pro: {
    frequency: "daily",
    maxSavedSearches: Infinity,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
