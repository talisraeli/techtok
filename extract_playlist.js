import fs from 'fs';
import { Innertube, UniversalCache } from 'youtubei.js';

// Usage: 
// 1. npm install youtubei.js
// 2. node extract_playlist.js <PLAYLIST_ID> <COURSE_ID> <COURSE_TITLE>

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node extract_playlist.js <PLAYLIST_ID> <COURSE_ID> <COURSE_TITLE>");
  console.log("Example: node extract_playlist.js PLW3u28VuDAHLBQrejV70zRa6sesxkPmgA infi-1m 'אינפי 1מ׳'");
  process.exit(1);
}

const [playlistId, courseId, courseTitle] = args;

async function extract() {
  try {
    console.log(`Fetching playlist: ${playlistId} using youtubei.js...`);
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const playlist = await yt.getPlaylist(playlistId);
    
    if (!playlist.videos || playlist.videos.length === 0) {
      console.log("No videos found in playlist.");
      return;
    }

    const CHUNK_SIZE = 600;
    const OVERLAP = 5;
    const clips = [];
    let clipIndex = 1;

    playlist.videos.forEach((item, index) => {
      const videoTitle = item.metadata?.title?.text || item.title?.text || item.title?.toString() || 'Untitled';
      const durationSeconds = item.duration?.seconds || 3600;
      const videoId = item.content_id || item.id || item.videoId;

      const totalParts = Math.ceil((durationSeconds - OVERLAP) / (CHUNK_SIZE - OVERLAP)) || 1;

      for (let part = 1; part <= totalParts; part++) {
        let startSeconds = (part - 1) * (CHUNK_SIZE - OVERLAP);
        let endSeconds = startSeconds + CHUNK_SIZE;
        if (endSeconds > durationSeconds) {
          endSeconds = durationSeconds;
        }
        
        // If it's a tiny sliver at the end, maybe merge it, but for now just add it
        if (startSeconds >= durationSeconds) break;

        clips.push({
          courseId: courseId,
          id: `clip-${courseId}-${clipIndex}`,
          videoId: videoId,
          title: videoTitle,
          part: part,
          totalParts: totalParts,
          startSeconds: startSeconds,
          endSeconds: endSeconds,
          lectureName: `הרצאה ${index + 1}`,
          lectureNumber: index + 1,
          description: `מתוך ${courseTitle}`
        });
        clipIndex++;
      }
    });

    const fileContent = `/* ============================================
   TechTok — Auto-generated Clip Data
   ============================================
   
   Playlist: ${courseTitle} (${playlistId})
   ============================================ */

import type { Clip } from '../types';

export const clips: Clip[] = ${JSON.stringify(clips, null, 2)};
`;

    const filename = `src/data/clips_${courseId.replace('-', '')}.ts`;
    fs.writeFileSync(filename, fileContent);
    console.log(`Successfully extracted ${clips.length} clips to ${filename}`);
    console.log(`Make sure to import and merge these clips into your main application data!`);

  } catch (error) {
    console.error("Error extracting playlist:", error);
  }
}

extract();
