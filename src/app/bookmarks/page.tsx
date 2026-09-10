'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark as BookmarkIcon, Trash2, ChevronRight, BookOpen } from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, isLoaded, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-24">
      <Navbar title="ബുക്ക്മാർക്കുകൾ" showBack backHref="/" backLabel="ഹോം" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="text-xl font-bold text-devotional-primary flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-devotional-accent fill-current" />
              <span>വായനാടയാളങ്ങൾ</span>
            </h1>
            <p className="text-xs text-devotional-secondary mt-0.5">
              നിങ്ങൾ അടയാളപ്പെടുത്തി വെച്ച പ്രധാന ശ്ലോകഭാഗങ്ങൾ
            </p>
          </div>
          {isLoaded && bookmarks.length > 0 && (
            <span className="text-xs font-bold text-devotional-accent bg-devotional-accent-light px-2.5 py-1 rounded-full">
              {bookmarks.length} എണ്ണം
            </span>
          )}
        </div>

        {/* Bookmarks List */}
        {!isLoaded ? (
          <div className="p-8 text-center text-sm text-devotional-secondary">
            ലോഡ് ചെയ്യുന്നു...
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-2xl bg-devotional-card border border-devotional">
            <div className="w-12 h-12 rounded-full bg-devotional-accent-light text-devotional-accent flex items-center justify-center mx-auto mb-3">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-devotional-primary">
              ബുക്ക്മാർക്കുകൾ ഒന്നും ചേർത്തിട്ടില്ല
            </h3>
            <p className="text-xs text-devotional-secondary mt-1.5 max-w-xs mx-auto leading-relaxed">
              അദ്ധ്യായങ്ങൾ വായിക്കുമ്പോൾ ശ്ലോകങ്ങളുടെ വലതുവശത്തുള്ള ബുക്ക്മാർക്ക് ചിഹ്നത്തിൽ തൊട്ട് ഇവിടെ സൂക്ഷിക്കാം.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-devotional-accent text-white font-bold text-xs shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>വായന ആരംഭിക്കുക</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-2xl bg-devotional-card border border-devotional shadow-2xs hover:border-devotional-accent/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-devotional-accent text-white">
                        സ്കന്ധം {bm.skandam}
                      </span>
                      <span className="text-xs font-bold text-devotional-primary">
                        അദ്ധ്യായം {bm.chapter}
                      </span>
                      <span className="text-xs font-semibold text-devotional-accent">
                        • ശ്ലോകം {bm.sectionNumber}
                      </span>
                    </div>
                    {bm.chapterTitle && (
                      <div className="text-xs text-devotional-secondary font-medium mt-1">
                        {bm.chapterTitle}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2 text-devotional-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition active:scale-95"
                    title="ബുക്ക്മാർക്ക് നീക്കുക"
                    aria-label="ബുക്ക്മാർക്ക് നീക്കുക"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {bm.sanskritSnippet && (
                  <div className="text-xs font-serif text-devotional-primary/90 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 mb-2 line-clamp-2">
                    {bm.sanskritSnippet}...
                  </div>
                )}

                {bm.meaningSnippet && (
                  <div className="text-xs md:text-sm text-devotional-primary leading-relaxed bg-black/2 p-2.5 rounded-xl border border-devotional/40 line-clamp-3">
                    {bm.meaningSnippet}...
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end">
                  <Link
                    href={`/skandam/${bm.skandam}/chapter/${bm.chapter}#section-${bm.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-devotional-accent hover:underline active:scale-98"
                  >
                    <span>ശ്ലോകത്തിലേക്ക് പോവുക</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
