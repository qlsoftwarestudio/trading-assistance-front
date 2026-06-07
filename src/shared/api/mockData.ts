// In-memory mock that mirrors API_DOC_TRADING_BOT.md shapes (Spring Page,
// nested config, indicator objects, X-Tenant-ID flow). Designed so that
// switching to the real backend is a single env-var flip.

import type {
  AuthResponse,
  AvailableUser,
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
import { PLAN_LIMITS, PLAN_PRICE } from "@/shared/types";

// ---------- Seeded RNG so the mock feels stable across reloads ----------
let seed = 42;
const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const between = (min: number, max: number) => min + rand() * (max - min);

const NOW = Date.now();
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const nextUserId = (() => { let n = 100; return () => ++n; })();
const nextTenantId = (() => { let n = 40; return () => ++n; })();

// ---------- Seed data: tenants + users ----------
const tenants: Tenant[] = [
  { id: 1,  name: "QL Software Studio",  adminEmail: "admin@ql.studio",   plan: "ENTERPRISE", maxUsers: 3, active: true,  monthlyFee: 199, createdAt: new Date(NOW - 90 * 86400_000).toISOString() },
  { id: 2,  name: "Alice Trading",       adminEmail: "alice@startup.io",  plan: "STARTER",    maxUsers: 1, active: true,  monthlyFee: 29,  createdAt: new Date(NOW - 30 * 86400_000).toISOString() },
  { id: 3,  name: "Carol Capital",       adminEmail: "carol@solo.com",    plan: "PRO",        maxUsers: 1, active: false, monthlyFee: 79,  createdAt: new Date(NOW - 12 * 86400_000).toISOString() },
];

const users: BotUser[] = [
  // Tenant 1 = ENTERPRISE with 3 bots
  { id: 101, tenantId: 1, tenantName: "QL Software Studio", email: "admin@ql.studio",    name: "Administrador",  role: "ADMIN",  plan: "ENTERPRISE", botActive: true,  apiKeysConfigured: true,  telegramConfigured: true,  telegramChatId: "123456789", capital: 5000, dailyPnL: 12.45,  totalTrades: 150, winRate: 75.0, totalPnL: 45.6, currentStrategy: "TREND", tradingPair: "BTCUSDT", active: true, createdAt: new Date(NOW - 90*86400_000).toISOString(), lastActivityAt: new Date(NOW - 5*60_000).toISOString() },
  { id: 102, tenantId: 1, tenantName: "QL Software Studio", email: "junior@ql.studio",   name: "Trader Junior",  role: "TRADER", plan: "ENTERPRISE", botActive: false, apiKeysConfigured: true,  telegramConfigured: false, capital: 1000, dailyPnL: 0,      totalTrades: 45,  winRate: 68.5, totalPnL: 8.2,  currentStrategy: null,    tradingPair: "BTCUSDT", active: true, createdAt: new Date(NOW - 45*86400_000).toISOString(), lastActivityAt: new Date(NOW - 3*3600_000).toISOString() },
  { id: 103, tenantId: 1, tenantName: "QL Software Studio", email: "guest@ql.studio",    name: "Invitado",       role: "TRADER", plan: "ENTERPRISE", botActive: true,  apiKeysConfigured: true,  telegramConfigured: false, capital: 2000, dailyPnL: 5.10,   totalTrades: 50,  winRate: 72.0, totalPnL: 5.1,  currentStrategy: "RANGE", tradingPair: "BTCUSDT", active: true, createdAt: new Date(NOW - 20*86400_000).toISOString(), lastActivityAt: new Date(NOW - 1*3600_000).toISOString() },
  // Tenant 2 = STARTER, 1 bot
  { id: 201, tenantId: 2, tenantName: "Alice Trading",      email: "alice@startup.io",   name: "Alice",          role: "ADMIN",  plan: "STARTER",    botActive: true,  apiKeysConfigured: true,  telegramConfigured: false, capital: 480,  dailyPnL: 4.20,   totalTrades: 22,  winRate: 64.0, totalPnL: 12.3, currentStrategy: "RANGE", tradingPair: "ETHUSDT", active: true, createdAt: new Date(NOW - 30*86400_000).toISOString(), lastActivityAt: new Date(NOW - 30*60_000).toISOString() },
  // Tenant 3 = PRO, 1 bot, suspended
  { id: 301, tenantId: 3, tenantName: "Carol Capital",      email: "carol@solo.com",     name: "Carol",          role: "ADMIN",  plan: "PRO",        botActive: false, apiKeysConfigured: false, telegramConfigured: false, capital: 0,    dailyPnL: 0,      totalTrades: 0,   winRate: 0,    totalPnL: 0,    currentStrategy: null,    tradingPair: "BTCUSDT", active: false, createdAt: new Date(NOW - 12*86400_000).toISOString() },
];

// ---------- Trading state (per session, scoped by current selected user) ----------
let portfolio: PortfolioSnapshot = {
  totalBalance: 5_184.55,
  availableBalance: 2_213.08,
  lockedBalance: 2_971.47,
  dailyPnL: 12.45,
  dailyPnLPercent: 0.24,
  weeklyPnL: 86.4,
  weeklyPnLPercent: 1.69,
  monthlyPnL: 245.9,
  monthlyPnLPercent: 4.97,
  totalTrades: 150,
  winningTrades: 112,
  losingTrades: 38,
  winRate: 74.6,
  averageProfit: 5.2,
  averageLoss: -2.1,
  profitFactor: 2.47,
  openPositions: 2,
  currency: "USDT",
  timestamp: new Date().toISOString(),
};

const generateEquity = (points = 60): EquityPoint[] => {
  const out: EquityPoint[] = [];
  let v = 4_900;
  for (let i = points; i >= 0; i--) {
    v += between(-40, 60);
    const balance = Math.max(3_500, v);
    out.push({ timestamp: new Date(NOW - i * 60 * 60 * 1000).toISOString(), balance, value: balance, pnl: balance - 4_900 });
  }
  out[out.length - 1].balance = portfolio.totalBalance;
  out[out.length - 1].value   = portfolio.totalBalance;
  return out;
};

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
const STRATS: StrategyKind[] = ["RANGE", "TREND", "SCALPING"];

const generateTrades = (count = 80): Trade[] => {
  const out: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const isOpen = i < 3;
    const cancelled = !isOpen && rand() < 0.07;
    const type: "BUY" | "SELL" = rand() > 0.5 ? "BUY" : "SELL";
    const entry = between(20_000, 70_000);
    const exit  = isOpen ? undefined : entry * (1 + between(-0.04, 0.05));
    const qty   = Number(between(0.001, 0.01).toFixed(4));
    const pnl   = exit ? (type === "BUY" ? exit - entry : entry - exit) * qty : undefined;
    const pnlPct = pnl !== undefined ? (pnl / (entry * qty)) * 100 : undefined;
    out.push({
      id: 1000 + i,
      symbol: SYMBOLS[Math.floor(rand() * SYMBOLS.length)],
      type,
      status: isOpen ? "OPEN" : cancelled ? "CANCELLED" : "CLOSED",
      entryPrice: entry,
      exitPrice: exit,
      currentPrice: isOpen ? entry * (1 + between(-0.01, 0.02)) : undefined,
      quantity: qty,
      investedAmount: entry * qty,
      pnl,
      pnlPercent: pnlPct,
      stopLoss: entry * 0.97,
      takeProfit: entry * 1.05,
      strategyUsed: STRATS[Math.floor(rand() * STRATS.length)],
      marketCondition: "TREND_UP",
      entryTime: new Date(NOW - (i + 1) * 1000 * 60 * 37).toISOString(),
      exitTime: isOpen ? undefined : new Date(NOW - i * 1000 * 60 * 30).toISOString(),
      exitReason: isOpen ? undefined : (pnl ?? 0) > 0 ? "TAKE_PROFIT" : "STOP_LOSS",
      duration: isOpen ? "in progress" : "1h 30m",
    });
  }
  return out;
};

