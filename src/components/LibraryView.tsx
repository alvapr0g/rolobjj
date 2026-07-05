export function LibraryView() {
  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Biblioteca</h1>
        <div className="bg-rolo-surface px-4 py-2 rounded-full border border-white/5">
          <span className="text-[13px] text-rolo-text-muted">Buscar...</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="bg-rolo-gold text-rolo-bg px-5 py-2 rounded-full text-[13px] font-bold">Por posición</button>
        <button className="border border-white/20 text-rolo-text-muted hover:text-white transition-colors px-5 py-2 rounded-full text-[13px]">Por sumisión</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5">
          <h3 className="font-bold text-white mb-1.5 text-[15px]">De pie</h3>
          <p className="text-[11px] text-rolo-text-muted mb-4">Stójka · derribos</p>
          <p className="text-[11px] font-mono font-bold text-rolo-gold">12 técnicas</p>
        </div>
        {/* Card 2 */}
        <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5">
          <h3 className="font-bold text-white mb-1.5 text-[15px]">Pases</h3>
          <p className="text-[11px] text-rolo-text-muted mb-4">Gi · No-Gi</p>
          <p className="text-[11px] font-mono font-bold text-rolo-gold">8 técnicas</p>
        </div>
        {/* Card 3 */}
        <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5">
          <h3 className="font-bold text-white mb-1.5 text-[15px]">Guardia</h3>
          <p className="text-[11px] text-rolo-text-muted mb-4">Ataques</p>
          <p className="text-[11px] font-mono font-bold text-rolo-gold">15 técnicas</p>
        </div>
        {/* Card 4 */}
        <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5">
          <h3 className="font-bold text-white mb-1.5 text-[15px]">Bottom work</h3>
          <p className="text-[11px] text-rolo-text-muted mb-4">Trabajo abajo</p>
          <p className="text-[11px] font-mono font-bold text-rolo-gold">11 técnicas</p>
        </div>
        {/* Card 5 */}
        <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 md:col-span-2 lg:col-span-1">
          <h3 className="font-bold text-white mb-1.5 text-[15px]">Leg locks</h3>
          <p className="text-[11px] text-rolo-text-muted mb-4">Ataque · Defensa · filtrado por nivel</p>
          <p className="text-[11px] font-mono font-bold text-rolo-gold mb-3">9 técnicas</p>
          <p className="text-[10px] text-rolo-gold flex items-center gap-1.5">
            <span className="font-bold">⚠</span> Heel hooks ocultos para cinturón blanco
          </p>
        </div>
      </div>
    </div>
  );
}
