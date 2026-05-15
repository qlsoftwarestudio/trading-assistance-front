// Domain types — mirror the QL Trading Bot backend contract (API_DOC_TRADING_BOT.md).
// `tenantId` and `userId` are numbers in the real API.
// Keep names aligned with the backend where possible (camelCase JSON).

// ---------- Enums ----------
export type TradeType = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type StrategyKind = "RANGE" | "TREND" | "SCALPING";
export type ExitReason =
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "STRATEGY_SWITCH"
  | "MANUAL_CLOSE"
  | "SYSTEM_CLOSE";

export type MarketConditionKind =
  | "RANGING"
  | "TREND_UP"
  | "TREND_DOWN"
  | "SCALPING_OPPORTUNITY"
  | "NEUTRAL";

// `FREE` is kept for the local demo experience only — the real backend exposes
// only STARTER / PRO / ENTERPRISE. The mock surfaces FREE so users can try the
// app without picking a paid tier; once VITE_API_URL is set, FREE simply
// disappears from the responses.
export type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export type Role = "TRADER" | "ADMIN";

export type NotificationType =
  | "STRATEGY_SWITCH"
  | "TRADE_OPENED"
  | "TRADE_CLOSED"
  | "DAILY_SUMMARY"
  | "RISK_ALERT"
  | "SYSTEM_ALERT";

export type NotificationChannel = "EMAIL" | "TELEGRAM";

// ---------- Plan metadata (used for UI gating + billing display) ----------
export interface PlanLimits {
  maxUsers: number;
  maxCapitalUsd: number; // 0 = unlimited
  autoSwitch: boolean;
  multiUser: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE:       { maxUsers: 1, maxCapitalUsd: 500,    autoSwitch: false, multiUser: false, prioritySupport: false },
  STARTER:    { maxUsers: 1, maxCapitalUsd: 500,    autoSwitch: false, multiUser: false, prioritySupport: false },
  PRO:        { maxUsers: 1, maxCapitalUsd: 10_000, autoSwitch: true,  multiUser: false, prioritySupport: false },
  ENTERPRISE: { maxUsers: 3, maxCapitalUsd: 0,      autoSwitch: true,  multiUser: true,  prioritySupport: true  },
};

export const PLAN_PRICE: Record<Plan, number> = {
  FREE: 0,
  STARTER: 29,
  PRO: 79,
  ENTERPRISE: 199,
};

// ---------- Trading entities ----------
export interface Trade {
  id: number;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  currentPrice?: number;
  quantity: number;
  investedAmount?: number;
  pnl?: number;
  pnlPercent?: number;
  fees?: number;
  stopLoss?: number;
  takeProfit?: number;
  strategyUsed: StrategyKind;
  marketCondition?: MarketConditionKind;
  entryTime: string;
  exitTime?: string;
  exitReason?: ExitReason;
  duration?: string;
  binanceOrderId?: string;
}

export interface PortfolioSnapshot {
  totalBalance: number;
  availableBalance: number;
  lockedBalance?: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  weeklyPnL: number;
  weeklyPnLPercent?: number;
  monthlyPnL: number;
  monthlyPnLPercent?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  winRate?: number;
  averageProfit?: number;
  averageLoss?: number;
  profitFactor?: number;
  openPositions: number;
  currency?: string;
  timestamp?: string;
}

export interface EquityPoint {
  timestamp: string;
  balance: number;
  pnl?: number;
  /** @deprecated kept for legacy components — mirror of `balance` */
  value?: number;
}

// ---------- Market data ----------
export interface MarketIndicatorSet {
  adx: number;
  rsi: number;
  rsi14?: number;
  ema9: number;
  ema21: number;
  ema50?: number;
  atr?: number;
  bollinger?: { upper: number; middle: number; lower: number };
}

export interface MarketLevels {
  support: number[];
  resistance: number[];
}

export interface MarketCondition {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCondition: MarketConditionKind;
  indicators: MarketIndicatorSet;
  levels?: MarketLevels;
  timestamp: string;
}

export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

// ---------- Configuration ----------
export interface RiskSettings {
  maxPositionSizePercent: number;
  maxDailyLossPercent: number;
  stopLossPercent: number;
  takeProfitPercent?: number;
  maxOpenPositions?: number;
  trailingStop?: boolean;
}

export interface StrategyParamsRange {
  enabled: boolean;
  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;
  lookbackPeriod?: number;
}

export interface StrategyParamsTrend {
  enabled: boolean;
  emaFast: number;
  emaSlow: number;
  adxThreshold: number;
}

export interface StrategyParamsScalping {
  enabled: boolean;
  rsiPeriod: number;
  rsiOversold?: number;
  rsiOverbought?: number;
  bbPeriod: number;
  bbDeviation?: number;
}

