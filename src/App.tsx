import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { useAchievementToasts } from "@/hooks/useAchievementToasts";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { RequireAuth, RequireAdmin } from "@/features/auth/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Market from "./pages/Market";
import Config from "./pages/Config";
import Admin from "./pages/Admin";
import AcademyPage from "./pages/AcademyPage";
import LessonPage from "./pages/LessonPage";
import ProgressPage from "./pages/ProgressPage";
import Performance from "./pages/Performance";
import Profile from "./pages/Profile";
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
  useAchievementToasts();

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
            <Route path="/performance" element={<Shell><Performance /></Shell>} />
            <Route path="/profile" element={<Shell><Profile /></Shell>} />
            <Route path="/academy" element={<Shell><AcademyPage /></Shell>} />
            <Route path="/academy/progress" element={<Shell><ProgressPage /></Shell>} />
            <Route path="/academy/lesson/:levelId/:lessonId" element={<Shell><LessonPage /></Shell>} />

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
