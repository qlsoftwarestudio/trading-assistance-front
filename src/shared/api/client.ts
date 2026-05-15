// Single API client. Uses the real backend if VITE_API_URL is set and
// VITE_USE_MOCKS != "true". Otherwise routes calls to the in-memory mock.
//
// Backend contract: see API_DOC_TRADING_BOT.md (QL Trading Bot v1).
//   Base URL  -> ${VITE_API_URL}/api/v1
//   WebSocket -> ${VITE_WS_URL}/ws/market?token=&tenantId=&userId=
//   Headers   -> Authorization: Bearer <jwt>
//                X-Tenant-ID:   <tenantId>
//                X-User-ID:     <userId>   (optional; admins use it to scope)

import axios, { type AxiosInstance } from "axios";
import { mockApi } from "./mockData";
import type {
  AuthResponse,
  BotConfig,
  BotUser,
  Candle,
  EquityPoint,
  MarketCondition,
  Page,
  PlatformMetrics,
  Plan,
  PortfolioSnapshot,
  RegisterResponse,
  Role,
  StrategyKind,
  StrategySwitch,
  Tenant,
  TenantWithUsers,
  Trade,
  TradeStatistics,
  TradeStatus,
} from "@/shared/types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const USE_MOCKS = !API_URL || import.meta.env.VITE_USE_MOCKS === "true";
export const isMockMode = USE_MOCKS;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL ? `${API_URL}/api/v1` : "/api/v1",
  timeout: 15_000,
});

axiosInstance.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("tb_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  const tenantId = localStorage.getItem("tb_tenantId");
  if (tenantId) cfg.headers["X-Tenant-ID"] = tenantId;
  const userId = localStorage.getItem("tb_userId");
  if (userId) cfg.headers["X-User-ID"] = userId;
  return cfg;
});

axiosInstance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      localStorage.removeItem("tb_tenantId");
      localStorage.removeItem("tb_userId");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

const get  = <T>(url: string, params?: Record<string, unknown>) => axiosInstance.get<T>(url, { params }).then((r) => r.data);
const post = <T>(url: string, body?: unknown) => axiosInstance.post<T>(url, body).then((r) => r.data);
const put  = <T>(url: string, body?: unknown) => axiosInstance.put<T>(url, body).then((r) => r.data);
const del  = <T>(url: string) => axiosInstance.delete<T>(url).then((r) => r.data);

export interface TradesQuery {
  status?: TradeStatus | "ALL";
  symbol?: string;
  strategy?: StrategyKind;
  page?: number;   // 0-based (Spring Page)
  size?: number;
  from?: string;
  to?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name?: string;
  role: Role;
  telegramChatId?: string;
}

