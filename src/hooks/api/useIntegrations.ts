import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationsApi } from "@/lib/api";
import type { ConnectSheetsRequest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Query Keys
export const integrationKeys = {
  all: ["integrations"] as const,
  sheets: () => [...integrationKeys.all, "sheets"] as const,
  syncStatus: () => [...integrationKeys.sheets(), "status"] as const,
};

/**
 * Hook to get Google Sheets sync status
 */
export const useSyncStatus = () => {
  return useQuery({
    queryKey: integrationKeys.syncStatus(),
    queryFn: () => integrationsApi.getSyncStatus(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to connect Google Sheets
 */
export const useConnectSheets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectSheetsRequest) =>
      integrationsApi.connectSheets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.sheets() });

      toast({
        title: "Google Sheets Connected",
        description: "Your habits will now sync with Google Sheets.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Connect",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to trigger manual sync
 */
export const useSyncNow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => integrationsApi.syncNow(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.syncStatus() });

      toast({
        title: "Sync Started",
        description: "Your data is being synced with Google Sheets.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to disconnect Google Sheets
 */
export const useDisconnectSheets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => integrationsApi.disconnectSheets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.sheets() });

      toast({
        title: "Disconnected",
        description: "Google Sheets integration has been disabled.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Disconnect",
        description: error.message,
      });
    },
  });
};
