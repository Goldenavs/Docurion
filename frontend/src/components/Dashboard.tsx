// frontend/src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowRight, FolderGit2, LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

      if (user) {
        // Logged in: Fetch their specific projects
        query = query.eq('user_id', user.id);
        setIsGuest(false);
      } else {
        // Guest: Fetch projects matching their Local Storage ID
        const guestId = localStorage.getItem('docurion_guest_id');
        
        if (guestId) {
          query = query.eq('guest_id', guestId);
        } else {
          // If no guest ID exists somehow, return an empty list instead of everyone's data
          query = query.eq('guest_id', 'none'); 
        }
        setIsGuest(true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isGuest) {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Workspace {isGuest && <span className="text-brand-500 text-lg ml-2 font-medium">(Guest Mode)</span>}
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Manage and generate your documentation.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl"
          >
            <LogOut className="w-4 h-4" /> {isGuest ? 'Leave Guest Mode' : 'Sign Out'}
          </button>
          
          <Link 
            to="/new" 
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-[var(--text-muted)]">Loading workspace...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm">
          <FolderGit2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">Start by creating your first documentation project. Upload your code and let AI do the rest.</p>
          <Link 
            to="/new" 
            className="inline-flex items-center gap-2 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500 px-6 py-3 rounded-xl transition-all font-medium"
          >
            Create Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} to={`/project/${project.id}`} className="block group">
              <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl hover:border-brand-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-brand-500/10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg group-hover:border-brand-500/50 transition-colors">
                    <FolderGit2 className="w-5 h-5 text-brand-500" />
                  </div>
                  <h2 className="text-lg font-semibold group-hover:text-brand-500 transition-colors truncate">
                    {project.name}
                  </h2>
                </div>
                
                <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tech_stack.slice(0, 3).map((tech: string) => (
                      <span key={tech} className="text-xs px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-md font-medium text-[var(--text-muted)]">
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-md font-medium text-[var(--text-muted)]">
                        +{project.tech_stack.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}