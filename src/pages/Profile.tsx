import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Power, Trash2, Plus, Bot } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY"];

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [newBot, setNewBot] = useState({ name: "", symbol: "EURUSD", apiKey: "", apiSecret: "" });

  const { data: bots, isLoading: botsLoading, error: botsError } = useQuery({ queryKey: ["bots"], queryFn: () => api.getBots(), refetchInterval: 30_000 });

  const createBot = useMutation({
    mutationFn: api.createBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      setNewBot({ name: "", symbol: "EURUSD", apiKey: "", apiSecret: "" });
    },
  });

  const toggleBot = useMutation({
    mutationFn: api.toggleBot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bots"] }),
  });

  const deleteBot = useMutation({
    mutationFn: api.deleteBot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bots"] }),
  });

  return (
    <div className="space-y-5 max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>

      <Card className="border-strong bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
          <p><span className="text-muted-foreground">Plan:</span> <Badge variant="outline">{user?.plan ?? "FREE"}</Badge></p>
        </CardContent>
      </Card>

      <Card className="border-strong bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" /> Mis Bots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {botsLoading ? (
            <p className="text-sm text-muted-foreground">Cargando bots...</p>
          ) : botsError ? (
            <p className="text-sm text-destructive">Error al cargar bots. Re-login si persiste.</p>
          ) : bots && bots.length > 0 ? (
            <div className="space-y-2">
              {bots.map((bot) => (
                <div key={bot.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {bot.name}
                      <Badge variant={bot.running ? "default" : "secondary"} className="text-xs">
                        {bot.running ? "ACTIVO" : "PAUSADO"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{bot.symbol}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={bot.running ? "destructive" : "default"} className="h-7 text-xs gap-1"
                      onClick={() => toggleBot.mutate(bot.id)} disabled={toggleBot.isPending}>
                      <Power className="h-3 w-3" />
                      {bot.running ? "Detener" : "Iniciar"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive"
                      onClick={() => deleteBot.mutate(bot.id)} disabled={deleteBot.isPending}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tenés bots configurados.</p>
          )}

          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Nuevo bot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre</Label>
                <Input size={1} className="h-8 text-xs" value={newBot.name} onChange={(e) => setNewBot({ ...newBot, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Par</Label>
                <select className="h-8 text-xs w-full rounded-md border bg-background px-2"
                  value={newBot.symbol} onChange={(e) => setNewBot({ ...newBot, symbol: e.target.value })}>
                  {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">API Key (BingX)</Label>
                <Input size={1} className="h-8 text-xs" type="password" value={newBot.apiKey} onChange={(e) => setNewBot({ ...newBot, apiKey: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">API Secret (BingX)</Label>
                <Input size={1} className="h-8 text-xs" type="password" value={newBot.apiSecret} onChange={(e) => setNewBot({ ...newBot, apiSecret: e.target.value })} />
              </div>
            </div>
            <Button size="sm" className="text-xs" onClick={() => createBot.mutate({
              name: newBot.name,
              symbol: newBot.symbol,
              apiKey: newBot.apiKey,
              apiSecret: newBot.apiSecret,
            })} disabled={!newBot.name || !newBot.apiKey || !newBot.apiSecret || createBot.isPending}>
              Crear bot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
