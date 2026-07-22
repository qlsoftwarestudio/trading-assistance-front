import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DlgDesc } from "@/components/ui/dialog";
import { Activity, TrendingUp, BarChart2, Clock, Play, RefreshCw, Send, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BacktestResult, Signal } from "@/shared/types";

const fmt = (v: number | undefined, d = 2) => v !== undefined ? v.toFixed(d) : "—";
const fmtDate = (iso: string | undefined) =>
  iso ? new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const Admin = () => {
  const qc = useQueryClient();
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestOpen, setBacktestOpen] = useState(false);

  const { data: health } = useQuery({ queryKey: ["admin-health"], queryFn: () => api.getAdminHealth(), refetchInterval: 15_000 });
  const { data: cfg } = useQuery({ queryKey: ["admin-config"], queryFn: () => api.getAdminConfig() });
  const { data: signalsRaw } = useQuery({ queryKey: ["signals"], queryFn: () => api.getSignals(), refetchInterval: 30_000 });
  const signals = Array.isArray(signalsRaw) ? signalsRaw : [];

  const { mutate: execStrategy, isPending: executing } = useMutation({
    mutationFn: () => api.executeStrategy(),
    onSuccess: (r) => { toast.success(r.message); qc.invalidateQueries({ queryKey: ["signals"] }); },
    onError: () => toast.error("Error al ejecutar estrategia"),
  });

  const { mutate: monitorTrades, isPending: monitoring } = useMutation({
    mutationFn: () => api.monitorTrades(),
    onSuccess: (r) => toast.success(r.message),
    onError: () => toast.error("Error al monitorear trades"),
  });

  const { mutate: testTelegram, isPending: testingTg } = useMutation({
    mutationFn: () => api.testTelegram(),
    onSuccess: (r) => toast.success(r.message),
    onError: () => toast.error("Error al enviar test Telegram"),
  });

  const { mutate: runBacktest, isPending: runningBacktest } = useMutation({
    mutationFn: () => api.runBacktest(500),
    onSuccess: (r) => { setBacktestResult(r); setBacktestOpen(true); toast.success("Backtest completado"); },
    onError: () => toast.error("Error en el backtest"),
  });

  const { mutate: runWalkForward, isPending: runningWF } = useMutation({
    mutationFn: () => api.runWalkForwardBacktest(500),
    onSuccess: (r) => { setBacktestResult(r); setBacktestOpen(true); toast.success("Walk-forward completado"); },
    onError: () => toast.error("Error en el walk-forward"),
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">Operaciones del bot, salud del sistema y backtest</p>
      </div>

      {/* Health KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-strong bg-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Estrategia</span>
            </div>
            <Badge variant="outline" className={health?.strategyEnabled ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
              {health?.strategyEnabled ? "Activa" : "Deshabilitada"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{health?.symbol} · {health?.timeframe}</p>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Posiciones</span>
            </div>
            <p className="text-2xl font-bold">{health?.openTrades ?? "—"}</p>
            <p className="text-xs text-muted-foreground">de {health?.totalTrades ?? "—"} totales</p>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Última señal</span>
            </div>
            <p className="text-xs font-mono">{fmtDate(health?.lastSignalAt)}</p>
            <p className="text-xs text-muted-foreground mt-1">Binance: {health?.binanceTestnet ? "testnet" : "live"}</p>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Uptime</span>
            </div>
            <p className="text-lg font-bold font-mono">{health?.uptime ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Telegram: {health?.telegramEnabled ? "activo" : "off"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Controls */}
      <Card className="border-strong bg-surface">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Controles manuales</CardTitle>
          <CardDescription>Ejecuta operaciones del bot manualmente</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => execStrategy()} disabled={executing}>
            {executing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Ejecutar estrategia
          </Button>
          <Button variant="outline" onClick={() => monitorTrades()} disabled={monitoring}>
            {monitoring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Monitorear trades
          </Button>
          <Button variant="outline" onClick={() => testTelegram()} disabled={testingTg}>
            {testingTg ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Test Telegram
          </Button>
          <Separator orientation="vertical" className="h-9 hidden sm:block" />
          <Button variant="secondary" onClick={() => runBacktest()} disabled={runningBacktest || runningWF}>
            {runningBacktest ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Backtest (500 velas)
          </Button>
          <Button variant="secondary" onClick={() => runWalkForward()} disabled={runningWF || runningBacktest}>
            {runningWF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Walk-Forward
          </Button>
        </CardContent>
      </Card>

      {/* Backtest result dialog */}
      <Dialog open={backtestOpen} onOpenChange={setBacktestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resultado del Backtest</DialogTitle>
            <DlgDesc>{backtestResult?.symbol} · {backtestResult?.timeframe} · {backtestResult?.totalTrades} trades</DlgDesc>
          </DialogHeader>
          {backtestResult && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Win Rate", `${((backtestResult.winRate ?? 0) * 100).toFixed(1)}%`],
                  ["P&L Total", `$${fmt(backtestResult.totalPnl)}`],
                  ["Profit Factor", fmt(backtestResult.profitFactor)],
                  ["Max Drawdown", `${fmt(backtestResult.maxDrawdownPct)}%`],
                  ["Sharpe Ratio", fmt(backtestResult.sharpeRatio)],
                  ["Trades ganadores", `${backtestResult.winningTrades} / ${backtestResult.totalTrades}`],
                ].map(([label, value], idx) => (
                  <div key={label ?? idx} className="flex flex-col rounded border border-strong p-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
                    <span className="font-mono font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Strategy config (compact) */}
      {cfg && (
        <Card className="border-strong bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Parámetros activos</CardTitle>
            <CardDescription>Configuración cargada desde variables de entorno</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                `${cfg.symbol}`, `${cfg.timeframe}`, `RSI(${cfg.rsiLength})`,
                `SL: ${cfg.stopLossPct}%`, `TP: ${cfg.takeProfitPct}%`,
                `${cfg.positionSizePct}% pos.`, `${cfg.leverage}x`,
                cfg.contextEnabled ? "ctx:ON" : "ctx:OFF",
                cfg.useAtrStop ? `ATR(${cfg.atrPeriod})` : "fixed SL",
                `TS: ${cfg.trailingStopPct}%`,
                cfg.useHtfStructureFilter ? "HTF:ON" : "HTF:OFF",
                cfg.useOrderBlockFilter ? "OB:ON" : "OB:OFF",
                cfg.useStructuralSl ? `SL:${cfg.rrMinRatio}:1` : "SL:ATR",
                cfg.binanceTestnet ? "testnet" : "live",
              ].map((tag) => (
                <span key={tag} className="rounded bg-muted px-2 py-0.5">{tag}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signal log */}
      <Card className="border-strong bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimas señales</CardTitle>
          <CardDescription>Señales generadas por la estrategia (máx. 20)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-strong hover:bg-transparent">
                <TableHead className="text-xs pl-4">Fecha</TableHead>
                <TableHead className="text-xs">Señal</TableHead>
                <TableHead className="text-xs text-right">Precio</TableHead>
                <TableHead className="text-xs text-right">RSI</TableHead>
                <TableHead className="text-xs">1h/4h/1d</TableHead>
                <TableHead className="text-xs">Ejecutada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.slice(0, 20).map((s: Signal) => (
                <TableRow key={s.id} className="border-strong hover:bg-surface-2/40">
                  <TableCell className="text-xs text-muted-foreground pl-4 whitespace-nowrap">{fmtDate(s.generatedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-mono text-[10px]",
                      s.action === "LONG" ? "border-success/40 text-success"
                        : s.action === "SHORT" ? "border-destructive/40 text-destructive"
                          : "border-muted text-muted-foreground")}>
                      {s.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">${fmt(s.price, 4)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmt(s.rsi)}</TableCell>
                  <TableCell className="font-mono text-xs">{s.trend1h ?? "—"}/{s.trend4h ?? "—"}/{s.trend1d ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", s.executed ? "border-primary/40 text-primary" : "border-muted text-muted-foreground")}>
                      {s.executed ? "SÍ" : "NO"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {signals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Sin señales registradas</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
