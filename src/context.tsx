import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { TECHNIQUES } from './data/techniques';
import { toISODate } from './lib/dates';
import { Belt, SessionType, Student, Technique, TrainingSession, UserProfile } from './types';

export type NewSession = Omit<TrainingSession, 'id'>;
export type ProfileUpdate = Partial<Pick<UserProfile, 'name' | 'belt' | 'degree' | 'avatar'>>;

interface AppContextType {
  authUser: User | null;
  authLoading: boolean;
  profile: UserProfile | null;
  dataError: string | null;
  techniques: Technique[];
  sessions: TrainingSession[];
  /** IDs de técnicas validadas por un instructor para el usuario actual. */
  validatedIds: Set<string>;
  /** Alumnos registrados (solo se carga para profesores). */
  students: Student[];

  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  updateProfile: (update: ProfileUpdate) => Promise<void>;
  addSession: (session: NewSession) => Promise<void>;
  validateTechniqueForStudents: (studentIds: string[], techniqueId: string, sessionType: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());
  const [students, setStudents] = useState<Student[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const pendingName = useRef<string | null>(null);

  const uid = authUser?.uid ?? null;
  const role = profile?.role ?? null;

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        setAuthLoading(false);
        if (!user) {
          setProfile(null);
          setSessions([]);
          setValidatedIds(new Set());
          setStudents([]);
        }
      }),
    [],
  );

  // Perfil (se crea en el primer acceso, siempre como alumno).
  useEffect(() => {
    if (!uid || !authUser) return;
    const ref = doc(db, 'users', uid);
    return onSnapshot(
      ref,
      (snap) => {
        setDataError(null);
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            uid,
            name: d.name ?? 'Atleta',
            belt: d.belt ?? 'Blanco',
            degree: d.degree ?? 0,
            avatar: d.avatar ?? '',
            role: d.role === 'profesor' ? 'profesor' : 'alumno',
            beltSince: d.beltSince ?? toISODate(),
            email: authUser.email ?? undefined,
          });
        } else if (!snap.metadata.fromCache) {
          const fallbackName = authUser.displayName || authUser.email?.split('@')[0] || 'Atleta';
          setDoc(ref, {
            name: (pendingName.current || fallbackName).slice(0, 60),
            belt: 'Blanco',
            degree: 0,
            avatar: '',
            role: 'alumno',
            beltSince: toISODate(),
            createdAt: serverTimestamp(),
          }).catch(() => setDataError('No se pudo crear tu perfil. Revisa las reglas de Firestore.'));
        }
      },
      () => setDataError('No se pudo cargar tu perfil. Revisa tu conexión y las reglas de Firestore.'),
    );
  }, [uid, authUser]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'users', uid, 'sessions'), orderBy('date', 'desc'), limit(1000));
    return onSnapshot(
      q,
      (snap) =>
        setSessions(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              type: x.type,
              date: x.date,
              duration: x.duration,
              rpe: x.rpe,
              techniques: x.techniques ?? [],
              notes: x.notes ?? '',
            } as TrainingSession;
          }),
        ),
      () => setDataError('No se pudieron cargar tus sesiones.'),
    );
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'validations'), where('studentId', '==', uid));
    return onSnapshot(
      q,
      (snap) => setValidatedIds(new Set(snap.docs.map((d) => d.data().techniqueId as string))),
      () => setDataError('No se pudieron cargar tus validaciones.'),
    );
  }, [uid]);

  useEffect(() => {
    if (role !== 'profesor') {
      setStudents([]);
      return;
    }
    const q = query(collection(db, 'users'), where('role', '==', 'alumno'));
    return onSnapshot(
      q,
      (snap) =>
        setStudents(
          snap.docs
            .map((d) => ({
              uid: d.id,
              name: (d.data().name as string) ?? 'Alumno',
              belt: (d.data().belt as Belt) ?? 'Blanco',
              avatar: (d.data().avatar as string) ?? '',
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'es')),
        ),
      () => setDataError('No se pudo cargar la lista de alumnos.'),
    );
  }, [role]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpEmail = useCallback(async (name: string, email: string, password: string) => {
    pendingName.current = name.trim();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    sendEmailVerification(cred.user).catch(() => undefined);
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateProfile = useCallback(
    async (update: ProfileUpdate) => {
      if (!uid || !profile) return;
      const data: Record<string, string | number> = {};
      if (update.name !== undefined) data.name = update.name;
      if (update.belt !== undefined) data.belt = update.belt;
      if (update.degree !== undefined) data.degree = update.degree;
      if (update.avatar !== undefined) data.avatar = update.avatar;
      if (update.belt && update.belt !== profile.belt) data.beltSince = toISODate();
      await updateDoc(doc(db, 'users', uid), data);
    },
    [uid, profile],
  );

  const addSession = useCallback(
    async (session: NewSession) => {
      if (!uid) throw new Error('No hay sesión iniciada');
      await addDoc(collection(db, 'users', uid, 'sessions'), { ...session, createdAt: serverTimestamp() });
    },
    [uid],
  );

  const validateTechniqueForStudents = useCallback(
    async (studentIds: string[], techniqueId: string, sessionType: string) => {
      if (!uid || role !== 'profesor') throw new Error('Solo los profesores pueden validar técnicas');
      const batch = writeBatch(db);
      studentIds.forEach((studentId) => {
        batch.set(doc(db, 'validations', `${studentId}_${techniqueId}`), {
          studentId,
          techniqueId,
          status: 'Validada por instructor',
          validatedBy: uid,
          updatedAt: serverTimestamp(),
        });
      });
      batch.set(doc(collection(db, 'classes')), {
        professorId: uid,
        techniqueId,
        sessionType,
        attendees: studentIds,
        date: toISODate(),
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    },
    [uid, role],
  );

  const getIdToken = useCallback(async () => (authUser ? authUser.getIdToken() : null), [authUser]);

  const value = useMemo<AppContextType>(
    () => ({
      authUser,
      authLoading,
      profile,
      dataError,
      techniques: TECHNIQUES,
      sessions,
      validatedIds,
      students,
      signInEmail,
      signUpEmail,
      signInGoogle,
      resetPassword,
      logout,
      updateProfile,
      addSession,
      validateTechniqueForStudents,
      getIdToken,
    }),
    [
      authUser, authLoading, profile, dataError, sessions, validatedIds, students,
      signInEmail, signUpEmail, signInGoogle, resetPassword, logout, updateProfile,
      addSession, validateTechniqueForStudents, getIdToken,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

export type { SessionType };
