import fs from 'fs';
import path from 'path';

const outBaseDir = path.join('src', 'data', 'slokas');
const searchIndex = [];

for (let s = 1; s <= 12; s++) {
  const sStr = String(s).padStart(2, '0');
  const skDir = path.join(outBaseDir, `skandha-${sStr}`);
  if (!fs.existsSync(skDir)) continue;

  const files = fs.readdirSync(skDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(skDir, file);
    const slokas = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const sl of slokas) {
      // Index if it has Malayalam meaning OR for Sanskrit search
      // To keep search-index compact, store: [skandha, chapter, sloka, sanskrit, malayalam]
      searchIndex.push({
        id: sl.id,
        s: sl.skandha,
        c: sl.chapter,
        v: sl.sloka,
        sk: sl.sanskrit,
        ml: sl.malayalamMeaning || '',
      });
    }
  }
}

const outPath = path.join('src', 'data', 'search-index.json');
fs.writeFileSync(outPath, JSON.stringify(searchIndex), 'utf8');
console.log(`Generated search-index.json with ${searchIndex.length} verses. File size: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);
