import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolved: 'light' | 'dark';
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'sac_theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitial(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitial);
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const compute = () => {
      const r: 'light' | 'dark' = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
      setResolved(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
    };
    compute();
    mq.addEventListener('change', compute);
    return () => mq.removeEventListener('change', compute);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      setTheme: (t) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
      },
      toggle: () =>
        setThemeState((c) =>
          c === 'dark' ? 'light' : c === 'light' ? 'dark' : resolved === 'dark' ? 'light' : 'dark',
        ),
    }),
    [theme, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}