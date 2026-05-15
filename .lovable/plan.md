
# Plan: Trading Bot Dashboard (Binance) — React Adaptation

Adaptamos el prompt original (Vue 3) a la stack soportada por Lovable: **React 18 + Vite + TypeScript + Tailwind + shadcn/ui**. Mantenemos arquitectura, features, contratos de API y tema visual idénticos.

## Arquitectura de carpetas (Atomic + Features híbrido)

```
src/
├── components/
│   ├── atoms/         StatValue, PnLBadge, StatusDot, IconBadge, Sparkline
│   ├── molecules/     PortfolioCard, MetricRow, IndicatorChip, TradeRow,
│   │                  StrategyBadge, BotToggle, TimeframeFilter
│   ├── organisms/     TopNav, AppSidebar, EquityChart, MarketIndicators,
│   │                  TradeTable, ApiKeyForm, RiskSettingsForm,
│   │                  TenantsTable, PriceTicker
│   └── templates/     DashboardLayout, AuthLayout
├── features/
│   ├── auth/          useAuth, authStore, types, LoginForm
│   ├── dashboard/     hooks (usePortfolio, useEquity), mock data
│   ├── trades/        useTrades, filters, types
│   ├── market/        useMarketData, useWebSocket (mock stream con setInterval),
│   │                  indicator helpers
│   ├── config/        useConfig, schemas Zod
│   └── admin/         useTenants, plan utilities
├── pages/             Login, Dashboard, Trades, Market, Config, Admin, NotFound
├── shared/
│   ├── api/           client.ts (axios + interceptores JWT),
│   │                  endpoints.ts, mockAdapter.ts
│   └── lib/           formatters (currency, percent, datetime)
└── store/             zustand stores (auth, bot, ui)
```

## Capa de datos: mock listo para API real

Un único `apiClient` (axios) lee `VITE_API_URL`. Si la variable está vacía o `VITE_USE_MOCKS=true`, un **mock adapter** intercepta las llamadas y devuelve datos simulados realistas (portfolio que fluctúa, trades aleatorios, market data que cambia cada 2s simulando WebSocket). Cambiar a backend real = setear `VITE_API_URL` y `VITE_USE_MOCKS=false`. Endpoints implementados según contrato:

- `POST /auth/login` → JWT + tenant_id
- `GET /portfolio` → PortfolioSnapshot
- `GET /trades?status=&page=&size=` → paginado
- `GET /market/current` + stream WS `/ws/market`
- `GET/PUT /config`, `POST /config/apikeys`
- `GET /admin/tenants` (solo ADMIN)

Todos los tipos del prompt (`Trade`, `PortfolioSnapshot`, `MarketCondition`, `StrategyConfig`, `BotUser`) se replican en `src/shared/types/`.

## Features y páginas

1. **Auth** (`/login`) — Form email/password + selector de tenant, guarda JWT en zustand + localStorage, interceptor añade `Authorization: Bearer`. Rutas protegidas vía `<RequireAuth>` y `<RequireAdmin>`.
2. **Dashboard** (`/`) — 4 cards (Balance Total, P&L Diario, Strategy Status, Bot Control), Equity Chart (Recharts, área), Market Indicators (ADX/RSI/EMAs), tabla de trades recientes.
3. **Trades** (`/trades`) — Tabla paginada con filtros (status, símbolo, estrategia, rango de fechas), badges BUY/SELL, P&L con color verde/rojo, modal de detalle.
4. **Market** (`/market`) — Price ticker grande con cambio %, panel de indicadores en tiempo real, badge de condición de mercado (Ranging / Trend Up / Trend Down / Scalping), mini sparkline.
5. **Config** (`/config`) — Tabs: API Keys (Binance, validación Zod, "encriptación" lado servidor), Strategy (Auto-Switch vs Manual + selector), Risk Settings (sliders: max position %, max daily loss %, stop loss %), Notificaciones Telegram (chat ID).
6. **Admin** (`/admin`) — Tabla de tenants con plan (Starter/Pro/Enterprise), estado activo, métricas globales (usuarios totales, MRR estimado, trades del día). Solo accesible si role = ADMIN.

## Layout y navegación

- **Sidebar colapsable** (shadcn) con: Dashboard, Trades, Market, Config, Admin (condicional).
- **TopNav** con: nombre tenant, plan badge, P&L del día compacto, BotToggle global (pausar/activar bot), avatar + logout.
- Mobile: sidebar se vuelve sheet, cards apilados.

## Tema visual (Binance dark)

Tokens en `index.css` y `tailwind.config.ts` (todo HSL):
- `--background: 220 13% 6%` (#0B0E11)
- `--card / --surface: 215 14% 14%` (#1E2329)
- `--primary: 45 93% 49%` (#F0B90B yellow)
- `--success: 152 88% 42%` (#0ECB81)
- `--destructive: 351 91% 62%` (#F6465D)
- `--foreground: 210 17% 92%` (#EAECEF)
- `--muted-foreground: 217 8% 57%` (#848E9C)

Variantes custom de Badge: `success`, `warning`, `danger`. Tipografía mono para números/precios. Tabular-nums.

## Real-time (mock + ready para WS)

`useWebSocket<T>(path)` con misma firma que el ejemplo Vue: data, connected, error, reconnect exponencial. En modo mock, emite eventos cada 2s con precios y condición de mercado fluctuantes. Cambiar a WS real = setear `VITE_WS_URL`.

## Dependencias a añadir

`recharts`, `axios`, `zustand`, `zod` (form validation), `date-fns`. React Query ya está disponible para fetching/caching.

## Detalles técnicos

- TypeScript strict, sin `any` implícitos.
- Stores zustand tipados (auth, bot status, UI sidebar).
- React Query para cache de portfolio/trades/config con `refetchInterval`.
- Formularios con `react-hook-form` + Zod (ya disponibles en el stack).
- Toda la lógica de roles (ADMIN vs USER) en el frontend basada en JWT decoded; preparado para validación server-side cuando exista backend.
- Sin Lovable Cloud por ahora (datos mock); migrar a Cloud o API externa es flip de variable.

## Out of scope (esta iteración)

- Encriptación real de API keys (se simula; debe hacerse en backend).
- Ejecución real de órdenes Binance.
- WebSocket real (preparado, conecta cuando exista endpoint).
- Persistencia multi-tenant real (mockeada).

Al aprobar el plan, genero todo el código.
