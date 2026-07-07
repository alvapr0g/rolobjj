import { Search, Crosshair, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  Marker
} from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export function AcademiesView() {
  // Use state to track the rotation of the globe [lambda, phi, gamma]
  const [rotation, setRotation] = useState<[number, number, number]>([-60, -20, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Adjust sensitivity by multiplying dx/dy
    setRotation((prev) => [
      prev[0] + dx * 0.5,
      Math.max(-90, Math.min(90, prev[1] - dy * 0.5)),
      prev[2]
    ]);
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragStart(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Mock academies data for markers
  const academies = [
    { name: "Atos Jiu-Jitsu HQ", coordinates: [-117.1611, 32.7157] as [number, number] }, // San Diego
    { name: "Checkmat São Paulo", coordinates: [-46.6333, -23.5505] as [number, number] }, // São Paulo
    { name: "Roger Gracie Academy", coordinates: [-0.1276, 51.5072] as [number, number] }, // London
    { name: "AOJ", coordinates: [-117.9143, 33.6411] as [number, number] } // Costa Mesa
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6 bg-rolo-bg h-full">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Academias</h1>
        <button className="text-rolo-gold hover:text-rolo-gold-hover transition-colors">
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" />
            <input 
              type="text" 
              placeholder="Ciudad, país o academia..." 
              className="w-full bg-rolo-surface border border-transparent rounded-xl py-4 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-colors placeholder:text-rolo-text-muted"
            />
          </div>

          {/* Globe Simulation */}
          <div className="relative w-full max-w-[320px] lg:max-w-md aspect-square mx-auto my-2 touch-none">
            {/* Floating Tooltip */}
            <div className="absolute top-4 right-0 bg-rolo-surface/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 z-10 shadow-xl pointer-events-none">
              <p className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-1">Vista 3D</p>
              <p className="text-[11px] text-white font-medium">Arrastra para rotar</p>
            </div>

            {/* Globe */}
            <div 
              className="w-full h-full rounded-full border border-rolo-gold/20 bg-gradient-to-br from-[#0a1f16] to-[#030a07] relative overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.1)] cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <ComposableMap
                projection="geoOrthographic"
                projectionConfig={{
                  rotate: rotation,
                  scale: 155 // adjust scale to fill the container nicely
                }}
                width={320}
                height={320}
                style={{ width: "100%", height: "100%" }}
              >
                <Sphere stroke="#1A3A2C" strokeWidth={1} fill="transparent" id="sphere" />
                <Graticule stroke="#12291F" strokeWidth={1} />
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1A3A2C"
                        stroke="#071711"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#34D399", outline: "none", transition: "all 0.2s" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                
                {/* Markers */}
                {academies.map((academy, idx) => (
                  <Marker key={idx} coordinates={academy.coordinates}>
                    <circle r={4} fill="#E6C05C" stroke="#071711" strokeWidth={1.5} className="shadow-lg" />
                    <circle r={10} fill="#E6C05C" opacity={0.2} />
                  </Marker>
                ))}
              </ComposableMap>
            </div>
          </div>

          <button className="w-full bg-rolo-gold hover:bg-rolo-gold-hover text-rolo-bg font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 transition-colors">
            <Crosshair className="w-4 h-4" />
            Buscar academias en esta zona
          </button>
        </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">Cerca de la zona visible · 4</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Academy 1 */}
            <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-[15px]">Atos Jiu-Jitsu HQ</h3>
                <span className="text-[11px] font-mono text-rolo-gold font-bold">2.1 km</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-rolo-text-muted">San Diego, EE.UU.</span>
                <span className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/80">Gi · No-Gi</span>
              </div>
            </div>

            {/* Academy 2 */}
            <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-[15px]">Checkmat São Paulo</h3>
                <span className="text-[11px] font-mono text-rolo-gold font-bold">-</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-rolo-text-muted">São Paulo, Brasil</span>
                <button className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/80 flex items-center gap-1 hover:bg-white/5 transition-colors">
                  Visitantes <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Academy 3 */}
            <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-[15px]">Roger Gracie Academy</h3>
                <span className="text-[11px] font-mono text-rolo-gold font-bold">-</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-rolo-text-muted">Londres, UK</span>
                <span className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/80">Gi</span>
              </div>
            </div>
            
            {/* Academy 4 */}
            <div className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-[15px]">Art of Jiu-Jitsu</h3>
                <span className="text-[11px] font-mono text-rolo-gold font-bold">-</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-rolo-text-muted">Costa Mesa, EE.UU.</span>
                <span className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/80">Gi · No-Gi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
