import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderGit2, Calendar, ArrowRight, PlusSquare, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Define the shape of our Project data
type Project = {
  id: string;
  name: string;
  created_at: string;
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch projects, ordered by newest first
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-main)]">Dashboard</h2>
          <p className="text-[var(--text-muted)] mt-1">Manage your documentation workspaces.</p>
        </div>
        <Link 
          to="/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)]"
        >
          <PlusSquare className="w-4 h-4" /> New Workspace
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 border border-[var(--border-color)] bg-[var(--bg-surface)]/50 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
          <p className="text-[var(--text-muted)] font-medium">Loading workspaces...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-surface)]/30 backdrop-blur-sm">
          <FolderGit2 className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No workspaces yet</h3>
          <p className="text-[var(--text-muted)] mb-6 text-center max-w-md">
            Get started by uploading your first codebase to generate structured documentation.
          </p>
          <Link 
            to="/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500 font-medium rounded-lg transition-all"
          >
            Create Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={project.id}
            >
              <Link 
                to={`/project/${project.id}`}
                className="group block p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-500">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 truncate group-hover:text-brand-600 transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center text-xs text-[var(--text-muted)] font-medium">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}