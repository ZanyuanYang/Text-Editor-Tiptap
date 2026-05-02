import { useCallback, useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '@/lib/storage';
import type { Theme } from '@/lib/types';

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

export function initThemeOnLoad(): void {
  if (typeof window === 'undefined') return;
  applyTheme(loadTheme());
}

export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'light' | 'dark';
} {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    saveTheme(t);
    applyTheme(t);
    setResolved(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyTheme('system');
      setResolved(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return { theme, setTheme, resolved };
}
