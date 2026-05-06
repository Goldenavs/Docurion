import { Link, useLocation, useOutlet } from 'react-router-dom';
import { LayoutDashboard, PlusSquare, Settings, BookOpen, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './Background';

export default function Layout() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  
  // Theme state: default to dark
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'New Workspace', path: '/new', icon: <PlusSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen text-[var(--text-main)] overflow-hidden">
      <Background />

      {/* Sidebar with Glassmorphism */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-surface)]/80 backdrop-blur-xl flex flex-col z-10">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-brand-500 relative z-10" />
              {/* Icon Glow Effect */}
              <div className="absolute inset-0 bg-brand-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Docurion<span className="text-brand-500">.</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium overflow-hidden group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-500/15 border border-brand-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-3 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`}>
                  {item.icon}
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)] space-y-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)]/50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDark ? 'bg-brand-500' : 'bg-gray-300'}`}>
              <motion.div 
                layout
                className="w-3 h-3 bg-white rounded-full shadow-sm"
                animate={{ x: isDark ? 16 : 0 }}
              />
            </div>
          </button>
          
          <button className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-base)]/50 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          {/* Page Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentOutlet} {/* <-- 2. Render the frozen outlet instead of <Outlet /> */}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}