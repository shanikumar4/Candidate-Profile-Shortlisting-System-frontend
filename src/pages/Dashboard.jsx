import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bookmark, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    avgExp: 0,
    aiRuns: parseInt(localStorage.getItem('aiAnalysesCount') || '0', 10)
  });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/candidates`);
        const data = await res.json();
        
        if (data.success) {
          const candidates = data.candidates;
          const savedCount = candidates.filter(c => c.savedToShortlist).length;
          const totalExp = candidates.reduce((sum, c) => sum + c.experience, 0);
          const avg = candidates.length > 0 ? (totalExp / candidates.length).toFixed(1) : 0;
          
          setStats(prev => ({
            ...prev,
            total: candidates.length,
            saved: savedCount,
            avgExp: avg
          }));
          
          setRecentCandidates(candidates.slice(0, 5));
          
          const sortedByExp = [...candidates].sort((a, b) => b.experience - a.experience).slice(0, 10);
          setChartData(sortedByExp.map(c => ({ name: c.name.split(' ')[0], years: c.experience })));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-card p-6 border border-border relative overflow-hidden group hover:border-brand-mid transition-colors">
      <div className="absolute top-0 left-6 w-6 h-1 bg-brand rounded-b-md"></div>
      <div className="flex justify-between items-center mt-2">
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-brand mb-1">{title}</h3>
          <p className="text-[28px] font-bold text-navy-heading leading-none">{value}</p>
        </div>
        <div className="p-3 bg-brand-light rounded-full text-brand-dark">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-heading tracking-[-0.03em] mb-1">Dashboard</h1>
          <p className="text-text-muted text-sm">Overview of your candidate pipeline</p>
        </div>
        <div className="flex gap-3">
          <Link to="/candidates" className="bg-white border-[1.5px] border-navy-heading text-navy-heading px-5 py-2 rounded-pill font-semibold text-sm hover:bg-gray-50 transition-colors">
            Add Candidate
          </Link>
          <Link to="/shortlist" className="bg-navy-heading text-white px-5 py-2 rounded-pill font-semibold text-sm hover:bg-black transition-colors">
            Run Shortlist
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Candidates" value={loading ? '-' : stats.total} icon={Users} />
        <StatCard title="Saved to Shortlist" value={loading ? '-' : stats.saved} icon={Bookmark} />
        <StatCard title="Avg. Experience" value={loading ? '-' : `${stats.avgExp}y`} icon={Clock} />
        <StatCard title="AI Analyses Run" value={stats.aiRuns} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-card p-6 border border-border">
          <h2 className="text-lg font-bold text-navy-heading mb-6">Top Candidates by Experience</h2>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="years" fill="#1D9E75" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-card p-6 border border-border flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-navy-heading">Recent Additions</h2>
            <Link to="/candidates" className="text-sm font-semibold text-brand hover:underline">View All</Link>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : recentCandidates.length > 0 ? (
              recentCandidates.map(candidate => (
                <div key={candidate._id} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm shrink-0">
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-navy-heading text-sm truncate">{candidate.name}</h4>
                    <p className="text-xs text-text-muted truncate">{candidate.skills.slice(0, 2).join(', ')}{candidate.skills.length > 2 ? '...' : ''}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted text-center py-8">No candidates added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
