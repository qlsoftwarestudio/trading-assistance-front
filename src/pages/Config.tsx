import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, RefreshCw, Send, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";

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
              <CardDescription>Símbolo, timeframe y estado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Símbolo" value={cfg.symbol} />
              <Row label="Timeframe" value={cfg.timeframe} />
              <Row label="Habilitada" value={
                <Badge variant="outline" className={cfg.enabled ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.enabled ? "SÍ" : "NO"}
                </Badge>
              } />
              <Row label="Apalancamiento" value={`${cfg.leverage}x`} />
              <Row label="Tamaño posición" value={`${cfg.positionSizePct}%`} />
              <Row label="Testnet Binance" value={
                cfg.binanceTestnet
                  ? <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3 w-3" /> Sí (testnet)</span>
                  : <span className="flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3" /> No (live)</span>
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
              <Row label="Lookback Bars" value={cfg.lookbackBars} />
              <Row label="Zone Percentile (bottom/top %)" value={cfg.killzoneThreshold} />
              <Row label="Min Momentum" value={`${cfg.minMomentum}%`} />
            </CardContent>
          </Card>

          {/* Risk */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Riesgo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Stop Loss" value={cfg.useAtrStop ? `ATR(${cfg.atrPeriod}) × ${cfg.atrMultiplier}` : `${cfg.stopLossPct}%`} />
              <Row label="Take Profit" value={`${cfg.takeProfitPct}%`} />
              <Row label="Stop dinámico (ATR)" value={cfg.useAtrStop ? "Habilitado" : "Deshabilitado"} />
            </CardContent>
          </Card>

          {/* Market context */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contexto de mercado</CardTitle>
              <CardDescription>Multi-timeframe + volumen + correlación BTC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Análisis de contexto" value={cfg.contextEnabled ? "Habilitado" : "Deshabilitado"} />
              <Row label="Confluencia requerida" value={cfg.requireConfluence ? "Sí" : "No"} />
              <Row label="Volumen requerido" value={cfg.requireVolume ? "Sí" : "No"} />
              <Row label="Min volumen ratio" value={`${cfg.minVolumeRatio ?? 1.0}x`} />
              <Row label="Auto-ajuste parámetros" value={cfg.autoAdjust ? "Habilitado" : "Deshabilitado"} />
              <Row label="Telegram" value={
                <Badge variant="outline" className={cfg.telegramEnabled ? "border-primary/40 text-primary" : "border-muted text-muted-foreground"}>
                  {cfg.telegramEnabled ? "Conectado" : "Deshabilitado"}
                </Badge>
              } />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Config;
