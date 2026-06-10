'use client';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_dark_mode');
    if (stored === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('admin_dark_mode', String(next));
    document.documentElement.classList.toggle('dark-mode', next);
  };

  return { dark, toggle };
}

export default function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '36px', height: '36px', borderRadius: '8px',
        border: '1px solid #E2E8F0', background: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748B', flexShrink: 0,
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
