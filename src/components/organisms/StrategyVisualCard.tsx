import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixelSprite, getHunterSprite, getSwingSprite } from "@/components/molecules/PixelSprite";
import { cn } from "@/lib/utils";
import { Crosshair, Fish, Eye } from "lucide-react";
import type { Trade } from "@/shared/types";

interface Props {
  trades: Trade[];
}

const ALL_SPRITES = [
  { key: "hunter_idle", label: "Durmiendo", group: "Hunter" },
  { key: "hunter_aiming", label: "Apuntando", group: "Hunter" },
  { key: "hunter_shooting", label: "Disparando", group: "Hunter" },
  { key: "swing_idle", label: "Esperando", group: "Swing" },
  { key: "swing_casting", label: "Lanzando", group: "Swing" },
  { key: "swing_reeling", label: "Recuperando", group: "Swing" },
  { key: "swing_caught", label: "¡Pescado!", group: "Swing" },
] as const;

export const StrategyVisualCard = ({ trades }: Props) => {
  const [showGallery, setShowGallery] = useState(false);
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
            <PixelSprite
              sprite={hunterSprite}
              size={5}
              animate={hunterSprite === "hunter_shooting"}
              className="my-1"
            />
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

        <div className="mt-3 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowGallery((v) => !v)}
          >
            <Eye className="h-3 w-3" />
            {showGallery ? "Ocultar estados" : "Ver todos los estados"}
          </Button>
        </div>

        {showGallery && (
          <div className="mt-3 grid grid-cols-4 gap-2 rounded border border-strong p-2 bg-surface-2/20">
            {ALL_SPRITES.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-1">
                <PixelSprite sprite={s.key} size={3} animate={s.key === "hunter_shooting" || s.key === "swing_reeling"} />
                <span className="text-[8px] text-muted-foreground text-center leading-tight">
                  {s.label}
                </span>
                <span className={cn(
                  "text-[7px] font-bold uppercase tracking-wider",
                  s.group === "Hunter" ? "text-orange-500" : "text-blue-500"
                )}>
                  {s.group}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
