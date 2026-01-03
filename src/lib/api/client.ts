import { toast } from "@/components/ui/use-toast";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Token management
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },
};

// API Error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
    public requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

// HTTP Client
class HttpClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new ApiError(401, "UNAUTHORIZED", "No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new ApiError(401, "UNAUTHORIZED", "Failed to refresh token");
    }

    const data: ApiResponse<{
      tokens: { accessToken: string; refreshToken: string };
    }> = await response.json();

    if (data.success && data.data?.tokens) {
      tokenManager.setTokens(
        data.data.tokens.accessToken,
        data.data.tokens.refreshToken
      );
      return data.data.tokens.accessToken;
    }

    throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh response");
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = tokenManager.getAccessToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - Token refresh
      if (response.status === 401 && accessToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            await this.processQueue(null, newToken);

            // Retry original request with new token
            headers["Authorization"] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...options, headers });
            return this.handleResponse<T>(retryResponse);
          } catch (error) {
            this.isRefreshing = false;
            await this.processQueue(error as Error, null);
            tokenManager.clearTokens();
            window.location.href = "/login";
            throw error;
          }
        }

        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          headers["Authorization"] = `Bearer ${tokenManager.getAccessToken()}`;
          return fetch(url, { ...options, headers }).then((res) =>
            this.handleResponse<T>(res)
          );
        });
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network error
      toast({
        variant: "destructive",
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your internet connection.",
      });

      throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        response.status,
        "PARSE_ERROR",
        "Failed to parse response"
      );
    }

    if (!response.ok) {
      const error = new ApiError(
        response.status,
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || "An error occurred",
        data.error?.details,
        data.requestId
      );

      // Show error toast for non-auth errors
      if (response.status !== 401) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }

      throw error;
    }

    if (!data.success || !data.data) {
      throw new ApiError(
        response.status,
        "INVALID_RESPONSE",
        "Invalid response format"
      );
    }

    return data.data as T;
  }

  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new HttpClient(API_BASE_URL);
