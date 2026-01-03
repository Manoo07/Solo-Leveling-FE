import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@/hooks/api";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Component that redirects authenticated users away from public pages
 * (like login/register) to the main app
 */
export function PublicRoute({ children, redirectTo = "/" }: PublicRouteProps) {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
