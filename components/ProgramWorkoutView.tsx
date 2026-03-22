"use client";

import type { DayPlan, Program } from "@/lib/types";

type Props = {
  program: Program;
  dayIndex: number;
  onDayIndexChange: (i: number) => void;
};

function formatRest(sec: number): string {
  if (sec >= 60 && sec % 60 === 0) return `${sec / 60} min`;
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s ? `${m}m ${s}s` : `${m} min`;
  }
  return `${sec}s`;
}

export function ProgramWorkoutView({ program, dayIndex, onDayIndexChange }: Props) {
  const n = program.days.length;

  const clamped = n === 0 ? 0 : Math.min(Math.max(0, dayIndex), n - 1);
  const activeDay: DayPlan | undefined = n === 0 ? undefined : program.days[clamped];

  function printDay() {
    window.print();
  }

  if (n === 0 || !activeDay) {
    return (
      <p className="text-center text-[var(--muted)]">
        No days in this program yet. Switch to Edit to add some.
      </p>
    );
  }

  return (
    <div className="print-workout-root">
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          Day {clamped + 1} of {n}
        </p>
        <button
          type="button"
          onClick={printDay}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:bg-white/[0.04]"
        >
          Print this day
        </button>
      </div>

      <div className="no-print -mx-1 mb-8 overflow-x-auto pb-1">
        <div className="flex min-w-0 gap-2 px-1">
          {program.days.map((d, i) => {
            const active = i === clamped;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDayIndexChange(i)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="block max-w-[10rem] truncate sm:max-w-[12rem]">{d.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[#10151e] p-6 shadow-xl shadow-black/20 md:p-8">
        <header className="mb-8 border-b border-[var(--border)] pb-6">
          <p className="print-accent-label text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Session
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
            {activeDay.name}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {activeDay.exercises.length} exercise{activeDay.exercises.length === 1 ? "" : "s"}
          </p>
        </header>

        <ol className="space-y-4">
          {activeDay.exercises.map((ex, i) => (
            <li
              key={ex.id}
              className="group rounded-xl border border-[var(--border)]/80 bg-[var(--background)]/40 px-5 py-5 transition hover:border-[var(--accent)]/25"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent)]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug text-[var(--foreground)] md:text-xl">
                      {ex.name || "Exercise"}
                    </h3>
                    {ex.notes ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{ex.notes}</p>
                    ) : null}
                  </div>
                </div>
                <dl className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-2">
                  <div className="print-chip rounded-lg bg-white/[0.08] px-3 py-1.5 text-center sm:min-w-[7rem]">
                    <dt className="sr-only">Sets and reps</dt>
                    <dd className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                      {ex.sets} × {ex.reps}
                    </dd>
                  </div>
                  <div className="print-chip-muted rounded-lg border border-[var(--border)] px-3 py-1.5 text-center sm:min-w-[7rem]">
                    <dt className="sr-only">Rest</dt>
                    <dd className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                      Rest {formatRest(ex.restSec)}
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
