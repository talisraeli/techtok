/* ============================================
   useLongPress — Touch/Mouse Hold Detection Hook
   ============================================ */

import { useRef, useCallback } from 'react';

export interface UseLongPressOptions {
  /** Delay in ms before the press is considered "long" */
  delay?: number;
  /** Called when a long press is detected */
  onLongPressStart: () => void;
  /** Called when the long press is released */
  onLongPressEnd: () => void;
  /** Called on a short tap (not a long press or drag) */
  onTap: () => void;
  /** Movement threshold in pixels to cancel the press */
  moveThreshold?: number;
}

export function useLongPress(options: UseLongPressOptions) {
  const {
    delay = 500,
    onLongPressStart,
    onLongPressEnd,
    onTap,
    moveThreshold = 15,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cancelledRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      startPosRef.current = { x: clientX, y: clientY };
      isLongPressRef.current = false;
      cancelledRef.current = false;

      timerRef.current = setTimeout(() => {
        if (!cancelledRef.current) {
          isLongPressRef.current = true;
          onLongPressStart();
        }
      }, delay);
    },
    [delay, onLongPressStart]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const dx = Math.abs(clientX - startPosRef.current.x);
      const dy = Math.abs(clientY - startPosRef.current.y);

      // If finger/mouse moved too much, cancel the press
      if (dx > moveThreshold || dy > moveThreshold) {
        cancelledRef.current = true;
        clearTimer();

        if (isLongPressRef.current) {
          isLongPressRef.current = false;
          onLongPressEnd();
        }
      }
    },
    [moveThreshold, clearTimer, onLongPressEnd]
  );

  const handleEnd = useCallback(() => {
    clearTimer();

    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      onLongPressEnd();
    } else if (!cancelledRef.current) {
      onTap();
    }

    cancelledRef.current = false;
  }, [clearTimer, onLongPressEnd, onTap]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleEnd,
    onTouchCancel: handleEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };
}

