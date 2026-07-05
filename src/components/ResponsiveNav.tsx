import { Plus } from 'lucide-react';
import { ViewState } from '../types';

export function ResponsiveNav({ currentView, onChangeView, onOpenLogSession, isDesktop }: { 
  currentView: ViewState, 
  onChangeView: (v: ViewState) => void,
  onOpenLogSession: () => void,
  isDesktop: boolean
}) {
  if (isDesktop) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="text-2xl font-black text-white tracking-widest mb-12">ROLO</div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <DesktopNavItem label="Inicio" isActive={currentView === 'inicio'} onClick={() => onChangeView('inicio')} />
          <DesktopNavItem label="Biblioteca" isActive={currentView === 'biblioteca'} onClick={() => onChangeView('biblioteca')} />
          <DesktopNavItem label="Progreso" isActive={currentView === 'progreso'} onClick={() => onChangeView('progreso')} />
          <DesktopNavItem label="Perfil" isActive={currentView === 'perfil'} onClick={() => onChangeView('perfil')} />
        </nav>

        <button 
          onClick={onOpenLogSession}
          className="w-full bg-rolo-gold text-rolo-bg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_4px_20px_rgba(230,192,92,0.15)] mt-8"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Registrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 w-full bg-rolo-bg border-t border-white/5 px-6 py-4 flex justify-between items-center z-40">
      <MobileNavItem isActive={currentView === 'inicio'} label="Inicio" onClick={() => onChangeView('inicio')} />
      <MobileNavItem isActive={currentView === 'biblioteca'} label="Biblioteca" onClick={() => onChangeView('biblioteca')} />
      
      <button 
        onClick={onOpenLogSession}
        className="w-14 h-14 bg-rolo-gold rounded-full flex items-center justify-center text-rolo-bg shadow-lg shadow-rolo-gold/20 -mt-8 hover:scale-105 transition-transform shrink-0 relative z-10"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

      <MobileNavItem isActive={currentView === 'progreso'} label="Progreso" onClick={() => onChangeView('progreso')} />
      <MobileNavItem isActive={currentView === 'perfil'} label="Perfil" onClick={() => onChangeView('perfil')} />
    </div>
  );
}

function DesktopNavItem({ label, isActive, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-rolo-surface text-rolo-gold' : 'text-rolo-text-muted hover:bg-white/5 hover:text-white'}`}
    >
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-rolo-gold' : 'bg-transparent'}`}></div>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function MobileNavItem({ label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 w-12">
      <div className={`w-5 h-5 rounded-md ${isActive ? 'bg-rolo-gold' : 'bg-rolo-text-muted/50'}`}></div>
      <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-rolo-gold' : 'text-rolo-text-muted'}`}>
        {label}
      </span>
    </button>
  );
}
