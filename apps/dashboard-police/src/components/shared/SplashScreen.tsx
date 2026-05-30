'use client';
import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
  color?: string;
  icon?: string;
  agencyName?: string;
}

export function SplashScreen({ onComplete, color = '#1a73e8', icon = '🛡️', agencyName = 'Police' }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar fills over 1.8s
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 2;
      });
    }, 36);

    // Phase transitions
    const holdTimer = setTimeout(() => setPhase('hold'), 400);
    const outTimer  = setTimeout(() => setPhase('out'),  1900);
    const doneTimer = setTimeout(() => onComplete(),     2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const opacity  = phase === 'out' ? 0 : 1;
  const scale    = phase === 'in' ? 0.92 : phase === 'out' ? 1.04 : 1;
  const logoScale = phase === 'in' ? 0.7 : 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#ffffff',
      opacity, transform: `scale(${scale})`,
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      pointerEvents: 'none',
    }}>
      {/* Logo mark */}
      <div style={{
        transform: `scale(${logoScale})`,
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      }}>
        {/* Icon circle */}
        <div style={{
          width: '96px', height: '96px', borderRadius: '28px',
          backgroundColor: color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '44px',
          boxShadow: `0 8px 32px ${color}40`,
        }}>
          {icon}
        </div>

        {/* Wordmark */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '28px', fontWeight: 800, color: '#202124',
            letterSpacing: '-0.5px', lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            Rwanda<span style={{ color }}>Safe</span>
          </div>
          <div style={{
            fontSize: '13px', color: '#5f6368', marginTop: '6px',
            letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500,
          }}>
            {agencyName} Dashboard
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        backgroundColor: '#e8eaed',
      }}>
        <div style={{
          height: '100%', backgroundColor: color,
          width: `${progress}%`,
          transition: 'width 0.1s linear',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Version tag */}
      <div style={{
        position: 'absolute', bottom: '20px',
        fontSize: '11px', color: '#80868b',
      }}>
        v1.0 · Emergency Response Platform
      </div>
    </div>
  );
}
