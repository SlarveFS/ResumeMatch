import { useState, useEffect } from 'react';
import './AILoadingScreen.css';

const ITEMS = [
  '15+ Professional Templates',
  'AI-Powered Writing',
  'Free PDF Export',
  'No Watermarks',
];

export default function AILoadingScreen({ message = 'Generating…' }) {
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    setChecked([]);
    ITEMS.forEach((_, i) => {
      const t = setTimeout(() => {
        setChecked(prev => [...prev, i]);
      }, 500 + i * 600);
      return () => clearTimeout(t);
    });
  }, []);

  return (
    <div className="ai-loading">
      <div className="ai-loading-spinner" />
      <p className="ai-loading-message">{message}</p>
      <ul className="ai-loading-list">
        {ITEMS.map((item, i) => (
          <li key={item} className={`ai-loading-item ${checked.includes(i) ? 'checked' : ''}`}>
            <span className="ai-loading-check">{checked.includes(i) ? '✓' : '○'}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
