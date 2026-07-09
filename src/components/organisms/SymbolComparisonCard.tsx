import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SymbolComparison } from "@/shared/types";
import { BarChart3 } from "lucide-react";

interface Props {
  data: SymbolComparison[];
}

export const SymbolComparisonCard = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <Card className="border-strong bg-surface h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Rendimiento por Símbolo
          </CardTitle>
        </CardHeader>
        <CardContent className="h-32 flex items-center justify-center text-sm text-muted-foreground">
          Sin operaciones cerradas aún
        </CardContent>
      </Card>
    );
  }

  const maxTrades = Math.max(...data.map((d) => d.totalTrades), 1);

  return (
    <Card className="border-strong bg-surface h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Rendimiento por Símbolo
        </CardTitle>
        <CardDescription className="text-xs">{data.map(d => d.symbol.replace('USDT','')).join(' · ')} — stats por símbolo operado</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.map((sym) => (
            <div key={sym.symbol} className="rounded border border-strong p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">{sym.symbol.replace("USDT", "")}</span>
                <span className={cn(
                  "font-mono text-xs font-bold",
                  sym.totalPnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {sym.totalPnl >= 0 ? "+" : ""}${sym.totalPnl.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Trades</span>
                  <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                    <div className="h-full rounded bg-primary" style={{ width: `${(sym.totalTrades / maxTrades) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[10px] w-6 text-right">{sym.totalTrades}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Win Rate</span>
                  <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                    <div className={cn(
                      "h-full rounded",
                      sym.winRate >= 50 ? "bg-success" : "bg-destructive"
                    )} style={{ width: `${sym.winRate}%` }} />
                  </div>
                  <span className="font-mono text-[10px] w-8 text-right">{sym.winRate.toFixed(0)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Profit F.</span>
                  <span className={cn(
                    "font-mono text-xs font-bold ml-auto",
                    sym.profitFactor >= 1.5 ? "text-success" : sym.profitFactor >= 1.0 ? "text-primary" : "text-destructive"
                  )}>
                    {sym.profitFactor.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20">Gross P/L</span>
                  <span className="font-mono text-[10px] text-success ml-auto">+${sym.grossProfit.toFixed(0)}</span>
                  <span className="font-mono text-[10px] text-destructive">-${sym.grossLoss.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
