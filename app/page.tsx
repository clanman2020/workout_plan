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
          <h1 className="text-2xl font-semibold tracking-tight">Your programs</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Stored only in this browser. Open the same site on another device to start fresh
            there.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/onboarding"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-white/5"
          >
            New questionnaire
          </Link>
          <button
            type="button"
            onClick={retake}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-white/5"
          >
            Reset everything
          </button>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 px-6 py-10 text-center">
          <p className="text-[var(--muted)]">No programs yet.</p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Run the questionnaire
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {programs.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {p.days.length} training day{p.days.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/program/${p.id}`}
                  className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-white/5"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
