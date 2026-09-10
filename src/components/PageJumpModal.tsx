'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findChapterByPageNumber } from '@/data';
import { X, BookOpen, ArrowRight } from 'lucide-react';

interface PageJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PageJumpModal({ isOpen, onClose }: PageJumpModalProps) {
  const router = useRouter();
  const [pageInput, setPageInput] = useState('');

  if (!isOpen) return null;

  const pageNum = parseInt(pageInput, 10);
  const match = !isNaN(pageNum) ? findChapterByPageNumber(pageNum) : null;

  const handleGo = () => {
    if (match) {
      router.push(`/skandam/${match.skandam}/chapter/${match.chapter}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-devotional-card border border-devotional rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-devotional">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-devotional-accent" />
            <h3 className="font-bold text-devotional-primary text-base">
              പുസ്തകത്തിലെ പേജിലേക്ക് പോവുക
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-devotional-secondary hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-devotional-secondary mb-3 leading-relaxed">
          അമ്മ വായിച്ചുകൊണ്ടിരിക്കുന്ന ഭൗതിക പുസ്തകത്തിലെ പേജ് നമ്പർ (47 മുതൽ 498 വരെ) ഇവിടെ നൽകുക:
        </p>

        <div className="mb-4">
          <input
            type="number"
            min={47}
            max={498}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="ഉദാ: 182"
            className="w-full text-center text-2xl font-bold py-3 px-4 rounded-xl border-2 border-devotional focus:border-devotional-accent outline-hidden bg-devotional-main text-devotional-primary"
            autoFocus
          />
        </div>

        {/* Live Match Preview */}
        {match ? (
          <div className="p-3 mb-4 rounded-xl bg-devotional-accent-light/50 border border-devotional-accent/30 text-left">
            <div className="flex items-center justify-between text-xs text-devotional-secondary">
              <span className="font-bold text-devotional-accent">കണ്ടെത്തിയ അദ്ധ്യായം:</span>
              <span>പേജ് {match.pageRange}</span>
            </div>
            <div className="mt-1 font-bold text-devotional-primary text-sm">
              സ്കന്ധം {match.skandam} • അദ്ധ്യായം {match.chapter}
            </div>
            <div className="text-xs text-devotional-secondary truncate mt-0.5">
              {match.title}
            </div>
          </div>
        ) : pageInput && (
          <div className="p-3 mb-4 rounded-xl bg-black/5 text-xs text-devotional-secondary text-center">
            പേജ് 47 മുതൽ 498 വരെയുള്ള നമ്പരുകൾ നൽകുക.
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-devotional font-semibold text-xs text-devotional-primary hover:bg-black/5"
          >
            റദ്ദാക്കുക
          </button>
          <button
            onClick={handleGo}
            disabled={!match}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
              match
                ? 'bg-devotional-accent text-white shadow-md active:scale-95'
                : 'bg-black/10 text-devotional-secondary cursor-not-allowed opacity-60'
            }`}
          >
            <span>തുറക്കുക</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
