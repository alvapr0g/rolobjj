import { useState } from 'react';
import { AppProvider, useAppContext } from './context';
import { ProfessorDashboard } from './components/ProfessorDashboard';
import { StudentView } from './components/StudentView';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { ProgressView } from './components/ProgressView';
import { AcademiesView } from './components/AcademiesView';
import { ResponsiveNav } from './components/ResponsiveNav';
import { LogSessionModal } from './components/LogSessionModal';
import { LoginView } from './components/LoginView';
import { ViewState } from './types';
import { UserCircle, GraduationCap, RotateCcw, Globe } from 'lucide-react';

function AppContent() {
  const [view, setView] = useState<ViewState>('login');
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const { resetValidations } = useAppContext();

  const renderView = () => {
    switch (view) {
      case 'inicio': return <HomeView />;
      case 'biblioteca': return <LibraryView />;
      case 'progreso': return <ProgressView />;
      case 'perfil': return <StudentView />; // Temporarily use StudentView for profile
      case 'profesor': return <ProfessorDashboard />;
      case 'academias': return <AcademiesView />;
      default: return <HomeView />;
    }
  };

  if (view === 'login') {
    return <LoginView onLogin={() => setView('inicio')} />;
  }

  return (
    <div className="h-screen w-full bg-rolo-bg flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Desktop Navigation */}
      {view !== 'profesor' && (
        <div className="hidden md:block w-64 shrink-0 border-r border-white/5 bg-rolo-surface/30">
           <ResponsiveNav 
             currentView={view} 
             onChangeView={setView} 
             onOpenLogSession={() => setIsLogSessionOpen(true)}
             isDesktop={true}
           />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Toggle View Header (Presentation) */}
        <div className="bg-zinc-950 p-2 flex justify-between items-center z-50 text-xs shrink-0 border-b border-white/10">
          <div className="flex gap-1 bg-black p-1 rounded-lg">
            <button 
              onClick={() => setView('profesor')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${view === 'profesor' ? 'bg-rolo-surface text-rolo-gold' : 'text-rolo-text-muted hover:text-white'}`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Prof
            </button>
            <button 
              onClick={() => setView('inicio')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${view !== 'profesor' && view !== 'academias' ? 'bg-rolo-surface text-purple-400' : 'text-rolo-text-muted hover:text-white'}`}
            >
              <UserCircle className="w-3.5 h-3.5" /> Alumno
            </button>
            <button 
              onClick={() => setView('academias')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${view === 'academias' ? 'bg-rolo-surface text-[#34D399]' : 'text-rolo-text-muted hover:text-white'}`}
              title="Buscar Academias"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <button onClick={resetValidations} className="text-rolo-text-muted hover:text-white p-2" title="Resetear datos">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative bg-rolo-bg">
          {renderView()}
        </div>

        {/* Mobile Navigation */}
        {view !== 'profesor' && (
          <div className="md:hidden">
             <ResponsiveNav 
               currentView={view} 
               onChangeView={setView} 
               onOpenLogSession={() => setIsLogSessionOpen(true)}
               isDesktop={false}
             />
          </div>
        )}

        {/* Modals */}
        <LogSessionModal isOpen={isLogSessionOpen} onClose={() => setIsLogSessionOpen(false)} />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

