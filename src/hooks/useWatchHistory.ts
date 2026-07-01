import { useState, useEffect } from 'react';

const STORAGE_KEY = 'techtok-history';

export interface WatchHistory {
  [clipId: string]: number; // Maps clipId to progress (0-1)
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistory>({});

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse watch history', e);
    }
  }, []);

  const saveProgress = (clipId: string, progress: number) => {
    setHistory((prev) => {
      const newHistory = { ...prev, [clipId]: progress };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save watch history', e);
      }
      return newHistory;
    });
  };

  const getProgress = (clipId: string): number => {
    return history[clipId] || 0;
  };

  return { history, saveProgress, getProgress };
}
