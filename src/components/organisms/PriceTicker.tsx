import { Card, CardContent } from "@/components/ui/card";
import { StatusDot } from "@/components/atoms/StatusDot";
import { formatPrice } from "@/shared/lib/format";
import type { MarketCondition } from "@/shared/types";
import { PnLBadge } from "@/components/atoms/PnLBadge";

interface Props {
  data: MarketCondition;
  symbol?: string;
  connected?: boolean;
}

export const PriceTicker = ({ data, symbol = "BTCUSDT", connected = true }: Props) => {
  const positive = data.priceChange24h >= 0;
  return (
    <Card className="border-strong bg-surface gradient-surface overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{symbol}</span>
            <StatusDot active={connected} variant={connected ? "success" : "muted"} pulse={connected} />
            <span className="text-[10px] text-muted-foreground">{connected ? "LIVE" : "OFFLINE"}</span>
          </div>
          <PnLBadge value={data.priceChange24h} size="md" />
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className={`font-mono text-4xl sm:text-5xl font-bold tabular-nums ${positive ? "text-success" : "text-destructive"}`}>
            ${formatPrice(data.currentPrice)}
          </span>
          <span className="text-xs text-muted-foreground">
            actualizado {new Date(data.timestamp).toLocaleTimeString("es-ES")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
