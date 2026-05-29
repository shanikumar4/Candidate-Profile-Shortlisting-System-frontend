import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAGE_COLORS = {
  applied:   '#3B82F6',
  screening: '#F97316',
  interview: '#22C55E',
  offer:     '#A855F7',
  hired:     '#5B5EF4',
  rejected:  '#EF4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-modal)',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
          {payload[0].value}
        </span> candidates
      </div>
    </div>
  );
};

const FunnelChart = ({ data = [] }) => {
  if (!data.length) return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      No data yet
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barSize={32}>
        <XAxis
          dataKey="stage"
          tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)}
          tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || '#5B5EF4'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FunnelChart;
