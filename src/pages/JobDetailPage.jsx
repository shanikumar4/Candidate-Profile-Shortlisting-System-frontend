import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, List, LayoutGrid, Zap, Download, Users, Lock, Unlock, Link as LinkIcon } from 'lucide-react';
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

  const copyLink = () => {
    if (job?.publicFormSlug) {
      navigator.clipboard.writeText(`${window.location.origin}/apply/${job.publicFormSlug}`);
      toast.success('Application link copied!');
    }
  };

  if (loading) return (
    <div className="page-enter">
      <Topbar title="Loading..." onMenuClick={onMenuClick} />
      <div style={{ padding: 24 }}><SkeletonTable rows={5} /></div>
    </div>
  );

  return (
    <div className="page-enter">
      <Topbar
        title={job?.title || 'Job Detail'}
        subtitle={`${candidates.length} candidates`}
        onMenuClick={onMenuClick}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Back button */}
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/jobs')}>
              <span className="hide-mobile">Jobs</span>
            </Button>

            {/* View toggle: Table / Kanban */}
            <div style={{
              display: 'flex',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setView('table')}
                aria-label="Table view"
                title="Table view"
                style={{
                  padding: '6px 10px',
                  background: view === 'table' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: 'none', cursor: 'pointer',
                  color: view === 'table' ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                }}
              >
                <List size={15} />
              </button>
              <div style={{ width: 1, background: 'var(--border-strong)' }} />
              <button
                onClick={() => setView('kanban')}
                aria-label="Kanban view"
                title="Kanban view"
                style={{
                  padding: '6px 10px',
                  background: view === 'kanban' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: 'none', cursor: 'pointer',
                  color: view === 'kanban' ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                }}
              >
                <LayoutGrid size={15} />
              </button>
            </div>

            {/* Score All — icon-only on mobile */}
            <Button
              variant="ai"
              size="sm"
              loading={scoring}
              icon={<Zap size={14} />}
              onClick={handleBulkScore}
              title="Score All"
            >
              <span className="hide-mobile">Score All</span>
            </Button>

            {/* Export — icon-only on mobile */}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => exportCandidates({ jobId: id })}
              title="Export CSV"
            >
              <span className="hide-mobile">Export</span>
            </Button>

            {/* Copy Link — icon only on mobile */}
            <Button
              variant="secondary"
              size="sm"
              icon={<LinkIcon size={14} />}
              onClick={copyLink}
              title="Copy application link"
            >
              <span className="hide-mobile">Copy Link</span>
            </Button>

            {/* Close/Reopen — icon-only on mobile */}
            {user?.role !== 'manager' && (
              job?.status === 'open' ? (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Lock size={14} />}
                  onClick={handleToggleStatus}
                  title="Close Job"
                >
                  <span className="hide-mobile">Close Job</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Unlock size={14} />}
                  onClick={handleToggleStatus}
                  title="Reopen Job"
                >
                  <span className="hide-mobile">Reopen</span>
                </Button>
              )
            )}
          </div>
        }
      />

      {/* Job Summary Bar — responsive */}
      {job && (
        <div style={{
          padding: '12px 20px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 13,
          alignItems: 'center',
        }}>
          {/* Status badge */}
          <span style={{
            padding: '2px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            background: job.status === 'open' ? 'var(--success-dim)' : 'var(--danger-dim)',
            color: job.status === 'open' ? 'var(--success)' : 'var(--danger)',
            border: job.status === 'open' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(248,113,113,0.3)',
          }}>
            {job.status}
          </span>

          {job.department && (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{job.department}</strong>
            </span>
          )}

          {job.requiredSkills?.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Required:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {job.requiredSkills.slice(0, 4).join(', ')}
                {job.requiredSkills.length > 4 ? ` +${job.requiredSkills.length - 4}` : ''}
              </strong>
            </span>
          )}

          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Min exp:{' '}
            <strong className="tabular" style={{ color: 'var(--text-primary)' }}>
              {job.minExperience}yr
            </strong>
          </span>

          {job.deadline && (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Deadline:{' '}
              <strong className="tabular" style={{ color: 'var(--text-primary)' }}>
                {new Date(job.deadline).toLocaleDateString()}
              </strong>
            </span>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="page-container" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {view === 'kanban' ? (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <KanbanBoard candidates={candidates} onUpdate={handleCandidateUpdate} />
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {candidates.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--bg-elevated)', marginBottom: 16,
                }}>
                  <Users size={28} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  No candidates yet
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Share the application link to start collecting applications
                </div>
                <Button size="sm" icon={<LinkIcon size={14} />} onClick={copyLink}>
                  Copy Application Link
                </Button>
              </div>
            ) : (
              /* Horizontally scrollable table on mobile */
              <div className="table-scroll-wrapper">
                <table className="hiq-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Stage</th>
                      <th>Match Score</th>
                      <th className="hide-mobile">Ghost Risk</th>
                      <th className="hide-mobile">Exp</th>
                      <th className="hide-mobile">Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr
                        key={c._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/candidates/${c._id}`)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CandidateAvatar name={c.name} size={32} shortlisted={c.savedToShortlist} />
                            <div style={{ minWidth: 0 }}>
                              <div className="primary-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                                {c.name}
                              </div>
                              <div className="secondary-text hide-mobile">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><StageBadge stage={c.stage} /></td>
                        <td style={{ minWidth: 130 }}><MatchScoreBar score={c.matchScore} size="sm" /></td>
                        <td className="hide-mobile"><GhostRiskIndicator risk={c.ghostRisk} showLabel={false} /></td>
                        <td className="hide-mobile">
                          <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                            {c.experience}y
                          </span>
                        </td>
                        <td className="hide-mobile">
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {c.skills.slice(0, 3).map(s => (
                              <span key={s} style={{
                                background: 'var(--bg-overlay)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                fontSize: 10, padding: '1px 6px',
                                borderRadius: 4,
                                fontFamily: 'var(--font-mono)',
                              }}>
                                {s}
                              </span>
                            ))}
                            {c.skills.length > 3 && (
                              <span style={{
                                background: 'var(--bg-overlay)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                                fontSize: 10, padding: '1px 6px',
                                borderRadius: 4,
                                fontFamily: 'var(--font-mono)',
                              }}>
                                +{c.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
