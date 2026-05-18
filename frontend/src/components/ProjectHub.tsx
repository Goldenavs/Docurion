// frontend/src/components/ProjectHub.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  FileCode, Sparkles, ArrowLeft, Terminal, Loader2, 
  History as HistoryIcon, FileText, Calendar, ChevronRight, 
  LayoutTemplate, RefreshCw, UploadCloud, X 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ProjectHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [docsHistory, setDocsHistory] = useState<{ id: string; type: string; created_at: string }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // NEW: Lifecycle Syncing State
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [newFiles, setNewFiles] = useState<{ filename: string; content: string }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase.from('projects').select('*').eq('id', id).single();
      if (projectError) throw projectError;
      setProject(projectData);

      const { data: filesData, error: filesError } = await supabase.from('files').select('*').eq('project_id', id).order('created_at', { ascending: true });
      if (filesError) throw filesError;
      setFiles(filesData || []);

      const { data: docsData, error: docsError } = await supabase.from('docs').select('id, type, created_at').eq('project_id', id).order('created_at', { ascending: false });
      if (docsError) throw docsError;
      setDocsHistory(docsData || []);
    } catch (error: any) {
      console.error("Error fetching project data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/init-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, type })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      navigate(`/docs/${data.docId}?stream=true`); 
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to initialize document generation.");
      setIsGenerating(false);
    }
  };

  // ==========================================
  // NEW: LIFECYCLE SYNCING LOGIC
  // ==========================================
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const ignoredPaths = ['node_modules', '.git', 'dist', 'build', 'coverage'];
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css', '.py', '.java', '.sql'];

    acceptedFiles.forEach((file) => {
      const filePath = (file as any).path || file.webkitRelativePath || file.name;
      const isIgnoredPath = ignoredPaths.some(ignored => filePath.includes(ignored));
      const isAllowedExt = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (isIgnoredPath || !isAllowedExt) return; 

      const reader = new FileReader();
      reader.onload = () => {
        setNewFiles((prev) => [...prev, { filename: filePath, content: reader.result as string }]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSyncWorkspace = async () => {
    if (newFiles.length === 0) return;
    setIsSyncing(true);
    try {
      // 1. Delete all old files attached to this project
      const { error: delError } = await supabase.from('files').delete().eq('project_id', id);
      if (delError) throw delError;

      // 2. Format and insert the new files
      const fileInserts = newFiles.map((f) => ({
        project_id: id,
        filename: f.filename,
        content: f.content,
        language: f.filename.split('.').pop() || 'text',
      }));

      const { error: insError } = await supabase.from('files').insert(fileInserts);
      if (insError) throw insError;

      // 3. Update the project timestamp/description
      await supabase.from('projects').update({ 
        description: `Synced workspace with ${newFiles.length} updated files.`,
        updated_at: new Date().toISOString()
      }).eq('id', id);

      // 4. Refresh the UI
      await fetchProjectData();
      setNewFiles([]);
      setIsUpdatingMode(false);
      
    } catch (error: any) {
      console.error("Sync error:", error);
      alert("Failed to sync workspace.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Helpers
  const groupedDocs = docsHistory.reduce((acc, doc) => {
    const type = doc.type || 'README';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, any[]>);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'API_DOCS': return <Terminal className="w-4 h-4 text-emerald-500" />;
      case 'ARCHITECTURE': return <LayoutTemplate className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-brand-500" />;
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto pb-10">
      <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-[var(--text-muted)] mt-1">Project ID: <span className="font-mono text-xs ml-1 bg-[var(--bg-surface)] px-2 py-0.5 rounded">{id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* =======================================
            LEFT COLUMN: FILES & HISTORY 
            ======================================= */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Section 1: Source Files & Sync Engine */}
          <section>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-4">
              <h3 className="font-semibold text-lg">Source Files ({files.length})</h3>
              
              <button 
                onClick={() => {
                  setIsUpdatingMode(!isUpdatingMode);
                  setNewFiles([]); // Reset staging if they toggle it
                }}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isUpdatingMode ? 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-white' : 'bg-brand-500/10 text-brand-500 hover:bg-brand-500/20'}`}
              >
                {isUpdatingMode ? <X className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {isUpdatingMode ? 'Cancel Sync' : 'Sync Workspace'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isUpdatingMode ? (
                /* THE SYNC DROPZONE UI */
                <motion.div 
                  key="dropzone"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--bg-surface)] border border-brand-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.05)] overflow-hidden"
                >
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Drop your updated codebase folder here. This will overwrite the current files, but your previously generated artifacts will be preserved.
                  </p>

                  <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border-color)] bg-[var(--bg-base)] hover:border-brand-400/50'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud className={`w-8 h-8 mb-2 ${isDragActive ? 'text-brand-500' : 'text-[var(--text-muted)]'}`} />
                    <p className="text-sm font-medium text-[var(--text-main)]">{isDragActive ? 'Drop updated files...' : 'Drag & drop updated folder here'}</p>
                  </div>

                  {newFiles.length > 0 && (
                    <div className="mt-4 flex items-center justify-between bg-[var(--bg-base)] border border-[var(--border-color)] px-4 py-3 rounded-lg">
                      <span className="text-sm font-medium"><span className="text-brand-500">{newFiles.length}</span> files staged for sync</span>
                      <button 
                        onClick={handleSyncWorkspace}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                      >
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {isSyncing ? 'Syncing...' : 'Confirm Sync'}
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* THE STANDARD FILE LIST UI */
                <motion.div 
                  key="filelist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 max-h-[300px] overflow-y-auto custom-scrollbar shadow-sm"
                >
                  {files.length === 0 ? (
                    <p className="text-[var(--text-muted)] p-4 text-center">No files found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((file) => (
                        <li key={file.id} className="flex items-center text-sm px-3 py-2.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-color)] hover:border-brand-500/50 transition-colors">
                          <FileCode className="w-4 h-4 mr-3 text-brand-500 flex-shrink-0" />
                          <span className="truncate">{file.filename}</span>
                          <span className="ml-auto text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-surface)] px-2 py-1 rounded">
                            {file.language}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Section 2: Document History */}
          <section>
            <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2 mb-4 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-brand-500" /> Generated Artifacts
            </h3>
            
            {docsHistory.length === 0 ? (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-10 text-center shadow-sm flex flex-col items-center">
                <LayoutTemplate className="w-10 h-10 text-zinc-500 mb-3 opacity-50" />
                <p className="font-medium text-[var(--text-main)]">No artifacts generated yet</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">Use the actions panel to analyze your code.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(groupedDocs).map(([type, docsList]) => (
                  <div key={type} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[var(--bg-base)] px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">
                      {getTypeIcon(type)} {type.replace('_', ' ')}
                    </div>
                    <div className="divide-y divide-[var(--border-color)] max-h-60 overflow-y-auto custom-scrollbar flex-1">
                      {docsList.map(doc => (
                        <Link to={`/docs/${doc.id}`} key={doc.id} className="flex items-center justify-between p-4 hover:bg-brand-500/5 transition-colors group">
                          <div>
                            <p className="text-sm font-medium group-hover:text-brand-500 transition-colors">View Document</p>
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(doc.created_at))}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* =======================================
            RIGHT COLUMN: AI ACTIONS 
            ======================================= */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2">AI Engine Operations</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-4 shadow-sm sticky top-10">
            
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-emerald-500 hover:text-emerald-500 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              <Terminal className="w-4 h-4" /> Generate API Specs
            </button>

            <button 
              onClick={() => handleGenerate('ARCHITECTURE')}
              disabled={isGenerating || files.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-blue-500 hover:text-blue-500 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              <LayoutTemplate className="w-4 h-4" /> Map Architecture
            </button>
            
            <p className="text-xs text-[var(--text-muted)] text-center mt-2 leading-relaxed">
              Ensure you have configured your desired output complexity in <Link to="/settings" className="text-brand-500 hover:underline">Settings</Link>.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}