'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { getChapter, getChaptersForSkandam, getSkandamMeta, getAllSkandams } from '@/data';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingSettings } from '@/hooks/useReadingSettings';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useMalayalamSpeech } from '@/hooks/useMalayalamSpeech';
import { ParayanamDiaryModal } from '@/components/ParayanamDiaryModal';
import { ChapterJumpModal } from '@/components/ChapterJumpModal';
import { Section } from '@/data/types';
import {
  Bookmark as BookmarkIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Type,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Sun,
  FileText,
  Compass,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function ChapterReadingPage() {
  const params = useParams();
  const router = useRouter();
  const skandamNum = parseInt(params.skandamNumber as string, 10);
  const chapterNum = parseInt(params.chapterNumber as string, 10);

  const skandamMeta = getSkandamMeta(skandamNum);
  const chapter = getChapter(skandamNum, chapterNum);
  const allChapters = getChaptersForSkandam(skandamNum);
  const allSkandams = getAllSkandams();

  const {
    saveProgress,
    toggleChapterComplete,
    isChapterCompleted,
    toggleSlokaComplete,
    isSlokaCompleted,
    getCompletedSlokasCount,
  } = useReadingProgress();

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { cycleTextSize, getTextSizeClass } = useReadingSettings();

  // Upgrade Hooks
  const { isLocked: isScreenAwake } = useWakeLock(true);
  const { isScrolling, speed, setSpeed, toggleAutoScroll, stopScrolling } = useAutoScroll();
  const {
    isSpeaking,
    currentSectionId,
    speakSection,
    speakChapter,
    stop: stopSpeech,
  } = useMalayalamSpeech();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);
  const [activeSlokaIndex, setActiveSlokaIndex] = useState(0);

  const isCompleted = isChapterCompleted(skandamNum, chapterNum);

  // Canonical sections from verified dataset
  const sectionsToDisplay: Section[] = chapter?.sections || [];

  // Purge any stale legacy placeholder cache from browser localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('custom_chapter_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('Cache purge notice:', e);
    }
  }, []);

  // Cross-chapter and cross-skandha navigation
  let prevLink: string | null = null;
  let prevLabel = '';
  if (chapterNum > 1) {
    prevLink = `/skandam/${skandamNum}/chapter/${chapterNum - 1}`;
    prevLabel = `അദ്ധ്യായം ${chapterNum - 1}`;
  } else if (skandamNum > 1) {
    const prevSkandamChapters = getChaptersForSkandam(skandamNum - 1);
    const lastChapter = prevSkandamChapters[prevSkandamChapters.length - 1]?.chapter || 1;
    prevLink = `/skandam/${skandamNum - 1}/chapter/${lastChapter}`;
    prevLabel = `സ്കന്ധം ${skandamNum - 1}, അദ്ധ്യായം ${lastChapter}`;
  }

  let nextLink: string | null = null;
  let nextLabel = '';
  if (chapterNum < allChapters.length) {
    nextLink = `/skandam/${skandamNum}/chapter/${chapterNum + 1}`;
    nextLabel = `അദ്ധ്യായം ${chapterNum + 1}`;
  } else if (skandamNum < 12) {
    nextLink = `/skandam/${skandamNum + 1}/chapter/1`;
    nextLabel = `സ്കന്ധം ${skandamNum + 1}, അദ്ധ്യായം 1`;
  }

  // Progress metrics
  const completedSlokasInChapter = sectionsToDisplay.filter((s) => isSlokaCompleted(s.id)).length;
  const chapterProgressPercent =
    sectionsToDisplay.length > 0
      ? Math.round((completedSlokasInChapter / sectionsToDisplay.length) * 100)
      : 0;
  const totalBhagavatamSlokasRead = getCompletedSlokasCount();

  // Save progress on mount or chapter change
  useEffect(() => {
    if (chapter) {
      saveProgress(skandamNum, chapterNum);
    }
  }, [skandamNum, chapterNum]);

  // Stop speech and autoscroll on navigation
  useEffect(() => {
    return () => {
      stopSpeech();
      stopScrolling();
    };
  }, [chapterNum, skandamNum]);

  // Auto-scroll to verse if hash is present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const elId = window.location.hash.replace('#', '');
      const el = document.getElementById(elId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-devotional-accent');
        }, 300);
      }
    }
  }, []);

  if (!skandamMeta || !chapter) {
    return (
      <div className="min-h-screen flex flex-col bg-devotional-main">
        <Navbar showBack backHref={`/skandam/${skandamNum}`} backLabel="അദ്ധ്യായങ്ങൾ" />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12 text-center">
          <p className="text-lg font-bold text-devotional-primary">അദ്ധ്യായം കണ്ടെത്താനായില്ല.</p>
          <Link
            href={`/skandam/${skandamNum}`}
            className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-devotional-accent text-white font-bold"
          >
            അദ്ധ്യായങ്ങളുടെ പട്ടികയിലേക്ക് മടങ്ങുക
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const handleCopySloka = (sec: Section) => {
    const lines = [
      `ശ്രീമദ് ഭാഗവതം - സ്കന്ധം ${skandamNum}, അദ്ധ്യായം ${chapterNum}, ശ്ലോകം ${sec.number}`,
      '',
    ];
    if (sec.speaker) lines.push(`[${sec.speaker}]`);
    if (sec.meaning) lines.push(sec.meaning);

    const shareText = lines.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(sec.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (sec: Section) => {
    const shareText = sec.meaning || '';
    const shareTitle = `ശ്രീമദ് ഭാഗവതം ${skandamNum}.${chapterNum}.${sec.number}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle}\n\n${shareText}`,
          url: window.location.href,
        });
      } catch {
        handleCopySloka(sec);
      }
    } else {
      handleCopySloka(sec);
    }
  };

  const scrollToSlokaIndex = (idx: number) => {
    if (idx < 0 || idx >= sectionsToDisplay.length) return;
    setActiveSlokaIndex(idx);
    const sec = sectionsToDisplay[idx];
    const el = document.getElementById(`section-${sec.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-28">
      <Navbar
        title={`${skandamMeta.shortName} • അദ്ധ്യായം ${chapterNum}`}
        showBack
        backHref={`/skandam/${skandamNum}`}
        backLabel="അദ്ധ്യായങ്ങൾ"
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-3 pb-8">
        {/* Chapter Header Card */}
        <div className="p-4 md:p-5 mb-4 rounded-2xl bg-devotional-card border border-devotional shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 text-xs flex-wrap">
            <button
              onClick={() => setIsJumpModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-devotional-accent bg-devotional-accent-light px-2.5 py-1 rounded-lg hover:bg-amber-100 transition active:scale-95"
              title="സ്കന്ധം / അദ്ധ്യായം മാറ്റുക"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{skandamMeta.shortName} ({skandamMeta.name})</span>
            </button>

            <div className="flex items-center gap-1.5">
              {isScreenAwake && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" />
                  <span>സ്ക്രീൻ ഓൺ</span>
                </span>
              )}
              <span className="font-semibold text-devotional-secondary bg-black/5 px-2.5 py-0.5 rounded-md">
                പേജ്: {chapter.pageRange}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-devotional-primary leading-snug">
                അദ്ധ്യായം {chapterNum}
              </h1>
              <p className="text-base md:text-lg font-medium text-devotional-secondary mt-1">
                {chapter.title}
              </p>
            </div>

            <button
              onClick={() => setIsJumpModalOpen(true)}
              className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-devotional-accent transition shrink-0"
              title="സ്കന്ധം & അദ്ധ്യായം തിരഞ്ഞെടുക്കുക"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          {/* Chapter & Overall Reading Progress Bar */}
          <div className="mt-3.5 pt-3 border-t border-devotional">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-devotional-secondary font-medium">
                അദ്ധ്യായ പാരായണ പുരോഗതി:
              </span>
              <span className="font-bold text-devotional-primary">
                {completedSlokasInChapter} / {sectionsToDisplay.length} ശ്ലോകങ്ങൾ ({chapterProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${chapterProgressPercent}%` }}
              />
            </div>

            {totalBhagavatamSlokasRead > 0 && (
              <div className="mt-2 text-[11px] text-devotional-secondary flex items-center justify-between">
                <span>ഭാഗവത സമഗ്ര പുരോഗതി:</span>
                <span className="font-semibold text-emerald-700">
                  {totalBhagavatamSlokasRead} / 14,089 ശ്ലോകങ്ങൾ വായിച്ചു
                </span>
              </div>
            )}
          </div>

          {/* Audio & Parayanam Action Controls */}
          <div className="mt-3 pt-3 border-t border-devotional flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                } else {
                  speakChapter(sectionsToDisplay);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-devotional-accent text-white shadow-2xs'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>വായന നിർത്തുക</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>അദ്ധ്യായം മുഴുവൻ കേൾക്കുക</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsDiaryOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-devotional-primary transition active:scale-95"
                title="പാരായണ കുറിപ്പ് / തീയതി"
              >
                <FileText className="w-3.5 h-3.5 text-devotional-accent" />
                <span>കുറിപ്പ്</span>
              </button>

              <button
                onClick={cycleTextSize}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-devotional-primary transition active:scale-95"
                title="അക്ഷരവലിപ്പം"
              >
                <Type className="w-3.5 h-3.5 text-devotional-accent" />
                <span>വലിപ്പം</span>
              </button>

              <button
                onClick={() => toggleChapterComplete(skandamNum, chapterNum)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-black/5 text-devotional-primary hover:bg-black/10'
                }`}
                title="അദ്ധ്യായം വായിച്ചു കഴിഞ്ഞു"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-700' : 'text-devotional-secondary'}`} />
                <span>{isCompleted ? 'പൂർത്തിയായി' : 'പൂർത്തിയാക്കുക'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* In-Page Quick Sloka Stepper / Navigator Bar */}
        <div className="sticky top-14 z-30 mb-4 p-2.5 rounded-xl bg-devotional-card/95 backdrop-blur-md border border-devotional shadow-xs flex items-center justify-between gap-2">
          <button
            onClick={() => scrollToSlokaIndex(Math.max(0, activeSlokaIndex - 1))}
            disabled={activeSlokaIndex <= 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-devotional-primary disabled:opacity-40 hover:bg-black/5 active:scale-95"
          >
            <ArrowUp className="w-3.5 h-3.5 text-devotional-accent" />
            <span>മുൻപത്തെ ശ്ലോകം</span>
          </button>

          {/* Quick Sloka Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-devotional-secondary">ശ്ലോകം:</span>
            <select
              value={activeSlokaIndex}
              onChange={(e) => scrollToSlokaIndex(parseInt(e.target.value, 10))}
              className="px-2 py-1 rounded-lg border border-devotional bg-devotional-main text-devotional-primary text-xs font-bold outline-hidden focus:border-devotional-accent"
            >
              {sectionsToDisplay.map((sec, idx) => (
                <option key={sec.id} value={idx}>
                  {sec.number} {isSlokaCompleted(sec.id) ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => scrollToSlokaIndex(Math.min(sectionsToDisplay.length - 1, activeSlokaIndex + 1))}
            disabled={activeSlokaIndex >= sectionsToDisplay.length - 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-devotional-primary disabled:opacity-40 hover:bg-black/5 active:scale-95"
          >
            <span>അടുത്ത ശ്ലോകം</span>
            <ArrowDown className="w-3.5 h-3.5 text-devotional-accent" />
          </button>
        </div>

        {/* Sequential Bilingual Sloka Cards */}
        <div className="space-y-4">
          {sectionsToDisplay.map((sec, index) => {
            const isSaved = isBookmarked(sec.id);
            const isRead = isSlokaCompleted(sec.id);
            const isBeingSpoken = currentSectionId === sec.id;

            return (
              <article
                key={sec.id}
                id={`section-${sec.id}`}
                className={`verse-target relative p-5 rounded-2xl bg-devotional-card border transition-all ${
                  isBeingSpoken
                    ? 'ring-2 ring-devotional-accent bg-amber-50/80 shadow-md'
                    : isRead
                    ? 'border-emerald-200/80 bg-emerald-50/20 shadow-2xs'
                    : isSaved
                    ? 'border-devotional-accent/60 shadow-xs'
                    : 'border-devotional shadow-2xs'
                }`}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-devotional/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-devotional-accent-light text-devotional-accent font-bold text-sm tracking-wide">
                      ശ്ലോകം {sec.number}
                    </span>

                    {sec.speaker && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                        {sec.speaker}
                      </span>
                    )}

                    {sec.notes && (
                      <span className="text-[11px] font-semibold text-devotional-accent bg-amber-100/80 px-2 py-0.5 rounded">
                        {sec.notes}
                      </span>
                    )}
                  </div>

                  {/* Actions: Mark Read, Speak, Bookmark & Share */}
                  <div className="flex items-center gap-1">
                    {/* Read status toggle */}
                    <button
                      onClick={() => toggleSlokaComplete(sec.id)}
                      className={`p-2 rounded-xl transition active:scale-95 ${
                        isRead
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'text-devotional-secondary hover:text-emerald-700 hover:bg-black/5'
                      }`}
                      title={isRead ? 'വായിച്ചതായി അടയാളപ്പെടുത്തി' : 'വായിച്ചതായി അടയാളപ്പെടുത്തുക'}
                      aria-label="ശ്ലോകം വായിച്ചു"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isRead ? 'fill-emerald-200' : ''}`} />
                    </button>

                    {/* Audio speech button */}
                    <button
                      onClick={() => {
                        if (isBeingSpoken) {
                          stopSpeech();
                        } else {
                          const textToSpeak = sec.meaning || '';
                          speakSection(sec.id, textToSpeak);
                        }
                      }}
                      className={`p-2 rounded-xl transition active:scale-95 ${
                        isBeingSpoken
                          ? 'bg-devotional-accent text-white'
                          : 'text-devotional-secondary hover:text-devotional-accent hover:bg-black/5'
                      }`}
                      title="ഈ ഭാഗം കേൾക്കുക"
                      aria-label="ശ്രവിക്കുക"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Bookmark toggle */}
                    <button
                      onClick={() =>
                        toggleBookmark({
                          id: sec.id,
                          skandam: skandamNum,
                          chapter: chapterNum,
                          chapterTitle: chapter.title,
                          sectionNumber: sec.number,
                          slokaNumber: typeof sec.number === 'number' ? sec.number : parseInt(String(sec.number), 10),
                          meaningSnippet: sec.meaning ? sec.meaning.slice(0, 120) : '',
                          timestamp: Date.now(),
                        })
                      }
                      className={`p-2 rounded-xl transition active:scale-95 ${
                        isSaved
                          ? 'bg-devotional-accent text-white'
                          : 'text-devotional-secondary hover:text-devotional-accent hover:bg-black/5'
                      }`}
                      title={isSaved ? 'ബുക്ക്മാർക്ക് നീക്കം ചെയ്യുക' : 'ബുക്ക്മാർക്ക് ചെയ്യുക'}
                      aria-label="ബുക്ക്മാർക്ക്"
                    >
                      <BookmarkIcon className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    {/* Share / Copy button */}
                    <button
                      onClick={() => handleShare(sec)}
                      className="p-2 rounded-xl text-devotional-secondary hover:text-devotional-accent hover:bg-black/5 transition active:scale-95"
                      title="പകർത്തുക / ഷെയർ ചെയ്യുക"
                      aria-label="പകർത്തുക"
                    >
                      {copiedId === sec.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Malayalam Meaning Block */}
                {sec.meaning && sec.meaning.trim().length > 0 ? (
                  <div className="mt-1">
                    <p
                      className={`text-devotional-primary font-normal leading-relaxed tracking-normal ${getTextSizeClass()}`}
                    >
                      {sec.meaning}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-devotional-secondary/70 italic bg-black/5 px-3 py-2 rounded-lg">
                    മലയാള അർത്ഥം ലഭ്യമല്ല.
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom Chapter Completion & Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-devotional space-y-4">
          {/* Chapter Read Status Toggle Card */}
          <div className="p-4 rounded-xl bg-devotional-card border border-devotional flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-devotional-primary text-sm">
                ഈ അദ്ധ്യായം പൂർത്തിയായെങ്കിൽ:
              </div>
              <div className="text-xs text-devotional-secondary">
                {isCompleted ? 'വായിച്ചു കഴിഞ്ഞതായി അടയാളപ്പെടുത്തിയിരിക്കുന്നു' : 'വായിച്ചു കഴിഞ്ഞതായി അടയാളപ്പെടുത്താം'}
              </div>
            </div>

            <button
              onClick={() => toggleChapterComplete(skandamNum, chapterNum)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-devotional-accent text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'വായിച്ചു കഴിഞ്ഞു ✓' : 'പൂർത്തിയായി'}</span>
            </button>
          </div>

          {/* Previous / Next Chapter Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {prevLink ? (
              <Link
                href={prevLink}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-devotional-card border border-devotional text-devotional-primary hover:border-devotional-accent transition active:scale-98"
              >
                <ChevronLeft className="w-5 h-5 text-devotional-accent shrink-0" />
                <div className="min-w-0 text-left">
                  <div className="text-[11px] text-devotional-secondary font-semibold">മുൻപത്തെ അദ്ധ്യായം</div>
                  <div className="text-xs md:text-sm font-bold truncate">{prevLabel}</div>
                </div>
              </Link>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/5 opacity-50 text-center flex items-center justify-center text-xs font-semibold text-devotional-secondary">
                ഭാഗവതാരംഭം
              </div>
            )}

            {nextLink ? (
              <Link
                href={nextLink}
                className="flex items-center justify-end gap-2 p-3.5 rounded-xl bg-devotional-card border border-devotional text-devotional-primary hover:border-devotional-accent transition active:scale-98 text-right"
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-devotional-secondary font-semibold">അടുത്ത അദ്ധ്യായം</div>
                  <div className="text-xs md:text-sm font-bold truncate">{nextLabel}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-devotional-accent shrink-0" />
              </Link>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/5 opacity-50 text-center flex items-center justify-center text-xs font-semibold text-devotional-secondary">
                ഭാഗവത സമാപ്തി
              </div>
            )}
          </div>

          {/* Quick Selectors: Skandha & Chapter Modal trigger */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setIsJumpModalOpen(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-devotional bg-devotional-card text-devotional-primary font-bold text-xs md:text-sm hover:bg-black/5 transition active:scale-98"
            >
              <Compass className="w-4 h-4 text-devotional-accent" />
              <span>മറ്റൊരു അദ്ധ്യായം</span>
            </button>

            <Link
              href={`/skandam/${skandamNum}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-devotional bg-devotional-card text-devotional-primary font-bold text-xs md:text-sm hover:bg-black/5 transition active:scale-98"
            >
              <List className="w-4 h-4 text-devotional-accent" />
              <span>അദ്ധ്യായങ്ങളുടെ പട്ടിക</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Diary Modal */}
      <ParayanamDiaryModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        skandam={skandamNum}
        chapter={chapterNum}
      />

      {/* Skandha & Chapter Jump Modal */}
      <ChapterJumpModal
        isOpen={isJumpModalOpen}
        onClose={() => setIsJumpModalOpen(false)}
        currentSkandam={skandamNum}
        currentChapter={chapterNum}
      />

      <BottomNav />
    </div>
  );
}
