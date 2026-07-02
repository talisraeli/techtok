import fs from 'fs';
import path from 'path';
import { Innertube, UniversalCache } from 'youtubei.js';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI } from '@google/genai';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: npx tsx scripts/generate_course_clips.ts <PLAYLIST_ID_OR_URL> <COURSE_ID> <COURSE_TITLE>");
  console.log("Note: Requires GEMINI_API_KEY environment variable to be set.");
  process.exit(1);
}

const [playlistInput, courseId, courseTitle] = args;

// Helper to extract playlist ID from URL if necessary
let playlistId = playlistInput;
if (playlistInput.includes('list=')) {
  const url = new URL(playlistInput);
  playlistId = url.searchParams.get('list') || playlistInput;
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Helper function to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function extract() {
  try {
    console.log(`Fetching playlist: ${playlistId} using youtubei.js...`);
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const playlist = await yt.getPlaylist(playlistId);

    if (!playlist.videos || playlist.videos.length === 0) {
      console.log("No videos found in playlist.");
      return;
    }

    const clips = [];
    let globalClipIndex = 1;

    for (let index = 0; index < playlist.videos.length; index++) {
      const item = playlist.videos[index];
      const videoTitle = (item as any).title?.text || (item as any).title?.toString() || 'Untitled';
      const videoId = (item as any).content_id || (item as any).id || (item as any).videoId;

      console.log(`\n[${index + 1}/${playlist.videos.length}] Processing video: ${videoTitle} (${videoId})`);

      let transcriptText = '';
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcript.map(t => {
          // format offset to HH:MM:SS or MM:SS
          const date = new Date(0);
          date.setSeconds(Math.floor(t.offset / 1000));
          const timeString = date.toISOString().substr(11, 8);
          return `${timeString}: ${t.text}`;
        }).join('\n');
      } catch (err: any) {
        console.warn(`Could not fetch transcript for ${videoId}. Skipping. Error: ${err.message}`);
        continue;
      }

      console.log(`Calling Gemini API to segment transcript...`);

      const prompt = `Split this transcript into logical segments. 
Each segment must cover exactly one mathematical concept (definition, theorem, example, proof, exercise, etc).

IMPORTANT: The title and description MUST be written in Hebrew (the same language as the video).

Return JSON array of objects:
[
  {
    "title": "Concise title for the segment in Hebrew (e.g. הגדרת הגבול)",
    "description": "Short explanation (not more than a few words) of what is covered in this segment in Hebrew",
    "start": 0, // start time in seconds (number)
    "end": 120  // end time in seconds (number)
  },
  ...
]

Return ONLY the raw JSON array. Do not include markdown blocks like \`\`\`json.

Transcript:
${transcriptText}`;

      let segments = [];
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        let text = response.text;
        if (!text) {
          console.error("Empty response from Gemini.");
          continue;
        }
        if (text.startsWith('\`\`\`json')) {
          text = text.replace(/^\`\`\`json\n?/, '').replace(/\`\`\`$/, '');
        }
        segments = JSON.parse(text);
        console.log(`Successfully identified ${segments.length} segments.`);
      } catch (err: any) {
        console.error(`Error generating or parsing Gemini response for ${videoId}:`, err.message);
        continue;
      }

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        clips.push({
          courseId: courseId,
          id: `clip-${courseId}-${globalClipIndex}`,
          videoId: videoId,
          title: segment.title,
          part: i + 1,
          totalParts: segments.length,
          startSeconds: segment.start,
          endSeconds: segment.end,
          lectureName: `הרצאה ${index + 1}`,
          videoTitle: videoTitle,
          lectureNumber: index + 1,
          description: segment.description || `מתוך ${courseTitle}`
        });
        globalClipIndex++;
      }

      // Avoid rate limits
      await sleep(2000);
    }

    if (clips.length === 0) {
      console.log("No clips generated. Exiting.");
      return;
    }

    const safeCourseId = courseId.replace(/-/g, '');
    const fileContent = `/* ============================================
   TechTok — Auto-generated Clip Data
   ============================================
   
   Playlist: ${courseTitle} (${playlistId})
   ============================================ */

import type { Clip } from '../types';

export const clips: Clip[] = ${JSON.stringify(clips, null, 2)};
`;

    const filename = path.join(process.cwd(), 'src', 'data', `clips_${safeCourseId}.ts`);
    fs.writeFileSync(filename, fileContent);
    console.log(`\nSuccessfully extracted ${clips.length} clips to ${filename}`);

    // Update clips.ts
    const clipsTsPath = path.join(process.cwd(), 'src', 'data', 'clips.ts');
    let clipsTsContent = fs.readFileSync(clipsTsPath, 'utf8');

    const importName = `${safeCourseId}ClipsData`;
    const importStatement = `import { clips as ${importName} } from './clips_${safeCourseId}';`;

    if (!clipsTsContent.includes(importStatement)) {
      // Insert import after the last import
      const lines = clipsTsContent.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      lines.splice(lastImportIndex + 1, 0, importStatement);
      clipsTsContent = lines.join('\n');

      // Update the clips array
      if (!clipsTsContent.includes(`...${importName}`)) {
        clipsTsContent = clipsTsContent.replace(
          /export const clips: Clip\[\] = \[\n/,
          `export const clips: Clip[] = [\n  ...${importName},\n`
        );
        fs.writeFileSync(clipsTsPath, clipsTsContent);
        console.log(`Updated clips.ts to include ${courseId}`);
      }
    } else {
      console.log(`clips.ts already imports ${courseId}`);
    }

    // Update courses.ts
    const coursesTsPath = path.join(process.cwd(), 'src', 'data', 'courses.ts');
    let coursesTsContent = fs.readFileSync(coursesTsPath, 'utf8');

    if (!coursesTsContent.includes(`id: '${courseId}'`)) {
      const newCourse = `  {
    id: '${courseId}',
    title: '${courseTitle}',
    description: 'Auto-generated course description.',
    instructor: 'Unknown',
    instructorImage: ''
  }`;

      coursesTsContent = coursesTsContent.replace(
        /export const courses: Course\[\] = \[\n/,
        `export const courses: Course[] = [\n${newCourse},\n`
      );
      fs.writeFileSync(coursesTsPath, coursesTsContent);
      console.log(`Updated courses.ts to include ${courseId}`);
    } else {
      console.log(`Course ${courseId} already exists in courses.ts`);
    }

    console.log("\\nDone!");

  } catch (error) {
    console.error("Error extracting playlist:", error);
  }
}

extract();
