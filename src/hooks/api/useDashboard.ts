import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import type {
  DashboardData,
  ToggleHabitRequest,
  Entry,
  CalendarData,
  CalendarParams,
} from "@/lib/api/types";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  dashboard: (startDate?: string) => 
    startDate 
      ? [...dashboardKeys.all, "main", startDate] as const
      : [...dashboardKeys.all, "main"] as const,
  calendar: (params: CalendarParams) =>
    [...dashboardKeys.all, "calendar", params] as const,
};

/**
 * Get complete dashboard data
 * @param startDate Optional start date to view a specific week (YYYY-MM-DD format)
 */
export const useDashboard = (startDate?: string) => {
  return useQuery({
    queryKey: dashboardKeys.dashboard(startDate),
    queryFn: async () => {
      const response = await dashboardApi.getDashboard(startDate);
      return response.dashboard;
    },
    staleTime: 1000 * 30, // 30 seconds - refresh frequently for real-time updates
    refetchOnWindowFocus: true,
  });
};

/**
 * Toggle habit completion with optimistic updates
 */
export const useToggleHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ToggleHabitRequest) => {
      const response = await dashboardApi.toggleHabit(data);
      return response.entry;
    },
    onMutate: async (variables: ToggleHabitRequest) => {
      // Cancel outgoing refetches for all dashboard queries
      await queryClient.cancelQueries({ queryKey: dashboardKeys.all });

      // Snapshot the previous value (current week only)
      const previousDashboard =
        queryClient.getQueryData<DashboardData>(dashboardKeys.dashboard());

      // Optimistically update the dashboard
      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(
          dashboardKeys.dashboard(),
          (old) => {
            if (!old) return old;

            const updatedHabits = old.todayHabits.map((habit) => {
              if (habit.id === variables.habitId) {
                const newCompleted =
                  variables.completed !== undefined
                    ? variables.completed
                    : !habit.completed;

                return {
                  ...habit,
                  completed: newCompleted,
                  // Optimistically update streak
                  currentStreak: newCompleted
                    ? habit.currentStreak + 1
                    : Math.max(0, habit.currentStreak - 1),
                };
              }
              return habit;
            });

            // Update today's progress
            const completed = updatedHabits.filter((h) => h.completed).length;
            const total = updatedHabits.length;

            return {
              ...old,
              todayHabits: updatedHabits,
              todayProgress: {
                completed,
                total,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
              },
            };
          }
        );
      }

      return { previousDashboard };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousDashboard) {
        queryClient.setQueryData(
          dashboardKeys.dashboard(),
          context.previousDashboard
        );
      }
    },
    onSettled: () => {
      // Always refetch all dashboard queries after error or success to sync with server
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

/**
 * Get calendar view data
 */
export const useCalendar = (params: CalendarParams) => {
  return useQuery({
    queryKey: dashboardKeys.calendar(params),
    queryFn: async () => {
      return await dashboardApi.getCalendar(params);
    },
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
