import { createId } from "./id";
import type { DayPlan, Equipment, Exercise, Goal, Program, UserProfile } from "./types";

type Tier = "gym" | "dumbbells" | "bodyweight";

function pickTier(equipment: Equipment[]): Tier {
  if (equipment.includes("gym")) return "gym";
  if (equipment.includes("dumbbells")) return "dumbbells";
  return "bodyweight";
}

function repRange(goals: Goal[], muscleBias: boolean): string {
  const wantsMuscle = goals.includes("muscle");
  const wantsLoss = goals.includes("weight_loss");
  if (wantsMuscle && wantsLoss) return muscleBias ? "8–12" : "10–15";
  if (wantsLoss) return "12–15";
  return "6–10";
}

function restSec(goals: Goal[], compound: boolean): number {
  const wantsLoss = goals.includes("weight_loss");
  const wantsMuscle = goals.includes("muscle");
  if (wantsLoss && !wantsMuscle) return compound ? 60 : 45;
  if (wantsMuscle && !wantsLoss) return compound ? 120 : 90;
  return compound ? 90 : 75;
}

function setsForGoal(goals: Goal[], index: number): number {
  const wantsMuscle = goals.includes("muscle");
  const wantsLoss = goals.includes("weight_loss");
  if (wantsMuscle && !wantsLoss) return index < 2 ? 4 : 3;
  if (wantsLoss && !wantsMuscle) return 3;
  return index < 2 ? 4 : 3;
}

function exercisesPerSession(sessionMinutes: number, age: number): number {
  let n =
    sessionMinutes <= 35 ? 4 : sessionMinutes <= 50 ? 5 : sessionMinutes <= 70 ? 6 : 7;
  if (age >= 65) n = Math.max(3, n - 1);
  return n;
}

type ExerciseTemplate = { name: string; compound: boolean };

const TEMPLATES: Record<Tier, Record<string, ExerciseTemplate[]>> = {
  bodyweight: {
    full_push: [
      { name: "Push-up", compound: true },
      { name: "Pike push-up", compound: true },
      { name: "Triceps bench dip (chair)", compound: false },
      { name: "Side plank", compound: false },
    ],
    full_pull: [
      { name: "Inverted row (table)", compound: true },
      { name: "Superman hold", compound: false },
      { name: "Dead bug", compound: false },
      { name: "Bird dog", compound: false },
    ],
    full_legs: [
      { name: "Air squat", compound: true },
      { name: "Reverse lunge", compound: true },
      { name: "Glute bridge", compound: false },
      { name: "Calf raise", compound: false },
    ],
    full_core: [
      { name: "Plank", compound: true },
      { name: "Bicycle crunch", compound: false },
      { name: "Lying leg raise", compound: false },
    ],
    upper: [
      { name: "Push-up", compound: true },
      { name: "Inverted row (table)", compound: true },
      { name: "Pike push-up", compound: true },
      { name: "Triceps bench dip", compound: false },
    ],
    lower: [
      { name: "Air squat", compound: true },
      { name: "Reverse lunge", compound: true },
      { name: "Glute bridge", compound: true },
      { name: "Single-leg RDL (supported)", compound: false },
    ],
  },
  dumbbells: {
    push: [
      { name: "Dumbbell bench / floor press", compound: true },
      { name: "Dumbbell shoulder press", compound: true },
      { name: "Lateral raise", compound: false },
      { name: "Overhead triceps extension", compound: false },
    ],
    pull: [
      { name: "Single-arm dumbbell row", compound: true },
      { name: "Chest-supported row (incline bench)", compound: true },
      { name: "Hammer curl", compound: false },
      { name: "Reverse fly", compound: false },
    ],
    legs: [
      { name: "Goblet squat", compound: true },
      { name: "Dumbbell Romanian deadlift", compound: true },
      { name: "Forward lunge", compound: true },
      { name: "Calf raise (DB)", compound: false },
    ],
    full: [
      { name: "Goblet squat", compound: true },
      { name: "Dumbbell row", compound: true },
      { name: "Dumbbell floor press", compound: true },
      { name: "Romanian deadlift", compound: false },
      { name: "Plank row (renegade, light)", compound: true },
    ],
  },
  gym: {
    push: [
      { name: "Barbell bench press", compound: true },
      { name: "Overhead press", compound: true },
      { name: "Incline dumbbell press", compound: true },
      { name: "Lateral raise", compound: false },
      { name: "Cable triceps pushdown", compound: false },
    ],
    pull: [
      { name: "Lat pulldown", compound: true },
      { name: "Seated cable row", compound: true },
      { name: "Face pull", compound: false },
      { name: "Barbell or EZ curl", compound: false },
    ],
    legs: [
      { name: "Back squat or leg press", compound: true },
      { name: "Romanian deadlift", compound: true },
      { name: "Leg curl", compound: false },
      { name: "Leg extension", compound: false },
      { name: "Standing calf raise", compound: false },
    ],
    upper: [
      { name: "Bench press", compound: true },
      { name: "Lat pulldown", compound: true },
      { name: "Row", compound: true },
      { name: "Overhead press", compound: true },
    ],
    lower: [
      { name: "Squat or leg press", compound: true },
      { name: "Romanian deadlift", compound: true },
      { name: "Leg curl", compound: false },
      { name: "Calf raise", compound: false },
    ],
  },
};