export const api = {
  // -------- Auth --------
  login: (email: string, password: string): Promise<AuthResponse> =>
    USE_MOCKS ? mockApi.login(email, password) : post("/auth/login", { email, password }),

  register: (email: string, password: string, plan: Plan = "FREE"): Promise<RegisterResponse> =>
    USE_MOCKS ? mockApi.register(email, password, plan) : post("/auth/register", { email, password, confirmPassword: password, plan }),

  refresh: (refreshToken: string): Promise<{ token: string; expiresAt: string }> =>
    USE_MOCKS ? mockApi.refresh(refreshToken) : post("/auth/refresh", { refreshToken }),

  selectUser: (userId: number): Promise<{ newToken: string; selectedUserId: number; user: BotUser }> =>
    USE_MOCKS ? mockApi.selectUser(userId) : post("/auth/select-user", { userId }),

  // -------- Onboarding (mock-only convenience: creates the very first tenant
  // for self-signup users). The real backend already creates a tenant during
  // POST /auth/register, so this becomes a no-op when API_URL is set.
  createTenant: (payload: { name: string; plan: Plan }): Promise<BotUser> =>
    USE_MOCKS ? mockApi.createTenant(payload) : post("/tenants", payload),

  // -------- Users (multi-bot tenants) --------
  getUsers: (): Promise<BotUser[]> =>
    USE_MOCKS ? mockApi.getUsers() : get<{ users: BotUser[] }>("/users").then((r) => r.users),

  createUser: (payload: CreateUserPayload): Promise<BotUser> =>
    USE_MOCKS ? mockApi.createUser(payload) : post("/users", payload),

  updateUser: (userId: number, payload: Partial<Pick<BotUser, "name" | "telegramChatId" | "role" | "active">>): Promise<BotUser> =>
    USE_MOCKS ? mockApi.updateUser(userId, payload) : put(`/users/${userId}`, payload),

  deleteUser: (userId: number): Promise<{ ok: true }> =>
    USE_MOCKS ? mockApi.deleteUser(userId) : del(`/users/${userId}`),

  // -------- Portfolio --------
  getPortfolio: (): Promise<PortfolioSnapshot> => USE_MOCKS ? mockApi.getPortfolio() : get("/portfolio"),
  getEquity:    (params: { from?: string; to?: string; interval?: "hourly" | "daily" | "weekly" } = {}): Promise<EquityPoint[]> =>
    USE_MOCKS ? mockApi.getEquity() : get<{ data: EquityPoint[] }>("/portfolio/equity", params).then((r) => r.data),

  // -------- Trades --------
  getTrades: (params: TradesQuery = {}): Promise<Page<Trade>> =>
    USE_MOCKS ? mockApi.getTrades(params) : get("/trades", { ...params, status: params.status === "ALL" ? undefined : params.status }),
  getTrade: (id: number): Promise<Trade> => USE_MOCKS ? mockApi.getTrade(id) : get(`/trades/${id}`),
  getTradeStats: (params: { from?: string; to?: string } = {}): Promise<TradeStatistics> =>
    USE_MOCKS ? mockApi.getTradeStats(params) : get("/trades/statistics", params),

  // -------- Market --------
  getMarket: (symbol = "BTCUSDT"): Promise<MarketCondition> =>
    USE_MOCKS ? mockApi.getMarket(symbol) : get("/market/current", { symbol }),
  getCandles: (params: { symbol: string; interval?: string; limit?: number }): Promise<{ symbol: string; interval: string; candles: Candle[] }> =>
    USE_MOCKS ? mockApi.getCandles(params) : get("/market/candles", params),

  // -------- Config --------
  getConfig: (): Promise<BotConfig> => USE_MOCKS ? mockApi.getConfig() : get("/config"),
  updateConfig: (next: Partial<BotConfig>): Promise<BotConfig> =>
    USE_MOCKS ? mockApi.updateConfig(next) : put("/config", next),
  saveApiKeys: (payload: { apiKey: string; apiSecret: string; testnet?: boolean }) =>
    USE_MOCKS ? mockApi.saveApiKeys(payload) : post<{ ok: true; testnet: boolean; validated: boolean }>("/config/apikeys", payload),
  testConnection: () => USE_MOCKS ? mockApi.testConnection() : post<{ success: boolean; latency: number }>("/config/test-connection"),
  toggleBot: (active: boolean) => USE_MOCKS ? mockApi.toggleBot(active) : post<{ botActive: boolean }>("/config/toggle", { active }),

  // -------- Strategies --------
  getStrategySwitches: (params: { page?: number; size?: number } = {}): Promise<Page<StrategySwitch>> =>
    USE_MOCKS ? mockApi.getStrategySwitches(params) : get("/strategies/switches", params),
  forceStrategy: (strategy: StrategyKind, reason = "Cambio manual desde panel"): Promise<{ newStrategy: StrategyKind }> =>
    USE_MOCKS ? mockApi.forceStrategy(strategy, reason) : post("/strategies/switch", { strategy, reason }),

  // -------- Admin (super) --------
  getTenants: (): Promise<TenantWithUsers[]> =>
    USE_MOCKS ? mockApi.getTenants() : get<{ content: TenantWithUsers[] }>("/admin/tenants").then((r) => r.content),
  getTenant: (tenantId: number): Promise<TenantWithUsers> =>
    USE_MOCKS ? mockApi.getTenant(tenantId) : get(`/admin/tenants/${tenantId}`),
  getPlatformMetrics: (): Promise<PlatformMetrics> =>
    USE_MOCKS ? mockApi.getPlatformMetrics() : get("/admin/metrics"),
  setTenantPlan: (tenantId: number, plan: Plan): Promise<Tenant> =>
    USE_MOCKS ? mockApi.setTenantPlan(tenantId, plan) : put(`/admin/tenants/${tenantId}/plan`, { plan, immediate: true }),
  toggleTenant: (tenantId: number, active: boolean, reason?: string) =>
    USE_MOCKS ? mockApi.toggleTenant(tenantId, active) : post(`/admin/tenants/${tenantId}/toggle`, { active, reason }),
};
