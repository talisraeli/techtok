/* ============================================
   ClipCard — Full-Screen Clip View
   ============================================ */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Clip } from '../../types';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { useLongPress } from '../../hooks/useLongPress';
import { useClipProgress } from '../../hooks/useClipProgress';
import { useWatchHistory } from '../../hooks/useWatchHistory';
import { YouTubePlayer } from '../YouTubePlayer/YouTubePlayer';
import { ClipOverlay } from '../ClipOverlay/ClipOverlay';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { SpeedIndicator } from '../SpeedIndicator/SpeedIndicator';
import './ClipCard.css';

interface ClipCardProps {
  clip: Clip;
  index: number;
  isActive: boolean;
  onClipEnd: () => void;
  onDoubleTap?: (x: number, y: number) => void;
}

export function ClipCard({ clip, index, isActive, onClipEnd, onDoubleTap }: ClipCardProps) {
  const [isPaused, setIsPaused] = useState(true);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [isSpeedUp, setIsSpeedUp] = useState(false);
  const [tapKey, setTapKey] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerId = `yt-player-${index}`;

  const { clipProgress, updateProgress, resetProgress } = useClipProgress(
    clip.startSeconds,
    clip.endSeconds
  );

  const { saveProgress } = useWatchHistory();
  const lastSaveRef = useRef(0);

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      updateProgress(currentTime);
      const now = Date.now();
      if (now - lastSaveRef.current > 3000) {
        const progress = Math.max(0, Math.min(1, (currentTime - clip.startSeconds) / (clip.endSeconds - clip.startSeconds)));
        saveProgress(clip.id, progress);
        lastSaveRef.current = now;
      }
    },
    [updateProgress, clip.id, clip.startSeconds, clip.endSeconds, saveProgress]
  );

  const handleClipEnd = useCallback(() => {
    setIsPaused(true);
    resetProgress();
    saveProgress(clip.id, 1);
    onClipEnd();
  }, [onClipEnd, resetProgress, saveProgress, clip.id]);

  const handleStateChange = useCallback((state: number) => {
    // YT.PlayerState: PLAYING=1, PAUSED=2
    if (state === 1) {
      setIsPaused(false);
      setPlaybackRate(isSpeedUp ? 3 : 1.5);
    } else if (state === 2) {
      setIsPaused(true);
    }
  }, [isSpeedUp]);

  const handleReady = useCallback(() => {
    setIsPlayerReady(true);
  }, []);

  const { play, pause, seekTo, setPlaybackRate } = useYouTubePlayer({
    containerId: playerId,
    videoId: clip.videoId,
    startSeconds: clip.startSeconds,
    endSeconds: clip.endSeconds,
    isActive,
    onReady: handleReady,
    onTimeUpdate: handleTimeUpdate,
    onClipEnd: handleClipEnd,
    onStateChange: handleStateChange,
  });

  /** Auto-play when clip becomes active and player is ready */
  useEffect(() => {
    if (isActive && isPlayerReady) {
      play();
      setPlaybackRate(1.5);
    }
    if (!isActive) {
      pause();
      setIsPlayerReady(false);
    }
  }, [isActive, isPlayerReady, play, pause, setPlaybackRate]);

  /** Handle tap — toggle play/pause */
  const handleTap = useCallback(() => {
    if (isPaused) {
      play();
    } else {
      pause();
    }
    setTapKey((k) => k + 1);
    setShowPauseIcon(true);
    // Reset the icon trigger after animation
    setTimeout(() => setShowPauseIcon(false), 700);
  }, [isPaused, play, pause]);

  /** Handle long-press start — 3x speed */
  const handleLongPressStart = useCallback(() => {
    setIsSpeedUp(true);
    setPlaybackRate(3);
  }, [setPlaybackRate]);

  /** Handle long-press end — back to 1.5x */
  const handleLongPressEnd = useCallback(() => {
    setIsSpeedUp(false);
    setPlaybackRate(1.5);
  }, [setPlaybackRate]);

  const longPressHandlers = useLongPress({
    onLongPressStart: handleLongPressStart,
    onLongPressEnd: handleLongPressEnd,
    onTap: handleTap,
    onDoubleTap: onDoubleTap,
    delay: 500,
    moveThreshold: 15,
    doubleTapDelay: 300,
  });

  /** Handle seek from progress bar */
  const handleSeek = useCallback(
    (progress: number) => {
      const targetTime =
        clip.startSeconds + progress * (clip.endSeconds - clip.startSeconds);
      seekTo(targetTime);
      updateProgress(targetTime);
    },
    [clip.startSeconds, clip.endSeconds, seekTo, updateProgress]
  );

  return (
    <div className="clip-card" data-clip-id={clip.id}>
      {/* YouTube Player */}
      <YouTubePlayer playerId={playerId} isActive={isActive} />

      {/* Touch interaction zone */}
      <div
        className="clip-card__touch-zone"
        {...longPressHandlers}
      />

      {/* Overlay: title, badges, play/pause icon */}
      <ClipOverlay
        clip={clip}
        isPaused={isPaused}
        showPauseIcon={showPauseIcon}
        key={`overlay-${tapKey}`}
      />

      {/* Speed indicator */}
      <SpeedIndicator visible={isSpeedUp} />

      {/* Progress bar */}
      <ProgressBar clipProgress={clipProgress} onSeek={handleSeek} />
    </div>
  );
}
