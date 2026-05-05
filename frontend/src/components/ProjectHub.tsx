import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCode, Sparkles, ArrowLeft, Terminal } from 'lucide-react';

export default function ProjectHub() {
  const { id } = useParams(); // Gets the project ID from the URL

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Vehicle Rental API</h2>
          <p className="text-[var(--text-muted)] mt-1">Project ID: {id || '12345'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: File List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2">Source Files</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4">
            <ul className="space-y-2">
              {['server.js', 'routes/api.js', 'models/User.js'].map((file) => (
                <li key={file} className="flex items-center text-sm px-3 py-2 bg-[var(--bg-base)] rounded-lg border border-[var(--border-color)]">
                  <FileCode className="w-4 h-4 mr-3 text-brand-500" />
                  {file}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: AI Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-[var(--border-color)] pb-2">Generate Docs</h3>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-4">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4" /> Generate README
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500 font-medium rounded-xl transition-all">
              <Terminal className="w-4 h-4" /> Generate API Docs
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}