"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { ProgramWorkoutView } from "@/components/ProgramWorkoutView";
import { Shell } from "@/components/Shell";
import { createId } from "@/lib/id";
import { loadState, updateProgram } from "@/lib/storage";
import type { DayPlan, Exercise, Program } from "@/lib/types";

function emptyExercise(): Exercise {
  return {
    id: createId(),
    name: "",
    sets: 3,
    reps: "8–12",
    restSec: 90,
  };
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15";

type EditorProps = {
  program: Program;
  setProgram: Dispatch<SetStateAction<Program | null>>;
};

function ProgramEditorForm({ program, setProgram }: EditorProps) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function save() {
    const next: Program = {
      ...program,
      updatedAt: new Date().toISOString(),
    };
    updateProgram(next);
    setProgram(next);
    setSavedAt(new Date().toLocaleTimeString());
  }

  function setDay(i: number, day: DayPlan) {
    setProgram({
      ...program,
      days: program.days.map((d, idx) => (idx === i ? day : d)),
    });
  }

  function addExercise(dayIndex: number) {
    const day = program.days[dayIndex];
    if (!day) return;
    setDay(dayIndex, {
      ...day,
      exercises: [...day.exercises, emptyExercise()],
    });
  }

  function removeExercise(dayIndex: number, exId: string) {
    const day = program.days[dayIndex];
    if (!day) return;
    setDay(dayIndex, {
      ...day,
      exercises: day.exercises.filter((e) => e.id !== exId),
    });
  }

  function patchExercise(dayIndex: number, exId: string, patch: Partial<Exercise>) {
    const day = program.days[dayIndex];
    if (!day) return;
    setDay(dayIndex, {
      ...day,
      exercises: day.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)),
    });
  }

  return (
    <>
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">Fine-tune exercises, sets, and rest.</p>
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[var(--accent-hover)]"
        >
          Save changes
        </button>
      </div>
      {savedAt ? (
        <p className="mb-4 text-sm text-[var(--muted)]">Saved at {savedAt}</p>
      ) : null}

      <div className="mb-8">
        <label htmlFor="pname" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
          Program name
        </label>
        <input
          id="pname"
          value={program.name}
          onChange={(e) => setProgram({ ...program, name: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="space-y-10">
        {program.days.map((day, di) => (
          <section
            key={day.id}
            className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[#10151e] p-5 shadow-lg shadow-black/15 md:p-6"
          >
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium">Day name</label>
              <input
                value={day.name}
                onChange={(e) => setDay(di, { ...day, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <ul className="space-y-4">
              {day.exercises.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded-xl border border-[var(--border)]/80 bg-[var(--background)]/35 p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Exercise
                      </label>
                      <input
                        value={ex.name}
                        onChange={(e) => patchExercise(di, ex.id, { name: e.target.value })}
                        className={inputClass + " py-2.5 text-sm"}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Sets
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { sets: Number(e.target.value) || 1 })
                        }
                        className={inputClass + " py-2.5 text-sm"}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Reps
                      </label>
                      <input
                        value={ex.reps}
                        onChange={(e) => patchExercise(di, ex.id, { reps: e.target.value })}
                        className={inputClass + " py-2.5 text-sm"}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Rest (sec)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ex.restSec}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { restSec: Number(e.target.value) || 0 })
                        }
                        className={inputClass + " py-2.5 text-sm"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Notes (optional)
                      </label>
                      <input
                        value={ex.notes ?? ""}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { notes: e.target.value || undefined })
                        }
                        className={inputClass + " py-2.5 text-sm"}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(di, ex.id)}
                    className="mt-3 text-xs font-medium text-red-300/90 hover:text-red-200 hover:underline"
                  >
                    Remove exercise
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addExercise(di)}
              className="mt-4 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              + Add exercise
            </button>
          </section>
        ))}
      </div>
    </>
  );
}

type Mode = "workout" | "edit";

type LoadedProps = {
  program: Program;
  setProgram: Dispatch<SetStateAction<Program | null>>;
};

function ProgramDetailLoaded({ program, setProgram }: LoadedProps) {
  const [mode, setMode] = useState<Mode>("workout");
  const [workoutDayIndex, setWorkoutDayIndex] = useState(0);

  useEffect(() => {
    setWorkoutDayIndex((d) => {
      const max = Math.max(0, program.days.length - 1);
      return Math.min(d, max);
    });
  }, [program.days.length, program.id]);

  return (
    <Shell>
      <div className="no-print mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          <span aria-hidden>←</span> Home
        </Link>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {program.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {program.days.length} training day{program.days.length === 1 ? "" : "s"}
            </p>
          </div>
          <div
            className="flex rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-1 shadow-inner"
            role="tablist"
            aria-label="Program view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "workout"}
              onClick={() => setMode("workout")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                mode === "workout"
                  ? "bg-[var(--accent)] text-white shadow-md shadow-blue-500/20"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Workout
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "edit"}
              onClick={() => setMode("edit")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                mode === "edit"
                  ? "bg-[var(--accent)] text-white shadow-md shadow-blue-500/20"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {mode === "workout" ? (
        <ProgramWorkoutView
          program={program}
          dayIndex={workoutDayIndex}
          onDayIndexChange={setWorkoutDayIndex}
        />
      ) : (
        <ProgramEditorForm program={program} setProgram={setProgram} />
      )}
    </Shell>
  );
}

export default function ProgramEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [program, setProgram] = useState<Program | null>(null);
  const [status, setStatus] = useState<"loading" | "missing" | "ready">("loading");

  useEffect(() => {
    if (!id) {
      router.replace("/");
      return;
    }
    const p = loadState().programs.find((x) => x.id === id);
    if (!p) {
      setProgram(null);
      setStatus("missing");
      return;
    }
    setProgram(JSON.parse(JSON.stringify(p)) as Program);
    setStatus("ready");
  }, [id, router]);

  if (!id) return null;

  if (status === "loading") {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  if (status === "missing" || !program) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Program not found.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-[var(--accent)]">
          Back home
        </Link>
      </Shell>
    );
  }

  return <ProgramDetailLoaded program={program} setProgram={setProgram} />;
}
