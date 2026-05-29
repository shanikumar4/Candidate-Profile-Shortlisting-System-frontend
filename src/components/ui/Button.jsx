import React from 'react';

const BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  borderRadius: 6,
  border: 'none',
  transition: 'all 0.12s ease',
  userSelect: 'none',
};

const SIZES = {
  sm: { padding: '5px 12px', fontSize: 12, height: 30 },
  md: { padding: '8px 16px', fontSize: 14, height: 36 },
  lg: { padding: '10px 20px', fontSize: 14, height: 42 },
};

const VARIANTS = {
  primary: {
    idle: { background: 'var(--accent)', color: '#0E1117', border: 'none' },
    hover: { background: 'var(--accent-hover)' },
  },
  secondary: {
    idle: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' },
    hover: { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-dim)' },
  },
  ghost: {
    idle: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    hover: { color: 'var(--text-primary)', background: 'var(--bg-elevated)' },
  },
  danger: {
    idle: { background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.3)' },
    hover: { background: 'rgba(248,113,113,0.15)' },
  },
  ai: {
    idle: { background: 'var(--ai-dim)', color: 'var(--ai)', border: '1px solid var(--ai-border)' },
    hover: { background: 'rgba(56,189,248,0.14)' },
  },
};

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  children,
  style = {},
  className = '',
  ...props
}, ref) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [hovered, setHovered] = React.useState(false);

  const computedStyle = {
    ...BASE,
    ...s,
    ...v.idle,
    ...(hovered && !disabled && !loading ? v.hover : {}),
    opacity: disabled ? 0.4 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transform: hovered && !disabled && !loading && variant === 'primary' ? 'translateY(-1px)' : 'none',
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 13, height: 13, display: 'inline-block',
          border: '1.5px solid currentColor', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.65s linear infinite', flexShrink: 0,
        }} />
      ) : icon}
      {children}
      {!loading && iconRight}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
