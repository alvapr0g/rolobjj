import { createContext, useContext, useState, ReactNode } from 'react';
import { Student, Technique, ValidationStatus, UserProfile } from './types';

export const MOCK_TECHNIQUES: Technique[] = [
  { id: 't1', name: 'Knee Slice Pass', tags: ['Pase de Guardia', 'Top', 'Gi'] },
  { id: 't2', name: 'Triangle Choke', tags: ['Finalización', 'Guardia Cerrada', 'Gi/No-Gi'] },
  { id: 't3', name: 'De La Riva Sweep', tags: ['Raspada', 'Guardia Abierta', 'Gi'] },
  { id: 't4', name: 'Kimura desde Control Lateral', tags: ['Finalización', 'Top', 'No-Gi'] },
  { id: 't5', name: 'Toreando Pass', tags: ['Pase de Guardia', 'Top', 'Gi/No-Gi'] },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Carlos Mendoza', belt: 'Morado', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=e6c05c' },
  { id: 's2', name: 'Ana Silva', belt: 'Azul', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=e6c05c' },
  { id: 's3', name: 'Luis Torres', belt: 'Blanco', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis&backgroundColor=e6c05c' },
  { id: 's4', name: 'Sofia Costa', belt: 'Morado', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=e6c05c' },
];

interface AppContextType {
  techniques: Technique[];
  students: Student[];
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  // Map of studentId -> techniqueId -> ValidationStatus
  studentValidations: Record<string, Record<string, ValidationStatus>>;
  validateTechniqueForStudents: (studentIds: string[], techniqueId: string) => void;
  resetValidations: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Carlos Mendoza',
    belt: 'Morado',
    degree: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=e6c05c'
  });

  // Initialize with 'Pendiente' for Carlos (s1) on the Knee Slice (t1) to show the demo
  const [studentValidations, setStudentValidations] = useState<Record<string, Record<string, ValidationStatus>>>({
    s1: {
      t1: 'Pendiente',
      t3: 'Pendiente',
    }
  });

  const validateTechniqueForStudents = (studentIds: string[], techniqueId: string) => {
    setStudentValidations(prev => {
      const next = { ...prev };
      studentIds.forEach(id => {
        if (!next[id]) next[id] = {};
        next[id] = { ...next[id], [techniqueId]: 'Validada por instructor' };
      });
      return next;
    });
  };

  const resetValidations = () => {
    setStudentValidations({
      s1: { t1: 'Pendiente', t3: 'Pendiente' }
    });
  };

  return (
    <AppContext.Provider value={{
      techniques: MOCK_TECHNIQUES,
      students: MOCK_STUDENTS,
      userProfile,
      updateUserProfile: setUserProfile,
      studentValidations,
      validateTechniqueForStudents,
      resetValidations
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
