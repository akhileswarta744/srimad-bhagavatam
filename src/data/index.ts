import { Chapter, ChapterMeta, SkandamMeta, SearchResult, Sloka, Section } from './types';
import { SKANDAMS_META, ALL_CHAPTERS_META, findChapterByPageNumber } from './metadata';
import { getChapterSlokas, getSlokaById } from './sloka-loader';

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
 * Guaranteed to have authentic Sanskrit slokas and no placeholder strings.
 */
export function getChapter(skandamNumber: number, chapterNumber: number): Chapter | null {
  const skandamChapters = ALL_CHAPTERS_META[skandamNumber];
  if (!skandamChapters) return null;

  const meta = skandamChapters.find((c) => c.chapter === chapterNumber);
  if (!meta) return null;

  // Load canonical slokas for this specific chapter on-demand
  const slokas: Sloka[] = getChapterSlokas(skandamNumber, chapterNumber);

  // Map to sections format for full backward-compatibility with existing audio, bookmark, and notes systems
  const sections: Section[] = slokas.map((s) => ({
    id: s.id,
    number: s.sloka,
    meaning: s.malayalamMeaning || '',
    sanskrit: s.sanskrit,
    speaker: s.speaker,
    page: meta.pageRange,
    notes: s.notes,
  }));

  return {
    skandam: meta.skandam,
    chapter: meta.chapter,
    title: meta.title,
    pageRange: meta.pageRange,
    totalVerses: meta.totalVerses || slokas.length,
    sections,
    slokas,
  };
}

/**
 * Multi-faceted search across authentic Bhagavatam corpus.
 * Searches by sloka number, Sanskrit text, Malayalam meaning, Skandha, and Chapter.
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

  // Check if searching by sloka number (e.g. "12", "1-1-1", "1.1.1", or "skandha-01-chapter-01-sloka-001")
  const numMatch = query.match(/^(\d+)$/);
  const targetSlokaNum = numMatch ? parseInt(numMatch[1], 10) : null;

  const idMatch = query.match(/^(?:skandha-)?(\d+)[\.-](\d+)[\.-](\d+)$/i);
  const targetedTriple = idMatch
    ? {
        s: parseInt(idMatch[1], 10),
        c: parseInt(idMatch[2], 10),
        v: parseInt(idMatch[3], 10),
      }
    : null;

  // Determine skandams to search
  const targetSkandams = filterSkandam
    ? SKANDAMS_META.filter((s) => s.number === filterSkandam)
    : SKANDAMS_META;

  for (const skandam of targetSkandams) {
    const chapters = ALL_CHAPTERS_META[skandam.number] || [];
    const targetChapters = filterChapter
      ? chapters.filter((c) => c.chapter === filterChapter)
      : chapters;

    for (const chMeta of targetChapters) {
      if (targetedTriple && (skandam.number !== targetedTriple.s || chMeta.chapter !== targetedTriple.c)) {
        continue;
      }

      const slokas = getChapterSlokas(skandam.number, chMeta.chapter);

      for (const sl of slokas) {
        // 1. Match by exact targeted triple ID
        if (targetedTriple && sl.sloka === targetedTriple.v) {
          results.push({
            skandam: skandam.number,
            skandamName: skandam.name,
            chapter: chMeta.chapter,
            chapterTitle: chMeta.title,
            sectionNumber: sl.sloka,
            sectionId: sl.id,
            meaning: sl.malayalamMeaning,
            sanskrit: sl.sanskrit,
            pageRange: chMeta.pageRange,
            matchIndex: 0,
            matchField: 'sloka',
          });
          continue;
        }

        // 2. Match by exact sloka number if skandam/chapter filter is active
        if (targetSlokaNum !== null && (filterSkandam || filterChapter) && sl.sloka === targetSlokaNum) {
          results.push({
            skandam: skandam.number,
            skandamName: skandam.name,
            chapter: chMeta.chapter,
            chapterTitle: chMeta.title,
            sectionNumber: sl.sloka,
            sectionId: sl.id,
            meaning: sl.malayalamMeaning,
            sanskrit: sl.sanskrit,
            pageRange: chMeta.pageRange,
            matchIndex: 0,
            matchField: 'sloka',
          });
          continue;
        }

        // 3. Search in Sanskrit text
        if (query.length >= 2) {
          const sanskritIndex = sl.sanskrit.indexOf(query);
          if (sanskritIndex !== -1) {
            results.push({
              skandam: skandam.number,
              skandamName: skandam.name,
              chapter: chMeta.chapter,
              chapterTitle: chMeta.title,
              sectionNumber: sl.sloka,
              sectionId: sl.id,
              meaning: sl.malayalamMeaning,
              sanskrit: sl.sanskrit,
              pageRange: chMeta.pageRange,
              matchIndex: sanskritIndex,
              matchField: 'sanskrit',
            });
            if (results.length >= 100) return results; // Cap results for fast rendering
            continue;
          }

          // 4. Search in Malayalam meaning
          if (sl.malayalamMeaning) {
            const malayalamIndex = sl.malayalamMeaning.toLowerCase().indexOf(lowerQuery);
            if (malayalamIndex !== -1) {
              results.push({
                skandam: skandam.number,
                skandamName: skandam.name,
                chapter: chMeta.chapter,
                chapterTitle: chMeta.title,
                sectionNumber: sl.sloka,
                sectionId: sl.id,
                meaning: sl.malayalamMeaning,
                sanskrit: sl.sanskrit,
                pageRange: chMeta.pageRange,
                matchIndex: malayalamIndex,
                matchField: 'meaning',
              });
              if (results.length >= 100) return results;
            }
          }
        }
      }
    }
  }

  return results;
}
