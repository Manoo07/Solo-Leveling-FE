import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habitsApi } from "@/lib/api";
import type {
  CreateHabitRequest,
  UpdateHabitRequest,
  ListHabitsParams,
  ArchiveHabitRequest,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { dashboardKeys } from "./useDashboard";

// Query Keys
export const habitKeys = {
  all: ["habits"] as const,
  lists: () => [...habitKeys.all, "list"] as const,
  list: (filters?: ListHabitsParams) =>
    [...habitKeys.lists(), filters] as const,
  details: () => [...habitKeys.all, "detail"] as const,
  detail: (id: string) => [...habitKeys.details(), id] as const,
};

/**
 * Hook to get all habits
 */
export const useHabits = (params?: ListHabitsParams) => {
  return useQuery({
    queryKey: habitKeys.list(params),
    queryFn: async () => {
      const response = await habitsApi.list(params);
      return response.habits;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get a single habit by ID
 */
export const useHabit = (id: string) => {
  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: async () => {
      const response = await habitsApi.getById(id);
      return response.habit;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a new habit
 */
export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHabitRequest) => habitsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      // Also invalidate dashboard to show the new habit
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      toast({
        title: "Habit Created",
        description: `"${response.habit.name}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Habit",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to update a habit
 */
export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) =>
      habitsApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      toast({
        title: "Habit Updated",
        description: `"${response.habit.name}" has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Habit",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to archive/unarchive a habit
 */
export const useArchiveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArchiveHabitRequest }) =>
      habitsApi.archive(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      const action = variables.data.archive ? "archived" : "unarchived";
      toast({
        title: `Habit ${action}`,
        description: `"${response.habit.name}" has been ${action}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Archive Habit",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to delete a habit
 */
export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      queryClient.removeQueries({ queryKey: habitKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      toast({
        title: "Habit Deleted",
        description: "The habit has been deleted permanently.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Habit",
        description: error.message,
      });
    },
  });
};
