// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WorkspaceSetup from './components/WorkspaceSetup';
import ProjectHub from './components/ProjectHub';
import DocsViewer from './components/DocsViewer';
import Settings from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      {/* NEW: Global Dark Mode Toaster */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid #27272a', // zinc-800
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new" element={<WorkspaceSetup />} />
          <Route path="/project/:id" element={<ProjectHub />} />
          <Route path="/docs/:id" element={<DocsViewer />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;