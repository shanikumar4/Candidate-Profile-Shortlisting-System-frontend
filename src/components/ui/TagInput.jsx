import { useState, useRef } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags = [], onChange, placeholder = 'Type and press Enter...', label, id, disabled = false }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (value) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          minHeight: 38, padding: '6px 10px',
          border: '1px solid var(--border-strong)',
          borderRadius: 6,
          background: disabled ? 'var(--bg-overlay)' : 'var(--bg-elevated)',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.8 : 1,
          transition: 'border-color 0.12s, box-shadow 0.12s',
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-border)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--bg-overlay)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '1px 7px', borderRadius: 4,
              fontSize: 11, fontFamily: 'var(--font-mono)',
            }}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                aria-label={`Remove ${tag}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center', outline: 'none' }}
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            id={id}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={() => { if (input.trim()) addTag(input); }}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--text-primary)', flex: 1, minWidth: 120,
              padding: 0,
            }}
          />
        )}
        {disabled && tags.length === 0 && (
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>No skills added yet.</span>
        )}
      </div>
      {!disabled && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Press Enter or comma to add</span>}
    </div>
  );
};

export default TagInput;
