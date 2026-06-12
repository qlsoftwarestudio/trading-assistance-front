import { Award, BarChart3, Activity, Shield, Microscope, Brain, Plug, Eye, Flame, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/store/gamificationStore";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  BarChart3,
  Activity,
  Shield,
  Microscope,
  Brain,
  Plug,
  Eye,
  Flame,
  Footprints,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Award;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center p-4 rounded-xl border transition-all",
        unlocked
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-muted/30 opacity-50 grayscale"
      )}
    >
      <div className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full",
        unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-2 text-sm font-medium">{achievement.title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
      {unlocked && achievement.unlockedAt && (
        <p className="mt-1 text-[10px] text-primary">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
