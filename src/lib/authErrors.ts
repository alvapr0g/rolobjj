const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/missing-email': 'Escribe tu correo.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 8 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo otra vez.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Auth.',
  'auth/operation-not-allowed': 'Este método de acceso no está habilitado en Firebase.',
};

/** Devuelve un mensaje en español, o null si el usuario simplemente cerró la ventana. */
export function authErrorMessage(error: unknown): string | null {
  const code = (error as { code?: string })?.code ?? '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  return MESSAGES[code] ?? 'No se pudo completar la operación. Inténtalo de nuevo.';
}
