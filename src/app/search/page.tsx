'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { searchBhagavatam, SKANDAMS_META, ALL_CHAPTERS_META } from '@/data';
import { SearchResult } from '@/data/types';
import { Search as SearchIcon, X, ChevronRight, BookOpen, AlertCircle, Filter } from 'lucide-react';

const SUGGESTED_SEARCHES = [
  'जन्माद्यस्य',
  'सत्यं परं धीमहि',
  'അജാമിളൻ',
  'പരീക്ഷിത്ത്',
  'നാരായണ',
  'പ്രഹ്ലാദൻ',
  'ഗജേന്ദ്രൻ',
  'ധ്രുവൻ',
  'ശ്രീകൃഷ്ണൻ',
  'ബ്രഹ്മാവ്',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filterSkandam, setFilterSkandam] = useState<number | undefined>(undefined);
  const [filterChapter, setFilterChapter] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Available chapters for current selected skandam
  const availableChapters = filterSkandam ? ALL_CHAPTERS_META[filterSkandam] || [] : [];

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 1) {
      const res = searchBhagavatam(trimmed, filterSkandam, filterChapter);
      setResults(res);
      setHasSearched(true);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query, filterSkandam, filterChapter]);

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
            placeholder="ശ്ലോകം നമ്പർ / സംസ്കൃതം / മലയാളം... (ഉദാ: 1, അജാമിളൻ)"
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-devotional-card border-2 border-devotional focus:border-devotional-accent outline-hidden text-base md:text-lg text-devotional-primary placeholder:text-devotional-secondary/60 shadow-xs"
            autoFocus
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-devotional-secondary hover:text-devotional-primary"
              aria-label="തിരച്ചിൽ മാറ്റുക"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Bar: Skandha & Chapter */}
        <div className="p-3 mb-4 rounded-xl bg-devotional-card border border-devotional flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 font-bold text-devotional-secondary">
            <Filter className="w-3.5 h-3.5 text-devotional-accent" />
            <span>ഫിൽട്ടർ:</span>
          </div>

          {/* Skandha Filter */}
          <select
            value={filterSkandam || ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
              setFilterSkandam(val);
              setFilterChapter(undefined);
            }}
            className="px-2.5 py-1 rounded-lg border border-devotional bg-devotional-main text-devotional-primary font-semibold outline-hidden focus:border-devotional-accent"
          >
            <option value="">എല്ലാ സ്കന്ധങ്ങളും (1-12)</option>
            {SKANDAMS_META.map((sk) => (
              <option key={sk.number} value={sk.number}>
                {sk.shortName}
              </option>
            ))}
          </select>

          {/* Chapter Filter */}
          {filterSkandam && (
            <select
              value={filterChapter || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                setFilterChapter(val);
              }}
              className="px-2.5 py-1 rounded-lg border border-devotional bg-devotional-main text-devotional-primary font-semibold outline-hidden focus:border-devotional-accent"
            >
              <option value="">എല്ലാ അദ്ധ്യായങ്ങളും</option>
              {availableChapters.map((ch) => (
                <option key={ch.chapter} value={ch.chapter}>
                  അദ്ധ്യായം {ch.chapter}
                </option>
              ))}
            </select>
          )}

          {(filterSkandam || filterChapter) && (
            <button
              onClick={() => {
                setFilterSkandam(undefined);
                setFilterChapter(undefined);
              }}
              className="ml-auto text-devotional-accent font-bold hover:underline"
            >
              ഫിൽട്ടർ ഒഴിവാക്കുക
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!hasSearched && (
          <div className="mb-6">
            <p className="text-xs font-bold text-devotional-secondary mb-2">
              സാധാരണ തിരയുന്ന വിഷയങ്ങൾ:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SEARCHES.map((item) => (
                <button
                  key={item}
                  onClick={() => setQuery(item)}
                  className="px-3 py-1.5 rounded-xl bg-devotional-card border border-devotional text-xs text-devotional-primary font-medium hover:border-devotional-accent hover:bg-devotional-accent-light hover:text-devotional-accent transition active:scale-95 shadow-2xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Summary */}
        {hasSearched && (
          <div className="flex items-center justify-between mb-3 text-xs text-devotional-secondary px-1">
            <span>
              &ldquo;<strong className="text-devotional-primary">{query}</strong>&rdquo; എന്നതിനായുള്ള ഫലങ്ങൾ:
            </span>
            <span className="font-bold text-devotional-accent">
              {results.length} എണ്ണം കണ്ടെത്തി
            </span>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((res, index) => (
              <Link
                key={`${res.sectionId}-${index}`}
                href={`/skandam/${res.skandam}/chapter/${res.chapter}#section-${res.sectionId}`}
                className="group block p-4 rounded-2xl bg-devotional-card border border-devotional hover:border-devotional-accent transition-all shadow-2xs active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-devotional-accent-light text-devotional-accent text-xs font-bold">
                      സ്കന്ധം {res.skandam} • അദ്ധ്യായം {res.chapter}
                    </span>
                    <span className="text-xs font-semibold text-devotional-primary">
                      ശ്ലോകം {res.sectionNumber}
                    </span>
                  </div>

                  <span className="text-[11px] text-devotional-secondary">
                    പേജ് {res.pageRange}
                  </span>
                </div>

                <div className="text-xs font-bold text-devotional-primary mb-1">
                  {res.chapterTitle}
                </div>

                {/* Show Sanskrit snippet if matched or available */}
                {res.sanskrit && (
                  <div className="text-xs font-serif text-devotional-primary/90 bg-amber-50/50 p-2 rounded-lg mb-1.5 border border-amber-200/50 line-clamp-2">
                    {renderHighlightedSnippet(res.sanskrit, query)}
                  </div>
                )}

                {/* Show Malayalam meaning snippet */}
                {res.meaning && (
                  <div className="text-xs text-devotional-secondary leading-relaxed line-clamp-3">
                    {renderHighlightedSnippet(res.meaning, query)}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-devotional/50 flex items-center justify-between text-[11px] text-devotional-accent font-semibold">
                  <span>ഈ ശ്ലോകത്തിലേക്ക് പോവുക</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {hasSearched && results.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-devotional-card border border-devotional shadow-2xs">
            <AlertCircle className="w-10 h-10 text-devotional-secondary/60 mx-auto mb-3" />
            <p className="text-base font-bold text-devotional-primary mb-1">
              ഫലങ്ങളൊന്നും കണ്ടെത്താനായില്ല
            </p>
            <p className="text-xs text-devotional-secondary max-w-xs mx-auto leading-relaxed">
              &ldquo;{query}&rdquo; എന്നതിന് അനുയോജ്യമായ ശ്ലോകങ്ങളോ അർത്ഥങ്ങളോ കണ്ടെത്താനായില്ല. ശ്ലോക നമ്പർ (ഉദാ: 1) അല്ലെങ്കിൽ മറ്റൊരു പദം നൽകി വീണ്ടും ശ്രമിക്കുക.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
