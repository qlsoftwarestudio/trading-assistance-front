import { cn } from "@/lib/utils";
import type { MarketConditionKind, StrategyKind } from "@/shared/types";
import { Activity, TrendingDown, TrendingUp, Zap, Minus } from "lucide-react";

const labelMap: Record<MarketConditionKind, string> = {
  RANGING: "Rango",
  TREND_UP: "Tendencia Alcista",
  TREND_DOWN: "Tendencia Bajista",
  SCALPING_OPPORTUNITY: "Scalping",
  NEUTRAL: "Neutral",
};

const styleMap: Record<MarketConditionKind, { cls: string; icon: typeof Activity }> = {
  RANGING:              { cls: "bg-muted text-muted-foreground", icon: Activity },
  TREND_UP:             { cls: "bg-success/15 text-success",     icon: TrendingUp },
  TREND_DOWN:           { cls: "bg-destructive/15 text-destructive", icon: TrendingDown },
  SCALPING_OPPORTUNITY: { cls: "bg-primary/15 text-primary",     icon: Zap },
  NEUTRAL:              { cls: "bg-muted text-muted-foreground", icon: Minus },
};

const stratLabel: Record<StrategyKind, string> = {
  RANGE: "Range",
  TREND: "Trend Following",
  SCALPING: "Scalping",
};

interface Props {
  condition: MarketConditionKind;
  strategy?: StrategyKind;
  className?: string;
}

export const StrategyBadge = ({ condition, strategy, className }: Props) => {
  const { cls, icon: Icon } = styleMap[condition];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{labelMap[condition]}</span>
      {strategy && <span className="opacity-70">· {stratLabel[strategy]}</span>}
    </span>
  );
};
