/* ============================================
   useClipProgress — Clip Playback Progress Hook
   ============================================ */

import { useState, useCallback } from 'react';
import type { ClipProgress } from '../types';

export function useClipProgress(startSeconds: number, endSeconds: number) {
  const duration = endSeconds - startSeconds;

  const [clipProgress, setClipProgress] = useState<ClipProgress>({
    progress: 0,
    elapsed: 0,
    remaining: duration,
    duration,
  });

  /** Call this on each time update from the YouTube player */
  const updateProgress = useCallback(
    (currentTime: number) => {
      const elapsed = Math.max(0, Math.min(currentTime - startSeconds, duration));
      const progress = duration > 0 ? elapsed / duration : 0;
      const remaining = Math.max(0, duration - elapsed);

      setClipProgress({
        progress: Math.min(1, Math.max(0, progress)),
        elapsed,
        remaining,
        duration,
      });
    },
    [startSeconds, duration]
  );

  /** Reset progress to zero */
  const resetProgress = useCallback(() => {
    setClipProgress({
      progress: 0,
      elapsed: 0,
      remaining: duration,
      duration,
    });
  }, [duration]);

  return {
    clipProgress,
    updateProgress,
    resetProgress,
  };
}
