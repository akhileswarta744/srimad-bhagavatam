export interface Section {
  id: string; // e.g., "1-1-1"
  number: number | string; // e.g., 1 or "1-2"
  meaning: string; // Malayalam meaning only, strictly no Sanskrit
  page?: string | number; // page reference in physical book
  notes?: string;
  isSample?: boolean; // if marked as sample placeholder
}

export interface Chapter {
  skandam: number;
  chapter: number;
  title: string; // Malayalam title
  pageRange: string; // Physical book page range e.g., "47–51"
  totalVerses?: number;
  sections: Section[];
}

export interface ChapterMeta {
  skandam: number;
  chapter: number;
  title: string;
  pageRange: string;
  totalVerses?: number;
}

export interface SkandamMeta {
  number: number;
  name: string; // e.g. "പ്രഥമ സ്കന്ധം"
  shortName: string; // e.g. "സ്കന്ധം 1"
  subTitle: string; // e.g. "അധികാര ലീല"
  chapterCount: number;
  pageRange: string; // e.g. "പേജ് 47–110"
  description: string;
}

export interface Bookmark {
  id: string; // e.g. "1-1-1"
  skandam: number;
  chapter: number;
  chapterTitle: string;
  sectionNumber: number | string;
  meaningSnippet: string;
  timestamp: number;
}

export interface ReadingProgress {
  lastRead: {
    skandam: number;
    chapter: number;
    sectionId?: string;
    timestamp: number;
  } | null;
  completedChapters: Record<string, boolean>; // e.g. "1-1": true
}

export type TextSize = 'normal' | 'large' | 'xlarge';
export type ThemeMode = 'sandalwood' | 'cream' | 'night';

export interface SearchResult {
  skandam: number;
  skandamName: string;
  chapter: number;
  chapterTitle: string;
  sectionNumber: number | string;
  sectionId: string;
  meaning: string;
  pageRange: string;
  matchIndex: number;
}
