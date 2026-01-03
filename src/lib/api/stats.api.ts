import { apiClient } from "./client";
import type { OverviewStats, HabitStats, StatsParams, TrendDataPoint, WeeklyProgressData } from "./types";

export const statsApi = {
  /**
   * Get overview statistics
   */
  getOverview: async (
    params?: StatsParams
  ): Promise<{ overview: OverviewStats }> => {
    const queryParams = new URLSearchParams();

    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return apiClient.get<{ overview: OverviewStats }>(
      `/v1/stats/overview${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get statistics for a specific habit
   */
  getHabitStats: async (
    habitId: string,
    params?: StatsParams
  ): Promise<{ stats: HabitStats }> => {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const query = queryParams.toString();
    return apiClient.get<{ stats: HabitStats }>(
      `/v1/stats/habits/${habitId}${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get trend analysis
   */
  getTrends: async (
    params?: StatsParams
  ): Promise<{ trends: TrendDataPoint[] }> => {
    const queryParams = new URLSearchParams();

    if (params?.habitId) queryParams.append("habitId", params.habitId);
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return apiClient.get<{ trends: TrendDataPoint[] }>(
      `/v1/stats/trends${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get weekly progress data for line graph
   */
  getWeeklyProgress: async (params?: { startDate?: string; endDate?: string }): Promise<WeeklyProgressData> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    
    const query = queryParams.toString();
    return apiClient.get<WeeklyProgressData>(
      `/v1/stats/weekly-progress${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get heatmap data for visualization
   */
  getHeatmap: async (params?: { habitId?: string; year?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.habitId) queryParams.append("habitId", params.habitId);
    if (params?.year) queryParams.append("year", params.year.toString());
    
    const query = queryParams.toString();
    return apiClient.get(
      `/v1/stats/heatmap${query ? `?${query}` : ""}`
    );
  },
};
