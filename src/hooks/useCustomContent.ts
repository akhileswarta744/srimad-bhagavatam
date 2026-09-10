'use client';

import { useState, useEffect } from 'react';
import { Section } from '@/data/types';

export function useCustomContent(skandam: number, chapter: number) {
  const key = `custom_chapter_${skandam}_${chapter}`;
  const [customSections, setCustomSections] = useState<Section[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setCustomSections(JSON.parse(stored));
      } else {
        setCustomSections(null);
      }
    } catch (e) {
      console.error('Error reading custom chapter content', e);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const saveCustomSections = (sections: Section[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(sections));
      setCustomSections(sections);
    } catch (e) {
      console.error('Error saving custom chapter content', e);
    }
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(key);
      setCustomSections(null);
    } catch (e) {
      console.error('Error resetting chapter content', e);
    }
  };

  return {
    customSections,
    isLoaded,
    saveCustomSections,
    resetToDefault,
  };
}
