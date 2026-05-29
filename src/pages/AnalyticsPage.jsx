import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import Topbar from '../components/layout/Topbar';
import Skeleton from '../components/ui/Skeleton';
import { getOverview, getFunnel, getTimeline, getSkills, getTimeToHire, getCandidateExperience } from '../api/analytics';
import toast from 'react-hot-toast';
import { STAGE_CONFIG } from '../components/StageBadge';

const KpiCard = ({ label, value, sub, color = 'var(--accent)', loading }) => (
  <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    {loading ? (
      <>
        <Skeleton width="40%" height={32} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={14} />
      </>
    ) : (
      <>
        <div className="tabular kpi-number" style={{ color }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', borderRadius: 6, padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontFamily: 'var(--font-body)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            {entry.name}: <span className="tabular">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 8 Custom Data Colors for Donut
const DONUT_COLORS = ['#38BDF8', '#10B981', '#A78BFA', '#F43F5E', '#FBBF24', '#2DD4BF', '#818CF8', '#FB923C'];

const AnalyticsPage = ({ onMenuClick }) => {
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [skills, setSkills] = useState([]);
  const [timeToHire, setTimeToHire] = useState([]);
  const [candExp, setCandExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, fn, tl, sk, tth, ce] = await Promise.all([
          getOverview(), getFunnel(), getTimeline(), getSkills(), getTimeToHire(), getCandidateExperience(),
        ]);
        setOverview(ov);
        setFunnel(fn.funnel || []);
        setTimeline(tl.timeline || []);
        setSkills((sk.skills || []).map((s, i) => ({ ...s, name: s.skill, fill: DONUT_COLORS[i % DONUT_COLORS.length] })));
        setTimeToHire(tth.timeToHire || []);
        setCandExp(ce);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="page-enter">
      <Topbar title="Analytics" subtitle="Pipeline performance and insights" onMenuClick={onMenuClick} />

      <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          <KpiCard label="Total Candidates" value={overview?.total} color="var(--text-primary)" loading={loading} />
          <KpiCard label="Shortlisted" value={overview?.shortlisted} color="var(--accent)" loading={loading} />
          <KpiCard label="Avg Match Score" value={overview?.avgScore ? `${overview.avgScore}%` : null} color="var(--ai)" loading={loading} />
          <KpiCard label="Avg Time-to-Hire" value={overview?.avgTimeToHire ? `${overview.avgTimeToHire}d` : 'N/A'} color="var(--warning)" loading={loading} sub="avg days to hire" />
          {candExp?.avg !== null && candExp?.avg !== undefined && (
            <KpiCard label="Cand. Exp. Score" value={`${candExp.avg}%`} color="var(--success)" loading={loading} />
          )}
        </div>

        {/* Timeline Area Chart */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>Applications — Last 30 Days</div>
          {loading ? <Skeleton height={240} /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--bg-base)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Funnel */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>Hiring Funnel</div>
            {loading ? <Skeleton height={240} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--ai)" />
                      <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'var(--text-muted)', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
                  <Bar dataKey="count" fill="url(#funnelGradient)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Skills Donut */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Top Skills in Pool</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>The most common skills found among all your candidates.</div>
            {loading ? <Skeleton height={240} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                  <Pie data={skills} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} stroke="none">
                    {skills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', paddingTop: 20 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Time-to-Hire table */}
        {timeToHire.length > 0 && (
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time-to-Hire by Job</div>
            </div>
            <table className="hiq-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Avg Days to Hire</th>
                  <th>Hired Count</th>
                </tr>
              </thead>
              <tbody>
                {timeToHire.map(t => (
                  <tr key={t.jobId}>
                    <td style={{ fontWeight: 500 }}>{t.jobTitle}</td>
                    <td>
                      <span className="tabular" style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14,
                        color: t.avgDays <= 14 ? 'var(--success)' : t.avgDays <= 30 ? 'var(--warning)' : 'var(--danger)',
                      }}>
                        {t.avgDays}d
                      </span>
                    </td>
                    <td><span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{t.hiredCount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
