import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flatNavItems, navGroups } from '../nav';

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
      // Also open the group containing the active tab
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
        <span className="text-[var(--terminal-green)] bg-[var(--terminal-green)]/10 px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  }, [searchQuery]);

  return (
    <aside className="w-64 bg-[var(--bg-terminal)] border-r border-[var(--border-subtle)] h-screen overflow-y-auto sticky top-0 relative">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--terminal-green)] via-[var(--amber)] to-[var(--cyber-blue)]" />

      {/* Logo/Title */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-[var(--terminal-green)] text-lg">▶</span>
          <h1 className="text-lg font-bold text-[var(--terminal-green)] font-mono tracking-tight">
            Gemini CLI
          </h1>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1 pl-6 font-mono">
          // 架构学习指南
        </p>
        <div className="mt-4">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
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
              className={`w-full pl-7 pr-3 py-2 text-sm rounded-md bg-[var(--bg-void)] border font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all duration-200 ${
                searchFocused
                  ? 'border-[var(--terminal-green)] shadow-[0_0_10px_var(--terminal-green-glow)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
              }`}
            />
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-void)] border border-[var(--terminal-green-dim)] rounded-md overflow-hidden shadow-[0_4px_20px_rgba(0,255,65,0.15)] z-50">
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
                      className={`w-full px-3 py-2 text-left text-sm font-mono transition-all duration-150 ${
                        isSelected
                          ? 'bg-[var(--terminal-green)]/10 border-l-2 border-l-[var(--terminal-green)]'
                          : 'hover:bg-[var(--bg-elevated)] border-l-2 border-l-transparent'
                      } ${activeTab === item.id ? 'text-[var(--terminal-green)]' : 'text-[var(--text-primary)]'}`}
                    >
                      <div className="flex items-center gap-2">
                        {item.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--terminal-green)] shadow-[0_0_4px_var(--terminal-green-glow)]" />
                        )}
                        <span className="flex-1 truncate">{highlightMatch(item.label)}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate pl-3.5">
                        {item.groupIcon} {highlightMatch(item.groupTitle)}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-sm text-[var(--text-muted)] font-mono">
                  <span className="text-[var(--amber)]">!</span> 无匹配结果
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {navGroups.map((group, groupIndex) => {
          const containsActive = group.items.some((item) => item.id === activeTab);
          const isOpen = openGroups.has(group.id) || containsActive;

          return (
            <div key={group.id} className="mb-2 stagger-item" style={{ animationDelay: `${groupIndex * 30}ms` }}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-mono rounded-md transition-all duration-200 group ${
                  isOpen
                    ? 'bg-[var(--bg-panel)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel)]/50 hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="text-base opacity-80 group-hover:opacity-100 transition-opacity">{group.icon}</span>
                <span className="flex-1 text-left tracking-wide">{group.title}</span>
                <span
                  className={`text-[var(--terminal-green)] text-xs transition-transform duration-200 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                >
                  ▸
                </span>
              </button>

              {/* Group Items */}
              {isOpen && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-[var(--border-subtle)] pl-3">
                  {group.items.map((item, itemIndex) => (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded transition-all duration-150 ${
                        activeTab === item.id
                          ? 'bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] border-l-2 border-l-[var(--terminal-green)] -ml-[13px] pl-[23px] shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50 hover:text-[var(--text-primary)] hover:translate-x-1'
                      }`}
                      style={{ animationDelay: `${(groupIndex * 50) + (itemIndex * 20)}ms` }}
                    >
                      {item.highlight && (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          activeTab === item.id
                            ? 'bg-[var(--terminal-green)] shadow-[0_0_6px_var(--terminal-green-glow)]'
                            : 'bg-[var(--amber)]'
                        }`} />
                      )}
                      <span className={item.highlight ? '' : 'ml-3.5'}>
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
      <div className="p-4 border-t border-[var(--border-subtle)] mt-4">
        <div className="font-mono text-xs space-y-3">
          {/* GitHub Links */}
          <div className="space-y-2">
            <a
              href="https://github.com/google-gemini/gemini-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[var(--bg-void)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all duration-200 group"
            >
              <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="flex-1">gemini-cli</span>
              <span className="text-[var(--text-muted)] group-hover:text-[var(--terminal-green)] transition-colors">↗</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
