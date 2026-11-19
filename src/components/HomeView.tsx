import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context';
import { Avatar } from './Avatar';
import { BELTS, bestStreak, computeProgress, techniqueOfTheDay, visibleTechniques, weekDays } from '../lib/progress';
import { relativeDay } from '../lib/dates';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function HomeView() {
  const { profile, sessions, validatedIds, techniques } = useAppContext();

  const stats = useMemo(() => {
    if (!profile) return null;
    const week = weekDays(sessions);
    const visible = visibleTechniques(profile.belt, techniques);
    return {
      week,
      daysThisWeek: week.filter(Boolean).length,
      best: bestStreak(sessions),
      last: sessions[0],
      tod: techniqueOfTheDay(visible),
      progress: computeProgress(profile, sessions, validatedIds, techniques),
    };
  }, [profile, sessions, validatedIds, techniques]);

  if (!profile || !stats) return null;
  const { week, daysThisWeek, best, last, tod, progress } = stats;
  const nextBeltName = progress.next ? `cinturón ${progress.next.toLowerCase()}` : null;
  const nextIdx = progress.next ? BELTS.indexOf(progress.next) : -1;

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6">
      <header className="flex justify-between items-center mb-2 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Oss, {profile.name.split(' ')[0]}</h1>
        <Avatar name={profile.name} src={profile.avatar} className="w-10 h-10 border border-white/10" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <section aria-labelledby="racha" className="bg-rolo-surface rounded-[24px] p-5 border border-white/5 md:col-span-2 lg:col-span-1">
          <h2 id="racha" className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">Racha semanal</h2>
          <ul className="flex justify-between mb-5" aria-label="Días entrenados esta semana">
            {DAY_LABELS.map((day, i) => (
              <li key={day} className="flex flex-col items-center gap-2.5">
                <span className="text-xs font-medium text-rolo-text-muted" aria-hidden="true">{day}</span>
                <div className={`w-6 h-6 rounded-full ${week[i] ? 'bg-rolo-gold' : 'border-2 border-white/10'}`}
                  role="img" aria-label={`${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][i]}: ${week[i] ? 'entrenaste' : 'sin entrenar'}`}></div>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-rolo-text-muted">
            <span className="text-rolo-gold font-bold">{daysThisWeek} {daysThisWeek === 1 ? 'día' : 'días'}</span> esta semana · mejor racha: {best}
          </p>
        </section>

        <section aria-labelledby="ultima" className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <h2 id="ultima" className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em]">Última sesión</h2>
            {last && <span className="text-xs font-mono text-rolo-text-muted uppercase tracking-wider">{relativeDay(last.date)} · {last.duration} min</span>}
          </div>
          {last ? (
            <>
              <h3 className="text-lg font-bold text-white mb-4">{last.type} · Intensidad {last.rpe}/10</h3>
              <div className="flex flex-wrap gap-2">
                {last.techniques.length === 0 && <span className="text-sm text-rolo-text-muted">Sin técnicas anotadas</span>}
                {last.techniques.slice(0, 6).map((t) => (
                  <span key={t} className="px-4 py-1.5 rounded-full border border-white/20 text-[13px] text-white/80">{t}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-rolo-text-muted flex items-center gap-2">
              Aún no registras sesiones. Pulsa <Plus className="w-4 h-4 inline text-rolo-gold" aria-hidden="true" /> “Registrar sesión” para empezar.
            </p>
          )}
        </section>

        <section aria-labelledby="tecnica" className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <h2 id="tecnica" className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-3">Técnica del día</h2>
          {tod ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-1.5">{tod.name}</h3>
              <p className="text-[13px] text-rolo-text-muted mb-4">{tod.position} · {tod.kind}</p>
              <p className="text-[13px] text-rolo-text/80 leading-relaxed">{tod.description}</p>
            </>
          ) : <p className="text-sm text-rolo-text-muted">No hay técnicas disponibles.</p>}
        </section>

        <section aria-labelledby="prog" className="bg-rolo-surface rounded-[24px] p-5 border border-white/5 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-3.5">
            <h2 id="prog" className="text-[13px] text-white font-medium">
              {nextBeltName ? `Hacia ${nextBeltName}` : 'Cinturón máximo alcanzado'}
            </h2>
            <span className="text-[13px] font-bold text-rolo-gold">{progress.percent}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}
            aria-label={nextBeltName ? `Progreso hacia ${nextBeltName}` : 'Progreso'}>
            <div className="bg-rolo-gold h-2 rounded-full transition-all" style={{ width: `${progress.percent}%` }}></div>
          </div>
          {nextIdx > 0 && (
            <p className="text-xs text-rolo-text-muted mt-3">
              {progress.sessionsCompleted} de {progress.sessionsRequired} sesiones · {progress.techValidated} de {progress.techTotal} técnicas validadas
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