function takeTemplates(
  list: ExerciseTemplate[],
  count: number,
  goals: Goal[],
): Exercise[] {
  const repsMain = repRange(goals, true);
  const repsAccessory = repRange(goals, false);
  const slice = list.slice(0, Math.min(count, list.length));
  return slice.map((t, i) => ({
    id: createId(),
    name: t.name,
    sets: setsForGoal(goals, i),
    reps: t.compound ? repsMain : repsAccessory,
    restSec: restSec(goals, t.compound),
  }));
}

function dayFromKey(
  tier: Tier,
  key: string,
  label: string,
  count: number,
  goals: Goal[],
): DayPlan {
  const bank = TEMPLATES[tier][key];
  if (!bank) {
    return { id: createId(), name: label, exercises: [] };
  }
  return {
    id: createId(),
    name: label,
    exercises: takeTemplates(bank, count, goals),
  };
}

function buildDays(profile: UserProfile): DayPlan[] {
  const tier = pickTier(profile.equipment);
  const n = exercisesPerSession(profile.sessionMinutes, profile.age);
  const d = Math.min(6, Math.max(2, profile.daysPerWeek));
  const g = profile.goals;

  if (tier === "bodyweight") {
    if (d <= 2) {
      return [
        dayFromKey(tier, "upper", "Full body A", n, g),
        dayFromKey(tier, "lower", "Full body B", n, g),
      ];
    }
    if (d === 3) {
      return [
        dayFromKey(tier, "full_push", "Full body — push & legs", n, g),
        dayFromKey(tier, "full_pull", "Full body — pull & core", n, g),
        dayFromKey(tier, "full_legs", "Full body — legs & core", n, g),
      ];
    }
    if (d === 4) {
      return [
        dayFromKey(tier, "upper", "Upper", n, g),
        dayFromKey(tier, "lower", "Lower", n, g),
        dayFromKey(tier, "upper", "Upper (variation)", n, g),
        dayFromKey(tier, "lower", "Lower (variation)", n, g),
      ];
    }
    const cycle = [
      dayFromKey(tier, "full_push", "Push", n, g),
      dayFromKey(tier, "full_pull", "Pull", n, g),
      dayFromKey(tier, "full_legs", "Legs", n, g),
    ];
    const out: DayPlan[] = [];
    for (let i = 0; i < d; i++) out.push({ ...cycle[i % 3], id: createId(), name: `${cycle[i % 3].name} (${Math.floor(i / 3) + 1})` });
    return out;
  }

  if (tier === "dumbbells") {
    if (d <= 3) {
      const keys = ["full", "full", "full"] as const;
      return keys.slice(0, d).map((k, i) => dayFromKey(tier, k, `Full body ${i + 1}`, n, g));
    }
    if (d === 4) {
      return [
        dayFromKey(tier, "push", "Push", n, g),
        dayFromKey(tier, "pull", "Pull", n, g),
        dayFromKey(tier, "legs", "Legs", n, g),
        dayFromKey(tier, "full", "Full body", n, g),
      ];
    }
    const ppl = [
      dayFromKey(tier, "push", "Push", n, g),
      dayFromKey(tier, "pull", "Pull", n, g),
      dayFromKey(tier, "legs", "Legs", n, g),
    ];
    const out: DayPlan[] = [];
    for (let i = 0; i < d; i++) {
      const base = ppl[i % 3];
      out.push({
        ...base,
        id: createId(),
        name: d > 3 ? `${base.name} (${Math.floor(i / 3) + 1})` : base.name,
      });
    }
    return out;
  }

  // gym
  if (d <= 3) {
    return [
      dayFromKey(tier, "push", "Push", n, g),
      dayFromKey(tier, "pull", "Pull", n, g),
      dayFromKey(tier, "legs", "Legs", n, g),
    ];
  }
  if (d === 4) {
    return [
      dayFromKey(tier, "upper", "Upper A", n, g),
      dayFromKey(tier, "lower", "Lower A", n, g),
      dayFromKey(tier, "upper", "Upper B", n, g),
      dayFromKey(tier, "lower", "Lower B", n, g),
    ];
  }
  const ppl = [
    dayFromKey(tier, "push", "Push", n, g),
    dayFromKey(tier, "pull", "Pull", n, g),
    dayFromKey(tier, "legs", "Legs", n, g),
  ];
  const out: DayPlan[] = [];
  for (let i = 0; i < d; i++) {
    const base = ppl[i % 3];
    out.push({
      ...base,
      id: createId(),
      name: `${base.name} (${Math.floor(i / 3) + 1})`,
    });
  }
  return out;
}

export function generateProgram(profile: UserProfile): Program {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: "My generated plan",
    createdAt: now,
    updatedAt: now,
    days: buildDays(profile),
  };
}
