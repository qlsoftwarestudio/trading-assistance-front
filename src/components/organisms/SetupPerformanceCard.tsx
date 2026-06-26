import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SetupPerformance } from "@/shared/types";
import { Target } from "lucide-react";

interface Props {
  data: SetupPerformance[];
}

export const SetupPerformanceCard = ({ data }: Props) => {
  const rows = useMemo(() => {
    return data
      .filter((r) => r.totalTrades > 0)
      .sort((a, b) => b.winRate - a.winRate);
  }, [data]);

  const isScalp = (setup: string) => setup.startsWith("SCALP_");

  return (
    <Card className="border-strong bg-surface h-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Hit Rate por Setup
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Win rate y avg P&L por tipo de entrada
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Sin datos suficientes (mín. 1 trade por setup)
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {rows.map((row) => (
              <div key={`${row.setup}-${row.action}`} className="flex items-center justify-between rounded border border-strong px-2.5 py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider shrink-0 px-1 py-0.5 rounded",
                    isScalp(row.setup) ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {isScalp(row.setup) ? "SCALP" : "SWING"}
                  </span>
                  <span className="text-xs font-medium truncate">
                    {row.setup.replace("SCALP_", "").replace("-", " ")}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-mono shrink-0",
                    row.action === "LONG" ? "border-success/40 text-success" : "border-destructive/40 text-destructive"
                  )}>
                    {row.action}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className={cn(
                      "font-mono text-xs font-bold",
                      row.winRate >= 50 ? "text-success" : "text-destructive"
                    )}>
                      {row.winRate.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {row.winningTrades}W / {row.losingTrades}L
                    </div>
                  </div>
                  <div className="text-right w-14">
                    <div className={cn(
                      "font-mono text-xs font-bold",
                      row.avgPnl >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {row.avgPnl >= 0 ? "+" : ""}${row.avgPnl.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">avg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
