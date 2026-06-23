import { create } from "zustand";
import type { AuthResponse, BotUser } from "@/shared/types";
import { api } from "@/shared/api/client";

interface AvailableUser {
  userId: number;
  email: string;
  name?: string;
  botActive: boolean;
  capital: number;
}

/**
 * Auth store — Phase 1 (single-user, local auth).
 * No backend auth endpoint. Credentials validated client-side via env vars.
 * Phase 2: restore tenantId, availableUsers, selectUser, register.
 */
interface AuthState {
  user: BotUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  availableUsers: AvailableUser[];

  hydrate: () => void;
  login:   (email: string, password: string) => Promise<AuthResponse>;
  finalizeLogin: (res: AuthResponse) => void;
  logout:  () => void;
  selectUser: (userId: number) => Promise<AuthResponse>;
}

const getStoredAuth = (): { token: string | null; user: BotUser | null } => {
  try {
    const token = localStorage.getItem("tb_token");
    const userRaw = localStorage.getItem("tb_user");
    if (token && userRaw) return { token, user: JSON.parse(userRaw) as BotUser };
  } catch { /* ignore */ }
  return { token: null, user: null };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getStoredAuth(),
  loading: false,
  error: null,
  availableUsers: [],

  hydrate: () => {
    const { token, user } = getStoredAuth();
    if (token && user) set({ token, user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.login(email, password);
      if (res.twoFactorRequired) {
        set({ loading: false });
        return res;
      }
      const user: BotUser = { id: res.userId!, email: res.email!, role: "TRADER", active: true, plan: res.plan as any };
      localStorage.setItem("tb_token", res.token!);
      localStorage.setItem("tb_user", JSON.stringify(user));
      set({ token: res.token!, user, loading: false });
      return res;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Login failed" });
      throw e;
    }
  },

  finalizeLogin: (res) => {
    const user: BotUser = { id: res.userId!, email: res.email!, role: "TRADER", active: true, plan: res.plan as any };
    localStorage.setItem("tb_token", res.token!);
    localStorage.setItem("tb_user", JSON.stringify(user));
    set({ token: res.token!, user, loading: false });
  },

  logout: () => {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    set({ token: null, user: null, availableUsers: [] });
  },

  selectUser: async (userId: number) => {
    const userRaw = localStorage.getItem("tb_user");
    if (!userRaw) throw new Error("No hay sesión activa");
    const user = JSON.parse(userRaw) as BotUser;
    if (user.id !== userId) throw new Error("Usuario no encontrado");
    const res: AuthResponse = { token: localStorage.getItem("tb_token") ?? "local-phase1", email: user.email, role: user.role, userId: user.id };
    return res;
  },
}));
