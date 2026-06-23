import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { TradeTable } from "@/components/organisms/TradeTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TradeStatus } from "@/shared/types";

const STATUSES: (TradeStatus | "ALL")[] = ["ALL", "OPEN", "CLOSED"];

const PAGE_SIZE = 10;

const Trades = () => {
  const [status, setStatus] = useState<TradeStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const { data: rawData } = useQuery({
    queryKey: ["trades-all"],
    queryFn: () => api.getTrades({ page: 0, size: 200 }),
    refetchInterval: 8_000,
  });
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.getDashboardSummary(),
    refetchInterval: 5_000,
  });

  const allTrades = rawData?.content ?? [];
  const filtered = status === "ALL" ? allTrades : allTrades.filter((t) => t.status === status);
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operaciones</h1>
        <p className="text-sm text-muted-foreground">Historial completo de trades · señales BUY/SELL/HOLD</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v as TradeStatus | "ALL"); setPage(0); }}>
          <SelectTrigger className="w-40 border-strong bg-surface"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "ALL" ? "Todos los estados" : s}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{totalElements} resultados</span>
      </div>

      <TradeTable trades={paginated} prices={summary?.prices} />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Trades;
