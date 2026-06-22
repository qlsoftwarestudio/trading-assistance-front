import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { api, isMockMode } from "@/shared/api/client";
import { Bot, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { login, finalizeLogin, loading } = useAuthStore();
  const [email, setEmail] = useState(isMockMode ? "admin@trading.local" : "");
  const [password, setPassword] = useState(isMockMode ? "admin123" : "");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const goHome = () => {
    const from = location.state?.from;
    navigate(from && from !== "/login" ? from : "/", { replace: true });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res.twoFactorRequired && res.tempToken) {
        setTempToken(res.tempToken);
        setStep("otp");
        return;
      }
      toast.success(`Bienvenido, ${res.email}`);
      goHome();
    } catch {
      toast.error("Credenciales inválidas");
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      const res = await api.validate2fa(tempToken, otp);
      finalizeLogin(res);
      toast.success(`Bienvenido, ${res.email}`);
      goHome();
    } catch {
      toast.error("Código incorrecto");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--success)/0.1),transparent_50%)]" />
      <Card className="w-full max-w-md border-strong bg-surface shadow-elevated">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            {step === "otp" ? <ShieldCheck className="h-6 w-6 text-primary-foreground" /> : <Bot className="h-6 w-6 text-primary-foreground" />}
          </div>
          <div>
            <CardTitle className="text-2xl">{step === "otp" ? "Verificación 2FA" : "Iniciar sesión"}</CardTitle>
            <CardDescription className="mt-1">
              {step === "otp" ? "Ingresa el código de tu aplicación autenticadora" : "Accede a tu Trading Bot"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              {isMockMode && (
                <p className="text-[11px] text-center text-muted-foreground/70">
                  Modo demo — credenciales: <code className="text-primary">admin@trading.local</code> / <code className="text-primary">admin123</code>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={onOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Código de 6 dígitos</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" disabled={otpLoading || otp.length !== 6} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar
              </Button>
              <button type="button" onClick={() => { setStep("credentials"); setOtp(""); }} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Volver al login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
