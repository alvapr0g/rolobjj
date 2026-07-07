import React, { useState } from 'react';
import { Download, Bot } from 'lucide-react';
import { useAppContext } from '../context';
import { Belt } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export function ProgressView() {
  const { userProfile, techniques, studentValidations } = useAppContext();

  const beltData: Record<Belt, { bg: string, label: string, hex: string }> = {
    'Blanco': { bg: 'bg-[#F3F4F6]', label: 'Cinturón blanco', hex: '#F3F4F6' },
    'Azul': { bg: 'bg-[#2D6CB4]', label: 'Cinturón azul', hex: '#2D6CB4' },
    'Morado': { bg: 'bg-[#734098]', label: 'Cinturón morado', hex: '#734098' },
    'Marrón': { bg: 'bg-[#664228]', label: 'Cinturón marrón', hex: '#664228' },
    'Negro': { bg: 'bg-[#1A1A1A]', label: 'Cinturón negro', hex: '#1A1A1A' },
  };

  const currentBelt = beltData[userProfile.belt] || beltData['Azul'];
  
  const beltSequence: Belt[] = ['Blanco', 'Azul', 'Morado', 'Marrón', 'Negro'];
  const currentIndex = beltSequence.indexOf(userProfile.belt);
  const nextBelt = currentIndex < beltSequence.length - 1 ? beltData[beltSequence[currentIndex + 1]] : null;

  // Calculate real progress
  const userValidations = studentValidations['s1'] || {};
  const totalTechniques = Math.max(techniques.length, 28); // Fallback to 28 if techniques array is small/empty
  const validatedTechniques = techniques.filter(tech => userValidations[tech.id] === 'Validada por instructor').length || 18; // Fallback to 18
  
  const sessionsCompleted = 128;
  const sessionsRequired = 120;
  
  const sessionProgress = Math.min(sessionsCompleted / sessionsRequired, 1);
  const techProgress = Math.min(validatedTechniques / totalTechniques, 1);
  
  // Weight: Sessions 40%, Techniques 60%
  const totalProgress = nextBelt ? Math.round((sessionProgress * 0.4 + techProgress * 0.6) * 100) : 100;

  const chartData = [
    { name: 'Completado', value: totalProgress },
    { name: 'Restante', value: 100 - totalProgress }
  ];
  const COLORS = ['#E6C05C', 'rgba(255,255,255,0.05)'];

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{text: string, alertSent: boolean} | null>(null);

  const handleAnalyzeProgress = async (simulateDrop: boolean = false) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      if (simulateDrop) {
        const response = await fetch('/api/test-telegram-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentName: userProfile.name }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al simular alerta');
        }
        setAnalysisResult({
          text: data.analysis,
          alertSent: data.alertSent
        });
      } else {
        const studentData = {
          name: userProfile.name,
          belt: userProfile.belt,
          degree: userProfile.degree,
          sessionsCompleted: 128,
          sessionsRequired: 120,
          validatedTechniques: validatedTechniques,
          totalTechniques: totalTechniques,
          progress: totalProgress
        };
        
        const response = await fetch('/api/analyze-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentData }),
        });
        
        if (!response.ok) {
          throw new Error('Error al analizar');
        }
        
        const data = await response.json();
        setAnalysisResult({
          text: data.analysis,
          alertSent: data.alertSent
        });
      }
    } catch (e: any) {
      console.error(e);
      setAnalysisResult({
        text: e.message || "Error al realizar el análisis. Asegúrate de configurar GEMINI_API_KEY y las variables de Telegram.",
        alertSent: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    // Generate report content
    let content = `====================================================\n`;
    content += `             REPORTE DE PROGRESO - ROLO\n`;
    content += `====================================================\n\n`;
    content += `ATLETA: ${userProfile.name}\n`;
    content += `GRADO ACTUAL: ${currentBelt.label} · ${userProfile.degree}° grado\n`;
    content += `OBJETIVO: ${nextBelt ? nextBelt.label : 'Máximo alcanzado'}\n\n`;
    
    content += `----------------------------------------------------\n`;
    content += `               HITOS DE PROGRESIÓN\n`;
    content += `----------------------------------------------------\n`;
    content += `[X] 120 sesiones registradas (128/120)\n`;
    content += `[-] Checklist técnico (18/28)\n`;
    content += `[ ] Validación de instructor jefe\n\n`;

    content += `----------------------------------------------------\n`;
    content += `            TÉCNICAS VALIDADAS RECIENTES\n`;
    content += `----------------------------------------------------\n`;
    
    // Hardcoding 's1' as it's the current user's ID mock in context
    const userValidations = studentValidations['s1'] || {};
    let hasValidations = false;
    
    techniques.forEach(tech => {
      const status = userValidations[tech.id];
      if (status === 'Validada por instructor') {
        hasValidations = true;
        content += `- ${tech.name} (Validada)\n`;
      } else if (status === 'Pendiente') {
        content += `- ${tech.name} (Pendiente)\n`;
      }
    });

    if (!hasValidations) {
      content += `Aún no hay técnicas validadas.\n`;
    }

    content += `\n====================================================\n`;
    content += `           ROLO - Registra. Aprende. Progresa.\n`;
    content += `====================================================\n`;

    // Trigger download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Progreso_${userProfile.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-32 md:pb-12 p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center mt-4 mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progreso</h1>
        <button 
          onClick={handleDownloadReport}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-white/5"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Descargar Reporte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* Current Belt */}
          <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
            <div className={`h-14 ${currentBelt.bg} rounded-xl mb-5 flex relative overflow-hidden`}>
               {/* Belt detail simulation */}
               <div className="absolute right-8 top-0 bottom-0 w-20 bg-[#1A1A1A] flex justify-center gap-1.5 px-2">
                 {Array.from({ length: userProfile.degree }).map((_, i) => (
                   <div key={i} className="w-3 bg-white h-full"></div>
                 ))}
               </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">{currentBelt.label} {userProfile.degree > 0 ? `· ${userProfile.degree}° grado` : ''}</h3>
            <p className="text-[13px] text-rolo-text-muted">En este cinturón: 1 año y 4 meses</p>
          </div>

          {/* Belt Path */}
          <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
            <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em] mb-5">Camino de cinturones</h2>
            <div className="flex justify-between items-center mb-4 px-2">
              {beltSequence.map((belt, idx) => {
                const bData = beltData[belt];
                if (idx < currentIndex) {
                  return <div key={belt} className={`w-10 h-10 rounded-full ${bData.bg} flex items-center justify-center ${belt === 'Blanco' ? 'text-[#071711]' : 'text-white'} font-bold text-xs shadow-lg`}>✓</div>;
                } else if (idx === currentIndex) {
                  return <div key={belt} className={`w-10 h-10 rounded-full ${bData.bg} border-[2px] border-rolo-gold ring-4 ring-rolo-gold/20 shadow-lg`}></div>;
                } else {
                  return <div key={belt} className={`w-10 h-10 rounded-full ${bData.bg} ${belt === 'Negro' ? 'border border-white/20' : ''} opacity-50`}></div>;
                }
              })}
            </div>
            <p className="text-[11px] text-rolo-text-muted text-center leading-relaxed">
              {beltSequence.map((belt, idx) => {
                if (idx < currentIndex) return `${belt} ✓`;
                if (idx === currentIndex) return `${belt} (actual)`;
                return belt;
              }).join(' · ')}
            </p>
          </div>
        </div>

        {/* Progress to next belt */}
        <div className="bg-rolo-surface rounded-[24px] p-5 border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-bold text-rolo-text-muted uppercase tracking-[0.15em]">
              {nextBelt ? `Hacia ${nextBelt.label.toLowerCase()}` : 'Cinturón máximo alcanzado'}
            </h2>
            <span className="text-[15px] font-bold text-rolo-gold">{totalProgress}%</span>
          </div>
          
          <div className="flex mb-8 justify-center lg:justify-start h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex flex-col gap-4 text-[13px] text-white">
            <li className="flex items-center gap-3">
              <span className="text-rolo-gold font-bold text-sm">✓</span> 120 sesiones registradas (128/120)
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full border-[2px] border-rolo-gold flex items-center justify-center overflow-hidden shrink-0">
                 <div className="w-full h-full bg-rolo-gold rounded-full scale-50"></div>
              </span> 
              <span>Checklist técnico · {validatedTechniques} de {totalTechniques} <span className="text-rolo-text-muted ml-1">›</span></span>
            </li>
            <li className="flex items-center gap-3 text-rolo-text-muted">
              <span className="w-3.5 h-3.5 rounded-full border-[2px] border-rolo-text-muted shrink-0"></span>
              Validación de instructor
            </li>
          </ul>

          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-3">
            <button
              onClick={() => handleAnalyzeProgress(false)}
              disabled={isAnalyzing}
              className="w-full bg-rolo-surface/50 hover:bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-rolo-gold" />
              {isAnalyzing ? 'Analizando rendimiento...' : 'Análisis IA y Alertas'}
            </button>
            <button
              onClick={() => handleAnalyzeProgress(true)}
              disabled={isAnalyzing}
              className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-red-400" />
              {isAnalyzing ? 'Analizando...' : 'Simular Bajón de Rendimiento'}
            </button>
            
            {analysisResult && (
              <div className="mt-4 bg-black/20 rounded-xl p-4 border border-white/5 text-sm">
                <p className="text-white/90 leading-relaxed mb-3">{analysisResult.text}</p>
                {analysisResult.alertSent ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rolo-gold bg-rolo-gold/10 px-2.5 py-1 rounded-md">
                    ✓ Alerta enviada a Telegram
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rolo-text-muted bg-white/5 px-2.5 py-1 rounded-md">
                    Sin alertas críticas
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
