import { apiClient } from "./client";
import type {
  Entry,
  CreateEntryRequest,
  UpdateEntryRequest,
  ListEntriesParams,
  BulkEntriesRequest,
  BulkEntriesResponse,
} from "./types";

export const entriesApi = {
  /**
   * Get all entries for a habit
   */
  list: async (
    habitId: string,
    params?: ListEntriesParams
  ): Promise<{ entries: Entry[] }> => {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const query = queryParams.toString();
    return apiClient.get<{ entries: Entry[] }>(
      `/v1/habits/${habitId}/entries${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get a single entry by ID
   */
  getById: async (habitId: string, entryId: string): Promise<{ entry: Entry }> => {
    return apiClient.get<{ entry: Entry }>(
      `/v1/habits/${habitId}/entries/${entryId}`
    );
  },

  /**
   * Create a new entry for a habit
   */
  create: async (
    habitId: string,
    data: CreateEntryRequest
  ): Promise<{ entry: Entry }> => {
    return apiClient.post<{ entry: Entry }>(
      `/v1/habits/${habitId}/entries`,
      data
    );
  },

  /**
   * Update an existing entry
   */
  update: async (
    habitId: string,
    entryId: string,
    data: UpdateEntryRequest
  ): Promise<{ entry: Entry }> => {
    return apiClient.patch<{ entry: Entry }>(
      `/v1/habits/${habitId}/entries/${entryId}`,
      data
    );
  },

  /**
   * Bulk create or update entries
   */
  bulkUpsert: async (
    data: BulkEntriesRequest
  ): Promise<BulkEntriesResponse> => {
    return apiClient.post<BulkEntriesResponse>("/v1/entries/bulk", data);
  },

  /**
   * Delete an entry
   */
  delete: async (habitId: string, entryId: string): Promise<void> => {
    return apiClient.delete<void>(`/v1/habits/${habitId}/entries/${entryId}`);
  },
};
