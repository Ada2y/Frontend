'use client';

import {Moon, Sun} from 'lucide-react';
import {applyTheme, currentTheme} from '@/lib/theme';
import {cn} from '@/lib/utils';

/**
 * The server cannot know the viewer's theme, so anything rendered from it
 * hydrates wrong. Both icons are therefore always in the DOM and CSS picks
 * one off the same `data-theme` attribute the inline script set before first
 * paint - no state, no mismatch, no flash.
 */
export default function ThemeToggle({className}: {className?: string}) {
  return (
    <button
      type="button"
      onClick={() => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')}
      aria-label="Switch between light and dark theme"
      title="Switch between light and dark theme"
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
