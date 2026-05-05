import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
// import { supabase } from '../lib/supabaseClient'; // Uncomment when ready to wire back up

export default function WorkspaceSetup() {
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<{ filename: string; content: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFiles((prev) => [
          ...prev,
          { filename: file.name, content: reader.result as string },
        ]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSaveProject = async () => {
    setIsUploading(true);
    // Simulation for UI testing
    setTimeout(() => {
      setIsUploading(false);
      alert('UI Test: Project Data Saved!');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-3xl mx-auto p-8 md:p-10 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-xl shadow-brand-500/5"
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Initialize Workspace</h2>
        <p className="text-[var(--text-muted)]">Upload your codebase to generate structured documentation.</p>
      </div>
      
      {/* Project Name Input */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-[var(--text-main)] mb-3">Project Designation</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., Vehicle Rental API"
          className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200"
        />
      </div>

      {/* Animated Dropzone Wrapper */}
      <motion.div
        whileHover={{ scale: 0.99 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4"
      >
        {/* Standard div for Dropzone to prevent TS conflicts */}
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
            isDragActive 
              ? 'border-brand-500 bg-brand-500/10' 
              : 'border-[var(--border-color)] bg-[var(--bg-base)] hover:border-brand-400/50'
          }`}
        >
          <input {...getInputProps()} />
          
          <motion.div 
            animate={{ y: isDragActive ? -5 : 0, scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-brand-500' : 'text-[var(--text-muted)]'}`} />
          </motion.div>
          
          <p className="text-sm font-medium text-[var(--text-main)]">
            {isDragActive ? 'Drop assets here...' : 'Drag & drop source files, or click to browse'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Supports .js, .ts, .py, .json</p>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={!(isUploading || files.length === 0 || !projectName) ? { y: -2 } : {}}
        whileTap={!(isUploading || files.length === 0 || !projectName) ? { scale: 0.98 } : {}}
        onClick={handleSaveProject}
        disabled={isUploading || files.length === 0 || !projectName}
        className="mt-6 w-full flex items-center justify-center px-4 py-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold tracking-wide shadow-lg shadow-brand-500/25"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Deploy Workspace <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}