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

type ExerciseTemplate = { name: string; compound: boolean; note?: string };

const TEMPLATES: Record<Tier, Record<string, ExerciseTemplate[]>> = {
  bodyweight: {
    full_push: [
      { name: "Push-up", compound: true },
      { name: "Decline push-up (feet elevated)", compound: true, note: "Hands on floor, feet on bench or step." },
      { name: "Pike push-up", compound: true },
      { name: "Triceps dip (bench or chair)", compound: true },
      { name: "Side plank", compound: false },
    ],
    full_pull: [
      { name: "Inverted row (table or bar)", compound: true },
      { name: "Prone Y-T-W raise", compound: false, note: "Light; move shoulder blades first." },
      { name: "Superman hold", compound: false },
      { name: "Dead bug", compound: false },
    ],
    full_legs: [
      { name: "Air squat", compound: true },
      { name: "Reverse lunge", compound: true },
      { name: "Bulgarian split squat (rear foot elevated)", compound: true },
      { name: "Glute bridge", compound: false },
      { name: "Single-leg calf raise", compound: false },
    ],
    upper: [
      { name: "Push-up", compound: true },
      { name: "Inverted row", compound: true },
      { name: "Pike push-up", compound: true },
      { name: "Diamond push-up", compound: false },
      { name: "Plank shoulder tap", compound: false },
    ],
    lower: [
      { name: "Air squat", compound: true },
      { name: "Walking lunge", compound: true },
      { name: "Glute bridge", compound: true },
      { name: "Wall sit", compound: false, note: "30–45s hold." },
      { name: "Calf raise", compound: false },
    ],
  },
  dumbbells: {
    push: [
      { name: "Dumbbell bench or floor press", compound: true },
      { name: "Dumbbell shoulder press", compound: true },
      { name: "Incline DB press (if bench)", compound: true },
      { name: "Lateral raise", compound: false },
      { name: "Overhead triceps extension", compound: false },
    ],
    pull: [
      { name: "Single-arm dumbbell row", compound: true },
      { name: "Chest-supported row (incline bench)", compound: true },
      { name: "Hammer curl", compound: false },
      { name: "Reverse fly (bent-over)", compound: false },
      { name: "Farmer carry (heavy walk)", compound: true, note: "Short distance, tall posture." },
    ],
    legs: [
      { name: "Goblet squat", compound: true },
      { name: "Dumbbell Romanian deadlift", compound: true },
      { name: "Forward lunge (DB)", compound: true },
      { name: "Step-up (DB)", compound: true },
      { name: "Calf raise holding DBs", compound: false },
    ],
    full_a: [
      { name: "Goblet squat", compound: true },
      { name: "Dumbbell row (both arms)", compound: true },
      { name: "Dumbbell floor press", compound: true },
      { name: "Romanian deadlift", compound: true },
      { name: "Plank (or side plank)", compound: false },
    ],
    full_b: [
      { name: "Forward lunge", compound: true },
      { name: "Chest-supported row", compound: true },
      { name: "Shoulder press", compound: true },
      { name: "Single-leg RDL (supported)", compound: true, note: "Light DB; balance with wall if needed." },
      { name: "Hammer curl", compound: false },
    ],
    full_c: [
      { name: "Step-up", compound: true },
      { name: "Single-arm row", compound: true },
      { name: "Incline or flat DB press", compound: true },
      { name: "Goblet squat (tempo 3-1-1)", compound: true, note: "Lower slowly." },
      { name: "Reverse fly", compound: false },
    ],
  },
  gym: {
    push: [
      { name: "Barbell bench press", compound: true },
      { name: "Overhead press (barbell or DB)", compound: true },
      { name: "Incline dumbbell press", compound: true },
      { name: "Cable fly or pec deck", compound: false },
      { name: "Lateral raise", compound: false },
      { name: "Triceps pushdown", compound: false },
    ],
    pull: [
      { name: "Lat pulldown or pull-up", compound: true },
      { name: "Seated cable row", compound: true },
      { name: "Chest-supported machine row", compound: true },
      { name: "Face pull", compound: false },
      { name: "EZ-bar or cable curl", compound: false },
    ],
    legs: [
      { name: "Back squat or safety bar squat", compound: true },
      { name: "Romanian deadlift", compound: true },
      { name: "Leg press", compound: true },
      { name: "Leg curl", compound: false },
      { name: "Leg extension", compound: false },
      { name: "Standing or seated calf raise", compound: false },
    ],
    upper_a: [
      { name: "Bench press", compound: true },
      { name: "Lat pulldown", compound: true },
      { name: "Seated row", compound: true },
      { name: "Overhead press", compound: true },
      { name: "Lateral raise", compound: false },
    ],
    upper_b: [
      { name: "Incline dumbbell press", compound: true },
      { name: "One-arm dumbbell row", compound: true },
      { name: "Cable row (neutral grip)", compound: true },
      { name: "Machine shoulder press", compound: true },
      { name: "Rear delt fly", compound: false },
    ],
    lower_a: [
      { name: "Back squat or leg press", compound: true },
      { name: "Romanian deadlift", compound: true },
      { name: "Leg curl", compound: false },
      { name: "Walking lunge (DB optional)", compound: true },
      { name: "Calf raise", compound: false },
    ],
    lower_b: [
      { name: "Front squat or hack squat", compound: true },
      { name: "Hip thrust or glute bridge (bar)", compound: true },
      { name: "Bulgarian split squat", compound: true },
      { name: "Leg extension", compound: false },
      { name: "Seated calf raise", compound: false },
    ],
  },
};

