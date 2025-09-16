// backend/scripts/sanitize_images_safe.cjs
// 실행: node backend/scripts/sanitize_images_safe.cjs in.csv out.csv

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

(async () => {
  const [,, inPath, outPath] = process.argv;
  if (!inPath || !outPath) {
    console.error('Usage: node scripts/sanitize_images_safe.cjs input.csv output.csv');
    process.exit(1);
  }

  const input = await fs.promises.readFile(inPath, 'utf8');

  // CSV → JS 객체 배열
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
  });

  // 각 행 가공
  for (const row of records) {
    // images 필드 변환
    if (row.images) {
      row.images = row.images.replace(
        /https:\/\/maps\.googleapis\.com\/maps\/api\/place\/photo\?[^"]*?photo_reference=([^"&]+)[^"}]*/g,
        (_, ref) => `/api/photo?ref=${ref}`
      );
    }
  }

  // 다시 CSV로 직렬화 (자동 escaping)
  const output = stringify(records, {
    header: true,
  });

  await fs.promises.writeFile(outPath, output, 'utf8');
  console.log(`✅ Clean CSV saved: ${outPath}`);
})();