import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { dashboardKeys } from "./useDashboard";
import { weeklyProgressKeys } from "./useWeeklyProgress";
import type { ToggleHabitRequest, ToggleHabitResponse } from "@/lib/api/types";

type MilestoneCallback = (response: ToggleHabitResponse, habitName: string) => void;

export const useToggleHabit = (onMilestoneAchieved?: MilestoneCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ToggleHabitRequest & { habitName?: string }) => 
      dashboardApi.toggleHabit(request),
    onSuccess: (data, variables) => {
      // Invalidate all dashboard queries and weekly progress
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: weeklyProgressKeys.all });
      
      // Check for milestone celebration
      if (onMilestoneAchieved && data.streak?.milestones?.milestone) {
        const habitName = variables.habitName || 'Unknown Habit';
        onMilestoneAchieved(data, habitName);
      }
    },
  });
};
