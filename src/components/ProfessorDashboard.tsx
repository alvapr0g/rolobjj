import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, CheckCircle2, ChevronRight, Check, Tag, Bot, Bell, Download } from 'lucide-react';
import { useAppContext } from '../context';

interface AlertLog {
  id: string;
  date: string;
  studentName: string;
  message: string;
}

export function ProfessorDashboard() {
  const { techniques, students, validateTechniqueForStudents, userProfile } = useAppContext();
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState('Clase');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/alert-logs');
        if (res.ok) {
          const data = await res.json();
          setAlertLogs(data);
        }
      } catch (e) {
        console.error("Error fetching alert logs:", e);
      }
    };
    
    fetchLogs();
  }, [step, isTestingAlert]);

  const handleTestAlert = async () => {
    setIsTestingAlert(true);
    try {
      const response = await fetch('/api/test-telegram-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName: userProfile.name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar alerta de prueba');
      }
      alert('Alerta enviada exitosamente: ' + data.analysis);
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + e.message);
    } finally {
      setIsTestingAlert(false);
    }
  };

  const filteredTechniques = techniques.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleAttendee = (id: string) => {
    setAttendees(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleValidate = () => {
    if (selectedTech && attendees.size > 0) {
      validateTechniqueForStudents(Array.from(attendees), selectedTech);
      setStep(3);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSearchQuery('');
    setSelectedTech(null);
    setAttendees(new Set());
  };

  return (
    <div className="w-full mx-auto h-full flex flex-col bg-rolo-bg relative">
      {/* Header */}
      <header className="px-6 py-5 border-b border-white/5 shrink-0 bg-rolo-surface/30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Panel del Profesor</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleTestAlert}
              disabled={isTestingAlert}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              <Bot className="w-3.5 h-3.5" />
              {isTestingAlert ? 'Enviando...' : 'Test Alerta'}
            </button>
            <div className="flex items-center gap-2 w-24">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-rolo-gold' : 'bg-rolo-surface'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative w-full p-6 pb-40">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CREATE CLASS */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <section>
                  <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-4">1. Tipo de Sesión</h2>
                  <div className="flex flex-wrap md:flex-nowrap gap-3">
                    {['Clase', 'Seminario', 'Open Mat'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSessionType(type)}
                        className={`flex-1 min-w-[120px] py-4 px-4 rounded-xl text-sm font-bold transition-all ${
                          sessionType === type 
                            ? 'bg-rolo-gold text-rolo-bg shadow-lg shadow-rolo-gold/20' 
                            : 'bg-rolo-surface text-rolo-text hover:bg-rolo-surface-hover'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="flex-1">
                  <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-4">2. Técnica Central del Día</h2>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rolo-text-muted" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o etiqueta..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-rolo-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-base focus:outline-none focus:border-rolo-gold/50 transition-colors placeholder:text-rolo-text-muted/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTechniques.map(tech => (
                      <button
                        key={tech.id}
                        onClick={() => setSelectedTech(tech.id)}
                        className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                          selectedTech === tech.id 
                            ? 'bg-rolo-gold-dim border-rolo-gold' 
                            : 'bg-rolo-surface border-transparent hover:bg-rolo-surface-hover'
                        }`}
                      >
                        <span className="font-semibold text-white mb-3 text-lg">{tech.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {tech.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium bg-black/30 text-rolo-text-muted px-2 py-1 rounded-md">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Alert Logs */}
                <section className="mt-6 border-t border-white/5 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-rolo-gold" />
                      <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider">Log de Alertas Telegram</h2>
                    </div>
                    {alertLogs.length > 0 && (
                      <button
                        onClick={() => {
                          const headers = "Fecha,Estudiante,Mensaje\n";
                          const rows = alertLogs.map(log => `"${new Date(log.date).toLocaleString()}","${log.studentName}","${log.message.replace(/"/g, '""')}"`).join("\n");
                          const csv = headers + rows;
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute("download", `alert_logs_${new Date().toISOString().split('T')[0]}.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-rolo-surface text-rolo-text border border-white/10 rounded-lg hover:bg-rolo-surface-hover transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar CSV
                      </button>
                    )}
                  </div>
                  {alertLogs.length === 0 ? (
                    <p className="text-sm text-rolo-text-muted/60">No se han enviado alertas recientes.</p>
                  ) : (
                    <div className="space-y-3">
                      {alertLogs.map(log => (
                        <div key={log.id} className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs text-rolo-text-muted mb-1">
                            <span className="font-semibold text-white">{log.studentName}</span>
                            <span>{new Date(log.date).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-rolo-text leading-relaxed">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* STEP 2: ATTENDANCE & VALIDATION */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8 p-5 bg-rolo-surface rounded-2xl border border-white/5">
                  <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-2">Técnica Seleccionada</h2>
                  <p className="text-2xl font-bold text-rolo-gold">{techniques.find(t => t.id === selectedTech)?.name}</p>
                </div>

                <h2 className="text-sm font-medium text-rolo-text-muted uppercase tracking-wider mb-4">Asistencia & Validación Masiva</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map(student => {
                    const isPresent = attendees.has(student.id);
                    return (
                      <button
                        key={student.id}
                        onClick={() => toggleAttendee(student.id)}
                        className={`w-full flex items-center p-4 rounded-2xl transition-all border ${
                          isPresent 
                            ? 'bg-rolo-surface border-rolo-gold/30 shadow-md shadow-rolo-gold/5' 
                            : 'bg-rolo-surface/50 border-transparent hover:bg-rolo-surface'
                        }`}
                      >
                        <img src={student.avatar} alt={student.name} className="w-14 h-14 rounded-full bg-black/50" />
                        <div className="ml-4 text-left flex-1">
                          <p className={`font-bold text-lg ${isPresent ? 'text-white' : 'text-rolo-text'}`}>{student.name}</p>
                          <p className="text-sm text-rolo-text-muted mt-0.5">Cinturón {student.belt}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isPresent ? 'bg-rolo-gold border-rolo-gold text-rolo-bg' : 'border-white/20'
                        }`}>
                          {isPresent && <Check className="w-5 h-5" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center pt-12"
              >
                <div className="w-28 h-28 bg-rolo-gold/10 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-16 h-16 text-rolo-gold" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Clase Registrada</h2>
                <p className="text-rolo-text-muted mb-10 text-lg max-w-md mx-auto">
                  Has marcado la asistencia de <strong className="text-white">{attendees.size} alumnos</strong> y validado la técnica en sus bitácoras.
                </p>
                
                <div className="w-full max-w-md mx-auto bg-rolo-surface rounded-2xl p-6 mb-8 text-left border border-white/5">
                  <p className="text-xs text-rolo-text-muted uppercase tracking-wider mb-2">Resumen de la sesión</p>
                  <p className="font-bold text-white text-xl mb-6">{techniques.find(t => t.id === selectedTech)?.name}</p>
                  
                  <p className="text-xs text-rolo-text-muted uppercase tracking-wider mb-3">Alumnos validados</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(attendees).map(id => {
                      const student = students.find(s => s.id === id);
                      return student ? (
                        <div key={id} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                          <img src={student.avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                          <span className="text-xs font-medium text-white">{student.name.split(' ')[0]}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-rolo-bg via-rolo-bg to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {step === 1 && (
            <button 
              disabled={!selectedTech}
              onClick={() => setStep(2)}
              className="w-full bg-rolo-gold disabled:bg-rolo-surface disabled:text-rolo-text-muted text-rolo-bg font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(230,192,92,0.15)] hover:shadow-[0_4px_25px_rgba(230,192,92,0.25)] disabled:shadow-none hover:scale-[1.01]"
            >
              Siguiente Paso
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {step === 2 && (
            <button 
              disabled={attendees.size === 0}
              onClick={handleValidate}
              className="w-full bg-rolo-gold disabled:bg-rolo-surface disabled:text-rolo-text-muted text-rolo-bg font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(230,192,92,0.15)] hover:shadow-[0_4px_25px_rgba(230,192,92,0.25)] disabled:shadow-none hover:scale-[1.01]"
            >
              Validar Técnica ({attendees.size})
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
          {step === 3 && (
            <button 
              onClick={resetFlow}
              className="w-full bg-rolo-surface text-white font-bold py-5 rounded-2xl transition-all hover:bg-rolo-surface-hover hover:scale-[1.01]"
            >
              Registrar Nueva Clase
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
