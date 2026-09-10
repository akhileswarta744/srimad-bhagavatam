'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bookmark as BookmarkIcon, Type, Sun, Moon, Sparkles, BookOpen, Calendar } from 'lucide-react';
import { useReadingSettings } from '@/hooks/useReadingSettings';
import { PageJumpModal } from './PageJumpModal';
import { SaptahamModal } from './SaptahamModal';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function Navbar({ title, subtitle, showBack, backHref = '/', backLabel = 'തിരികെ' }: NavbarProps) {
  const { settings, cycleTextSize, setTheme } = useReadingSettings();
  const [isPageJumpOpen, setIsPageJumpOpen] = useState(false);
  const [isSaptahamOpen, setIsSaptahamOpen] = useState(false);

  const toggleTheme = () => {
    if (settings.theme === 'sandalwood') setTheme('night');
    else if (settings.theme === 'night') setTheme('cream');
    else setTheme('sandalwood');
  };

  // Sync dataset theme on body
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  const textSizeLabel = {
    normal: 'A',
    large: 'A+',
    xlarge: 'A++',
  }[settings.textSize];

  return (
    <>
      <header className="sticky top-0 z-30 bg-devotional-main/95 backdrop-blur border-b border-devotional shadow-xs px-3 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <Link
                href={backHref}
                className="inline-flex items-center justify-center p-2 rounded-xl text-devotional-primary hover:bg-black/5 active:scale-95 transition-all"
                aria-label={backLabel}
              >
                <span className="text-xl font-bold">←</span>
                <span className="ml-1 text-sm font-semibold truncate max-w-[120px] md:max-w-none">{backLabel}</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl select-none">🪷</span>
                <div className="flex flex-col">
                  <span className="text-lg md:text-xl font-bold text-devotional-primary tracking-tight">
                    {title || 'ശ്രീമദ് ഭാഗവതം'}
                  </span>
                  {subtitle && (
                    <span className="text-[11px] text-devotional-secondary font-medium truncate max-w-[130px] md:max-w-none">
                      {subtitle}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Jump to Book Page Button */}
            <button
              onClick={() => setIsPageJumpOpen(true)}
              className="p-1.5 md:px-2 md:py-1.5 rounded-lg border border-devotional text-devotional-primary hover:bg-black/5 flex items-center gap-1 text-xs font-semibold"
              title="പുസ്തകത്തിലെ പേജ് നൽകുക"
            >
              <BookOpen className="w-3.5 h-3.5 text-devotional-accent" />
              <span className="hidden sm:inline">പേജ്</span>
            </button>

            {/* Saptaham 7-Day Plan Button */}
            <button
              onClick={() => setIsSaptahamOpen(true)}
              className="p-1.5 md:px-2 md:py-1.5 rounded-lg border border-devotional text-devotional-primary hover:bg-black/5 flex items-center gap-1 text-xs font-semibold"
              title="സപ്താഹ ക്രമം"
            >
              <Calendar className="w-3.5 h-3.5 text-devotional-accent" />
              <span className="hidden sm:inline">സപ്താഹം</span>
            </button>

            {/* Font size toggle */}
            <button
              onClick={cycleTextSize}
              className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-devotional text-devotional-primary font-bold text-xs active:bg-black/10 hover:bg-black/5 transition"
              title="അക്ഷരവലിപ്പം മാറ്റുക"
              aria-label="അക്ഷരവലിപ്പം"
            >
              <Type className="w-3.5 h-3.5 text-devotional-accent mr-0.5" />
              <span>{textSizeLabel}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-devotional text-devotional-primary active:bg-black/10 hover:bg-black/5 transition"
              title="നിറം മാറ്റുക"
              aria-label="തീം മാറ്റുക"
            >
              {settings.theme === 'night' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : settings.theme === 'cream' ? (
                <Sparkles className="w-4 h-4 text-devotional-accent" />
              ) : (
                <Moon className="w-4 h-4 text-devotional-secondary" />
              )}
            </button>

            {/* Search */}
            <Link
              href="/search"
              className="p-1.5 rounded-lg border border-devotional text-devotional-primary active:bg-black/10 hover:bg-black/5 transition"
              title="തിരയുക"
              aria-label="തിരയുക"
            >
              <Search className="w-4 h-4 text-devotional-accent" />
            </Link>

            {/* Bookmarks */}
            <Link
              href="/bookmarks"
              className="p-1.5 rounded-lg border border-devotional text-devotional-primary active:bg-black/10 hover:bg-black/5 transition"
              title="ബുക്ക്മാർക്കുകൾ"
              aria-label="ബുക്ക്മാർക്കുകൾ"
            >
              <BookmarkIcon className="w-4 h-4 text-devotional-accent" />
            </Link>
          </div>
        </div>
      </header>

      <PageJumpModal isOpen={isPageJumpOpen} onClose={() => setIsPageJumpOpen(false)} />
      <SaptahamModal isOpen={isSaptahamOpen} onClose={() => setIsSaptahamOpen(false)} />
    </>
  );
}
