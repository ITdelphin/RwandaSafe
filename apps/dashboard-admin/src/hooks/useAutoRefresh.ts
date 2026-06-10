'use client';
import { useState, useCallback } from 'react';

export function useAutoRefresh(defaultInterval = 60000) {
  const [interval, setInterval] = useState(defaultInterval);
  const [paused, setPaused] = useState(false);

  const realInterval = paused ? Infinity : interval;

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  return { interval, setInterval, paused, togglePause, realInterval };
}
