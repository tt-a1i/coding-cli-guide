import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flatNavItems, navGroups } from '../nav';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navGroups.forEach((group) => {
      if (group.defaultOpen) {
        initial.add(group.id);
      }
      if (group.items.some((item) => item.id === activeTab)) {
        initial.add(group.id);
      }
    });
    return initial;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const group = navGroups.find((g) => g.id === groupId);
      const containsActive = group?.items.some((item) => item.id === activeTab);

      const next = new Set(prev);
      if (next.has(groupId)) {
        if (containsActive) return prev;
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return flatNavItems
      .filter((item) => {
        const haystack = `${item.label} ${item.groupTitle}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 15);
  }, [searchQuery]);

  const highlightMatch = useCallback((text: string): ReactNode => {
    const q = searchQuery.trim();
    if (!q) return text;
    const needle = q.toLowerCase();
    const hay = text.toLowerCase();
    const index = hay.indexOf(needle);
    if (index < 0) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + q.length);
    const after = text.slice(index + q.length);
    return (
      <>
        {before}
        <span className="text-heading font-medium underline decoration-accent/40 underline-offset-2">
          {match}
        </span>
        {after}
      </>
    );
  }, [searchQuery]);

  return (
    <aside className="sticky top-0 relative flex h-screen w-64 flex-col overflow-y-auto border-r border-edge bg-base">
      {/* Header */}
      <div className="border-b border-edge px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-heading">
            <span className="text-base text-sm font-bold font-mono leading-none" style={{ color: 'var(--color-bg)' }}>G</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-semibold text-heading tracking-tight leading-none">
              Gemini CLI
            </h1>
            <p className="text-[10px] text-dim mt-0.5 leading-none">
              架构学习指南
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search */}
        <div className="mt-3">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                const maxIndex = Math.max(searchResults.length - 1, 0);
                const safeIndex = Math.min(selectedIndex, maxIndex);
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  if (searchResults.length > 0) {
                    setSelectedIndex((i) => Math.min(i + 1, maxIndex));
                  }
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (searchResults.length > 0) {
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                  }
                }
                if (e.key === 'Enter') {
                  const item = searchResults[safeIndex] ?? searchResults[0];
                  if (!item) return;
                  setSearchQuery('');
                  setSelectedIndex(0);
                  onTabChange(item.id);
                }
              }}
              placeholder="搜索… ⌘K"
              className={`w-full rounded-lg border bg-base py-1.5 pl-8 pr-3 text-xs text-heading placeholder:text-dim focus:outline-none transition-all duration-150 ${
                searchFocused
                  ? 'border-accent/40 ring-2 ring-accent-light'
                  : 'border-edge hover:border-edge-hover'
              }`}
            />
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-edge bg-base shadow-[var(--color-shadow-md)]">
                {searchResults.length > 0 ? (
                  searchResults.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={`${item.groupId}:${item.id}`}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedIndex(0);
                          onTabChange(item.id);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors duration-100 ${
                          isSelected
                            ? 'bg-accent-light text-heading'
                            : 'text-body hover:bg-surface'
                        }`}
                      >
                        <div className="truncate">{highlightMatch(item.label)}</div>
                        <div className="text-[10px] text-dim mt-0.5 truncate">
                          {item.groupIcon} {highlightMatch(item.groupTitle)}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 text-xs text-dim">
                    无匹配结果
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navGroups.map((group, groupIndex) => {
          const containsActive = group.items.some((item) => item.id === activeTab);
          const isOpen = openGroups.has(group.id) || containsActive;

          return (
            <div key={group.id} className="mb-0.5" style={{ animationDelay: `${groupIndex * 25}ms` }}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors duration-150 ${
                  isOpen
                    ? 'text-heading'
                    : 'text-body hover:text-heading hover:bg-surface'
                }`}
              >
                <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-150">{group.icon}</span>
                <span className="flex-1 text-left font-medium">{group.title}</span>
                <svg
                  className={`w-3 h-3 text-dim transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {isOpen && (
                <div className="ml-[18px] mt-0.5 space-y-px border-l border-edge pl-2.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`relative flex w-full items-center gap-1.5 rounded-md px-2 py-[5px] text-xs transition-colors duration-150 ${
                        activeTab === item.id
                          ? 'bg-accent-light text-accent font-medium'
                          : 'text-body hover:text-heading hover:bg-surface'
                      }`}
                    >
                      {activeTab === item.id && (
                        <span className="absolute -left-[13px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent" />
                      )}
                      {item.highlight && (
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                          activeTab === item.id
                            ? 'bg-accent'
                            : 'bg-[var(--color-warning)]'
                        }`} />
                      )}
                      <span className={`truncate ${item.highlight ? '' : 'ml-2.5'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-edge p-3">
        <a
          href="https://github.com/google-gemini/gemini-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-edge bg-base px-2.5 py-2 text-xs text-body transition-all duration-150 hover:border-edge-hover hover:text-heading hover:bg-surface"
        >
          <svg className="w-3.5 h-3.5 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="flex-1">gemini-cli</span>
          <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
