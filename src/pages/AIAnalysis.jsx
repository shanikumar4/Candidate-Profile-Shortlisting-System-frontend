import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, ChevronLeft, ArrowRight } from 'lucide-react';
import Toast from '../components/Toast';

const AIAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const data = localStorage.getItem('latestAIAnalysis');
    if (data) {
      try {
        setAnalysis(JSON.parse(data));
      } catch (e) {
        console.error('Failed to parse AI analysis data');
      }
    }
  }, []);

  const handleExport = () => {
    if (!analysis) return;

    try {
      let content = 'AI CANDIDATE SHORTLIST ANALYSIS\n';
      content += '=================================\n\n';
      
      content += 'SUMMARY\n';
      content += '-------\n';
      content += analysis.summary + '\n\n';
      
      content += 'RANKINGS\n';
      content += '--------\n';
      analysis.rankings.forEach(r => {
        content += `#${r.rank} - ${r.candidateName}\n`;
        content += `Explanation: ${r.explanation}\n\n`;
      });
      
      content += 'INTERVIEW QUESTIONS FOR TOP CANDIDATE\n';
      content += '-------------------------------------\n';
      analysis.interviewQuestions.forEach((q, i) => {
        content += `${i + 1}. ${q}\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-shortlist-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setToast({ message: 'Export downloaded successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to export analysis', type: 'error' });
    }
  };

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light text-brand mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
        </div>
        <h2 className="text-2xl font-bold text-navy-heading mb-3">No AI Analysis Found</h2>
        <p className="text-text-muted mb-8">Run an AI match from the shortlist page to see results here.</p>
        <Link to="/shortlist" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-pill font-semibold hover:bg-brand-dark transition-colors">
          Go to Shortlist <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      
      <div className="mb-6">
        <Link to="/shortlist" className="inline-flex items-center gap-1 text-sm font-semibold text-text-muted hover:text-navy-heading transition-colors mb-4">
          <ChevronLeft size={16} /> Back to Shortlist
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-navy-heading tracking-[-0.03em] mb-1 flex items-center gap-3">
              AI Shortlist Analysis
              <span className="bg-brand-light text-brand text-[11px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider">GPT-4o</span>
            </h1>
            <p className="text-text-muted text-sm">Intelligent candidate ranking and evaluation</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-white border-[1.5px] border-border text-navy-heading px-5 py-2 rounded-pill font-semibold text-sm hover:border-navy-heading transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export as .txt
          </button>
        </div>
      </div>

      <div className="bg-brand-light border-l-4 border-brand p-6 rounded-r-card mb-8">
        <h3 className="font-bold text-navy-heading mb-2 text-lg">Executive Summary</h3>
        <p className="text-text-body leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-navy-heading mb-2">Ranked Candidates</h2>
          {analysis.rankings.map((rank) => (
            <div key={rank.rank} className="bg-white rounded-card p-5 border border-border relative overflow-hidden group">
              <div className="flex gap-5">
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg min-w-[60px] h-[60px] border border-gray-100">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rank</span>
                  <span className={`text-2xl font-black ${rank.rank === 1 ? 'text-brand' : 'text-navy-heading'}`}>
                    #{rank.rank}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy-heading text-lg mb-1">{rank.candidateName}</h3>
                  <div className="bg-surface p-3 rounded-lg border border-gray-100 mt-2">
                    <p className="text-sm text-text-body italic leading-relaxed">"{rank.explanation}"</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-navy rounded-card p-6 border border-navy-heading sticky top-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-full text-brand-mid">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h2 className="text-lg font-bold">Interview Prep</h2>
            </div>
            
            <p className="text-sm text-white/70 mb-5">
              Suggested technical questions tailored specifically for <span className="font-semibold text-white">{analysis.rankings[0]?.candidateName}</span> (Top Candidate):
            </p>

            <ol className="flex flex-col gap-4">
              {analysis.interviewQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed">{q}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
