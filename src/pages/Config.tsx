import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { BotConfig, StrategyKind } from "@/shared/types";
import { KeyRound, ShieldCheck, AlertTriangle, Send, Loader2 } from "lucide-react";

const Config = () => {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ["config"], queryFn: () => api.getConfig() });

  const [draft, setDraft] = useState<BotConfig | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);
  const [savingCfg, setSavingCfg] = useState(false);

  useEffect(() => { if (cfg) setDraft(cfg); }, [cfg]);

  if (!draft) return <div className="text-muted-foreground text-sm">Cargando configuración…</div>;

  const saveCfg = async (next: Partial<BotConfig>) => {
    setSavingCfg(true);
    try {
      const updated = await api.updateConfig(next);
      setDraft(updated);
      qc.setQueryData(["config"], updated);
      toast.success("Configuración guardada");
    } finally { setSavingCfg(false); }
  };

  const saveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.length < 8 || apiSecret.length < 8) {
      toast.error("API Key y Secret deben tener al menos 8 caracteres");
      return;
    }
    setSavingKeys(true);
    try {
      await api.saveApiKeys({ apiKey, apiSecret, testnet: draft.apiKeys.testnet });
      qc.invalidateQueries({ queryKey: ["config"] });
      setApiKey(""); setApiSecret("");
      toast.success("API Keys guardadas y validadas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudieron guardar");
    } finally { setSavingKeys(false); }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Gestiona API Keys, estrategia y límites de riesgo</p>
      </div>

      <Tabs defaultValue="apikeys">
        <TabsList className="bg-surface border border-strong">
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="strategy">Estrategia</TabsTrigger>
          <TabsTrigger value="risk">Riesgo</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="apikeys">
          <Card className="border-strong bg-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Binance API Keys</CardTitle>
              <CardDescription>Las claves se cifran en el servidor (AES-256) antes de almacenarse.</CardDescription>
            </CardHeader>
            <CardContent>
              {draft.apiKeys.configured && (
                <div className="mb-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                  <ShieldCheck className="h-4 w-4" /> API Keys configuradas {draft.apiKeys.testnet ? "(testnet)" : ""}
                </div>
              )}
              <form onSubmit={saveKeys} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input id="apiSecret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="••••••••••••••••" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="testnet" type="checkbox" checked={draft.apiKeys.testnet}
                    onChange={(e) => setDraft({ ...draft, apiKeys: { ...draft.apiKeys, testnet: e.target.checked } })}
                  />
                  <Label htmlFor="testnet" className="text-sm">Usar testnet (paper trading)</Label>
                </div>
                <Button type="submit" disabled={savingKeys}>
                  {savingKeys && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy">
          <Card className="border-strong bg-surface">
            <CardHeader>
              <CardTitle>Modo de operación</CardTitle>
              <CardDescription>Auto-switch detecta el régimen del mercado y cambia la estrategia automáticamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {(["AUTO_SWITCH", "MANUAL"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setDraft({ ...draft, general: { ...draft.general, mode: m } })}
                    className={`flex-1 rounded-md border p-4 text-left transition-all ${draft.general.mode === m ? "border-primary bg-primary/10" : "border-strong bg-surface-2 hover:border-primary/40"}`}
                  >
                    <div className="font-semibold">{m === "AUTO_SWITCH" ? "Auto-Switch" : "Manual"}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m === "AUTO_SWITCH" ? "El bot decide la mejor estrategia" : "Tú eliges la estrategia"}
                    </p>
                  </button>
                ))}
              </div>

              {draft.general.mode === "MANUAL" && (
                <div className="space-y-2">
                  <Label>Estrategia</Label>
                  <Select
                    value={draft.general.selectedStrategy ?? "RANGE"}
                    onValueChange={(v) => setDraft({ ...draft, general: { ...draft.general, selectedStrategy: v as StrategyKind } })}
                  >
                    <SelectTrigger className="border-strong"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANGE">Range</SelectItem>
                      <SelectItem value="TREND">Trend Following</SelectItem>
                      <SelectItem value="SCALPING">Scalping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Par de trading</Label>
                <Select
                  value={draft.general.tradingPair}
                  onValueChange={(v) => setDraft({ ...draft, general: { ...draft.general, tradingPair: v } })}
                >
                  <SelectTrigger className="border-strong"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button disabled={savingCfg} onClick={() => saveCfg({ general: draft.general })}>
                {savingCfg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card className="border-strong bg-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Límites de Riesgo</CardTitle>
              <CardDescription>Protege tu capital con límites estrictos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {([
                { key: "maxPositionSizePercent", label: "Tamaño máx. de posición", min: 1, max: 50 },
                { key: "maxDailyLossPercent",    label: "Pérdida diaria máx.",    min: 1, max: 30 },
                { key: "stopLossPercent",        label: "Stop Loss por trade",    min: 0.5, max: 15 },
              ] as const).map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{field.label}</Label>
                    <span className="font-mono text-sm text-primary">{draft.risk[field.key]}%</span>
                  </div>
                  <Slider
                    min={field.min} max={field.max} step={0.5}
                    value={[draft.risk[field.key] as number]}
                    onValueChange={([v]) => setDraft({ ...draft, risk: { ...draft.risk, [field.key]: v } })}
                  />
                </div>
              ))}
              <Button disabled={savingCfg} onClick={() => saveCfg({ risk: draft.risk })}>
                {savingCfg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-strong bg-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> Telegram</CardTitle>
              <CardDescription>Recibe alertas de trades y cambios de estrategia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chat ID</Label>
                <Input
                  value={draft.notifications.telegramChatId ?? ""}
                  onChange={(e) => setDraft({ ...draft, notifications: { ...draft.notifications, telegramChatId: e.target.value, telegramEnabled: !!e.target.value } })}
                  placeholder="123456789"
                />
                {draft.notifications.telegramChatId && <Badge className="bg-success/15 text-success border-success/30">Conectado</Badge>}
              </div>
              <Button disabled={savingCfg} onClick={() => saveCfg({ notifications: draft.notifications })}>
                {savingCfg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Config;
