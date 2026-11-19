import { Belt, Technique, TrainingSession, UserProfile } from '../types';
import { addDays, daysBetween, parseISODate, startOfWeek, toISODate } from './dates';

export const BELTS: Belt[] = ['Blanco', 'Azul', 'Morado', 'Marrón', 'Negro'];

/** Sesiones necesarias en cada cinturón antes de optar al siguiente (referencia orientativa de ROLO). */
export const SESSIONS_REQUIRED: Record<Belt, number> = {
  Blanco: 120,
  Azul: 200,
  Morado: 250,
  Marrón: 300,
  Negro: 0,
};

export function nextBelt(belt: Belt): Belt | null {
  const i = BELTS.indexOf(belt);
  return i >= 0 && i < BELTS.length - 1 ? BELTS[i + 1] : null;
}

export function techniquesForBelt(belt: Belt, techniques: Technique[]): Technique[] {
  return techniques.filter((t) => t.level === belt);
}

/** Técnicas visibles para un cinturón (p. ej. heel hooks ocultos para blanco). */
export function visibleTechniques(belt: Belt, techniques: Technique[]): Technique[] {
  const rank = BELTS.indexOf(belt);
  return techniques.filter((t) => !t.minBelt || rank >= BELTS.indexOf(t.minBelt));
}

export type Progress = {
  next: Belt | null;
  sessionsCompleted: number;
  sessionsRequired: number;
  techValidated: number;
  techTotal: number;
  percent: number;
  monthsInBelt: number;
};

export function computeProgress(
  profile: Pick<UserProfile, 'belt' | 'beltSince'>,
  sessions: TrainingSession[],
  validatedIds: Set<string>,
  techniques: Technique[],
  today: Date = new Date(),
): Progress {
  const next = nextBelt(profile.belt);
  const sessionsCompleted = sessions.filter((s) => s.date >= profile.beltSince).length;
  const sessionsRequired = SESSIONS_REQUIRED[profile.belt];
  const required = techniquesForBelt(profile.belt, techniques);
  const techValidated = required.filter((t) => validatedIds.has(t.id)).length;
  const techTotal = required.length;

  let percent = 100;
  if (next) {
    const sp = sessionsRequired > 0 ? Math.min(sessionsCompleted / sessionsRequired, 1) : 1;
    const tp = techTotal > 0 ? Math.min(techValidated / techTotal, 1) : null;
    percent = Math.round((tp === null ? sp : sp * 0.4 + tp * 0.6) * 100);
  }

  const monthsInBelt = Math.max(0, Math.floor(daysBetween(parseISODate(profile.beltSince), today) / 30.44));
  return { next, sessionsCompleted, sessionsRequired, techValidated, techTotal, percent, monthsInBelt };
}

/** Siete booleanos (lunes→domingo) con los días entrenados esta semana. */
export function weekDays(sessions: TrainingSession[], today: Date = new Date()): boolean[] {
  const start = startOfWeek(today);
  const dates = new Set(sessions.map((s) => s.date));
  return Array.from({ length: 7 }, (_, i) => dates.has(toISODate(addDays(start, i))));
}

/** Racha más larga de días consecutivos con entrenamiento. */
export function bestStreak(sessions: TrainingSession[]): number {
  const days = Array.from(new Set(sessions.map((s) => s.date))).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const cur = parseISODate(d);
    run = prev && daysBetween(prev, cur) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export function techniqueOfTheDay(techniques: Technique[], today: Date = new Date()): Technique | undefined {
  if (techniques.length === 0) return undefined;
  const dayNumber = Math.floor(daysBetween(new Date(today.getFullYear(), 0, 0), today));
  return techniques[dayNumber % techniques.length];
}

export type PerformanceStats = {
  sessionsLast7: number;
  sessionsPrev7: number;
  avgRpeLast7: number | null;
  daysSinceLastSession: number | null;
  totalMinutesLast7: number;
};

/** Estadísticas agregadas (solo números) que se envían al análisis de IA. */
export function performanceStats(sessions: TrainingSession[], today: Date = new Date()): PerformanceStats {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last7 = sessions.filter((s) => {
    const d = daysBetween(parseISODate(s.date), t);
    return d >= 0 && d < 7;
  });
  const prev7 = sessions.filter((s) => {
    const d = daysBetween(parseISODate(s.date), t);
    return d >= 7 && d < 14;
  });
  const lastDate = sessions.map((s) => s.date).sort().pop();
  return {
    sessionsLast7: last7.length,
    sessionsPrev7: prev7.length,
    avgRpeLast7: last7.length ? Math.round((last7.reduce((a, s) => a + s.rpe, 0) / last7.length) * 10) / 10 : null,
    daysSinceLastSession: lastDate ? Math.max(0, daysBetween(parseISODate(lastDate), t)) : null,
    totalMinutesLast7: last7.reduce((a, s) => a + s.duration, 0),
  };
}
