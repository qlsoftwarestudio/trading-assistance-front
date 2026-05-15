import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/atoms/StatusDot";
import { Power, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBotStore } from "@/store/botStore";

interface Props {
  variant?: "default" | "compact";
  className?: string;
}

export const BotToggle = ({ variant = "default", className }: Props) => {
  const { active, toggle } = useBotStore();
  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-strong bg-surface px-3 py-1.5 text-xs font-medium hover:border-primary/50 transition-colors",
          className,
        )}
      >
        <StatusDot active={active} variant={active ? "success" : "muted"} pulse={active} />
        <span>{active ? "Bot activo" : "Bot pausado"}</span>
      </button>
    );
  }
  return (
    <Button
      onClick={toggle}
      variant={active ? "outline" : "default"}
      className={cn(
        active
          ? "border-success/40 bg-success/10 text-success hover:bg-success/20 hover:text-success"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
    >
      {active ? <Pause className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
      {active ? "Pausar Bot" : "Activar Bot"}
    </Button>
  );
};
