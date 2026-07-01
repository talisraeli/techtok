/* ============================================
   TechTok — Courses Data
   ============================================ */

import type { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'infi-1m',
    title: 'אינפי 1מ׳',
    description: 'סדרות, גבולות של פונקציות, רציפות, נגזרות, משפטי ערך ממוצע, כלל לופיטל, ופולינום טיילור.',
    instructor: 'אביב צנזור',
    instructorImage: 'https://campus.gov.il/wp-content/uploads/2024/03/Aviv-Censor1-837x1024-1.jpg' // Approximate URL for Aviv Tensor
  },
  {
    id: 'infi-2m',
    title: 'אינפי 2מ׳',
    description: 'אינטגרל לא מסוים, שיטות אינטגרציה, אינטגרל מסוים של רימן, אינטגרלים מוכללים, סדרות וטורים של פונקציות, וטורי חזקות.',
    instructor: 'אביב צנזור',
    instructorImage: 'https://campus.gov.il/wp-content/uploads/2024/03/Aviv-Censor1-837x1024-1.jpg'
  }
];
