import { FormEvent, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle, Clock, Edit2, X, Camera, LogOut, Globe, GraduationCap } from 'lucide-react';
import { useAppContext } from '../context';
import { Avatar } from './Avatar';
import { Belt, ViewState } from '../types';
import { BELTS, nextBelt, techniquesForBelt } from '../lib/progress';

const BELT_INFO: Record<Belt, { bg: string; text: string; expectations: string }> = {
  Blanco: { bg: 'bg-white/10 border-white/20', text: 'text-white', expectations: 'Dominio sólido de fundamentos, supervivencia, escapes, control posicional y defensa básica.' },
  Azul: { bg: 'bg-blue-900/20 border-blue-500/20', text: 'text-blue-400', expectations: 'Desarrollo de un juego propio, encadenar técnicas y atacar desde varias posiciones.' },
  Morado: { bg: 'bg-purple-900/20 border-purple-500/20', text: 'text-purple-400', expectations: 'Alto nivel técnico, capacidad de enseñar fundamentos y resolver situaciones complejas.' },
  Marrón: { bg: 'bg-[#4A3320]/20 border-[#8B5A2B]/20', text: 'text-[#E0A96D]', expectations: 'Dominio avanzado, consistencia y madurez técnica y personal.' },
  Negro: { bg: 'bg-black/40 border-white/10', text: 'text-white', expectations: 'Maestría técnica y personal.' },
};

