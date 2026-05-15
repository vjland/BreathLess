import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';

interface ControlPauseTimerProps {
  onComplete?: (seconds: number) => void;
  lang: Language;
}

export default function ControlPauseTimer({ onComplete, lang }: ControlPauseTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const t = translations[lang];

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setLastResult(seconds);
      onComplete?.(seconds);
    } else {
      setSeconds(0);
      setIsRunning(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setSeconds(0);
    setLastResult(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl max-w-md w-full mx-auto relative overflow-hidden">
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em]">{t.diagnostics}</h2>
          <h3 className="text-2xl font-light text-slate-100 mt-1">{t.controlPause}</h3>
        </div>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-slate-600 hover:text-teal-400 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8 bg-teal-500/5 rounded-2xl p-5 text-[10px] text-teal-200/60 leading-loose tracking-wide border border-teal-500/10"
          >
            <strong className="text-teal-400 uppercase font-black tracking-widest block mb-2">{t.protocol}</strong>
            <ol className="list-decimal list-inside space-y-2">
              {t.protocolSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center py-4 relative z-10">
        <div className="text-9xl font-thin tabular-nums text-white tracking-tighter mb-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          {seconds}
        </div>

        <div className="flex space-x-6">
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
              isRunning 
                ? 'bg-transparent border-2 border-red-500/40 text-red-500' 
                : 'bg-teal-500 text-[#05070a] shadow-[0_0_50px_rgba(20,184,166,0.3)]'
            }`}
          >
            {isRunning ? <div className="w-5 h-5 bg-current rounded-sm" /> : <Play fill="currentColor" size={28} className="ml-1" />}
          </button>
          
          <button
            onClick={reset}
            className="w-20 h-20 rounded-full bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300 flex items-center justify-center transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {lastResult !== null && !isRunning && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-5 bg-teal-500/5 border border-teal-500/10 rounded-3xl flex items-center space-x-4"
        >
          <CheckCircle2 className="text-teal-400" size={24} />
          <div>
            <p className="text-xs font-black text-teal-400 uppercase tracking-widest">{t.assessment}: {lastResult}s</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">
              {lastResult! < 20 ? t.foundation : lastResult! < 40 ? t.advancedTransition : t.eliteHomeostasis}
            </p>
          </div>
        </motion.div>
      )}

      {/* Decorative inner light */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/5 blur-3xl rounded-full" />
    </div>
  );
}
