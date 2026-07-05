import { Home, BookOpen, Plus, TrendingUp, User } from 'lucide-react';
import { ViewState } from '../types';

export function BottomNav({ currentView, onChangeView, onOpenLogSession }: { 
  currentView: ViewState, 
  onChangeView: (v: ViewState) => void,
  onOpenLogSession: () => void 
}) {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-rolo-bg border-t border-white/5 px-6 py-4 flex justify-between items-center z-40">
      <NavItem 
        icon={<div className={`w-5 h-5 rounded-md ${currentView === 'inicio' ? 'bg-rolo-gold' : 'bg-rolo-text-muted/50'}`}></div>} 
        label="Inicio" 
        isActive={currentView === 'inicio'} 
        onClick={() => onChangeView('inicio')} 
      />
      <NavItem 
        icon={<div className={`w-5 h-5 rounded-md ${currentView === 'biblioteca' ? 'bg-rolo-gold' : 'bg-rolo-text-muted/50'}`}></div>} 
        label="Biblioteca" 
        isActive={currentView === 'biblioteca'} 
        onClick={() => onChangeView('biblioteca')} 
      />
      
      <button 
        onClick={onOpenLogSession}
        className="w-14 h-14 bg-rolo-gold rounded-full flex items-center justify-center text-rolo-bg shadow-lg shadow-rolo-gold/20 -mt-8 hover:scale-105 transition-transform"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

      <NavItem 
        icon={<div className={`w-5 h-5 rounded-md ${currentView === 'progreso' ? 'bg-rolo-gold' : 'bg-rolo-text-muted/50'}`}></div>} 
        label="Progreso" 
        isActive={currentView === 'progreso'} 
        onClick={() => onChangeView('progreso')} 
      />
      <NavItem 
        icon={<div className={`w-5 h-5 rounded-md ${currentView === 'perfil' ? 'bg-rolo-gold' : 'bg-rolo-text-muted/50'}`}></div>} 
        label="Perfil" 
        isActive={currentView === 'perfil'} 
        onClick={() => onChangeView('perfil')} 
      />
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 w-12">
      {icon}
      <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-rolo-gold' : 'text-rolo-text-muted'}`}>
        {label}
      </span>
    </button>
  );
}
