import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/shared/lib/format";

interface Props {
  value: number | undefined | null; // percent
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PnLBadge = ({ value, className, showIcon = true, size = "sm" }: Props) => {
  if (value == null) return <span className="text-muted-foreground text-xs">—</span>;
  const positive = value >= 0;
  const sizeCls = size === "lg" ? "text-base px-2.5 py-1" : size === "md" ? "text-sm px-2 py-0.5" : "text-xs px-1.5 py-0.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-mono font-medium tabular-nums",
        positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
        sizeCls,
        className,
      )}
    >
      {showIcon && (positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      {formatPercent(value)}
    </span>
  );
};
