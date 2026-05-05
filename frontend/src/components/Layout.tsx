import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusSquare, Settings, BookOpen } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'New Workspace', path: '/new', icon: <PlusSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-base)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-500" />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-main)]'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          {/* Outlet is where the nested routes will render */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}