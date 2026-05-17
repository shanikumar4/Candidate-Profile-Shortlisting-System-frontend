import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Shortlist from './pages/Shortlist';
import AIAnalysis from './pages/AIAnalysis';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy z-40 flex items-center px-4 justify-between shadow-sm">
          <h1 className="text-xl font-black text-white tracking-[-0.03em]">GSSoC Hire</h1>
          <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
            <Menu size={24} />
          </button>
        </div>

        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 w-full md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
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
