import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  Marker
} from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

type Academy = { name: string; city: string; coordinates: [number, number]; style: string };

// Lista de ejemplo mantenida a mano. Para tener academias reales, muévela a una colección de Firestore.
const ACADEMIES: Academy[] = [
  { name: 'Atos Jiu-Jitsu HQ', city: 'San Diego, EE.UU.', coordinates: [-117.1611, 32.7157], style: 'Gi · No-Gi' },
  { name: 'Checkmat São Paulo', city: 'São Paulo, Brasil', coordinates: [-46.6333, -23.5505], style: 'Gi · No-Gi' },
  { name: 'Roger Gracie Academy', city: 'Londres, UK', coordinates: [-0.1276, 51.5072], style: 'Gi' },
  { name: 'Art of Jiu-Jitsu', city: 'Costa Mesa, EE.UU.', coordinates: [-117.9143, 33.6411], style: 'Gi · No-Gi' },
];

const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function AcademiesView() {
  const [rotation, setRotation] = useState<[number, number, number]>([-60, -20, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return q ? ACADEMIES.filter((a) => norm(a.name + ' ' + a.city).includes(q)) : ACADEMIES;
  }, [query]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation((prev) => [prev[0] + dx * 0.5, Math.max(-90, Math.min(90, prev[1] - dy * 0.5)), prev[2]]);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragStart(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const focusOn = (a: Academy) => setRotation([-a.coordinates[0], -a.coordinates[1], 0]);

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6 bg-rolo-bg h-full">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Academias</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar academia por ciudad, país o nombre"
              placeholder="Ciudad, país o academia..."
              className="w-full bg-rolo-surface border border-transparent rounded-xl py-4 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors placeholder:text-rolo-text-muted"
            />
          </div>

          {/* Globe Simulation */}
          <div className="relative w-full max-w-[320px] lg:max-w-md aspect-square mx-auto my-2 touch-none" role="img" aria-label={`Globo 3D con ${filtered.length} academias`}>
            {/* Floating Tooltip */}
            <div className="absolute top-4 right-0 bg-rolo-surface/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 z-10 shadow-xl pointer-events-none">
              <p className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-1">Vista 3D</p>
              <p className="text-xs text-white font-medium">Arrastra para rotar</p>
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
                {filtered.map((academy) => (
                  <Marker key={academy.name} coordinates={academy.coordinates}>
                    <circle r={4} fill="#E6C05C" stroke="#071711" strokeWidth={1.5} className="shadow-lg" />
                    <circle r={10} fill="#E6C05C" opacity={0.2} />
                  </Marker>
                ))}
              </ComposableMap>
            </div>
          </div>

         </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'academia' : 'academias'}
          </h2>
          {filtered.length === 0 ? (
            <p className="text-rolo-text-muted text-sm">No encontramos academias con “{query}”.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {filtered.map((a) => (
                <li key={a.name}>
                  <button
                    onClick={() => focusOn(a)}
                    className="w-full text-left bg-rolo-surface p-5 rounded-[20px] border border-white/5 hover:border-rolo-gold/30 transition-colors flex flex-col gap-4"
                  >
                    <h3 className="font-bold text-white text-[15px]">{a.name}</h3>
                    <div className="flex justify-between items-end">
                      <span className="text-[13px] text-rolo-text-muted">{a.city}</span>
                      <span className="px-3 py-1.5 rounded-full border border-white/20 text-xs text-white/80">{a.style}</span>
                    </div>
                    <span className="text-xs text-rolo-gold">Ver en el globo</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
