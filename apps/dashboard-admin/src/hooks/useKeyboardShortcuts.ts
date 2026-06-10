'use client';
import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const mod = s.ctrlOrCmd ? (e.metaKey || e.ctrlKey) : true;
        const shift = s.shift ? e.shiftKey : true;
        if (mod && shift && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
}
