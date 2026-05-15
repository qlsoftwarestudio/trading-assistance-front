import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/shared/lib/format";
import type { EquityPoint } from "@/shared/types";
import { useMemo } from "react";

interface Props {
  data: EquityPoint[];
  className?: string;
}

export const EquityChart = ({ data, className }: Props) => {
  const chartData = useMemo(
    () => data.map((p) => ({ time: new Date(p.timestamp).getTime(), value: Math.round(p.value * 100) / 100 })),
    [data],
  );
  const first = chartData[0]?.value ?? 0;
  const last = chartData[chartData.length - 1]?.value ?? 0;
  const positive = last >= first;
  const color = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <Card className={`border-strong bg-surface ${className ?? ""}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground font-medium">Equity Curve · 60h</CardTitle>
        <div className="text-right">
          <div className="font-mono text-base font-semibold tabular-nums">{formatCurrency(last)}</div>
          <div className={`text-xs font-mono ${positive ? "text-success" : "text-destructive"}`}>
            {positive ? "+" : ""}{formatCurrency(last - first)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(t: number) => new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                domain={["dataMin - 100", "dataMax + 100"]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--surface-2))",
                  border: "1px solid hsl(var(--border-strong))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelFormatter={(t) => new Date(t as number).toLocaleString("es-ES")}
                formatter={(v: number) => [formatCurrency(v), "Balance"]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#equityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
