import { useState, useRef, useEffect } from 'react';

/**
 * A section title that shows a pencil icon on hover.
 * Clicking the pencil (or the title itself) switches to an inline input.
 */
export default function RenamableTitle({ value, defaultValue, onChange, className = 'wizard-step-title' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const display = value || defaultValue;

  const startEdit = () => {
    setDraft(display);
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || defaultValue);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <div className="renamable-editing">
        <input
          ref={inputRef}
          className="renamable-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          onBlur={commit}
        />
        <span className="renamable-hint">Enter to save · Esc to cancel</span>
      </div>
    );
  }

  return (
    <div className="renamable-wrap">
      <h2 className={className}>{display}</h2>
      <button
        type="button"
        className="renamable-pencil"
        onClick={startEdit}
        title="Rename section"
        aria-label="Rename section"
      >
        ✏️
      </button>
    </div>
  );
}
