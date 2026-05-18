// frontend/src/components/Layout.tsx
import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, BookOpen, LogOut, FileCode2, Settings } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import Background from './Background';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);

  // Load the theme globally on first app load!
  useEffect(() => {
    const theme = localStorage.getItem('docurion_theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [location.pathname]); 

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guestId = localStorage.getItem('docurion_guest_id');
      
      let query = supabase.from('projects').select('id, name').order('created_at', { ascending: false }).limit(10); 
      if (user) { query = query.eq('user_id', user.id); setIsGuest(false); } 
      else { query = query.eq('guest_id', guestId || 'none'); setIsGuest(true); }

      const { data } = await query;
      if (data) setRecentProjects(data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleLogout = async () => {
    if (!isGuest) await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-transparent text-[var(--text-main)] overflow-hidden font-sans relative transition-colors duration-300">
      <Background />

      <div className="w-64 bg-[var(--bg-surface)]/80 backdrop-blur-2xl border-r border-[var(--border-color)] flex flex-col relative z-20 shadow-xl">
        <div className="h-20 flex items-center px-6 border-b border-[var(--border-color)]">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <BookOpen className="w-6 h-6 text-brand-500 relative z-10" />
              <div className="absolute inset-0 bg-brand-500 blur-md opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide">
              Docurion<span className="text-brand-500">.</span>
            </span>
          </Link>
        </div>

        <div className="p-4 space-y-1.5 border-b border-[var(--border-color)]">
          <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-brand-500/10 text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)]'}`}><LayoutDashboard className="w-4.5 h-4.5" /> Workspace</Link>
          <Link to="/new" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/new') ? 'bg-brand-500/10 text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)]'}`}><PlusCircle className="w-4.5 h-4.5" /> New Project</Link>
          <Link to="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/settings') ? 'bg-brand-500/10 text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)]'}`}><Settings className="w-4.5 h-4.5" /> Settings</Link>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
          <div className="flex items-center gap-2 px-3 mb-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"><History className="w-3.5 h-3.5" /> Recent History</div>
          <div className="space-y-1">
            {recentProjects.map((project) => {
              const isProjectActive = location.pathname.includes(`/project/${project.id}`) || location.pathname.includes(`/docs/`);
              return (
                <Link key={project.id} to={`/project/${project.id}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all truncate ${isProjectActive ? 'bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)] border border-transparent'}`}>
                  <FileCode2 className={`w-4 h-4 flex-shrink-0 ${isProjectActive ? 'text-brand-500' : 'text-[var(--text-muted)]'}`} />
                  <span className="truncate">{project.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-color)] space-y-2 bg-[var(--bg-surface)]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4.5 h-4.5" /> {isGuest ? 'Leave Session' : 'Sign Out'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <main className="p-6 md:p-10 min-h-full">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}