/** Reduce la foto a 256 px y la comprime para que quepa en el documento de Firestore. */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function StudentView({ onNavigate }: { onNavigate: (v: ViewState) => void }) {
  const { profile, techniques, validatedIds, updateProfile, logout } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', belt: 'Blanco' as Belt, degree: 0, avatar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;
  const info = BELT_INFO[profile.belt];
  const next = nextBelt(profile.belt);
  const required = techniquesForBelt(profile.belt, techniques);

  const openEdit = () => {
    setForm({ name: profile.name, belt: profile.belt, degree: profile.degree, avatar: profile.avatar });
    setError(null);
    setIsEditing(true);
  };

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Elige un archivo de imagen.');
    try {
      const data = await compressImage(file);
      setForm((f) => ({ ...f, avatar: data }));
      setError(null);
    } catch {
      setError('No se pudo procesar la imagen.');
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 1 || name.length > 60) return setError('El nombre debe tener entre 1 y 60 caracteres.');
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name, belt: form.belt, degree: form.degree, avatar: form.avatar });
      setIsEditing(false);
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'w-full bg-rolo-bg border border-transparent rounded-xl py-3.5 px-4 text-[14px] text-white focus:outline-none focus:border-rolo-gold/50 transition-colors';
  const labelClass = 'text-xs font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-2 block';

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-rolo-bg overflow-hidden relative">
      <header className="px-6 py-8 border-b md:border-b-0 md:border-r border-white/5 bg-rolo-surface/30 md:w-[320px] lg:w-[400px] shrink-0 h-auto md:h-full overflow-y-auto z-10">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={profile.name} src={profile.avatar} className="w-16 h-16 border-2 border-rolo-gold text-xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{profile.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className={`${info.text} font-medium`}>Cinturón {profile.belt}</p>
              {profile.degree > 0 && (
                <div className="flex bg-[#071711] px-1.5 py-0.5 gap-1 rounded border border-white/5 items-center h-5" aria-label={`${profile.degree} grados`}>
                  {Array.from({ length: profile.degree }).map((_, i) => <div key={i} className="w-1.5 h-3 bg-white/90"></div>)}
                </div>
              )}
            </div>
            <p className="text-xs text-rolo-text-muted mt-1">{profile.role === 'profesor' ? 'Profesor' : 'Alumno'}{profile.email ? ` · ${profile.email}` : ''}</p>
          </div>
          <button onClick={openEdit} aria-label="Editar perfil"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className={`${info.bg} border rounded-2xl p-4 mb-6`}>
          <div className="flex items-start gap-4">
            <Shield className={`w-8 h-8 ${info.text} shrink-0`} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-white text-sm mb-1">{next ? `Requisitos para ${next}` : 'Cinturón máximo'}</h2>
              <p className="text-xs text-rolo-text-muted leading-relaxed">{info.expectations}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => onNavigate('academias')} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium">
            <Globe className="w-4 h-4 text-rolo-gold" aria-hidden="true" /> Busca tu academia
          </button>
          {profile.role === 'profesor' && (
            <button onClick={() => onNavigate('profesor')} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium">
              <GraduationCap className="w-4 h-4 text-rolo-gold" aria-hidden="true" /> Panel del profesor
            </button>
          )}
          <button onClick={() => logout()} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-900/30 text-white text-sm font-medium">
            <LogOut className="w-4 h-4 text-red-300" aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-32 md:pb-12 bg-rolo-bg h-full">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-6">Bitácora de requisitos · cinturón {profile.belt.toLowerCase()}</h2>
          {required.length === 0 ? (
            <p className="text-rolo-text-muted">No hay técnicas requeridas para este cinturón.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {required.map((tech) => {
                const ok = validatedIds.has(tech.id);
                return (
                  <motion.li key={tech.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border transition-colors duration-500 flex flex-col justify-between min-h-[140px] ${ok ? 'bg-rolo-surface border-rolo-gold/30' : 'bg-rolo-surface/30 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <h3 className={`font-bold text-lg ${ok ? 'text-white' : 'text-rolo-text'}`}>{tech.name}</h3>
                      <div className={`${ok ? 'bg-rolo-gold/10 text-rolo-gold' : 'bg-white/5 text-rolo-text-muted'} p-1.5 rounded-full shrink-0`}>
                        {ok ? <CheckCircle className="w-5 h-5" aria-hidden="true" /> : <Clock className="w-5 h-5" aria-hidden="true" />}
                      </div>
                    </div>
                    <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${ok ? 'bg-rolo-gold text-rolo-bg' : 'bg-white/10 text-rolo-text-muted'}`}>
                      {ok ? 'Validada por instructor' : 'Pendiente'}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-title"
            onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
            <motion.form onSubmit={onSave} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rolo-surface w-full max-w-md rounded-3xl p-8 border border-white/10 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button type="button" onClick={() => setIsEditing(false)} aria-label="Cerrar" className="absolute top-6 right-6 text-rolo-text-muted hover:text-white">
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
              <h2 id="edit-title" className="text-2xl font-bold text-white mb-8">Editar perfil</h2>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Cambiar foto" className="relative group">
                    <Avatar name={form.name || 'Atleta'} src={form.avatar} className="w-24 h-24 border-2 border-rolo-gold text-2xl group-hover:opacity-60 transition-opacity" />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" aria-hidden="true" />
                    </span>
                  </button>
                  {form.avatar && (
                    <button type="button" onClick={() => setForm({ ...form, avatar: '' })} className="text-xs text-rolo-text-muted underline">Quitar foto</button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={onImage} accept="image/*" className="hidden" aria-label="Subir foto" />
                </div>

                <div>
                  <label htmlFor="p-name" className={labelClass}>Nombre completo</label>
                  <input id="p-name" type="text" value={form.name} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="p-belt" className={labelClass}>Cinturón</label>
                    <select id="p-belt" value={form.belt} onChange={(e) => setForm({ ...form, belt: e.target.value as Belt })} className={fieldClass}>
                      {BELTS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-deg" className={labelClass}>Grados</label>
                    <select id="p-deg" value={form.degree} onChange={(e) => setForm({ ...form, degree: parseInt(e.target.value, 10) })} className={fieldClass}>
                      {[0, 1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} {d === 1 ? 'grado' : 'grados'}</option>)}
                    </select>
                  </div>
                </div>
                {form.belt !== profile.belt && (
                  <p className="text-xs text-rolo-text-muted -mt-2">Al cambiar de cinturón, el conteo de sesiones del nuevo cinturón empieza hoy.</p>
                )}
              </div>

              {error && <p role="alert" className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2 mt-6">{error}</p>}

              <button type="submit" disabled={saving}
                className="w-full bg-rolo-gold hover:bg-rolo-gold-hover disabled:opacity-60 text-rolo-bg font-bold py-4 rounded-xl mt-8 transition-colors">
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
