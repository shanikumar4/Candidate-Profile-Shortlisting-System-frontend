import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, MessageSquare, Mail, Star, HelpCircle,
  Copy, Check, Users, ExternalLink, Phone, Linkedin, Globe, Plus, FileText
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import MatchScoreBar from '../components/charts/MatchScoreBar';
import StageBadge from '../components/StageBadge';
import GhostRiskIndicator from '../components/GhostRiskIndicator';
import CandidateAvatar from '../components/ui/CandidateAvatar';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  getCandidate, scoreCandidate, updateCandidate, getInterviewQuestions,
  getEmailTemplate, explainScore, addNote,
} from '../api/candidates';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'];
const EMAIL_TYPES = ['screening', 'interview', 'rejection', 'offer'];

const ScoreRing = ({ score }) => {
  const isNull = score === null || score === undefined;
  const color = isNull ? 'var(--text-muted)' : score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--accent)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 40;
  const offset = isNull ? circumference : circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={90} height={90} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx={45} cy={45} r={40} fill="none" stroke="var(--bg-elevated)" strokeWidth={6} />
        <circle
          cx={45} cy={45} r={40}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: score >= 80 ? `drop-shadow(0 0 6px ${color})` : 'none' }}
        />
      </svg>
      <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: isNull ? 'var(--text-muted)' : 'var(--text-primary)', zIndex: 1 }}>
        {isNull ? '—' : score}
      </div>
    </div>
  );
};

