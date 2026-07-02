/* ============================================
   useYouTubePlayer — YouTube IFrame API Hook
   ============================================ */

import { useEffect, useRef, useCallback } from 'react';
import type { YTPlayerInstance } from '../types';

/** Tracks whether the YT IFrame API script has been loaded */
let ytApiLoaded = false;
let ytApiLoading = false;
const ytApiReadyCallbacks: (() => void)[] = [];

/** Load the YouTube IFrame API script (once, globally) */
function loadYTApi(): Promise<void> {
  return new Promise((resolve) => {
    if (ytApiLoaded) {
      resolve();
      return;
    }

    ytApiReadyCallbacks.push(resolve);

    if (ytApiLoading) return;
    ytApiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytApiLoading = false;
      ytApiReadyCallbacks.forEach((cb) => cb());
      ytApiReadyCallbacks.length = 0;
    };
  });
}

export interface UseYouTubePlayerOptions {
  /** DOM element ID to mount the player in */
  containerId: string;
  /** YouTube video ID */
  videoId: string;
  /** Start time within the source video */
  startSeconds: number;
  /** End time within the source video */
  endSeconds: number;
  /** Whether the player should be active (loaded and potentially playing) */
  isActive: boolean;
  /** Called when the player is ready */
  onReady?: () => void;
  /** Called on each animation frame with the current time */
  onTimeUpdate?: (currentTime: number) => void;
  /** Called when the clip segment reaches its end */
  onClipEnd?: () => void;
  /** Called when player state changes */
  onStateChange?: (state: number) => void;
}

export function useYouTubePlayer(options: UseYouTubePlayerOptions) {
  const {
    containerId,
    videoId,
    startSeconds,
    endSeconds,
    isActive,
    onReady,
    onTimeUpdate,
    onClipEnd,
    onStateChange,
  } = options;

  const playerRef = useRef<YTPlayerInstance | null>(null);
  const rafRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const isDestroyedRef = useRef(false);

  // Store latest callbacks in refs to avoid recreating the player
  const onReadyRef = useRef(onReady);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onClipEndRef = useRef(onClipEnd);
  const onStateChangeRef = useRef(onStateChange);
  onReadyRef.current = onReady;
  onTimeUpdateRef.current = onTimeUpdate;
  onClipEndRef.current = onClipEnd;
  onStateChangeRef.current = onStateChange;

  const startTimeMonitor = useCallback(() => {
    if (rafRef.current) return;
    const tick = () => {
      if (isDestroyedRef.current) {
        rafRef.current = 0;
        return;
      }
      const player = playerRef.current;
      if (player && isPlayingRef.current) {
        try {
          const currentTime = player.getCurrentTime();
          onTimeUpdateRef.current?.(currentTime);

          // Check if clip has reached its end time
          if (currentTime >= endSeconds - 0.3) {
            player.pauseVideo();
            isPlayingRef.current = false;
            onClipEndRef.current?.();
            rafRef.current = 0;
            return;
          }
        } catch {
          // Player might be in an invalid state
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [endSeconds]);

  const stopTimeMonitor = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /** Initialize the player when active */
  useEffect(() => {
    if (!isActive) return;

    isDestroyedRef.current = false;
    let mounted = true;

    const initPlayer = async () => {
      await loadYTApi();
      if (!mounted || isDestroyedRef.current) return;

      // Check if the container element exists
      const container = document.getElementById(containerId);
      if (!container) return;

      playerRef.current = new window.YT.Player(containerId, {
        width: '100%',
        height: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          cc_load_policy: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          start: Math.floor(startSeconds),
          end: Math.ceil(endSeconds),
        },
        events: {
          onReady: (event: any) => {
            if (isDestroyedRef.current) return;
            try {
              event.target.unloadModule('captions');
              event.target.unloadModule('cc');
            } catch { /* ignore */ }
            onReadyRef.current?.();
          },
          onStateChange: (event: { data: number }) => {
            if (isDestroyedRef.current) return;
            const state = event.data;
            onStateChangeRef.current?.(state);

            // Track playing state for the time monitor
            if (state === 1) {
              // PLAYING
              isPlayingRef.current = true;
              startTimeMonitor();
            } else {
              isPlayingRef.current = false;
              stopTimeMonitor();
            }

            // When the video ends naturally, trigger clip end
            if (state === 0) {
              // ENDED
              onClipEndRef.current?.();
            }
          },
          onError: (event: { data: number }) => {
            console.warn('[TechTok] YouTube player error:', event.data);
          },
        },
      });
    };

    initPlayer();

    return () => {
      mounted = false;
      isDestroyedRef.current = true;
      stopTimeMonitor();
      try {
        playerRef.current?.destroy();
      } catch {
        // Player might already be destroyed
      }
      playerRef.current = null;
    };
  }, [isActive, containerId, videoId, startSeconds, endSeconds, startTimeMonitor, stopTimeMonitor]);

  /** Imperative controls */
  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch { /* ignore */ }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch { /* ignore */ }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(seconds, true);
    } catch { /* ignore */ }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      playerRef.current?.setPlaybackRate(rate);
    } catch { /* ignore */ }
  }, []);

  const getCurrentTime = useCallback((): number => {
    try {
      return playerRef.current?.getCurrentTime() ?? 0;
    } catch {
      return 0;
    }
  }, []);

  const getPlayerState = useCallback((): number => {
    try {
      return playerRef.current?.getPlayerState() ?? -1;
    } catch {
      return -1;
    }
  }, []);

  return {
    play,
    pause,
    seekTo,
    setPlaybackRate,
    getCurrentTime,
    getPlayerState,
    playerRef,
  };
}
