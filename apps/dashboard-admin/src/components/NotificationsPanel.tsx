'use client';
import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { Bell, AlertTriangle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'incident' | 'alert' | 'breach';
  title: string;
  message: string;
  timestamp: Date;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const socket = getSocket();
      const onIncident = (data: any) => {
        const n: Notification = {
          id: `inc-${Date.now()}`,
          type: 'incident',
          title: 'New Incident',
          message: data.trackingCode ? `#${data.trackingCode} reported` : 'A new incident has been reported',
          timestamp: new Date(),
        };
        setNotifications((prev) => [n, ...prev].slice(0, 20));
        setUnread((u) => u + 1);
      };
      const onAlert = (data: any) => {
        const n: Notification = {
          id: `alert-${Date.now()}`,
          type: 'alert',
          title: data.title ?? 'Broadcast Alert',
          message: data.message ?? '',
          timestamp: new Date(),
        };
        setNotifications((prev) => [n, ...prev].slice(0, 20));
        setUnread((u) => u + 1);
      };
      socket.on('incident:new', onIncident);
      socket.on('broadcast:new', onAlert);
      return () => {
        socket.off('incident:new', onIncident);
        socket.off('broadcast:new', onAlert);
      };
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const dismissNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnread(0);
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        style={{
          width: '36px', height: '36px', borderRadius: '8px',
          border: '1px solid #E2E8F0', background: '#F8FAFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748B', position: 'relative',
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#EF4444', color: '#fff', fontSize: '9px',
            fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '360px', maxWidth: '90vw',
          background: '#fff', borderRadius: '14px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #E2E8F0', zIndex: 100,
          maxHeight: '480px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{ fontSize: '11px', color: '#0F4C75', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8', fontSize: '13px' }}>
                <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '10px', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {n.type === 'incident' ? (
                      <AlertTriangle size={14} color="#EF4444" />
                    ) : n.type === 'alert' ? (
                      <Bell size={14} color="#F59E0B" />
                    ) : (
                      <Info size={14} color="#3B82F6" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{n.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                      {n.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button onClick={() => dismissNotif(n.id)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 0 }}>
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
