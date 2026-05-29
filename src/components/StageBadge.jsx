const STAGE_CONFIG = {
  applied: { label: 'Applied', bg: '#1E2D40', color: '#60A5FA', border: '#2A4A6E' },
  screening: { label: 'Screening', bg: '#2D1E00', color: '#FBB040', border: '#6E4A10' },
  interview: { label: 'Interview', bg: '#0D2D1A', color: '#34D399', border: '#1A5C38' },
  offer: { label: 'Offer', bg: '#1A1040', color: '#A78BFA', border: '#4A2DAE' },
  rejected: { label: 'Rejected', bg: '#2D1010', color: '#F87171', border: '#6E2020' },
  hired: { label: 'Hired ✓', bg: '#0D2D1A', color: '#10B981', border: '#10B98160' },
};

const StageBadge = ({ stage }) => {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG.applied;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: '2px 9px',
      borderRadius: '5px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      textTransform: 'uppercase'
    }}>
      {cfg.label}
    </span>
  );
};

export { STAGE_CONFIG };
export default StageBadge;
