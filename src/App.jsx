import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Shortlist from './pages/Shortlist';
import AIAnalysis from './pages/AIAnalysis';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route path="/ai" element={<AIAnalysis />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
