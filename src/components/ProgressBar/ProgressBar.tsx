/* ============================================
   ProgressBar — TikTok-style Thin Timeline
   ============================================ */

import { useRef, useCallback, useState } from 'react';
import type { ClipProgress } from '../../types';
import './ProgressBar.css';

interface ProgressBarProps {
  clipProgress: ClipProgress;
  /** Called when the user seeks to a new position (0..1) */
  onSeek: (progress: number) => void;
}

/** Format seconds as m:ss */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressBar({ clipProgress, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const getProgressFromTouch = useCallback(
    (clientX: number): number => {
      const bar = barRef.current;
      if (!bar) return 0;
      const rect = bar.getBoundingClientRect();
      const progress = (rect.right - clientX) / rect.width;
      return Math.min(1, Math.max(0, progress));
    },
    []
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      const progress = getProgressFromTouch(e.touches[0].clientX);
      setIsDragging(true);
      setDragProgress(progress);
    },
    [getProgressFromTouch]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const progress = getProgressFromTouch(e.touches[0].clientX);
      setDragProgress(progress);
    },
    [isDragging, getProgressFromTouch]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      if (isDragging) {
        onSeek(dragProgress);
        setIsDragging(false);
      }
    },
    [isDragging, dragProgress, onSeek]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const progress = getProgressFromTouch(e.clientX);
      onSeek(progress);
    },
    [getProgressFromTouch, onSeek]
  );

  const displayProgress = isDragging ? dragProgress : clipProgress.progress;
  const displayElapsed = isDragging
    ? dragProgress * clipProgress.duration
    : clipProgress.elapsed;

  return (
    <div className={`progress-bar ${isDragging ? 'progress-bar--dragging' : ''}`}>
      {/* Time labels — visible on drag */}
      {isDragging && (
        <div className="progress-bar__time-labels">
          <span className="progress-bar__time">{formatTime(displayElapsed)}</span>
          <span className="progress-bar__time">{formatTime(clipProgress.duration)}</span>
        </div>
      )}

      {/* Track */}
      <div
        ref={barRef}
        className="progress-bar__track"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleClick}
        role="slider"
        aria-label="זמן בקליפ"
        aria-valuenow={Math.round(displayProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* Filled portion */}
        <div
          className="progress-bar__fill"
          style={{ width: `${displayProgress * 100}%` }}
        />

        {/* Scrubber thumb — visible on drag */}
        {isDragging && (
          <div
            className="progress-bar__thumb"
            style={{ right: `${displayProgress * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
