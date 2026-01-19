import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { dashboardKeys } from "./useDashboard";
import { weeklyProgressKeys } from "./useWeeklyProgress";
import type { BulkToggleUpdate, BulkToggleResponse } from "@/lib/api/types";

type MilestoneCallback = (milestones: BulkToggleResponse) => void;

export const useBulkToggleHabits = (onMilestoneAchieved?: MilestoneCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: BulkToggleUpdate[]) => 
      dashboardApi.bulkToggleHabits({ updates }),
    onSuccess: (data) => {
      // Invalidate all dashboard queries and weekly progress after bulk update
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: weeklyProgressKeys.all });
      
      // Check for milestones and trigger callback
      if (onMilestoneAchieved && data.streaks?.length > 0) {
        const hasMilestones = data.streaks.some(streak => streak.milestones?.milestone);
        if (hasMilestones) {
          onMilestoneAchieved(data);
        }
      }
    },
  });
};

// Hook to accumulate changes - only saves when flush() is called
export const useDebouncedBulkToggle = (
  onSuccess?: () => void,
  onMilestoneAchieved?: MilestoneCallback
) => {
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, BulkToggleUpdate>>(new Map());
  const bulkToggle = useBulkToggleHabits(onMilestoneAchieved);

  const queueUpdate = useCallback((update: BulkToggleUpdate) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      // Use habitId + date as key to handle same habit on different dates
      const key = `${update.habitId}_${update.date || 'today'}`;
      newMap.set(key, update);
      return newMap;
    });
  }, []);

  // Flush pending updates immediately - only called when Save button is clicked
  const flush = useCallback(() => {
    if (pendingUpdates.size > 0) {
      const updates = Array.from(pendingUpdates.values());
      bulkToggle.mutate(updates, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
      setPendingUpdates(new Map());
    }
  }, [pendingUpdates, bulkToggle, onSuccess]);

  return { queueUpdate, flush, pendingCount: pendingUpdates.size, isLoading: bulkToggle.isPending };
};
