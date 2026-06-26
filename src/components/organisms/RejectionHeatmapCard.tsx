import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RejectionHeatmapItem } from "@/shared/types";
import { ShieldAlert } from "lucide-react";

interface Props {
  data: RejectionHeatmapItem[];
}

const reasonLabels: Record<string, string> = {
  VWAP_FILTER: "VWAP",
  EMA_FILTER: "EMA",
  CONTEXT_FILTER: "Contexto",
  NO_CONFLUENCE: "Sin confluencia",
  CONTEXT_VOLUME_LOW: "Volumen bajo",
  DELTA_VOLUME_FILTER: "Delta vol",
  STOCH_BB_FILTER: "Stoch+BB",
  AUTO_ADJUST_BLOCKED: "Auto-adjust",
  REGRESSION_FILTER: "Regresión",
  ANTI_CRASH_FILTER: "Anti-crash",
  ANTI_PUMP_FILTER: "Anti-pump",
  TREND_DIP_DOWNTREND: "Tendencia DOWN",
  TREND_DIP_UPTREND: "Tendencia UP",
  TREND1H_MEANREV_FILTER: "Trend1h",
  UPTREND_CONDITIONS: "Uptrend cond.",
  VOLUME_LOW: "Volumen",
  M5_TREND_FILTER: "M5 trend",
  MARKET_CONDITION_GATE: "Market gate",
  CONDITIONS_NOT_MET: "No condiciones",
};

export const RejectionHeatmapCard = ({ data }: Props) => {
  const rows = useMemo(() => {
    return [...data].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [data]);

  const maxCount = rows.length > 0 ? rows[0].count : 1;

  return (
    <Card className="border-strong bg-surface h-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Rejection Heatmap
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Señales rechazadas por filtro (últimos 7 días)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Sin datos de rechazo aún
          </div>
        ) : (
          <div className="space-y-1.5">
            {rows.map((row) => {
              const widthPct = Math.max(5, (row.count / maxCount) * 100);
              return (
                <div key={row.reason} className="relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-destructive/10"
                    style={{ width: `${widthPct}%` }}
                  />
                  <div className="relative flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-medium">
                      {reasonLabels[row.reason] ?? row.reason}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{row.count}</span>
                      <span className="font-mono text-[10px] text-muted-foreground w-10 text-right">{row.pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
