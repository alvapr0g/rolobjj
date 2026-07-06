import { Search, Crosshair, ChevronDown, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  (globalThis as any).process?.env?.GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function MapController({ query, onPlacesFound, isSearching }: { query: string, onPlacesFound: (places: google.maps.places.Place[]) => void, isSearching: boolean }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  
  useEffect(() => {
    if (!placesLib || !map || !isSearching) return;
    
    const searchTerms = ["Brazilian Jiu Jitsu", "BJJ", "Grappling", "No-Gi", "Submission Wrestling"];
    
    // We will do a text search combining the user's query and our terms, 
    // or just search for BJJ in the current map view
    const searchQuery = query ? `${query} BJJ` : "Brazilian Jiu Jitsu";

    placesLib.Place.searchByText({
      textQuery: searchQuery,
      fields: ['id', 'displayName', 'location', 'formattedAddress', 'rating'],
      locationBias: map.getBounds(),
      maxResultCount: 15,
    }).then(({ places }) => {
      onPlacesFound(places);
      if (places.length > 0 && places[0].location) {
        map.panTo(places[0].location);
        if (query) {
           map.setZoom(12);
        }
      }
    }).catch((e) => console.error("Error searching places", e));
  }, [placesLib, map, isSearching, query, onPlacesFound]);

  return null;
}

export function AcademiesView() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(true);
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
  };

  const handlePlacesFound = (newPlaces: google.maps.places.Place[]) => {
    setPlaces(newPlaces);
    setIsSearching(false);
  };

  if (!hasValidKey) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 bg-rolo-bg">
        <div className="text-center max-w-lg bg-rolo-surface p-8 rounded-2xl border border-white/10 shadow-xl">
          <MapPin className="w-12 h-12 text-rolo-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Se requiere clave de Google Maps</h2>
          <p className="text-rolo-text-muted mb-6 text-sm">
            Para visualizar y buscar academias en el mapa, necesitas configurar una API Key de Google Maps Platform.
          </p>
          <ul className="text-left text-sm text-rolo-text-muted/80 space-y-3 mb-6 bg-white/5 p-4 rounded-xl">
            <li>1. Abre <strong>Settings</strong> (⚙️ esquina superior derecha)</li>
            <li>2. Selecciona <strong>Secrets</strong></li>
            <li>3. Escribe <code className="text-rolo-gold">GOOGLE_MAPS_PLATFORM_KEY</code> y presiona Enter</li>
            <li>4. Pega tu API key y presiona Enter</li>
          </ul>
          <p className="text-xs text-white/40">La aplicación se recargará automáticamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-6 bg-rolo-bg h-full">
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Academias</h1>
        <button 
          onClick={() => setIsSearching(true)}
          className="text-rolo-gold hover:text-rolo-gold-hover transition-colors"
          title="Buscar en el área actual"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start h-full min-h-[500px]">
        <div className="w-full lg:w-1/2 flex flex-col gap-6 h-full">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rolo-text-muted" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ciudad, país o nombre de academia..." 
              className="w-full bg-rolo-surface border border-transparent rounded-xl py-4 pl-11 pr-4 text-[13px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors placeholder:text-rolo-text-muted"
            />
          </form>

          {/* Google Map */}
          <div className="relative w-full h-[400px] lg:h-full min-h-[400px] rounded-[24px] overflow-hidden border border-white/10 shadow-lg">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{lat: 0, lng: 0}}
                defaultZoom={2}
                mapId="ACADEMIES_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{width: '100%', height: '100%'}}
                disableDefaultUI={true}
              >
                <MapController query={query} onPlacesFound={handlePlacesFound} isSearching={isSearching} />
                
                {places.map(p => (
                  <AdvancedMarker key={p.id} position={p.location} title={p.displayName}>
                     <Pin background="#E6C05C" glyphColor="#071711" borderColor="#E6C05C" />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>

          <button 
            onClick={() => setIsSearching(true)}
            className="w-full bg-rolo-gold hover:bg-rolo-gold-hover text-rolo-bg font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rolo-gold/10"
          >
            <Crosshair className="w-4 h-4" />
            Buscar academias en esta zona
          </button>
        </div>

        <div className="w-full lg:w-1/2 h-full flex flex-col">
          <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-4">
            Resultados · {places.length}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
            {places.map(place => (
              <div key={place.id} className="bg-rolo-surface p-5 rounded-[20px] border border-white/5 flex flex-col gap-4 hover:border-rolo-gold/30 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-[15px] group-hover:text-rolo-gold transition-colors">{place.displayName}</h3>
                  {place.rating ? (
                     <span className="text-[11px] font-mono text-rolo-gold font-bold flex items-center gap-1">
                       ★ {place.rating}
                     </span>
                  ) : null}
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[12px] text-rolo-text-muted max-w-[70%] leading-relaxed truncate">{place.formattedAddress}</span>
                  <button className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/80 hover:bg-white/5 transition-colors shrink-0">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
            
            {places.length === 0 && !isSearching && (
              <div className="text-center py-12 bg-rolo-surface/50 rounded-2xl border border-white/5">
                <MapPin className="w-8 h-8 text-rolo-text-muted mx-auto mb-3" />
                <p className="text-white font-medium text-sm">No se encontraron academias</p>
                <p className="text-xs text-rolo-text-muted mt-1">Intenta buscar en otra zona o cambia tu búsqueda.</p>
              </div>
            )}
            
            {isSearching && (
               <div className="text-center py-12 bg-rolo-surface/50 rounded-2xl border border-white/5 animate-pulse">
                <p className="text-rolo-gold font-medium text-sm">Buscando en el tatami...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
