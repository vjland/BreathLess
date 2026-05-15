import { useState, useEffect } from 'react';
import { Wind, Moon, Zap, Activity, ChevronRight, BarChart3, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Session, SESSIONS, SessionGoal } from './types';
import SessionView from './components/SessionView';
import ControlPauseTimer from './components/ControlPauseTimer';
import { Language, translations } from './translations';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('breathflow_lang');
    return (saved as Language) || 'en';
  });

  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    localStorage.setItem('breathflow_lang', newLang);
  };
  const [customizedSessions, setCustomizedSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('breathflow_sessions');
    return saved ? JSON.parse(saved) : SESSIONS;
  });
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showCPTest, setShowCPTest] = useState(false);
  const [lastCP, setLastCP] = useState<number | null>(() => {
    const saved = localStorage.getItem('breathflow_lastcp');
    return saved ? parseInt(saved) : null;
  });

  const handleUpdateSession = (updatedSession: Session) => {
    const newSessions = customizedSessions.map(s => s.id === updatedSession.id ? updatedSession : s);
    setCustomizedSessions(newSessions);
    localStorage.setItem('breathflow_sessions', JSON.stringify(newSessions));
    
    if (activeSession && activeSession.id === updatedSession.id) {
      setActiveSession(updatedSession);
    }
  };

  const handleCPUpdate = (val: number) => {
    setLastCP(val);
    localStorage.setItem('breathflow_lastcp', val.toString());
  };

  const getIcon = (goal: SessionGoal) => {
    switch (goal) {
      case SessionGoal.STRESS: return <Wind className="text-blue-500" />;
      case SessionGoal.SLEEP: return <Moon className="text-indigo-500" />;
      case SessionGoal.FOCUS: return <Zap className="text-amber-500" />;
      case SessionGoal.GENERAL: return <Activity className="text-emerald-500" />;
    }
  };

  return (
    <div className="relative min-h-screen font-sans antialiased text-slate-100">
      <div className="atmosphere-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      
      <main className="container mx-auto px-10 py-8 max-w-6xl relative z-10">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full opacity-40 animate-pulse" />
            </div>
            <h1 className="text-xl font-light tracking-widest uppercase text-slate-100">
              {t.appName.split(/(?=[A-Z])|(?<=流)/).map((part, i) => (
                <span key={i} className={i === 1 ? "font-semibold text-teal-400" : ""}>{part}</span>
              ))}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLang}
              className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-2 rounded-full hover:bg-white/10 transition-all text-[10px] tracking-widest uppercase font-bold text-slate-400"
            >
              <Languages size={14} className="text-teal-400" />
              <span>{lang === 'en' ? '中文' : 'EN'}</span>
            </button>

            <button 
              onClick={() => setShowCPTest(!showCPTest)}
              className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all text-xs tracking-widest uppercase font-bold"
            >
              <BarChart3 size={14} className="text-teal-400" />
              <span className="text-slate-300">
                {lastCP ? `CP: ${lastCP}s` : t.measureCP}
              </span>
            </button>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-white/5">
               <Activity size={20} className="opacity-40" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSession ? (
            <motion.div
              key="session"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SessionView 
                session={activeSession} 
                onBack={() => setActiveSession(null)} 
                onUpdate={handleUpdateSession}
                lang={lang}
              />
            </motion.div>
          ) : showCPTest ? (
            <motion.div
              key="cp-test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-12"
            >
              <ControlPauseTimer 
                lang={lang}
                onComplete={(val) => {
                  handleCPUpdate(val);
                  setTimeout(() => setShowCPTest(false), 2000);
                }} 
              />
              <button 
                onClick={() => setShowCPTest(false)}
                className="mt-8 text-slate-500 hover:text-slate-300 underline text-xs tracking-widest uppercase"
              >
                {t.returnToSessions}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-16"
            >
              <section>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xs uppercase tracking-[0.4em] font-black text-teal-400/60">{t.trainingProtocols}</h2>
                  <div className="h-px w-24 bg-white/10 ml-6" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customizedSessions.map((session) => {
                    const sessionT = (t.sessions as any)[session.id] || { title: session.title, description: session.description };
                    const goalT = (t.goals as any)[session.goal.toUpperCase().replace(' ', '_')] || session.goal;

                    return (
                      <motion.button
                        key={session.id}
                        whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSession(session)}
                        className="group bg-white/5 backdrop-blur-sm p-8 rounded-[32px] border border-white/5 text-left transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          {getIcon(session.goal)}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest leading-none">
                              {goalT}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {session.durationMinutes} MIN
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-medium text-slate-100">{sessionT.title}</h3>
                          
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            {sessionT.description}
                          </p>
                          
                          <div className="pt-4 flex items-center text-[10px] font-bold text-teal-400/80 uppercase tracking-tighter">
                            <ChevronRight size={14} className="mr-1 group-hover:translate-x-1 transition-transform" />
                            {t.commence}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section className="relative p-12 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-light tracking-tight text-white leading-tight">
                      {lang === 'zh' ? '开启' : 'Master the Art of'} <span className="font-bold text-teal-400">{t.whyBreatheLess.split(' ').slice(-2).join(' ')}</span>
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm max-w-lg">
                      {t.whyDescription}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-4 bg-teal-400/10 rounded-2xl border border-teal-400/20 text-center min-w-[120px]">
                      <p className="text-xl font-bold text-teal-400 tracking-tighter">24s</p>
                      <p className="text-[10px] uppercase font-bold text-teal-600/60 leading-none mt-1">{t.averageCP}</p>
                    </div>
                    <div className="px-6 py-4 bg-blue-400/10 rounded-2xl border border-blue-400/20 text-center min-w-[120px]">
                      <p className="text-xl font-bold text-blue-400 tracking-tighter">12,4k</p>
                      <p className="text-[10px] uppercase font-bold text-blue-600/60 leading-none mt-1">{t.totalBreaths}</p>
                    </div>
                  </div>
                </div>
                {/* Subtle gradient light */}
                <div className="absolute top-0 right-0 w-[500px] h-full bg-teal-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-24 pb-12 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
            {t.copyright}
          </p>
          <div className="h-px w-8 bg-white/10 mx-auto mt-4" />
        </footer>
      </main>
    </div>
  );

}
