import { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useAppContext } from '../context';
import { visibleTechniques } from '../lib/progress';
import { Technique } from '../types';

type Mode = 'position' | 'kind';

export function LibraryView() {
  const { profile, techniques, validatedIds } = useAppContext();
  const [mode, setMode] = useState<Mode>('position');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const belt = profile?.belt ?? 'Blanco';
  const visible = useMemo(() => visibleTechniques(belt, techniques), [belt, techniques]);
  const hiddenCount = techniques.length - visible.length;

  const groups = useMemo(() => {
    const map = new Map<string, Technique[]>();
    for (const t of visible) {
      const key = mode === 'position' ? t.position : t.kind;
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return Array.from(map.entries());
  }, [visible, mode]);

  const q = query.trim().toLowerCase();
  const results = q
    ? visible.filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((g) => g.toLowerCase().includes(q)))
    : open
      ? (groups.find(([k]) => k === open)?.[1] ?? [])
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Biblioteca</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar técnica" placeholder="Buscar…"
            className="bg-rolo-surface pl-10 pr-4 py-2 rounded-full border border-white/5 text-[13px] text-white focus:outline-none focus:border-rolo-gold/50 w-56" />
        </div>
      </div>

      <div className="flex gap-2" role="group" aria-label="Agrupar por">
        {([['position', 'Por posición'], ['kind', 'Por tipo']] as const).map(([m, label]) => (
          <button key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setOpen(null); }}
            className={`px-5 py-2 rounded-full text-[13px] transition-colors ${mode === m ? 'bg-rolo-gold text-rolo-bg font-bold' : 'border border-white/20 text-rolo-text-muted hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {results === null ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {groups.map(([name, list]) => (
              <button key={name} onClick={() => setOpen(name)}
                className="text-left bg-rolo-surface p-5 rounded-[20px] border border-white/5 hover:border-rolo-gold/30 transition-colors">
                <h2 className="font-bold text-white mb-1.5 text-[15px]">{name}</h2>
                <p className="text-xs text-rolo-text-muted mb-4">{Array.from(new Set(list.map((t) => (mode === 'position' ? t.kind : t.position)))).join(' · ')}</p>
                <p className="text-xs font-mono font-bold text-rolo-gold">{list.length} técnicas</p>
              </button>
            ))}
          </div>
          {hiddenCount > 0 && (
            <p className="text-xs text-rolo-gold flex items-center gap-1.5">
              <span aria-hidden="true" className="font-bold">⚠</span> {hiddenCount} técnicas de alto riesgo (heel hooks y otras) se desbloquean al llegar a cinturón azul.
            </p>
          )}
        </>
      ) : (
        <section aria-live="polite">
          {open && !q && (
            <button onClick={() => setOpen(null)} className="flex items-center gap-2 text-rolo-gold text-sm font-bold mb-4">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {open}
            </button>
          )}
          {results.length === 0 ? (
            <p className="text-rolo-text-muted">No hay técnicas que coincidan con “{query}”.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((t) => (
                <li key={t.id} className="bg-rolo-surface p-5 rounded-[20px] border border-white/5">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-bold text-white text-[15px]">{t.name}</h3>
                    {validatedIds.has(t.id) && (
                      <span className="text-xs font-bold bg-rolo-gold text-rolo-bg px-2 py-0.5 rounded-md shrink-0">Validada</span>
                    )}
                  </div>
                  <p className="text-[13px] text-rolo-text/80 leading-relaxed mb-3">{t.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs bg-black/30 text-rolo-text-muted px-2 py-1 rounded-md">Nivel {t.level.toLowerCase()}</span>
                    {t.tags.map((g) => <span key={g} className="text-xs bg-black/30 text-rolo-text-muted px-2 py-1 rounded-md">{g}</span>)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
