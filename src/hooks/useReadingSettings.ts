'use client';

import { useState, useEffect } from 'react';
import { TextSize, ThemeMode } from '@/data/types';

const STORAGE_KEY = 'bhagavatam_settings';

interface Settings {
  textSize: TextSize;
  theme: ThemeMode;
}

const defaultSettings: Settings = {
  textSize: 'large', // Default to large for comfortable reading
  theme: 'sandalwood',
};

export function useReadingSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Error loading settings', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSettings = (updated: Settings) => {
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  };

  const setTextSize = (size: TextSize) => {
    saveSettings({ ...settings, textSize: size });
  };

  const setTheme = (theme: ThemeMode) => {
    saveSettings({ ...settings, theme });
  };

  const cycleTextSize = () => {
    if (settings.textSize === 'normal') setTextSize('large');
    else if (settings.textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const getTextSizeClass = (): string => {
    switch (settings.textSize) {
      case 'normal':
        return 'text-lg leading-relaxed';
      case 'large':
        return 'text-xl md:text-2xl leading-loose';
      case 'xlarge':
        return 'text-2xl md:text-3xl leading-loose';
      default:
        return 'text-xl leading-loose';
    }
  };

  return {
    settings,
    isLoaded,
    setTextSize,
    setTheme,
    cycleTextSize,
    getTextSizeClass,
  };
}
