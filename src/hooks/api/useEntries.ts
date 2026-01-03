import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entriesApi } from "@/lib/api";
import type {
  CreateEntryRequest,
  UpdateEntryRequest,
  ListEntriesParams,
  BulkEntriesRequest,
} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { habitKeys } from "./useHabits";

// Query Keys
export const entryKeys = {
  all: ["entries"] as const,
  lists: () => [...entryKeys.all, "list"] as const,
  list: (habitId: string, filters?: ListEntriesParams) =>
    [...entryKeys.lists(), habitId, filters] as const,
};

/**
 * Hook to get entries for a habit
 */
export const useEntries = (habitId: string, params?: ListEntriesParams) => {
  return useQuery({
    queryKey: entryKeys.list(habitId, params),
    queryFn: async () => {
      const response = await entriesApi.list(habitId, params);
      return response.entries;
    },
    enabled: !!habitId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create an entry
 */
export const useCreateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      habitId,
      data,
    }: {
      habitId: string;
      data: CreateEntryRequest;
    }) => entriesApi.create(habitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(variables.habitId),
      });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });

      toast({
        title: "Entry Recorded",
        description: "Your progress has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Record Entry",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to update an entry
 */
export const useUpdateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      habitId,
      entryId,
      data,
    }: {
      habitId: string;
      entryId: string;
      data: UpdateEntryRequest;
    }) => entriesApi.update(habitId, entryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(variables.habitId),
      });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });

      toast({
        title: "Entry Updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Entry",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to bulk create/update entries
 */
export const useBulkUpsertEntries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkEntriesRequest) => entriesApi.bulkUpsert(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: habitKeys.all });

      const { created, updated, failed } = response;
      const total = created + updated;

      if (failed > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `${total} entries saved, ${failed} failed.`,
        });
      } else {
        toast({
          title: "Entries Saved",
          description: `${total} entries have been saved successfully.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Save Entries",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to delete an entry
 */
export const useDeleteEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, entryId }: { habitId: string; entryId: string }) =>
      entriesApi.delete(habitId, entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitKeys.detail(variables.habitId),
      });
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });

      toast({
        title: "Entry Deleted",
        description: "The entry has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Entry",
        description: error.message,
      });
    },
  });
};
