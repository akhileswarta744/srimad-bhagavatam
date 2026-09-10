import fs from 'fs';
import path from 'path';

const summary = JSON.parse(fs.readFileSync('src/data/slokas/summary.json', 'utf8'));
let metaContent = fs.readFileSync('src/data/metadata.ts', 'utf8');

// 1. Update SKANDAMS_META totalVerses
for (let s = 1; s <= 12; s++) {
  const total = summary.skandhas[s].totalVerses;
  const regex = new RegExp(`(number:\\s*${s},[\\s\\S]*?chapterCount:\\s*\\d+,)`, 'g');
  metaContent = metaContent.replace(regex, `$1\n    totalVerses: ${total},`);
}

// 2. Update ALL_CHAPTERS_META chapter verse counts
for (let s = 1; s <= 12; s++) {
  const chs = summary.skandhas[s].chapters;
  for (const cStr of Object.keys(chs)) {
    const c = parseInt(cStr, 10);
    const vCount = chs[cStr].verseCount;

    // Replace { skandam: s, chapter: c, title: "...", pageRange: "..." (with or without existing totalVerses)
    const chRegex = new RegExp(`(\\{\\s*skandam:\\s*${s},\\s*chapter:\\s*${c},\\s*title:\\s*\"[^\"]+\",\\s*pageRange:\\s*\"[^\"]+\")(?:,\\s*totalVerses:\\s*\\d+)?`, 'g');
    metaContent = metaContent.replace(chRegex, `$1, totalVerses: ${vCount}`);
  }
}

fs.writeFileSync('src/data/metadata.ts', metaContent, 'utf8');
console.log('metadata.ts successfully updated with canonical verse counts!');
