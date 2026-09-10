import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Map: "skandha-chapter-sloka" => meaning string
const malayalamMap = new Map();

function parseSectionsFromTs(filePath, defaultSkandam = null, defaultChapter = null) {
  if (!fs.existsSync(filePath)) return;
  const code = fs.readFileSync(filePath, 'utf8');

  // Match each section block { id: ..., number: ..., meaning: ... }
  const blockMatches = code.match(/\{\s*(?:id|number|meaning|page|notes)[\s\S]*?\}/g) || [];
  for (const block of blockMatches) {
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
    const numMatch = block.match(/number:\s*(\d+)/);
    const meaningMatch = block.match(/meaning:\s*['"]([\s\S]*?)['"](?=\s*[,}\n])/);

    if (numMatch && meaningMatch) {
      const verseNum = parseInt(numMatch[1], 10);
      const meaning = meaningMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'").trim();

      // Skip any placeholder
      if (meaning.includes('മാറ്റിവെച്ചിരിക്കുന്നു')) continue;

      let s = defaultSkandam;
      let c = defaultChapter;
      let v = verseNum;

      if (idMatch) {
        const parts = idMatch[1].split('-');
        if (parts.length === 3) {
          s = parseInt(parts[0], 10);
          c = parseInt(parts[1], 10);
          v = parseInt(parts[2], 10);
        }
      }

      if (s && c && v) {
        malayalamMap.set(`${s}-${c}-${v}`, meaning);
      }
    }
  }
}

console.log('Ingesting authentic Malayalam translations...');
parseSectionsFromTs('src/data/skandams/skandam-1/chapter-1.ts', 1, 1);
parseSectionsFromTs('src/data/skandams/skandam-1/chapter-2.ts', 1, 2);
parseSectionsFromTs('src/data/skandams/skandam-1/chapters-3-to-10.ts', 1);
parseSectionsFromTs('src/data/skandams/skandam-1/chapters-11-to-19.ts', 1);
parseSectionsFromTs('src/data/skandams/skandam-2/chapters-1-to-3.ts', 2);
parseSectionsFromTs('src/data/skandams/skandam-2/chapter-9.ts', 2, 9);
parseSectionsFromTs('src/data/skandams/skandam-3/chapter-13.ts', 3, 13);
parseSectionsFromTs('src/data/skandams/skandam-4/chapter-8.ts', 4, 8);
parseSectionsFromTs('src/data/skandams/skandam-5/chapter-5.ts', 5, 5);
parseSectionsFromTs('src/data/skandams/skandam-6/chapter-1.ts', 6, 1);
parseSectionsFromTs('src/data/skandams/skandam-6/chapters-2-to-3.ts', 6);

console.log(`Loaded ${malayalamMap.size} authentic Malayalam verse meanings from authored files.`);

const inputPath = path.join('scripts', 'bhagavata_purana_flat.jsonl');
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(inputPath),
  crlfDelay: Infinity,
});

const chapterSlokasMap = new Map();
let totalVersesParsed = 0;

rl.on('line', (line) => {
  if (!line.trim()) return;
  const obj = JSON.parse(line);
  if (obj.part !== 'purana') return; // Skip Mahatmya (part !== 'purana')

  const s = obj.skandha;
  const c = obj.adhyaya;
  const v = obj.sloka;
  // Handle vachana_only verses (e.g. 4.21.45 Maitreya uvacha)
  const sanskritText = (obj.devanagari || obj.vachana_devanagari || '').trim();
  const speaker = obj.devanagari ? (obj.vachana_devanagari || '').trim() || undefined : undefined;

  const key = `${s}-${c}`;
  if (!chapterSlokasMap.has(key)) {
    chapterSlokasMap.set(key, []);
  }

  const sStr = String(s).padStart(2, '0');
  const cStr = String(c).padStart(2, '0');
  const vStr = String(v).padStart(3, '0');
  const slokaId = `skandha-${sStr}-chapter-${cStr}-sloka-${vStr}`;

  const authoredMeaning = malayalamMap.get(`${s}-${c}-${v}`) || '';

  chapterSlokasMap.get(key).push({
    id: slokaId,
    skandha: s,
    chapter: c,
    sloka: v,
    sanskrit: sanskritText,
    malayalamMeaning: authoredMeaning,
    source: 'Sanskrit Documents / Gitapress',
    speaker,
  });

  totalVersesParsed++;
});

rl.on('close', () => {
  console.log(`Parsed ${totalVersesParsed} total verses across ${chapterSlokasMap.size} chapters.`);

  const outBaseDir = path.join('src', 'data', 'slokas');
  if (!fs.existsSync(outBaseDir)) {
    fs.mkdirSync(outBaseDir, { recursive: true });
  }

  const summary = {
    totalChapters: chapterSlokasMap.size,
    totalSlokas: totalVersesParsed,
    skandhas: {},
  };

  for (let s = 1; s <= 12; s++) {
    const sStr = String(s).padStart(2, '0');
    const skandhaDir = path.join(outBaseDir, `skandha-${sStr}`);
    if (!fs.existsSync(skandhaDir)) {
      fs.mkdirSync(skandhaDir, { recursive: true });
    }

    summary.skandhas[s] = {
      chapters: {},
      totalVerses: 0,
      totalMalayalamAuthored: 0,
    };
  }

  for (const [key, slokas] of chapterSlokasMap.entries()) {
    const [s, c] = key.split('-').map(Number);
    const sStr = String(s).padStart(2, '0');
    const cStr = String(c).padStart(2, '0');
    const chapterFilePath = path.join(outBaseDir, `skandha-${sStr}`, `chapter-${cStr}.json`);

    // Sort strictly by sloka number
    slokas.sort((a, b) => a.sloka - b.sloka);

    fs.writeFileSync(chapterFilePath, JSON.stringify(slokas, null, 2), 'utf8');

    const malayalamCount = slokas.filter((sl) => sl.malayalamMeaning.length > 0).length;
    summary.skandhas[s].chapters[c] = {
      verseCount: slokas.length,
      malayalamVerseCount: malayalamCount,
    };
    summary.skandhas[s].totalVerses += slokas.length;
    summary.skandhas[s].totalMalayalamAuthored += malayalamCount;
  }

  fs.writeFileSync(path.join(outBaseDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log('Complete! All modular chapter files and summary.json generated successfully.');
});
