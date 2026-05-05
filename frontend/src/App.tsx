import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import WorkspaceSetup from './components/WorkspaceSetup';
import ProjectHub from './components/ProjectHub';
import DocsViewer from './components/DocsViewer';

function DashboardPlaceholder() {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-2">Dashboard</h2>
      <p className="text-[var(--text-muted)]">Your recent workspaces will appear here.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPlaceholder />} />
          <Route path="new" element={<WorkspaceSetup />} />
          <Route path="project/:id" element={<ProjectHub />} />
          <Route path="docs/:id" element={<DocsViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;