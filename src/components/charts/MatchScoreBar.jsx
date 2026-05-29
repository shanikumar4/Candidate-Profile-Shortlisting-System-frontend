const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'var(--text-muted)';
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--accent)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
};

const MatchScoreBar = ({ score, size = 'md', showLabel = true }) => {
  const color = getScoreColor(score);
  const barH = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const isHigh = score >= 80;

  if (score === null || score === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 4, height: barH, flex: 1,
          overflow: 'hidden'
        }}>
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
        {showLabel && <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', minWidth: 38 }}>—</span>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 4, height: barH, flex: 1,
        overflow: 'hidden'
      }}>
        <div className="score-bar-fill" style={{
          width: `${score}%`,
          background: color,
          height: '100%',
          borderRadius: 4,
          ...(isHigh ? { filter: `drop-shadow(0 0 4px ${color})`, opacity: 0.9 } : {})
        }} />
      </div>
      {showLabel && (
        <span className="tabular" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color,
          minWidth: 38,
          fontWeight: 600,
        }}>
          {score}%
        </span>
      )}
    </div>
  );
};

export { getScoreColor };
export default MatchScoreBar;
