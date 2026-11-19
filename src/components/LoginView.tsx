import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context';
import { authErrorMessage } from '../lib/authErrors';

type Mode = 'login' | 'signup' | 'reset';

const inputClass =
  'w-full bg-[#1a3a2c] md:bg-[#152e23] border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-[#e6c05c] transition-colors placeholder:text-[#8BA396]';
const labelClass = 'text-xs font-bold text-[#8BA396] uppercase tracking-[0.12em] mb-2 block';

export function LoginView() {
  const { signInEmail, signUpEmail, signInGoogle, resetPassword } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (name.trim().length < 2) return setError('Escribe tu nombre (mínimo 2 caracteres).');
      if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    run(async () => {
      if (mode === 'login') await signInEmail(email, password);
      else if (mode === 'signup') await signUpEmail(name, email, password);
      else {
        await resetPassword(email);
        setInfo('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
      }
    });
  };

  const title = mode === 'login' ? 'Bienvenido de vuelta' : mode === 'signup' ? 'Crea tu cuenta' : 'Recupera tu contraseña';
  const submitLabel = mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace';

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-[#0a1f16]">
      {/* Panel izquierdo (escritorio) */}
      <section className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-[#0a1f16]" aria-label="Qué es ROLO">
        <div className="w-16 h-1.5 bg-[#e6c05c] rounded-full mb-6" aria-hidden="true"></div>
        <h1 className="text-7xl font-black text-[#F3F4F6] tracking-widest mb-6">ROLO</h1>
        <p className="text-[#8BA396] text-lg mb-10">Registra. Aprende. Progresa.</p>

        <div className="flex gap-4 mb-12" aria-hidden="true">
          <div className="w-3.5 h-3.5 rounded-full bg-[#F3F4F6]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#2D6CB4]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#734098]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#664228]"></div>
          <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#8BA396] bg-transparent"></div>
        </div>

        <ul className="text-[#B7C7BD] max-w-sm leading-relaxed flex flex-col gap-3 mb-12 text-sm">
          <li>🥋 Registra cada sesión de drilling, rolling y clase.</li>
          <li>📚 Consulta la biblioteca de técnicas por posición o tipo.</li>
          <li>📈 Mira tu avance hacia el siguiente cinturón con datos reales.</li>
          <li>🎓 Tu profesor valida las técnicas que ya dominas.</li>
        </ul>

        <p className="text-[#8BA396] text-center max-w-sm leading-relaxed italic">
          “El cinturón solo cubre dos centímetros de tu espalda.”
        </p>
      </section>

      {/* Panel derecho */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:bg-[#12291f]">
        <div className="flex md:hidden flex-col items-center justify-center mb-8 mt-8">
          <div className="w-12 h-1 bg-[#e6c05c] rounded-full mb-4" aria-hidden="true"></div>
          <p className="text-5xl font-black text-[#F3F4F6] tracking-widest mb-4" aria-hidden="true">ROLO</p>
          <p className="text-[#8BA396] text-sm">Registra. Aprende. Progresa.</p>
        </div>

        <div className="w-full max-w-md bg-[#071711] md:bg-[#0a1813] rounded-[24px] p-8 md:p-10 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-8">{title}</h2>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className={labelClass}>Nombre</label>
                <input id="name" type="text" autoComplete="name" maxLength={60} required value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputClass} />
              </div>
            )}
            <div>
              <label htmlFor="email" className={labelClass}>Correo</label>
              <input id="email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className={inputClass} />
            </div>
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Contraseña'} className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#8BA396] hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end -mt-2">
                <button type="button" onClick={() => switchMode('reset')}
                  className="text-[13px] font-bold text-[#e6c05c] hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <div aria-live="polite">
              {error && <p role="alert" className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
              {info && <p role="status" className="text-sm text-[#e6c05c] bg-[#e6c05c]/10 border border-[#e6c05c]/30 rounded-lg px-3 py-2">{info}</p>}
            </div>

            <button type="submit" disabled={busy}
              className="w-full bg-[#e6c05c] hover:bg-[#C99630] disabled:opacity-60 text-[#071711] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#e6c05c]/10">
              {busy ? 'Un momento…' : submitLabel}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-4 my-6" aria-hidden="true">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[13px] text-white/50 font-medium">o</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button type="button" disabled={busy} onClick={() => run(signInGoogle)}
                className="w-full bg-transparent border border-white/20 hover:bg-white/5 disabled:opacity-60 text-[#F3F4F6] font-bold py-4 rounded-xl transition-all mb-6 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
            </>
          )}

          <p className="text-center text-[13px] text-[#8BA396]">
            {mode === 'login' ? (
              <>¿Primera vez en el tatami?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#e6c05c] font-bold hover:underline">Crea tu cuenta</button></>
            ) : (
              <>¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-[#e6c05c] font-bold hover:underline">Inicia sesión</button></>
            )}
          </p>

          <p className="text-center text-xs text-[#8BA396] mt-5">
            Al continuar aceptas el tratamiento de datos descrito en{' '}
            <button type="button" onClick={() => setShowPrivacy(true)} className="underline hover:text-white">Privacidad</button>.
          </p>
        </div>
      </section>

      {showPrivacy && (
        <div role="dialog" aria-modal="true" aria-labelledby="privacy-title"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onKeyDown={(e) => e.key === 'Escape' && setShowPrivacy(false)}>
          <div className="bg-[#0a1813] max-w-md w-full rounded-2xl p-6 border border-white/10 text-sm text-[#B7C7BD] leading-relaxed">
            <h2 id="privacy-title" className="text-lg font-bold text-white mb-3">Privacidad</h2>
            <p className="mb-2">ROLO guarda tu correo, tu nombre, tu cinturón y el registro de tus entrenamientos para mostrarte tu progreso. Se almacenan en Firebase (Google).</p>
            <p className="mb-2">Tu profesor puede ver tu nombre, cinturón y entrenamientos. Nadie más tiene acceso.</p>
            <p className="mb-2">El análisis con IA envía solo números agregados (sesiones, intensidad, progreso), nunca tus notas.</p>
            <p className="mb-4 text-xs text-[#8BA396]">Borrador informativo: revísalo con un profesional antes de usarlo como política legal.</p>
            <button autoFocus onClick={() => setShowPrivacy(false)}
              className="w-full bg-[#e6c05c] text-[#071711] font-bold py-3 rounded-xl">Entendido</button>
          </div>
        </div>
      )}
    </main>
  );
}
