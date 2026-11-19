export type ViewState = 'inicio' | 'biblioteca' | 'progreso' | 'perfil' | 'profesor' | 'academias';

export type Belt = 'Blanco' | 'Azul' | 'Morado' | 'Marrón' | 'Negro';

export type Role = 'alumno' | 'profesor';

export type Position = 'De pie' | 'Pases' | 'Guardia' | 'Control' | 'Leg locks';

export type TechniqueKind = 'Derribo' | 'Pase' | 'Raspada' | 'Finalización' | 'Escape' | 'Transición';

export type Technique = {
  id: string;
  name: string;
  position: Position;
  kind: TechniqueKind;
  tags: string[];
  /** Cinturón en el que se espera dominar la técnica (cuenta para el checklist de ascenso). */
  level: Belt;
  /** Cinturón mínimo para ver la técnica (p. ej. heel hooks). Si no existe, es visible para todos. */
  minBelt?: Belt;
  description: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  belt: Belt;
  degree: number;
  avatar: string;
  role: Role;
  /** Fecha (YYYY-MM-DD) en la que el alumno recibió su cinturón actual. */
  beltSince: string;
  email?: string;
};

export type Student = Pick<UserProfile, 'uid' | 'name' | 'belt' | 'avatar'>;

export type SessionType = 'Drilling' | 'Rolling' | 'Clase';

export type TrainingSession = {
  id: string;
  type: SessionType;
  /** YYYY-MM-DD en hora local. */
  date: string;
  duration: number;
  rpe: number;
  techniques: string[];
  notes: string;
};

export type ValidationStatus = 'Pendiente' | 'Validada por instructor';

export type AlertLog = {
  id: string;
  date: string;
  studentName: string;
  message: string;
};
