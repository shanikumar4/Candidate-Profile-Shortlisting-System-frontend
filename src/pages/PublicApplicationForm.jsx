import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Input from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import TagInput from '../components/ui/TagInput';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const PublicApplicationForm = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', experience: '',
    skills: [], linkedinUrl: '', portfolioUrl: '', coverNote: '',
    resume: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`/api/public/form/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setJob(data.job);
      })
      .catch(() => setError('Failed to load application form'))
      .finally(() => setLoading(false));
  }, [slug]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.experience) e.experience = 'Experience is required';
    else if (isNaN(form.experience) || form.experience < 0) e.experience = 'Must be a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('experience', form.experience);
      fd.append('skills', JSON.stringify(form.skills));
      fd.append('linkedinUrl', form.linkedinUrl);
      fd.append('portfolioUrl', form.portfolioUrl);
      fd.append('coverNote', form.coverNote);
      if (form.resume) fd.append('resume', form.resume);

      const res = await fetch(`/api/public/apply/${slug}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <Loader2 size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: 16, margin: '0 auto' }} />
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Application Unavailable</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 28, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Application Submitted!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
          Thank you for applying to <strong>{job?.title}</strong>. We've received your application and our team will review it shortly.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--text-primary)' }}>Hire</span>
            <span style={{ color: 'var(--accent)' }}>IQ</span>
          </div>
          {job && <span style={{ background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Now Hiring</span>}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Job Info */}
        {job && (
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {job.title}
            </h1>
            {job.department && <div style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 500, marginBottom: 16 }}>{job.department}</div>}
            {job.description && <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 20 }}>{job.description}</p>}
            {job.requiredSkills?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {job.requiredSkills.map(s => (
                  <span key={s} style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 12, padding: '3px 10px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="card" style={{ padding: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 32, color: 'var(--text-primary)' }}>Your Application</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Input
                  label="Full Name" required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  error={errors.name}
                  placeholder="Priya Sharma"
                />
                <Input
                  label="Email Address" type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Years of Experience" type="number" required min="0" step="0.5"
                  value={form.experience}
                  onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                  error={errors.experience}
                  placeholder="3"
                />
              </div>

              <TagInput
                label="Your Skills"
                tags={form.skills}
                onChange={v => setForm(f => ({ ...f, skills: v }))}
                placeholder="React, TypeScript, Node.js..."
                id="app-skills"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Input
                  label="LinkedIn URL"
                  value={form.linkedinUrl}
                  onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                  placeholder="linkedin.com/in/yourname"
                />
                <Input
                  label="Portfolio / GitHub"
                  value={form.portfolioUrl}
                  onChange={e => setForm(f => ({ ...f, portfolioUrl: e.target.value }))}
                  placeholder="github.com/yourname"
                />
              </div>

              <Textarea
                label="Cover Note"
                value={form.coverNote}
                onChange={e => setForm(f => ({ ...f, coverNote: e.target.value }))}
                placeholder="Tell us why you're excited about this role..."
                rows={5}
              />

              {/* Resume Upload */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Resume (PDF) <span style={{ color: 'var(--text-muted)' }}>— optional</span>
                </label>
                <label
                  htmlFor="resume-upload"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '24px',
                    border: '1px dashed var(--border-strong)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14, color: 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                >
                  <Upload size={18} style={{ color: form.resume ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 500 }}>
                    {form.resume ? form.resume.name : 'Click to upload PDF (max 5MB)'}
                  </span>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={e => setForm(f => ({ ...f, resume: e.target.files[0] || null }))}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 8 }}>
                <Button type="submit" size="lg" loading={submitting} icon={<Send size={16} />} style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 16 }}>
                  Submit Application
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text-muted)' }}>
          Powered by <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>HireIQ</span> · Application is reviewed by a human
        </div>
      </div>
    </div>
  );
};

export default PublicApplicationForm;
