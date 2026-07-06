import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (error) {
      console.error('Error signing in with Google', error);
      alert('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col md:flex-row bg-[#0a1f16]">
      {/* Left Panel (Desktop) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-[#0a1f16]">
        <div className="w-16 h-1.5 bg-[#e6c05c] rounded-full mb-6"></div>
        <h1 className="text-7xl font-black text-[#F3F4F6] tracking-widest mb-6">ROLO</h1>
        <p className="text-[#8BA396] text-lg mb-10">Registra. Aprende. Progresa.</p>
        
        <div className="flex gap-4 mb-16">
          <div className="w-3.5 h-3.5 rounded-full bg-[#F3F4F6]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#2D6CB4]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#734098]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#664228]"></div>
          <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#8BA396] bg-transparent"></div>
        </div>

        <p className="text-[#8BA396] text-center max-w-sm leading-relaxed">
          "El cinturón solo cubre dos centímetros de tu espalda."
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:bg-[#12291f]">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex md:hidden flex-col items-center justify-center mb-10 mt-10">
          <div className="w-12 h-1 bg-[#e6c05c] rounded-full mb-4"></div>
          <h1 className="text-5xl font-black text-[#F3F4F6] tracking-widest mb-4">ROLO</h1>
          <p className="text-[#8BA396] text-sm">Registra. Aprende. Progresa.</p>
        </div>

        <div className="w-full max-w-md bg-[#071711] md:bg-[#0a1813] rounded-[24px] p-8 md:p-10 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-8">Bienvenido de vuelta</h2>
          
          <div className="flex flex-col gap-6 mb-4">
            <div>
              <label className="text-[10px] font-bold text-[#8BA396] uppercase tracking-[0.15em] mb-2 block">Correo</label>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full bg-[#1a3a2c] md:bg-[#152e23] border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-[#e6c05c]/50 transition-colors placeholder:text-[#8BA396]/60"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8BA396] uppercase tracking-[0.15em] mb-2 block">Contraseña</label>
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full bg-[#1a3a2c] md:bg-[#152e23] border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-[#e6c05c]/50 transition-colors placeholder:text-[#8BA396]/60"
              />
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <button className="text-[12px] font-bold text-[#e6c05c] hover:text-[#e6c05c]/80 transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button 
            onClick={onLogin}
            className="w-full bg-[#e6c05c] hover:bg-[#C99630] text-[#071711] font-bold py-4 rounded-xl transition-all mb-8 shadow-lg shadow-[#e6c05c]/10"
          >
            Entrar
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[12px] text-white/30 font-medium">o</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button onClick={handleGoogleSignIn} className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-[#F3F4F6] font-bold py-4 rounded-xl transition-all mb-8 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>

          <p className="text-center text-[13px] text-[#8BA396]">
            ¿Primera vez en el tatami? <button className="text-[#e6c05c] font-bold hover:underline">Crea tu cuenta</button>
          </p>
        </div>
      </div>
    </div>
  );
}
