import React, { useEffect, useState } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

let toastListeners: ((toast: ToastItem) => void)[] = [];

export function toast(message: string, type: ToastItem['type'] = 'info') {
  const id = Date.now().toString();
  toastListeners.forEach((fn) => fn({ id, message, type }));
  return id;
}

interface Props {
  duration?: number;
}

export function ToastContainer({ duration = 4000 }: Props) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setItems((prev) => [...prev, toast]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== toast.id));
      }, duration);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter((h) => h !== handler); };
  }, [duration]);

  const TYPE_COLORS = {
    success: { bg: '#e6f4ea', text: '#1B8A3C', icon: '✅' },
    error: { bg: '#fce8e6', text: '#d93025', icon: '❌' },
    info: { bg: '#e8f0fe', text: '#1a73e8', icon: 'ℹ️' },
    warning: { bg: '#fef9e3', text: '#E8710A', icon: '⚠️' },
  };

  return (
    <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item) => {
        const c = TYPE_COLORS[item.type ?? 'info'];
        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: c.bg,
              color: c.text,
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              minWidth: '280px',
              animation: 'ui-slide-in 0.3s ease',
            }}
          >
            <span>{c.icon}</span>
            <span>{item.message}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: '14px', padding: 0 }}
            >
              ✕
            </button>
            <style>{`@keyframes ui-slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          </div>
        );
      })}
    </div>
  );
}
