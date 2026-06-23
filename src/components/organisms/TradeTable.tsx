import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@/shared/types";
import { formatDateTime, formatNumber, formatPrice } from "@/shared/lib/format";
import { PnLBadge } from "@/components/atoms/PnLBadge";
import { cn } from "@/lib/utils";

interface Props {
  trades: Trade[];
  compact?: boolean;
  prices?: Record<string, number>;
}

const statusStyles: Record<Trade["status"], string> = {
  OPEN: "bg-primary/15 text-primary border-primary/30",
  CLOSED: "bg-muted text-muted-foreground border-strong",
};

const exitReasonStyles: Record<string, string> = {
  STOP_LOSS: "bg-destructive/10 text-destructive border-destructive/20",
  TAKE_PROFIT: "bg-success/10 text-success border-success/20",
  TRAILING_STOP: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  TIME_EXIT: "bg-muted text-muted-foreground border-strong",
  MANUAL: "bg-primary/10 text-primary border-primary/20",
};

export const TradeTable = ({ trades, compact, prices }: Props) => {
  return (
  <div className="rounded-lg border border-strong bg-surface overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="border-strong hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Símbolo</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Entrada</TableHead>
          {!compact && <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Salida</TableHead>}
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Cantidad</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">P&L</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Razón salida</TableHead>
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Estado</TableHead>
          {!compact && <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Fecha</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.length === 0 && (
          <TableRow>
            <TableCell colSpan={compact ? 7 : 9} className="text-center py-12 text-muted-foreground text-sm">
              No hay operaciones que mostrar
            </TableCell>
          </TableRow>
        )}
        {trades.map((t) => (
          <TableRow key={t.id} className="border-strong hover:bg-surface-2/50">
            <TableCell className="font-mono font-medium text-sm">{t.symbol}</TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(
                "font-mono text-[10px]",
                t.action === "LONG" ? "border-success/40 text-success" : "border-destructive/40 text-destructive",
              )}>
                {t.action}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums text-sm">${formatPrice(t.entryPrice)}</TableCell>
            {!compact && (
              <TableCell className="text-right font-mono tabular-nums text-sm">
                {t.exitPrice ? `$${formatPrice(t.exitPrice)}` : <span className="text-muted-foreground">—</span>}
              </TableCell>
            )}
            <TableCell className="text-right font-mono tabular-nums text-sm">{formatNumber(t.quantity, 4)}</TableCell>
            <TableCell className="text-right">
              {(() => {
                const closedPnl = t.pnl != null && t.pnlPercent != null;
                const currentPrice = prices?.[t.symbol];
                const unrealized = !closedPnl && t.status === "OPEN" && currentPrice !== undefined
                  ? (t.action === "LONG" ? currentPrice - t.entryPrice : t.entryPrice - currentPrice) * t.quantity
                  : undefined;
                const unrealizedPct = unrealized !== undefined && t.investedAmount
                  ? (unrealized / t.investedAmount) * 100
                  : undefined;
                if (closedPnl) return (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={cn("font-mono tabular-nums text-sm font-semibold", t.pnl! >= 0 ? "text-success" : "text-destructive")}>
                      {t.pnl! >= 0 ? "+" : ""}${formatNumber(Math.abs(t.pnl!))}
                    </span>
                    <PnLBadge value={t.pnlPercent} showIcon={false} />
                  </div>
                );
                if (unrealized !== undefined) return (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={cn("font-mono tabular-nums text-sm font-semibold", unrealized >= 0 ? "text-success" : "text-destructive")}>
                      {unrealized >= 0 ? "+" : ""}${formatNumber(Math.abs(unrealized))}
                    </span>
                    {unrealizedPct !== undefined && <PnLBadge value={unrealizedPct} showIcon={false} />}
                    <span className="text-[10px] text-muted-foreground">no realizado</span>
                  </div>
                );
                return <span className="text-muted-foreground text-sm">—</span>;
              })()}
            </TableCell>
            <TableCell className="text-xs">
              <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", exitReasonStyles[t.exitReason ?? ""] ?? "bg-muted text-muted-foreground border-strong")}>
                {t.exitReason ?? "—"}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-[10px] font-medium", statusStyles[t.status])}>
                {t.status}
              </Badge>
            </TableCell>
            {!compact && (
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(t.entryTime)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
  );
};
