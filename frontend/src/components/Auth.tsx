// frontend/src/components/Auth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight, User, Code2, Sparkles, FileJson, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Elite Onboarding Steps
const onboardingSteps = [
  {
    icon: <Code2 className="w-8 h-8 text-brand-400" />,
    title: "Raw Code Ingest",
    subtitle: "Drop your massive legacy codebases or complex microservices. We read the chaos."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-blue-400" />,
    title: "Neural Architecture Mapping",
    subtitle: "Our AI engine untangles dependencies, relationships, and unwritten rules instantly."
  },
  {
    icon: <FileJson className="w-8 h-8 text-emerald-400" />,
    title: "Production-Ready Specs",
    subtitle: "Export pixel-perfect Markdown, API specs, and READMEs that developers actually want to read."
  }
];

// Custom Google SVG for the Social Login button
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(0);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Auto-play the onboarding choreography every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match! Please check again.");
      return;
    }
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
    if (!localStorage.getItem('docurion_guest_id')) {
      localStorage.setItem('docurion_guest_id', crypto.randomUUID());
    }
    navigate('/dashboard');
  };

  // Add ": Variants" to explicitly type these objects
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex min-h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* =========================================
        LEFT COLUMN: THE AUTHENTICATION SIDEBAR
        =========================================
      */}
      <div className="w-full lg:w-[480px] h-screen flex flex-col justify-center px-8 sm:px-12 bg-[#0a0a0a]/80 backdrop-blur-3xl border-r border-white/5 z-20 relative shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        
        {/* Subtle top/bottom glows in the sidebar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-brand-500/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-32 bg-blue-500/10 blur-[50px] pointer-events-none" />

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="relative z-10 w-full max-w-sm mx-auto"
        >
          {/* Logo Section */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12">
            <div className="relative group">
              <BookOpen className="w-8 h-8 text-brand-500 relative z-10" />
              <div className="absolute inset-0 bg-brand-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Docurion<span className="text-brand-500">.</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create workspace'}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isLogin ? 'Enter your credentials to access your generated docs.' : 'Sign up to start automating your codebase documentation.'}
            </p>
          </motion.div>

          {/* Social Logins */}
          <motion.div variants={itemVariants} className="flex gap-3 mb-6">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-500/50 hover:bg-zinc-800 transition-all text-sm font-medium">
              <GithubIcon /> GitHub
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-500/50 hover:bg-zinc-800 transition-all text-sm font-medium">
              <GoogleIcon /> Google
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </motion.div>

          {/* Core Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="developer@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm text-white placeholder-zinc-600"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm text-white placeholder-zinc-600"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field (Animated entry for Signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm text-white placeholder-zinc-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="relative w-full py-3.5 mt-2 bg-brand-600 text-white font-semibold rounded-xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Shine effect inside button */}
              <div className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
              
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (isLogin ? 'Access Dashboard' : 'Initialize Account')} <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </form>

          {/* Footer Actions */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-brand-500 font-semibold hover:underline">{isLogin ? 'Sign up' : 'Log in'}</span>
            </button>

            <button
              onClick={handleGuestLogin}
              className="text-sm font-medium flex items-center gap-2 text-zinc-500 hover:text-brand-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
            >
              <User className="w-4 h-4" /> Skip & Continue as Guest
            </button>
          </motion.div>

        </motion.div>
      </div>

      {/* =========================================
        RIGHT COLUMN: THE IMMERSIVE CHOREOGRAPHY
        =========================================
      */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-[#050505] overflow-hidden">
        
        {/* The "Elite" Deep Background Effects */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000" />
        <div className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen" />
        
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTM5IDM5VjFIMUMxdjM4aDM4eiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50" />

        <div className="w-full max-w-2xl relative z-10 p-12">
          
          {/* Dynamic Floating Content Card */}
          <div className="relative w-full aspect-video rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden mb-12 flex items-center justify-center">
            
            {/* Fake macOS Window Dots */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center flex flex-col items-center"
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.1)] mb-6">
                  {onboardingSteps[step].icon}
                </div>
                <h3 className="font-display text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                  {onboardingSteps[step].title}
                </h3>
                <p className="text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {onboardingSteps[step].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-3">
            {onboardingSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? 'w-12 bg-brand-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'w-3 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}