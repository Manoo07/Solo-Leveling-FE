import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";
import type { HeatmapData } from "@/lib/api/types";

export const heatmapKeys = {
  all: ["heatmap"] as const,
  byHabit: (habitId?: string, year?: number) => 
    [...heatmapKeys.all, habitId, year] as const,
};

/**
 * Hook to get heatmap data for visualization
 * @param habitId - Optional habit ID to filter by specific habit
 * @param year - Optional year to show (defaults to current year)
 */
export const useHeatmap = (habitId?: string, year?: number) => {
  return useQuery<HeatmapData>({
    queryKey: heatmapKeys.byHabit(habitId, year),
    queryFn: async () => {
      return await statsApi.getHeatmap({ habitId, year });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
