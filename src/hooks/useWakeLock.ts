'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestLock = useCallback(async () => {
    if (!isSupported || sentinelRef.current) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      sentinelRef.current = lock;
      setIsLocked(true);

      lock.addEventListener('release', () => {
        sentinelRef.current = null;
        setIsLocked(false);
      });
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      setIsLocked(false);
    }
  }, [isSupported]);

  const releaseLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
      sentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  // Handle visibility change: re-acquire lock when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, requestLock]);

  useEffect(() => {
    if (enabled) {
      requestLock();
    } else {
      releaseLock();
    }

    return () => {
      releaseLock();
    };
  }, [enabled, requestLock, releaseLock]);

  return {
    isSupported,
    isLocked,
    requestLock,
    releaseLock,
  };
}
