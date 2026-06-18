// Domain types — aligned with the trading-assistant Spring Boot backend (Phase 1).
// Phase 2 multi-tenant types are kept as comments at the bottom for future reference.

// ---------- Enums ----------
export type TradeAction = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED";
export type ExitReason = "STOP_LOSS" | "TAKE_PROFIT" | "MANUAL";
export type TrendDirection = "UP" | "DOWN" | "SIDEWAYS";
export type Role = "TRADER" | "ADMIN";

// Kept for Phase 2 compatibility — not used by real backend in Phase 1
export type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export const PLAN_PRICE: Record<Plan, number> = { FREE: 0, STARTER: 29, PRO: 79, ENTERPRISE: 199 };
export const PLAN_LIMITS = {
  FREE:       { maxUsers: 1, maxCapitalUsd: 500,    autoSwitch: false, multiUser: false, prioritySupport: false },
  STARTER:    { maxUsers: 1, maxCapitalUsd: 500,    autoSwitch: false, multiUser: false, prioritySupport: false },
  PRO:        { maxUsers: 1, maxCapitalUsd: 10_000, autoSwitch: true,  multiUser: false, prioritySupport: false },
  ENTERPRISE: { maxUsers: 3, maxCapitalUsd: 0,      autoSwitch: true,  multiUser: true,  prioritySupport: true  },
};

// ---------- Core user (simplified for Phase 1 — no tenant required) ----------
export interface BotUser {
  id: number;
  email: string;
  role: Role;
  active: boolean;
  // Phase 2 fields (kept as optional for forward compatibility)
  tenantId?: number | null;
  tenantName?: string | null;
  name?: string;
  plan?: Plan;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  userId: number;
  plan?: string;
  maxBots?: number;
  // Phase 2 fields
  tenantId?: number;
  expiresAt?: string;
}

// ---------- Trades (mirrors Spring Trade entity) ----------
export interface Trade {
  id: number;
  symbol: string;
  action: TradeAction;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  investedAmount: number;
  entryTime: string;   // ISO 8601 without timezone ("2025-06-01T10:15:00")
  exitTime?: string;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercent?: number;
  status: TradeStatus;
  exitReason?: ExitReason;
  commission?: number;
  binanceOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Dashboard summary (mirrors /api/dashboard/summary Map response) ----------
export interface DashboardSummary {
  balance: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  openTrades: number;
  winRate: number;       // 0-100
  totalPnl: number;
  profitFactor: number;
  currentPrice: number;
}

// ---------- Signal (mirrors Spring Signal entity) ----------
export interface Signal {
  id: number;
  symbol: string;
  action: TradeAction | "HOLD";
  price: number;
  rsi?: number;
  sessionLow?: number;
  sessionHigh?: number;
  momentum?: number;
  inBuyZone?: boolean;
  inSellZone?: boolean;
  generatedAt: string;
  executed?: boolean;
  tradeId?: number;
  // Market context
  trend1h?: TrendDirection;
  trend4h?: TrendDirection;
  trend1d?: TrendDirection;
  relativeVolume?: number;
  btcCorrelation?: number;
  btcTrend1d?: TrendDirection;
  confluence?: boolean;
  distanceToSupportPct?: number;
  distanceToResistancePct?: number;
}

// ---------- Daily metrics (mirrors Spring DailyMetrics entity) ----------
export interface DailyMetrics {
  id: number;
  date: string;           // "2025-06-01"
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate?: number;       // 0-100
  profitFactor?: number;
  maxDrawdown?: number;
  createdAt?: string;
}

// ---------- Strategy config (mirrors /api/admin/config) ----------
export interface StrategyConfig {
  symbol: string;
  timeframe: string;
  enabled: boolean;
  rsiLength: number;
  rsiOversold: number;
  rsiOverbought: number;
  lookbackBars: number;
  killzoneThreshold: number;
  minMomentum: number;
  stopLossPct: number;
  takeProfitPct: number;
  positionSizePct: number;
  leverage: number;
  useAtrStop: boolean;
  atrPeriod: number;
  atrMultiplier: number;
  contextEnabled: boolean;
  requireConfluence: boolean;
  requireVolume: boolean;
  minVolumeRatio?: number;
  trailingStopPct: number;
  useVwapFilter: boolean;
  autoAdjust: boolean;
  telegramEnabled: boolean;
  binanceTestnet: boolean;
}

// ---------- Admin health (mirrors /api/admin/health) ----------
export interface AdminHealth {
  strategyEnabled: boolean;
  symbol: string;
  timeframe: string;
  openTrades: number;
  totalTrades: number;
  lastSignalAt?: string;
  telegramEnabled: boolean;
  binanceTestnet: boolean;
  uptime: string;
}

// ---------- Strategy status (mirrors /api/strategy/status) ----------
export interface StrategyStatus {
  swing: { running: boolean; description: string };
  hunter: { running: boolean };
  timestamp: string;
}

// ---------- Backtest ----------
export interface BacktestTrade {
  action: TradeAction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  exitReason: ExitReason;
  entryTimestamp: number;
  exitTimestamp: number;
  pnl: number;
  pnlPercent: number;
}

export interface BacktestResult {
  symbol: string;
  timeframe: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  grossProfit: number;
  grossLoss: number;
  winRate: number;        // 0.0-1.0
  profitFactor: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
}

// ---------- Equity curve point ----------
export interface EquityPoint {
  timestamp: string;
  balance: number;
  pnl?: number;
  value?: number; // kept for legacy chart components
}

// ---------- Pagination (Spring Page) ----------
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-based)
  first?: boolean;
  last?: boolean;
}

// =============================================================================
// PHASE 2 STUBS — Multi-tenant types (not used in Phase 1)
// Re-enable when the backend implements auth + tenancy.
// =============================================================================

// export interface Tenant { id, name, adminEmail, plan, maxUsers, active, ... }
// export interface TenantWithUsers extends Tenant { users: [...], stats: {...} }
// export interface AvailableUser { userId, email, name, botActive, capital }
// export interface PlatformMetrics { platform, trading, system, revenue }
// export interface StrategySwitch { id, previousStrategy, newStrategy, ... }
// export type StrategyKind = "RANGE" | "TREND" | "SCALPING";
// export type MarketConditionKind = "RANGING" | "TREND_UP" | "TREND_DOWN" | ...;
