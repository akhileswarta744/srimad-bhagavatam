import { Chapter, ChapterMeta, SkandamMeta, SearchResult } from './types';
import { SKANDAMS_META, ALL_CHAPTERS_META } from './metadata';
export { SKANDAMS_META, ALL_CHAPTERS_META };

// Individual authored chapters with authentic Malayalam meanings
import { chapter1 as s1c1 } from './skandams/skandam-1/chapter-1';
import { chapter2 as s1c2 } from './skandams/skandam-1/chapter-2';
import { chapter9 as s2c9 } from './skandams/skandam-2/chapter-9';
import { chapter13 as s3c13 } from './skandams/skandam-3/chapter-13';
import { chapter8 as s4c8 } from './skandams/skandam-4/chapter-8';
import { chapter5 as s5c5 } from './skandams/skandam-5/chapter-5';
import { chapter1 as s6c1 } from './skandams/skandam-6/chapter-1';

// Registry of authored chapters
const AUTHORED_CHAPTERS: Record<string, Chapter> = {
  "1-1": s1c1,
  "1-2": s1c2,
  "2-9": s2c9,
  "3-13": s3c13,
  "4-8": s4c8,
  "5-5": s5c5,
  "6-1": s6c1,
};

// Generates clearly marked placeholder sections for chapters pending full text import
function createPlaceholderChapter(meta: ChapterMeta): Chapter {
  const verseCount = meta.totalVerses || 10;
  // Create 5 sample sections for testing
  const sampleCount = Math.min(verseCount, 5);
  const sections = Array.from({ length: sampleCount }, (_, idx) => {
    const num = idx + 1;
    return {
      id: `${meta.skandam}-${meta.chapter}-${num}`,
      number: num,
      meaning: `[അദ്ധ്യായം ${meta.chapter} - ശ്ലോകം ${num}-ന്റെ മലയാള അർത്ഥം ചേർക്കുവാനായി മാറ്റിവെച്ചിരിക്കുന്നു. പുസ്തകത്തിലെ പേജ്: ${meta.pageRange}]`,
      isSample: true,
    };
  });

  return {
    skandam: meta.skandam,
    chapter: meta.chapter,
    title: meta.title,
    pageRange: meta.pageRange,
    totalVerses: meta.totalVerses,
    sections,
  };
}

// Get all skandams metadata
export function getAllSkandams(): SkandamMeta[] {
  return SKANDAMS_META;
}

// Get metadata for a specific skandam
export function getSkandamMeta(skandamNumber: number): SkandamMeta | undefined {
  return SKANDAMS_META.find((s) => s.number === skandamNumber);
}

// Get all chapters metadata for a skandam
export function getChaptersForSkandam(skandamNumber: number): ChapterMeta[] {
  return ALL_CHAPTERS_META[skandamNumber] || [];
}

// Get full chapter data (either authored or generated placeholder)
export function getChapter(skandamNumber: number, chapterNumber: number): Chapter | null {
  const key = `${skandamNumber}-${chapterNumber}`;
  if (AUTHORED_CHAPTERS[key]) {
    return AUTHORED_CHAPTERS[key];
  }

  const skandamChapters = ALL_CHAPTERS_META[skandamNumber];
  if (!skandamChapters) return null;

  const meta = skandamChapters.find((c) => c.chapter === chapterNumber);
  if (!meta) return null;

  return createPlaceholderChapter(meta);
}

// Full text search across all available chapters
export function searchBhagavatam(rawQuery: string): SearchResult[] {
  const query = rawQuery.trim();
  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // Search through all 6 skandams
  for (const skandam of SKANDAMS_META) {
    const chapters = ALL_CHAPTERS_META[skandam.number] || [];
    for (const chMeta of chapters) {
      const chapterData = getChapter(skandam.number, chMeta.chapter);
      if (!chapterData) continue;

      for (const sec of chapterData.sections) {
        const text = sec.meaning;
        const index = text.toLowerCase().indexOf(lowerQuery);
        if (index !== -1) {
          results.push({
            skandam: skandam.number,
            skandamName: skandam.name,
            chapter: chMeta.chapter,
            chapterTitle: chMeta.title,
            sectionNumber: sec.number,
            sectionId: sec.id,
            meaning: sec.meaning,
            pageRange: chMeta.pageRange,
            matchIndex: index,
          });
        }
      }
    }
  }

  return results;
}
