/* ============================================
   SpeedIndicator — 2x Speed Overlay
   ============================================ */

import './SpeedIndicator.css';

interface SpeedIndicatorProps {
  visible: boolean;
}

export function SpeedIndicator({ visible }: SpeedIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="speed-indicator">
      <div className="speed-indicator__badge">
        <span className="speed-indicator__arrows">▶▶</span>
        <span className="speed-indicator__label">3x</span>
      </div>
    </div>
  );
}
