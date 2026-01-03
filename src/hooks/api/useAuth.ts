import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, tokenManager } from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.user;
    },
    enabled: !!tokenManager.getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

/**
 * Hook to register a new user
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      tokenManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );
      queryClient.setQueryData(authKeys.currentUser(), response.user);

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });

      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to login
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      tokenManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );
      queryClient.setQueryData(authKeys.currentUser(), response.user);

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });

      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      authApi.logout();
    },
    onSuccess: () => {
      queryClient.clear();

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });

      navigate("/login");
    },
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  return !!tokenManager.getAccessToken();
};
