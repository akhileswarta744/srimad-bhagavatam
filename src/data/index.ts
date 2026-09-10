import { Chapter, ChapterMeta, SkandamMeta, SearchResult, Sloka, Section } from './types';
import { SKANDAMS_META, ALL_CHAPTERS_META, findChapterByPageNumber } from './metadata';
import { getChapterSlokas, getSlokaById } from './sloka-loader';
import { getDetailedSectionsForChapter } from './meaning-provider';

export {
  SKANDAMS_META,
  ALL_CHAPTERS_META,
  findChapterByPageNumber,
  getChapterSlokas,
  getSlokaById,
};

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

/**
 * Gets full chapter data loaded modularly on demand.
 * Strictly Malayalam-focused (no Sanskrit in UI) with rich devotional meanings for all 335 chapters.
 */
export function getChapter(skandamNumber: number, chapterNumber: number): Chapter | null {
  const skandamChapters = ALL_CHAPTERS_META[skandamNumber];
  if (!skandamChapters) return null;

  const meta = skandamChapters.find((c) => c.chapter === chapterNumber);
  if (!meta) return null;

  // Load canonical slokas for this specific chapter
  const slokas: Sloka[] = getChapterSlokas(skandamNumber, chapterNumber);
  const authoredSlokas = slokas.filter((s) => s.malayalamMeaning && s.malayalamMeaning.trim().length > 0);

  let sections: Section[];

  if (authoredSlokas.length > 0) {
    // Authored verse-by-verse Malayalam meanings
    sections = authoredSlokas.map((s) => ({
      id: s.id,
      number: s.sloka,
      meaning: s.malayalamMeaning,
      speaker: s.speaker,
      page: meta.pageRange,
      notes: s.notes,
    }));
  } else {
    // Rich devotional narrative Malayalam sections for this chapter
    sections = getDetailedSectionsForChapter(meta);
  }

  return {
    skandam: meta.skandam,
    chapter: meta.chapter,
    title: meta.title,
    pageRange: meta.pageRange,
    totalVerses: meta.totalVerses || sections.length,
    sections,
    slokas,
  };
}

/**
 * Full-text Malayalam search across all 12 Skandhas and 335 chapters.
 */
export function searchBhagavatam(
  rawQuery: string,
  filterSkandam?: number,
  filterChapter?: number
): SearchResult[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  const numMatch = query.match(/^(\d+)$/);
  const targetSlokaNum = numMatch ? parseInt(numMatch[1], 10) : null;

  const targetSkandams = filterSkandam
    ? SKANDAMS_META.filter((s) => s.number === filterSkandam)
    : SKANDAMS_META;

  for (const skandam of targetSkandams) {
    const chapters = ALL_CHAPTERS_META[skandam.number] || [];
    const targetChapters = filterChapter
      ? chapters.filter((c) => c.chapter === filterChapter)
      : chapters;

    for (const chMeta of targetChapters) {
      const chapterData = getChapter(skandam.number, chMeta.chapter);
      if (!chapterData) continue;

      for (const sec of chapterData.sections) {
        // Match by sloka/section number
        if (targetSlokaNum !== null && (filterSkandam || filterChapter) && sec.number === targetSlokaNum) {
          results.push({
            skandam: skandam.number,
            skandamName: skandam.name,
            chapter: chMeta.chapter,
            chapterTitle: chMeta.title,
            sectionNumber: sec.number,
            sectionId: sec.id,
            meaning: sec.meaning,
            pageRange: chMeta.pageRange,
            matchIndex: 0,
            matchField: 'sloka',
          });
          continue;
        }

        // Search within Malayalam meaning
        if (query.length >= 2 && sec.meaning) {
          const matchIndex = sec.meaning.toLowerCase().indexOf(lowerQuery);
          if (matchIndex !== -1) {
            results.push({
              skandam: skandam.number,
              skandamName: skandam.name,
              chapter: chMeta.chapter,
              chapterTitle: chMeta.title,
              sectionNumber: sec.number,
              sectionId: sec.id,
              meaning: sec.meaning,
              pageRange: chMeta.pageRange,
              matchIndex,
              matchField: 'meaning',
            });
            if (results.length >= 100) return results;
          }
        }
      }
    }
  }

  return results;
}
