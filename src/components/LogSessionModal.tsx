import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LogSessionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 z-50 bg-rolo-bg flex flex-col"
      >
        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <div className="flex items-center gap-4 mb-8 mt-2">
            <button onClick={onClose} className="text-rolo-text-muted hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Registrar sesión</h1>
          </div>

          <section className="mb-6">
            <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">Tipo de Sesión</h2>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-full border border-white/10 text-[13px] text-rolo-text-muted hover:bg-white/5 transition-colors">Drilling</button>
              <button className="flex-1 py-2.5 rounded-full bg-rolo-gold text-rolo-bg text-[13px] font-bold">Rolling</button>
              <button className="flex-1 py-2.5 rounded-full border border-white/10 text-[13px] text-rolo-text-muted hover:bg-white/5 transition-colors">Clase</button>
            </div>
          </section>

          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-rolo-surface rounded-2xl p-4 border border-white/5">
              <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-1.5">Fecha</h2>
              <p className="text-white text-[15px] font-medium flex items-center gap-1">Hoy <span className="text-[10px] text-rolo-text-muted">▼</span></p>
            </div>
            <div className="flex-1 bg-rolo-surface rounded-2xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-1.5">Duración</h2>
                <p className="text-white text-[15px] font-mono font-medium">60 min</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-rolo-gold shadow-[0_0_15px_rgba(230,192,92,0.3)]"></div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">Técnicas Practicadas</h2>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" />
              <input type="text" placeholder="Escribe para buscar..." className="w-full bg-rolo-surface border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            
            <div className="flex flex-wrap gap-2.5 mb-5">
              <span className="bg-rolo-gold text-rolo-bg px-3.5 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5">
                Z guard <X className="w-3.5 h-3.5 opacity-70" />
              </span>
              <span className="bg-rolo-gold text-rolo-bg px-3.5 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5">
                Scissor sweep <X className="w-3.5 h-3.5 opacity-70" />
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px]">
              <span className="text-rolo-text-muted">Recientes:</span>
              <span className="border border-white/10 text-rolo-text-muted px-3 py-1 rounded-full hover:text-white transition-colors cursor-pointer">DLR</span>
              <span className="border border-white/10 text-rolo-text-muted px-3 py-1 rounded-full hover:text-white transition-colors cursor-pointer">Triangle</span>
            </div>
          </section>

          <section className="bg-rolo-surface rounded-[24px] p-5 mb-8 border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-[13px]">Añadir detalle (opcional)</h3>
              <span className="text-rolo-text-muted text-[10px]">▼</span>
            </div>
            
            <div className="flex items-center gap-4 mb-5">
              <span className="text-[11px] text-rolo-text-muted w-24">Compañeros</span>
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/5 border-2 border-rolo-surface"></div>
                <div className="w-9 h-9 rounded-full bg-white/5 border-2 border-rolo-surface"></div>
                <div className="w-9 h-9 rounded-full border-2 border-white/10 border-dashed flex items-center justify-center text-white/50 text-[10px] bg-rolo-surface">+</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] text-rolo-text-muted w-24">Intensidad RPE</span>
              <div className="flex gap-1.5">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className={`w-2.5 h-5 rounded-[3px] ${i <= 7 ? 'bg-rolo-gold' : 'bg-white/5'}`}></div>
                ))}
              </div>
            </div>

            <textarea 
              placeholder="Notas..." 
              className="w-full bg-white/5 border border-transparent focus:border-white/10 rounded-xl p-4 text-[13px] text-white focus:outline-none resize-none h-24 placeholder:text-white/30 transition-colors"
            ></textarea>
          </section>

          <button onClick={onClose} className="w-full bg-rolo-gold hover:bg-rolo-gold-hover text-rolo-bg font-bold py-4 rounded-[16px] transition-colors">
            GUARDAR SESIÓN
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
