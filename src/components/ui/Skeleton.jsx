const Skeleton = ({ width = '100%', height = 16, className = '', style = {} }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: '4px', flexShrink: 0, ...style }}
    aria-hidden="true"
  />
);

export const SkeletonText = ({ lines = 3, gap = 8 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={14} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="card" style={{ padding: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={15} style={{ marginBottom: 6 }} />
        <Skeleton width="35%" height={12} />
      </div>
      <Skeleton width={60} height={22} />
    </div>
    <Skeleton height={6} style={{ marginBottom: 8 }} />
    <div style={{ display: 'flex', gap: 6 }}>
      <Skeleton width={60} height={22} />
      <Skeleton width={70} height={22} />
      <Skeleton width={50} height={22} />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{
        display: 'flex', gap: 16, padding: '14px 16px',
        borderBottom: '1px solid var(--border)', alignItems: 'center'
      }}>
        <Skeleton width={16} height={16} />
        <Skeleton width={32} height={32} style={{ borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="25%" height={11} />
        </div>
        <Skeleton width={80} height={22} />
        <Skeleton width={100} height={8} />
        <Skeleton width={50} height={22} />
      </div>
    ))}
  </div>
);

export default Skeleton;
