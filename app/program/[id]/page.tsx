"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function ProgramEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [program, setProgram] = useState<Program | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
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
        <Link href="/" className="mt-4 inline-block text-[var(--accent)]">
          Back home
        </Link>
      </Shell>
    );
  }

  function save() {
    if (!program) return;
    const next: Program = {
      ...program,
      updatedAt: new Date().toISOString(),
    };
    updateProgram(next);
    setProgram(next);
    setSavedAt(new Date().toLocaleTimeString());
  }

  function setDay(i: number, day: DayPlan) {
    setProgram((p) => {
      if (!p) return p;
      const days = [...p.days];
      days[i] = day;
      return { ...p, days };
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
    <Shell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit program</h1>
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Save changes
        </button>
      </div>
      {savedAt ? (
        <p className="mb-4 text-sm text-[var(--muted)]">Saved at {savedAt}</p>
      ) : null}

      <div className="mb-6">
        <label htmlFor="pname" className="mb-1 block text-sm font-medium">
          Program name
        </label>
        <input
          id="pname"
          value={program.name}
          onChange={(e) => setProgram({ ...program, name: e.target.value })}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="space-y-8">
        {program.days.map((day, di) => (
          <section
            key={day.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Day name</label>
              <input
                value={day.name}
                onChange={(e) => setDay(di, { ...day, name: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
            <ul className="space-y-4">
              {day.exercises.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)]/60 p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-[var(--muted)]">Exercise</label>
                      <input
                        value={ex.name}
                        onChange={(e) => patchExercise(di, ex.id, { name: e.target.value })}
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--muted)]">Sets</label>
                      <input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { sets: Number(e.target.value) || 1 })
                        }
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--muted)]">Reps</label>
                      <input
                        value={ex.reps}
                        onChange={(e) => patchExercise(di, ex.id, { reps: e.target.value })}
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--muted)]">
                        Rest (sec)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ex.restSec}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { restSec: Number(e.target.value) || 0 })
                        }
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-[var(--muted)]">
                        Notes (optional)
                      </label>
                      <input
                        value={ex.notes ?? ""}
                        onChange={(e) =>
                          patchExercise(di, ex.id, { notes: e.target.value || undefined })
                        }
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(di, ex.id)}
                    className="mt-2 text-xs text-red-300 hover:underline"
                  >
                    Remove exercise
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addExercise(di)}
              className="mt-3 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              + Add exercise
            </button>
          </section>
        ))}
      </div>
    </Shell>
  );
}
