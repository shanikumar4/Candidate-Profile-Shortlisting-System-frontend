import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import JobForm from '../components/JobForm';
import MatchScoreBar from '../components/MatchScoreBar';
import AIResultPanel from '../components/AIResultPanel';
import Toast from '../components/Toast';
import { API_BASE_URL } from '../config';

const Shortlist = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loadingBasic, setLoadingBasic] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleBasicMatch = async (requirements) => {
    setLoadingBasic(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirements)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResults({
        type: 'basic',
        candidates: data.results,
        chartData: data.results.slice(0, 10).map(r => ({ name: r.candidate.name.split(' ')[0], score: r.matchScore }))
      });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoadingBasic(false);
    }
  };

  const handleAIMatch = async (requirements) => {
    setLoadingAI(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirements)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Store in localStorage for AI Analysis page
      localStorage.setItem('latestAIAnalysis', JSON.stringify(data));
      
      // Increment counter
      const currentCount = parseInt(localStorage.getItem('aiAnalysesCount') || '0', 10);
      localStorage.setItem('aiAnalysesCount', (currentCount + 1).toString());
      
      navigate('/ai');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setLoadingAI(false);
    }
  };

  const handleToggleSave = async (id, index) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${id}/save`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (results && results.candidates) {
        const newCandidates = [...results.candidates];
        newCandidates[index].candidate = data.candidate;
        setResults({ ...results, candidates: newCandidates });
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const getTierColor = (tier) => {
    if (tier === 'high') return 'bg-green-100 text-green-800';
    if (tier === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy-heading tracking-[-0.03em] mb-1">Run Shortlist</h1>
        <p className="text-text-muted text-sm">Find the perfect match for your job requirements</p>
      </div>

      <JobForm 
        onBasicMatch={handleBasicMatch} 
        onAIMatch={handleAIMatch} 
        isLoadingBasic={loadingBasic}
        isLoadingAI={loadingAI}
      />

      {results && results.type === 'basic' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-navy-heading mb-6 flex items-center gap-2">
            Match Results <span className="text-sm font-normal text-text-muted bg-gray-200 px-2 py-0.5 rounded-pill">{results.candidates.length} found</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {results.candidates.map((result, i) => (
              <div key={result.candidate._id} className="bg-white rounded-card p-6 border border-border flex flex-col relative overflow-hidden group hover:border-brand-mid transition-colors">
                <div className={`absolute top-0 left-0 right-0 h-1 ${result.tier === 'high' ? 'bg-green-600' : result.tier === 'medium' ? 'bg-brand' : 'bg-red-600'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className="font-bold text-navy-heading text-lg">#{i + 1} {result.candidate.name}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill ${getTierColor(result.tier)}`}>
                        {result.tier} match
                      </span>
                    </div>
                    <p className="text-text-muted text-sm">{result.candidate.email}</p>
                  </div>
                  <button
                    onClick={() => handleToggleSave(result.candidate._id, i)}
                    className={`p-2 rounded-full transition-colors ${
                      result.candidate.savedToShortlist
                        ? 'bg-brand-light text-brand-dark'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={result.candidate.savedToShortlist ? 'Remove from shortlist' : 'Save to shortlist'}
                  >
                    <Bookmark size={18} fill={result.candidate.savedToShortlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="mb-6">
                  <MatchScoreBar score={result.matchScore} />
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-navy-heading uppercase tracking-wider mb-2">Matched Required</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedRequired.length > 0 ? (
                        result.matchedRequired.map((skill, j) => (
                          <span key={j} className="px-2.5 py-1 bg-brand-light text-brand-dark text-[11px] font-semibold rounded-pill">{skill}</span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted">None</span>
                      )}
                    </div>
                  </div>
                  
                  {result.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-navy-heading uppercase tracking-wider mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((skill, j) => (
                          <span key={j} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-pill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matchedPreferred.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-navy-heading uppercase tracking-wider mb-2">Bonus (Preferred)</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedPreferred.map((skill, j) => (
                          <span key={j} className="px-2.5 py-1 bg-green-100 text-green-800 text-[11px] font-medium rounded-pill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {results.chartData && results.chartData.length > 0 && (
            <div className="bg-white rounded-card p-6 border border-border mb-8">
              <h3 className="text-lg font-bold text-navy-heading mb-6">Match Scores Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Match Score']}
                    />
                    <Bar dataKey="score" fill="#1D9E75" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Shortlist;
