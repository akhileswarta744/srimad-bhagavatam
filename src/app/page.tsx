'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { getAllSkandams, getChapter } from '@/data';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { BookOpen, ChevronRight, Bookmark, Search, CheckCircle2, Calendar, FileText, Compass } from 'lucide-react';
import { PageJumpModal } from '@/components/PageJumpModal';
import { SaptahamModal } from '@/components/SaptahamModal';
import { ParayanamDiaryModal } from '@/components/ParayanamDiaryModal';

export default function HomePage() {
  const skandams = getAllSkandams();
  const { progress, isLoaded } = useReadingProgress();

  const [isPageJumpOpen, setIsPageJumpOpen] = useState(false);
  const [isSaptahamOpen, setIsSaptahamOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);

  const lastRead = progress.lastRead;
  let lastReadChapterTitle = '';
  if (lastRead) {
    const chapterData = getChapter(lastRead.skandam, lastRead.chapter);
    if (chapterData) {
      lastReadChapterTitle = chapterData.title;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-24">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-4 pb-8">
        {/* Sacred Header Banner */}
        <div className="text-center py-6 px-4 mb-4 rounded-2xl bg-devotional-card border border-devotional shadow-xs">
          <div className="text-3xl mb-2 select-none">ॐ ശ്രീമഹാഭാഗവതായ നമഃ ॐ</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-devotional-primary tracking-tight mb-2">
            ശ്രീമദ് ഭാഗവതം
          </h1>
          <p className="text-devotional-secondary text-sm md:text-base leading-relaxed">
            നിത്യപാരായണത്തിനായുള്ള മലയാള അർത്ഥം
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-devotional-accent font-semibold bg-devotional-accent-light px-3 py-1 rounded-full">
            <span>12 സ്കന്ധങ്ങൾ • 335 അദ്ധ്യായങ്ങൾ • 14,089 ശ്ലോകങ്ങൾ</span>
          </div>
        </div>

        {/* Continue Reading Card (തുടർന്നു വായിക്കുക) - Shows only if history exists */}
        {isLoaded && lastRead && (
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-devotional-accent/40 p-5 shadow-xs transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-devotional-accent flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-devotional-accent animate-pulse" />
                തുടർന്നു വായിക്കുക
              </span>
              <span className="text-xs text-devotional-secondary">
                അവസാനം വായിച്ചത്
              </span>
            </div>

            <div className="my-2">
              <div className="text-lg md:text-xl font-bold text-devotional-primary">
                സ്കന്ധം {lastRead.skandam} • അദ്ധ്യായം {lastRead.chapter}
              </div>
              {lastReadChapterTitle && (
                <div className="text-sm text-devotional-secondary mt-0.5 line-clamp-1">
                  {lastReadChapterTitle}
                </div>
              )}
            </div>

            <Link
              href={`/skandam/${lastRead.skandam}/chapter/${lastRead.chapter}${
                lastRead.sectionId ? `#section-${lastRead.sectionId}` : ''
              }`}
              className="mt-3 inline-flex items-center justify-center w-full py-3 px-5 rounded-xl bg-devotional-accent text-white font-bold text-base shadow-sm active:scale-[0.99] hover:opacity-95 transition"
            >
              <span>തുടരുക</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        )}

        {/* Essential Parayanam Tools Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {/* Jump to Page */}
          <button
            onClick={() => setIsPageJumpOpen(true)}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-devotional-card border border-devotional shadow-2xs hover:border-devotional-accent transition active:scale-95"
          >
            <div className="p-2 rounded-lg bg-devotional-accent-light text-devotional-accent mb-1.5">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-devotional-primary text-xs">പേജിലേക്ക്</span>
            <span className="text-[10px] text-devotional-secondary">പുസ്തകത്തിലെ പേജ്</span>
          </button>

          {/* Saptaham Plan */}
          <button
            onClick={() => setIsSaptahamOpen(true)}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-devotional-card border border-devotional shadow-2xs hover:border-devotional-accent transition active:scale-95"
          >
            <div className="p-2 rounded-lg bg-devotional-accent-light text-devotional-accent mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-devotional-primary text-xs">സപ്താഹം</span>
            <span className="text-[10px] text-devotional-secondary">7 ദിവസ ക്രമം</span>
          </button>

          {/* Diary & Notes */}
          <button
            onClick={() => setIsDiaryOpen(true)}
            className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-devotional-card border border-devotional shadow-2xs hover:border-devotional-accent transition active:scale-95"
          >
            <div className="p-2 rounded-lg bg-devotional-accent-light text-devotional-accent mb-1.5">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-devotional-primary text-xs">ഡയറി</span>
            <span className="text-[10px] text-devotional-secondary">കുറിപ്പുകൾ</span>
          </button>
        </div>

        {/* Quick Search & Bookmarks Bar */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <Link
            href="/search"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-devotional-card border border-devotional shadow-2xs hover:bg-black/5 transition active:scale-98"
          >
            <div className="p-2 rounded-lg bg-devotional-accent-light text-devotional-accent">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-devotional-primary text-sm">തിരയുക</div>
              <div className="text-xs text-devotional-secondary">വാക്കുകൾ കണ്ടെത്താം</div>
            </div>
          </Link>

          <Link
            href="/bookmarks"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-devotional-card border border-devotional shadow-2xs hover:bg-black/5 transition active:scale-98"
          >
            <div className="p-2 rounded-lg bg-devotional-accent-light text-devotional-accent">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-devotional-primary text-sm">ബുക്ക്മാർക്കുകൾ</div>
              <div className="text-xs text-devotional-secondary">അടയാളപ്പെടുത്തിയവ</div>
            </div>
          </Link>
        </div>

        {/* Skandams Section Header */}
        <div id="skandams" className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-devotional-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-devotional-accent" />
            <span>സ്കന്ധങ്ങൾ (1 മുതൽ 12 വരെ)</span>
          </h2>
          <span className="text-xs text-devotional-secondary font-medium">
            ആകെ 12 സ്കന്ധങ്ങൾ
          </span>
        </div>

        {/* 12 Large Easy-to-Tap Skandam Cards */}
        <div className="space-y-3.5">
          {skandams.map((skandam) => {
            // Count completed chapters in this skandam
            const completedInSkandam = Object.keys(progress.completedChapters || {}).filter(
              (key) => key.startsWith(`${skandam.number}-`) && progress.completedChapters[key]
            ).length;

            return (
              <Link
                key={skandam.number}
                href={`/skandam/${skandam.number}`}
                className="group block p-4 md:p-5 rounded-2xl bg-devotional-card border border-devotional shadow-xs hover:border-devotional-accent hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-devotional-accent text-white text-xs font-bold">
                        {skandam.number}
                      </span>
                      <h3 className="text-xl font-bold text-devotional-primary group-hover:text-devotional-accent transition-colors">
                        {skandam.shortName}
                      </h3>
                      {skandam.subTitle && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-devotional-accent-light text-devotional-accent font-medium">
                          {skandam.subTitle}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-sm font-semibold text-devotional-secondary">
                      {skandam.name}
                    </div>

                    <p className="mt-1.5 text-xs text-devotional-secondary line-clamp-2 leading-relaxed">
                      {skandam.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-devotional-secondary flex-wrap">
                      <span className="font-medium bg-black/5 px-2.5 py-1 rounded-md">
                        {skandam.chapterCount} അദ്ധ്യായങ്ങൾ
                      </span>
                      {skandam.totalVerses && (
                        <span className="font-medium bg-black/5 px-2.5 py-1 rounded-md">
                          {skandam.totalVerses} ശ്ലോകങ്ങൾ
                        </span>
                      )}
                      <span className="font-medium bg-black/5 px-2.5 py-1 rounded-md">
                        {skandam.pageRange}
                      </span>
                      {completedInSkandam > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {completedInSkandam} വായിച്ചു
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-center p-2 rounded-xl bg-black/5 group-hover:bg-devotional-accent group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <PageJumpModal isOpen={isPageJumpOpen} onClose={() => setIsPageJumpOpen(false)} />
      <SaptahamModal isOpen={isSaptahamOpen} onClose={() => setIsSaptahamOpen(false)} />
      <ParayanamDiaryModal isOpen={isDiaryOpen} onClose={() => setIsDiaryOpen(false)} />

      <BottomNav />
    </div>
  );
}
