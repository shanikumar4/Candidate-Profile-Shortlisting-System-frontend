import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import CandidateForm from '../components/CandidateForm';
import CandidateCard from '../components/CandidateCard';
import SkeletonCard from '../components/SkeletonCard';
import Toast from '../components/Toast';
import { API_BASE_URL } from '../config';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCandidates = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const url = activeTab === 'saved' ? `${API_BASE_URL}/api/candidates/saved` : `${API_BASE_URL}/api/candidates?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setCandidates(data.candidates);
      if (data.candidates.length === 0 && activeTab === 'all' && search === '') {
        setShowForm(true);
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCandidates]);

  const handleAddCandidate = async (candidateData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add candidate');
      
      setToast({ message: 'Candidate added successfully', type: 'success' });
      fetchCandidates(searchQuery);
      return true;
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSave = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${id}/save`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (activeTab === 'saved') {
        setCandidates(candidates.filter(c => c._id !== id));
      } else {
        setCandidates(candidates.map(c => c._id === id ? data.candidate : c));
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setToast({ message: 'Candidate deleted', type: 'success' });
      setCandidates(candidates.filter(c => c._id !== id));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-heading tracking-[-0.03em] mb-1">Candidates</h1>
          <p className="text-text-muted text-sm">Manage your talent pool</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-navy-heading text-white px-5 py-2 rounded-pill font-semibold text-sm hover:bg-black transition-colors"
        >
          {showForm ? 'Close Form' : 'Add Candidate'}
        </button>
      </div>

      {showForm && <CandidateForm onSubmit={handleAddCandidate} isLoading={submitting} />}

      <div className="bg-white rounded-t-card border-t border-x border-border flex flex-col md:flex-row items-center justify-between p-4 md:p-2 gap-4">
        <div className="flex p-1 bg-gray-100 rounded-pill w-full md:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 md:flex-none px-6 py-1.5 rounded-pill text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white text-navy-heading shadow-sm' : 'text-gray-500 hover:text-navy-heading'}`}
          >
            All Candidates
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 md:flex-none px-6 py-1.5 rounded-pill text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'saved' ? 'bg-white text-navy-heading shadow-sm' : 'text-gray-500 hover:text-navy-heading'}`}
          >
            Saved Shortlist
          </button>
        </div>
        
        {activeTab === 'all' && (
          <div className="relative w-full md:w-auto md:mr-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="pl-9 pr-4 py-1.5 border border-border rounded-pill text-sm outline-none focus:border-brand w-full md:w-64 text-text-body transition-colors bg-surface"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="bg-surface border-x border-b border-border rounded-b-card p-6 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : candidates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidates.map(candidate => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onToggleSave={handleToggleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-muted mb-4">No candidates found.</p>
            {activeTab === 'all' && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-brand font-semibold hover:underline"
              >
                Add your first candidate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
