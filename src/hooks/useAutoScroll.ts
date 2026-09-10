'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type ScrollSpeed = 'slow' | 'normal' | 'fast';

const SPEED_CONFIG: Record<ScrollSpeed, number> = {
  slow: 0.6,    // pixels per frame ~ 36px/sec
  normal: 1.2,  // ~ 72px/sec
  fast: 2.0,    // ~ 120px/sec
};

export function useAutoScroll() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState<ScrollSpeed>('slow');
  const animationFrameRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const speedRef = useRef<ScrollSpeed>('slow');

  speedRef.current = speed;

  const stopScrolling = useCallback(() => {
    isScrollingRef.current = false;
    setIsScrolling(false);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const scrollStep = useCallback(() => {
    if (!isScrollingRef.current) return;

    const delta = SPEED_CONFIG[speedRef.current];
    window.scrollBy({ top: delta, behavior: 'auto' });

    // Stop when reaching bottom of page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 20) {
      stopScrolling();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scrollStep);
  }, [stopScrolling]);

  const startScrolling = useCallback(() => {
    isScrollingRef.current = true;
    setIsScrolling(true);
    animationFrameRef.current = requestAnimationFrame(scrollStep);
  }, [scrollStep]);

  const toggleAutoScroll = useCallback(() => {
    if (isScrollingRef.current) {
      stopScrolling();
    } else {
      startScrolling();
    }
  }, [startScrolling, stopScrolling]);

  // Pause on user touch / manual wheel interaction
  useEffect(() => {
    const handleUserInteraction = (e: Event) => {
      // If user aggressively touches/scrolls, stop auto-scroll so they have full control
      if (isScrollingRef.current && e.isTrusted && (e.type === 'touchstart' || e.type === 'wheel')) {
        // Stop scroll gracefully
        stopScrolling();
      }
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stopScrolling]);

  return {
    isScrolling,
    speed,
    setSpeed,
    startScrolling,
    stopScrolling,
    toggleAutoScroll,
  };
}
