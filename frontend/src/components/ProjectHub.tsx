// frontend/src/components/ProjectHub.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCode, Sparkles, ArrowLeft, Terminal, Loader2, History } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ProjectHub() {
  const { id } = useParams(); // Gets the project ID from the URL
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Project Details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (projectError) throw projectError;
      setProject(projectData);

      // 2. Fetch the uploaded files for this project
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (filesError) throw filesError;
      setFiles(filesData || []);

    } catch (error: any) {
      console.error("Error fetching project data:", error.message);
      // In a real app, maybe redirect to a 404 page here if project isn't found
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p className="text-[var(--text-muted)]">Loading workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Link to="/dashboard" className="text-brand-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Hit the new Init endpoint
      const response = await fetch(`${API_URL}/api/init-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, type })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Instantly route them to the Docs Viewer, and pass a ?stream=true flag!
      navigate(`/docs/${data.docId}?stream=true`); 
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to initialize document generation.");
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-[var(--text-muted)] mt-1">Project ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: File List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2">
            Source Files ({files.length})
          </h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {files.length === 0 ? (
              <p className="text-[var(--text-muted)] p-4 text-center">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center text-sm px-3 py-3 bg-[var(--bg-base)] rounded-lg border border-[var(--border-color)] hover:border-brand-500/50 transition-colors">
                    <FileCode className="w-4 h-4 mr-3 text-brand-500 flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                    <span className="ml-auto text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface)] px-2 py-1 rounded">
                      {file.language}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: AI Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2">Generate Artifacts</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-4">
            
            <button 
              onClick={() => handleGenerate('README')}
              disabled={isGenerating || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20 group disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:animate-pulse" />} 
              Generate README
            </button>
            
            <button 
              onClick={() => handleGenerate('API_DOCS')}
              disabled={isGenerating || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              <Terminal className="w-4 h-4" /> Generate API Specs
            </button>

            <button 
              onClick={() => handleGenerate('ARCHITECTURE')}
              disabled={isGenerating || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-blue-500 hover:text-blue-500 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              <History className="w-4 h-4" /> Map Architecture
            </button>
            
          </div>
        </div>
      </div>
    </motion.div>
  );
}