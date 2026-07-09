import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, RefreshCw, Send, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, XCircle } from "lucide-react";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-strong last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-mono font-medium">{value}</span>
  </div>
);

const Config = () => {
  const { data: cfg, isLoading } = useQuery({ queryKey: ["admin-config"], queryFn: () => api.getAdminConfig() });

  const { mutate: execStrategy, isPending: executing } = useMutation({
    mutationFn: () => api.executeStrategy(),
    onSuccess: (r) => toast.success(r.message),
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

  if (isLoading) return <div className="text-muted-foreground text-sm">Cargando configuración…</div>;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Parámetros activos de la estrategia — editar en <code className="text-primary">.env</code> y reiniciar el servidor</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => execStrategy()} disabled={executing} variant="default">
          {executing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Ejecutar estrategia
        </Button>
        <Button onClick={() => monitorTrades()} disabled={monitoring} variant="outline">
          {monitoring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Monitorear trades
        </Button>
        <Button onClick={() => testTelegram()} disabled={testingTg} variant="outline">
          {testingTg ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Test Telegram
        </Button>
      </div>

      {cfg && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Core strategy */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estrategia principal</CardTitle>
              <CardDescription>Símbolos, timeframe y estado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Símbolos activos" value={cfg.symbols ?? cfg.symbol} />
              <Row label="Timeframe" value={cfg.timeframe} />
              <Row label="Habilitada" value={
                <Badge variant="outline" className={cfg.enabled ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.enabled ? "SÍ" : "NO"}
                </Badge>
              } />
              <Row label="Apalancamiento" value={`${cfg.leverage}x`} />
              <Row label="Tamaño posición" value={`${cfg.positionSizePct}%`} />
              <Row label="Max trades simultáneos" value={cfg.maxConcurrentTrades} />
              <Row label="Max hold" value={`${cfg.maxHoldMinutes} min`} />
              <Row label="Intercambio activo" value={
                <span className="flex items-center gap-1 text-success">
                  <ShieldCheck className="h-3 w-3" />
                  {cfg.activeExchange ? cfg.activeExchange.toUpperCase() : "BINGX"} (live)
                </span>
              } />
            </CardContent>
          </Card>

          {/* RSI & entry filters */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Filtros de entrada (RSI)</CardTitle>
              <CardDescription>Condiciones de señal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="RSI Length" value={cfg.rsiLength} />
              <Row label="RSI Oversold (LONG)" value={`< ${cfg.rsiOversold}`} />
              <Row label="RSI Overbought (SHORT)" value={`> ${cfg.rsiOverbought}`} />
              <Row label="RSI Overbought uptrend" value={`> ${cfg.rsiOverboughtUptrend}`} />
              <Row label="Lookback Bars" value={cfg.lookbackBars} />
              <Row label="Zone Percentile" value={`${cfg.killzoneThreshold}%`} />
              <Row label="Min Momentum" value={`${cfg.minMomentum}%`} />
            </CardContent>
          </Card>

          {/* Risk */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Stop Loss" value={cfg.useAtrStop ? `ATR(${cfg.atrPeriod}) × ${cfg.atrMultiplier}` : `${cfg.stopLossPct}%`} />
              <Row label="Take Profit" value={`${cfg.takeProfitPct}%`} />
              <Row label="Stop dinámico (ATR)" value={
                cfg.useAtrStop
                  ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Habilitado</span>
                  : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Deshabilitado</span>
              } />
              <Row label="Trailing Stop" value={`${cfg.swingTrailingStopPct ?? cfg.trailingStopPct}%`} />
              <Row label="Trailing activación" value={`+${cfg.swingTrailingActivationPct ?? cfg.trailingActivationPct}%`} />
              <Row label="Breakeven activación" value={`+${cfg.breakevenActivationPct}%`} />
              <Row label="Cooldown SL" value={`${cfg.slCooldownMinutes} min`} />
              <Row label="Max pérdida diaria" value={`${cfg.maxDailyLossPct}%`} />
            </CardContent>
          </Card>

          {/* Advanced filters */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Filtros avanzados</CardTitle>
              <CardDescription>VWAP · EMA · Regresión · Delta volumen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="VWAP filter" value={cfg.useVwapFilter
                ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> ±{cfg.vwapBandPct}%</span>
                : <span className="text-muted-foreground">Off</span>
              } />
              <Row label="EMA filter" value={cfg.useEmaFilter
                ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> EMA{cfg.emaPeriod}</span>
                : <span className="text-muted-foreground">Off</span>
              } />
              <Row label="Regresión lineal" value={cfg.useRegressionFilter
                ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> {cfg.regressionLookback} velas</span>
                : <span className="text-muted-foreground">Off</span>
              } />
              <Row label="Delta volumen" value={cfg.useDeltaVolumeFilter
                ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> umbral &gt;{cfg.deltaVolumeThreshold}</span>
                : <span className="text-muted-foreground">Off</span>
              } />
            </CardContent>
          </Card>

          {/* Stochastic + Bollinger Bands */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Stochastic + Bollinger Bands
                <Badge variant="outline" className={cfg.useStochBbFilter ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.useStochBbFilter ? "ACTIVO" : "OFF"}
                </Badge>
              </CardTitle>
              <CardDescription>Filtro de triple confluencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Periodo Stoch" value={cfg.stochPeriod} />
              <Row label="Stoch Oversold (LONG)" value={`< ${cfg.stochOversold}`} />
              <Row label="Stoch Overbought (SHORT)" value={`> ${cfg.stochOverbought}`} />
              <Row label="BB Periodo" value={cfg.bbPeriod} />
              <Row label="BB Desv. estándar" value={`±${cfg.bbStdDev}σ`} />
              <Row label="BB proximidad" value={`< ${cfg.bbProximityPct}%`} />
              <Row label="SL dinámico BB" value={cfg.useBbBasedSl
                ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Habilitado</span>
                : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Off</span>
              } />
            </CardContent>
          </Card>

          {/* Market context + Auto-adjust */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contexto · Auto-ajuste · Sistema</CardTitle>
              <CardDescription>Multi-timeframe + aprendizaje automático</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Análisis de contexto" value={cfg.contextEnabled ? "Habilitado" : "Deshabilitado"} />
              <Row label="Confluencia requerida" value={cfg.requireConfluence ? "Sí" : "No"} />
              <Row label="Volumen requerido" value={cfg.requireVolume ? "Sí" : "No"} />
              <Row label="Min volumen ratio" value={`${cfg.minVolumeRatio ?? 1.0}x`} />
              <Row label="Auto-ajuste" value={
                cfg.autoAdjustEnabled
                  ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> {cfg.autoAdjustMinTrades} trades mín · WR &gt;{Math.round((cfg.autoAdjustWinRateThreshold ?? 0.3) * 100)}%</span>
                  : <span className="text-muted-foreground">Off</span>
              } />
              <Row label="Telegram" value={
                <Badge variant="outline" className={cfg.telegramEnabled ? "border-primary/40 text-primary" : "border-muted text-muted-foreground"}>
                  {cfg.telegramEnabled ? "Conectado" : "Deshabilitado"}
                </Badge>
              } />
            </CardContent>
          </Card>

          {/* New features: Partial TP / Re-entry / Breakout */}
          <Card className="border-strong bg-surface md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mejoras recientes</CardTitle>
              <CardDescription>Partial TP · Re-entry · Breakout Strategy</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">✂️ Partial Take Profit</p>
                <Row label="Estado" value={
                  cfg.partialTpEnabled
                    ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Activo</span>
                    : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Off</span>
                } />
                <Row label="Cierra" value="50% en 1:1 R" />
                <Row label="SL tras TP1" value="Mueve a breakeven" />
              </div>
              <div className="space-y-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">🔁 Re-entry Logic</p>
                <Row label="Estado" value={
                  cfg.reEntryEnabled
                    ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Activo</span>
                    : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Off</span>
                } />
                <Row label="Ventana" value={`${cfg.reEntryWindowMinutes ?? 15} min post-SL`} />
                <Row label="Tamaño" value="50% del normal" />
              </div>
              <div className="space-y-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">💥 Breakout Strategy</p>
                <Row label="Estado" value={
                  cfg.useRangeBreakout
                    ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Activo</span>
                    : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Off</span>
                } />
                <Row label="Lookback" value={`${cfg.breakoutLookback ?? 20} velas`} />
                <Row label="Rango máx" value={`< ${cfg.breakoutMaxRangePct ?? 2.5}%`} />
                <Row label="Vol. mínimo" value={`${cfg.breakoutVolumeMultiplier ?? 2.5}x avg`} />
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default Config;
