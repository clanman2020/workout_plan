"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { deleteProgram, loadState, resetOnboarding } from "@/lib/storage";
import type { Program } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const s = loadState();
    if (!s.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setPrograms(s.programs);
    setReady(true);
  }, [router]);

  function remove(id: string) {
    if (!window.confirm("Delete this program?")) return;
    deleteProgram(id);
    setPrograms(loadState().programs);
  }

  function retake() {
    if (
      !window.confirm(
        "This clears your saved answers and programs on this device. Continue?",
      )
    ) {
      return;
    }
    resetOnboarding();
    router.push("/onboarding");
  }

  if (!ready) {
    return (
      <Shell>
        <p className="text-[var(--muted)]">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Your programs
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            Saved in this browser only. Use another device or clear data if you want a fresh
            start there.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/onboarding"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)]/35 hover:bg-white/[0.04]"
          >
            New questionnaire
          </Link>
          <button
            type="button"
            onClick={retake}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-white/[0.04]"
          >
            Reset everything
          </button>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 px-8 py-14 text-center">
          <p className="text-[var(--muted)]">No programs yet.</p>
          <Link
            href="/onboarding"
            className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[var(--accent-hover)]"
          >
            Run the questionnaire
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {programs.map((p) => {
            const exerciseCount = p.days.reduce((n, d) => n + d.exercises.length, 0);
            return (
              <li
                key={p.id}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[#0e1219] p-5 shadow-lg shadow-black/20 transition hover:border-[var(--accent)]/30"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-[var(--accent)]/70 opacity-0 transition group-hover:opacity-100" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 pl-1">
                    <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {p.days.length} day{p.days.length === 1 ? "" : "s"}
                      <span className="mx-2 text-[var(--border)]">·</span>
                      {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/program/${p.id}`}
                      className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-[var(--accent-hover)]"
                    >
                      Open plan
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}
