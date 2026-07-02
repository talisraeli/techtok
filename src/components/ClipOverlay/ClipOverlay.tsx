/* ============================================
   ClipOverlay — Title, Badge, Play/Pause Icon
   ============================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Clip } from '../../types';
import { courses } from '../../data/courses';
import './ClipOverlay.css';

interface ClipOverlayProps {
  clip: Clip;
  isPaused: boolean;
  /** Tap event just happened — triggers icon animation */
  showPauseIcon: boolean;
}

export function ClipOverlay({ clip, isPaused, showPauseIcon }: ClipOverlayProps) {
  const [iconVisible, setIconVisible] = useState(false);
  const navigate = useNavigate();
  const course = courses.find(c => c.id === clip.courseId);


  useEffect(() => {
    if (showPauseIcon) {
      setIconVisible(true);
      const timer = setTimeout(() => setIconVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showPauseIcon]);

  const partLabel = clip.totalParts > 1
    ? `(${clip.part}/${clip.totalParts})`
    : '';

  return (
    <div className="clip-overlay">
      {/* Top gradient for status bar readability */}
      <div className="clip-overlay__gradient-top" />

      {/* Bottom gradient for text readability */}
      <div className="clip-overlay__gradient-bottom" />

      {/* Bottom-left content */}
      <div className="clip-overlay__content">
        {course && (
          <div
            className="clip-overlay__profile-pic"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/course/${course.id}`);
            }}
          >
            <img src={course.instructorImage} alt={course.instructor} />
          </div>
        )}
        <div className="clip-overlay__lecture-badge">
          <span className="clip-overlay__badge-icon">📚</span>
          <span className="clip-overlay__badge-text">
            {course?.title} · {clip.videoTitle || clip.lectureName}
          </span>
        </div>
        <h1 className="clip-overlay__title">
          {clip.title} {partLabel}
        </h1>
        <p className="clip-overlay__description">{clip.description}</p>
      </div>

      {/* Center play/pause icon animation */}
      {iconVisible && (
        <div className="clip-overlay__icon-container" key={String(showPauseIcon)}>
          <div className="clip-overlay__play-pause-icon">
            {isPaused ? (
              /* Pause icon (two bars) */
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="16" y="12" width="10" height="36" rx="3" fill="white" />
                <rect x="34" y="12" width="10" height="36" rx="3" fill="white" />
              </svg>
            ) : (
              /* Play icon (triangle) */
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path d="M18 10L50 30L18 50V10Z" fill="white" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
