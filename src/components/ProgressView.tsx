import { useMemo, useState } from 'react';
import { Download, Bot, Check, Circle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context';
import { Belt } from '../types';
import { BELTS, computeProgress, techniquesForBelt } from '../lib/progress';

const BELT_DATA: Record<Belt, { bg: string; label: string; hex: string }> = {
  Blanco: { bg: 'bg-[#F3F4F6]', label: 'Cinturón blanco', hex: '#F3F4F6' },
  Azul: { bg: 'bg-[#2D6CB4]', label: 'Cinturón azul', hex: '#2D6CB4' },
  Morado: { bg: 'bg-[#734098]', label: 'Cinturón morado', hex: '#734098' },
  Marrón: { bg: 'bg-[#664228]', label: 'Cinturón marrón', hex: '#664228' },
  Negro: { bg: 'bg-[#1A1A1A]', label: 'Cinturón negro', hex: '#1A1A1A' },
};

function formatTime(months: number) {
  if (months < 1) return 'menos de un mes';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} ${y === 1 ? 'año' : 'años'}` : '', m ? `${m} ${m === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean).join(' y ');
}

export function ProgressView() {
  const { profile, techniques, validatedIds, sessions, getIdToken } = useAppContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ text: string; alertSent: boolean; ok: boolean } | null>(null);

  const progress = useMemo(
    () => (profile ? computeProgress(profile, sessions, validatedIds, techniques) : null),
    [profile, sessions, validatedIds, techniques],
  );
  if (!profile || !progress) return null;

  const current = BELT_DATA[profile.belt];
  const currentIndex = BELTS.indexOf(profile.belt);
  const next = progress.next ? BELT_DATA[progress.next] : null;
  const required = techniquesForBelt(profile.belt, techniques);
  const chartData = [{ name: 'Completado', value: progress.percent }, { name: 'Restante', value: 100 - progress.percent }];
  const colors = [current.hex === '#1A1A1A' ? '#E6C05C' : current.hex, 'rgba(255,255,255,0.08)'];

  const analyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/analyze-performance', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('El servicio de análisis no está disponible en este despliegue.');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al analizar');
      setResult({ text: data.analysis, alertSent: data.alertSent, ok: true });
    } catch (e) {
      setResult({ text: e instanceof Error ? e.message : 'Error al realizar el análisis.', alertSent: false, ok: false });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    const line = '='.repeat(52);
    const rows = [
      line, '             REPORTE DE PROGRESO - ROLO', line, '',
      `ATLETA: ${profile.name}`,
      `GRADO ACTUAL: ${current.label} · ${profile.degree}° grado`,
      `OBJETIVO: ${next ? next.label : 'Máximo alcanzado'}`,
      `PROGRESO: ${progress.percent}%`, '',
      `Sesiones en este cinturón: ${progress.sessionsCompleted}/${progress.sessionsRequired}`,
      `Técnicas validadas: ${progress.techValidated}/${progress.techTotal}`, '',
      '--- CHECKLIST TÉCNICO ---',
      ...required.map((t) => `[${validatedIds.has(t.id) ? 'X' : ' '}] ${t.name}`),
      ...(required.length === 0 ? ['(sin técnicas requeridas para este cinturón)'] : []),
      '', line, '       ROLO - Registra. Aprende. Progresa.', line,
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Progreso_${profile.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center mt-4 mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progreso</h1>
        <button onClick={downloadReport}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-white/5">
          <Download className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Descargar reporte</span>
          <span className="sm:hidden sr-only">Descargar reporte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <section className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
            <div className={`h-14 ${current.bg} rounded-xl mb-5 flex relative overflow-hidden`} aria-hidden="true">
              <div className="absolute right-8 top-0 bottom-0 w-20 bg-[#1A1A1A] flex justify-center gap-1.5 px-2">
                {Array.from({ length: profile.degree }).map((_, i) => <div key={i} className="w-3 bg-white h-full"></div>)}
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">{current.label}{profile.degree > 0 ? ` · ${profile.degree}° grado` : ''}</h2>
            <p className="text-[13px] text-rolo-text-muted">En este cinturón: {formatTime(progress.monthsInBelt)}</p>
          </section>

          <section className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
            <h2 className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-5">Camino de cinturones</h2>
            <ol className="flex justify-between items-center mb-4 px-2">
              {BELTS.map((belt, idx) => {
                const b = BELT_DATA[belt];
                const state = idx < currentIndex ? 'superado' : idx === currentIndex ? 'actual' : 'pendiente';
                return (
                  <li key={belt} aria-label={`${belt}: ${state}`}
                    className={`w-10 h-10 rounded-full ${b.bg} flex items-center justify-center font-bold text-xs shadow-lg
                      ${state === 'actual' ? 'border-2 border-rolo-gold ring-4 ring-rolo-gold/20' : ''}
                      ${state === 'pendiente' ? 'opacity-50' : ''} ${belt === 'Negro' ? 'border border-white/20' : ''}
                      ${belt === 'Blanco' ? 'text-[#071711]' : 'text-white'}`}>
                    {state === 'superado' && <span aria-hidden="true">✓</span>}
                  </li>
                );
              })}
            </ol>
            <p className="text-xs text-rolo-text-muted text-center leading-relaxed">
              {BELTS.map((b, i) => (i < currentIndex ? `${b} ✓` : i === currentIndex ? `${b} (actual)` : b)).join(' · ')}
            </p>
          </section>
        </div>

        <section className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em]">
              {next ? `Hacia ${next.label.toLowerCase()}` : 'Cinturón máximo alcanzado'}
            </h2>
            <span className="text-[15px] font-bold text-rolo-gold">{progress.percent}%</span>
          </div>

          <div className="flex mb-8 justify-center lg:justify-start h-[180px]" role="img" aria-label={`Progreso total: ${progress.percent}%`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} stroke="none"
                  startAngle={90} endAngle={-270} dataKey="value" cornerRadius={8} isAnimationActive={false}>
                  {chartData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex flex-col gap-4 text-[13px] text-white">
            <Milestone done={progress.sessionsRequired > 0 && progress.sessionsCompleted >= progress.sessionsRequired}>
              {progress.sessionsRequired} sesiones registradas ({progress.sessionsCompleted}/{progress.sessionsRequired})
            </Milestone>
            <Milestone done={progress.techTotal > 0 && progress.techValidated >= progress.techTotal}>
              Checklist técnico · {progress.techValidated} de {progress.techTotal}
            </Milestone>
            <Milestone done={false} muted>Evaluación del instructor</Milestone>
          </ul>

          {required.length > 0 && (
            <details className="mt-5 text-[13px]">
              <summary className="cursor-pointer text-rolo-gold font-medium">Ver técnicas requeridas</summary>
              <ul className="mt-3 flex flex-col gap-2">
                {required.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-rolo-text">
                    {validatedIds.has(t.id) ? <Check className="w-4 h-4 text-rolo-gold" aria-label="Validada" /> : <Circle className="w-4 h-4 text-rolo-text-muted" aria-label="Pendiente" />}
                    {t.name}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-3">
            <button onClick={analyze} disabled={isAnalyzing}
              className="w-full bg-rolo-surface/50 hover:bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Bot className="w-4 h-4 text-rolo-gold" aria-hidden="true" />
              {isAnalyzing ? 'Analizando rendimiento…' : 'Análisis con IA'}
            </button>
            <div aria-live="polite">
              {result && (
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-sm">
                  <p className={`leading-relaxed ${result.ok ? 'text-white/90' : 'text-red-300'}`}>{result.text}</p>
                  {result.ok && (
                    <span className="inline-flex mt-3 items-center gap-1.5 text-xs font-bold text-rolo-text-muted bg-white/5 px-2.5 py-1 rounded-md">
                      {result.alertSent ? '✓ Se avisó a tu profesor' : 'Sin alertas críticas'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Milestone({ done, muted, children }: { done: boolean; muted?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-3 ${muted ? 'text-rolo-text-muted' : ''}`}>
      {done ? (
        <span className="text-rolo-gold font-bold text-sm" aria-label="Completado">✓</span>
      ) : (
        <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${muted ? 'border-rolo-text-muted' : 'border-rolo-gold'}`} aria-label="Pendiente"></span>
      )}
      <span>{children}</span>
    </li>
  );
}