let equityHistory = generateEquity();
const trades = generateTrades();

let market: MarketCondition = {
  symbol: "BTCUSDT",
  currentPrice: 65_100.5,
  priceChange24h: 1_200.5,
  priceChangePercent24h: 1.88,
  high24h: 65_500,
  low24h: 63_800,
  volume24h: 28_500.5,
  marketCondition: "TREND_UP",
  indicators: { adx: 32.5, rsi: 58.3, rsi14: 55.2, ema9: 64_400, ema21: 63_800, ema50: 62_500, atr: 850, bollinger: { upper: 66_800, middle: 65_000, lower: 63_200 } },
  levels: { support: [64_500, 63_800, 62_500], resistance: [65_500, 66_800, 67_500] },
  timestamp: new Date().toISOString(),
};

let config: BotConfig = {
  general: { botActive: true, mode: "AUTO_SWITCH", selectedStrategy: "TREND", tradingPair: "BTCUSDT", testMode: false },
  risk: { maxPositionSizePercent: 5, maxDailyLossPercent: 10, stopLossPercent: 3, takeProfitPercent: 5, maxOpenPositions: 2, trailingStop: true },
  strategies: {
    range:    { enabled: true, rsiPeriod: 14, rsiOversold: 35, rsiOverbought: 65, lookbackPeriod: 20 },
    trend:    { enabled: true, emaFast: 9, emaSlow: 21, adxThreshold: 25 },
    scalping: { enabled: true, rsiPeriod: 7, rsiOversold: 25, rsiOverbought: 75, bbPeriod: 20, bbDeviation: 2 },
  },
  notifications: { emailEnabled: true, telegramEnabled: true, telegramChatId: "123456789", onStrategySwitch: true, onTradeOpen: true, onTradeClose: true, onDailySummary: true, onRiskAlert: true },
  apiKeys: { configured: true, testnet: false, lastValidated: new Date(NOW - 2*3600_000).toISOString() },
};