export interface NotificationsConfig {
  emailEnabled?: boolean;
  telegramEnabled: boolean;
  telegramChatId?: string;
  onStrategySwitch?: boolean;
  onTradeOpen?: boolean;
  onTradeClose?: boolean;
  onDailySummary?: boolean;
  onRiskAlert?: boolean;
}

export interface ApiKeysStatus {
  configured: boolean;
  testnet: boolean;
  lastValidated?: string;
}

export interface BotConfig {
  general: {
    botActive: boolean;
    mode: "AUTO_SWITCH" | "MANUAL";
    selectedStrategy?: StrategyKind;
    tradingPair: string;
    testMode: boolean;
  };
  risk: RiskSettings;
  strategies: {
    range: StrategyParamsRange;
    trend: StrategyParamsTrend;
    scalping: StrategyParamsScalping;
  };
  notifications: NotificationsConfig;
  apiKeys: ApiKeysStatus;
}

// ---------- Tenants & users ----------
export interface Tenant {
  id: number;
  name?: string;
  adminEmail: string;
  plan: Plan;
  maxUsers: number;
  active: boolean;
  monthlyFee?: number;
  nextBillingDate?: string;
  createdAt: string;
  lastActivityAt?: string;
}

export interface BotUser {
  id: number;
  tenantId: number | null;
  tenantName?: string | null;
  email: string;
  name?: string;
  role: Role;
  plan: Plan; // mirror of tenant.plan for convenience in the UI
  botActive: boolean;
  apiKeysConfigured: boolean;
  telegramConfigured?: boolean;
  telegramChatId?: string | null;
  capital?: number;
  dailyPnL?: number;
  totalTrades?: number;
  winRate?: number;
  totalPnL?: number;
  currentStrategy?: StrategyKind | null;
  tradingPair?: string;
  active: boolean;
  createdAt?: string;
  lastActivityAt?: string;
  lastTradeAt?: string;
}

export interface AvailableUser {
  userId: number;
  email: string;
  name: string;
  botActive: boolean;
  capital: number;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  email: string;
  role: Role;
  tenantId: number;
  userId: number;
  plan: Plan;
  usersInTenant: number;
  selectedUserId: number;
  availableUsers?: AvailableUser[];
  requiresUserSelection: boolean;
  telegramConfigured?: boolean;
  expiresAt: string;
}

export interface RegisterResponse {
  userId: number;
  tenantId: number;
  email: string;
  plan: Plan;
  message?: string;
  /** Same shape as login() so the UI can session-in the new user immediately. */
  auth: AuthResponse;
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

// ---------- Statistics ----------
export interface TradeStatistics {
  period: { from: string; to: string };
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  bestTrade?: { id: number; pnl: number; pnlPercent: number };
  worstTrade?: { id: number; pnl: number; pnlPercent: number };
  byStrategy: { strategy: StrategyKind; trades: number; winRate: number; pnl: number }[];
}

export interface StrategySwitch {
  id: number;
  previousStrategy: StrategyKind;
  newStrategy: StrategyKind;
  previousCondition: MarketConditionKind;
  newCondition: MarketConditionKind;
  reason: string;
  portfolioValueAtSwitch: number;
  tradesClosed: number;
  notificationSent: boolean;
  timestamp: string;
}

// ---------- Admin metrics ----------
export interface PlatformMetrics {
  platform: {
    tenants: { total: number; active: number; byPlan: Record<string, number> };
    users:   { total: number; byPlan: Record<string, number> };
    bots:    { total: number; active: number; paused: number };
  };
  trading: {
    totalTrades24h: number;
    totalVolume24h: number;
    totalCapitalManaged: number;
    avgDailyPnL: number;
    topPerformers: { tenantId: number; userId: number; email: string; dailyPnL: number; winRate: number }[];
  };
  system: {
    apiCalls24h: number;
    notificationsSent24h: number;
    webSocketConnections: number;
    binanceApiCalls24h: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    byPlan: Record<string, number>;
  };
}

export interface TenantWithUsers extends Tenant {
  users: {
    userId: number;
    email: string;
    name?: string;
    role?: Role;
    botActive: boolean;
    apiKeysConfigured?: boolean;
    capital: number;
    dailyPnL: number;
    totalTrades?: number;
    winRate?: number;
    totalPnL?: number;
    createdAt?: string;
    lastActivityAt?: string;
  }[];
  stats?: {
    totalUsers: number;
    activeBots: number;
    totalTrades: number;
    totalPnL: number;
    totalCapital: number;
    avgWinRate?: number;
  };
}
