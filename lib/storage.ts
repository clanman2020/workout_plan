import type { AppStateV1, Program, UserProfile } from "./types";

const STORAGE_KEY = "workout_app_state_v1";

function defaultState(): AppStateV1 {
  return {
    version: 1,
    onboardingComplete: false,
    profile: null,
    programs: [],
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseState(raw: string | null): AppStateV1 {
  if (!raw) return defaultState();
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return defaultState();
    if (data.version !== 1) return defaultState();
    if (typeof data.onboardingComplete !== "boolean") return defaultState();
    if (data.profile !== null && !isRecord(data.profile)) return defaultState();
    if (!Array.isArray(data.programs)) return defaultState();
    return {
      version: 1,
      onboardingComplete: data.onboardingComplete,
      profile: data.profile as unknown as UserProfile | null,
      programs: data.programs as unknown as Program[],
    };
  } catch {
    return defaultState();
  }
}

export function loadState(): AppStateV1 {
  if (typeof window === "undefined") return defaultState();
  return parseState(window.localStorage.getItem(STORAGE_KEY));
}

export function saveState(state: AppStateV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setProfile(profile: UserProfile): void {
  const prev = loadState();
  saveState({
    ...prev,
    onboardingComplete: true,
    profile,
  });
}

export function addProgram(program: Program): void {
  const prev = loadState();
  saveState({
    ...prev,
    programs: [...prev.programs.filter((p) => p.id !== program.id), program],
  });
}

export function updateProgram(program: Program): void {
  const prev = loadState();
  saveState({
    ...prev,
    programs: prev.programs.map((p) => (p.id === program.id ? program : p)),
  });
}

export function deleteProgram(id: string): void {
  const prev = loadState();
  saveState({
    ...prev,
    programs: prev.programs.filter((p) => p.id !== id),
  });
}

export function resetOnboarding(): void {
  const prev = loadState();
  saveState({
    ...prev,
    onboardingComplete: false,
    profile: null,
    programs: [],
  });
}
