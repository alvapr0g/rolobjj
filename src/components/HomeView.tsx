import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context';

export function HomeView() {
  const { userProfile } = useAppContext();
  
  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Oss, {userProfile.name.split(' ')[0]}</h1>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rolo-surface border-2 border-rolo-text-muted"></div>
          <div className="w-10 h-10 rounded-full bg-rolo-surface border border-white/10 overflow-hidden">
             <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Racha Semanal */}
        <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5 md:col-span-2 lg:col-span-1">
          <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">Racha Semanal</h2>
          <div className="flex justify-between mb-5">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2.5">
                <span className="text-[10px] font-medium text-rolo-text-muted">{day}</span>
                <div className={`w-6 h-6 rounded-full ${i < 5 ? 'bg-rolo-gold' : 'border-2 border-white/10'}`}></div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-rolo-text-muted">
            <span className="text-rolo-gold font-bold">4 días</span> esta semana · mejor racha: 6
          </p>
        </div>

        {/* Última Sesión */}
        <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em]">Última Sesión</h2>
            <span className="text-[11px] font-mono text-rolo-text-muted uppercase tracking-wider">ayer · 90 min</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Rolling · Intensidad 7/10</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-4 py-1.5 rounded-full border border-white/20 text-[13px] text-white/80">Z guard</span>
            <span className="px-4 py-1.5 rounded-full border border-white/20 text-[13px] text-white/80">Scissor sweep</span>
          </div>
          <button className="text-rolo-gold text-[13px] font-bold flex items-center gap-1.5">
            Ver resumen <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Técnica del día */}
        <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-3">Técnica del día</h2>
          <h3 className="text-2xl font-bold text-white mb-1.5">Uchimata</h3>
          <p className="text-[13px] text-rolo-text-muted mb-5">Judo · proyección de cadera</p>
          <div className="flex justify-between items-center">
            <button className="bg-rolo-gold text-rolo-bg px-5 py-2.5 rounded-xl text-[13px] font-bold">En práctica</button>
            <button className="text-rolo-gold text-[13px] font-bold flex items-center gap-1.5">
              Repasar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-3.5">
            <span className="text-[13px] text-white font-medium">Hacia cinturón azul</span>
            <span className="text-[13px] font-bold text-rolo-gold">64%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className="bg-rolo-gold h-2 rounded-full w-[64%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
