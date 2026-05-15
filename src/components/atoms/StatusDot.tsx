import { cn } from "@/lib/utils";

interface Props {
  active?: boolean;
  variant?: "success" | "danger" | "warning" | "muted";
  pulse?: boolean;
  className?: string;
}

const colorMap = {
  success: "bg-success",
  danger: "bg-destructive",
  warning: "bg-warning",
  muted: "bg-muted-foreground",
};

export const StatusDot = ({ active = true, variant = "success", pulse = true, className }: Props) => (
  <span className="relative inline-flex h-2.5 w-2.5">
    {active && pulse && (
      <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 pulse-dot", colorMap[variant])} />
    )}
    <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", active ? colorMap[variant] : "bg-muted", className)} />
  </span>
);
