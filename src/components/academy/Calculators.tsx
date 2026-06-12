import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGamificationStore } from "@/store/gamificationStore";

export function RRCalculator() {
  const [entry, setEntry] = useState("100");
  const [slPct, setSlPct] = useState("0.6");
  const [tpPct, setTpPct] = useState("1.2");

  const e = parseFloat(entry) || 0;
  const sl = e * (1 - parseFloat(slPct) / 100);
  const tp = e * (1 + parseFloat(tpPct) / 100);
  const rr = parseFloat(tpPct) / parseFloat(slPct);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Calculadora Risk:Reward</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Precio entrada</Label>
            <Input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">SL %</Label>
            <Input type="number" value={slPct} onChange={(e) => setSlPct(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">TP %</Label>
            <Input type="number" value={tpPct} onChange={(e) => setTpPct(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">SL</div>
            <div className="font-semibold text-rose-500">{sl.toFixed(4)}</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">TP</div>
            <div className="font-semibold text-emerald-500">{tp.toFixed(4)}</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">R:R</div>
            <div className="font-semibold text-primary">{rr ? `1:${rr.toFixed(2)}` : "—"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PositionSizingCalculator() {
  const [capital, setCapital] = useState("2000");
  const [riskPct, setRiskPct] = useState("1");
  const [slPct, setSlPct] = useState("0.6");
  const [leverage, setLeverage] = useState("5");

  const { useCalculator, checkAchievements } = useGamificationStore();

  useEffect(() => {
    useCalculator();
    checkAchievements();
    // solo cuenta una vez por mount de la calculadora
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const c = parseFloat(capital) || 0;
  const risk = c * (parseFloat(riskPct) / 100);
  const sl = parseFloat(slPct) / 100;
  const lev = parseFloat(leverage);
  const positionSize = sl > 0 ? risk / sl : 0;
  const margin = lev > 0 ? positionSize / lev : 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Calculadora Position Sizing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Capital total ($)</Label>
            <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Riesgo % del capital</Label>
            <Input type="number" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">SL % del trade</Label>
            <Input type="number" value={slPct} onChange={(e) => setSlPct(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Leverage</Label>
            <Input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">Riesgo $</div>
            <div className="font-semibold">${risk.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">Posición $</div>
            <div className="font-semibold text-primary">${positionSize.toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-xs text-muted-foreground">Margin $</div>
            <div className="font-semibold text-emerald-500">${margin.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
