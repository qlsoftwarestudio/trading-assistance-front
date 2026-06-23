import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/shared/api/client";
import { PortfolioCard } from "@/components/molecules/PortfolioCard";
import { TradePerformanceCard } from "@/components/organisms/TradePerformanceCard";
import { TradeTable } from "@/components/organisms/TradeTable";
import { Wallet, TrendingUp, Activity, BarChart2, Power } from "lucide-react";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { data: summary } = useQuery({ queryKey: ["summary"], queryFn: () => api.getDashboardSummary(), refetchInterval: 5_000 });
  const { data: trades } = useQuery({ queryKey: ["trades", "recent"], queryFn: () => api.getTrades({ size: 20, page: 0 }), refetchInterval: 8_000 });
  const { data: status } = useQuery({ queryKey: ["strategy-status"], queryFn: () => api.getStrategyStatus(), refetchInterval: 30_000 });

  const toggleSwing = useMutation({
    mutationFn: api.toggleSwing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["strategy-status"] }),
  });

  const { addDashboardSeconds, checkAchievements } = useGamificationStore();

  useEffect(() => {
    const interval = setInterval(() => {
      addDashboardSeconds(5);
      checkAchievements();
    }, 5000);
    return () => clearInterval(interval);
  }, [addDashboardSeconds, checkAchievements]);

  const swingRunning = status?.swing?.running ?? false;

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
          subtitle={
            summary?.prices && Object.keys(summary.prices).length > 0
              ? Object.entries(summary.prices).map(([sym, price]) => `${sym.replace("USDT", "")}: $${formatNumber(price, 4)}`).join("  ·  ")
              : summary ? `Precio actual: $${formatNumber(summary.currentPrice, 4)}` : undefined
          }
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
              Estado Bot
              <Activity className="h-3.5 w-3.5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={swingRunning ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}>
                {swingRunning ? "ACTIVO" : "PAUSADO"}
              </Badge>
            </div>
            <Button
              size="sm"
              variant={swingRunning ? "destructive" : "default"}
              className="w-full h-7 text-xs gap-1"
              onClick={() => toggleSwing.mutate()}
              disabled={toggleSwing.isPending}
            >
              <Power className="h-3 w-3" />
              {swingRunning ? "Detener bot" : "Iniciar bot"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Posiciones abiertas: <span className="text-foreground font-medium">{summary?.openTrades ?? "—"}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TradePerformanceCard trades={trades?.content ?? []} currentPrice={summary?.currentPrice} className="lg:col-span-2" />
        <Card className="border-strong bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Configuración activa</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
            {status?.swing?.description ?? "Cargando..."}
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
