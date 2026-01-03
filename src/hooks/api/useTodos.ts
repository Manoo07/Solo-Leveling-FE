import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todosApi } from "@/lib/api/todos.api";
import type { CreateTodoRequest, UpdateTodoRequest, TodoFilters } from "@/lib/api/types";

// Query keys
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters?: TodoFilters) => [...todoKeys.lists(), filters] as const,
};

/**
 * Get all todos with filters, sorting, and pagination
 */
export const useTodos = (filters?: TodoFilters) => {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: async () => {
      const response = await todosApi.getTodos(filters);
      return response; // Return full response with pagination
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Create a new todo
 */
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};

/**
 * Update a todo
 */
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todosApi.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};

/**
 * Delete a todo
 */
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};

/**
 * Toggle todo completion
 */
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.toggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};
