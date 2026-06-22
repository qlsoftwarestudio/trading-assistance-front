import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, format, addMonths, subMonths,
  startOfWeek, endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, TrendingUp, Activity,
  BarChart2, AlertTriangle, CalendarDays,
} from "lucide-react";
import { api } from "@/shared/api/client";
import { PortfolioCard } from "@/components/molecules/PortfolioCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import type { DailyMetrics } from "@/shared/types";
import { cn } from "@/lib/utils";

// --- Types ---

interface DayData {
  pnl: number;
  trades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
}

// --- Helpers ---

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function computeDailyPnl(metrics: DailyMetrics[]): Map<string, DayData> {
  const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
  const map = new Map<string, DayData>();
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    const trades = m.totalTrades - (prev?.totalTrades ?? 0);
    const winningTrades = m.winningTrades - (prev?.winningTrades ?? 0);
    const losingTrades = m.losingTrades - (prev?.losingTrades ?? 0);
    const pnl = m.totalPnl - (prev?.totalPnl ?? 0);
    // Skip days with no activity
    if (trades === 0 && pnl === 0) continue;
    // Compute win rate from the day's own trades, not the cumulative value
    const winRate = trades > 0 ? (winningTrades / trades) * 100 : 0;
    map.set(m.date, {
      pnl,
      trades,
      winningTrades,
      losingTrades,
      winRate,
      profitFactor: m.profitFactor ?? 0,
    });
  }
  return map;
}

// --- Calendar Cell ---

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  data: DayData | undefined;
}

const DayCell = ({ day, isCurrentMonth, data }: DayCellProps) => {
  const isToday = isSameDay(day, new Date());
  const dateLabel = format(day, "d");

  const cell = (
    <div
      className={cn(
        "min-h-[80px] rounded-lg p-2 flex flex-col justify-between select-none transition-colors",
        !isCurrentMonth && "opacity-20 pointer-events-none",
        isCurrentMonth && !data && "bg-muted/20 border border-dashed border-border",
        data && data.pnl > 0 && "bg-success/10 border border-success/25 hover:bg-success/15 cursor-pointer",
        data && data.pnl < 0 && "bg-destructive/10 border border-destructive/25 hover:bg-destructive/15 cursor-pointer",
        data && data.pnl === 0 && "bg-muted/30 border border-border cursor-pointer",
        isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background",
      )}
    >
      <span className={cn(
        "text-xs font-medium leading-none",
        isToday ? "text-primary font-bold" : "text-muted-foreground",
      )}>
        {dateLabel}
      </span>
      {data && (
        <div className="space-y-0.5">
          <p className={cn(
            "text-sm font-bold font-mono tabular-nums leading-none",
            data.pnl >= 0 ? "text-success" : "text-destructive",
          )}>
            {data.pnl >= 0 ? "+" : ""}
            {formatCurrency(data.pnl, { compact: true })}
          </p>
          <p className="text-[10px] text-muted-foreground leading-none">
            {data.trades} ops · {formatNumber(data.winRate, 0)}% WR
          </p>
        </div>
      )}
    </div>
  );

  if (!data) return cell;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs space-y-1 min-w-[160px]">
        <p className="font-semibold text-foreground">{format(day, "d 'de' MMMM yyyy", { locale: es })}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
          <span>PnL del día</span>
          <span className={cn("font-mono font-medium", data.pnl >= 0 ? "text-success" : "text-destructive")}>
            {data.pnl >= 0 ? "+" : ""}{formatCurrency(data.pnl)}
          </span>
          <span>Operaciones</span>
          <span className="text-foreground">{data.trades}</span>
          <span>Ganadas / Perdidas</span>
          <span className="text-foreground">{data.winningTrades}W / {data.losingTrades}L</span>
          <span>Win Rate</span>
          <span className="text-foreground">{formatNumber(data.winRate, 1)}%</span>
          <span>Profit Factor</span>
          <span className="text-foreground">{formatNumber(data.profitFactor, 2)}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// --- Page ---

const Performance = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: allMetrics = [], isLoading } = useQuery({
    queryKey: ["metrics-history"],
    queryFn: () => api.getAllDailyMetrics(),
    refetchInterval: 60_000,
  });

  const latestMetrics = allMetrics.length > 0 ? allMetrics[allMetrics.length - 1] : null;
  const dailyPnlMap = computeDailyPnl(allMetrics);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const bestDay = [...dailyPnlMap.values()].reduce<DayData | null>(
    (best, d) => (best === null || d.pnl > best.pnl ? d : best), null
  );
  const worstDay = [...dailyPnlMap.values()].reduce<DayData | null>(
    (worst, d) => (worst === null || d.pnl < worst.pnl ? d : worst), null
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rendimiento</h1>
        <p className="text-sm text-muted-foreground">
          PnL diario y estadísticas acumuladas · {allMetrics.length} días registrados
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard
          title="PnL Acumulado Total"
          value={latestMetrics ? formatCurrency(latestMetrics.totalPnl) : "—"}
          icon={TrendingUp}
          accent
          subtitle={`${latestMetrics?.totalTrades ?? 0} operaciones totales`}
        />
        <PortfolioCard
          title="Win Rate Global"
          value={latestMetrics?.winRate != null ? `${formatNumber(latestMetrics.winRate, 1)}%` : "—"}
          icon={BarChart2}
          subtitle={latestMetrics ? `${latestMetrics.winningTrades}W / ${latestMetrics.losingTrades}L` : undefined}
        />
        <PortfolioCard
          title="Profit Factor"
          value={latestMetrics?.profitFactor != null ? formatNumber(latestMetrics.profitFactor, 2) : "—"}
          icon={Activity}
          subtitle="Ganancia bruta / Pérdida bruta"
        />
        <PortfolioCard
          title="Max Drawdown"
          value={latestMetrics?.maxDrawdown ? formatCurrency(latestMetrics.maxDrawdown) : "—"}
          icon={AlertTriangle}
          subtitle="Peak-to-trough acumulado en $"
        />
      </div>

      {/* Best / Worst day row */}
      {(bestDay || worstDay) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestDay && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Mejor día</p>
                  <p className="text-2xl font-bold text-success font-mono">
                    +{formatCurrency(bestDay.pnl)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bestDay.trades} ops · {formatNumber(bestDay.winRate, 0)}% WR
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success/40" />
              </CardContent>
            </Card>
          )}
          {worstDay && worstDay.pnl < 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Peor día</p>
                  <p className="text-2xl font-bold text-destructive font-mono">
                    {formatCurrency(worstDay.pnl)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {worstDay.trades} ops · {formatNumber(worstDay.winRate, 0)}% WR
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive/40" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Calendar */}
      <Card className="border-strong bg-surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              Cargando datos...
            </div>
          ) : (
            <>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  return (
                    <DayCell
                      key={dateStr}
                      day={day}
                      isCurrentMonth={isCurrentMonth}
                      data={dailyPnlMap.get(dateStr)}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Leyenda:</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-success/30 border border-success/40" />
                  <span className="text-xs text-muted-foreground">Día positivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-destructive/30 border border-destructive/40" />
                  <span className="text-xs text-muted-foreground">Día negativo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-muted/30 border border-dashed border-border" />
                  <span className="text-xs text-muted-foreground">Sin datos</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
