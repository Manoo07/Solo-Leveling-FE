import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";
import type { StatsParams } from "@/lib/api";

// Query Keys
export const statsKeys = {
  all: ["stats"] as const,
  overview: (params?: StatsParams) =>
    [...statsKeys.all, "overview", params] as const,
  habit: (habitId: string, params?: StatsParams) =>
    [...statsKeys.all, "habit", habitId, params] as const,
};

/**
 * Hook to get overview statistics
 */
export const useOverviewStats = (params?: StatsParams) => {
  return useQuery({
    queryKey: statsKeys.overview(params),
    queryFn: async () => {
      const response = await statsApi.getOverview(params);
      return response.overview;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get habit-specific statistics
 */
export const useHabitStats = (habitId: string, params?: StatsParams) => {
  return useQuery({
    queryKey: statsKeys.habit(habitId, params),
    queryFn: async () => {
      const response = await statsApi.getHabitStats(habitId, params);
      return response.stats;
    },
    enabled: !!habitId,
    staleTime: 5 * 60 * 1000,
  });
};
