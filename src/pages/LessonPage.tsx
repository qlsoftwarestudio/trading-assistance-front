import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/components/academy/Quiz";
import { RRCalculator, PositionSizingCalculator } from "@/components/academy/Calculators";
import { useGamificationStore } from "@/store/gamificationStore";
import { levels, achievementsList } from "@/data/academyContent";
import { ArrowLeft, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function LessonPage() {
  const { levelId, lessonId } = useParams<{ levelId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { completeLesson, completeLevel, unlockAchievement, levels: progressLevels } = useGamificationStore();

  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const level = levels.find((l) => l.id === levelId);
  const lesson = level?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (!lesson) navigate("/academy");
  }, [lesson, navigate]);

  if (!level || !lesson) return null;

  const levelProgress = progressLevels.find((l) => l.levelId === levelId);
  const alreadyCompleted = !!levelProgress?.lessons.find((l) => l.lessonId === lessonId)?.completedAt;

  const handleQuizComplete = (score: number) => {
    setQuizDone(true);
    setQuizScore(score);
    completeLesson(levelId!, lessonId!, score);

    const perfect = score === 100;
    toast.success(perfect ? "¡Quiz perfecto! +150 XP" : "¡Lección completada! +50 XP");

    // Check if all lessons in level completed
    const updatedLevel = useGamificationStore.getState().levels.find((l) => l.levelId === levelId);
    const allDone = updatedLevel?.lessons.length === level.lessons.length;
    const allCompleted = updatedLevel?.lessons.every((l) => l.completedAt);

    if (allDone && allCompleted && !updatedLevel?.completedAt) {
      completeLevel(levelId!);
      toast.success(`¡Nivel ${level.number} completado! +200 XP`);
    }

    // Achievements
    // "primeros-pasos" — level 0 fully completed
    if (level.number === 0 && allCompleted) {
      const ach = achievementsList.find((a) => a.id === "primeros-pasos");
      if (ach) unlockAchievement(ach);
    }
    // "mente-fria" — level 5 completed
    if (level.number === 5 && allCompleted) {
      const ach = achievementsList.find((a) => a.id === "mente-fria");
      if (ach) unlockAchievement(ach);
    }
    // "analista" — level 1 completed with avg >= 80%
    if (level.number === 1 && allCompleted && updatedLevel) {
      const scores = updatedLevel.lessons.map((l) => l.quizScore ?? 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      if (avg >= 80) {
        const ach = achievementsList.find((a) => a.id === "analista");
        if (ach) unlockAchievement(ach);
      }
    }
    // "indicador" — RSI lesson (l2-rsi) quiz perfect
    if (perfect && lessonId === "l2-rsi") {
      const ach = achievementsList.find((a) => a.id === "indicador");
      if (ach) unlockAchievement(ach);
    }
    // "perfecto" — any level completed with all quizzes perfect
    if (allCompleted && updatedLevel?.lessons.every((l) => l.quizPerfect)) {
      const ach = achievementsList.find((a) => a.id === "perfecto");
      if (ach) unlockAchievement(ach);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/academy")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al Academy
      </Button>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Nivel {level.number}
          </span>
          <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
        </div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Contenido</span>
          </div>
          {lesson.content.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Calculator */}
      {lesson.hasCalculator && lesson.calculatorType === "rr" && <RRCalculator />}
      {lesson.hasCalculator && lesson.calculatorType === "position" && <PositionSizingCalculator />}

      {/* Quiz */}
      {!alreadyCompleted && !quizDone && (
        <Quiz questions={lesson.quiz} onComplete={handleQuizComplete} />
      )}

      {(alreadyCompleted || quizDone) && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-6 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <div>
              <p className="font-medium">Lección completada</p>
              <p className="text-sm text-muted-foreground">
                {alreadyCompleted ? "Ya habías completado esta lección." : `Puntuación: ${quizScore}%`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
