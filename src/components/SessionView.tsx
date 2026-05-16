import { ArrowLeft, Play, Clock, Activity, Settings2, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Session, SESSION_LIMITS, SESSIONS } from '../types';
import BreathingPacer from './BreathingPacer';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';

interface SessionViewProps {
  session: Session;
  onBack: () => void;
  onUpdate: (session: Session) => void;
  lang: Language;
}

export default function SessionView({ session, onBack, onUpdate, lang }: SessionViewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session.durationMinutes * 60);
  const [cycles, setCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[lang];
  const sessionT = (t.sessions as any)[session.id] || { title: session.title, description: session.description };
  const intensityT = (t.intensity as any)[session.intensity] || session.intensity;

  // Sync timer if duration changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(session.durationMinutes * 60);
    }
  }, [session.durationMinutes, isRunning]);

  useEffect(() => {
    let interval: number;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[85vh] flex flex-col pt-8 pb-12 px-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-teal-400 transition-colors group text-xs tracking-widest uppercase font-bold"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          {t.returnToProtocol}
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all text-[10px] uppercase tracking-widest font-bold ${
            showSettings ? 'bg-teal-500 text-[#05070a]' : 'bg-white/5 text-slate-400 hover:text-slate-100'
          }`}
        >
          <Settings2 size={14} />
          <span>{showSettings ? t.closeSetup : t.customSetup}</span>
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12 bg-white/[0.02] border border-white/5 rounded-[32px] p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{t.inhale} ({session.pattern.inhale}s)</label>
                  </div>
                  <input 
                    type="range" 
                    min={SESSION_LIMITS.MIN_BREATH} 
                    max={SESSION_LIMITS.MAX_BREATH} 
                    value={session.pattern.inhale}
                    onChange={(e) => onUpdate({ ...session, pattern: { ...session.pattern, inhale: parseInt(e.target.value) } })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{t.exhale} ({session.pattern.exhale}s)</label>
                  </div>
                  <input 
                    type="range" 
                    min={SESSION_LIMITS.MIN_BREATH} 
                    max={SESSION_LIMITS.MAX_BREATH} 
                    value={session.pattern.exhale}
                    onChange={(e) => onUpdate({ ...session, pattern: { ...session.pattern, exhale: parseInt(e.target.value) } })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{t.postExhalePause} ({session.pattern.pauseAfterExhale}s)</label>
                  </div>
                  <input 
                    type="range" 
                    min={SESSION_LIMITS.MIN_BREATH} 
                    max={SESSION_LIMITS.MAX_BREATH} 
                    value={session.pattern.pauseAfterExhale}
                    onChange={(e) => onUpdate({ ...session, pattern: { ...session.pattern, pauseAfterExhale: parseInt(e.target.value) } })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{t.sessionDuration} ({session.durationMinutes}m)</label>
                  </div>
                  <input 
                    type="range" 
                    min={SESSION_LIMITS.MIN_DURATION} 
                    max={SESSION_LIMITS.MAX_DURATION} 
                    value={session.durationMinutes}
                    onChange={(e) => onUpdate({ ...session, durationMinutes: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
               <button 
                onClick={() => {
                  const defaults = SESSIONS.find(s => s.id === session.id)!;
                  onUpdate(defaults);
                }}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-bold uppercase tracking-widest"
               >
                 <RotateCcw size={12} />
                 <span>{t.resetToDefaults}</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-light text-slate-100 mb-4 tracking-tight"
          >
            {sessionT.title}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-6 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            <span className="flex items-center">
              <Clock size={14} className="mr-2 text-teal-400" />
              {formatTime(timeLeft)}
            </span>
            <span className="flex items-center">
              <Activity size={14} className="mr-2 text-teal-400" />
              {intensityT}
            </span>
          </motion.div>
        </div>

        <BreathingPacer 
          {...session.pattern} 
          isRunning={isRunning}
          onCycleComplete={() => setCycles(c => c + 1)}
          lang={lang}
        />

        <div className="mt-16 flex flex-col items-center space-y-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-14 py-4 rounded-full text-sm font-black uppercase tracking-[0.3em] transition-all duration-500 transform active:scale-95 ${
              isRunning 
                ? 'bg-transparent text-slate-300 border border-white/20 hover:border-white/40' 
                : 'bg-teal-500 text-[#05070a] hover:bg-teal-400 shadow-[0_0_40px_rgba(20,184,166,0.3)]'
            }`}
          >
            {isRunning ? t.pause : t.commence}
          </button>

          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            {t.cyclesCompleted}: <span className="text-teal-400">{cycles}</span>
          </p>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(session.durationMinutes * 60);
              setCycles(0);
            }}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-bold uppercase tracking-widest pt-2"
          >
            <RotateCcw size={14} />
            <span>{t.restartSession}</span>
          </button>
        </div>

        <div className="mt-16 p-8 bg-white/[0.03] rounded-[32px] border border-white/5 max-w-lg w-full">
          <h4 className="font-bold text-teal-400 mb-3 text-[10px] uppercase tracking-[0.3em]">{t.protocolGuide}</h4>
          <p className="text-slate-400 text-sm leading-relaxed font-light">
            {sessionT.description} {lang === 'zh' ? '保持高度放松。仅用鼻子。目标是产生明显但可接受的减量感。' : 'Maintain high-level relaxation. Nasal only. Aim for a distinct but tolerable sense of air reduction.'}
          </p>
        </div>
      </div>
    </div>
  );
}
