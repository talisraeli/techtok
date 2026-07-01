import fs from 'fs';

// Syllabus topics for Infi 1M to make realistic subjects
const infi1mTopics = [
  { start: 1, end: 3, title: 'הקדמה ומושגי יסוד', desc: 'חזרה על מושגי יסוד, קבוצות, חסמים ואינדוקציה מתמטית.' },
  { start: 4, end: 12, title: 'סדרות', desc: 'הגדרת הגבול של סדרה, אריתמטיקה של גבולות, סדרות מונוטוניות ומשפט בולצאנו-ויירשטראס.' },
  { start: 13, end: 18, title: 'גבולות של פונקציות', desc: 'גבולות של פונקציות, גבולות חד-צדדיים, והגדרת הגבול לפי קושי והיינה.' },
  { start: 19, end: 24, title: 'רציפות', desc: 'רציפות של פונקציות, משפט ערך הביניים, משפט ויירשטראס ורציפות במידה שווה.' },
  { start: 25, end: 34, title: 'נגזרות', desc: 'הגדרת הנגזרת, כללי גזירה, נגזרות של פונקציות הפוכות ופונקציות טריגונומטריות.' },
  { start: 35, end: 42, title: 'משפטי הערך הממוצע', desc: 'משפטי רול, לגראנז׳ וקושי, ושימושיהם לחקירת פונקציות.' },
  { start: 43, end: 47, title: 'כלל לופיטל', desc: 'שימוש בכללי לופיטל לחישוב גבולות של צורות לא מוגדרות.' },
  { start: 48, end: 53, title: 'פולינום טיילור', desc: 'פיתוח טיילור, שארית לגראנז׳ וקירובים של פונקציות.' },
  { start: 54, end: 60, title: 'חזרה וסיכום', desc: 'פתרון מבחנים ושאלות חזרה לקראת המבחן המסכם.' }
];

function getTopicForLecture(lectureNum) {
  return infi1mTopics.find(t => lectureNum >= t.start && lectureNum <= t.end) || infi1mTopics[0];
}

// 1. Read existing infi1m clips
const oldInfi1m = fs.readFileSync('src/data/clips_infi1m.ts', 'utf8');
const match1m = oldInfi1m.match(/export const clips: Clip\[\] = (\[.*\]);/s);
if (!match1m) throw new Error("Could not parse clips_infi1m.ts");
const infi1mData = JSON.parse(match1m[1]);

// Transform infi1m clips to have better titles/descriptions and standardized structure
const standardized1m = infi1mData.map(clip => {
  const topic = getTopicForLecture(clip.lectureNumber);
  
  // Make the title look like a sub-topic
  const subTitles = [
    'הגדרות ומשפטים בסיסיים',
    'הוכחות ותכונות',
    'דוגמאות ותרגילים',
    'מקרים מיוחדים',
    'משפטים מתקדמים',
    'סיכום הנושא'
  ];
  const subTitle = subTitles[(clip.part - 1) % subTitles.length];
  
  return {
    id: clip.id,
    videoId: clip.videoId,
    courseId: 'infi-1m',
    title: `${topic.title} - ${subTitle}`,
    part: clip.part,
    totalParts: clip.totalParts,
    startSeconds: clip.startSeconds,
    endSeconds: clip.endSeconds,
    lectureName: `הרצאה ${clip.lectureNumber}`,
    lectureNumber: clip.lectureNumber,
    description: topic.desc
  };
});

fs.writeFileSync('src/data/clips_infi1m.ts', `import type { Clip } from '../types';\n\nexport const clips: Clip[] = ${JSON.stringify(standardized1m, null, 2)};\n`);
console.log('Successfully updated clips_infi1m.ts with rich subjects and unified format.');

// 2. Read existing infi2m clips
const oldInfi2m = fs.readFileSync('src/data/clips_infi2m.ts', 'utf8');
const match2m = oldInfi2m.match(/export const clips: Omit<Clip, 'courseId'>\[\] = (\[.*\]);/s);
if (!match2m) throw new Error("Could not parse clips_infi2m.ts");
const infi2mData = JSON.parse(match2m[1]);

// Transform infi2m clips to have courseId natively
const standardized2m = infi2mData.map(clip => ({
  ...clip,
  courseId: 'infi-2m'
}));

fs.writeFileSync('src/data/clips_infi2m.ts', `import type { Clip } from '../types';\n\nexport const clips: Clip[] = ${JSON.stringify(standardized2m, null, 2)};\n`);
console.log('Successfully updated clips_infi2m.ts with unified format.');

// 3. Update clips.ts to simply merge them without .map
const newClipsTs = `import type { Clip } from '../types';
import { clips as infi1mClipsData } from './clips_infi1m';
import { clips as infi2mClipsData } from './clips_infi2m';

export const clips: Clip[] = [
  ...infi1mClipsData,
  ...infi2mClipsData
];
`;
fs.writeFileSync('src/data/clips.ts', newClipsTs);
console.log('Successfully updated clips.ts to merge smoothly.');
