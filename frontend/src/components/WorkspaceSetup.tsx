// frontend/src/components/WorkspaceSetup.tsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, ArrowRight, FileCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function WorkspaceSetup() {
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<{ filename: string; content: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSaveProject = async () => {
    setIsUploading(true);
    try {
      // 1. Get current user (if any)
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Create the Project in Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          user_id: user ? user.id : null, // Handles both Logged In & Guests
          description: `Uploaded ${files.length} source files.`,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      const projectId = projectData.id;

      // 3. Prepare files for bulk insertion
      const fileInserts = files.map((f) => ({
        project_id: projectId,
        filename: f.filename,
        content: f.content,
        language: f.filename.split('.').pop() || 'text', // Extracts file extension
      }));

      // 4. Save files to Supabase
      const { error: filesError } = await supabase
        .from('files')
        .insert(fileInserts);

      if (filesError) throw filesError;

      // 5. Navigate to the new Project Hub!
      navigate(`/project/${projectId}`);

    } catch (error: any) {
      console.error("Error creating workspace:", error);
      alert(error.message || "Failed to save project.");
    } finally {
      setIsUploading(false);
    }
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
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
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
            <UploadCloud className={`w-10 h-10 mb-3 ${isDragActive ? 'text-brand-500' : 'text-[var(--text-muted)]'}`} />
          </motion.div>
          
          <p className="text-sm font-medium text-[var(--text-main)]">
            {isDragActive ? 'Drop assets here...' : 'Drag & drop source files, or click to browse'}
          </p>
        </div>
      </motion.div>

      {/* Uploaded Files Preview List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-2 overflow-hidden"
          >
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-3">Staged Files ({files.length})</h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg text-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileCode className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        whileHover={!(isUploading || files.length === 0 || !projectName) ? { y: -2 } : {}}
        whileTap={!(isUploading || files.length === 0 || !projectName) ? { scale: 0.98 } : {}}
        onClick={handleSaveProject}
        disabled={isUploading || files.length === 0 || !projectName}
        className="mt-8 w-full flex items-center justify-center px-4 py-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold tracking-wide shadow-lg shadow-brand-500/25"
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