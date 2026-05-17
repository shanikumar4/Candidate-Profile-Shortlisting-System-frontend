import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => onChange(tags.filter((_, i) => i !== index));

  return (
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2 bg-white min-h-[42px]"
      style={{ border: '1px solid #e5e7eb', borderRadius: 10, outline: 'none' }}
      onFocus={e => e.currentTarget.style.borderColor = '#1D9E75'}
      onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium"
          style={{ background: '#e1f5ee', color: '#0F6E56' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            style={{ color: '#0F6E56', lineHeight: 1 }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        style={{ color: '#374151' }}
      />
    </div>
  );
}
