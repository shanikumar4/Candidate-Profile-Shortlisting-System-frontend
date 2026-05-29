import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#5B5EF4', '#0EA5C9', '#16A34A', '#D97706',
  '#A855F7', '#F97316', '#EF4444', '#14B8A6',
  '#6366F1', '#F59E0B',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-modal)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{payload[0].name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
        {payload[0].value} candidates
      </div>
    </div>
  );
};

const DonutChart = ({ data = [] }) => {
  if (!data.length) return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      No skill data yet
    </div>
  );

  const chartData = data.map(d => ({ name: d.skill, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', paddingTop: 8 }}
          formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
