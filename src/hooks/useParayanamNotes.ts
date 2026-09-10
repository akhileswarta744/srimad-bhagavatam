'use client';

import { useState, useEffect } from 'react';

export interface ParayanamNote {
  id: string; // e.g. "note-1-1-1712345"
  skandam: number;
  chapter: number;
  dateStr: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'bhagavatam_parayanam_notes';

export function useParayanamNotes(skandam?: number, chapter?: number) {
  const [allNotes, setAllNotes] = useState<ParayanamNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAllNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading parayanam notes', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveNotes = (updated: ParayanamNote[]) => {
    setAllNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving parayanam notes', e);
    }
  };

  const addNote = (s: number, c: number, text: string) => {
    const newNote: ParayanamNote = {
      id: `note-${s}-${c}-${Date.now()}`,
      skandam: s,
      chapter: c,
      dateStr: new Date().toLocaleDateString('ml-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      text: text.trim(),
      timestamp: Date.now(),
    };
    const updated = [newNote, ...allNotes];
    saveNotes(updated);
    return newNote;
  };

  const deleteNote = (id: string) => {
    const updated = allNotes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  // Notes for specific chapter
  const chapterNotes = (skandam && chapter)
    ? allNotes.filter((n) => n.skandam === skandam && n.chapter === chapter)
    : [];

  return {
    allNotes,
    chapterNotes,
    isLoaded,
    addNote,
    deleteNote,
  };
}
