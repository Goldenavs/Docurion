// frontend/src/components/DocsViewer.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Download, Loader2, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';

export default function DocsViewer() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('docs')
        .select(`*, projects(name)`) // Join to get the project name
        .eq('id', id)
        .single();

      if (error) throw error;
      setDoc(data);
    } catch (error: any) {
      console.error("Error fetching doc:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!doc) return;
    navigator.clipboard.writeText(doc.content.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc) return;
    const blob = new Blob([doc.content.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.projects?.name || 'Project'}_${doc.type}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p className="text-[var(--text-muted)]">Loading documentation...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Document not found</h2>
        <Link to="/dashboard" className="text-brand-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <Link to={`/project/${doc.project_id}`} className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {doc.projects?.name || 'Project'} <span className="text-brand-500">{doc.type}</span>
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-brand-500 rounded-lg text-sm font-medium transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy raw'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export .md
          </button>
        </div>
      </div>

      {/* Markdown Paper */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 md:p-12 shadow-sm">
        {/* We use the 'prose' class from Tailwind Typography to automatically style the raw markdown! */}
        <div className="prose dark:prose-invert max-w-none prose-headings:font-display prose-a:text-brand-500 hover:prose-a:text-brand-400">
          <ReactMarkdown>
            {doc.content.markdown}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}