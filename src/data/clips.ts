import type { Clip } from '../types';
import { clips as infi1mClipsData } from './clips_infi1m';
import { clips as infi2mClipsData } from './clips_infi2m';

export const clips: Clip[] = [
  ...infi1mClipsData,
  ...infi2mClipsData
];
