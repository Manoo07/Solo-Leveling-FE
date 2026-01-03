import { apiClient, tokenManager } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  User,
} from "./types";

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/v1/auth/register", data);
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/v1/auth/login", data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<{ tokens: AuthResponse["tokens"] }> => {
    return apiClient.post<{ tokens: AuthResponse["tokens"] }>(
      "/v1/auth/refresh",
      data
    );
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>("/v1/auth/me");
  },

  /**
   * Logout user - invalidate refresh token on server
   */
  logout: async (): Promise<void> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post<void>("/v1/auth/logout", { refreshToken });
      } catch (error) {
        // Ignore errors during logout
        console.error("Logout error:", error);
      }
    }
    tokenManager.clearTokens();
  },
};
