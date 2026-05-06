import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WorkspaceSetup from './components/WorkspaceSetup';
import ProjectHub from './components/ProjectHub';
import DocsViewer from './components/DocsViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. The Landing / Auth Page (No Sidebar) */}
        <Route path="/" element={<Auth />} />

        {/* 2. The Main App (With Sidebar and Background) */}
        <Route element={<Layout />}>
          {/* Notice these paths are absolute now */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new" element={<WorkspaceSetup />} />
          <Route path="/project/:id" element={<ProjectHub />} />
          <Route path="/docs/:id" element={<DocsViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;