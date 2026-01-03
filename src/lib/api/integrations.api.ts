import { apiClient } from "./client";
import type {
  SheetsIntegration,
  ConnectSheetsRequest,
  SyncStatusResponse,
} from "./types";

export const integrationsApi = {
  /**
   * Connect Google Sheets integration
   */
  connectSheets: async (
    data: ConnectSheetsRequest
  ): Promise<{ integration: SheetsIntegration }> => {
    return apiClient.post<{ integration: SheetsIntegration }>(
      "/v1/integrations/sheets/connect",
      data
    );
  },

  /**
   * Get sync status
   */
  getSyncStatus: async (): Promise<SyncStatusResponse> => {
    return apiClient.get<SyncStatusResponse>("/v1/integrations/sheets/status");
  },

  /**
   * Trigger manual sync
   */
  syncNow: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/v1/integrations/sheets/sync");
  },

  /**
   * Disconnect Google Sheets integration
   */
  disconnectSheets: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      "/v1/integrations/sheets/disconnect"
    );
  },
};
