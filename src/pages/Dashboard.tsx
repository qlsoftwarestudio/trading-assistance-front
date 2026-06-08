import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { PortfolioCard } from "@/components/molecules/PortfolioCard";
import { EquityChart } from "@/components/organisms/EquityChart";
import { TradeTable } from "@/components/organisms/TradeTable";
import { Wallet, TrendingUp, Activity, BarChart2 } from "lucide-react";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { data: summary } = useQuery({ queryKey: ["summary"], queryFn: () => api.getDashboardSummary(), refetchInterval: 5_000 });
  const { data: equity = [] } = useQuery({ queryKey: ["equity"], queryFn: () => api.getEquity(), refetchInterval: 30_000 });
  const { data: trades } = useQuery({ queryKey: ["trades", "recent"], queryFn: () => api.getTrades({ size: 6, page: 0 }) });
  const { data: status } = useQuery({ queryKey: ["strategy-status"], queryFn: () => api.getStrategyStatus(), refetchInterval: 30_000 });

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {user?.email?.split("@")[0]}</h1>
          <p className="text-sm text-muted-foreground">Resumen del día — {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard
          title="Balance Total"
          value={summary ? formatCurrency(summary.balance) : "—"}
          icon={Wallet}
          accent
          subtitle={summary ? `Precio actual: $${formatNumber(summary.currentPrice, 4)}` : undefined}
        />
        <PortfolioCard
          title="P&L Total"
          value={summary ? formatCurrency(summary.totalPnl) : "—"}
          icon={TrendingUp}
          subtitle={summary ? `Factor ganancia: ${formatNumber(summary.profitFactor, 2)}` : undefined}
        />
        <PortfolioCard
          title="Win Rate"
          value={summary ? `${formatNumber(summary.winRate, 1)}%` : "—"}
          icon={BarChart2}
          subtitle={summary ? `${summary.winningTrades}W / ${summary.losingTrades}L de ${summary.totalTrades}` : undefined}
        />
        <Card className="border-strong bg-surface gradient-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center justify-between">
              Estado Estrategia
              <Activity className="h-3.5 w-3.5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={status?.status === "ACTIVE" ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                {status?.status ?? "—"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Posiciones abiertas: <span className="text-foreground font-medium">{summary?.openTrades ?? "—"}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <EquityChart data={equity} className="lg:col-span-2" />
        <Card className="border-strong bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Configuración activa</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
            {status?.strategy ?? "Cargando..."}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operaciones recientes</h2>
        <TradeTable trades={trades?.content ?? []} compact currentPrice={summary?.currentPrice} />
      </div>
    </div>
  );
};

export default Dashboard;
