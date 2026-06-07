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
 * Phase 1: same as RequireAuth — tenant check removed.
 * Phase 2: restore `if (!user.tenantId) return <Navigate to="/onboarding" replace />`.
 */
export const RequireOnboarded = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

/** Admin-only routes. Phase 1: only checks role === "ADMIN". */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
};
