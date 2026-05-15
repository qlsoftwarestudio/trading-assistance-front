import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { PortfolioCard } from "@/components/molecules/PortfolioCard";
import { EquityChart } from "@/components/organisms/EquityChart";
import { MarketIndicators } from "@/components/organisms/MarketIndicators";
import { TradeTable } from "@/components/organisms/TradeTable";
import { PriceTicker } from "@/components/organisms/PriceTicker";
import { BotToggle } from "@/components/molecules/BotToggle";
import { useMarketStream } from "@/shared/hooks/useMarketStream";
import { Wallet, TrendingUp, Calendar, Briefcase } from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { StrategyBadge } from "@/components/molecules/StrategyBadge";
import { useBotStore } from "@/store/botStore";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { active } = useBotStore();
  const { data: portfolio } = useQuery({ queryKey: ["portfolio"], queryFn: () => api.getPortfolio(), refetchInterval: 5000 });
  const { data: equity = [] } = useQuery({ queryKey: ["equity"], queryFn: () => api.getEquity(), refetchInterval: 30_000 });
  const { data: trades }    = useQuery({ queryKey: ["trades", "recent"], queryFn: () => api.getTrades({ size: 6, page: 0 }) });
  const { data: config }    = useQuery({ queryKey: ["config"], queryFn: () => api.getConfig() });
  const { data: market, connected } = useMarketStream();

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {user?.email?.split("@")[0]}</h1>
          <p className="text-sm text-muted-foreground">Resumen del día — {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <BotToggle />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard
          title="Balance Total"
          value={portfolio ? formatCurrency(portfolio.totalBalance) : "—"}
          changePercent={portfolio?.dailyPnLPercent}
          icon={Wallet}
          accent
        />
        <PortfolioCard
          title="P&L Diario"
          value={portfolio ? formatCurrency(portfolio.dailyPnL) : "—"}
          changePercent={portfolio?.dailyPnLPercent}
          icon={TrendingUp}
          subtitle={portfolio ? `Semana: ${formatCurrency(portfolio.weeklyPnL)}` : undefined}
        />
        <PortfolioCard
          title="Disponible"
          value={portfolio ? formatCurrency(portfolio.availableBalance) : "—"}
          icon={Briefcase}
          subtitle={portfolio ? `${portfolio.openPositions} posiciones abiertas` : undefined}
        />
        <Card className="border-strong bg-surface gradient-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center justify-between">
              Estado del Bot
              <Calendar className="h-3.5 w-3.5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${active ? "text-success" : "text-muted-foreground"}`}>
                {active ? "Operando" : "Pausado"}
              </span>
            </div>
            {market && config && (
              <StrategyBadge condition={market.marketCondition} strategy={config.general.selectedStrategy} />
            )}
            <p className="text-xs text-muted-foreground">
              Modo: <span className="text-foreground font-medium">{config?.general.mode === "AUTO_SWITCH" ? "Auto-Switch" : "Manual"}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {market && <PriceTicker data={market} connected={connected} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <EquityChart data={equity} className="lg:col-span-2" />
        {market && <MarketIndicators data={market} />}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operaciones recientes</h2>
        <TradeTable trades={trades?.content ?? []} compact />
      </div>
    </div>
  );
};

export default Dashboard;
