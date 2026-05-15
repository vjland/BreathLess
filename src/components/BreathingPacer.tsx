import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Language, translations } from '../translations';

interface BreathingPacerProps {
  inhale: number;
  pauseAfterInhale: number;
  exhale: number;
  pauseAfterExhale: number;
  onCycleComplete?: () => void;
  isRunning: boolean;
  lang: Language;
}

type Phase = 'Inhale' | 'Hold (Full)' | 'Exhale' | 'Pause (Empty)';

export default function BreathingPacer({
  inhale,
  pauseAfterInhale,
  exhale,
  pauseAfterExhale,
  onCycleComplete,
  isRunning,
  lang,
}: BreathingPacerProps) {
  const [phase, setPhase] = useState<Phase>('Inhale');
  const [timeRemaining, setTimeRemaining] = useState(inhale);

  const t = translations[lang];

  useEffect(() => {
    if (!isRunning) {
      setPhase('Inhale');
      setTimeRemaining(inhale);
      return;
    }

    let timer: number;
    
    const runPhase = () => {
      timer = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            transitionPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const transitionPhase = () => {
      setPhase((current) => {
        switch (current) {
          case 'Inhale':
            if (pauseAfterInhale > 0) {
              setTimeRemaining(pauseAfterInhale);
              return 'Hold (Full)';
            }
            setTimeRemaining(exhale);
            return 'Exhale';
          case 'Hold (Full)':
            setTimeRemaining(exhale);
            return 'Exhale';
          case 'Exhale':
            if (pauseAfterExhale > 0) {
              setTimeRemaining(pauseAfterExhale);
              return 'Pause (Empty)';
            }
            onCycleComplete?.();
            setTimeRemaining(inhale);
            return 'Inhale';
          case 'Pause (Empty)':
            onCycleComplete?.();
            setTimeRemaining(inhale);
            return 'Inhale';
          default:
            return 'Inhale';
        }
      });
    };

    runPhase();

    return () => clearInterval(timer);
  }, [isRunning, phase, inhale, pauseAfterInhale, exhale, pauseAfterExhale, onCycleComplete]);

  const circleVariants = {
    Inhale: { scale: 1.2, opacity: 1 },
    'Hold (Full)': { scale: 1.2, opacity: 0.8 },
    Exhale: { scale: 0.8, opacity: 0.6 },
    'Pause (Empty)': { scale: 0.8, opacity: 0.4 },
  };

  const getTransition = () => {
    switch (phase) {
      case 'Inhale': return { duration: inhale, ease: "easeInOut" };
      case 'Exhale': return { duration: exhale, ease: "easeInOut" };
      default: return { duration: 0.5 };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 h-80">
      <div className="relative flex items-center justify-center w-[300px] h-[300px]">
        {/* Outer Rings */}
        <div className="absolute inset-0 border-[1px] border-white/5 rounded-full" />
        <motion.div 
          animate={{ scale: isRunning ? 1 : 0.95, opacity: isRunning ? 1 : 0.5 }}
          className="absolute inset-8 border-[1px] border-white/10 rounded-full" 
        />
        
        {/* Glowing Core */}
        <motion.div
          animate={phase}
          variants={circleVariants}
          transition={getTransition()}
          className="w-48 h-48 rounded-full bg-gradient-to-b from-teal-500/10 to-transparent flex flex-col items-center justify-center backdrop-blur-xl border border-teal-500/20 shadow-[0_0_80px_rgba(20,184,166,0.15)] z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-bold mb-1 opacity-80">
            {phase === 'Inhale' || phase === 'Hold (Full)' ? t.pacer.expansion : t.pacer.reduction}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={phase + timeRemaining}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-7xl font-thin tracking-tighter text-white"
            >
              {timeRemaining}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{t.pacer.seconds}</span>
        </motion.div>

        {/* Indicators */}
        <div className="absolute top-0 flex flex-col items-center">
          <motion.div 
            animate={{ height: phase === 'Inhale' ? 48 : 24, opacity: phase === 'Inhale' ? 1 : 0.2 }}
            className="w-px bg-gradient-to-b from-teal-400 to-transparent transition-all" 
          />
          <span className={`text-[8px] uppercase tracking-[0.3em] font-bold mt-2 ${phase === 'Inhale' ? 'text-teal-400' : 'text-slate-600'}`}>{t.inhale}</span>
        </div>
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-[8px] uppercase tracking-[0.3em] font-bold mb-2 ${phase === 'Exhale' ? 'text-teal-400' : 'text-slate-600'}`}>{t.exhale}</span>
          <motion.div 
            animate={{ height: phase === 'Exhale' ? 48 : 24, opacity: phase === 'Exhale' ? 1 : 0.2 }}
            className="w-px bg-gradient-to-t from-white/20 to-transparent transition-all" 
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-light tracking-[0.2em] text-slate-300 uppercase">
          {phase === 'Pause (Empty)' ? t.controlPause : phase === 'Inhale' ? t.inhale : phase === 'Exhale' ? t.exhale : t.pause}
        </h3>
      </div>
    </div>
  );

}
