export interface Sloka {
  id: string; // e.g. "skandha-01-chapter-01-sloka-001"
  skandha: number;
  chapter: number;
  sloka: number;
  malayalamMeaning: string; // Authentic Malayalam meaning
  source: string; // Canonical source attribution, e.g. "Sanskrit Documents / Gita Press"
  speaker?: string; // Speaker attribution in Malayalam (e.g. "സൂതൻ പറഞ്ഞു", "ശ്രീശുകൻ പറഞ്ഞു")
  page?: string | number;
  notes?: string;
}

export interface Section {
  id: string; // e.g., "1-1-1" or "skandha-01-chapter-01-sloka-001"
  number: number | string; // e.g., 1 or "1-2"
  meaning: string; // Malayalam meaning
  speaker?: string;
  page?: string | number;
  notes?: string;
  isSample?: boolean;
}

export interface Chapter {
  skandam: number;
  chapter: number;
  title: string; // Malayalam title
  pageRange: string; // Physical book page range e.g., "47–51"
  totalVerses?: number;
  sections: Section[];
  slokas?: Sloka[];
}

export interface ChapterSlokas {
  skandha: number;
  chapter: number;
  title: string;
  pageRange: string;
  totalVerses: number;
  slokas: Sloka[];
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
  totalVerses?: number;
  pageRange: string; // e.g. "പേജ് 47–110"
  description: string;
}

export interface Bookmark {
  id: string; // stable ID e.g. "skandha-01-chapter-01-sloka-001" or legacy "1-1-1"
  skandam: number;
  chapter: number;
  chapterTitle: string;
  sectionNumber: number | string;
  slokaNumber?: number;
  meaningSnippet: string;
  timestamp: number;
}

export interface ReadingProgress {
  lastRead: {
    skandam: number;
    chapter: number;
    sectionId?: string;
    slokaId?: string;
    timestamp: number;
  } | null;
  completedChapters: Record<string, boolean>; // e.g. "1-1": true
  completedSlokas?: Record<string, boolean>; // e.g. "skandha-01-chapter-01-sloka-001": true
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
  matchField?: 'meaning' | 'sloka';
}

// Helper to construct stable sloka ID
export function formatSlokaId(skandha: number, chapter: number, sloka: number): string {
  const s = String(skandha).padStart(2, '0');
  const c = String(chapter).padStart(2, '0');
  const sl = String(sloka).padStart(3, '0');
  return `skandha-${s}-chapter-${c}-sloka-${sl}`;
}

// Helper to parse stable sloka ID
export function parseSlokaId(id: string): { skandha: number; chapter: number; sloka: number } | null {
  const match = id.match(/^skandha-(\d+)-chapter-(\d+)-sloka-(\d+)$/);
  if (match) {
    return {
      skandha: parseInt(match[1], 10),
      chapter: parseInt(match[2], 10),
      sloka: parseInt(match[3], 10),
    };
  }
  const legacyMatch = id.match(/^(\d+)-(\d+)-(\d+)$/);
  if (legacyMatch) {
    return {
      skandha: parseInt(legacyMatch[1], 10),
      chapter: parseInt(legacyMatch[2], 10),
      sloka: parseInt(legacyMatch[3], 10),
    };
  }
  return null;
}
