import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flatNavItems } from '../nav';
import { useOutline } from './OutlineContext';
import { OutlineProvider } from './OutlineProvider';

function ShareButtons({ activeSectionId }: { activeSectionId: string | null }) {
  const [copied, setCopied] = useState<'page' | 'section' | null>(null);

  const copyToClipboard = useCallback(async (text: string, type: 'page' | 'section') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  const copyPageLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.hash = '';
    copyToClipboard(url.toString(), 'page');
  }, [copyToClipboard]);

  const copySectionLink = useCallback(() => {
    const url = new URL(window.location.href);
    if (activeSectionId) {
      url.hash = activeSectionId;
    }
    copyToClipboard(url.toString(), 'section');
  }, [activeSectionId, copyToClipboard]);

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={copyPageLink}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-900/30 border border-gray-700 text-gray-300 hover:bg-gray-800/40 hover:border-gray-600 hover:text-cyan-300 transition-colors"
      >
        {copied === 'page' ? (
          <>
            <span className="text-green-400">✓</span>
            <span>已复制</span>
          </>
        ) : (
          <>
            <span>🔗</span>
            <span>复制本页链接</span>
          </>
        )}
      </button>
      <button
        onClick={copySectionLink}
        disabled={!activeSectionId}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
          activeSectionId
            ? 'bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/40 hover:border-gray-600 hover:text-cyan-300'
            : 'bg-gray-900/10 border-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        {copied === 'section' ? (
          <>
            <span className="text-green-400">✓</span>
            <span>已复制</span>
          </>
        ) : (
          <>
            <span>#</span>
            <span>复制当前章节链接</span>
          </>
        )}
      </button>
    </div>
  );
}

function PageOutline({
  activeSectionId,
  onSelectSection,
}: {
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
}) {
  const outline = useOutline();
  const items = useMemo(() => {
    const sections = outline?.sections ?? [];
    const filtered = sections.filter((s) => s.title.trim().length > 0);
    return filtered.length >= 2 ? filtered : [];
  }, [outline?.sections]);

  if (items.length === 0) return null;

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
              onSelectSection(s.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              activeSectionId === s.id
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                : 'bg-gray-950/40 border-gray-700 text-gray-200 hover:bg-gray-800/40 hover:border-gray-600'
            }`}
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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

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

  const onSelectSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState({}, '', url);
    setActiveSectionId(id);
  }, []);

  return (
    <OutlineProvider key={activeTab}>
      <OutlineHeader
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        onSelectSection={onSelectSection}
      />
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

function OutlineHeader({
  activeSectionId,
  setActiveSectionId,
  onSelectSection,
}: {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  onSelectSection: (id: string) => void;
}) {
  const outline = useOutline();
  const items = useMemo(() => {
    const sections = outline?.sections ?? [];
    const filtered = sections.filter((s) => s.title.trim().length > 0);
    return filtered.length >= 2 ? filtered : [];
  }, [outline?.sections]);

  useEffect(() => {
    if (items.length === 0) return;
    const root = document.querySelector('main');
    if (!(root instanceof HTMLElement)) return;

    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        const rootRect = root.getBoundingClientRect();
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) {
            const distToTop = Math.abs(entry.boundingClientRect.top - rootRect.top);
            visible.set(id, distToTop);
          } else {
            visible.delete(id);
          }
        }

        if (visible.size === 0) return;
        const best = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;
        if (best) setActiveSectionId(best);
      },
      { root, threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    for (const s of items) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }

    const raw = window.location.hash;
    const initialId = raw.startsWith('#') ? raw.slice(1) : raw;
    if (initialId && items.some((s) => s.id === initialId)) {
      setActiveSectionId(initialId);
    } else {
      setActiveSectionId(items[0]?.id ?? null);
    }

    return () => obs.disconnect();
  }, [items, setActiveSectionId]);

  return (
    <>
      <ShareButtons activeSectionId={activeSectionId} />
      <PageOutline activeSectionId={activeSectionId} onSelectSection={onSelectSection} />
    </>
  );
}
