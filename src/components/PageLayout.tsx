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
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--terminal-green)] hover:text-[var(--terminal-green)] hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all duration-200 group"
      title="回到顶部"
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
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
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all duration-200"
      >
        {copied === 'page' ? (
          <>
            <span className="text-[var(--terminal-green)]">✓</span>
            <span className="text-[var(--terminal-green)]">copied!</span>
          </>
        ) : (
          <>
            <span className="opacity-60">$</span>
            <span>cp link</span>
          </>
        )}
      </button>
      <button
        onClick={copySectionLink}
        disabled={!activeSectionId}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-200 ${
          activeSectionId
            ? 'bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--amber-dim)] hover:text-[var(--amber)]'
            : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
        }`}
      >
        {copied === 'section' ? (
          <>
            <span className="text-[var(--terminal-green)]">✓</span>
            <span className="text-[var(--terminal-green)]">copied!</span>
          </>
        ) : (
          <>
            <span className="opacity-60">#</span>
            <span>cp section</span>
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
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4 mb-6 relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--terminal-green)] to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[var(--terminal-green)] to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm font-mono text-[var(--terminal-green)] flex items-center gap-2">
          <span className="opacity-60">▸</span>
          <span>目录索引</span>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-mono">// 点击跳转</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s, index) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection(s.id);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-mono border transition-all duration-200 ${
              activeSectionId === s.id
                ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/40 text-[var(--terminal-green)] shadow-[0_0_10px_var(--terminal-green-glow)]'
                : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <span className="opacity-50 mr-1">{String(index + 1).padStart(2, '0')}.</span>
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
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4">
            <button
              disabled={!prev}
              onClick={() => prev && onNavigate(prev.id)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-mono border transition-all duration-200 ${
                prev
                  ? 'bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--cyber-blue-dim)] hover:text-[var(--cyber-blue)]'
                  : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              <span className={`transition-transform duration-200 ${prev ? 'group-hover:-translate-x-1' : ''}`}>←</span>
              <span className="max-w-[120px] truncate">{prev ? prev.label : 'EOF'}</span>
            </button>
            <div className="text-xs text-[var(--text-muted)] font-mono hidden sm:block">
              // navigate
            </div>
            <button
              disabled={!next}
              onClick={() => next && onNavigate(next.id)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-mono border transition-all duration-200 ${
                next
                  ? 'bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)]'
                  : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              <span className="max-w-[120px] truncate">{next ? next.label : 'EOF'}</span>
              <span className={`transition-transform duration-200 ${next ? 'group-hover:translate-x-1' : ''}`}>→</span>
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