const switches: StrategySwitch[] = [
  { id: 1, previousStrategy: "RANGE", newStrategy: "TREND", previousCondition: "RANGING", newCondition: "TREND_UP", reason: "ADX 32.5 > 25, EMA9 cruzó sobre EMA21", portfolioValueAtSwitch: 5_134, tradesClosed: 0, notificationSent: true, timestamp: new Date(NOW - 2*3600_000).toISOString() },
];

// ---------- Live ticker ----------
const tickListeners = new Set<(m: MarketCondition) => void>();
setInterval(() => {
  const drift = between(-80, 80);
  const newRsi = Math.min(95, Math.max(5, market.indicators.rsi + between(-1.2, 1.2)));
  const newAdx = Math.min(80, Math.max(8, market.indicators.adx + between(-0.6, 0.6)));
  const condition: MarketCondition["marketCondition"] =
    newRsi > 70 ? "TREND_UP"
    : newRsi < 30 ? "TREND_DOWN"
    : newAdx < 20 ? "RANGING"
    : newAdx > 35 ? "SCALPING_OPPORTUNITY"
    : "NEUTRAL";
  market = {
    ...market,
    currentPrice: Math.max(10_000, market.currentPrice + drift),
    priceChange24h: market.priceChange24h + between(-0.5, 0.5),
    priceChangePercent24h: (market.priceChangePercent24h ?? 0) + between(-0.05, 0.05),
    marketCondition: condition,
    indicators: {
      ...market.indicators,
      rsi: newRsi,
      adx: newAdx,
      ema9: market.indicators.ema9 + drift * 0.4,
      ema21: market.indicators.ema21 + drift * 0.2,
    },
    timestamp: new Date().toISOString(),
  };
  const pnlDrift = between(-5, 7);
  portfolio = {
    ...portfolio,
    totalBalance: portfolio.totalBalance + pnlDrift,
    dailyPnL: portfolio.dailyPnL + pnlDrift,
    dailyPnLPercent: ((portfolio.dailyPnL + pnlDrift) / portfolio.totalBalance) * 100,
    timestamp: new Date().toISOString(),
  };
  tickListeners.forEach((l) => l(market));
}, 2000);

