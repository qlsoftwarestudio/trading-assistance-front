import { create } from "zustand";
import type { AuthResponse, AvailableUser, BotUser, Plan } from "@/shared/types";
import { api } from "@/shared/api/client";

/**
 * Auth state mirrors the QL Trading Bot login response. Multi-bot tenants
 * (Enterprise) get an `availableUsers` list and can switch the active bot
 * via POST /auth/select-user without logging out.
 */
interface AuthState {
  // Identity
  user: BotUser | null;          // currently selected user (= active bot)
  token: string | null;
  refreshToken: string | null;

  // Tenant context
  tenantId: number | null;
  availableUsers: AvailableUser[];   // empty when usersInTenant <= 1
  requiresUserSelection: boolean;

  // UX
  loading: boolean;
  error: string | null;

  // Actions
  hydrate: () => void;
  login:    (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, plan?: Plan) => Promise<AuthResponse>;
  selectUser: (userId: number) => Promise<BotUser>;
  setUser:  (user: BotUser) => void;
  logout:   () => void;
}

const persist = (token: string, user: BotUser, refreshToken?: string | null) => {
  localStorage.setItem("tb_token", token);
  localStorage.setItem("tb_user", JSON.stringify(user));
  if (refreshToken) localStorage.setItem("tb_refresh", refreshToken);
  if (user.tenantId != null) localStorage.setItem("tb_tenantId", String(user.tenantId));
  localStorage.setItem("tb_userId", String(user.id));
};

const persistAvailable = (available: AvailableUser[], requiresUserSelection: boolean) => {
  localStorage.setItem("tb_available_users", JSON.stringify(available ?? []));
  localStorage.setItem("tb_requires_selection", requiresUserSelection ? "1" : "0");
};

const userFromAuth = (auth: AuthResponse, fallback?: BotUser | null): BotUser => ({
  id: auth.selectedUserId ?? auth.userId,
  tenantId: auth.tenantId,
  tenantName: fallback?.tenantName ?? null,
  email: auth.email,
  role: auth.role,
  plan: auth.plan,
  botActive: fallback?.botActive ?? true,
  apiKeysConfigured: fallback?.apiKeysConfigured ?? false,
  telegramConfigured: auth.telegramConfigured,
  active: true,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  tenantId: null,
  availableUsers: [],
  requiresUserSelection: false,
  loading: false,
  error: null,

  hydrate: () => {
    const token = localStorage.getItem("tb_token");
    const refreshToken = localStorage.getItem("tb_refresh");
    const userRaw = localStorage.getItem("tb_user");
    const tenantId = localStorage.getItem("tb_tenantId");
    const availableRaw = localStorage.getItem("tb_available_users");
    const requires = localStorage.getItem("tb_requires_selection") === "1";
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as BotUser;
        const availableUsers: AvailableUser[] = availableRaw ? JSON.parse(availableRaw) : [];
        set({
          token,
          refreshToken,
          user,
          tenantId: tenantId ? parseInt(tenantId, 10) : user.tenantId,
          availableUsers,
          requiresUserSelection: requires,
        });
      } catch { /* ignore */ }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.login(email, password);
      const initialUser = userFromAuth(res);
      persist(res.token, initialUser, res.refreshToken);
      set({
        token: res.token,
        refreshToken: res.refreshToken ?? null,
        user: initialUser,
        tenantId: res.tenantId,
        availableUsers: res.availableUsers ?? [],
        requiresUserSelection: res.requiresUserSelection,
        loading: false,
      });
      persistAvailable(res.availableUsers ?? [], res.requiresUserSelection);
      return res;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Login failed" });
      throw e;
    }
  },

  register: async (email, password, plan = "FREE") => {
    set({ loading: true, error: null });
    try {
      const res = await api.register(email, password, plan);
      const initialUser = userFromAuth(res.auth);
      persist(res.auth.token, initialUser, res.auth.refreshToken);
      set({
        token: res.auth.token,
        refreshToken: res.auth.refreshToken ?? null,
        user: initialUser,
        tenantId: res.auth.tenantId,
        availableUsers: res.auth.availableUsers ?? [],
        requiresUserSelection: res.auth.requiresUserSelection,
        loading: false,
      });
      persistAvailable(res.auth.availableUsers ?? [], res.auth.requiresUserSelection);
      return res.auth;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Registration failed" });
      throw e;
    }
  },

  selectUser: async (userId) => {
    const res = await api.selectUser(userId);
    persist(res.newToken, res.user, get().refreshToken ?? undefined);
    set({ token: res.newToken, user: res.user });
    return res.user;
  },

  setUser: (user) => {
    const token = get().token ?? localStorage.getItem("tb_token") ?? "";
    if (token) persist(token, user, get().refreshToken ?? undefined);
    set({ user, tenantId: user.tenantId });
  },

  logout: () => {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    localStorage.removeItem("tb_refresh");
    localStorage.removeItem("tb_tenantId");
    localStorage.removeItem("tb_userId");
    localStorage.removeItem("tb_available_users");
    localStorage.removeItem("tb_requires_selection");
    set({ token: null, refreshToken: null, user: null, tenantId: null, availableUsers: [], requiresUserSelection: false });
  },
}));
