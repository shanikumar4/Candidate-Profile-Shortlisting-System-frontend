import { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, hint, icon, iconRight, id, required,
  style = {}, containerStyle = {}, ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
        >
          {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            height: 38,
            padding: icon ? '0 12px 0 38px' : iconRight ? '0 38px 0 12px' : '0 12px',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            borderRadius: 6,
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
            e.target.style.boxShadow = error ? '0 0 0 3px var(--danger-dim)' : '0 0 0 3px var(--accent-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-strong)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {iconRight && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
          }}>
            {iconRight}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, id, required, rows = 4, style = {}, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
          borderRadius: 6,
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
          e.target.style.boxShadow = error ? '0 0 0 3px var(--danger-dim)' : '0 0 0 3px var(--accent-border)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-strong)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
