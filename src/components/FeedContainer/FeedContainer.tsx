/* ============================================
   FeedContainer — Vertical Scroll-Snap Manager
   ============================================ */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Clip } from '../../types';
import { ClipCard } from '../ClipCard/ClipCard';
import './FeedContainer.css';

interface FeedContainerProps {
  clips: Clip[];
}

export function FeedContainer({ clips }: FeedContainerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /** Set up IntersectionObserver to detect which clip is in view */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const clipId = (entry.target as HTMLElement).dataset.clipId;
            const index = clips.findIndex((c) => c.id === clipId);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    // Observe all clip cards
    const cards = container.querySelectorAll('.clip-card');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [clips]);

  /** Scroll to next clip when current clip ends */
  const handleClipEnd = useCallback(
    (index: number) => {
      const nextIndex = index + 1;
      if (nextIndex < clips.length) {
        const container = containerRef.current;
        if (container) {
          const cards = container.querySelectorAll('.clip-card');
          cards[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [clips.length]
  );

  return (
    <div className="feed-container" ref={containerRef}>
      {clips.map((clip, index) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          index={index}
          isActive={index === activeIndex}
          onClipEnd={() => handleClipEnd(index)}
        />
      ))}

      {/* End-of-feed indicator */}
      {clips.length > 0 && (
        <div className="feed-container__end">
          <div className="feed-container__end-content">
            <span className="feed-container__end-emoji">🎓</span>
            <p className="feed-container__end-text">סיימת את כל הקליפים!</p>
            <p className="feed-container__end-subtext">גלול למעלה כדי לחזור</p>
          </div>
        </div>
      )}
    </div>
  );
}
