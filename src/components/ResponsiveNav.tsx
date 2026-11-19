import { Plus, Home, BookOpen, TrendingUp, User, Globe, GraduationCap, LucideIcon } from 'lucide-react';
import { ViewState } from '../types';

type Item = { view: ViewState; label: string; icon: LucideIcon };

export function ResponsiveNav({ currentView, onChangeView, onOpenLogSession, isDesktop, isProfesor }: {
  currentView: ViewState;
  onChangeView: (v: ViewState) => void;
  onOpenLogSession: () => void;
  isDesktop: boolean;
  isProfesor: boolean;
}) {
  if (isDesktop) {
    const items: Item[] = [
      { view: 'inicio', label: 'Inicio', icon: Home },
      { view: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
      { view: 'progreso', label: 'Progreso', icon: TrendingUp },
      { view: 'academias', label: 'Academias', icon: Globe },
      ...(isProfesor ? [{ view: 'profesor' as ViewState, label: 'Panel del profesor', icon: GraduationCap }] : []),
      { view: 'perfil', label: 'Perfil', icon: User },
    ];
    return (
      <div className="h-full flex flex-col p-6">
        <div className="text-2xl font-black text-white tracking-widest mb-12">ROLO</div>
        <nav aria-label="Principal" className="flex-1 flex flex-col gap-2">
          {items.map((i) => (
            <button key={i.view} onClick={() => onChangeView(i.view)}
              aria-current={currentView === i.view ? 'page' : undefined}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${currentView === i.view ? 'bg-rolo-surface text-rolo-gold' : 'text-rolo-text-muted hover:bg-white/5 hover:text-white'}`}>
              <i.icon className="w-5 h-5" aria-hidden="true" />
              <span className="font-semibold">{i.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onOpenLogSession}
          className="w-full bg-rolo-gold text-rolo-bg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_4px_20px_rgba(230,192,92,0.15)] mt-8">
          <Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          Registrar Sesión
        </button>
      </div>
    );
  }

  const mobile = (v: ViewState, label: string, Icon: LucideIcon) => (
    <button key={v} onClick={() => onChangeView(v)} aria-current={currentView === v ? 'page' : undefined}
      className="flex flex-col items-center gap-1 w-14">
      <span className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${currentView === v ? 'bg-rolo-gold/10 text-rolo-gold' : 'text-rolo-text-muted hover:bg-white/5 hover:text-white'}`}>
        <Icon className="w-5 h-5" strokeWidth={currentView === v ? 2.5 : 2} aria-hidden="true" />
      </span>
      <span className={`text-xs font-medium ${currentView === v ? 'text-rolo-gold' : 'text-rolo-text-muted'}`}>{label}</span>
    </button>
  );

  return (
    <nav aria-label="Principal" className="absolute bottom-0 left-0 w-full bg-rolo-bg border-t border-white/5 px-4 py-3 flex justify-between items-center z-40">
      {mobile('inicio', 'Inicio', Home)}
      {mobile('biblioteca', 'Biblioteca', BookOpen)}
      <button onClick={onOpenLogSession} aria-label="Registrar sesión"
        className="w-14 h-14 bg-rolo-gold rounded-full flex items-center justify-center text-rolo-bg shadow-lg shadow-rolo-gold/20 -mt-8 hover:scale-105 transition-transform shrink-0 relative z-10">
        <Plus className="w-8 h-8" strokeWidth={2.5} aria-hidden="true" />
      </button>
      {mobile('progreso', 'Progreso', TrendingUp)}
      {mobile('perfil', 'Perfil', User)}
    </nav>
  );
}
