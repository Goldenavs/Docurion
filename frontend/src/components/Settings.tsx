// frontend/src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Volume2, BrainCircuit, SlidersHorizontal, Key, Database, User } from 'lucide-react';

const GithubIcon = () => (
  <svg className="w-5 h-5 text-brand-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function Settings() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('docurion_theme') !== 'light');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [complexity, setComplexity] = useState(() => parseInt(localStorage.getItem('docurion_ai_complexity') || '1', 10));

  // NEW: GitHub Integration State
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('docurion_gh_token') || '');
  const [ghOwner, setGhOwner] = useState(() => localStorage.getItem('docurion_gh_owner') || '');
  const [ghRepo, setGhRepo] = useState(() => localStorage.getItem('docurion_gh_repo') || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docurion_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docurion_theme', 'light');
    }
  }, [isDark]);

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setComplexity(val);
    localStorage.setItem('docurion_ai_complexity', val.toString());
  };

  const handleSaveGithub = () => {
    localStorage.setItem('docurion_gh_token', ghToken);
    localStorage.setItem('docurion_gh_owner', ghOwner);
    localStorage.setItem('docurion_gh_repo', ghRepo);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const complexityLabels = [
    "Executive Summary (Extremely short & simple)",
    "High-Level Overview (Brief but covers main points)",
    "Standard Documentation (Balanced detail)",
    "Technical Specs (Comprehensive & detailed)",
    "Staff-Engineer Deep Dive (Exhaustive & lengthy)"
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 border-b border-[var(--border-color)] pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-brand-500" /> Preferences
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Manage your workspace appearance, AI generation rules, and Integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: App Preferences & Integrations */}
        <div className="space-y-8">
          
          <section>
            <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-zinc-400" /> Interface
            </h3>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 space-y-6 shadow-sm">
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-emerald-400" /><div><p className="font-medium">Push Notifications</p><p className="text-xs text-[var(--text-muted)]">Alerts for completion</p></div></div>
                <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${notifications ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* NEW: GitHub Integration Section */}
          <section>
            <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 flex items-center gap-2 mb-4">
              <GithubIcon /> GitHub Integration
            </h3>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <p className="text-sm text-[var(--text-muted)] mb-5">Configure your repository to push documentation directly from the viewer.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">Personal Access Token</label>
                  <div className="relative mt-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="password" value={ghToken} onChange={(e) => setGhToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">Owner / Org</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="e.g. microsoft" className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">Repository</label>
                    <div className="relative mt-1">
                      <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="e.g. vscode" className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveGithub} className="w-full mt-2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors">
                  {isSaved ? "Saved Successfully!" : "Save Configuration"}
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: AI Brain Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-500" /> AI Engine Configuration
          </h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
            <div className="mb-6"><p className="font-medium">Output Complexity & Length</p><p className="text-sm text-[var(--text-muted)] mt-1">Control how deeply the AI analyzes the code.</p></div>
            <div className="relative mb-8">
              <input type="range" min="1" max="5" value={complexity} onChange={handleComplexityChange} className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all" />
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mt-3 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
            </div>
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