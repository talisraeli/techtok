/* ============================================
   FeedContainer — Vertical Scroll-Snap Manager
   ============================================ */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Clip } from '../../types';
import { ClipCard } from '../ClipCard/ClipCard';
import { useNavigate } from 'react-router-dom';
import './FeedContainer.css';

interface FeedContainerProps {
  clips: Clip[];
  initialIndex?: number;
  courseId?: string;
}

export function FeedContainer({ clips, initialIndex = 0, courseId }: FeedContainerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const navigate = useNavigate();
  const [hearts, setHearts] = useState<{id: number, x: number, y: number}[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /** Set up IntersectionObserver to detect which clip is in view */
  useEffect(() => {
    // Scroll to initial index on mount
    const container = containerRef.current;
    if (container) {
      setTimeout(() => {
        const cards = container.querySelectorAll('.clip-card');
        cards[initialIndex]?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
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

  // Swipe left to go back
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    // Right to left swipe
    if (swipeDistance > 50 && courseId) {
      navigate(`/course/${courseId}`);
    }
  };

  // Double tap heart effect
  const handleDoubleClick = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top + container.scrollTop;

    const newHeart = { id: Date.now(), x, y };
    setHearts(prev => [...prev, newHeart]);
    
    // Remove heart after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  }, []);

  return (
    <div 
      className="feed-container" 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {courseId && (
        <button className="feed-container__back-button" onClick={() => navigate(`/course/${courseId}`)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
      {hearts.map(heart => (
        <div 
          key={heart.id} 
          className="double-tap-heart" 
          style={{ left: heart.x, top: heart.y }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#00f2fe">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
      {clips.map((clip, index) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          index={index}
          isActive={index === activeIndex}
          onClipEnd={() => handleClipEnd(index)}
          onDoubleTap={handleDoubleClick}
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
