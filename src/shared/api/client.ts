// Single API client — Phase 1.
// Routes all data calls to the real trading-assistant backend under /api.
// Auth is handled locally (no backend auth endpoint in Phase 1).
// Falls back to in-memory mock when VITE_API_URL is not set.
//
// Backend contract: see /home/emilio/.windsurf/plans/phase1-api-doc.md
//   Base URL  -> ${VITE_API_URL}/api
//   Auth      -> local env-var check (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD)
//   Phase 2   -> will add Authorization: Bearer <jwt> + /api/v1 prefix

import axios, { type AxiosInstance } from "axios";
import type {
  AdminHealth,
  AuthResponse,
  BacktestResult,
  BotUser,
  DailyMetrics,
  DashboardSummary,
  EquityPoint,
  Page,
  RejectionHeatmapItem,
  SetupPerformance,
  Signal,
  StrategyConfig,
  StrategyStatus,
  SymbolComparison,
  Trade,
  TradeStatus,
  UnifiedSignal,
} from "@/shared/types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? "admin@trading.local";
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "admin123";

export const isMockMode = !API_URL || import.meta.env.VITE_USE_MOCKS === "true";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
  timeout: 15_000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("tb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

const get  = <T>(url: string, params?: Record<string, unknown>) =>
  axiosInstance.get<T>(url, { params }).then((r) => r.data);
const post = <T>(url: string, body?: unknown) =>
  axiosInstance.post<T>(url, body).then((r) => r.data);

export interface TradesQuery {
  status?: TradeStatus | "ALL";
  symbol?: string;
  page?: number;
  size?: number;
}

// ---------------------------------------------------------------------------
// Mock helpers — used when VITE_API_URL is not set
// ---------------------------------------------------------------------------
const NOW = Date.now();

const mockSummary: DashboardSummary = {
  balance: 1234.56, totalTrades: 12, winningTrades: 9, losingTrades: 3,
  openTrades: 1, winRate: 75.0, totalPnl: 87.45, profitFactor: 2.4, currentPrice: 28.55,
};

const mockSignals: Signal[] = [
  { id: 1, symbol: "HYPEUSDT", action: "LONG", price: 28.12, rsi: 27.4, momentum: 1.2,
    inBuyZone: true, inSellZone: false, generatedAt: new Date(NOW - 900_000).toISOString(),
    executed: true, tradeId: 1, trend1h: "UP", trend4h: "UP", trend1d: "UP", confluence: true, relativeVolume: 1.35 },
  { id: 2, symbol: "HYPEUSDT", action: "HOLD", price: 28.55, rsi: 48.2, momentum: 0.3,
    inBuyZone: false, inSellZone: false, generatedAt: new Date(NOW - 1_800_000).toISOString(),
    executed: false, trend1h: "SIDEWAYS", trend4h: "UP", trend1d: "UP", confluence: false, relativeVolume: 0.9 },
];

const mockTrades: Trade[] = [
  { id: 1, symbol: "HYPEUSDT", action: "LONG", entryPrice: 28.12, exitPrice: 29.24,
    quantity: 35.12, investedAmount: 987.65, entryTime: new Date(NOW - 3_600_000).toISOString(),
    exitTime: new Date(NOW - 1_800_000).toISOString(), stopLoss: 27.56, takeProfit: 29.24,
    pnl: 39.33, pnlPercent: 3.98, status: "CLOSED", exitReason: "TAKE_PROFIT", commission: 0.12 },
  { id: 2, symbol: "HYPEUSDT", action: "LONG", entryPrice: 27.80, quantity: 35.97,
    investedAmount: 1000.0, entryTime: new Date(NOW - 600_000).toISOString(),
    stopLoss: 27.24, takeProfit: 28.96, status: "OPEN" },
];

const mockConfig: StrategyConfig = {
  symbols: "EURUSD,GBPUSD,USDJPY", symbol: "EURUSD", timeframe: "5m", enabled: true,
  rsiLength: 7, rsiOversold: 30, rsiOverbought: 70,
  lookbackBars: 12, killzoneThreshold: 1.0, minMomentum: 0.8,
  stopLossPct: 0.6, takeProfitPct: 1.2, positionSizePct: 10.0,
  leverage: 5, maxConcurrentTrades: 2, maxHoldMinutes: 45,
  useAtrStop: true, atrPeriod: 10, atrMultiplier: 1.5,
  trailingStopPct: 0.6, trailingActivationPct: 0.4, breakevenActivationPct: 0.25,
  slCooldownMinutes: 10, maxDailyLossPct: 5.0,
  contextEnabled: true, requireConfluence: false, requireVolume: false, minVolumeRatio: 1.2,
  useHtfStructureFilter: true, htfTimeframe: "1h", htfPivotStrength: 3,
  useOrderBlockFilter: true, obPivotStrength: 2, obDisplacementAtr: 1.5, obMaxBlocks: 5,
  useStructuralSl: true, rrMinRatio: 2.0,
  autoAdjust: false, autoAdjustEnabled: true, autoAdjustMinTrades: 20, autoAdjustWinRateThreshold: 0.30,
  telegramEnabled: false, binanceTestnet: true,
};

const mockHealth: AdminHealth = {
  strategyEnabled: true, symbol: "HYPEUSDT", timeframe: "15m",
  openTrades: 1, totalTrades: 12, lastSignalAt: new Date(NOW - 900_000).toISOString(),
  telegramEnabled: false, binanceTestnet: true, uptime: "2h 15m",
};

const mockMetrics: DailyMetrics = {
  id: 1, date: new Date().toISOString().slice(0, 10), totalTrades: 12,
  winningTrades: 9, losingTrades: 3, totalPnl: 87.45, winRate: 75.0,
  profitFactor: 2.4, maxDrawdown: 3.2,
};

const mockMetricsHistory: DailyMetrics[] = [
  { id: 8,  date: "2026-06-14", totalTrades: 4,  winningTrades: 3,  losingTrades: 1,  totalPnl: 24.54,  winRate: 75.00, profitFactor: 18.56, maxDrawdown: 0 },
  { id: 9,  date: "2026-06-15", totalTrades: 17, winningTrades: 10, losingTrades: 7,  totalPnl: 34.49,  winRate: 58.82, profitFactor: 2.43,  maxDrawdown: 0 },
  { id: 10, date: "2026-06-16", totalTrades: 23, winningTrades: 14, losingTrades: 9,  totalPnl: 63.58,  winRate: 60.87, profitFactor: 2.85,  maxDrawdown: 0 },
  { id: 11, date: "2026-06-17", totalTrades: 33, winningTrades: 21, losingTrades: 12, totalPnl: 126.05, winRate: 63.64, profitFactor: 4.28,  maxDrawdown: 0 },
];

const mockEquity: EquityPoint[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(NOW - (23 - i) * 3_600_000).toISOString(),
  balance: 1150 + i * 3.5 + (Math.random() - 0.4) * 15,
  pnl: i * 3.5,
}));

