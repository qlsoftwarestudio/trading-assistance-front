import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/shared/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Check, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIMITS, PLAN_PRICE, type Plan } from "@/shared/types";
import { cn } from "@/lib/utils";

// Self-signup onboarding: choose a workspace name + plan. The real backend
// already returns a tenant after POST /auth/register, so this screen only
// runs for the local mock or for users created without a tenant.
const SELECTABLE_PLANS: Plan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

const PlanCard = ({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) => {
  const limits = PLAN_LIMITS[plan];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-xl border bg-surface p-5 transition-all",
        selected ? "border-primary ring-2 ring-primary/30 shadow-glow" : "border-strong hover:border-primary/50",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{plan}</h3>
        {selected && <Check className="h-5 w-5 text-primary" />}
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold tabular-nums">${PLAN_PRICE[plan]}</span>
        <span className="text-sm text-muted-foreground">/mes</span>
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>· {limits.maxUsers === 1 ? "1 bot (usuario)" : `Hasta ${limits.maxUsers} bots`}</li>
        <li>· {limits.autoSwitch ? "Auto-Switch on" : "Modo manual"}</li>
        <li>· {limits.prioritySupport ? "Soporte prioritario" : "Soporte estándar"}</li>
      </ul>
    </button>
  );
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();

  const [tenantName, setTenantName] = useState("");
  const [plan, setPlan] = useState<Plan>("FREE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user?.tenantId) navigate("/", { replace: true }); }, [user, navigate]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (tenantName.trim().length < 3) { toast.error("Mínimo 3 caracteres"); return; }
    setSubmitting(true);
    try {
      const updated = await api.createTenant({ name: tenantName.trim(), plan });
      setUser(updated);
      toast.success(`Workspace "${updated.tenantName}" creado`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el workspace");
    } finally { setSubmitting(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-strong bg-surface/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">QL Trading Bot</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.email}</h1>
          <p className="text-muted-foreground mt-2">Configura tu workspace para empezar a operar.</p>
        </div>

        <Card className="border-strong bg-surface shadow-elevated">
          <CardHeader>
            <CardTitle>Crea tu workspace</CardTitle>
            <CardDescription>Serás el administrador del tenant. En Enterprise podrás añadir hasta 3 bots después.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTenant} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tenant">Nombre del workspace</Label>
                <Input id="tenant" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Mi Hedge Fund" required />
              </div>

              <div className="space-y-2">
                <Label>Elige tu plan</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SELECTABLE_PLANS.map((p) => (
                    <PlanCard key={p} plan={p} selected={plan === p} onSelect={() => setPlan(p)} />
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear workspace
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Onboarding;
