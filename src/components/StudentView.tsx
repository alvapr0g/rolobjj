import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle, Clock, Edit2, X, Camera } from 'lucide-react';
import { useAppContext } from '../context';
import { useRef, useState } from 'react';
import { Belt } from '../types';

export function StudentView() {
  const { techniques, studentValidations, userProfile, updateUserProfile } = useAppContext();
  
  // Local state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateUserProfile(editForm);
    setIsEditing(false);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // We mock viewing as 'Carlos Mendoza' (s1), a Purple Belt
  const carlosValidations = studentValidations['s1'] || {};

  const beltColors: Record<Belt, { bg: string, text: string, name: string, next: string }> = {
    'Blanco': { bg: 'bg-white/10 border-white/20', text: 'text-white', name: 'Blanco', next: 'Azul' },
    'Azul': { bg: 'bg-blue-900/20 border-blue-500/20', text: 'text-blue-400', name: 'Azul', next: 'Morado' },
    'Morado': { bg: 'bg-purple-900/20 border-purple-500/20', text: 'text-purple-400', name: 'Morado', next: 'Marrón' },
    'Marrón': { bg: 'bg-[#4A3320]/20 border-[#8B5A2B]/20', text: 'text-[#E0A96D]', name: 'Marrón', next: 'Negro' },
    'Negro': { bg: 'bg-black/40 border-white/10', text: 'text-white', name: 'Negro', next: 'Coral' },
  };

  const currentBeltInfo = beltColors[userProfile.belt] || beltColors['Morado'];

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-rolo-bg overflow-hidden relative">
      <header className="px-6 py-8 border-b md:border-b-0 md:border-r border-white/5 bg-rolo-surface/30 md:w-[320px] lg:w-[400px] shrink-0 h-auto md:h-full overflow-y-auto z-10 shadow-xl md:shadow-none">
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="relative group">
            <img src={userProfile.avatar} alt={userProfile.name} className="w-16 h-16 rounded-full border-2 border-rolo-gold object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className={`${currentBeltInfo.text} font-medium`}>Cinturón {userProfile.belt}</p>
              {userProfile.degree > 0 && (
                <div className="flex bg-[#071711] px-1.5 py-0.5 gap-1 rounded border border-white/5 items-center h-5">
                  {Array.from({ length: userProfile.degree }).map((_, i) => (
                    <div key={i} className="w-1.5 h-3 bg-white/90"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              setEditForm({ ...userProfile });
              setIsEditing(true);
            }}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className={`${currentBeltInfo.bg} border rounded-2xl p-4 flex items-start gap-4 transition-colors`}>
          <Shield className={`w-8 h-8 ${currentBeltInfo.text} shrink-0`} />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">Requisitos para {currentBeltInfo.next}</h3>
            <p className="text-xs text-rolo-text-muted leading-relaxed">Debes dominar las siguientes secuencias y validarlas con un instructor jefe.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-32 md:pb-12 bg-rolo-bg h-full">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-6">Bitácora de Requisitos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['t1', 't3', 't4', 't5'].map(techId => {
              const tech = techniques.find(t => t.id === techId);
              if (!tech) return null;
              
              const status = carlosValidations[techId] || 'Pendiente';
              const isValidated = status === 'Validada por instructor';

              return (
                <motion.div 
                  key={techId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition-colors duration-500 flex flex-col justify-between min-h-[140px] ${
                    isValidated 
                      ? 'bg-rolo-surface border-rolo-gold/30' 
                      : 'bg-rolo-surface/30 border-white/5 hover:bg-rolo-surface/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold text-lg ${isValidated ? 'text-white' : 'text-rolo-text'}`}>
                      {tech?.name}
                    </h3>
                    {isValidated ? (
                      <div className="bg-rolo-gold/10 text-rolo-gold p-1.5 rounded-full shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="bg-white/5 text-rolo-text-muted p-1.5 rounded-full shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      isValidated 
                        ? 'bg-rolo-gold text-rolo-bg' 
                        : 'bg-white/10 text-rolo-text-muted'
                    }`}>
                      {status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rolo-surface w-full max-w-md rounded-3xl p-8 border border-white/10 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-rolo-text-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-8">Editar Perfil</h2>

              <div className="flex flex-col gap-6">
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={editForm.avatar} alt="Preview" className="w-24 h-24 rounded-full border-2 border-rolo-gold object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-2 block">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-rolo-bg border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-2 block">Cinturón</label>
                    <select 
                      value={editForm.belt}
                      onChange={(e) => setEditForm({ ...editForm, belt: e.target.value as Belt })}
                      className="w-full bg-rolo-bg border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors appearance-none"
                    >
                      <option value="Blanco">Blanco</option>
                      <option value="Azul">Azul</option>
                      <option value="Morado">Morado</option>
                      <option value="Marrón">Marrón</option>
                      <option value="Negro">Negro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-2 block">Grados</label>
                    <select 
                      value={editForm.degree}
                      onChange={(e) => setEditForm({ ...editForm, degree: parseInt(e.target.value) })}
                      className="w-full bg-rolo-bg border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors appearance-none"
                    >
                      <option value="0">0 Grados</option>
                      <option value="1">1 Grado</option>
                      <option value="2">2 Grados</option>
                      <option value="3">3 Grados</option>
                      <option value="4">4 Grados</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-rolo-gold hover:bg-rolo-gold-hover text-rolo-bg font-bold py-4 rounded-xl mt-8 transition-colors shadow-lg shadow-rolo-gold/10"
              >
                Guardar Cambios
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
