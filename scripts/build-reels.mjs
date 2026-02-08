/**
 * Build a reels manifest from `assets/videos/*.mp4` -> `assets/data/reels.json`.
 *
 * Run:
 *   node scripts/build-reels.mjs
 */

import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const VIDEOS_DIR = resolve(repoRoot, 'assets/videos');
const OUT_PATH = resolve(repoRoot, 'assets/data/reels.json');

function stripExt(name) {
  return name.replace(/\.[^.]+$/, '');
}

async function main() {
  const entries = await readdir(VIDEOS_DIR);
  const mp4s = entries.filter((f) => f.toLowerCase().endsWith('.mp4'));

  const withTimes = await Promise.all(
    mp4s.map(async (filename) => {
      const full = resolve(VIDEOS_DIR, filename);
      const s = await stat(full);
      return { filename, mtimeMs: s.mtimeMs };
    })
  );

  // Newest first
  withTimes.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const items = withTimes.map(({ filename }) => ({
    src: `assets/videos/${filename}`,
    caption: stripExt(filename),
    likes: null,
    comments: null
  }));

  await mkdir(resolve(repoRoot, 'assets/data'), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2), 'utf8');

  console.log(`Wrote ${items.length} reels -> assets/data/reels.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

