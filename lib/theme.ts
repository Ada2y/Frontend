/**
 * Theme resolution. The inline script in layout.tsx has already stamped an
 * explicit `data-theme` on <html> before first paint, so everything here
 * reads and writes that one attribute rather than tracking its own state.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** What's on screen right now, which is what a toggle needs to invert. */
export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing blocks writes. The theme still applies for this
    // session; it just won't be remembered.
  }
}
