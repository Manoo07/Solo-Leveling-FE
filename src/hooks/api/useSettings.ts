import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import type { UpdateSettingsRequest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Query Keys
export const settingsKeys = {
  all: ["settings"] as const,
};

/**
 * Hook to get user settings
 */
export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: async () => {
      const response = await settingsApi.get();
      return response.settings;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update user settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => settingsApi.update(data),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.all, response.settings);

      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Settings",
        description: error.message,
      });
    },
  });
};
