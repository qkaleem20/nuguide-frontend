'use client';

import { useState, useEffect } from 'react';

// This hook returns the current window width and height.
// Components use it to adjust their layout for different screen sizes.
// Updates automatically when the user resizes the window or
// rotates their phone from portrait to landscape.
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup removes the listener when component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Convenience boolean — true when screen is phone-sized
export function useIsMobile() {
  const { width } = useWindowSize();
  return width < 768;
}