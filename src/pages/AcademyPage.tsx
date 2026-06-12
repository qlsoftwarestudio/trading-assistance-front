import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/academy/LessonCard";
import { useGamificationStore } from "@/store/gamificationStore";
import { levels, totalLessons } from "@/data/academyContent";
import { BookOpen, Trophy, TrendingUp, Flame } from "lucide-react";

export default function AcademyPage() {
  const navigate = useNavigate();
  const { xp, streak, levels: progressLevels, checkAndUpdateStreak, checkAchievements, getUserLevel, getXpToNextLevel, getProgressPercent } = useGamificationStore();

  useEffect(() => {
    checkAndUpdateStreak();
    checkAchievements();
  }, [checkAndUpdateStreak, checkAchievements]);

  const userLevel = getUserLevel();
  const xpToNext = getXpToNextLevel();
  const progressPercent = getProgressPercent();
  const completedLessons = progressLevels.reduce(
    (sum, l) => sum + l.lessons.filter((ls) => ls.completedAt).length,
    0
  );

  const isLevelUnlocked = (levelNumber: number) => {
    if (levelNumber === 0) return true;
    const prevLevel = progressLevels.find((l) => l.levelId === levels[levelNumber - 1].id);
    return !!prevLevel?.completedAt;
  };

  const isLessonCompleted = (levelId: string, lessonId: string) => {
    const level = progressLevels.find((l) => l.levelId === levelId);
    return !!level?.lessons.find((ls) => ls.lessonId === lessonId)?.completedAt;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
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
              <p className="text-xs text-muted-foreground">XP</p>
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
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Progreso</p>
              <p className="font-semibold text-sm">{completedLessons}/{totalLessons}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XP bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">XP hacia siguiente nivel</span>
            <span className="text-xs text-muted-foreground">{xpToNext > 0 ? `${xpToNext} XP restantes` : "¡Nivel máximo!"}</span>
          </div>
          <Progress value={xpToNext > 0 ? 100 - (xpToNext / 500) * 100 : 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso general de la Academy</span>
            <span className="text-xs text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Levels */}
      <div className="space-y-6">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level.number);
          const levelProgress = progressLevels.find((l) => l.levelId === level.id);
          const completedCount = levelProgress?.lessons.filter((l) => l.completedAt).length || 0;
          const allCompleted = completedCount === level.lessons.length;

          return (
            <Card key={level.id} className={!unlocked ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Nivel {level.number}
                      </span>
                      {allCompleted && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          Completado
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mt-1">{level.title}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{completedCount}/{level.lessons.length}</span>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {level.lessons.map((lesson) => {
                    const completed = isLessonCompleted(level.id, lesson.id);
                    let status: "locked" | "available" | "completed" = "locked";
                    if (completed) status = "completed";
                    else if (unlocked) status = "available";

                    return (
                      <LessonCard
                        key={lesson.id}
                        title={lesson.title}
                        description={lesson.description}
                        durationMinutes={lesson.durationMinutes}
                        status={status}
                        onClick={() => navigate(`/academy/lesson/${level.id}/${lesson.id}`)}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Progress */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate("/academy/progress")}>
          <Trophy className="h-4 w-4 mr-2" />
          Ver mis logros
        </Button>
      </div>
    </div>
  );
}
