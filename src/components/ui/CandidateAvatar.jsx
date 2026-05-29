const COLORS = ['#1E3A5F', '#1A3A2A', '#3A1A3A', '#3A2A1A', '#1A2A3A', '#2A1A3A'];

const getHashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return COLORS[hash % COLORS.length];
};

const CandidateAvatar = ({ name, size = 32, shortlisted = false }) => {
  const bg = getHashColor(name || 'Unknown');
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', fontSize: size * 0.45, fontWeight: 700, fontFamily: 'var(--font-body)',
      }}>
        {initial}
      </div>
      {shortlisted && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          background: 'var(--bg-surface)', borderRadius: '50%', padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CandidateAvatar;
