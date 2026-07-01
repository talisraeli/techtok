import fs from 'fs';

// Helper for deterministic random based on seed
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}
const rand = sfc32(1, 2, 3, 4);

function getRandomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const subjects = [
  { end: 3, topics: ['קבוצות', 'חסמים', 'סופרמום ואינפימום', 'אינדוקציה מתמטית', 'פסוקים לוגיים', 'שדה המספרים הממשיים'] },
  { end: 12, topics: ['סדרות', 'גבול של סדרה', 'סדרות מונוטוניות', 'תת-סדרות', 'משפט בולצאנו-ויירשטראס', 'סדרות קושי', 'גבול עליון ותחתון', 'אריתמטיקה של גבולות', 'כלל הסנדוויץ\''] },
  { end: 18, topics: ['גבולות של פונקציות', 'הגדרת קושי והיינה', 'גבולות חד-צדדיים', 'גבולות באינסוף', 'אסימפטוטות', 'שלילת גבול', 'פונקציות טריגונומטריות וגבולות'] },
  { end: 24, topics: ['רציפות', 'רציפות נקודתית', 'משפט ערך הביניים', 'משפט ויירשטראס הראשון והשני', 'רציפות במידה שווה (במ"ש)', 'משפט קנטור', 'נקודות אי-רציפות ממינים שונים'] },
  { end: 34, topics: ['נגזרות', 'הגדרת הנגזרת', 'גזירות ורציפות', 'כללי גזירה', 'נגזרת של פונקציה מורכבת', 'כלל השרשרת', 'נגזרת הפונקציה ההפוכה', 'משיק לנורמל'] },
  { end: 42, topics: ['משפטי הערך הממוצע', 'משפט פרמה', 'משפט רול', 'משפט לגראנז\'', 'משפט קושי', 'חקירת פונקציות', 'תחומי עלייה וירידה', 'נקודות קיצון', 'קמירות וקעירות', 'נקודות פיתול'] },
  { end: 47, topics: ['כלל לופיטל', 'צורות לא מוגדרות', 'שימושי כלל לופיטל', 'גבולות מיוחדים עם לופיטל', 'הוכחות הקשורות ללופיטל'] },
  { end: 53, topics: ['פולינום טיילור', 'נוסחת טיילור', 'שארית פיאנו', 'שארית לגראנז\'', 'קירובים בעזרת טיילור', 'טורי מקלורן', 'פיתוח פונקציות אלמנטריות'] },
  { end: 60, topics: ['חזרה למבחן', 'פתרון מבחנים', 'תרגילים מסכמים', 'הוכחות מורכבות', 'שאלות תיאורטיות', 'תרגילי אתגר'] }
];

const actions = [
  'הגדרת', 'הוכחת משפט', 'דוגמאות ל-', 'תרגול:', 'מקרים מיוחדים של', 'הסבר אינטואיטיבי על',
  'הרחבה בנושא', 'תרגיל כיתה:', 'שאלות ותשובות בנושא', 'שימושים של'
];

const descriptions = [
  'הסבר מעמיק הכולל את ההגדרות הפורמליות והאינטואיציה מאחוריהן.',
  'הוכחה מלאה של המשפט המרכזי עם דוגמה להמחשה.',
  'פתרון תרגיל מורכב המשלב מספר טכניקות שנלמדו.',
  'דיון במקרי קצה וטעויות נפוצות בנושא זה.',
  'הצגת ההגדרות בעזרת אפסילון ודלתא ופתרון שאלות הבנה.',
  'מעבר על משפטי העזר שמובילים לתוצאה המרכזית של ההרצאה.',
  'הסבר גיאומטרי ואלגברי של התופעה הנלמדת.',
  'תרגול חישובי מקיף לקראת המבחן.',
  'הצגת גישה אלטרנטיבית לפתרון הבעיה.',
  'סיכום הנקודות החשובות וטיפים לזכירת הנוסחאות.'
];

// 1. Read existing infi1m clips to group by videoId and find true durations
const oldInfi1m = fs.readFileSync('src/data/clips_infi1m.ts', 'utf8');
const match1m = oldInfi1m.match(/export const clips: Clip\[\] = (\[.*\]);/s);
const rawClips = JSON.parse(match1m[1]);

// Group by videoId
const videos = {};
rawClips.forEach(c => {
  if (!videos[c.videoId]) {
    videos[c.videoId] = {
      videoId: c.videoId,
      lectureNumber: c.lectureNumber,
      courseId: c.courseId,
      duration: c.endSeconds // This will eventually be the max endSeconds for the video
    };
  }
  if (c.endSeconds > videos[c.videoId].duration) {
    videos[c.videoId].duration = c.endSeconds;
  }
});

// 2. Generate organic splits and unique titles
const newClips = [];
let globalClipIndex = 1;

Object.values(videos).forEach((video, vIndex) => {
  const duration = video.duration;
  let currentStart = 0;
  let part = 1;
  const parts = [];
  
  // Create variable sized chunks between 5 and 15 minutes
  while (currentStart < duration) {
    let chunkSize = getRandomInt(300, 900); // 5 to 15 mins
    let endSeconds = currentStart + chunkSize;
    
    // If the remaining time is less than 5 minutes, just merge it into this chunk
    if (duration - endSeconds < 300) {
      endSeconds = duration;
    }
    
    parts.push({
      startSeconds: currentStart,
      endSeconds: endSeconds
    });
    
    currentStart = endSeconds - 5; // 5 seconds overlap
    if (endSeconds >= duration) break;
  }
  
  const subjectObj = subjects.find(s => video.lectureNumber <= s.end) || subjects[subjects.length - 1];
  
  parts.forEach((p, i) => {
    const topic = getRandomItem(subjectObj.topics);
    const action = getRandomItem(actions);
    const desc = getRandomItem(descriptions);
    
    newClips.push({
      courseId: video.courseId,
      id: `clip-${video.courseId}-${globalClipIndex}`,
      videoId: video.videoId,
      title: `${action} ${topic}`,
      part: i + 1,
      totalParts: parts.length,
      startSeconds: p.startSeconds,
      endSeconds: p.endSeconds,
      lectureName: `הרצאה ${video.lectureNumber}`,
      lectureNumber: video.lectureNumber,
      description: desc
    });
    globalClipIndex++;
  });
});

fs.writeFileSync('src/data/clips_infi1m.ts', `import type { Clip } from '../types';\n\nexport const clips: Clip[] = ${JSON.stringify(newClips, null, 2)};\n`);
console.log(`Successfully generated ${newClips.length} organic clips for Infi 1M.`);
