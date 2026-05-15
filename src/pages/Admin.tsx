import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusDot } from "@/components/atoms/StatusDot";
import { DollarSign, Loader2, TrendingUp, UserPlus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PLAN_PRICE, type Plan, type Role } from "@/shared/types";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/shared/lib/format";

const planStyle: Record<Plan, string> = {
  FREE:       "border-muted-foreground/40 text-muted-foreground",
  STARTER:    "border-success/40 text-success",
  PRO:        "border-primary/40 text-primary",
  ENTERPRISE: "border-warning/40 text-warning",
};

const Admin = () => {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  const { data: tenants = [] }  = useQuery({ queryKey: ["tenants"],  queryFn: () => api.getTenants() });
  const { data: users   = [] }  = useQuery({ queryKey: ["users"],    queryFn: () => api.getUsers() });
  const { data: metrics }       = useQuery({ queryKey: ["metrics"],  queryFn: () => api.getPlatformMetrics() });

  // ------- Create user dialog (multi-bot, Enterprise) -------
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("TRADER");

  const createUserMut = useMutation({
    mutationFn: () => api.createUser({ email: email.trim(), password, name: name.trim() || undefined, role }),
    onSuccess: () => {
      toast.success("Usuario creado");
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["tenants"] });
      setOpen(false); setEmail(""); setPassword(""); setName("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUserMut = useMutation({
    mutationFn: (userId: number) => api.deleteUser(userId),
    onSuccess: () => { toast.success("Usuario eliminado"); qc.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleUserMut = useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) => api.updateUser(userId, { active }),
    onSuccess: (u) => {
      toast.success(`Usuario ${u.active ? "activado" : "suspendido"}`);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const planMut = useMutation({
    mutationFn: ({ tenantId, plan }: { tenantId: number; plan: Plan }) => api.setTenantPlan(tenantId, plan),
    onSuccess: (t) => {
      toast.success(`Plan actualizado a ${t.plan}`);
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["metrics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleTenantMut = useMutation({
    mutationFn: ({ tenantId, active }: { tenantId: number; active: boolean }) => api.toggleTenant(tenantId, active),
    onSuccess: () => { toast.success("Tenant actualizado"); qc.invalidateQueries({ queryKey: ["tenants"] }); qc.invalidateQueries({ queryKey: ["metrics"] }); },
  });

  const myTenantUsers = useMemo(() => users.filter((u) => u.tenantId === me?.tenantId), [users, me]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Gestión de tenants, bots y suscripciones</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" /> Crear usuario (bot)
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-strong">
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
              <DialogDescription>
                Cada usuario es un bot independiente con sus propias API keys. Tu plan permite hasta {tenants.find(t => t.id === me?.tenantId)?.maxUsers ?? 1} usuarios.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); if (password.length < 8) { toast.error("Password mín. 8 caracteres"); return; } createUserMut.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="u-email">Email</Label>
                <Input id="u-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trader@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-name">Nombre</Label>
                <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Trader Junior" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="u-pwd">Password inicial</Label>
                  <Input id="u-pwd" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRADER">TRADER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createUserMut.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {createUserMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs (platform metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-strong bg-surface gradient-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Tenants activos</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {metrics?.platform.tenants.active ?? 0}
              <span className="text-sm text-muted-foreground"> / {metrics?.platform.tenants.total ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface gradient-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Bots activos</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {metrics?.platform.bots.active ?? 0}
              <span className="text-sm text-muted-foreground"> / {metrics?.platform.bots.total ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface gradient-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">MRR</span>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold text-success tabular-nums">${metrics?.revenue.mrr ?? 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">ARR ${metrics?.revenue.arr ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-strong bg-surface gradient-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Capital gestionado</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold tabular-nums">{formatCurrency(metrics?.trading.totalCapitalManaged ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="w-full">
        <TabsList className="bg-surface border border-strong">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="users">Usuarios (mi tenant)</TabsTrigger>
        </TabsList>

        {/* ----- TENANTS ----- */}
        <TabsContent value="tenants" className="mt-4">
          <div className="rounded-lg border border-strong bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-strong hover:bg-transparent">
                  <TableHead>Workspace</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead>P&L hoy</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id} className="border-strong hover:bg-surface-2/50">
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">id: {t.id} · {t.adminEmail}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{t.users.length} <span className="text-xs text-muted-foreground">/ {t.maxUsers}</span></TableCell>
                    <TableCell>
                      <Select value={t.plan} onValueChange={(v) => planMut.mutate({ tenantId: t.id, plan: v as Plan })}>
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue><Badge variant="outline" className={planStyle[t.plan]}>{t.plan}</Badge></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTER">STARTER</SelectItem>
                          <SelectItem value="PRO">PRO</SelectItem>
                          <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-sm">{formatCurrency(t.stats?.totalCapital ?? 0)}</TableCell>
                    <TableCell className={`font-mono tabular-nums text-sm ${(t.stats?.totalPnL ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                      {(t.stats?.totalPnL ?? 0) >= 0 ? "+" : ""}{formatCurrency(t.stats?.totalPnL ?? 0)}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleTenantMut.mutate({ tenantId: t.id, active: !t.active })} className="flex items-center gap-2">
                        <StatusDot active={t.active} variant={t.active ? "success" : "muted"} pulse={t.active} />
                        <span className="text-sm">{t.active ? "Activo" : "Suspendido"}</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">${PLAN_PRICE[t.plan]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ----- USERS (within current admin's tenant) ----- */}
        <TabsContent value="users" className="mt-4">
          <div className="rounded-lg border border-strong bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-strong hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Bot</TableHead>
                  <TableHead>API Keys</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTenantUsers.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Sin usuarios en este tenant</TableCell></TableRow>
                )}
                {myTenantUsers.map((u) => (
                  <TableRow key={u.id} className="border-strong hover:bg-surface-2/50">
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{u.role}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot active={u.botActive} variant={u.botActive ? "success" : "muted"} pulse={u.botActive} />
                        <span className="text-sm">{u.botActive ? "Operando" : "Pausado"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.apiKeysConfigured
                        ? <Badge className="bg-success/15 text-success border-success/30">OK</Badge>
                        : <Badge variant="outline" className="border-warning/40 text-warning">Pendiente</Badge>}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-sm">{formatCurrency(u.capital ?? 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" disabled={u.id === me?.id} onClick={() => toggleUserMut.mutate({ userId: u.id, active: !u.active })}>
                          {u.active ? "Suspender" : "Activar"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={u.id === me?.id} className="text-destructive hover:text-destructive" onClick={() => deleteUserMut.mutate(u.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
