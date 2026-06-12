import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserLevel = "Novato" | "Aprendiz" | "Analista" | "Estratega" | "Master Trader";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  completedAt?: string;
  quizScore?: number;
  quizPerfect: boolean;
}

export interface LevelProgress {
  levelId: string;
  completedAt?: string;
  lessons: LessonProgress[];
}

interface GamificationState {
  xp: number;
  streak: number;
  lastVisitDate: string;
  levels: LevelProgress[];
  achievements: Achievement[];
  // Actions
  addXp: (amount: number) => void;
  completeLesson: (levelId: string, lessonId: string, quizScore?: number) => void;
  completeLevel: (levelId: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getUserLevel: () => UserLevel;
  getXpToNextLevel: () => number;
  getProgressPercent: () => number;
  checkAndUpdateStreak: () => void;
}

const LEVEL_THRESHOLDS: { level: UserLevel; threshold: number }[] = [
  { level: "Novato", threshold: 0 },
  { level: "Aprendiz", threshold: 500 },
  { level: "Analista", threshold: 1500 },
  { level: "Estratega", threshold: 3000 },
  { level: "Master Trader", threshold: 6000 },
];

const TOTAL_LESSONS = 24; // approximate total across all levels

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      lastVisitDate: "",
      levels: [],
      achievements: [],

      addXp: (amount: number) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      completeLesson: (levelId: string, lessonId: string, quizScore?: number) => {
        const state = get();
        const existingLevel = state.levels.find((l) => l.levelId === levelId);
        const isNew = !existingLevel?.lessons.find((l) => l.lessonId === lessonId);

        let xpGain = 50;
        const quizPerfect = quizScore === 100;
        if (quizPerfect) xpGain += 100;

        set((prev) => {
          const levels = [...prev.levels];
          const levelIndex = levels.findIndex((l) => l.levelId === levelId);

          if (levelIndex === -1) {
            levels.push({
              levelId,
              lessons: [{ lessonId, completedAt: new Date().toISOString(), quizScore, quizPerfect }],
            });
          } else {
            const lessonIndex = levels[levelIndex].lessons.findIndex(
              (l) => l.lessonId === lessonId
            );
            if (lessonIndex === -1) {
              levels[levelIndex].lessons.push({
                lessonId,
                completedAt: new Date().toISOString(),
                quizScore,
                quizPerfect,
              });
            } else {
              levels[levelIndex].lessons[lessonIndex] = {
                ...levels[levelIndex].lessons[lessonIndex],
                completedAt: new Date().toISOString(),
                quizScore,
                quizPerfect,
              };
            }
          }

          return { levels, xp: prev.xp + (isNew ? xpGain : 0) };
        });
      },

      completeLevel: (levelId: string) => {
        set((prev) => {
          const levels = [...prev.levels];
          const idx = levels.findIndex((l) => l.levelId === levelId);
          if (idx !== -1 && !levels[idx].completedAt) {
            levels[idx] = { ...levels[idx], completedAt: new Date().toISOString() };
            return { levels, xp: prev.xp + 200 };
          }
          return { levels };
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        const state = get();
        if (state.achievements.find((a) => a.id === achievement.id)) return;

        set((prev) => ({
          achievements: [...prev.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
          xp: prev.xp + 200,
        }));
      },

      getUserLevel: () => {
        const xp = get().xp;
        let current: UserLevel = "Novato";
        for (const lt of LEVEL_THRESHOLDS) {
          if (xp >= lt.threshold) current = lt.level;
        }
        return current;
      },

      getXpToNextLevel: () => {
        const xp = get().xp;
        for (const lt of LEVEL_THRESHOLDS) {
          if (xp < lt.threshold) return lt.threshold - xp;
        }
        return 0;
      },

      getProgressPercent: () => {
        const completedLessons = get().levels.reduce(
          (sum, l) => sum + l.lessons.filter((ls) => ls.completedAt).length,
          0
        );
        return Math.min(100, Math.round((completedLessons / TOTAL_LESSONS) * 100));
      },

      checkAndUpdateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        if (state.lastVisitDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const newStreak = state.lastVisitDate === yesterdayStr ? state.streak + 1 : 1;
        const streakBonus = newStreak > 1 ? 10 : 0;

        set((prev) => ({
          lastVisitDate: today,
          streak: newStreak,
          xp: prev.xp + streakBonus,
        }));
      },
    }),
    { name: "trading-academy-gamification" }
  )
);