// ---------------------------------------------------------------------------
// Auth helper — local validation (no backend call in Phase 1)
// ---------------------------------------------------------------------------
function localLogin(email: string, password: string): AuthResponse {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    throw new Error("Credenciales inválidas");
  }
  return {
    token: "local-phase1",
    email: email.trim(),
    role: "ADMIN",
    userId: 1,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const api = {
  // -------- Auth --------
  login: (email: string, password: string): Promise<AuthResponse> =>
    isMockMode
      ? Promise.resolve({ token: "local-phase1", email, role: "ADMIN", userId: 1, plan: "FREE", maxBots: 1 })
      : post<AuthResponse>("/auth/login", { email, password }),

  register: (email: string, password: string, plan: string = "FREE"): Promise<AuthResponse> =>
    isMockMode
      ? Promise.resolve({ token: "local-phase1", email, role: "ADMIN", userId: 1, plan, maxBots: 1 })
      : post<AuthResponse>("/auth/register", { email, password, plan }),

  validate2fa: (tempToken: string, otp: string): Promise<AuthResponse> =>
    post<AuthResponse>("/auth/2fa/validate", { tempToken, otp }),

  // -------- Dashboard --------
  getDashboardSummary: (): Promise<DashboardSummary> =>
    isMockMode ? Promise.resolve(mockSummary) : get<DashboardSummary>("/dashboard/summary"),

  getEquity: (): Promise<EquityPoint[]> =>
    isMockMode ? Promise.resolve(mockEquity) : get<EquityPoint[]>("/dashboard/equity").catch(() => []),

  getTrades: (params: TradesQuery = {}): Promise<Page<Trade>> => {
    if (isMockMode) {
      const filtered = params.status && params.status !== "ALL"
        ? mockTrades.filter((t) => t.status === params.status)
        : mockTrades;
      const page = params.page ?? 0;
      const size = params.size ?? 20;
      const slice = filtered.slice(page * size, page * size + size);
      return Promise.resolve({ content: slice, totalElements: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / size)), size, number: page, first: page === 0, last: true });
    }
    const p: Record<string, unknown> = { page: params.page ?? 0, size: params.size ?? 20 };
    if (params.status && params.status !== "ALL") p.status = params.status;
    if (params.symbol && params.symbol !== "ALL") p.symbol = params.symbol;
    return get<Page<Trade>>("/dashboard/trades", p);
  },

  getOpenTrades: (): Promise<Trade[]> =>
    isMockMode
      ? Promise.resolve(mockTrades.filter((t) => t.status === "OPEN"))
      : get<Trade[]>("/dashboard/trades/open"),

  getSignals: (): Promise<Signal[]> =>
    isMockMode ? Promise.resolve(mockSignals) : get<Signal[]>("/dashboard/signals"),

  getAllSignals: (symbol?: string, hours = 24): Promise<UnifiedSignal[]> =>
    isMockMode
      ? Promise.resolve([
          { id: 1, symbol: "SOLUSDT", action: "LONG", price: 72.85, rsi: 14.2, setupType: "Mean-Reversion", status: "REJECTED", timestamp: new Date(Date.now() - 3_600_000).toISOString(), rejectionReason: "STOCH_BB_FILTER: stochK=14.2, lowerBandGap=0.35%", executed: false },
          { id: 2, symbol: "SOLUSDT", action: "SHORT", price: 74.39, rsi: 86.5, setupType: "Breakout", status: "ACCEPTED", timestamp: new Date(Date.now() - 1_800_000).toISOString(), executed: true, bbUpper: 74.39, bbLower: 72.85, stochK5m: 86.5 },
        ])
      : get<UnifiedSignal[]>("/dashboard/signals/all", { symbol, hours }),

  getDailyMetrics: (): Promise<DailyMetrics | null> =>
    isMockMode ? Promise.resolve(mockMetrics) : get<DailyMetrics>("/dashboard/metrics").catch(() => null),

  getAllDailyMetrics: (): Promise<DailyMetrics[]> =>
    isMockMode ? Promise.resolve(mockMetricsHistory) : get<DailyMetrics[]>("/dashboard/metrics/history").catch(() => []),

  // -------- Bots --------
  getBots: (): Promise<Array<{ id: number; name: string; symbol: string; enabled: boolean; running: boolean }>> =>
    get<Array<{ id: number; name: string; symbol: string; enabled: boolean; running: boolean }>>("/bots"),

  createBot: (data: { name: string; symbol: string; apiKey: string; apiSecret: string }): Promise<{ id: number; message: string }> =>
    post<{ id: number; message: string }>("/bots", data),

  toggleBot: (id: number): Promise<{ id: number; running: boolean; message: string }> =>
    post<{ id: number; running: boolean; message: string }>(`/bots/${id}/toggle`),

  deleteBot: (id: number): Promise<{ message: string }> =>
    axiosInstance.delete<{ message: string }>(`/bots/${id}`).then((r) => r.data),

  // -------- Strategy --------
  getStrategyStatus: (): Promise<StrategyStatus> =>
    isMockMode
      ? Promise.resolve({
          swing: { running: true, description: "HYPEUSDT 15m | Enabled: true | Running: true" },
          hunter: { running: false },
          timestamp: new Date().toISOString(),
        })
      : get<StrategyStatus>("/strategy/status"),

  toggleSwing: (): Promise<{ swingRunning: boolean; message: string; timestamp: string }> =>
    isMockMode
      ? Promise.resolve({ swingRunning: true, message: "Swing toggled (mock)", timestamp: new Date().toISOString() })
      : post<{ swingRunning: boolean; message: string; timestamp: string }>("/strategy/toggle"),

  toggleHunter: (): Promise<{ hunterRunning: boolean; message: string; timestamp: string }> =>
    isMockMode
      ? Promise.resolve({ hunterRunning: false, message: "Hunter toggled (mock)", timestamp: new Date().toISOString() })
      : post<{ hunterRunning: boolean; message: string; timestamp: string }>("/strategy/hunter/toggle"),

  executeStrategy: (): Promise<{ message: string; timestamp: string }> =>
    isMockMode
      ? Promise.resolve({ message: "Strategy executed (mock)", timestamp: new Date().toISOString() })
      : post<{ message: string; timestamp: string }>("/strategy/execute"),

  monitorTrades: (): Promise<{ message: string; timestamp: string }> =>
    isMockMode
      ? Promise.resolve({ message: "Trade monitoring executed (mock)", timestamp: new Date().toISOString() })
      : post<{ message: string; timestamp: string }>("/trades/monitor"),

  // -------- Backtest --------
  runBacktest: (limit = 500): Promise<BacktestResult> =>
    isMockMode
      ? Promise.resolve({ symbol: "HYPEUSDT", timeframe: "15m", totalTrades: 48, winningTrades: 34, losingTrades: 14, totalPnl: 287.45, grossProfit: 412.1, grossLoss: 124.65, winRate: 0.708, profitFactor: 3.31, maxDrawdownPct: 8.45, sharpeRatio: 1.23, trades: [] })
      : post<BacktestResult>(`/backtest?limit=${limit}`),

  runWalkForwardBacktest: (limit = 500): Promise<BacktestResult> =>
    isMockMode
      ? Promise.resolve({ symbol: "HYPEUSDT", timeframe: "15m", totalTrades: 22, winningTrades: 15, losingTrades: 7, totalPnl: 112.3, grossProfit: 187.4, grossLoss: 75.1, winRate: 0.682, profitFactor: 2.49, maxDrawdownPct: 11.2, sharpeRatio: 0.98, trades: [] })
      : post<BacktestResult>(`/backtest/walk-forward?limit=${limit}`),

  // -------- Admin --------
  getAdminConfig: (): Promise<StrategyConfig> =>
    isMockMode ? Promise.resolve(mockConfig) : get<StrategyConfig>("/admin/config"),

  getAdminHealth: (): Promise<AdminHealth> =>
    isMockMode ? Promise.resolve(mockHealth) : get<AdminHealth>("/admin/health"),

  // -------- Telegram --------
  testTelegram: (): Promise<{ message: string; timestamp: string }> =>
    isMockMode
      ? Promise.resolve({ message: "Test notification sent (mock)", timestamp: new Date().toISOString() })
      : post<{ message: string; timestamp: string }>("/telegram/test"),

  // -------- Analytics (Phase 3.2 + 3.3) --------
  getSetupPerformance: (days = 7): Promise<SetupPerformance[]> =>
    isMockMode ? Promise.resolve([]) : get<SetupPerformance[]>("/dashboard/setup-performance", { days }),

  getRejectionHeatmap: (days = 7): Promise<RejectionHeatmapItem[]> =>
    isMockMode ? Promise.resolve([]) : get<RejectionHeatmapItem[]>("/dashboard/rejection-heatmap", { days }),

  getSymbolComparison: (): Promise<SymbolComparison[]> =>
    isMockMode ? Promise.resolve([]) : get<SymbolComparison[]>("/dashboard/symbol-comparison"),

  // -------- Health --------
  getHealth: (): Promise<{ status: string; service: string; version: string }> =>
    get("/health"),

};
