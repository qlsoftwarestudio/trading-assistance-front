import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Signal } from "@/shared/types";

const actionStyle = (action: Signal["action"]) => {
  if (action === "LONG") return "border-success/40 text-success";
  if (action === "SHORT") return "border-destructive/40 text-destructive";
  return "border-muted text-muted-foreground";
};

const fmt = (v: number | undefined, decimals = 2) =>
  v !== undefined ? v.toFixed(decimals) : "—";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const Market = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["signals"],
    queryFn: () => api.getSignals(),
    refetchInterval: 30_000,
  });
  const signals = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log de Señales</h1>
        <p className="text-sm text-muted-foreground">Últimas 50 señales generadas por la estrategia · actualización cada 30s</p>
      </div>

      <div className="rounded-lg border border-strong bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-strong hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Señal</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Precio</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">RSI</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Momentum</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Tendencia 1h/4h/1d</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Confluencia</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Ejecutada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">Cargando señales…</TableCell>
              </TableRow>
            )}
            {!isLoading && signals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No hay señales registradas aún</TableCell>
              </TableRow>
            )}
            {signals.map((s) => (
              <TableRow key={s.id} className="border-strong hover:bg-surface-2/50">
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(s.generatedAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-mono text-[10px]", actionStyle(s.action))}>
                    {s.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">${fmt(s.price, 4)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">{fmt(s.rsi)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">{fmt(s.momentum)}%</TableCell>
                <TableCell className="font-mono text-xs">
                  {s.trend1h ?? "—"} / {s.trend4h ?? "—"} / {s.trend1d ?? "—"}
                </TableCell>
                <TableCell>
                  {s.confluence !== undefined ? (
                    <Badge variant="outline" className={cn("text-[10px]", s.confluence ? "border-success/40 text-success" : "border-muted text-muted-foreground")}>
                      {s.confluence ? "SÍ" : "NO"}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {s.executed !== undefined ? (
                    <Badge variant="outline" className={cn("text-[10px]", s.executed ? "border-primary/40 text-primary" : "border-muted text-muted-foreground")}>
                      {s.executed ? "SÍ" : "NO"}
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Market;
