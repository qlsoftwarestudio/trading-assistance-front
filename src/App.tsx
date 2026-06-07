import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { RequireAuth, RequireAdmin } from "@/features/auth/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Market from "./pages/Market";
import Config from "./pages/Config";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false } },
});

const Shell = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth><DashboardLayout>{children}</DashboardLayout></RequireAuth>
);

const App = () => {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* App routes */}
            <Route path="/" element={<Shell><Dashboard /></Shell>} />
            <Route path="/trades" element={<Shell><Trades /></Shell>} />
            <Route path="/market" element={<Shell><Market /></Shell>} />
            <Route path="/config" element={<Shell><Config /></Shell>} />

            {/* Admin only */}
            <Route path="/admin" element={<RequireAdmin><DashboardLayout><Admin /></DashboardLayout></RequireAdmin>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
