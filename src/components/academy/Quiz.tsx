import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/data/academyContent";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
  };

  const handleCheck = () => {
    if (selected === null) return;
    const isCorrect = selected === q.correctIndex;
    setShowResult(true);
    setCorrectCount((prev) => prev + (isCorrect ? 1 : 0));
    setAnswers((prev) => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (isLast) {
      const finalScore = Math.round((correctCount / questions.length) * 100);
      onComplete(finalScore);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const isCorrect = selected === q.correctIndex;

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quiz · Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {answers.filter(Boolean).length} / {answers.length + (showResult ? 1 : 0)} correctas
          </span>
        </div>

        <h3 className="font-semibold mb-4">{q.question}</h3>

        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const state = showResult
              ? idx === q.correctIndex
                ? "correct"
                : idx === selected
                ? "wrong"
                : "neutral"
              : idx === selected
              ? "selected"
              : "neutral";

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                  state === "neutral" && "border-border hover:border-primary/50 bg-card",
                  state === "selected" && "border-primary bg-primary/10",
                  state === "correct" && "border-emerald-500 bg-emerald-500/10 text-emerald-700",
                  state === "wrong" && "border-rose-500 bg-rose-500/10 text-rose-700"
                )}
              >
                <div className="flex items-center gap-2">
                  {state === "correct" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {state === "wrong" && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={cn(
            "mt-4 p-3 rounded-lg text-sm",
            isCorrect ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
          )}>
            <p className="font-medium">{isCorrect ? "¡Correcto!" : "Incorrecto"}</p>
            <p className="mt-1 text-muted-foreground">{q.explanation}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          {!showResult ? (
            <Button onClick={handleCheck} disabled={selected === null}>
              Verificar
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {isLast ? "Finalizar" : "Siguiente"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
