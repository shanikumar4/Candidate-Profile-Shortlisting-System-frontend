export default function MatchScoreBar({ score }) {
  const color = score >= 75 ? '#16a34a' : score >= 40 ? '#1D9E75' : '#dc2626';
  const label = score >= 75 ? 'High match' : score >= 40 ? 'Partial match' : 'Low match';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6b7280' }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 999, height: 8, width: '100%', overflow: 'hidden' }}>
        <div
          style={{
            width: `${score}%`,
            background: color,
            height: '100%',
            borderRadius: 999,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)'
          }}
        />
      </div>
    </div>
  );
}
