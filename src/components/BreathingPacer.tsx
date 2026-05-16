import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
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
  const [cycleCount, setCycleCount] = useState(0);

  const t = translations[lang];

  const stateRef = useRef({ phase, timeRemaining, cycleCount });
  stateRef.current = { phase, timeRemaining, cycleCount };

  useEffect(() => {
    if (!isRunning) {
      setPhase('Inhale');
      setTimeRemaining(inhale);
      setCycleCount(0);
      return;
    }

    const timer = setInterval(() => {
      const { phase: currentPhase, timeRemaining: currentRemaining } = stateRef.current;

      if (currentRemaining <= 1) {
        let nextPhase: Phase = 'Inhale';
        let nextTime = inhale;
        let completeCycle = false;

        if (currentPhase === 'Inhale') {
          if (pauseAfterInhale > 0) {
            nextPhase = 'Hold (Full)';
            nextTime = pauseAfterInhale;
          } else {
            nextPhase = 'Exhale';
            nextTime = exhale;
          }
        } else if (currentPhase === 'Hold (Full)') {
          nextPhase = 'Exhale';
          nextTime = exhale;
        } else if (currentPhase === 'Exhale') {
          if (pauseAfterExhale > 0) {
            nextPhase = 'Pause (Empty)';
            nextTime = pauseAfterExhale;
          } else {
            completeCycle = true;
            nextPhase = 'Inhale';
            nextTime = inhale;
          }
        } else if (currentPhase === 'Pause (Empty)') {
          completeCycle = true;
          nextPhase = 'Inhale';
          nextTime = inhale;
        }

        if (completeCycle) {
          onCycleComplete?.();
          setCycleCount(c => c + 1);
        }
        setPhase(nextPhase);
        setTimeRemaining(nextTime);
      } else {
        setTimeRemaining(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, inhale, pauseAfterInhale, exhale, pauseAfterExhale, onCycleComplete]);

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

  // Target S value for animation (continuous progress along the triangle perimeter)
  // S = 0 -> V0, S = 1 -> V1, S = 2 -> V2, S = 3 -> V0
  const getTargetS = () => {
    if (!isRunning) return 0;
    
    let base = 0;
    const p = pauseAfterExhale || 1;

    if (phase === 'Inhale') {
      base = 1 - ((timeRemaining - 1) / (inhale || 1));
    } else if (phase === 'Hold (Full)') {
      base = 1;
    } else if (phase === 'Exhale') {
      base = 1 + (1 - ((timeRemaining - 1) / (exhale || 1)));
    } else if (phase === 'Pause (Empty)') {
      base = 2 + (1 - ((timeRemaining - 1) / p));
    }
    return cycleCount * 3 + base;
  };

  const currentS = getTargetS();
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!isRunning) {
      progress.set(0);
    } else {
      animate(progress, currentS, {
        duration: 1.05,
        ease: "linear",
      });
    }
  }, [currentS, isRunning, progress]);

  const V0 = { x: 8.43, y: 74 };
  const V1 = { x: 50, y: 2 };
  const V2 = { x: 91.57, y: 74 };

  const computePosition = (s: number) => {
    const modS = ((s % 3) + 3) % 3;
    if (modS <= 1) {
      const pInner = modS;
      return { x: V0.x + (V1.x - V0.x) * pInner, y: V0.y + (V1.y - V0.y) * pInner };
    } else if (modS <= 2) {
      const pInner = modS - 1;
      return { x: V1.x + (V2.x - V1.x) * pInner, y: V1.y + (V2.y - V1.y) * pInner };
    } else {
      const pInner = modS - 2;
      return { x: V2.x + (V0.x - V2.x) * pInner, y: V2.y + (V0.y - V2.y) * pInner };
    }
  };

  const dotX = useTransform(progress, (s) => computePosition(s).x);
  const dotY = useTransform(progress, (s) => computePosition(s).y);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-8 h-64 sm:h-80">
      <div className="relative flex items-center justify-center w-[240px] h-[240px] sm:w-[320px] sm:h-[320px]">
        {/* Breathing Clock SVG */}
        <svg className="absolute w-full h-full inset-0 pointer-events-none overflow-visible z-20" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Triangle */}
          <polygon points={`${V0.x},${V0.y} ${V1.x},${V1.y} ${V2.x},${V2.y}`} fill="none" className="stroke-white/5" strokeWidth="0.5" strokeLinejoin="round" />
          
          {/* Phase Segments */}
          <line x1={V0.x} y1={V0.y} x2={V1.x} y2={V1.y} className="stroke-teal-500/40" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={V1.x} y1={V1.y} x2={V2.x} y2={V2.y} className="stroke-indigo-500/30" strokeWidth="2" strokeLinecap="round" />
          
          {pauseAfterExhale > 0 ? (
            <line x1={V2.x} y1={V2.y} x2={V0.x} y2={V0.y} className="stroke-red-500/20" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <line x1={V2.x} y1={V2.y} x2={V0.x} y2={V0.y} className="stroke-white/10" strokeWidth="1.5" strokeLinecap="round" />
          )}

          {/* Orbiting Dot - Syncs with continuous progress */}
          <motion.circle 
            cx={dotX} 
            cy={dotY} 
            r="3.5" 
            fill="url(#dotGlow)" 
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
          <motion.circle 
            cx={dotX} 
            cy={dotY} 
            r="6" 
            className="fill-teal-400/20"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>

        {/* Glowing Core */}
        <motion.div
          animate={phase}
          variants={circleVariants}
          transition={getTransition()}
          className="relative w-28 h-28 rounded-full bg-gradient-to-b from-teal-500/10 to-transparent flex flex-col items-center justify-center border border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.15)] z-10"
        >
          <span className="text-[8px] uppercase tracking-[0.3em] text-teal-400 font-bold mb-1 opacity-80">
            {phase === 'Inhale' || phase === 'Hold (Full)' ? t.pacer.expansion : t.pacer.reduction}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={phase + timeRemaining}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-4xl font-thin tracking-tighter text-white"
            >
              {timeRemaining}
            </motion.span>
          </AnimatePresence>
          <span className="text-[8px] uppercase tracking-widest text-slate-500 mt-1">{t.pacer.seconds}</span>
        </motion.div>

        {/* Indicators */}
        <div className="absolute top-0 flex flex-col items-center">
          <motion.div 
            animate={{ height: phase === 'Inhale' ? 40 : 20, opacity: phase === 'Inhale' ? 1 : 0.2 }}
            className="w-px bg-gradient-to-b from-teal-400 to-transparent transition-all duration-500" 
          />
          <span className={`text-[8px] uppercase tracking-[0.3em] font-bold mt-1 transition-colors duration-500 ${phase === 'Inhale' ? 'text-teal-400' : 'text-slate-600'}`}>{t.inhale}</span>
        </div>
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-[8px] uppercase tracking-[0.3em] font-bold mb-1 transition-colors duration-500 ${phase === 'Exhale' ? 'text-teal-400' : 'text-slate-600'}`}>{t.exhale}</span>
          <motion.div 
            animate={{ height: phase === 'Exhale' ? 40 : 20, opacity: phase === 'Exhale' ? 1 : 0.2 }}
            className="w-px bg-gradient-to-t from-white/20 to-transparent transition-all duration-500" 
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-light tracking-[0.2em] text-slate-300 uppercase">
          {phase === 'Pause (Empty)' ? t.controlPause : phase === 'Inhale' ? t.inhale : phase === 'Exhale' ? t.exhale : t.pause}
        </h3>
      </div>
    </div>
  );

}
