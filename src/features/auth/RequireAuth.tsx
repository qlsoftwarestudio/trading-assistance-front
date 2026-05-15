import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ReactNode } from "react";

/** Requires a logged-in user. Redirects to /login otherwise. */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

/**
 * Requires a logged-in user that has completed onboarding (i.e. belongs to a tenant).
 * Used for all app routes (dashboard, trades, market, config…).
 */
export const RequireOnboarded = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!user.tenantId) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

/** Admin-only routes. */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!user.tenantId) return <Navigate to="/onboarding" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
};
