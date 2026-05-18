// frontend/src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Volume2, BrainCircuit, SlidersHorizontal } from 'lucide-react';

export default function Settings() {
  // 1. Theme State (Reads from localStorage)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('docurion_theme') !== 'light';
  });

  // 2. Placeholder States
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);

  // 3. AI Complexity State (Default to 1: Simplest)
  const [complexity, setComplexity] = useState(() => {
    return parseInt(localStorage.getItem('docurion_ai_complexity') || '1', 10);
  });

  // Handle Theme Switching Globally
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docurion_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docurion_theme', 'light');
    }
  }, [isDark]);

  // Handle Slider Change
  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setComplexity(val);
    localStorage.setItem('docurion_ai_complexity', val.toString());
  };

  const complexityLabels = [
    "Executive Summary (Extremely short & simple)",
    "High-Level Overview (Brief but covers main points)",
    "Standard Documentation (Balanced detail)",
    "Technical Specs (Comprehensive & detailed)",
    "Staff-Engineer Deep Dive (Exhaustive & lengthy)"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="mb-10 border-b border-[var(--border-color)] pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-brand-500" />
          Preferences
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Manage your workspace appearance and AI generation rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: App Preferences */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-zinc-400" /> Interface
          </h3>
          
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 space-y-6 shadow-sm">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs text-[var(--text-muted)]">Toggle application theme</p>
                </div>
              </div>
              <button onClick={() => setIsDark(!isDark)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${isDark ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Alerts for generation completion</p>
                </div>
              </div>
              <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${notifications ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-xs text-[var(--text-muted)]">Haptic audio feedback</p>
                </div>
              </div>
              <button onClick={() => setSounds(!sounds)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${sounds ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${sounds ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: AI Brain Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-500" /> AI Engine Configuration
          </h3>
          
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <p className="font-medium">Output Complexity & Length</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Control how deeply the AI analyzes the code and how long the generated documents will be.
              </p>
            </div>

            {/* The Slider */}
            <div className="relative mb-8">
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={complexity} 
                onChange={handleComplexityChange}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all"
              />
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mt-3 px-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            {/* Dynamic Label Display */}
            <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg">
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Current Level {complexity}</p>
              <p className="text-sm font-medium">{complexityLabels[complexity - 1]}</p>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}