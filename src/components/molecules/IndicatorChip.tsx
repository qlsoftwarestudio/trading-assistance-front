import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  /** thresholds for color coding */
  zones?: { warn?: number; danger?: number };
  /** for indicators with both upper and lower bounds (e.g. RSI) */
  range?: [number, number];
  unit?: string;
  decimals?: number;
}

export const IndicatorChip = ({ label, value, zones, range, unit, decimals = 2 }: Props) => {
  let color = "text-foreground";
  if (range) {
    const [lo, hi] = range;
    if (value <= lo) color = "text-destructive";
    else if (value >= hi) color = "text-success";
    else color = "text-muted-foreground";
  } else if (zones) {
    if (zones.danger && value >= zones.danger) color = "text-success";
    else if (zones.warn && value >= zones.warn) color = "text-warning";
    else color = "text-muted-foreground";
  }
  const pct = range ? ((value - range[0]) / (range[1] - range[0])) * 100 : Math.min(100, value);

  return (
    <div className="rounded-md border border-strong bg-surface-2 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <span className={cn("font-mono text-sm font-semibold tabular-nums", color)}>
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all", color.replace("text-", "bg-"))}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
};
