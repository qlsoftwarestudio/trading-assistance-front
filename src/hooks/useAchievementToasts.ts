import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGamificationStore } from "@/store/gamificationStore";
import { achievementsList } from "@/data/academyContent";

export function useAchievementToasts() {
  const lastUnlockedId = useGamificationStore((s) => s.lastUnlockedId);
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (lastUnlockedId && lastUnlockedId !== prevId.current) {
      prevId.current = lastUnlockedId;
      const ach = achievementsList.find((a) => a.id === lastUnlockedId);
      if (ach) {
        toast.success(`🏆 ¡Logro desbloqueado: ${ach.title}!`, {
          description: ach.description,
          duration: 4000,
        });
      }
    }
  }, [lastUnlockedId]);
}
