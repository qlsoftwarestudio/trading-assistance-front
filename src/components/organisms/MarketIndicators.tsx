import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorChip } from "@/components/molecules/IndicatorChip";
import { StrategyBadge } from "@/components/molecules/StrategyBadge";
import type { MarketCondition } from "@/shared/types";
import { Activity } from "lucide-react";

interface Props { data: MarketCondition; }

export const MarketIndicators = ({ data }: Props) => (
  <Card className="border-strong bg-surface">
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" /> Indicadores
      </CardTitle>
      <StrategyBadge condition={data.marketCondition} />
    </CardHeader>
    <CardContent className="space-y-3">
      <IndicatorChip label="ADX" value={data.indicators.adx} zones={{ warn: 20, danger: 30 }} />
      <IndicatorChip label="RSI" value={data.indicators.rsi} range={[30, 70]} />
      <div className="grid grid-cols-2 gap-3">
        <IndicatorChip label="EMA 9"  value={data.indicators.ema9}  decimals={0} />
        <IndicatorChip label="EMA 21" value={data.indicators.ema21} decimals={0} />
      </div>
      {data.indicators.ema50 && (
        <IndicatorChip label="EMA 50" value={data.indicators.ema50} decimals={0} />
      )}
    </CardContent>
  </Card>
);
