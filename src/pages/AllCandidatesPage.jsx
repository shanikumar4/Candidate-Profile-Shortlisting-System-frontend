import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, MoveRight, Star, ArrowRight, X, CheckSquare, Square } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import MatchScoreBar from '../components/charts/MatchScoreBar';
import StageBadge from '../components/StageBadge';
import GhostRiskIndicator from '../components/GhostRiskIndicator';
import CandidateAvatar from '../components/ui/CandidateAvatar';
import { SkeletonTable } from '../components/ui/Skeleton';
import { getCandidates, bulkStage, exportCandidates } from '../api/candidates';
import toast from 'react-hot-toast';

const STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'];

const AllCandidatesPage = ({ onMenuClick }) => {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterShortlisted, setFilterShortlisted] = useState(false);
  const [bulkStageVal, setBulkStageVal] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStage) params.stage = filterStage;
      if (filterRisk) params.ghostRisk = filterRisk;
      if (filterShortlisted) params.shortlisted = 'true';
      const data = await getCandidates(params);
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load candidates'); }
    finally { setLoading(false); }
  }, [search, filterStage, filterRisk, filterShortlisted]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleSelect = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(s => s.length === candidates.length ? [] : candidates.map(c => c._id));

  const handleBulkStage = async () => {
    if (!bulkStageVal) { toast.error('Select a stage'); return; }
    try {
      await bulkStage(selected, bulkStageVal);
      toast.success(`Moved ${selected.length} candidates to ${bulkStageVal}`);
      setSelected([]);
      setBulkStageVal('');
      load();
    } catch { toast.error('Bulk update failed'); }
  };

  const activeFilters = [filterStage, filterRisk, filterShortlisted].filter(Boolean).length;

  return (
    <div className="page-enter">
      <Topbar
        title="All Candidates"
        subtitle={`${total} total across all jobs`}
        onMenuClick={onMenuClick}
        actions={
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => exportCandidates({ stage: filterStage })}>
            Export CSV
          </Button>
        }
      />

      <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              placeholder="Search candidates, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', height: 36, padding: '0 32px 0 38px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                borderRadius: 6, color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
                transition: 'all 0.12s'
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            style={{
              height: 36, padding: '0 12px', border: '1px solid var(--border-strong)',
              borderRadius: 6, background: 'var(--bg-elevated)',
              fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', outline: 'none'
            }}
          >
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            style={{
              height: 36, padding: '0 12px', border: '1px solid var(--border-strong)',
              borderRadius: 6, background: 'var(--bg-elevated)',
              fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', outline: 'none'
            }}
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Ghost Risk</option>
            <option value="medium">Medium Ghost Risk</option>
            <option value="high">High Ghost Risk</option>
          </select>

          <Button
            variant={filterShortlisted ? 'primary' : 'secondary'}
            size="sm"
            icon={<Star size={14} />}
            onClick={() => setFilterShortlisted(f => !f)}
          >
            Shortlisted
          </Button>

          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStage(''); setFilterRisk(''); setFilterShortlisted(false); }}>
              Clear ({activeFilters})
            </Button>
          )}
        </div>

        {/* Bulk Action Toolbar */}
        {selected.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', marginBottom: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent)',
            boxShadow: '0 0 0 1px var(--accent-border)',
            borderRadius: 6,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
              {selected.length} selected
            </span>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <select
              value={bulkStageVal}
              onChange={e => setBulkStageVal(e.target.value)}
              style={{
                height: 32, padding: '0 12px', border: '1px solid var(--border-strong)',
                borderRadius: 4, background: 'var(--bg-elevated)',
                fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--text-primary)'
              }}
            >
              <option value="">Move to stage...</option>
              {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <Button size="sm" icon={<MoveRight size={14} />} onClick={handleBulkStage}>Apply</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Deselect</Button>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <SkeletonTable rows={6} /> : candidates.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No candidates found</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <table className="hiq-table">
              <thead>
                <tr>
                  <th style={{ width: 44, paddingLeft: 20 }}>
                    <button onClick={toggleAll} aria-label="Select all" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {selected.length === candidates.length ? <CheckSquare size={16} style={{ color: 'var(--accent)' }} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th>Candidate</th>
                  <th>Skills</th>
                  <th>Stage</th>
                  <th>Match Score</th>
                  <th>Risk</th>
                  <th>Exp</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr
                    key={c._id}
                    className={selected.includes(c._id) ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/candidates/${c._id}`)}
                  >
                    <td onClick={e => { e.stopPropagation(); toggleSelect(c._id); }} style={{ paddingLeft: 20 }}>
                      <button aria-label={`Select ${c.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.includes(c._id) ? 'var(--accent)' : 'var(--text-muted)', display: 'flex' }}>
                        {selected.includes(c._id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CandidateAvatar name={c.name} size={32} shortlisted={c.savedToShortlist} />
                        <div>
                          <div className="primary-text">
                            {c.name}
                          </div>
                          <div className="secondary-text">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {c.skills.slice(0, 3).map(s => (
                          <span key={s} style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{s}</span>
                        ))}
                        {c.skills.length > 3 && <span style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td><StageBadge stage={c.stage} /></td>
                    <td style={{ minWidth: 140 }}>
                      <MatchScoreBar score={c.matchScore} size="sm" />
                    </td>
                    <td>
                      <GhostRiskIndicator risk={c.ghostRisk} showLabel={false} />
                    </td>
                    <td>
                      <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.experience}y</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ArrowRight size={16} style={{ color: 'var(--text-muted)', transition: 'color 0.12s' }} className="row-arrow" />
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

export default AllCandidatesPage;
