import { apiClient } from "./client";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./types";

export const categoriesApi = {
  /**
   * Get all categories
   */
  list: async (): Promise<{ categories: Category[] }> => {
    return apiClient.get<{ categories: Category[] }>("/v1/categories");
  },

  /**
   * Get a single category by ID
   */
  getById: async (id: string): Promise<{ category: Category }> => {
    return apiClient.get<{ category: Category }>(`/v1/categories/${id}`);
  },

  /**
   * Create a new category
   */
  create: async (
    data: CreateCategoryRequest
  ): Promise<{ category: Category }> => {
    return apiClient.post<{ category: Category }>("/v1/categories", data);
  },

  /**
   * Update an existing category
   */
  update: async (
    id: string,
    data: UpdateCategoryRequest
  ): Promise<{ category: Category }> => {
    return apiClient.patch<{ category: Category }>(
      `/v1/categories/${id}`,
      data
    );
  },

  /**
   * Delete a category
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/v1/categories/${id}`);
  },
};
