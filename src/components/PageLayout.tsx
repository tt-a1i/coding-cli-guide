import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flatNavItems } from '../nav';
import { useOutline } from './OutlineContext';
import { OutlineProvider } from './OutlineProvider';
import { NavigationContext } from '../contexts/NavigationContext';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const handleScroll = () => {
      setVisible(main.scrollTop > 400);
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-base text-dim shadow-[var(--color-shadow-md)] transition-all duration-150 hover:border-edge-hover hover:text-heading hover:bg-surface"
      title="回到顶部"
      aria-label="回到顶部"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

function ShareButtons({ activeSectionId }: { activeSectionId: string | null }) {
  const [copied, setCopied] = useState<'page' | 'section' | null>(null);

  const copyToClipboard = useCallback(async (text: string, type: 'page' | 'section') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
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
    <div className="mb-5 flex items-center gap-2">
      <button
        onClick={copyPageLink}
        className="flex items-center gap-1.5 rounded-lg border border-edge bg-base px-3 py-1.5 text-xs text-body transition-all duration-150 hover:border-edge-hover hover:text-heading hover:bg-surface"
      >
        {copied === 'page' ? (
          <>
            <svg className="w-3 h-3 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>已复制</span>
          </>
        ) : (
          <>
            <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <span>复制链接</span>
          </>
        )}
      </button>
      <button
        onClick={copySectionLink}
        disabled={!activeSectionId}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all duration-150 ${
          activeSectionId
            ? 'border-edge bg-base text-body hover:border-edge-hover hover:text-heading hover:bg-surface'
            : 'cursor-not-allowed border-edge bg-base text-dim opacity-40'
        }`}
      >
        {copied === 'section' ? (
          <>
            <svg className="w-3 h-3 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>已复制</span>
          </>
        ) : (
          <>
            <span className="opacity-30 font-mono text-[11px]">#</span>
            <span>复制段落</span>
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
    <div className="mb-8 rounded-xl border border-edge bg-surface/50 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-xs font-medium text-body flex items-center gap-2">
          <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
          目录
        </div>
        <div className="text-[10px] text-dim">{items.length} 个章节</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, index) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection(s.id);
            }}
            className={`rounded-md border px-2.5 py-1 text-xs transition-all duration-150 ${
              activeSectionId === s.id
                ? 'border-accent/25 bg-accent-light text-accent font-medium'
                : 'border-edge bg-base text-body hover:border-edge-hover hover:text-heading'
            }`}
          >
            <span className="opacity-30 mr-1 font-mono text-[10px]">{String(index + 1).padStart(2, '0')}</span>
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

  const navigationValue = useMemo(() => ({ navigate: onNavigate }), [onNavigate]);

  return (
    <NavigationContext.Provider value={navigationValue}>
      <OutlineProvider key={activeTab}>
        <BackToTop />
        <OutlineHeader
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
          onSelectSection={onSelectSection}
        />
        {children}

        {/* Navigation Footer */}
        <div className="mt-16 border-t border-edge pt-6">
          <div className="flex items-center justify-between gap-4">
            <button
              disabled={!prev}
              onClick={() => prev && onNavigate(prev.id)}
              className={`group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs transition-all duration-150 ${
                prev
                  ? 'border-edge bg-base text-body hover:border-edge-hover hover:text-heading hover:bg-surface'
                  : 'cursor-not-allowed border-edge bg-base text-dim opacity-40'
              }`}
            >
              <span className={`transition-transform duration-150 ${prev ? 'group-hover:-translate-x-0.5' : ''}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </span>
              <span className="max-w-[140px] truncate">{prev ? prev.label : '—'}</span>
            </button>
            <button
              disabled={!next}
              onClick={() => next && onNavigate(next.id)}
              className={`group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs transition-all duration-150 ${
                next
                  ? 'border-edge bg-base text-body hover:border-edge-hover hover:text-heading hover:bg-surface'
                  : 'cursor-not-allowed border-edge bg-base text-dim opacity-40'
              }`}
            >
              <span className="max-w-[140px] truncate">{next ? next.label : '—'}</span>
              <span className={`transition-transform duration-150 ${next ? 'group-hover:translate-x-0.5' : ''}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </button>
          </div>
        </div>
      </OutlineProvider>
    </NavigationContext.Provider>
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
