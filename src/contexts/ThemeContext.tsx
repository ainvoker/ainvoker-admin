import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemePreference = 'LIGHT' | 'DARK' | 'DEVICE';
type ResolvedTheme = 'light' | 'dark';

/** Shared with the client app so both consoles follow the same choice on one origin. */
const STORAGE_KEY = 'ainvoker-theme-preference';

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themePreference: 'DEVICE',
  resolvedTheme: 'light',
  setThemePreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'LIGHT' || raw === 'DARK' || raw === 'DEVICE') return raw;
  } catch {
    // ignore
  }
  return 'DEVICE';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'LIGHT') return 'light';
  if (preference === 'DARK') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setPreference] = useState<ThemePreference>(readStoredPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(readStoredPreference()));

  useEffect(() => {
    setResolvedTheme(resolveTheme(themePreference));
    if (themePreference !== 'DEVICE') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(resolveTheme('DEVICE'));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [themePreference]);

  const setThemePreference = (preference: ThemePreference) => {
    setPreference(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ themePreference, resolvedTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}
