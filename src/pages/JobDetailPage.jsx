import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, List, LayoutGrid, Zap, Download, Users, Lock, Unlock } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import MatchScoreBar from '../components/charts/MatchScoreBar';
import StageBadge from '../components/StageBadge';
import GhostRiskIndicator from '../components/GhostRiskIndicator';
import CandidateAvatar from '../components/ui/CandidateAvatar';
import { SkeletonTable } from '../components/ui/Skeleton';
import KanbanBoard from '../features/candidates/KanbanBoard';
import { getJob, updateJob } from '../api/jobs';
import { getCandidates, bulkScore, exportCandidates } from '../api/candidates';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const JobDetailPage = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' | 'kanban'
  const [scoring, setScoring] = useState(false);

  const load = async () => {
    try {
      const [jobData, cData] = await Promise.all([
        getJob(id),
        getCandidates({ jobId: id, limit: 100 }),
      ]);
      setJob(jobData.job);
      setCandidates(cData.candidates || []);
    } catch { toast.error('Failed to load job'); navigate('/jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleBulkScore = async () => {
    setScoring(true);
    try {
      const res = await bulkScore(id);
      toast.success(`Scored ${res.scored} candidates!`);
      load();
    } catch { toast.error('Bulk scoring failed'); }
    finally { setScoring(false); }
  };

  const handleToggleStatus = async () => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      const data = await updateJob(id, { status: newStatus });
      setJob(data.job);
      toast.success(`Job marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update job status');
    }
  };

  const handleCandidateUpdate = (updatedCandidate) => {
    setCandidates(cs => cs.map(c => c._id === updatedCandidate._id ? updatedCandidate : c));
  };

  if (loading) return (
    <div className="page-enter">
      <Topbar title="Loading..." onMenuClick={onMenuClick} />
      <div style={{ padding: 32 }}><SkeletonTable rows={5} /></div>
    </div>
  );

  return (
    <div className="page-enter">
      <Topbar
        title={job?.title || 'Job Detail'}
        subtitle={`${candidates.length} candidates — ${job?.department || ''}`}
        onMenuClick={onMenuClick}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/jobs')}>
              Jobs
            </Button>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <button
                onClick={() => setView('table')}
                aria-label="Table view"
                style={{
                  padding: '6px 14px', background: view === 'table' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: 'none', cursor: 'pointer', color: view === 'table' ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s'
                }}
              >
                <List size={16} />
              </button>
              <div style={{ width: 1, background: 'var(--border-strong)' }} />
              <button
                onClick={() => setView('kanban')}
                aria-label="Kanban view"
                style={{
                  padding: '6px 14px', background: view === 'kanban' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: 'none', cursor: 'pointer', color: view === 'kanban' ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <Button variant="ai" size="sm" loading={scoring} icon={<Zap size={14} />} onClick={handleBulkScore}>
              Score All
            </Button>
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => exportCandidates({ jobId: id })}>
              Export
            </Button>
            {user?.role !== 'manager' && (
              job?.status === 'open' ? (
                <Button variant="danger" size="sm" icon={<Lock size={14} />} onClick={handleToggleStatus}>
                  Close Job
                </Button>
              ) : (
                <Button variant="secondary" size="sm" icon={<Unlock size={14} />} onClick={handleToggleStatus}>
                  Reopen Job
                </Button>
              )
            )}
          </div>
        }
      />

      {/* Job Summary Bar */}
      {job && (
        <div style={{ padding: '16px 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 32, flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Required: <strong style={{ color: 'var(--text-primary)' }}>{job.requiredSkills.join(', ')}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>Min exp: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>{job.minExperience}yr</strong></span>
          {job.deadline && <span style={{ color: 'var(--text-muted)' }}>Deadline: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>{new Date(job.deadline).toLocaleDateString()}</strong></span>}
        </div>
      )}

      <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {view === 'kanban' ? (
          <KanbanBoard candidates={candidates} onUpdate={handleCandidateUpdate} />
        ) : (
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {candidates.length === 0 ? (
              <div style={{ padding: 80, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 20 }}>
                  <Users size={28} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No candidates yet</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Share the application link: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-primary)', border: '1px solid var(--border)' }}>/apply/{job?.publicFormSlug}</code>
                </div>
                <Button size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply/${job?.publicFormSlug}`); toast.success('Link copied'); }}>
                  Copy Link
                </Button>
              </div>
            ) : (
              <table className="hiq-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Stage</th>
                    <th>Match Score</th>
                    <th>Ghost Risk</th>
                    <th>Experience</th>
                    <th>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
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
                      <td><GhostRiskIndicator risk={c.ghostRisk} showLabel={false} /></td>
                      <td><span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{c.experience}y</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.skills.slice(0, 3).map(s => (
                            <span key={s} style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{s}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
