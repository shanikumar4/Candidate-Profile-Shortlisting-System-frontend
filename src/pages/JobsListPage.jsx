import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, ArrowRight, Briefcase, Link } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import TagInput from '../components/ui/TagInput';
import { SkeletonCard } from '../components/ui/Skeleton';
import { getJobs, createJob, generateJDPreview } from '../api/jobs';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const JobsListPage = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', department: '', requiredSkills: [], description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setSubmitting(true);
    try {
      const data = await createJob(form);
      setJobs([data.job, ...jobs]);
      setModalOpen(false);
      setForm({ title: '', department: '', requiredSkills: [], description: '' });
      if (data.job.publicFormSlug) {
        navigator.clipboard.writeText(`${window.location.origin}/apply/${data.job.publicFormSlug}`);
        toast.success('Job created & link copied!');
      } else {
        toast.success('Job created!');
      }
    } catch { toast.error('Creation failed'); }
    finally { setSubmitting(false); }
  };

  const handleGenerateJD = async () => {
    if (!form.title) return toast.error('Enter a job title first');
    // Clear existing description immediately so user sees it's refreshing
    setForm(f => ({ ...f, description: '' }));
    setGenerating(true);
    try {
      const res = await generateJDPreview(form.title, form.requiredSkills);
      const generated = res.generated || {};
      setForm(f => ({ 
        ...f, 
        description: generated.description || '', 
        requiredSkills: generated.requiredSkills?.length ? generated.requiredSkills : f.requiredSkills,
      }));
      if (res.warning) {
        toast('JD Generated (fallback mode)', { icon: '⚠️' });
      } else {
        toast.success('JD Generated ✓');
      }
    } catch { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };


  return (
    <div className="page-enter">
      <Topbar
        title="Jobs"
        subtitle="Manage open roles and generate JDs"
        onMenuClick={onMenuClick}
        actions={
          user?.role !== 'manager' ? (
            <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              New Job
            </Button>
          ) : null
        }
      />

      <div className="page-container" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div className="responsive-grid-3" style={{ gap: 20 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', marginBottom: 20 }}>
              <Briefcase size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No jobs yet</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Create your first job to start shortlisting candidates.</div>
            {user?.role !== 'manager' && (
              <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Create Job</Button>
            )}
          </div>
        ) : (
          <div className="responsive-grid-3" style={{ gap: 20 }}>
            {jobs.map(j => (
              <div
                key={j._id}
                className="card"
                style={{ cursor: 'pointer', transition: 'transform 0.12s, border-color 0.12s', padding: '24px 24px 20px', display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate(`/jobs/${j._id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{j.title}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{j.department || 'No department'}</div>
                  </div>
                  <span style={{
                    background: j.status === 'open' ? 'var(--success-dim)' : 'var(--danger-dim)', 
                    color: j.status === 'open' ? 'var(--success)' : 'var(--danger)',
                    border: j.status === 'open' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(248,113,113,0.3)',
                    padding: '2px 8px', borderRadius: 4,
                    fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase'
                  }}>
                    {j.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24, flex: 1 }}>
                  {j.requiredSkills?.slice(0, 4).map(s => (
                    <span key={s} style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                      {s}
                    </span>
                  ))}
                  {j.requiredSkills?.length > 4 && (
                    <span style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, padding: '1px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                      +{j.requiredSkills.length - 4}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> <span className="tabular">{j.candidateCount || 0}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> <span className="tabular">{new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/apply/${j.publicFormSlug}`);
                        toast.success('Application link copied!');
                      }}
                      style={{ background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12, padding: '4px 8px', borderRadius: 4, transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      title="Copy Application Link"
                    >
                      <Link size={13} /> Link
                    </button>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Job"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input label="Job Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input label="Department" required value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />

          <div>
            <TagInput label="Required Skills" tags={form.requiredSkills} onChange={v => setForm(f => ({ ...f, requiredSkills: v }))} id="job-skills" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Job Description</label>
              <Button type="button" variant="ai" size="sm" onClick={handleGenerateJD} loading={generating} icon={<Briefcase size={12} />}>
                Generate JD
              </Button>
            </div>
            <Textarea rows={6} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Job</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobsListPage;
