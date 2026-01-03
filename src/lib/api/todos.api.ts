import { apiClient } from "./client";
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodosResponse,
  TodoFilters,
} from "./types";

export const todosApi = {
  /**
   * Get all todos for the current user with optional filters
   */
  getTodos: async (filters?: TodoFilters): Promise<TodosResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.completed !== undefined) {
      params.append('completed', String(filters.completed));
    }
    if (filters?.priority) {
      params.append('priority', filters.priority);
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }

    const queryString = params.toString();
    const url = `/v1/todos${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TodosResponse>(url);
  },

  /**
   * Create a new todo
   */
  createTodo: async (data: CreateTodoRequest): Promise<Todo> => {
    return await apiClient.post<Todo>('/v1/todos', data);
  },

  /**
   * Update a todo
   */
  updateTodo: async (
    id: string,
    data: UpdateTodoRequest
  ): Promise<Todo> => {
    return await apiClient.patch<Todo>(`/v1/todos/${id}`, data);
  },

  /**
   * Delete a todo
   */
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/todos/${id}`);
  },

  /**
   * Toggle todo completion status
   */
  toggleTodo: async (id: string): Promise<Todo> => {
    return await apiClient.patch<Todo>(`/v1/todos/${id}/toggle`);
  },

  /**
   * Get a single todo by ID
   */
  getTodoById: async (id: string): Promise<Todo> => {
    return await apiClient.get<Todo>(`/v1/todos/${id}`);
  },
};
