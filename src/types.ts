export type ViewState = 'login' | 'inicio' | 'biblioteca' | 'progreso' | 'perfil' | 'profesor' | 'academias';

export type Belt = 'Blanco' | 'Azul' | 'Morado' | 'Marrón' | 'Negro';

export type Technique = {
  id: string;
  name: string;
  tags: string[];
};

export type Student = {
  id: string;
  name: string;
  belt: Belt;
  avatar: string;
};

export type UserProfile = {
  name: string;
  belt: Belt;
  degree: number;
  avatar: string;
};

export type ValidationStatus = 'Pendiente' | 'Validada por instructor';
