const RISK_CONFIG = {
  low: { label: 'Low', color: 'var(--success)', bg: 'var(--success-dim)' },
  medium: { label: 'Medium', color: 'var(--warning)', bg: 'var(--warning-dim)' },
  high: { label: 'High', color: 'var(--danger)', bg: 'var(--danger-dim)' },
};

const GhostRiskIndicator = ({ risk = 'low', showLabel = true }) => {
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.low;
  return (
    <span
      title={`Ghost Risk: ${cfg.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        color: cfg.color,
        background: showLabel ? cfg.bg : 'transparent',
        padding: showLabel ? '2px 8px' : '0',
        borderRadius: 4,
      }}
    >
      <span style={{ fontSize: 10, lineHeight: 1 }}>●</span>
      {showLabel && cfg.label}
    </span>
  );
};

export default GhostRiskIndicator;
