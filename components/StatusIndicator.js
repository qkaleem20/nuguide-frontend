'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/lib/api';

export default function StatusIndicator() {

  // null = still checking (shows gray)
  // true = server is up (shows green)
  // false = server is down (shows red)
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    // Check immediately when component loads
    checkHealth().then(setConnected);

    // Then re-check every 30 seconds
    // This keeps the dot accurate without hammering the server
    const interval = setInterval(() => {
      checkHealth().then(setConnected);
    }, 30000);

    // Cleanup — stops the interval when component unmounts
    // Without this, the interval keeps running even after navigating away
    return () => clearInterval(interval);
  }, []);

  // Dot color based on connection state
  const dotColor =
    connected === null  ? '#888888' :  // gray — still checking
    connected === true  ? '#22C55E' :  // green — online
                          '#EF4444';   // red — offline

  // Label text
  const label =
    connected === null  ? 'Connecting...' :
    connected === true  ? 'Online' :
                          'Offline';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
    }}>
      {/* The dot */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: dotColor,
        // Only animate (pulse) when connected — not when offline or checking
        animation: connected === true
          ? 'pulse-glow 2s ease infinite'
          : 'none',
        transition: 'background 0.4s ease',
      }}/>

      {/* The label */}
      <span style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: '400',
      }}>
        {label}
      </span>
    </div>
  );
}