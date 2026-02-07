import { useEffect, useRef } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useAppStore } from '@/stores/appStore';

/**
 * Hook to sync Zustand theme store with next-themes.
 * Single source of truth: Zustand (persisted). We push to next-themes once on mount
 * and when user calls setTheme. No bidirectional sync to avoid rapid theme toggling.
 */
export const useThemeSync = () => {
  const { theme: zustandTheme, setTheme: setZustandTheme } = useAppStore();
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const initialSyncDone = useRef(false);

  // One-way sync: Zustand -> next-themes ONCE on mount (restore persisted preference).
  // Do not sync next-themes -> Zustand in an effect; that caused a feedback loop and rapid toggling.
  useEffect(() => {
    if (initialSyncDone.current || !zustandTheme) return;
    setNextTheme(zustandTheme);
    initialSyncDone.current = true;
  }, [zustandTheme, setNextTheme]);

  return {
    theme: nextTheme ?? zustandTheme,
    resolvedTheme,
    setTheme: (theme: 'light' | 'dark' | 'system') => {
      setZustandTheme(theme);
      setNextTheme(theme);
    },
  };
};

