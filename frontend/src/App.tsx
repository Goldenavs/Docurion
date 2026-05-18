// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WorkspaceSetup from './components/WorkspaceSetup';
import ProjectHub from './components/ProjectHub';
import DocsViewer from './components/DocsViewer';
import Settings from './components/Settings'; // <-- New Import!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        {/* All routes inside Layout have the Sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new" element={<WorkspaceSetup />} />
          <Route path="/project/:id" element={<ProjectHub />} />
          <Route path="/docs/:id" element={<DocsViewer />} />
          <Route path="/settings" element={<Settings />} /> {/* <-- New Route! */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;