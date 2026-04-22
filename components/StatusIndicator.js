'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/lib/api';
import { useIsMobile } from '@/lib/useWindowSize';

export default function StatusIndicator() {
  const [connected, setConnected] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    checkHealth().then(setConnected);
    const interval = setInterval(() => {
      checkHealth().then(setConnected);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const dotColor =
    connected === null ? '#888888' :
    connected === true ? '#22C55E' :
                         '#EF4444';

  const label =
    connected === null ? 'Connecting...' :
    connected === true ? 'Online' :
                         'Offline';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
      }}
      title={label}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: dotColor,
        animation: connected === true
          ? 'pulse-glow 2s ease infinite'
          : 'none',
        transition: 'background 0.4s ease',
        flexShrink: 0,
      }}/>
      {/* Hide label on mobile — dot is enough, saves precious navbar space */}
      {!isMobile && (
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontWeight: '400',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}