import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";

export const weeklyProgressKeys = {
  all: ["weeklyProgress"] as const,
  current: () => [...weeklyProgressKeys.all, "current"] as const,
  range: (startDate?: string, endDate?: string) => 
    [...weeklyProgressKeys.all, "range", startDate, endDate] as const,
};

/**
 * Hook to get weekly progress data for line graph
 * @param startDate - Optional start date (YYYY-MM-DD). Defaults to current week
 * @param endDate - Optional end date (YYYY-MM-DD). Auto-calculated if startDate provided
 */
export const useWeeklyProgress = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: params?.startDate || params?.endDate 
      ? weeklyProgressKeys.range(params.startDate, params.endDate)
      : weeklyProgressKeys.current(),
    queryFn: async () => {
      return await statsApi.getWeeklyProgress(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
