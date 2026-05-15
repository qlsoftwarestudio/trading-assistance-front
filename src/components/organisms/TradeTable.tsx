import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@/shared/types";
import { formatDateTime, formatNumber, formatPrice } from "@/shared/lib/format";
import { PnLBadge } from "@/components/atoms/PnLBadge";
import { cn } from "@/lib/utils";

interface Props {
  trades: Trade[];
  compact?: boolean;
}

const statusStyles: Record<Trade["status"], string> = {
  OPEN: "bg-primary/15 text-primary border-primary/30",
  CLOSED: "bg-muted text-muted-foreground border-strong",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

export const TradeTable = ({ trades, compact }: Props) => (
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
          <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Estrategia</TableHead>
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
                t.type === "BUY" ? "border-success/40 text-success" : "border-destructive/40 text-destructive",
              )}>
                {t.type}
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
              {t.pnl !== undefined && t.pnlPercent !== undefined ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className={cn("font-mono tabular-nums text-sm font-semibold", t.pnl >= 0 ? "text-success" : "text-destructive")}>
                    {t.pnl >= 0 ? "+" : ""}${formatNumber(Math.abs(t.pnl))}
                  </span>
                  <PnLBadge value={t.pnlPercent} showIcon={false} />
                </div>
              ) : <span className="text-muted-foreground text-sm">—</span>}
            </TableCell>
            <TableCell className="text-xs">
              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{t.strategyUsed}</span>
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
