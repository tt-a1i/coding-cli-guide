import { useReducer } from 'react';

export function ThemeToggle() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const toggle = () => {
    const nowDark = document.documentElement.classList.contains('dark');
    const next = !nowDark;

    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next ? '#111110' : '#fafaf9');

    // Force re-render to update icon
    forceUpdate();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-7 h-7 rounded-lg border border-edge bg-base text-dim transition-all duration-150 hover:border-edge-hover hover:text-body hover:bg-surface"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
