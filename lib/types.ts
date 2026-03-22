export type Gender = "woman" | "man" | "prefer_not_say";

export type Equipment = "bodyweight" | "dumbbells" | "gym";

export type Goal = "muscle" | "weight_loss";

export interface UserProfile {
  gender: Gender;
  age: number;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: Equipment[];
  goals: Goal[];
  completedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
}

export interface DayPlan {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  days: DayPlan[];
}

export interface AppStateV1 {
  version: 1;
  onboardingComplete: boolean;
  profile: UserProfile | null;
  programs: Program[];
}
