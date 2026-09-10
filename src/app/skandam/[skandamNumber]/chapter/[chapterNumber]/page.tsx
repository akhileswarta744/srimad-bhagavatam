'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { getChapter, getChaptersForSkandam, getSkandamMeta } from '@/data';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingSettings } from '@/hooks/useReadingSettings';
import { useCustomContent } from '@/hooks/useCustomContent';
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
  Edit3,
  X,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';

export default function ChapterReadingPage() {
  const params = useParams();
  const router = useRouter();
  const skandamNum = parseInt(params.skandamNumber as string, 10);
  const chapterNum = parseInt(params.chapterNumber as string, 10);

  const skandamMeta = getSkandamMeta(skandamNum);
  const chapter = getChapter(skandamNum, chapterNum);
  const allChapters = getChaptersForSkandam(skandamNum);

  const { saveProgress, toggleChapterComplete, isChapterCompleted } = useReadingProgress();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { settings, cycleTextSize, getTextSizeClass } = useReadingSettings();
  const { customSections, saveCustomSections, resetToDefault } = useCustomContent(skandamNum, chapterNum);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editableSections, setEditableSections] = useState<Section[]>([]);
  const [newMeaning, setNewMeaning] = useState('');
  const [newVerseNum, setNewVerseNum] = useState<number>(1);
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);

  const isCompleted = isChapterCompleted(skandamNum, chapterNum);
  const prevChapter = allChapters.find((c) => c.chapter === chapterNum - 1);
  const nextChapter = allChapters.find((c) => c.chapter === chapterNum + 1);

  const sectionsToDisplay = customSections && customSections.length > 0 ? customSections : (chapter?.sections || []);

  // Sync editable sections when editor opens
  useEffect(() => {
    if (isEditorOpen) {
      setEditableSections([...sectionsToDisplay]);
      setNewVerseNum(sectionsToDisplay.length + 1);
    }
  }, [isEditorOpen]);

  // Automatically save reading progress on mount or chapter change
  useEffect(() => {
    if (chapter) {
      saveProgress(skandamNum, chapterNum);
    }
  }, [skandamNum, chapterNum]);

  // Handle auto-scroll to verse if hash is present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const elId = window.location.hash.replace('#', '');
      const el = document.getElementById(elId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          el.classList.add('verse-highlight');
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

  const handleCopyMeaning = (secId: string, text: string, verseNum: number | string) => {
    const shareText = `ശ്രീമദ് ഭാഗവതം - സ്കന്ധം ${skandamNum}, അദ്ധ്യായം ${chapterNum}, ശ്ലോകം ${verseNum}:\n\n${text}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedId(secId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddVerse = () => {
    if (!newMeaning.trim()) return;
    const newSec: Section = {
      id: `${skandamNum}-${chapterNum}-${newVerseNum}`,
      number: newVerseNum,
      meaning: newMeaning.trim(),
    };
    const updated = [...editableSections, newSec];
    setEditableSections(updated);
    setNewMeaning('');
    setNewVerseNum(updated.length + 1);
  };

  const handleRemoveVerse = (idx: number) => {
    const updated = editableSections.filter((_, i) => i !== idx);
    setEditableSections(updated);
  };

  const handleSaveEditor = () => {
    saveCustomSections(editableSections);
    setIsEditorOpen(false);
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    // Parse numbered lines or split paragraphs
    const lines = bulkInput.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Section[] = [];
    let currentNum = 1;

    for (const line of lines) {
      const match = line.match(/^([0-9]+)[\.\:\-]\s*(.*)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        const text = match[2].trim();
        parsed.push({
          id: `${skandamNum}-${chapterNum}-${num}`,
          number: num,
          meaning: text,
        });
        currentNum = num + 1;
      } else {
        parsed.push({
          id: `${skandamNum}-${chapterNum}-${currentNum}`,
          number: currentNum,
          meaning: line.trim(),
        });
        currentNum++;
      }
    }

    if (parsed.length > 0) {
      setEditableSections(parsed);
      setIsBulkMode(false);
      setBulkInput('');
    }
  };

  const handleExportJSON = () => {
    const data = {
      skandam: skandamNum,
      chapter: chapterNum,
      title: chapter.title,
      pageRange: chapter.pageRange,
      totalVerses: editableSections.length,
      sections: editableSections,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skandam-${skandamNum}-chapter-${chapterNum}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-devotional-main pb-24">
      <Navbar
        title={`${skandamMeta.shortName} • അദ്ധ്യായം ${chapterNum}`}
        showBack
        backHref={`/skandam/${skandamNum}`}
        backLabel="അദ്ധ്യായങ്ങൾ"
      />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-3 pb-8">
        {/* Chapter Header Card */}
        <div className="p-4 md:p-5 mb-5 rounded-2xl bg-devotional-card border border-devotional shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="font-semibold text-devotional-accent bg-devotional-accent-light px-2.5 py-0.5 rounded-md">
              {skandamMeta.shortName} ({skandamMeta.name})
            </span>
            <span className="font-semibold text-devotional-secondary bg-black/5 px-2.5 py-0.5 rounded-md">
              പുസ്തകത്തിലെ പേജ്: {chapter.pageRange}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-devotional-primary leading-snug">
            അദ്ധ്യായം {chapterNum}
          </h1>
          <p className="text-base md:text-lg font-medium text-devotional-secondary mt-1">
            {chapter.title}
          </p>

          {/* Quick Reading Actions Bar */}
          <div className="mt-4 pt-3 border-t border-devotional flex items-center justify-between gap-2">
            {/* Mark as Completed Button */}
            <button
              onClick={() => toggleChapterComplete(skandamNum, chapterNum)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-black/5 text-devotional-primary hover:bg-black/10'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-700' : 'text-devotional-secondary'}`} />
              <span>{isCompleted ? 'വായിച്ചു കഴിഞ്ഞു' : 'വായിച്ചതായി അടയാളപ്പെടുത്തുക'}</span>
            </button>

            <div className="flex items-center gap-1">
              {/* Edit / Add meanings button */}
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-devotional-accent-light text-devotional-accent hover:bg-amber-100 transition active:scale-95"
                title="അർത്ഥങ്ങൾ ചേർക്കുക / മാറ്റുക"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>അർത്ഥങ്ങൾ ചേർക്കുക</span>
              </button>

              {/* Quick Text Size Toggle */}
              <button
                onClick={cycleTextSize}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-devotional-primary transition active:scale-95"
                title="അക്ഷരവലിപ്പം"
              >
                <Type className="w-3.5 h-3.5 text-devotional-accent" />
                <span>വലിപ്പം</span>
              </button>
            </div>
          </div>
        </div>

        {/* Note indicating only Malayalam meaning is shown */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-devotional-secondary flex items-center justify-between">
          <span>📖 പുസ്തകം വായിക്കുമ്പോൾ അർത്ഥം ഗ്രഹിക്കുവാനായുള്ള മലയാള വ്യാഖ്യാനം</span>
          <span className="text-[11px] font-semibold text-devotional-accent shrink-0 ml-2">
            {sectionsToDisplay.length} ഭാഗങ്ങൾ
          </span>
        </div>

        {/* Section-by-Section Malayalam Meanings */}
        <div className="space-y-4">
          {sectionsToDisplay.map((sec, index) => {
            const isSaved = isBookmarked(sec.id);

            return (
              <article
                key={sec.id}
                id={`section-${sec.id}`}
                className={`verse-target relative p-5 rounded-2xl bg-devotional-card border transition-all ${
                  isSaved
                    ? 'border-devotional-accent/60 shadow-xs'
                    : 'border-devotional shadow-2xs'
                }`}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-devotional/60">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-devotional-accent-light text-devotional-accent font-bold text-sm tracking-wide">
                      ശ്ലോകം {sec.number}
                    </span>
                    {sec.page && (
                      <span className="text-[11px] text-devotional-secondary font-medium">
                        പേജ് {sec.page}
                      </span>
                    )}
                    {sec.notes && (
                      <span className="text-[11px] font-semibold text-devotional-accent bg-amber-100/80 px-2 py-0.5 rounded">
                        {sec.notes}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons: Bookmark & Copy */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        toggleBookmark({
                          id: sec.id,
                          skandam: skandamNum,
                          chapter: chapterNum,
                          chapterTitle: chapter.title,
                          sectionNumber: sec.number,
                          meaningSnippet: sec.meaning.slice(0, 100),
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

                    <button
                      onClick={() => handleCopyMeaning(sec.id, sec.meaning, sec.number)}
                      className="p-2 rounded-xl text-devotional-secondary hover:text-devotional-accent hover:bg-black/5 transition active:scale-95"
                      title="പകർത്തുക"
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

                {/* Malayalam Meaning Text Only (Strictly No Sanskrit) */}
                <div
                  className={`text-devotional-primary tracking-normal font-normal ${getTextSizeClass()} ${
                    sec.isSample ? 'italic opacity-75' : ''
                  }`}
                >
                  {sec.meaning}
                </div>
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
                വായിച്ചു കഴിഞ്ഞതായി അടയാളപ്പെടുത്താം
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
            {prevChapter ? (
              <Link
                href={`/skandam/${skandamNum}/chapter/${prevChapter.chapter}`}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-devotional-card border border-devotional text-devotional-primary hover:border-devotional-accent transition active:scale-98"
              >
                <ChevronLeft className="w-5 h-5 text-devotional-accent shrink-0" />
                <div className="min-w-0 text-left">
                  <div className="text-[11px] text-devotional-secondary font-semibold">മുൻപത്തെ അദ്ധ്യായം</div>
                  <div className="text-xs md:text-sm font-bold truncate">അദ്ധ്യായം {prevChapter.chapter}</div>
                </div>
              </Link>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/5 opacity-50 text-center flex items-center justify-center text-xs font-semibold text-devotional-secondary">
                ആദ്യ അദ്ധ്യായം
              </div>
            )}

            {nextChapter ? (
              <Link
                href={`/skandam/${skandamNum}/chapter/${nextChapter.chapter}`}
                className="flex items-center justify-end gap-2 p-3.5 rounded-xl bg-devotional-card border border-devotional text-devotional-primary hover:border-devotional-accent transition active:scale-98 text-right"
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-devotional-secondary font-semibold">അടുത്ത അദ്ധ്യായം</div>
                  <div className="text-xs md:text-sm font-bold truncate">അദ്ധ്യായം {nextChapter.chapter}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-devotional-accent shrink-0" />
              </Link>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/5 opacity-50 text-center flex items-center justify-center text-xs font-semibold text-devotional-secondary">
                അവസാന അദ്ധ്യായം
              </div>
            )}
          </div>

          {/* Back to Chapters List & Home */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href={`/skandam/${skandamNum}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-devotional bg-devotional-card text-devotional-primary font-bold text-xs md:text-sm hover:bg-black/5 transition active:scale-98"
            >
              <List className="w-4 h-4 text-devotional-accent" />
              <span>അദ്ധ്യായങ്ങളുടെ പട്ടിക</span>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-devotional bg-devotional-card text-devotional-primary font-bold text-xs md:text-sm hover:bg-black/5 transition active:scale-98"
            >
              <span>ഹോമിലേക്ക് മടങ്ങുക</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Editor Modal for Adding / Modifying Meanings */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-devotional-card border border-devotional rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-devotional flex items-center justify-between">
              <div>
                <h3 className="font-bold text-devotional-primary text-base">
                  അർത്ഥങ്ങൾ തിരുത്തുക / ചേർക്കുക
                </h3>
                <p className="text-xs text-devotional-secondary">
                  സ്കന്ധം {skandamNum}, അദ്ധ്യായം {chapterNum}
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 text-devotional-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-4 pt-3 flex items-center gap-2">
              <button
                onClick={() => setIsBulkMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !isBulkMode
                    ? 'bg-devotional-accent text-white'
                    : 'bg-black/5 text-devotional-primary'
                }`}
              >
                ശ്ലോകം തോറും
              </button>
              <button
                onClick={() => setIsBulkMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isBulkMode
                    ? 'bg-devotional-accent text-white'
                    : 'bg-black/5 text-devotional-primary'
                }`}
              >
                ഒന്നിച്ച് ചേർക്കുക (Bulk Text)
              </button>
              <button
                onClick={handleExportJSON}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-devotional hover:bg-black/5 text-devotional-secondary"
                title="JSON ഫയലായി ഡൗൺലോഡ് ചെയ്യുക"
              >
                <Download className="w-3.5 h-3.5 text-devotional-accent" />
                <span>JSON ഡൗൺലോഡ്</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {isBulkMode ? (
                <div>
                  <label className="block text-xs font-semibold text-devotional-secondary mb-1">
                    മുഴുവൻ ശ്ലോകാർത്ഥങ്ങളും ഇവിടെ പേസ്റ്റ് ചെയ്യുക (ഓരോ വരിയിലും ശ്ലോകം നമ്പർ നൽകുക, ഉദാ: 1. അർത്ഥം...):
                  </label>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    rows={12}
                    placeholder="1. ആദ്യത്തെ ശ്ലോകത്തിന്റെ മലയാള അർത്ഥം...&#10;2. രണ്ടാമത്തെ ശ്ലോകത്തിന്റെ മലയാള അർത്ഥം..."
                    className="w-full p-3 rounded-xl border border-devotional bg-devotional-main text-devotional-primary text-sm focus:border-devotional-accent outline-hidden"
                  />
                  <button
                    onClick={handleBulkImport}
                    className="mt-2 w-full py-2.5 rounded-xl bg-devotional-accent text-white font-bold text-xs"
                  >
                    പട്ടികയിലേക്ക് മാറ്റുക
                  </button>
                </div>
              ) : (
                <>
                  {/* Existing Verses List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editableSections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-devotional-main border border-devotional flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-devotional-accent">
                            ശ്ലോകം {sec.number}:
                          </span>{' '}
                          <span className="text-devotional-primary line-clamp-2">
                            {sec.meaning}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveVerse(idx)}
                          className="p-1 text-devotional-secondary hover:text-red-600 rounded-lg"
                          title="നീക്കം ചെയ്യുക"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Verse Form */}
                  <div className="pt-3 border-t border-devotional">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-devotional-primary">
                        ശ്ലോകം നമ്പർ:
                      </span>
                      <input
                        type="number"
                        value={newVerseNum}
                        onChange={(e) => setNewVerseNum(parseInt(e.target.value, 10) || 1)}
                        className="w-16 p-1.5 text-center text-xs font-bold border border-devotional rounded-lg bg-devotional-main"
                      />
                    </div>
                    <textarea
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      placeholder="മലയാള അർത്ഥം ടൈപ്പ് ചെയ്യുക..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-devotional bg-devotional-main text-devotional-primary text-xs outline-hidden focus:border-devotional-accent"
                    />
                    <button
                      onClick={handleAddVerse}
                      className="mt-1.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-devotional-accent text-white font-bold text-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ശ്ലോകം ചേർക്കുക</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-devotional flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  resetToDefault();
                  setIsEditorOpen(false);
                }}
                className="text-xs text-devotional-secondary hover:underline"
              >
                യഥാർത്ഥ രൂപത്തിലേക്ക് മാറ്റുക (Reset)
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-devotional hover:bg-black/5"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  onClick={handleSaveEditor}
                  className="px-5 py-2 rounded-xl bg-devotional-accent text-white font-bold text-xs active:scale-95"
                >
                  സൂക്ഷിക്കുക (Save)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
