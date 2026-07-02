import fs from 'fs';
import path from 'path';

// We import the arrays directly using tsx
import { clips as infi1mClips } from '../src/data/clips_infi1m';
import { clips as infi2mClips } from '../src/data/clips_infi2m';

async function fetchVideoTitle(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.title;
  } catch (err) {
    console.error(`Failed to fetch title for ${videoId}:`, err);
    return "";
  }
}

async function processClips(clips: any[], filename: string) {
  console.log(`Processing ${filename}...`);
  const uniqueVideoIds = [...new Set(clips.map(c => c.videoId))];
  const titleMap: Record<string, string> = {};

  for (const vid of uniqueVideoIds) {
    console.log(`Fetching title for ${vid}...`);
    const title = await fetchVideoTitle(vid as string);
    if (title) {
      titleMap[vid as string] = title;
    }
  }

  for (const clip of clips) {
    if (titleMap[clip.videoId]) {
      clip.videoTitle = titleMap[clip.videoId];
    }
  }

  const filePath = path.join(process.cwd(), 'src', 'data', filename);
  const fileContent = `import type { Clip } from '../types';

export const clips: Clip[] = ${JSON.stringify(clips, null, 2)};
`;
  fs.writeFileSync(filePath, fileContent);
  console.log(`Updated ${filename} with video titles.`);
}

async function run() {
  await processClips(infi1mClips, 'clips_infi1m.ts');
  await processClips(infi2mClips, 'clips_infi2m.ts');
  console.log('Done!');
}

run();
