import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { TrendingUp, TrendingDown, X, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UnifiedSignal } from "@/shared/types";

interface Props {
  symbol: string;
}

export function SignalPanel({ symbol }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["all-signals", symbol],
    queryFn: () => api.getAllSignals(symbol, 24),
    refetchInterval: 10_000,
  });

  const signals = data ?? [];
  const filtered = symbol === "ALL" ? signals : signals.filter((s) => s.symbol === symbol);

  return (
    <div className="rounded-lg border border-strong bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Señales del bot — {symbol === "ALL" ? "Todas" : symbol}
        </h2>
        <span className="text-[10px] text-muted-foreground">Últimas 24h</span>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin señales en las últimas 24h</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalRow({ signal }: { signal: UnifiedSignal }) {
  const isRejected = signal.status === "REJECTED";
  const isLong = signal.action === "LONG";

  return (
    <div
      className={`flex items-start gap-3 rounded-md border px-3 py-2 text-xs ${
        isRejected
          ? "border-red-900/40 bg-red-950/20"
          : "border-green-900/40 bg-green-950/20"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isLong ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-400" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {isLong ? "LONG" : "SHORT"} @ {signal.price?.toFixed(4) ?? "—"}
          </span>
          {isRejected ? (
            <Badge variant="outline" className="text-[10px] h-4 border-red-700 text-red-400 bg-red-950/30">
              <X className="h-3 w-3 mr-0.5" /> Rechazada
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] h-4 border-green-700 text-green-400 bg-green-950/30">
              <Check className="h-3 w-3 mr-0.5" /> {signal.executed ? "Ejecutada" : "Aceptada"}
            </Badge>
          )}
        </div>

        {signal.setupType && (
          <div className="text-muted-foreground">Setup: {signal.setupType}</div>
        )}

        {isRejected && signal.rejectionReason && (
          <div className="flex items-start gap-1 text-rose-300/80">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="truncate">{signal.rejectionReason}</span>
          </div>
        )}

        {!isRejected && signal.stochK5m != null && (
          <div className="text-muted-foreground">
            Stoch K: {signal.stochK5m.toFixed(1)} | BB: [{signal.bbLower?.toFixed(2) ?? "—"} – {signal.bbUpper?.toFixed(2) ?? "—"}]
          </div>
        )}

        <div className="text-[10px] text-muted-foreground">
          {new Date(signal.timestamp).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          {" · "}
          RSI: {signal.rsi?.toFixed(1) ?? "—"}
        </div>
      </div>
    </div>
  );
}