const CandidateProfilePage = ({ onMenuClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Modal states
  const [questionsModal, setQuestionsModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  const [emailModal, setEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('screening');
  const [emailContent, setEmailContent] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [xaiModal, setXaiModal] = useState(false);
  const [xaiData, setXaiData] = useState(null);
  const [loadingXai, setLoadingXai] = useState(false);

  const [scoring, setScoring] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const load = async () => {
    try {
      const data = await getCandidate(id);
      setCandidate(data.candidate);
    } catch { toast.error('Candidate not found'); navigate('/candidates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleScore = async () => {
    setScoring(true);
    try {
      const data = await scoreCandidate(id);
      setCandidate(data.candidate);
      toast.success('AI scoring complete!');
    } catch (err) { toast.error(err.response?.data?.error || 'Scoring failed'); }
    finally { setScoring(false); }
  };

  const handleStageChange = async (stage) => {
    try {
      const data = await updateCandidate(id, { stage });
      setCandidate(data.candidate);
      toast.success(`Moved to ${stage}`);
    } catch { toast.error('Update failed'); }
  };

  const handleToggleShortlist = async () => {
    try {
      const data = await updateCandidate(id, { savedToShortlist: !candidate.savedToShortlist });
      setCandidate(data.candidate);
      toast.success(data.candidate.savedToShortlist ? 'Added to shortlist' : 'Removed from shortlist');
    } catch { toast.error('Update failed'); }
  };

  const handleGenerateQuestions = async () => {
    setQuestionsModal(true);
    setLoadingQuestions(true);
    try {
      const data = await getInterviewQuestions(id);
      setQuestions(data.questions || []);
    } catch { toast.error('Failed to generate questions'); }
    finally { setLoadingQuestions(false); }
  };

  const handleEmailTemplate = async () => {
    setLoadingEmail(true);
    try {
      const data = await getEmailTemplate(id, emailType);
      setEmailContent(data.template);
    } catch { toast.error('Failed to generate email'); }
    finally { setLoadingEmail(false); }
  };

  const handleXAI = async () => {
    setXaiModal(true);
    setLoadingXai(true);
    try {
      const data = await explainScore(id);
      setXaiData(data.explanation);
    } catch (err) { toast.error(err.response?.data?.error || 'XAI failed'); }
    finally { setLoadingXai(false); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const data = await addNote(id, noteText);
      setCandidate(c => ({ ...c, notes: data.notes }));
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const copyText = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (loading) return (
    <div className="page-enter">
      <Topbar title="Loading..." onMenuClick={onMenuClick} />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );

  if (!candidate) return null;

  const c = candidate;
  const job = c.jobId;

  return (
    <div className="page-enter">
      <Topbar
        title={c.name}
        subtitle={job?.title || 'No job assigned'}
        onMenuClick={onMenuClick}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              variant={c.savedToShortlist ? 'primary' : 'secondary'}
              size="sm"
              icon={<Star size={14} style={{ fill: c.savedToShortlist ? 'currentColor' : 'none' }} />}
              onClick={handleToggleShortlist}
            >
              {c.savedToShortlist ? 'Shortlisted' : 'Add to Shortlist'}
            </Button>
          </div>
        }
      />

      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: 24, maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* LEFT COLUMN: Summary & Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
              <ScoreRing score={c.matchScore} />
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
                AI Match Score
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <CandidateAvatar name={c.name} size={48} shortlisted={c.savedToShortlist} />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{c.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <Mail size={14} /> {c.email}
                </div>
                {c.resumeUrl && (
                  <div style={{ marginTop: 12 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FileText size={14} />}
                      onClick={() => window.open(c.resumeUrl, '_blank')}
                    >
                      View Resume
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Pipeline Stage</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STAGES.map(stage => {
                  const isRejected = stage === 'rejected';
                  const activeColor = isRejected ? 'var(--danger)' : 'var(--accent)';
                  const activeBg = isRejected ? 'var(--danger-dim)' : 'var(--accent-dim)';
                  const isActive = c.stage === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: isActive ? `1px solid ${activeColor}` : '1px solid var(--border)',
                        background: isActive ? activeBg : 'transparent',
                        color: isActive ? activeColor : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 13, cursor: 'pointer',
                        textAlign: 'left', textTransform: 'capitalize',
                        transition: 'all 0.12s ease',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
              {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Phone size={14} />{c.phone}</span>}
              {c.linkedinUrl && (
                <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', textDecoration: 'none', fontWeight: 500 }}>
                  <Linkedin size={14} />LinkedIn
                </a>
              )}
              {c.portfolioUrl && (
                <a href={c.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', textDecoration: 'none', fontWeight: 500 }}>
                  <Globe size={14} />Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* AI Actions Row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="ai" icon={<MessageSquare size={16} />} onClick={handleGenerateQuestions}>
              Generate Questions
            </Button>
            <Button variant="secondary" icon={<Mail size={16} />} onClick={() => setEmailModal(true)}>
              Send Email
            </Button>
            {c.matchScore !== null && (
              <Button variant="ghost" icon={<HelpCircle size={16} />} onClick={handleXAI}>
                Why this score?
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button variant="primary" loading={scoring} icon={<Zap size={16} />} onClick={handleScore}>
              {c.matchScore !== null ? 'Re-score with AI' : 'Score with AI'}
            </Button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {c.aiSummary ? (
              <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
                <div style={{ borderLeft: '3px solid var(--ai)', background: 'var(--ai-dim)', padding: '16px 20px', borderRadius: '0 6px 6px 0', fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  "{c.aiSummary}"
                </div>

                {(c.aiStrengths?.length > 0 || c.aiGaps?.length > 0) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
                    {c.aiStrengths?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Key Strengths</div>
                        {c.aiStrengths.map(s => (
                          <div key={s} style={{ fontSize: 14, color: 'var(--text-primary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                            <span style={{ lineHeight: 1.5 }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {c.aiGaps?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Identified Gaps</div>
                        {c.aiGaps.map(g => (
                          <div key={g} style={{ fontSize: 14, color: 'var(--text-primary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>✗</span>
                            <span style={{ lineHeight: 1.5 }}>{g}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 48, textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                <Zap size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No AI Analysis Yet</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Score this candidate to get insights, strengths, and gaps.</div>
                <Button variant="primary" loading={scoring} icon={<Zap size={16} />} onClick={handleScore}>Score Now</Button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {c.skills.map(s => (
                    <span key={s} style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', fontSize: 13, padding: '3px 10px', borderRadius: 4 }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Experience</div>
                  <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600 }}>{c.experience} years</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Ghost Risk</div>
                  <GhostRiskIndicator risk={c.ghostRisk} />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features (M13, M15, M18) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {c.aiFlags?.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Inferred Skills (Module 13)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.aiFlags.map(f => (
                    <div key={f} style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--ai)' }}>≈</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {c.teamFitScore !== null && c.teamFitScore !== undefined && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  <Users size={12} /> Team Fit (Module 15)
                </div>
                <MatchScoreBar score={c.teamFitScore} />
                {c.teamFitReason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>{c.teamFitReason}</div>}
              </div>
            )}

            {c.candidateExpScore !== null && c.candidateExpScore !== undefined && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Candidate Exp. (Module 18)</div>
                <MatchScoreBar score={c.candidateExpScore} />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Team Notes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {c.notes?.map((note, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{note.author}</span>
                    <span className="tabular">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{note.text}</div>
                </div>
              ))}
              {(!c.notes || c.notes.length === 0) && (
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes yet.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                placeholder="Add a note..."
                style={{
                  flex: 1, height: 40, padding: '0 14px',
                  border: '1px solid var(--border-strong)', borderRadius: 6,
                  fontSize: 14, fontFamily: 'var(--font-body)',
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.12s ease'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-border)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              />
              <Button icon={<Plus size={16} />} onClick={handleAddNote} loading={addingNote}>Post</Button>
            </div>
          </div>

        </div>
      </div>

      {/* AI Modals Implementation */}

      <Modal isOpen={questionsModal} onClose={() => setQuestionsModal(false)} title="AI Interview Questions" width={600}>
        {loadingQuestions ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Zap size={24} className="spin" style={{ margin: '0 auto 12px' }} />
            <div>Generating personalized questions...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {questions.map((q, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Q{i+1}.</span>
                <span>{q}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button icon={copiedQuestions ? <Check size={16}/> : <Copy size={16}/>} onClick={() => copyText(questions.join('\n\n'), setCopiedQuestions)}>
                {copiedQuestions ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={emailModal} onClose={() => setEmailModal(false)} title="AI Email Drafter" width={600}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {EMAIL_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setEmailType(type)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 13, textTransform: 'capitalize',
                background: emailType === type ? 'var(--accent-dim)' : 'transparent',
                color: emailType === type ? 'var(--accent)' : 'var(--text-secondary)',
                border: emailType === type ? '1px solid var(--accent)' : '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>
        
        <Button variant="primary" loading={loadingEmail} onClick={handleEmailTemplate} style={{ marginBottom: 20, width: '100%' }}>
          Generate {emailType} Email
        </Button>
        
        {emailContent && !loadingEmail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: 8 }}>Subject:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{emailContent.subject}</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {emailContent.body}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button icon={copiedEmail ? <Check size={16}/> : <Copy size={16}/>} onClick={() => copyText(`Subject: ${emailContent.subject}\n\n${emailContent.body}`, setCopiedEmail)}>
                {copiedEmail ? 'Copied!' : 'Copy Text'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={xaiModal} onClose={() => setXaiModal(false)} title="Explainable AI Score" width={640}>
        {loadingXai ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Zap size={24} className="spin" style={{ margin: '0 auto 12px' }} />
            <div>Analyzing score calculation...</div>
          </div>
        ) : xaiData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: 16, background: 'var(--ai-dim)', border: '1px solid var(--ai)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{xaiData.verdict}"
            </div>
            
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Skill Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {xaiData.skillBreakdown?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.skill}</span>
                      <span style={{ 
                        fontSize: 11, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 600,
                        background: item.status === 'matched' ? 'var(--success-dim)' : item.status === 'inferred' ? 'var(--accent-dim)' : 'var(--danger-dim)',
                        color: item.status === 'matched' ? 'var(--success)' : item.status === 'inferred' ? 'var(--accent)' : 'var(--danger)',
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>+{item.contribution} pts</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>weight: {item.weight}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Experience Contribution</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                  Required: <span style={{ fontWeight: 600 }}>{xaiData.experienceContribution?.required}</span> | Actual: <span style={{ fontWeight: 600 }}>{xaiData.experienceContribution?.actual}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  +{xaiData.experienceContribution?.contribution} pts
                </div>
              </div>
            </div>
            
            {xaiData.resumePdfContribution && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Resume PDF Analysis</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', maxWidth: '75%', lineHeight: 1.5 }}>
                    "{xaiData.resumePdfContribution.note}"
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    +{xaiData.resumePdfContribution.contribution} pts
                  </div>
                </div>
              </div>
            </div>
            )}

            {xaiData.bonusContribution && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Bonus / Nice-to-have</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', maxWidth: '75%', lineHeight: 1.5 }}>
                    "{xaiData.bonusContribution.note}"
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    +{xaiData.bonusContribution.contribution} pts
                  </div>
                </div>
              </div>
            </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderRadius: '0 0 8px 8px', margin: '0 -24px -20px' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Total Calculated Score</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-accent)' }}>{xaiData.totalScore}/100</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CandidateProfilePage;
