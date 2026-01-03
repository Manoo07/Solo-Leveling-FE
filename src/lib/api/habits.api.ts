import { apiClient } from "./client";
import type {
  Habit,
  CreateHabitRequest,
  UpdateHabitRequest,
  ListHabitsParams,
  ArchiveHabitRequest,
} from "./types";

export const habitsApi = {
  /**
   * Get all habits with optional filters
   */
  list: async (params?: ListHabitsParams): Promise<{ habits: Habit[] }> => {
    const queryParams = new URLSearchParams();

    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);

    const query = queryParams.toString();
    return apiClient.get<{ habits: Habit[] }>(
      `/v1/habits${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get a single habit by ID
   */
  getById: async (id: string): Promise<{ habit: Habit }> => {
    return apiClient.get<{ habit: Habit }>(`/v1/habits/${id}`);
  },

  /**
   * Create a new habit
   */
  create: async (data: CreateHabitRequest): Promise<{ habit: Habit }> => {
    return apiClient.post<{ habit: Habit }>("/v1/habits", data);
  },

  /**
   * Update an existing habit
   */
  update: async (
    id: string,
    data: UpdateHabitRequest
  ): Promise<{ habit: Habit }> => {
    return apiClient.patch<{ habit: Habit }>(`/v1/habits/${id}`, data);
  },

  /**
   * Archive or unarchive a habit
   */
  archive: async (
    id: string,
    data: ArchiveHabitRequest
  ): Promise<{ habit: Habit }> => {
    return apiClient.post<{ habit: Habit }>(`/v1/habits/${id}/archive`, data);
  },

  /**
   * Delete a habit permanently
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/v1/habits/${id}`);
  },
};
