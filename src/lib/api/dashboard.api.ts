import { apiClient } from "./client";
import type {
  DashboardData,
  ToggleHabitRequest,
  BulkToggleRequest,
  Entry,
  CalendarData,
  CalendarParams,
} from "./types";

export const dashboardApi = {
  /**
   * Get complete dashboard data including today's progress, streaks, and habits
   * @param startDate Optional start date to view a specific week (YYYY-MM-DD format)
   */
  getDashboard: async (startDate?: string): Promise<{ dashboard: DashboardData }> => {
    const url = startDate 
      ? `/v1/stats/dashboard?startDate=${startDate}`
      : "/v1/stats/dashboard";
    return apiClient.get<{ dashboard: DashboardData }>(url);
  },

  /**
   * Toggle or set habit completion status for a specific date
   */
  toggleHabit: async (data: ToggleHabitRequest): Promise<{ entry: Entry }> => {
    return apiClient.post<{ entry: Entry }>("/v1/stats/toggle-habit", data);
  },

  /**
   * Bulk toggle multiple habits at once
   */
  bulkToggleHabits: async (data: BulkToggleRequest): Promise<{ entries: Entry[] }> => {
    return apiClient.post<{ entries: Entry[] }>("/v1/stats/bulk-toggle-habits", data);
  },

  /**
   * Get calendar view data showing habit completions across a date range
   */
  getCalendar: async (params: CalendarParams): Promise<CalendarData> => {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", params.startDate);
    queryParams.append("endDate", params.endDate);

    const query = queryParams.toString();
    return apiClient.get<CalendarData>(
      `/v1/stats/calendar?${query}`
    );
  },
};
