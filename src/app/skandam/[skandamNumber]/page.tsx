'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { getSkandamMeta, getChaptersForSkandam } from '@/data';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';

export default function SkandamPage() {
  const params = useParams();
  const skandamNum = parseInt(params.skandamNumber as string, 10);
  const skandam = getSkandamMeta(skandamNum);
  const chapters = getChaptersForSkandam(skandamNum);
  const { progress, isLoaded, isChapterCompleted } = useReadingProgress();

  if (!skandam) {
    return (
      <div className="min-h-screen flex flex-col bg-devotional-main">
        <Navbar showBack backHref="/" backLabel="ഹോം" />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12 text-center">
          <p className="text-lg font-bold text-devotional-primary">സ്കന്ധം കണ്ടെത്താനായില്ല.</p>
          <Link href="/" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-devotional-accent text-white font-bold">
            ഹോമിലേക്ക് മടങ്ങുക
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Count completed chapters
  const completedCount = chapters.filter((c) => isChapterCompleted(skandamNum, c.chapter)).length;

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-24">
      <Navbar
        title={skandam.shortName}
        subtitle={skandam.name}
        showBack
        backHref="/"
        backLabel="സ്കന്ധങ്ങൾ"
      />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-4 pb-8">
        {/* Skandam Info Card */}
        <div className="p-5 mb-5 rounded-2xl bg-devotional-card border border-devotional shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-devotional-accent-light text-devotional-accent text-xs font-bold">
              <span>{skandam.name}</span>
            </div>
            <span className="text-xs font-semibold text-devotional-secondary bg-black/5 px-2.5 py-1 rounded-md">
              {skandam.pageRange}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-devotional-primary mt-1">
            {skandam.shortName}
          </h1>
          {skandam.subTitle && (
            <p className="text-sm font-semibold text-devotional-accent mt-0.5">
              {skandam.subTitle}
            </p>
          )}

          <p className="text-sm text-devotional-secondary mt-2 leading-relaxed">
            {skandam.description}
          </p>

          <div className="mt-4 pt-3 border-t border-devotional flex items-center justify-between text-xs text-devotional-secondary">
            <span>ആകെ {skandam.chapterCount} അദ്ധ്യായങ്ങൾ</span>
            {isLoaded && completedCount > 0 && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {completedCount} അദ്ധ്യായങ്ങൾ വായിച്ചു
              </span>
            )}
          </div>
        </div>

        {/* Chapters List Title */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-devotional-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-devotional-accent" />
            <span>അദ്ധ്യായങ്ങളുടെ പട്ടിക</span>
          </h2>
          <span className="text-xs text-devotional-secondary">
            വായിക്കാനായി തിരഞ്ഞെടുക്കുക
          </span>
        </div>

        {/* Chapters List */}
        <div className="space-y-2.5">
          {chapters.map((ch) => {
            const isCompleted = isLoaded && isChapterCompleted(skandamNum, ch.chapter);
            const isLastRead =
              isLoaded &&
              progress.lastRead?.skandam === skandamNum &&
              progress.lastRead?.chapter === ch.chapter;

            return (
              <Link
                key={ch.chapter}
                href={`/skandam/${skandamNum}/chapter/${ch.chapter}`}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.99] ${
                  isLastRead
                    ? 'bg-amber-50/90 border-devotional-accent/60 shadow-xs'
                    : 'bg-devotional-card border-devotional hover:border-devotional-accent/50 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLastRead
                        ? 'bg-devotional-accent text-white'
                        : 'bg-black/5 text-devotional-primary group-hover:bg-devotional-accent group-hover:text-white'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : ch.chapter}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-devotional-primary text-base">
                        അദ്ധ്യായം {ch.chapter}
                      </span>
                      {isLastRead && (
                        <span className="text-[10px] bg-devotional-accent text-white px-2 py-0.5 rounded-full font-semibold">
                          തുടരുക
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-devotional-secondary truncate mt-0.5">
                      {ch.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-devotional-secondary/80">
                      <span>പേജ് {ch.pageRange}</span>
                      {ch.totalVerses && (
                        <span>• {ch.totalVerses} ശ്ലോകങ്ങൾ</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-1.5 rounded-lg text-devotional-secondary group-hover:text-devotional-primary transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
