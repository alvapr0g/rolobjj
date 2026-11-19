import { Suspense, lazy, useState } from 'react';
import { AppProvider, useAppContext } from './context';
import { StudentView } from './components/StudentView';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { ResponsiveNav } from './components/ResponsiveNav';
import { LogSessionModal } from './components/LogSessionModal';
import { LoginView } from './components/LoginView';
import { ViewState } from './types';

const ProfessorDashboard = lazy(() => import('./components/ProfessorDashboard').then((m) => ({ default: m.ProfessorDashboard })));
const ProgressView = lazy(() => import('./components/ProgressView').then((m) => ({ default: m.ProgressView })));
const AcademiesView = lazy(() => import('./components/AcademiesView').then((m) => ({ default: m.AcademiesView })));

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="min-h-screen bg-rolo-bg flex flex-col items-center justify-center gap-3 text-rolo-text-muted p-6 text-center">
      {children}
    </div>
  );
}

function AppContent() {
  const [view, setView] = useState<ViewState>('inicio');
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const { authUser, authLoading, profile, dataError, logout } = useAppContext();

  if (authLoading) return <FullScreenMessage><span className="text-2xl font-black tracking-widest text-white">ROLO</span>Cargando…</FullScreenMessage>;
  if (!authUser) return <LoginView />;
  if (!profile) {
    return (
      <FullScreenMessage>
        <span className="text-2xl font-black tracking-widest text-white">ROLO</span>
        {dataError ? (
          <>
            <p role="alert" className="text-red-300 max-w-sm">{dataError}</p>
            <button onClick={() => logout()} className="mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white">Cerrar sesión</button>
          </>
        ) : 'Preparando tu perfil…'}
      </FullScreenMessage>
    );
  }

  const isProfesor = profile.role === 'profesor';
  // Un alumno nunca puede abrir el panel, aunque el estado local se manipule.
  const current: ViewState = view === 'profesor' && !isProfesor ? 'inicio' : view;

  const renderView = () => {
    switch (current) {
      case 'biblioteca': return <LibraryView />;
      case 'progreso': return <ProgressView />;
      case 'perfil': return <StudentView onNavigate={setView} />;
      case 'profesor': return <ProfessorDashboard />;
      case 'academias': return <AcademiesView />;
      default: return <HomeView />;
    }
  };

  const nav = (isDesktop: boolean) => (
    <ResponsiveNav currentView={current} onChangeView={setView} onOpenLogSession={() => setIsLogSessionOpen(true)}
      isDesktop={isDesktop} isProfesor={isProfesor} />
  );

  return (
    <div className="h-screen w-full bg-rolo-bg flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="hidden md:block w-64 shrink-0 border-r border-white/5 bg-rolo-surface/30">{nav(true)}</div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {dataError && (
          <p role="alert" className="bg-red-900/40 text-red-200 text-sm px-4 py-2 border-b border-red-500/30">{dataError}</p>
        )}
        <main id="contenido" className="flex-1 overflow-x-hidden overflow-y-auto relative bg-rolo-bg"><Suspense fallback={<p role="status" className="p-6 text-rolo-text-muted">Cargando…</p>}>{renderView()}</Suspense></main>
        <div className="md:hidden">{nav(false)}</div>
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
