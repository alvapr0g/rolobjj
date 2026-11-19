/** Fecha local en formato YYYY-MM-DD (no UTC, para que "hoy" sea el día del usuario). */
export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Lunes de la semana de `d`. */
export function startOfWeek(d: Date = new Date()): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (r.getDay() + 6) % 7; // lunes = 0
  return addDays(r, -dow);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function relativeDay(iso: string, today: Date = new Date()): string {
  const diff = daysBetween(parseISODate(iso), new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  if (diff <= 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff < 7) return `hace ${diff} días`;
  return parseISODate(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}
