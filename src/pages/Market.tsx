import { useMarketStream } from "@/shared/hooks/useMarketStream";
import { PriceTicker } from "@/components/organisms/PriceTicker";
import { MarketIndicators } from "@/components/organisms/MarketIndicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategyBadge } from "@/components/molecules/StrategyBadge";
import { Sparkline } from "@/components/atoms/Sparkline";
import { useEffect, useRef, useState } from "react";

const Market = () => {
  const { data: market, connected } = useMarketStream();
  const [history, setHistory] = useState<{ value: number }[]>([]);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!market) return;
    if (market.currentPrice !== last.current) {
      last.current = market.currentPrice;
      setHistory((h) => [...h.slice(-59), { value: market.currentPrice }]);
    }
  }, [market]);

  if (!market) return <div className="text-muted-foreground text-sm">Conectando al stream de mercado…</div>;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mercado en tiempo real</h1>
        <p className="text-sm text-muted-foreground">Indicadores actualizados cada 2s · estrategia detectada automáticamente</p>
      </div>

      <PriceTicker data={market} connected={connected} />

      {history.length > 1 && (
        <Card className="border-strong bg-surface">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground font-medium">Movimiento reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline
              data={history}
              positive={history[history.length - 1].value >= history[0].value}
              height={80}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MarketIndicators data={market} />
        <Card className="border-strong bg-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium">Estrategia recomendada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <StrategyBadge condition={market.marketCondition} />
            </div>
            <p className="text-sm text-muted-foreground">
              {market.marketCondition === "RANGING" && "Mercado lateral. La estrategia Range opera entre soportes y resistencias."}
              {market.marketCondition === "TREND_UP" && "Tendencia alcista detectada. La estrategia Trend Following sigue el momentum."}
              {market.marketCondition === "TREND_DOWN" && "Tendencia bajista. El bot opera en corto si está habilitado."}
              {market.marketCondition === "SCALPING_OPPORTUNITY" && "Alta volatilidad. La estrategia Scalping captura movimientos cortos."}
              {market.marketCondition === "NEUTRAL" && "Sin condiciones claras. El bot espera una señal definitiva."}
            </p>
            {market.levels && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-strong">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Soportes</p>
                  <ul className="space-y-0.5 font-mono text-xs text-success">
                    {market.levels.support.slice(0, 3).map((s) => <li key={s}>${s.toLocaleString()}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Resistencias</p>
                  <ul className="space-y-0.5 font-mono text-xs text-destructive">
                    {market.levels.resistance.slice(0, 3).map((r) => <li key={r}>${r.toLocaleString()}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;
