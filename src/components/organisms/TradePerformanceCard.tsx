import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/shared/lib/format";
import type { Trade } from "@/shared/types";

interface Props {
  trades: Trade[];
  currentPrice?: number;
  className?: string;
}

export const TradePerformanceCard = ({ trades, currentPrice, className }: Props) => {
  const closed = useMemo(
    () => trades.filter((t) => t.status === "CLOSED" && t.pnl != null).slice(-20),
    [trades],
  );
  const open = useMemo(() => trades.filter((t) => t.status === "OPEN"), [trades]);

  const unrealizedTotal = useMemo(() => {
    if (!currentPrice) return 0;
    return open.reduce((sum, t) => {
      const unr =
        t.action === "LONG"
          ? (currentPrice - t.entryPrice) * t.quantity
          : (t.entryPrice - currentPrice) * t.quantity;
      return sum + unr;
    }, 0);
  }, [open, currentPrice]);

  const chartData = closed.map((t, i) => ({ idx: `#${i + 1}`, pnl: t.pnl! }));

  const best = closed.length ? Math.max(...closed.map((t) => t.pnl!)) : null;
  const worst = closed.length ? Math.min(...closed.map((t) => t.pnl!)) : null;
  const avgPnl = closed.length ? closed.reduce((s, t) => s + t.pnl!, 0) / closed.length : null;

  let streak = 0;
  for (let i = closed.length - 1; i >= 0; i--) {
    const p = closed[i].pnl!;
    if (streak === 0) { streak = p >= 0 ? 1 : -1; }
    else if (streak > 0 && p >= 0) { streak++; }
    else if (streak < 0 && p < 0) { streak--; }
    else break;
  }

  return (
    <Card className={`border-strong bg-surface ${className ?? ""}`}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm text-muted-foreground font-medium">Rendimiento por Trade</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {closed.length > 0 ? `Últimas ${closed.length} operaciones cerradas` : "Sin operaciones cerradas aún"}
          </CardDescription>
        </div>
        {open.length > 0 && currentPrice != null && (
          <div className="text-right shrink-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">No realizado</div>
            <div className={`font-mono text-sm font-semibold tabular-nums ${unrealizedTotal >= 0 ? "text-success" : "text-destructive"}`}>
              {unrealizedTotal >= 0 ? "+" : ""}{formatCurrency(unrealizedTotal)}
            </div>
            <div className="text-[10px] text-muted-foreground">{open.length} pos. {open.length === 1 ? "abierta" : "abiertas"}</div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="h-44">
          {closed.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface-2))",
                    border: "1px solid hsl(var(--border-strong))",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [formatCurrency(v), "P&L"]}
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Los datos aparecerán cuando se cierren operaciones
            </div>
          )}
        </div>

        {closed.length > 0 && (
          <div className="grid grid-cols-4 gap-2 text-center border-t border-strong pt-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Mejor</div>
              <div className="font-mono text-xs font-semibold text-success">+{formatCurrency(best!)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Peor</div>
              <div className={`font-mono text-xs font-semibold ${worst! >= 0 ? "text-success" : "text-destructive"}`}>
                {worst! >= 0 ? "+" : ""}{formatCurrency(worst!)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Promedio</div>
              <div className={`font-mono text-xs font-semibold ${avgPnl! >= 0 ? "text-success" : "text-destructive"}`}>
                {avgPnl! >= 0 ? "+" : ""}{formatCurrency(avgPnl!)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Racha</div>
              <div className={`font-mono text-xs font-semibold ${streak >= 0 ? "text-success" : "text-destructive"}`}>
                {streak > 0 ? `${streak}W` : streak < 0 ? `${Math.abs(streak)}L` : "—"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
