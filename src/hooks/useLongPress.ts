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
  /** Called on a double tap */
  onDoubleTap?: (x: number, y: number) => void;
  /** Movement threshold in pixels to cancel the press */
  moveThreshold?: number;
  /** Max delay in ms between taps to count as a double tap */
  doubleTapDelay?: number;
}

export function useLongPress(options: UseLongPressOptions) {
  const {
    delay = 500,
    onLongPressStart,
    onLongPressEnd,
    onTap,
    onDoubleTap,
    moveThreshold = 15,
    doubleTapDelay = 300,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cancelledRef = useRef(false);
  const lastTapTimeRef = useRef(0);
  const isTouchRef = useRef(false);

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

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    clearTimer();

    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      onLongPressEnd();
    } else if (!cancelledRef.current) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < doubleTapDelay && onDoubleTap) {
        // Double tap!
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = null;
        }
        onDoubleTap(clientX, clientY);
        lastTapTimeRef.current = 0; // reset
      } else {
        lastTapTimeRef.current = now;
        // Wait to see if it's a double tap before firing single tap
        if (onDoubleTap) {
          singleTapTimerRef.current = setTimeout(() => {
            onTap();
          }, doubleTapDelay);
        } else {
          onTap();
        }
      }
    }

    cancelledRef.current = false;
  }, [clearTimer, onLongPressEnd, onTap, onDoubleTap, doubleTapDelay]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isTouchRef.current = true;
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

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    },
    [handleEnd]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchRef.current) return;
      if (e.button !== 0) return; // Only left click
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchRef.current) return;
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseEnd = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchRef.current) return;
      handleEnd(e.clientX, e.clientY);
    },
    [handleEnd]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseEnd,
    onMouseLeave: handleMouseEnd,
  };
}
