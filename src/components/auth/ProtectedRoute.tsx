import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser, useIsAuthenticated } from "@/hooks/api";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { isLoading, error } = useCurrentUser();

  // Show loading spinner while checking authentication
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or error occurred, redirect to login
  if (!isAuthenticated || error) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
