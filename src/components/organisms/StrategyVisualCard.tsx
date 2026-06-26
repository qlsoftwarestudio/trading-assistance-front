import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelSprite, getHunterSprite, getSwingSprite } from "@/components/molecules/PixelSprite";
import { cn } from "@/lib/utils";
import { Crosshair, Fish } from "lucide-react";
import type { Trade } from "@/shared/types";

// Floating Z's animation for sleeping hunter
const SleepingZ = () => (
  <div className="absolute -top-4 right-0 flex flex-col items-end pointer-events-none">
    <span className="text-[10px] text-muted-foreground opacity-0 animate-[floatZ_3s_ease-in-out_infinite]">
      Z
    </span>
    <span className="text-[8px] text-muted-foreground opacity-0 animate-[floatZ_3s_ease-in-out_infinite_1s]">
      z
    </span>
    <style>{`
      @keyframes floatZ {
        0% { opacity: 0; transform: translateY(0) translateX(0); }
        30% { opacity: 0.7; }
        70% { opacity: 0.5; }
        100% { opacity: 0; transform: translateY(-12px) translateX(4px); }
      }
    `}</style>
  </div>
);

interface Props {
  trades: Trade[];
}

export const StrategyVisualCard = ({ trades }: Props) => {
  const now = Date.now();

  const openScalp = trades.filter((t) => t.status === "OPEN" && t.setupType?.startsWith("SCALP_"));
  const openSwing = trades.filter((t) => t.status === "OPEN" && !t.setupType?.startsWith("SCALP_"));

  const lastClosedSwing = useMemo(() => {
    return trades
      .filter((t) => t.status === "CLOSED" && !t.setupType?.startsWith("SCALP_"))
      .sort((a, b) => new Date(b.exitTime ?? b.entryTime).getTime() - new Date(a.exitTime ?? a.entryTime).getTime())[0];
  }, [trades]);

  const lastClosedScalp = useMemo(() => {
    return trades
      .filter((t) => t.status === "CLOSED" && t.setupType?.startsWith("SCALP_"))
      .sort((a, b) => new Date(b.exitTime ?? b.entryTime).getTime() - new Date(a.exitTime ?? a.entryTime).getTime())[0];
  }, [trades]);

  // Killzone check: London 07-10 UTC, NY 12-15 UTC
  const utcHour = new Date().getUTCHours();
  const inKillzone = (utcHour >= 7 && utcHour < 10) || (utcHour >= 12 && utcHour < 15);

  const hunterSprite = getHunterSprite(openScalp.length, inKillzone);
  const swingSprite = getSwingSprite(openSwing.length, lastClosedSwing ? Math.floor((now - new Date(lastClosedSwing.exitTime ?? lastClosedSwing.entryTime).getTime()) / 60000) : undefined);

  const hunterLabel = openScalp.length > 0
    ? `Scalp abierto — ${openScalp[0].symbol.replace("USDT", "")}`
    : inKillzone
      ? "En killzone — buscando entrada"
      : "Fuera de killzone — descansando";

  const swingLabel = openSwing.length > 0
    ? `Swing abierto — ${openSwing[0].symbol.replace("USDT", "")}`
    : lastClosedSwing
      ? "Esperando señal"
      : "Esperando señal";

  return (
    <Card className="border-strong bg-surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          Estado de Estrategias
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Hunter */}
          <div className="flex flex-col items-center gap-2 rounded border border-strong p-3 bg-surface-2/30">
            <div className="flex items-center gap-2">
              <Crosshair className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Hunter</span>
            </div>
            <div className="relative my-1">
              <PixelSprite
                sprite={hunterSprite}
                size={5}
                animate={hunterSprite === "hunter_shooting"}
              />
              {hunterSprite === "hunter_idle" && <SleepingZ />}
            </div>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {hunterLabel}
            </span>
            {lastClosedScalp && (
              <span className={cn(
                "text-[10px] font-mono font-bold",
                (lastClosedScalp.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
              )}>
                Último: {(lastClosedScalp.pnl ?? 0) >= 0 ? "+" : ""}${(lastClosedScalp.pnl ?? 0).toFixed(2)}
              </span>
            )}
          </div>

          {/* Swing */}
          <div className="flex flex-col items-center gap-2 rounded border border-strong p-3 bg-surface-2/30">
            <div className="flex items-center gap-2">
              <Fish className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Swing</span>
            </div>
            <PixelSprite
              sprite={swingSprite}
              size={5}
              animate={swingSprite === "swing_reeling"}
              className="my-1"
            />
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {swingLabel}
            </span>
            {lastClosedSwing && (
              <span className={cn(
                "text-[10px] font-mono font-bold",
                (lastClosedSwing.pnl ?? 0) >= 0 ? "text-success" : "text-destructive"
              )}>
                Último: {(lastClosedSwing.pnl ?? 0) >= 0 ? "+" : ""}${(lastClosedSwing.pnl ?? 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
