'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { searchBhagavatam } from '@/data';
import { SearchResult } from '@/data/types';
import { Search as SearchIcon, X, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

const SUGGESTED_SEARCHES = [
  'അജാമിളൻ',
  'സൂതൻ',
  'പരീക്ഷിത്ത്',
  'നാരായണ',
  'ധ്രുവൻ',
  'ശ്രീകൃഷ്ണൻ',
  'ബ്രഹ്മാവ്',
  'വൈകുണ്ഠം',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      const res = searchBhagavatam(trimmed);
      setResults(res);
      setHasSearched(true);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query]);

  // Helper to highlight matching text in snippet
  const renderHighlightedSnippet = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const matchIdx = lowerText.indexOf(lowerTerm);

    if (matchIdx === -1) {
      return text.slice(0, 140) + (text.length > 140 ? '...' : '');
    }

    const start = Math.max(0, matchIdx - 40);
    const end = Math.min(text.length, matchIdx + searchTerm.length + 80);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';

    const snippet = text.slice(start, end);
    const snippetMatchIdx = snippet.toLowerCase().indexOf(lowerTerm);

    if (snippetMatchIdx === -1) return snippet;

    const before = snippet.slice(0, snippetMatchIdx);
    const match = snippet.slice(snippetMatchIdx, snippetMatchIdx + searchTerm.length);
    const after = snippet.slice(snippetMatchIdx + searchTerm.length);

    return (
      <span>
        {prefix}
        {before}
        <mark className="bg-amber-200 text-amber-950 font-bold px-1 rounded">
          {match}
        </mark>
        {after}
        {suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-24">
      <Navbar title="തിരയുക" showBack backHref="/" backLabel="ഹോം" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-4 pb-8">
        {/* Search Input Box */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-devotional-secondary">
            <SearchIcon className="w-5 h-5 text-devotional-accent" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="അർത്ഥങ്ങളിൽ തിരയുക... (ഉദാ: അജാമിളൻ)"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-devotional-card border-2 border-devotional focus:border-devotional-accent outline-hidden text-base md:text-lg text-devotional-primary placeholder:text-devotional-secondary/60 shadow-xs"
            autoFocus
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-devotional-secondary hover:text-devotional-primary"
              aria-label="മായ്ക്കുക"
            >
              <div className="p-1 rounded-full bg-black/10">
                <X className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* Suggested Search Terms */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-devotional-secondary mb-2 px-1">
            നിർദ്ദേശങ്ങൾ:
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SEARCHES.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                  query === item
                    ? 'bg-devotional-accent text-white'
                    : 'bg-devotional-card border border-devotional text-devotional-primary hover:border-devotional-accent'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        {hasSearched && (
          <div className="mb-3 px-1 flex items-center justify-between text-xs font-medium text-devotional-secondary">
            <span>
              &ldquo;<span className="text-devotional-primary font-bold">{query}</span>&rdquo; എന്നതിനുള്ള ഫലങ്ങൾ:
            </span>
            <span className="font-bold text-devotional-accent">
              {results.length} എണ്ണം
            </span>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((res) => (
              <Link
                key={res.sectionId}
                href={`/skandam/${res.skandam}/chapter/${res.chapter}#section-${res.sectionId}`}
                className="group block p-4 rounded-2xl bg-devotional-card border border-devotional shadow-2xs hover:border-devotional-accent/60 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-devotional-accent text-white">
                      സ്കന്ധം {res.skandam}
                    </span>
                    <span className="text-xs font-bold text-devotional-primary">
                      അദ്ധ്യായം {res.chapter}
                    </span>
                    <span className="text-xs font-semibold text-devotional-accent">
                      • ശ്ലോകം {res.sectionNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-devotional-secondary bg-black/5 px-2 py-0.5 rounded">
                    പേജ് {res.pageRange}
                  </span>
                </div>

                <div className="text-xs text-devotional-secondary font-medium mb-2">
                  {res.chapterTitle}
                </div>

                <div className="text-sm md:text-base text-devotional-primary leading-relaxed bg-black/2 p-3 rounded-xl border border-devotional/50">
                  {renderHighlightedSnippet(res.meaning, query)}
                </div>

                <div className="mt-2.5 flex items-center justify-end text-xs font-bold text-devotional-accent group-hover:translate-x-0.5 transition-transform">
                  <span>ഈ ശ്ലോകത്തിലേക്ക് പോവുക</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : hasSearched ? (
          /* Empty State */
          <div className="text-center py-12 px-4 rounded-2xl bg-devotional-card border border-devotional">
            <AlertCircle className="w-10 h-10 mx-auto text-devotional-secondary opacity-60 mb-2" />
            <h3 className="text-base font-bold text-devotional-primary">ഫലങ്ങൾ ഒന്നും കണ്ടെത്താനായില്ല</h3>
            <p className="text-xs text-devotional-secondary mt-1 max-w-xs mx-auto">
              &ldquo;{query}&rdquo; എന്ന വാക്ക് നിലവിൽ ഉൾപ്പെടുത്തിയിട്ടുള്ള മലയാള അർത്ഥങ്ങളിൽ കാണുന്നില്ല.
              മറ്റൊരു വാക്ക് നൽകി തിരഞ്ഞുനോക്കുക.
            </p>
          </div>
        ) : (
          /* Initial Guide */
          <div className="text-center py-10 px-4 rounded-2xl bg-devotional-card border border-dashed border-devotional">
            <BookOpen className="w-8 h-8 mx-auto text-devotional-accent mb-2" />
            <h3 className="text-sm font-bold text-devotional-primary">
              മലയാള അർത്ഥങ്ങളിൽ തിരയുക
            </h3>
            <p className="text-xs text-devotional-secondary mt-1">
              കഥാപാത്രങ്ങൾ, വ്യക്തികൾ, ഉപദേശങ്ങൾ എന്നിവയുടെ പേര് നൽകി ശ്ലോകങ്ങൾ കണ്ടെത്താം.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
