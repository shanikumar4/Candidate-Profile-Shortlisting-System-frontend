import { useEffect, useState } from 'react';
import { Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { getJobs } from '../api/jobs';
import { runBiasReport } from '../api/bias';
import toast from 'react-hot-toast';

const DEIGauge = ({ score }) => {
  const color = score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const label = score >= 70 ? 'Fair' : score >= 40 ? 'Needs Review' : 'At Risk';
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={100} cy={100} r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth={16} />
        <circle
          cx={100} cy={100} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        <text x={100} y={100} textAnchor="middle" dominantBaseline="central"
          className="tabular"
          style={{ fill: color, fontSize: 40, fontFamily: 'var(--font-mono)', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 600, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
};

const BiasReportPage = ({ onMenuClick }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    getJobs().then(d => setJobs(d.jobs || [])).catch(() => toast.error('Failed to load jobs')).finally(() => setLoadingJobs(false));
  }, []);

  const handleRunReport = async () => {
    if (!selectedJob) { toast.error('Select a job'); return; }
    setLoading(true);
    setReport(null);
    try {
      const data = await runBiasReport(selectedJob);
      setReport(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Report failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-enter">
      <Topbar
        title="Bias Report"
        subtitle="DEI analysis and Four-Fifths Rule compliance"
        onMenuClick={onMenuClick}
      />

      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {/* Job Selector */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Run Bias Analysis</h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Select a job to analyze its shortlisted candidates for keyword proxy bias, experience-score mismatches,
            and Four-Fifths Rule compliance across experience tiers.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {loadingJobs ? <Skeleton width={280} height={40} /> : (
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                aria-label="Select job for bias analysis"
                style={{
                  height: 40, padding: '0 16px', border: '1px solid var(--border-strong)',
                  borderRadius: 6, background: 'var(--bg-elevated)',
                  fontSize: 14, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', minWidth: 320, outline: 'none',
                  transition: 'border-color 0.12s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Select a job...</option>
                {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            )}
            <Button size="lg" icon={<Zap size={16} />} loading={loading} onClick={handleRunReport}>
              Run Report
            </Button>
          </div>
        </div>

        {/* Report Results */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={120} />)}
          </div>
        )}

        {report && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* DEI Gauge Area */}
            <div className="card" style={{ padding: 40, display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
              <DEIGauge score={report.deiScore} />
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {report.jobTitle}
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.deiScore}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Composite DEI Score</div>
                  </div>
                  <div>
                    <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--ai)' }}>{report.overallFairnessScore}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI Fairness Score</div>
                  </div>
                  <div>
                    <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{report.shortlistCount}/{report.totalApplicants}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Shortlisted</div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px', background: 'var(--ai-dim)', borderLeft: '3px solid var(--ai)', borderRadius: '0 6px 6px 0', fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  "{report.aiSummary}"
                </div>
              </div>
            </div>

            {/* Four-Fifths Table */}
            {report.fourFifthsResults?.length > 0 && (
              <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Four-Fifths Rule by Experience Tier</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Selection rate should be ≥ 80% of the highest-rate tier</div>
                </div>
                <table className="hiq-table">
                  <thead>
                    <tr>
                      <th>Experience Tier</th>
                      <th>Applied</th>
                      <th>Shortlisted</th>
                      <th>Selection Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.fourFifthsResults.map(t => {
                      const maxRate = Math.max(...report.fourFifthsResults.map(x => x.rate));
                      const ok = t.rate >= maxRate * 0.8;
                      return (
                        <tr key={t.tier}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.tier}</td>
                          <td><span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>{t.applied}</span></td>
                          <td><span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>{t.shortlisted}</span></td>
                          <td><span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{(t.rate * 100).toFixed(0)}%</span></td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: ok ? 'var(--success)' : 'var(--danger)' }}>
                              {ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                              {ok ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Keyword Flags */}
            {report.keywordFlags?.length > 0 && (
              <div className="card" style={{ padding: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                  Keyword Proxy Bias Flags
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {report.keywordFlags.map((flag, i) => (
                    <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-surface)', borderLeft: '3px solid var(--warning)', border: '1px solid var(--border)', borderLeftColor: 'var(--warning)', borderRadius: '0 6px 6px 0' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{flag.candidateName}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14, marginLeft: 12 }}>{flag.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.keywordFlags?.length === 0 && (
              <div className="card" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
                <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>No keyword bias detected</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your shortlist shows no signs of keyword proxy bias.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiasReportPage;
