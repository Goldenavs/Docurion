// frontend/src/components/DocsViewer.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Download, Loader2, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../lib/supabaseClient';

export default function DocsViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isStreamingFlag = searchParams.get('stream') === 'true';

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Streaming State
  const [streamedMarkdown, setStreamedMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(isStreamingFlag);

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('docs')
        .select(`*, projects(name)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      setDoc(data);

      // If it's a new document and we requested a stream, start listening!
      if (isStreamingFlag && !data.content?.markdown) {
        setLoading(false); // Stop standard loader immediately
        startSSEStream();
      } else {
        // If it's an old doc, just show the saved text
        setStreamedMarkdown(data.content?.markdown || '');
        setIsStreaming(false);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error fetching doc:", error.message);
      setLoading(false);
    }
  };

  const startSSEStream = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Grab the user's complexity preference (defaulting to 1)
    const complexity = localStorage.getItem('docurion_ai_complexity') || '1';
    
    // Attach it as a query parameter!
    const sse = new EventSource(`${API_URL}/api/stream-doc/${id}?complexity=${complexity}`);

    sse.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setIsStreaming(false);
        sse.close();
        return;
      }
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.error) throw new Error(parsed.error);
        
        // Append the new chunk of text to our state (creating the typewriter effect!)
        setStreamedMarkdown((prev) => prev + parsed.text);
      } catch (err) {
        console.error("SSE Parse error:", err);
        sse.close();
      }
    };

    sse.onerror = () => {
      sse.close();
      setIsStreaming(false);
    };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([streamedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc?.projects?.name || 'Project'}_${doc?.type}.md`;
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <Link to={`/project/${doc?.project_id}`} className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-3">
            {doc?.projects?.name || 'Project'} <span className="text-brand-500">{doc?.type}</span>
            {isStreaming && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span></span>}
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            disabled={isStreaming}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-brand-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy raw'}
          </button>
          <button 
            onClick={handleDownload}
            disabled={isStreaming}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export .md
          </button>
        </div>
      </div>

      {/* Markdown Paper */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-8 md:p-12 shadow-sm relative min-h-[400px]">
        <div className="prose dark:prose-invert max-w-none prose-headings:font-display prose-a:text-brand-500 hover:prose-a:text-brand-400">
          
          <ReactMarkdown
            components={{
              // Path 2: VS Code Syntax Highlighting Override!
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group my-6 overflow-hidden rounded-xl border border-[var(--border-color)]">
                    <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
                      <span className="text-xs text-zinc-400 font-mono lowercase">{match[1]}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: '1.5rem', background: '#1e1e1e' }}
                    />
                  </div>
                ) : (
                  <code {...props} className={`${className} bg-zinc-800 text-brand-400 px-1.5 py-0.5 rounded-md text-sm font-mono`}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {streamedMarkdown}
          </ReactMarkdown>

          {/* Typewriter Cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-brand-500 ml-1 animate-pulse align-middle" />
          )}

        </div>
      </div>
    </motion.div>
  );
}