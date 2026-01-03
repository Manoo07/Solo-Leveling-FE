import { apiClient } from "./client";
import type { UserSettings, UpdateSettingsRequest } from "./types";

export const settingsApi = {
  /**
   * Get user settings
   */
  get: async (): Promise<{ settings: UserSettings }> => {
    return apiClient.get<{ settings: UserSettings }>("/v1/settings");
  },

  /**
   * Update user settings
   */
  update: async (
    data: UpdateSettingsRequest
  ): Promise<{ settings: UserSettings }> => {
    return apiClient.patch<{ settings: UserSettings }>("/v1/settings", data);
  },
};
