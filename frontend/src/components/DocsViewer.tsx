// frontend/src/components/DocsViewer.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Copy, Download, Loader2, CheckCircle2, 
  MessageSquare, Send, X, Bot, User, Edit3, Save 
} from 'lucide-react';
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
  
  // Document Streaming & Editing State
  const [streamedMarkdown, setStreamedMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(isStreamingFlag);
  
  // Live Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Co-Pilot Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatStreaming]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('docs').select(`*, projects(name)`).eq('id', id).single();
      if (error) throw error;
      setDoc(data);

      if (isStreamingFlag && !data.content?.markdown) {
        setLoading(false);
        startSSEStream();
      } else {
        setStreamedMarkdown(data.content?.markdown || '');
        setIsStreaming(false);
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      setLoading(false);
    }
  };

  const startSSEStream = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const complexity = localStorage.getItem('docurion_ai_complexity') || '1';
    const sse = new EventSource(`${API_URL}/api/stream-doc/${id}?complexity=${complexity}`);

    sse.onmessage = (event) => {
      if (event.data === '[DONE]') { setIsStreaming(false); sse.close(); return; }
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.error) throw new Error(parsed.error);
        setStreamedMarkdown((prev) => prev + parsed.text);
      } catch (err) { sse.close(); }
    };
    sse.onerror = () => { sse.close(); setIsStreaming(false); };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // RESTORED: The core download function
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

  const handleSaveMarkdown = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('docs').update({ content: { markdown: streamedMarkdown } }).eq('id', id);
      if (error) throw error;
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatStreaming) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatStreaming(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/chat-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: id, message: userMessage, history: chatHistory })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiMessage = '';

      setChatHistory(prev => [...prev, { role: 'assistant', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        aiMessage += chunk;

        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = aiMessage;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative group my-4 overflow-hidden rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
            <span className="text-xs text-zinc-400 font-mono lowercase">{match[1]}</span>
          </div>
          <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.875rem' }} />
        </div>
      ) : (
        <code {...props} className={`${className} bg-zinc-800 text-brand-400 px-1.5 py-0.5 rounded-md text-sm font-mono`}>{children}</code>
      );
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col pb-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-[var(--border-color)] pb-4 shrink-0">
        <div>
          <Link to={`/project/${doc?.project_id}`} className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Project
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-3">
            {doc?.projects?.name || 'Project'} <span className="text-brand-500">{doc?.type}</span>
            {isStreaming && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span></span>}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          
          {isEditing ? (
            <button onClick={handleSaveMarkdown} disabled={isSaving || isStreaming} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all shadow-md disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} disabled={isStreaming} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50">
              <Edit3 className="w-4 h-4" /> Live Edit
            </button>
          )}

          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md ${isChatOpen ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-brand-500'}`}>
            <MessageSquare className="w-4 h-4" /> Co-Pilot
          </button>
          
          <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>
          
          <button onClick={handleCopy} disabled={isStreaming} className="flex items-center justify-center p-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-brand-500 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-all disabled:opacity-50 tooltip-trigger" title="Copy Raw Markdown">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* RESTORED: The Export Button */}
          <button onClick={handleDownload} disabled={isStreaming} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md disabled:opacity-50 border border-zinc-700">
            <Download className="w-4 h-4" /> Export .md
          </button>
          
        </div>
      </div>

      {/* Dynamic Flex Container */}
      <div className="flex flex-1 gap-6 overflow-hidden relative w-full">
        
        {/* Left Side: Editor & Preview Area */}
        <div className={`flex-1 flex gap-6 overflow-hidden transition-all duration-300 ${!isEditing && !isChatOpen ? 'max-w-5xl mx-auto w-full' : 'w-full'}`}>

          {isEditing && (
            <div className="flex-1 flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm shrink-0 min-w-[300px]">
              <div className="px-4 py-3 bg-[var(--bg-base)] border-b border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Raw Markdown
              </div>
              <textarea
                value={streamedMarkdown}
                onChange={(e) => setStreamedMarkdown(e.target.value)}
                className="flex-1 w-full p-6 bg-transparent resize-none outline-none font-mono text-sm text-[var(--text-main)] custom-scrollbar leading-relaxed"
                spellCheck={false}
                placeholder="Start typing your markdown here..."
              />
            </div>
          )}

          {/* Rendered Preview Pane */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 md:p-10 shadow-sm ${isEditing ? 'shrink-0 min-w-[300px]' : ''}`}>
            <div className="prose dark:prose-invert max-w-none prose-headings:font-display prose-a:text-brand-500 hover:prose-a:text-brand-400">
              <ReactMarkdown components={markdownComponents}>{streamedMarkdown}</ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-5 bg-brand-500 ml-1 animate-pulse align-middle" />}
            </div>
          </div>

        </div>

        {/* Right Side: Co-Pilot Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '400px' }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden lg:flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-base)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand-500" />
                  <span className="font-semibold text-sm tracking-wide">Codebase Co-Pilot</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-sm">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <MessageSquare className="w-10 h-10 mb-3" />
                    <p>Ask anything about this codebase.</p>
                    <p className="text-xs mt-1">E.g., "Where is authentication handled?"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-500 text-white' : 'bg-[var(--bg-base)] border border-[var(--border-color)]'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-500" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-[var(--bg-base)] border border-[var(--border-color)] prose dark:prose-invert prose-sm'}`}>
                        {msg.role === 'user' ? <p>{msg.text}</p> : <ReactMarkdown components={markdownComponents}>{msg.text || '...'}</ReactMarkdown>}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-base)]">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Co-Pilot..."
                    className="w-full pl-4 pr-12 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  />
                  <button type="submit" disabled={isChatStreaming || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}