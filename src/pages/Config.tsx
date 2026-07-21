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

          {/* SMC: HTF macro structure */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                HTF Macro Structure
                <Badge variant="outline" className={cfg.useHtfStructureFilter ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.useHtfStructureFilter ? "ACTIVO" : "OFF"}
                </Badge>
              </CardTitle>
              <CardDescription>Bloquea entradas contra la tendencia de H1</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Timeframe" value={cfg.htfTimeframe} />
              <Row label="Pivot strength" value={cfg.htfPivotStrength} />
              <Row label="Kill zone" value={`${cfg.killzoneThreshold}h`} />
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

          {/* SMC: Order Blocks */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Order Blocks
                <Badge variant="outline" className={cfg.useOrderBlockFilter ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.useOrderBlockFilter ? "ACTIVO" : "OFF"}
                </Badge>
              </CardTitle>
              <CardDescription>M5 solo dispara dentro de una zona demand/supply válida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="Pivot strength" value={cfg.obPivotStrength} />
              <Row label="Desplazamiento mín." value={`${cfg.obDisplacementAtr}× ATR`} />
              <Row label="Max blocks activos" value={cfg.obMaxBlocks} />
            </CardContent>
          </Card>

          {/* SMC: Structural SL + R:R */}
          <Card className="border-strong bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Structural SL + R:R
                <Badge variant="outline" className={cfg.useStructuralSl ? "border-success/40 text-success" : "border-muted text-muted-foreground"}>
                  {cfg.useStructuralSl ? "ACTIVO" : "OFF"}
                </Badge>
              </CardTitle>
              <CardDescription>SL más allá del último swing · aborta si no llega al R:R mínimo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <Row label="R:R mínimo" value={`${cfg.rrMinRatio}:1`} />
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
              <CardDescription>Partial TP · Re-entry · Motor SMC</CardDescription>
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">🎯 Motor de entrada</p>
                <Row label="Modo" value="Smart Money Concepts (SMC)" />
                <Row label="Confirmación" value="HTF structure + Order Block" />
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default Config;
