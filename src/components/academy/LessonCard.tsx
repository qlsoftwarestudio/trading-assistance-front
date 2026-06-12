import { Lock, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  description: string;
  durationMinutes: number;
  status: "locked" | "available" | "completed";
  onClick: () => void;
}

export function LessonCard({ title, description, durationMinutes, status, onClick }: LessonCardProps) {
  const Icon = status === "completed" ? CheckCircle2 : status === "locked" ? Lock : Circle;

  return (
    <Card
      onClick={status !== "locked" ? onClick : undefined}
      className={cn(
        "transition-all duration-200",
        status === "locked" && "opacity-60 cursor-not-allowed",
        status !== "locked" && "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn(
          "mt-0.5 shrink-0",
          status === "completed" && "text-emerald-500",
          status === "available" && "text-primary",
          status === "locked" && "text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{durationMinutes} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
