'use client';

import { useState, useEffect } from 'react';
import { ReadingProgress } from '@/data/types';

const STORAGE_KEY = 'bhagavatam_reading_progress';

const defaultProgress: ReadingProgress = {
  lastRead: null,
  completedChapters: {},
};

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading reading progress', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save progress helper
  const saveProgress = (skandam: number, chapter: number, sectionId?: string) => {
    setProgress((prev) => {
      const updated: ReadingProgress = {
        ...prev,
        lastRead: {
          skandam,
          chapter,
          sectionId,
          timestamp: Date.now(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving reading progress', e);
      }
      return updated;
    });
  };

  // Toggle chapter completion
  const toggleChapterComplete = (skandam: number, chapter: number) => {
    const key = `${skandam}-${chapter}`;
    setProgress((prev) => {
      const isCurrentlyComplete = !!prev.completedChapters[key];
      const updated: ReadingProgress = {
        ...prev,
        completedChapters: {
          ...prev.completedChapters,
          [key]: !isCurrentlyComplete,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error toggling chapter complete', e);
      }
      return updated;
    });
  };

  const isChapterCompleted = (skandam: number, chapter: number): boolean => {
    return !!progress.completedChapters[`${skandam}-${chapter}`];
  };

  return {
    progress,
    isLoaded,
    saveProgress,
    toggleChapterComplete,
    isChapterCompleted,
  };
}
