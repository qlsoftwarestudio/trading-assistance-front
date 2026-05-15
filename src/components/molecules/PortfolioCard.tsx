import { Card, CardContent } from "@/components/ui/card";
import { PnLBadge } from "@/components/atoms/PnLBadge";
import { StatValue } from "@/components/atoms/StatValue";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  changePercent?: number;
  icon?: LucideIcon;
  accent?: boolean;
  subtitle?: string;
}

export const PortfolioCard = ({ title, value, changePercent, icon: Icon, accent, subtitle }: Props) => (
  <Card className={cn(
    "border-strong bg-surface gradient-surface relative overflow-hidden transition-all hover:border-primary/40",
    accent && "shadow-glow",
  )}>
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</span>
        {Icon && (
          <span className={cn("rounded-md p-1.5", accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <StatValue value={value} className="text-2xl sm:text-3xl text-foreground" />
        {changePercent !== undefined && <PnLBadge value={changePercent} />}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>}
    </CardContent>
  </Card>
);
