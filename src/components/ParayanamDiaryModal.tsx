'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParayanamNotes } from '@/hooks/useParayanamNotes';
import { X, BookOpen, Trash2, Calendar, Plus } from 'lucide-react';

interface ParayanamDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  skandam?: number;
  chapter?: number;
}

export function ParayanamDiaryModal({ isOpen, onClose, skandam, chapter }: ParayanamDiaryModalProps) {
  const { allNotes, chapterNotes, addNote, deleteNote, isLoaded } = useParayanamNotes(skandam, chapter);
  const [newText, setNewText] = useState('');
  const [viewAll, setViewAll] = useState(!skandam);

  if (!isOpen) return null;

  const notesToShow = (skandam && chapter && !viewAll) ? chapterNotes : allNotes;

  const handleAdd = () => {
    if (!newText.trim() || !skandam || !chapter) return;
    addNote(skandam, chapter, newText);
    setNewText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-devotional-card border border-devotional rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-devotional flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-devotional-accent" />
            <div>
              <h3 className="font-bold text-devotional-primary text-base">
                പാരായണ ഡയറി & കുറിപ്പുകൾ
              </h3>
              <p className="text-[11px] text-devotional-secondary">
                വായിച്ച തീയതികളും പ്രാർത്ഥനകളും രേഖപ്പെടുത്താം
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-devotional-secondary hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View filter toggle if in chapter */}
        {skandam && chapter && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <button
              onClick={() => setViewAll(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !viewAll ? 'bg-devotional-accent text-white' : 'bg-black/5 text-devotional-primary'
              }`}
            >
              ഈ അദ്ധ്യായത്തിലെ കുറിപ്പുകൾ
            </button>
            <button
              onClick={() => setViewAll(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewAll ? 'bg-devotional-accent text-white' : 'bg-black/5 text-devotional-primary'
              }`}
            >
              എല്ലാ കുറിപ്പുകളും ({allNotes.length})
            </button>
          </div>
        )}

        {/* Notes List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {skandam && chapter && !viewAll && (
            <div className="p-3 rounded-xl bg-devotional-main border border-devotional">
              <label className="block text-xs font-bold text-devotional-primary mb-1">
                പുതിയ കുറിപ്പ് / തീയതി ചേർക്കുക:
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="ഉദാ: ഏകാദശി നാളിൽ വായിച്ചു പൂർത്തിയാക്കി..."
                rows={2}
                className="w-full p-2.5 rounded-lg border border-devotional bg-devotional-card text-xs text-devotional-primary outline-hidden focus:border-devotional-accent"
              />
              <button
                onClick={handleAdd}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-devotional-accent text-white font-bold text-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>രേഖപ്പെടുത്തുക</span>
              </button>
            </div>
          )}

          {!isLoaded ? (
            <div className="text-center py-6 text-xs text-devotional-secondary">ലോഡ് ചെയ്യുന്നു...</div>
          ) : notesToShow.length === 0 ? (
            <div className="text-center py-8 text-xs text-devotional-secondary">
              കുറിപ്പുകൾ ഒന്നും ചേർത്തിട്ടില്ല.
            </div>
          ) : (
            notesToShow.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-devotional-main border border-devotional flex items-start justify-between gap-2"
              >
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-devotional-accent">
                      സ്കന്ധം {note.skandam} • അദ്ധ്യായം {note.chapter}
                    </span>
                    <span className="text-[10px] text-devotional-secondary bg-black/5 px-2 py-0.5 rounded">
                      {note.dateStr}
                    </span>
                  </div>
                  <p className="text-devotional-primary leading-relaxed">{note.text}</p>
                  {viewAll && (
                    <Link
                      href={`/skandam/${note.skandam}/chapter/${note.chapter}`}
                      onClick={onClose}
                      className="mt-1.5 inline-block text-[11px] font-semibold text-devotional-accent hover:underline"
                    >
                      അദ്ധ്യായത്തിലേക്ക് പോവുക →
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-devotional-secondary hover:text-red-600 rounded-lg"
                  title="നീക്കം ചെയ്യുക"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-devotional text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-black/5 text-devotional-primary font-semibold text-xs hover:bg-black/10"
          >
            അടയ്ക്കുക
          </button>
        </div>
      </div>
    </div>
  );
}
