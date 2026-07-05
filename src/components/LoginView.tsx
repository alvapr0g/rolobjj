import React from 'react';

export function LoginView({ onLogin }: { onLogin: () => void }) {
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

          <button className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-[#F3F4F6] font-bold py-4 rounded-xl transition-all mb-8">
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
