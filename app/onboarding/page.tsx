"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { generateProgram } from "@/lib/generateProgram";
import { addProgram, loadState, setProfile } from "@/lib/storage";
import type { Equipment, Gender, Goal } from "@/lib/types";

const STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | "">("");
  const [sessionMinutes, setSessionMinutes] = useState<number | "">("");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHomeLink, setShowHomeLink] = useState(false);

  useEffect(() => {
    setShowHomeLink(loadState().onboardingComplete);
  }, []);

  function toggleEquipment(e: Equipment) {
    setEquipment((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  function toggleGoal(g: Goal) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function validateStep(s: number): string | null {
    if (s === 1 && !gender) return "Choose an option.";
    if (s === 2) {
      const n = Number(age);
      if (!Number.isFinite(n) || n < 13 || n > 100) return "Enter an age between 13 and 100.";
    }
    if (s === 3) {
      const d = Number(daysPerWeek);
      if (!Number.isFinite(d) || d < 2 || d > 6) return "Pick 2–6 days per week.";
    }
    if (s === 4) {
      const m = Number(sessionMinutes);
      if (!Number.isFinite(m) || m < 20 || m > 120)
        return "Pick a session length between 20 and 120 minutes.";
    }
    if (s === 5 && equipment.length === 0) return "Select at least one equipment option.";
    if (s === 6 && goals.length === 0) return "Select at least one goal.";
    return null;
  }

  function next() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    if (step < STEPS) setStep(step + 1);
  }

  function back() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  function finish() {
    const msg = validateStep(6);
    if (msg) {
      setError(msg);
      return;
    }
    const nAge = Number(age);
    const d = Number(daysPerWeek);
    const m = Number(sessionMinutes);
    const profile = {
      gender: gender as Gender,
      age: nAge,
      daysPerWeek: d,
      sessionMinutes: m,
      equipment,
      goals,
      completedAt: new Date().toISOString(),
    };
    setProfile(profile);
    const program = generateProgram(profile);
    addProgram(program);
    router.push(`/program/${program.id}`);
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your plan</h1>
        {showHomeLink ? (
          <Link
            href="/"
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Back to home
          </Link>
        ) : null}
      </div>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Step {step} of {STEPS} — answer a few questions and we will build a starter workout
        program. Everything stays in your browser.
      </p>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Gender</legend>
          {(
            [
              ["woman", "Woman"],
              ["man", "Man"],
              ["prefer_not_say", "Prefer not to say"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
            >
              <input
                type="radio"
                name="gender"
                checked={gender === value}
                onChange={() => setGender(value)}
                className="h-4 w-4"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {step === 2 ? (
        <div>
          <label htmlFor="age" className="mb-2 block text-sm font-medium">
            Age
          </label>
          <input
            id="age"
            type="number"
            min={13}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            placeholder="e.g. 32"
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <label htmlFor="days" className="mb-2 block text-sm font-medium">
            Days per week you want to train
          </label>
          <select
            id="days"
            value={daysPerWeek}
            onChange={(e) =>
              setDaysPerWeek(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            <option value="">Choose…</option>
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} days
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <label htmlFor="session" className="mb-2 block text-sm font-medium">
            Typical workout length (minutes)
          </label>
          <select
            id="session"
            value={sessionMinutes}
            onChange={(e) =>
              setSessionMinutes(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            <option value="">Choose…</option>
            <option value={30}>About 30 minutes</option>
            <option value={45}>About 45 minutes</option>
            <option value={60}>About 60 minutes</option>
            <option value={75}>75+ minutes</option>
          </select>
        </div>
      ) : null}

      {step === 5 ? (
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Equipment you can use</legend>
          {(
            [
              ["bodyweight", "Bodyweight only"],
              ["dumbbells", "Dumbbells"],
              ["gym", "Full gym (barbell, machines, cables)"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
            >
              <input
                type="checkbox"
                checked={equipment.includes(value)}
                onChange={() => toggleEquipment(value)}
                className="h-4 w-4 rounded"
              />
              <span>{label}</span>
            </label>
          ))}
          <p className="text-xs text-[var(--muted)]">
            If you pick multiple, we assume the most complete option you have (for example gym
            beats dumbbells).
          </p>
        </fieldset>
      ) : null}

      {step === 6 ? (
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Goals</legend>
          {(
            [
              ["muscle", "Muscle building / strength"],
              ["weight_loss", "Weight loss / conditioning"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
            >
              <input
                type="checkbox"
                checked={goals.includes(value)}
                onChange={() => toggleGoal(value)}
                className="h-4 w-4 rounded"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-white/5"
          >
            Back
          </button>
        ) : null}
        {step < STEPS ? (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Generate my workout
          </button>
        )}
      </div>
    </Shell>
  );
}
