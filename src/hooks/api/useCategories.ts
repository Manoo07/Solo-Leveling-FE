import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await categoriesApi.list();
      
      const seen = new Set<string>();
      const uniqueCategories = response.categories.filter(cat => {
        if (seen.has(cat.id)) {
          return false;
        }
        seen.add(cat.id);
        return true;
      });
      
      return uniqueCategories;
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get a single category by ID
 */
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await categoriesApi.getById(id);
      return response.category;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      toast({
        title: "Category Created",
        description: `"${response.category.name}" has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Category",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });

      toast({
        title: "Category Updated",
        description: `"${response.category.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Category",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });

      toast({
        title: "Category Deleted",
        description: "The category has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Category",
        description: error.message,
      });
    },
  });
};
