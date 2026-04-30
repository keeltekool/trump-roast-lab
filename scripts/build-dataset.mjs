import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const SHEET_ID = "1R_-0DjkNCOdsOtXIbdZxgMez5nFBDG4ucW01eGLyO6U";
const BATCH_SIZE = 500;
const COLUMNS = "A:AE";

function readRange(range) {
  const cmd = `gws sheets +read --spreadsheet ${SHEET_ID} --range "'Roast Posts'!${range}"`;
  const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  return JSON.parse(raw);
}

async function main() {
  console.log("Reading roast posts via gws...");

  const allRows = [];
  let startRow = 2;
  let batch = 0;

  while (true) {
    const endRow = startRow + BATCH_SIZE - 1;
    const range = `A${startRow}:AE${endRow}`;
    console.log(`  Batch ${++batch}: rows ${startRow}-${endRow}...`);

    const result = readRange(range);
    const rows = result.values || [];

    if (rows.length === 0) break;
    allRows.push(...rows);

    if (rows.length < BATCH_SIZE) break;
    startRow += BATCH_SIZE;
  }

  console.log(`Fetched ${allRows.length} total rows.`);

  // Column indices (from header: id=0, date=1, platform=3, text=6, target=26, nickname=27, insult_type=28, rhetorical_moves=29, intensity=30)
  const posts = allRows
    .map((row) => ({
      id: row[0] || "",
      date: row[1] || "",
      text: row[6] || "",
      platform: row[3] || "",
      target: row[26] || "",
      nickname: row[27] || "",
      insult_type: row[28] || "",
      rhetorical_moves: row[29] || "",
      intensity: parseInt(row[30] || "3", 10),
    }))
    .filter((p) => p.text && p.text.trim().length > 20);

  const outPath = path.join(process.cwd(), "src", "data", "roast-posts.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(posts));

  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`Wrote ${posts.length} posts to ${outPath} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
