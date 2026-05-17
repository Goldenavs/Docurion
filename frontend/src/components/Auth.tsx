// frontend/src/components/Auth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight, User, Code2, Sparkles, FileJson } from 'lucide-react';
import Background from './Background';
import { supabase } from '../lib/supabaseClient'; // Make sure this path matches your setup

// Minimal text, high impact.
const onboardingSteps = [
  {
    icon: <Code2 className="w-10 h-10 text-brand-500" />,
    title: "1. Raw Code In",
    subtitle: "Upload your raw source files or paste snippets directly."
  },
  {
    icon: <Sparkles className="w-10 h-10 text-brand-500" />,
    title: "2. AI Analysis",
    subtitle: "Our engine understands your architecture and relationships."
  },
  {
    icon: <FileJson className="w-10 h-10 text-brand-500" />,
    title: "3. Perfect Docs Out",
    subtitle: "Get structured, production-ready documentation instantly."
  }
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-play the onboarding choreography every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Success! Please check your email to verify your account.");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // If they don't have a guest ID yet, create one!
    if (!localStorage.getItem('docurion_guest_id')) {
      const newGuestId = crypto.randomUUID();
      localStorage.setItem('docurion_guest_id', newGuestId);
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-[var(--text-main)] p-4 md:p-8">
      <Background />

      {/* The Split-Screen Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} 
        className="w-full max-w-5xl bg-[var(--bg-surface)]/80 backdrop-blur-2xl border border-[var(--border-color)] rounded-[2rem] shadow-2xl shadow-brand-500/10 flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* LEFT COLUMN: AUTH */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="relative group">
              <BookOpen className="w-8 h-8 text-brand-500 relative z-10" />
              <div className="absolute inset-0 bg-brand-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Docurion<span className="text-brand-500">.</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              {isLogin ? 'Welcome back.' : 'Initialize Workspace.'}
            </h2>
            <p className="text-[var(--text-muted)] text-sm">
              {isLogin ? 'Enter your credentials to access your generated docs.' : 'Create an account to start generating documentation.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="developer@docurion.ai"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <motion.button
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 mt-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Access Dashboard' : 'Create Account')} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestLogin}
              className="text-sm font-medium flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-500 transition-colors px-4 py-2 rounded-lg hover:bg-brand-500/10"
            >
              <User className="w-4 h-4" /> Continue as Guest
            </motion.button>

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              {isLogin ? "Need an account? " : "Already have an account? "}
              <span className="text-brand-500 hover:underline">{isLogin ? 'Sign up' : 'Log in'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ONBOARDING CHOREOGRAPHY (Hidden on Mobile) */}
        <div className="hidden md:flex w-1/2 bg-brand-50/50 dark:bg-brand-900/10 border-l border-[var(--border-color)] p-12 relative flex-col justify-center items-center text-center overflow-hidden">
          
          {/* Subtle glowing orb behind the animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="h-48 w-full flex flex-col items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="mb-6 p-4 bg-white dark:bg-zinc-900 shadow-xl shadow-brand-500/10 border border-[var(--border-color)] rounded-2xl">
                  {onboardingSteps[step].icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{onboardingSteps[step].title}</h3>
                <p className="text-[var(--text-muted)] max-w-sm leading-relaxed">
                  {onboardingSteps[step].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2 mt-12 relative z-10">
            {onboardingSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? 'w-8 bg-brand-500' : 'w-2 bg-[var(--border-color)] hover:bg-[var(--text-muted)]'
                }`}
              />
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  );
}