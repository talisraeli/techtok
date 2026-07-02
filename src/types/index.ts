/* ============================================
   TechTok — TypeScript Type Definitions
   ============================================ */

/** A single course */
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorImage: string;
}

/** A single clip segment within a YouTube lecture video */
export interface Clip {
  /** Optional course ID */
  courseId?: string;
  /** Unique identifier for this clip */
  id: string;
  /** YouTube video ID */
  videoId: string;
  /** Hebrew subject/topic title */
  title: string;
  /** Current part number (1-based) */
  part: number;
  /** Total number of parts for this subject */
  totalParts: number;
  /** Start timestamp in seconds within the source video */
  startSeconds: number;
  /** End timestamp in seconds (max startSeconds + 300) */
  endSeconds: number;
  /** Parent lecture display name */
  lectureName: string;
  /** Original title of the full YouTube video */
  videoTitle?: string;
  /** Lecture number in the course sequence */
  lectureNumber: number;
  /** Short description of the topic shown in this clip */
  description: string;
}

/** YouTube IFrame Player state constants */
export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

/** Playback progress information for a clip */
export interface ClipProgress {
  /** 0..1 normalized progress within the clip */
  progress: number;
  /** Elapsed seconds within the clip */
  elapsed: number;
  /** Remaining seconds within the clip */
  remaining: number;
  /** Total clip duration in seconds */
  duration: number;
}

/** YouTube Player instance interface (subset we use) */
export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (config: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  cueVideoById: (config: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

/** Global YT namespace added by YouTube IFrame API */
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          width?: string | number;
          height?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}
