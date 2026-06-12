import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AchievementBadge } from "@/components/academy/AchievementBadge";
import { useGamificationStore } from "@/store/gamificationStore";
import { achievementsList, totalLessons } from "@/data/academyContent";
import { Flame, TrendingUp, Award } from "lucide-react";

export default function ProgressPage() {
  const { xp, streak, achievements, levels, getUserLevel, getProgressPercent } = useGamificationStore();

  const userLevel = getUserLevel();
  const progressPercent = getProgressPercent();
  const completedLessons = levels.reduce(
    (sum, l) => sum + l.lessons.filter((ls) => ls.completedAt).length,
    0
  );
  const unlockedCount = achievements.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tu Progreso</h1>
        <p className="text-muted-foreground">Seguí tu evolución en la Trading Academy</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nivel</p>
              <p className="font-semibold text-sm">{userLevel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">XP Total</p>
              <p className="font-semibold text-sm">{xp}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Racha</p>
              <p className="font-semibold text-sm">{streak} días</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Award className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logros</p>
              <p className="font-semibold text-sm">{unlockedCount}/{achievementsList.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progreso general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{completedLessons} de {totalLessons} lecciones</span>
            <span className="text-sm font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Logros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {achievementsList.map((ach) => {
              const unlocked = achievements.find((a) => a.id === ach.id);
              return (
                <AchievementBadge
                  key={ach.id}
                  achievement={{ ...ach, unlockedAt: unlocked?.unlockedAt }}
                  unlocked={!!unlocked}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
