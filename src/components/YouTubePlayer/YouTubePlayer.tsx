/* ============================================
   YouTubePlayer — IFrame Wrapper Component
   ============================================ */

import './YouTubePlayer.css';

interface YouTubePlayerProps {
  /** Unique ID for the player container div */
  playerId: string;
  /** Whether the player is currently active */
  isActive: boolean;
}

/**
 * Renders the container div that the YouTube IFrame API
 * will replace with an <iframe>. The actual player creation
 * is handled by the useYouTubePlayer hook in ClipCard.
 */
export function YouTubePlayer({ playerId, isActive }: YouTubePlayerProps) {
  return (
    <div className={`youtube-player ${isActive ? 'youtube-player--active' : ''}`}>
      <div
        id={playerId}
        className="youtube-player__container"
      />
      {!isActive && (
        <div className="youtube-player__placeholder">
          <div className="youtube-player__loader" />
        </div>
      )}
    </div>
  );
}
