'use client';

import { useState, useEffect } from 'react';

export function useWindowSize() {
  // Start with null to avoid SSR hydration mismatch
  // This prevents the desktop layout from flashing on mobile
  const [size, setSize] = useState({
    width: null,
    height: null,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size on mount (client-side only)
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export function useIsMobile() {
  const { width } = useWindowSize();
  // Default to mobile during SSR/first render — mobile-first approach
  if (width === null) return true;
  return width < 768;
}