const FINISHER: Record<Tier, ExerciseTemplate> = {
  gym: {
    name: "Bike, rower, or brisk incline walk",
    compound: false,
    note: "Steady effort 8–12 min; optional if short on time.",
  },
  dumbbells: {
    name: "DB complex: squat → press → RDL (light)",
    compound: true,
    note: "3 rounds, 8 reps each move, minimal rest between.",
  },
  bodyweight: {
    name: "Circuit: jumping jacks, mountain climbers, squat jumps",
    compound: false,
    note: "30s each × 3 rounds; stop if form breaks down.",
  },
};

function warmupExercises(): Exercise[] {
  return [
    {
      id: createId(),
      name: "Warm-up: easy movement",
      sets: 1,
      reps: "5–8 min",
      restSec: 0,
      notes: "Walk, bike, or light mobility until you feel warm.",
    },
    {
      id: createId(),
      name: "Ramp-up sets on your first big lift",
      sets: 2,
      reps: "6–10",
      restSec: 45,
      notes: "Add weight gradually; stop before failure.",
    },
  ];
}

function takeTemplatesRotated(
  list: ExerciseTemplate[],
  count: number,
  goals: Goal[],
  rotation: number,
): Exercise[] {
  if (list.length === 0 || count <= 0) return [];
  const repsMain = repRange(goals, true);
  const repsAccessory = repRange(goals, false);
  const len = list.length;
  const start = ((rotation % len) + len) % len;
  const ordered: ExerciseTemplate[] = [];
  for (let i = 0; i < len; i++) {
    ordered.push(list[(start + i) % len]!);
  }
  const slice = ordered.slice(0, Math.min(count, ordered.length));
  return slice.map((t, i) => ({
    id: createId(),
    name: t.name,
    sets: setsForGoal(goals, i),
    reps: t.compound ? repsMain : repsAccessory,
    restSec: restSec(goals, t.compound),
    notes: t.note,
  }));
}

function appendFinisher(
  exercises: Exercise[],
  tier: Tier,
  goals: Goal[],
): Exercise[] {
  if (!goals.includes("weight_loss")) return exercises;
  const t = FINISHER[tier];
  const reps = repRange(goals, false);
  return [
    ...exercises,
    {
      id: createId(),
      name: t.name,
      sets: goals.includes("muscle") ? 2 : 3,
      reps,
      restSec: 45,
      notes: t.note,
    },
  ];
}

function buildDay(
  tier: Tier,
  key: string,
  label: string,
  totalMainSlots: number,
  goals: Goal[],
  rotation: number,
  includeFinisher: boolean,
): DayPlan {
  const warm = warmupExercises();
  const mainBudget = Math.max(3, totalMainSlots - warm.length);
  const bank = TEMPLATES[tier][key];
  let main: Exercise[] = [];
  if (bank) {
    main = takeTemplatesRotated(bank, mainBudget, goals, rotation);
  }
  let all = [...warm, ...main];
  if (includeFinisher) {
    all = appendFinisher(all, tier, goals);
  }
  return {
    id: createId(),
    name: label,
    exercises: all,
  };
}

function programTitle(profile: UserProfile, tier: Tier): string {
  const tierLabel =
    tier === "gym" ? "Gym" : tier === "dumbbells" ? "Dumbbells" : "Bodyweight";
  return `${profile.daysPerWeek} days · ${tierLabel}`;
}

