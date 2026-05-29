import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Clock, ArrowRight, Zap, Star } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import { SkeletonCard } from '../components/ui/Skeleton';
import { getOverview } from '../api/analytics';
import { getCandidates } from '../api/candidates';
import MatchScoreBar from '../components/charts/MatchScoreBar';
import StageBadge from '../components/StageBadge';
import GhostRiskIndicator from '../components/GhostRiskIndicator';
import Button from '../components/ui/Button';
import CandidateAvatar from '../components/ui/CandidateAvatar';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const KpiCard = ({ label, value, sub, icon: Icon, color = 'var(--accent)', loading }) => (
  <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', minHeight: 110 }}>
    {loading ? (
      <div>
        <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 4, marginBottom: 14 }} />
        <div className="skeleton" style={{ width: '50%', height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '70%', height: 14 }} />
      </div>
    ) : (
      <>
        <Icon size={20} style={{ color, marginBottom: 14 }} />
        <div className="tabular kpi-number">{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </>
    )}
  </div>
);

const DashboardPage = ({ onMenuClick }) => {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, cands] = await Promise.all([
          getOverview(),
          getCandidates({ limit: 5, sort: '-createdAt' }),
        ]);
        setOverview(ov);
        setRecent(cands.candidates || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]}`;

  return (
    <div className="page-enter">
      <Topbar
        title="Dashboard"
        subtitle="Pipeline Overview"
        onMenuClick={onMenuClick}
        actions={
          <Button size="sm" icon={<Zap size={14} />} onClick={() => navigate('/candidates')}>
            View all
          </Button>
        }
      />

      <div style={{ padding: '32px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Big Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            {greeting}
          </h1>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-border)' }} />
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginBottom: 36 }}>
          <KpiCard label="Total Candidates" value={overview?.total} icon={Users} loading={loading} />
          <KpiCard label="Shortlisted" value={overview?.shortlisted} icon={Star} color="var(--accent)" loading={loading}
            sub={overview?.total ? `${Math.round((overview.shortlisted / overview.total) * 100)}% of pipeline` : null}
          />
          <KpiCard label="Avg Match Score" value={overview?.avgScore ? `${overview.avgScore}%` : null} icon={TrendingUp} color="var(--ai)" loading={loading} />
          <KpiCard label="Avg Time-to-Hire" value={overview?.avgTimeToHire ? `${overview.avgTimeToHire}d` : 'N/A'} icon={Clock} color="var(--warning)" loading={loading}
            sub="days from applied to hired"
          />
        </div>

        {/* Recent Candidates */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
              Recent Candidates
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: 0 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '30%', height: 16, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '20%', height: 12 }} />
                  </div>
                  <div className="skeleton" style={{ width: 60, height: 24 }} />
                  <div className="skeleton" style={{ width: 100, height: 8 }} />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 20 }}>
                <Users size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No candidates yet</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Add your first candidate or share a job application link</div>
              <Button size="sm" onClick={() => navigate('/jobs')}>View Jobs</Button>
            </div>
          ) : (
            <table className="hiq-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Stage</th>
                  <th>Match Score</th>
                  <th>Ghost Risk</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(c => (
                  <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/candidates/${c._id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CandidateAvatar name={c.name} size={32} shortlisted={c.savedToShortlist} />
                        <div>
                          <div className="primary-text">{c.name}</div>
                          <div className="secondary-text">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><StageBadge stage={c.stage} /></td>
                    <td style={{ minWidth: 160 }}><MatchScoreBar score={c.matchScore} size="sm" /></td>
                    <td><GhostRiskIndicator risk={c.ghostRisk} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)', transition: 'color 0.12s ease' }} className="row-arrow" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <style>{`.hiq-table tbody tr:hover .row-arrow { color: var(--accent) !important; }`}</style>
      </div>
    </div>
  );
};

export default DashboardPage;
