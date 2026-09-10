'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SKANDAMS_META, ALL_CHAPTERS_META } from '@/data';
import { X, Compass, ChevronRight } from 'lucide-react';

interface ChapterJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkandam: number;
  currentChapter: number;
}

export function ChapterJumpModal({
  isOpen,
  onClose,
  currentSkandam,
  currentChapter,
}: ChapterJumpModalProps) {
  const router = useRouter();
  const [selectedSkandam, setSelectedSkandam] = useState(currentSkandam);
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);

  if (!isOpen) return null;

  const chapters = ALL_CHAPTERS_META[selectedSkandam] || [];

  const handleJump = () => {
    router.push(`/skandam/${selectedSkandam}/chapter/${selectedChapter}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-devotional-card border border-devotional rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-devotional shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-devotional-accent" />
            <h3 className="font-bold text-devotional-primary text-base">
              സ്കന്ധം & അദ്ധ്യായം തിരഞ്ഞെടുക്കുക
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-devotional-secondary hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Skandha Selector */}
          <div>
            <label className="block text-xs font-bold text-devotional-primary mb-1.5">
              1. സ്കന്ധം തിരഞ്ഞെടുക്കുക (1 - 12):
            </label>
            <select
              value={selectedSkandam}
              onChange={(e) => {
                const s = parseInt(e.target.value, 10);
                setSelectedSkandam(s);
                setSelectedChapter(1);
              }}
              className="w-full p-3 rounded-xl border border-devotional bg-devotional-main text-devotional-primary font-bold text-sm outline-hidden focus:border-devotional-accent"
            >
              {SKANDAMS_META.map((sk) => (
                <option key={sk.number} value={sk.number}>
                  {sk.shortName} — {sk.name} ({sk.chapterCount} അദ്ധ്യായങ്ങൾ)
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Selector */}
          <div>
            <label className="block text-xs font-bold text-devotional-primary mb-1.5">
              2. അദ്ധ്യായം തിരഞ്ഞെടുക്കുക:
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(parseInt(e.target.value, 10))}
              className="w-full p-3 rounded-xl border border-devotional bg-devotional-main text-devotional-primary font-bold text-sm outline-hidden focus:border-devotional-accent"
            >
              {chapters.map((ch) => (
                <option key={ch.chapter} value={ch.chapter}>
                  അദ്ധ്യായം {ch.chapter}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Chapter Preview */}
          {chapters.find((c) => c.chapter === selectedChapter) && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="font-bold text-amber-900">
                സ്കന്ധം {selectedSkandam}, അദ്ധ്യായം {selectedChapter}
              </div>
              <div className="text-amber-800 font-medium mt-0.5">
                {chapters.find((c) => c.chapter === selectedChapter)?.title}
              </div>
              <div className="text-amber-700/80 mt-1">
                {chapters.find((c) => c.chapter === selectedChapter)?.totalVerses} ശ്ലോകങ്ങൾ
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 mt-2 border-t border-devotional flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-devotional-secondary hover:bg-black/5"
          >
            റദ്ദാക്കുക
          </button>
          <button
            onClick={handleJump}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-devotional-accent text-white flex items-center gap-1.5 hover:opacity-95 active:scale-95 shadow-xs"
          >
            <span>തുടങ്ങുക</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
