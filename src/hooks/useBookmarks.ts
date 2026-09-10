'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from '@/data/types';

const STORAGE_KEY = 'bhagavatam_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading bookmarks', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = (updated: Bookmark[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  };

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks((prev) => {
      // Check if already exists
      if (prev.some((b) => b.id === bookmark.id)) {
        return prev;
      }
      const updated = [bookmark, ...prev];
      saveToStorage(updated);
      return updated;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const isBookmarked = (id: string): boolean => {
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (bookmark: Bookmark) => {
    if (isBookmarked(bookmark.id)) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(bookmark);
    }
  };

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
