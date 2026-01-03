import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { dashboardApi } from "@/lib/api/dashboard.api";
import { dashboardKeys } from "./useDashboard";
import { weeklyProgressKeys } from "./useWeeklyProgress";
import type { BulkToggleUpdate } from "@/lib/api/types";

export const useBulkToggleHabits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: BulkToggleUpdate[]) => 
      dashboardApi.bulkToggleHabits({ updates }),
    onSuccess: () => {
      // Invalidate all dashboard queries and weekly progress after bulk update
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: weeklyProgressKeys.all });
    },
  });
};

// Hook to accumulate changes - only saves when flush() is called
export const useDebouncedBulkToggle = (onSuccess?: () => void) => {
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, BulkToggleUpdate>>(new Map());
  const bulkToggle = useBulkToggleHabits();

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