setInterval(() => {
  const last = portfolio.totalBalance;
  equityHistory = [...equityHistory.slice(1), { timestamp: new Date().toISOString(), balance: last, value: last, pnl: last - 4_900 }];
}, 30_000);

export const subscribeMarket = (cb: (m: MarketCondition) => void) => {
  tickListeners.add(cb);
  cb(market);
  return () => { tickListeners.delete(cb); };
};

// ---------- Helpers ----------
const findUserByEmail = (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase());
const issueToken = (userId: number) => `mock.jwt.${userId}.${Date.now()}`;
const buildAuthResponse = (user: BotUser): AuthResponse => {
  const sameTenant = users.filter((u) => u.tenantId === user.tenantId);
  const requiresUserSelection = sameTenant.length > 1;
  const availableUsers: AvailableUser[] | undefined = requiresUserSelection
    ? sameTenant.map((u) => ({ userId: u.id, email: u.email, name: u.name ?? u.email, botActive: u.botActive, capital: u.capital ?? 0 }))
    : undefined;
  return {
    token: issueToken(user.id),
    refreshToken: `mock.refresh.${user.id}`,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId ?? 0,
    userId: user.id,
    plan: user.plan,
    usersInTenant: sameTenant.length,
    selectedUserId: user.id,
    availableUsers,
    requiresUserSelection,
    telegramConfigured: user.telegramConfigured ?? false,
    expiresAt: new Date(NOW + 12 * 3600_000).toISOString(),
  };
};

