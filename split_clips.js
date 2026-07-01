import fs from 'fs';

// Read the old clips.ts which contains infi2mClips and the export
const oldClipsTs = fs.readFileSync('src/data/clips.ts', 'utf8');

// Extract the infi2mClips array
const startIndex = oldClipsTs.indexOf('const infi2mClips: Omit<Clip, \'courseId\'>[] = [');
const endIndex = oldClipsTs.indexOf('];\n\nexport const clips: Clip[] =');

if (startIndex !== -1 && endIndex !== -1) {
  let infi2mPart = oldClipsTs.substring(startIndex, endIndex + 2);
  
  // Replace the const definition with export const clips
  infi2mPart = infi2mPart.replace("const infi2mClips: Omit<Clip, 'courseId'>[]", "export const clips: Omit<Clip, 'courseId'>[]");
  
  const infi2mContent = `import type { Clip } from '../types';\n\n` + infi2mPart + `\n`;
  fs.writeFileSync('src/data/clips_infi2m.ts', infi2mContent);
  console.log('Created clips_infi2m.ts');
}

// Rewrite clips.ts to just combine the two
const newClipsTs = `import type { Clip } from '../types';
import { clips as infi1mClipsData } from './clips_infi1m';
import { clips as infi2mClipsData } from './clips_infi2m';

export const clips: Clip[] = [
  ...infi2mClipsData.map(c => ({ ...c, courseId: 'infi-2m' }) as Clip),
  ...infi1mClipsData
];
`;
fs.writeFileSync('src/data/clips.ts', newClipsTs);
console.log('Updated clips.ts');
