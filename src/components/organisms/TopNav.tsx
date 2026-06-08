import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Bot, Check, LogOut, User as UserIcon } from "lucide-react";
import { BotToggle } from "@/components/molecules/BotToggle";
import { useQuery } from "@tanstack/react-query";
import { api, isMockMode } from "@/shared/api/client";
import { PnLBadge } from "@/components/atoms/PnLBadge";
import { toast } from "sonner";

export const TopNav = () => {
  const user = useAuthStore((s) => s.user);
  const availableUsers = useAuthStore((s) => s.availableUsers);
  const selectUser = useAuthStore((s) => s.selectUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: () => api.getDashboardSummary(), refetchInterval: 5_000 });
  const dailyPnLPercent = summary && summary.balance ? (summary.totalPnl / summary.balance) * 100 : null;

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleSwitchBot = async (userId: number) => {
    try {
      const u = await selectUser(userId);
      toast.success(`Bot activo: ${u.email}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo cambiar de bot"); }
  };

  const hasMultipleBots = (availableUsers ?? []).length > 1;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-strong bg-background/80 backdrop-blur px-3 sm:px-4">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger />
        <div className="hidden md:flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{user?.tenantName ?? "Trading Bot"}</span>
          {user?.plan && <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">{user.plan}</Badge>}
          {isMockMode && <Badge variant="outline" className="border-warning/40 text-warning text-[10px]">DEMO</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bot selector — only Enterprise tenants with >1 bot */}
        {hasMultipleBots && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-strong h-8">
                <Bot className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs hidden sm:inline">{user?.email?.split("@")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Cambiar bot activo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableUsers.map((au) => (
                <DropdownMenuItem key={au.userId} onClick={() => handleSwitchBot(au.userId)} className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{au.email}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {au.botActive ? "Operando" : "Pausado"} · ${au.capital.toLocaleString()}
                    </div>
                  </div>
                  {au.userId === user?.id && <Check className="h-4 w-4 text-primary mt-0.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {dailyPnLPercent != null && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">P&L hoy</span>
            <PnLBadge value={dailyPnLPercent} />
          </div>
        )}
        <BotToggle variant="compact" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium truncate">{user?.email}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/config")}>
              <UserIcon className="h-4 w-4 mr-2" /> Configuración
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
