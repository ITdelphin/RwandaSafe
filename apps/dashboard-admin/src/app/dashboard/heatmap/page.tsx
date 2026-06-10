'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';

export default function AdminHeatMapPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<any>(null);

  const { data: frames, isLoading } = useQuery({
    queryKey: ['admin', 'heatmap', 'animated', dateRange],
    queryFn: () => adminApi.getAnimatedHeatMap({ from: dateRange.from, to: dateRange.to }).then((r) => r.data.data),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const totalFrames = frames?.length ?? 0;
  const frame = frames?.[currentFrame];

  useEffect(() => {
    if (playing && frames && frames.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= frames.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, frames, speed]);

  const goTo = useCallback((idx: number) => {
    setCurrentFrame(Math.max(0, Math.min(idx, totalFrames - 1)));
  }, [totalFrames]);

  const totalPoints = frame?.points?.reduce((sum: number, p: any) => sum + p.weight, 0) ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>From</label>
            <input type="date" value={dateRange.from} onChange={(e) => { setDateRange((p) => ({ ...p, from: e.target.value })); setCurrentFrame(0); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>To</label>
            <input type="date" value={dateRange.to} onChange={(e) => { setDateRange((p) => ({ ...p, to: e.target.value })); setCurrentFrame(0); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }} />
          </div>
          <button onClick={() => adminApi.getAnimatedHeatMap({ from: dateRange.from, to: dateRange.to })}
            style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0F4C75', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Generate Heat Map
          </button>
        </div>
      </div>

      {/* Map + Insights */}
      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
        {/* Map */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 1,
              minHeight: '400px',
              background: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {isLoading ? (
              <p style={{ color: '#94A3B8' }}>Loading heat map data...</p>
            ) : frame ? (
              <>
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.95)', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {frame.date} — {totalPoints} incidents
                </div>
                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                  <p style={{ fontSize: '14px' }}>Heat map layer would render here</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>{frame.points?.length ?? 0} data points for this frame</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#94A3B8' }}>Select date range and generate</p>
            )}
          </div>

          {/* Animation controls */}
          {frames && frames.length > 0 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <button onClick={() => goTo(0)} disabled={currentFrame === 0} style={btnStyle}><Rewind size={14} /></button>
                <button onClick={() => goTo(currentFrame - 1)} disabled={currentFrame === 0} style={btnStyle}><SkipBack size={14} /></button>
                <button onClick={() => setPlaying(!playing)} style={{ ...btnStyle, background: playing ? '#EF4444' : '#0F4C75', color: '#fff' }}>
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => goTo(currentFrame + 1)} disabled={currentFrame >= totalFrames - 1} style={btnStyle}><SkipForward size={14} /></button>
                <button onClick={() => goTo(totalFrames - 1)} disabled={currentFrame >= totalFrames - 1} style={btnStyle}><FastForward size={14} /></button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: '12px', color: '#64748B' }}>Frame {currentFrame + 1} / {totalFrames}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '32px' }}>
                {frames.map((f: any, i: number) => {
                  const pts = f.points?.reduce((s: number, p: any) => s + p.weight, 0) ?? 0;
                  const maxPts = Math.max(...frames.map((ff: any) => ff.points?.reduce((s: number, p: any) => s + p.weight, 0) ?? 0), 1);
                  return (
                    <div
                      key={f.date}
                      onClick={() => goTo(i)}
                      style={{
                        flex: 1, height: `${(pts / maxPts) * 100}%`, minHeight: '4px',
                        background: i === currentFrame ? '#0F4C75' : '#CBD5E1',
                        borderRadius: '2px 2px 0 0', cursor: 'pointer',
                        opacity: i === currentFrame ? 1 : 0.5,
                        transition: 'all 0.15s',
                      }}
                      title={`${f.date}: ${pts}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        {frame && (
          <div style={{ width: '260px', flexShrink: 0, background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Insights</h4>
            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.8 }}>
              <p>📊 Daily average: <strong>{Math.round(frames.reduce((s: number, f: any) => s + (f.points?.reduce((s2: number, p: any) => s2 + p.weight, 0) ?? 0), 0) / totalFrames)}</strong></p>
              <p>📈 Peak: <strong>{frames?.reduce((best: any, f: any) => {
                const c = f.points?.reduce((s: number, p: any) => s + p.weight, 0) ?? 0;
                return c > (best?.count ?? 0) ? { date: f.date, count: c } : best;
              }, null)?.date ?? 'N/A'}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0',
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#64748B',
};
