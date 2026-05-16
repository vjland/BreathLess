import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Info, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ControlPauseTimerProps {
  onComplete?: (seconds: number) => void;
  lang: Language;
}

interface CPRecord {
  id: string;
  score: number;
  date: string;
}

enum Tab {
  Timer,
  History
}

export default function ControlPauseTimer({ onComplete, lang }: ControlPauseTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Timer);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [records, setRecords] = useState<CPRecord[]>(() => {
    const saved = localStorage.getItem('breathflow_cp_records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const timerRef = useRef<number | null>(null);

  const t = translations[lang] as any;

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setLastResult(seconds);
      
      const newRecord: CPRecord = {
        id: Math.random().toString(36).substring(2, 9),
        score: Math.max(1, seconds), // don't log 0s if they instantly clicked
        date: new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      const newRecords = [newRecord, ...records];
      setRecords(newRecords);
      localStorage.setItem('breathflow_cp_records', JSON.stringify(newRecords));
      
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

  const highestCP = records.length > 0 ? Math.max(...records.map(r => r.score)) : 0;
  const chartData = [...records].reverse();

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] p-6 sm:p-10 border border-white/5 shadow-2xl max-w-md w-full mx-auto relative overflow-hidden flex flex-col min-h-[400px]">
      <div className="flex justify-between items-start mb-6 relative z-10 w-full">
        <div>
          <h2 className="text-xs font-black text-teal-400 uppercase tracking-[0.3em]">{t.diagnostics}</h2>
          <h3 className="text-xl sm:text-2xl font-light text-slate-100 mt-1">{t.controlPause}</h3>
        </div>
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
          <button 
            onClick={() => setActiveTab(Tab.Timer)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors ${activeTab === Tab.Timer ? 'bg-teal-500 text-[#05070a]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t.controlPause}
          </button>
          <button 
            onClick={() => setActiveTab(Tab.History)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors ${activeTab === Tab.History ? 'bg-teal-500 text-[#05070a]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t.pastRecords || 'History'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === Tab.Timer ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col relative z-10"
          >
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 transition-colors ${showInfo ? 'text-teal-400' : 'text-slate-600 hover:text-teal-400'}`}
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
                    {t.protocolSteps.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center flex-1 justify-center py-2">
              <div className="text-7xl sm:text-9xl font-thin tabular-nums text-white tracking-tighter mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
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

            <AnimatePresence>
              {lastResult !== null && !isRunning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="p-5 bg-teal-500/5 border border-teal-500/10 rounded-3xl flex items-center space-x-4">
                    <CheckCircle2 className="text-teal-400" size={24} />
                    <div>
                      <p className="text-xs font-black text-teal-400 uppercase tracking-widest">{t.assessment}: {lastResult}s</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">
                        {lastResult! < 20 ? t.foundation : lastResult! < 40 ? t.advancedTransition : t.eliteHomeostasis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col relative z-10"
          >
            {records.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No records yet.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-teal-400">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.highestCP}</span>
                  </div>
                  <span className="text-2xl font-light text-white">{highestCP}s</span>
                </div>
                
                {records.length > 1 && (
                  <div className="h-48 w-full bg-white/[0.02] border border-white/5 rounded-3xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#05070a', borderColor: 'rgba(20,184,166,0.2)', borderRadius: '12px' }}
                          itemStyle={{ color: '#2dd4bf' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#2dd4bf" 
                          strokeWidth={2} 
                          dot={{ fill: '#05070a', stroke: '#2dd4bf', strokeWidth: 2, r: 4 }} 
                          activeDot={{ r: 6, fill: '#2dd4bf' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-64">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.pastRecords}</p>
                  {records.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400">{r.date}</span>
                      <span className="text-base font-medium text-slate-200">{r.score}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative inner light */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/5 blur-3xl rounded-full" />
    </div>
  );
}