// ---------- Mock API ----------
export const mockApi = {
  // -------- Auth --------
  async login(email: string, _password: string): Promise<AuthResponse> {
    await wait(300);
    const user = findUserByEmail(email) ?? users[0]; // demo-friendly fallback
    return buildAuthResponse(user);
  },

  async register(email: string, _password: string, plan: Plan = "FREE"): Promise<RegisterResponse> {
    await wait(400);
    if (findUserByEmail(email)) throw new Error("Ya existe una cuenta con ese email");
    const tenantId = nextTenantId();
    const tenant: Tenant = {
      id: tenantId,
      name: email.split("@")[0],
      adminEmail: email,
      plan,
      maxUsers: PLAN_LIMITS[plan].maxUsers,
      active: true,
      monthlyFee: PLAN_PRICE[plan],
      createdAt: new Date().toISOString(),
    };
    tenants.push(tenant);
    const user: BotUser = {
      id: nextUserId(),
      tenantId,
      tenantName: tenant.name,
      email,
      role: "ADMIN",
      plan,
      botActive: false,
      apiKeysConfigured: false,
      telegramConfigured: false,
      active: true,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return { userId: user.id, tenantId, email, plan, message: "Cuenta creada", auth: buildAuthResponse(user) };
  },

  async refresh(_refreshToken: string) { await wait(120); return { token: `mock.jwt.refreshed.${Date.now()}`, expiresAt: new Date(NOW + 12*3600_000).toISOString() }; },

  async selectUser(userId: number) {
    await wait(200);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new Error("Usuario no encontrado");
    return { newToken: issueToken(u.id), selectedUserId: u.id, user: u };
  },

  // -------- Onboarding (mock-only quick path for self-signup demos) --------
  async createTenant(payload: { name: string; plan: Plan }): Promise<BotUser> {
    await wait(350);
    const userIdRaw = localStorage.getItem("tb_userId");
    const userId = userIdRaw ? parseInt(userIdRaw, 10) : NaN;
    const u = users.find((x) => x.id === userId);
    if (!u) throw new Error("Sesión no válida");
    if (u.tenantId) throw new Error("Ya perteneces a un workspace");
    const tenant: Tenant = {
      id: nextTenantId(), name: payload.name, adminEmail: u.email, plan: payload.plan,
      maxUsers: PLAN_LIMITS[payload.plan].maxUsers, active: true, monthlyFee: PLAN_PRICE[payload.plan],
      createdAt: new Date().toISOString(),
    };
    tenants.push(tenant);
    u.tenantId = tenant.id; u.tenantName = tenant.name; u.plan = tenant.plan; u.role = "ADMIN";
    return u;
  },

  // -------- Users --------
  async getUsers(): Promise<BotUser[]> {
    await wait(150);
    const tid = parseInt(localStorage.getItem("tb_tenantId") ?? "0", 10);
    return users.filter((u) => u.tenantId === tid);
  },

  async createUser(payload: { email: string; password: string; name?: string; role: Role; telegramChatId?: string }): Promise<BotUser> {
    await wait(350);
    const tid = parseInt(localStorage.getItem("tb_tenantId") ?? "0", 10);
    const tenant = tenants.find((t) => t.id === tid);
    if (!tenant) throw new Error("Tenant no encontrado");
    const sameTenant = users.filter((u) => u.tenantId === tid);
    if (sameTenant.length >= tenant.maxUsers) throw new Error(`Plan ${tenant.plan} permite máximo ${tenant.maxUsers} usuarios`);
    if (findUserByEmail(payload.email)) throw new Error("Ya existe un usuario con ese email");
    const user: BotUser = {
      id: nextUserId(), tenantId: tid, tenantName: tenant.name, email: payload.email,
      name: payload.name, role: payload.role, plan: tenant.plan, botActive: false,
      apiKeysConfigured: false, telegramConfigured: !!payload.telegramChatId,
      telegramChatId: payload.telegramChatId, capital: 0, dailyPnL: 0,
      active: true, createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  async updateUser(userId: number, payload: Partial<BotUser>): Promise<BotUser> {
    await wait(200);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new Error("Usuario no encontrado");
    Object.assign(u, payload);
    return u;
  },

  async deleteUser(userId: number) {
    await wait(200);
    const idx = users.findIndex((x) => x.id === userId);
    if (idx < 0) throw new Error("Usuario no encontrado");
    users.splice(idx, 1);
    return { ok: true } as const;
  },

  // -------- Equity / trades / market --------
  async getEquity(): Promise<EquityPoint[]>        { await wait(120); return equityHistory; },

  async getTrades(params: { status?: TradeStatus | "ALL"; symbol?: string; strategy?: StrategyKind; page?: number; size?: number } = {}): Promise<Page<Trade>> {
    await wait(180);
    const { status = "ALL", symbol, strategy, page = 0, size = 20 } = params;
    let filtered = trades;
    if (status !== "ALL")              filtered = filtered.filter((t) => t.status === status);
    if (symbol && symbol !== "ALL")    filtered = filtered.filter((t) => t.symbol === symbol);
    if (strategy)                      filtered = filtered.filter((t) => t.strategyUsed === strategy);
    const start = page * size;
    const slice = filtered.slice(start, start + size);
    return { content: slice, totalElements: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / size)), size, number: page, first: page === 0, last: start + size >= filtered.length };
  },

  async getTrade(id: number): Promise<Trade> {
    await wait(80);
    const t = trades.find((x) => x.id === id);
    if (!t) throw new Error("Trade no encontrado");
    return t;
  },

  async getTradeStats(_params: { from?: string; to?: string }): Promise<TradeStatistics> {
    await wait(180);
    return {
      period: { from: new Date(NOW - 28*86400_000).toISOString().slice(0,10), to: new Date(NOW).toISOString().slice(0,10) },
      totalTrades: 45, winningTrades: 32, losingTrades: 13, winRate: 71.11,
      totalPnL: 45.6, totalPnLPercent: 17.08, averageWin: 2.85, averageLoss: -1.45,
      profitFactor: 2.47, maxDrawdown: -5.2, maxDrawdownPercent: -2.15,
      bestTrade: { id: 142, pnl: 8.5, pnlPercent: 5.2 },
      worstTrade: { id: 138, pnl: -3.2, pnlPercent: -2.1 },
      byStrategy: [
        { strategy: "TREND", trades: 20, winRate: 75, pnl: 28.5 },
        { strategy: "RANGE", trades: 15, winRate: 73.3, pnl: 12.1 },
        { strategy: "SCALPING", trades: 10, winRate: 60, pnl: 5.0 },
      ],
    };
  },

  async getMarket(symbol = "BTCUSDT"): Promise<MarketCondition> { await wait(100); return { ...market, symbol }; },

  async getCandles(params: { symbol: string; interval?: string; limit?: number }): Promise<{ symbol: string; interval: string; candles: Candle[] }> {
    await wait(150);
    const limit = params.limit ?? 100;
    const candles: Candle[] = [];
    let close = market.currentPrice;
    for (let i = limit; i > 0; i--) {
      const open = close;
      close = open + between(-200, 200);
      const high = Math.max(open, close) + Math.abs(between(0, 80));
      const low  = Math.min(open, close) - Math.abs(between(0, 80));
      const t = NOW - i * 5 * 60_000;
      candles.push({ openTime: t, open, high, low, close, volume: between(20, 90), closeTime: t + 5*60_000 - 1 });
    }
    return { symbol: params.symbol, interval: params.interval ?? "5m", candles };
  },

  // -------- Config --------
  async getConfig(): Promise<BotConfig> { await wait(100); return config; },
  async updateConfig(next: Partial<BotConfig>): Promise<BotConfig> {
    await wait(220);
    config = {
      general: { ...config.general, ...(next.general ?? {}) },
      risk: { ...config.risk, ...(next.risk ?? {}) },
      strategies: {
        range:    { ...config.strategies.range,    ...(next.strategies?.range ?? {}) },
        trend:    { ...config.strategies.trend,    ...(next.strategies?.trend ?? {}) },
        scalping: { ...config.strategies.scalping, ...(next.strategies?.scalping ?? {}) },
      },
      notifications: { ...config.notifications, ...(next.notifications ?? {}) },
      apiKeys: { ...config.apiKeys, ...(next.apiKeys ?? {}) },
    };
    return config;
  },
  async saveApiKeys(payload: { apiKey: string; apiSecret: string; testnet?: boolean }) {
    await wait(450);
    config = { ...config, apiKeys: { configured: true, testnet: payload.testnet ?? false, lastValidated: new Date().toISOString() } };
    return { ok: true as const, testnet: config.apiKeys.testnet, validated: true };
  },
  async testConnection() { await wait(300); return { success: true, latency: 45 }; },
  async toggleBot(active: boolean) {
    await wait(150);
    config = { ...config, general: { ...config.general, botActive: active } };
    return { botActive: active };
  },

  // -------- Strategies --------
  async getStrategySwitches(_params: { page?: number; size?: number }): Promise<Page<StrategySwitch>> {
    await wait(150);
    return { content: switches, totalElements: switches.length, totalPages: 1, size: switches.length, number: 0, first: true, last: true };
  },
  async forceStrategy(strategy: StrategyKind, _reason: string) {
    await wait(200);
    const prev = config.general.selectedStrategy ?? "RANGE";
    config = { ...config, general: { ...config.general, selectedStrategy: strategy, mode: "MANUAL" } };
    switches.unshift({
      id: switches.length + 1, previousStrategy: prev, newStrategy: strategy,
      previousCondition: market.marketCondition, newCondition: market.marketCondition,
      reason: "Cambio manual", portfolioValueAtSwitch: portfolio.totalBalance,
      tradesClosed: 0, notificationSent: false, timestamp: new Date().toISOString(),
    });
    return { newStrategy: strategy };
  },

  // -------- Admin --------
  async getTenants(): Promise<TenantWithUsers[]> {
    await wait(180);
    return tenants.map((t) => {
      const tu = users.filter((u) => u.tenantId === t.id);
      return {
        ...t,
        users: tu.map((u) => ({ userId: u.id, email: u.email, name: u.name, role: u.role, botActive: u.botActive, apiKeysConfigured: u.apiKeysConfigured, capital: u.capital ?? 0, dailyPnL: u.dailyPnL ?? 0, totalTrades: u.totalTrades, winRate: u.winRate, totalPnL: u.totalPnL, createdAt: u.createdAt, lastActivityAt: u.lastActivityAt })),
        stats: {
          totalUsers: tu.length,
          activeBots: tu.filter((u) => u.botActive).length,
          totalTrades: tu.reduce((s, u) => s + (u.totalTrades ?? 0), 0),
          totalPnL:    tu.reduce((s, u) => s + (u.totalPnL ?? 0), 0),
          totalCapital:tu.reduce((s, u) => s + (u.capital ?? 0), 0),
          avgWinRate:  tu.length ? tu.reduce((s, u) => s + (u.winRate ?? 0), 0) / tu.length : 0,
        },
      };
    });
  },

  async getTenant(id: number): Promise<TenantWithUsers> {
    const all = await this.getTenants();
    const t = all.find((x) => x.id === id);
    if (!t) throw new Error("Tenant no encontrado");
    return t;
  },

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    await wait(180);
    const byPlan = (key: "tenants" | "users") => {
      const counts: Record<string, number> = { STARTER: 0, PRO: 0, ENTERPRISE: 0, FREE: 0 };
      const list = key === "tenants" ? tenants : users;
      list.forEach((x) => { counts[x.plan] = (counts[x.plan] ?? 0) + 1; });
      return counts;
    };
    const activeBots = users.filter((u) => u.botActive).length;
    const mrr = tenants.filter((t) => t.active).reduce((s, t) => s + (t.monthlyFee ?? 0), 0);
    const revByPlan: Record<string, number> = {};
    tenants.filter((t) => t.active).forEach((t) => { revByPlan[t.plan] = (revByPlan[t.plan] ?? 0) + (t.monthlyFee ?? 0); });
    return {
      platform: {
        tenants: { total: tenants.length, active: tenants.filter((t) => t.active).length, byPlan: byPlan("tenants") },
        users:   { total: users.length, byPlan: byPlan("users") },
        bots:    { total: users.length, active: activeBots, paused: users.length - activeBots },
      },
      trading: {
        totalTrades24h: 1_250, totalVolume24h: 125_000,
        totalCapitalManaged: users.reduce((s, u) => s + (u.capital ?? 0), 0),
        avgDailyPnL: 2.5,
        topPerformers: users.filter((u) => (u.dailyPnL ?? 0) > 0).slice(0, 3).map((u) => ({ tenantId: u.tenantId ?? 0, userId: u.id, email: u.email, dailyPnL: u.dailyPnL ?? 0, winRate: u.winRate ?? 0 })),
      },
      system: { apiCalls24h: 50_000, notificationsSent24h: 3_500, webSocketConnections: activeBots, binanceApiCalls24h: 125_000 },
      revenue: { mrr, arr: mrr * 12, byPlan: revByPlan },
    };
  },

  async setTenantPlan(tenantId: number, plan: Plan): Promise<Tenant> {
    await wait(200);
    const t = tenants.find((x) => x.id === tenantId);
    if (!t) throw new Error("Tenant no encontrado");
    const sameTenant = users.filter((u) => u.tenantId === tenantId);
    if (sameTenant.length > PLAN_LIMITS[plan].maxUsers) {
      throw new Error(`El tenant tiene ${sameTenant.length} usuarios pero el plan ${plan} permite ${PLAN_LIMITS[plan].maxUsers}`);
    }
    t.plan = plan;
    t.maxUsers = PLAN_LIMITS[plan].maxUsers;
    t.monthlyFee = PLAN_PRICE[plan];
    sameTenant.forEach((u) => { u.plan = plan; });
    return t;
  },

  async toggleTenant(tenantId: number, active: boolean) {
    await wait(150);
    const t = tenants.find((x) => x.id === tenantId);
    if (!t) throw new Error("Tenant no encontrado");
    t.active = active;
    return { ok: true as const, active };
  },
};
