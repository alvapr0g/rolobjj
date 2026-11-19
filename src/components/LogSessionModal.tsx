import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context';
import { SessionType } from '../types';
import { visibleTechniques } from '../lib/progress';
import { toISODate } from '../lib/dates';

const TYPES: SessionType[] = ['Drilling', 'Rolling', 'Clase'];

export function LogSessionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profile, techniques, sessions, addSession } = useAppContext();
  const today = toISODate();

  const [type, setType] = useState<SessionType>('Rolling');
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [chosen, setChosen] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setType('Rolling'); setDate(toISODate()); setDuration(60); setChosen([]);
    setQuery(''); setRpe(7); setNotes(''); setError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const available = useMemo(() => (profile ? visibleTechniques(profile.belt, techniques) : []), [profile, techniques]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return available.filter((t) => t.name.toLowerCase().includes(q) && !chosen.includes(t.name)).slice(0, 6);
  }, [query, available, chosen]);
  const recent = useMemo(() => {
    const seen: string[] = [];
    for (const s of sessions) for (const t of s.techniques) if (!seen.includes(t) && !chosen.includes(t)) seen.push(t);
    return seen.slice(0, 4);
  }, [sessions, chosen]);

  if (!isOpen) return null;

  const add = (name: string) => {
    const n = name.trim().slice(0, 60);
    if (n && !chosen.includes(n) && chosen.length < 30) setChosen([...chosen, n]);
    setQuery('');
  };
  const onQueryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add(suggestions[0]?.name ?? query);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(duration) || duration < 1 || duration > 480) return setError('La duración debe estar entre 1 y 480 minutos.');
    if (date > today) return setError('La fecha no puede ser futura.');
    setSaving(true);
    setError(null);
    try {
      await addSession({ type, date, duration, rpe, techniques: chosen, notes: notes.trim() });
      onClose();
    } catch {
      setError('No se pudo guardar la sesión. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = 'text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em]';

  return (
    <AnimatePresence>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="log-title"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 z-50 bg-rolo-bg flex flex-col">
        <form onSubmit={onSubmit} className="p-6 flex-1 overflow-y-auto pb-24 max-w-2xl w-full mx-auto">
          <div className="flex items-center gap-4 mb-8 mt-2">
            <button type="button" onClick={onClose} aria-label="Cerrar" className="text-rolo-text-muted hover:text-white p-1">
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
            <h1 id="log-title" className="text-2xl font-bold text-white tracking-tight">Registrar sesión</h1>
          </div>

          <fieldset className="mb-6">
            <legend className={`${labelClass} mb-4`}>Tipo de sesión</legend>
            <div className="flex gap-3" role="radiogroup" aria-label="Tipo de sesión">
              {TYPES.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-full text-[13px] transition-colors ${type === t ? 'bg-rolo-gold text-rolo-bg font-bold' : 'border border-white/10 text-rolo-text-muted hover:bg-white/5'}`}>
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-4 mb-8">
            <label className="flex-1 bg-rolo-surface rounded-2xl p-4 border border-white/5 block">
              <span className={`${labelClass} mb-1.5 block`}>Fecha</span>
              <input type="date" value={date} max={today} required onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-white text-[15px] font-medium w-full focus:outline-none [color-scheme:dark]" />
            </label>
            <label className="flex-1 bg-rolo-surface rounded-2xl p-4 border border-white/5 block">
              <span className={`${labelClass} mb-1.5 block`}>Duración (min)</span>
              <input type="number" inputMode="numeric" min={1} max={480} step={5} value={duration} required
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                className="bg-transparent text-white text-[15px] font-mono font-medium w-full focus:outline-none" />
            </label>
          </div>

          <section className="mb-8">
            <h2 className={`${labelClass} mb-4`}>Técnicas practicadas</h2>
            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" aria-hidden="true" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onQueryKey}
                aria-label="Buscar o añadir técnica" placeholder="Escribe para buscar y pulsa Enter para añadir…" maxLength={60}
                className="w-full bg-rolo-surface border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors" />
            </div>
            {suggestions.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-4" aria-label="Sugerencias">
                {suggestions.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => add(t.name)}
                      className="border border-white/10 text-rolo-text px-3 py-1.5 rounded-full text-xs hover:bg-white/5">+ {t.name}</button>
                  </li>
                ))}
              </ul>
            )}
            {chosen.length > 0 && (
              <ul className="flex flex-wrap gap-2.5 mb-5" aria-label="Técnicas elegidas">
                {chosen.map((t) => (
                  <li key={t} className="bg-rolo-gold text-rolo-bg px-3.5 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5">
                    {t}
                    <button type="button" onClick={() => setChosen(chosen.filter((c) => c !== t))} aria-label={`Quitar ${t}`}>
                      <X className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {recent.length > 0 && (
              <div className="flex items-center flex-wrap gap-2.5 text-xs">
                <span className="text-rolo-text-muted">Recientes:</span>
                {recent.map((t) => (
                  <button key={t} type="button" onClick={() => add(t)}
                    className="border border-white/10 text-rolo-text-muted px-3 py-1 rounded-full hover:text-white transition-colors">{t}</button>
                ))}
              </div>
            )}
          </section>

          <section className="bg-rolo-surface rounded-[24px] p-5 mb-6 border border-white/5">
            <fieldset className="mb-6">
              <legend className="text-xs text-rolo-text-muted mb-3">Intensidad (RPE {rpe}/10)</legend>
              <div className="flex gap-1.5" role="radiogroup" aria-label="Intensidad de 1 a 10">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rpe === n} aria-label={`${n}`} onClick={() => setRpe(n)}
                    className={`flex-1 h-9 rounded-md text-xs font-mono transition-colors ${n <= rpe ? 'bg-rolo-gold text-rolo-bg font-bold' : 'bg-white/5 text-rolo-text-muted hover:bg-white/10'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-xs text-rolo-text-muted mb-2 block">Notas (opcional)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Qué funcionó, qué corregir…"
                className="w-full bg-white/5 border border-transparent focus:border-white/20 rounded-xl p-4 text-[13px] text-white focus:outline-none resize-none h-24 placeholder:text-white/50 transition-colors" />
            </label>
          </section>

          {error && <p role="alert" className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-rolo-gold hover:bg-rolo-gold-hover disabled:opacity-60 text-rolo-bg font-bold py-4 rounded-[16px] transition-colors">
            {saving ? 'Guardando…' : 'GUARDAR SESIÓN'}
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