function buildDays(profile: UserProfile): DayPlan[] {
  const tier = pickTier(profile.equipment);
  const slots = exercisesPerSession(profile.sessionMinutes, profile.age);
  const d = Math.min(6, Math.max(2, profile.daysPerWeek));
  const g = profile.goals;
  const finisherDays = g.includes("weight_loss") && d >= 3;

  if (tier === "bodyweight") {
    if (d <= 2) {
      return [
        buildDay(tier, "upper", "Full body A", slots, g, 0, false),
        buildDay(tier, "lower", "Full body B", slots, g, 2, false),
      ];
    }
    if (d === 3) {
      return [
        buildDay(tier, "full_push", "Push & core", slots, g, 0, false),
        buildDay(tier, "full_pull", "Pull & posture", slots, g, 1, false),
        buildDay(tier, "full_legs", "Legs & hips", slots, g, 2, finisherDays),
      ];
    }
    if (d === 4) {
      return [
        buildDay(tier, "upper", "Upper A", slots, g, 0, false),
        buildDay(tier, "lower", "Lower A", slots, g, 1, false),
        buildDay(tier, "upper", "Upper B", slots, g, 3, false),
        buildDay(tier, "lower", "Lower B", slots, g, 4, false),
      ];
    }
    const out: DayPlan[] = [];
    for (let i = 0; i < d; i++) {
      const kind = i % 3;
      const key = kind === 0 ? "full_push" : kind === 1 ? "full_pull" : "full_legs";
      const label = kind === 0 ? "Push" : kind === 1 ? "Pull" : "Legs";
      const week = Math.floor(i / 3) + 1;
      out.push(
        buildDay(
          tier,
          key,
          d > 3 ? `${label} (week ${week})` : label,
          slots,
          g,
          i * 2,
          finisherDays && kind === 2,
        ),
      );
    }
    return out;
  }

  if (tier === "dumbbells") {
    if (d <= 3) {
      const keys = ["full_a", "full_b", "full_c"] as const;
      return keys.slice(0, d).map((k, i) =>
        buildDay(tier, k, `Full body ${i + 1}`, slots, g, i * 3, finisherDays && i === d - 1),
      );
    }
    if (d === 4) {
      return [
        buildDay(tier, "push", "Push", slots, g, 0, false),
        buildDay(tier, "pull", "Pull", slots, g, 1, false),
        buildDay(tier, "legs", "Legs", slots, g, 2, false),
        buildDay(tier, "full_a", "Full body (extra)", slots, g, 4, true),
      ];
    }
    const out: DayPlan[] = [];
    for (let i = 0; i < d; i++) {
      const kind = i % 3;
      const key = kind === 0 ? "push" : kind === 1 ? "pull" : "legs";
      const label = kind === 0 ? "Push" : kind === 1 ? "Pull" : "Legs";
      const week = Math.floor(i / 3) + 1;
      out.push(
        buildDay(
          tier,
          key,
          `${label} (block ${week})`,
          slots,
          g,
          i * 2,
          finisherDays && kind === 2,
        ),
      );
    }
    return out;
  }

  // gym
  if (d <= 3) {
    return [
      buildDay(tier, "push", "Push", slots, g, 0, false),
      buildDay(tier, "pull", "Pull", slots, g, 2, false),
      buildDay(tier, "legs", "Legs", slots, g, 4, finisherDays),
    ];
  }
  if (d === 4) {
    return [
      buildDay(tier, "upper_a", "Upper A", slots, g, 0, false),
      buildDay(tier, "lower_a", "Lower A", slots, g, 1, false),
      buildDay(tier, "upper_b", "Upper B", slots, g, 2, false),
      buildDay(tier, "lower_b", "Lower B", slots, g, 3, true),
    ];
  }
  const out: DayPlan[] = [];
  for (let i = 0; i < d; i++) {
    const kind = i % 3;
    const key = kind === 0 ? "push" : kind === 1 ? "pull" : "legs";
    const label = kind === 0 ? "Push" : kind === 1 ? "Pull" : "Legs";
    const week = Math.floor(i / 3) + 1;
    out.push(
      buildDay(
        tier,
        key,
        `${label} (block ${week})`,
        slots,
        g,
        i * 2 + week,
        finisherDays && kind === 2,
      ),
    );
  }
  return out;
}

export function generateProgram(profile: UserProfile): Program {
  const now = new Date().toISOString();
  const tier = pickTier(profile.equipment);
  return {
    id: createId(),
    name: programTitle(profile, tier),
    createdAt: now,
    updatedAt: now,
    days: buildDays(profile),
  };
}
