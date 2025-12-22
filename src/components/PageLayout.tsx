import { useEffect, useMemo, type ReactNode } from 'react';
import { flatNavItems } from '../nav';
import { useOutline } from './OutlineContext';
import { OutlineProvider } from './OutlineProvider';

function PageOutline() {
  const outline = useOutline();
  const items = useMemo(() => {
    const sections = outline?.sections ?? [];
    const filtered = sections.filter((s) => s.title.trim().length > 0);
    return filtered.length >= 2 ? filtered : [];
  }, [outline?.sections]);

  if (items.length === 0) return null;

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-semibold text-cyan-300">本页目录</div>
        <div className="text-xs text-gray-500">点击快速跳转</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(s.id);
              const url = new URL(window.location.href);
              url.hash = s.id;
              window.history.replaceState({}, '', url);
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-950/40 border border-gray-700 text-gray-200 hover:bg-gray-800/40 hover:border-gray-600 transition-colors"
          >
            {s.title}
          </a>
        ))}
      </div>
    </div>
  );
}

export function PageLayout({
  activeTab,
  onNavigate,
  children,
}: {
  activeTab: string;
  onNavigate: (tab: string, opts?: { replace?: boolean; preserveHash?: boolean }) => void;
  children: ReactNode;
}) {
  const navIndex = useMemo(
    () => flatNavItems.findIndex((i) => i.id === activeTab),
    [activeTab]
  );
  const prev = navIndex > 0 ? flatNavItems[navIndex - 1] : null;
  const next =
    navIndex >= 0 && navIndex < flatNavItems.length - 1
      ? flatNavItems[navIndex + 1]
      : null;

  useEffect(() => {
    const main = document.querySelector('main');
    if (main instanceof HTMLElement) {
      main.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeTab]);

  useEffect(() => {
    const scrollToHash = () => {
      const raw = window.location.hash;
      const id = raw.startsWith('#') ? raw.slice(1) : raw;
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [activeTab]);

  return (
    <OutlineProvider key={activeTab}>
      <PageOutline />
      {children}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          disabled={!prev}
          onClick={() => prev && onNavigate(prev.id)}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            prev
              ? 'bg-gray-900/30 border-gray-700 text-gray-200 hover:bg-gray-800/40 hover:border-gray-600'
              : 'bg-gray-900/10 border-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {prev ? `← ${prev.label}` : '← 没有上一页'}
        </button>
        <button
          disabled={!next}
          onClick={() => next && onNavigate(next.id)}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            next
              ? 'bg-gray-900/30 border-gray-700 text-gray-200 hover:bg-gray-800/40 hover:border-gray-600'
              : 'bg-gray-900/10 border-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {next ? `${next.label} →` : '没有下一页 →'}
        </button>
      </div>
    </OutlineProvider>
  );
}
