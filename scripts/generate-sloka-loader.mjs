import fs from 'fs';
import path from 'path';

const summary = JSON.parse(fs.readFileSync('src/data/slokas/summary.json', 'utf8'));

let code = `// Auto-generated chapter sloka loader
import { Sloka } from './types';

// Chapter loader registry
const CHAPTER_LOADERS: Record<string, () => Sloka[]> = {
`;

for (let s = 1; s <= 12; s++) {
  const sStr = String(s).padStart(2, '0');
  const chs = summary.skandhas[s].chapters;
  for (const cStr of Object.keys(chs)) {
    const c = parseInt(cStr, 10);
    const cFormatted = String(c).padStart(2, '0');
    code += `  "${s}-${c}": () => require('./slokas/skandha-${sStr}/chapter-${cFormatted}.json'),\n`;
  }
}

code += `};

const chapterCache = new Map<string, Sloka[]>();

/**
 * Loads authentic slokas for a specific Skandha and Chapter on-demand.
 * Does NOT load all 14,089 slokas at once.
 */
export function getChapterSlokas(skandha: number, chapter: number): Sloka[] {
  const key = \`\${skandha}-\${chapter}\`;
  if (chapterCache.has(key)) {
    return chapterCache.get(key)!;
  }

  const loader = CHAPTER_LOADERS[key];
  if (!loader) {
    return [];
  }

  try {
    const data = loader();
    chapterCache.set(key, data);
    return data;
  } catch (err) {
    console.error(\`Failed to load slokas for Skandha \${skandha}, Chapter \${chapter}\`, err);
    return [];
  }
}

/**
 * Helper to get a specific sloka by stable ID.
 */
export function getSlokaById(slokaId: string): Sloka | null {
  const match = slokaId.match(/^skandha-(\\d+)-chapter-(\\d+)-sloka-(\\d+)$/);
  if (!match) return null;
  const skandha = parseInt(match[1], 10);
  const chapter = parseInt(match[2], 10);
  const slokaNum = parseInt(match[3], 10);

  const slokas = getChapterSlokas(skandha, chapter);
  return slokas.find((s) => s.sloka === slokaNum) || null;
}
`;

fs.writeFileSync('src/data/sloka-loader.ts', code, 'utf8');
console.log('src/data/sloka-loader.ts successfully generated with all 335 chapter loaders!');
