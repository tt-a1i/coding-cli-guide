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
        <span className="text-cyan-200 bg-cyan-500/10 px-1 rounded">
          {match}
        </span>
        {after}
      </>
    );
  }, [searchQuery]);

  return (
    <aside className="w-64 bg-gray-900/50 border-r border-gray-700 h-screen overflow-y-auto sticky top-0">
      {/* Logo/Title */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-cyan-400">Innies CLI</h1>
        <p className="text-xs text-gray-500">架构学习指南</p>
        <div className="mt-3">
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
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
            placeholder="搜索页面… (Ctrl+K)"
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/50 border border-gray-700 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          {searchQuery.trim() && (
            <div className="mt-2 bg-gray-950/50 border border-gray-700 rounded-lg overflow-hidden">
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
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-gray-800/60'
                          : 'hover:bg-gray-800/40'
                      } ${activeTab === item.id ? 'text-cyan-300' : 'text-gray-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        {item.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                        <span className="flex-1 truncate">{highlightMatch(item.label)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.groupIcon} {highlightMatch(item.groupTitle)}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  无匹配结果
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navGroups.map((group) => {
          const containsActive = group.items.some((item) => item.id === activeTab);
          const isOpen = openGroups.has(group.id) || containsActive;

          return (
            <div key={group.id} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <span>{group.icon}</span>
              <span className="flex-1 text-left">{group.title}</span>
              <span
                className={`text-gray-500 transition-transform ${
                  isOpen ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
            </button>

            {/* Group Items */}
            {isOpen && (
              <div className="ml-4 mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300'
                    }`}
                  >
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
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
      <div className="p-4 border-t border-gray-700 mt-4">
        <p className="text-xs text-gray-500">
          基于 innies-cli 源码分析
        </p>
        <p className="text-xs text-gray-600 mt-1">
          ⭐ = 推荐阅读
        </p>
      </div>
    </aside>
  );
}
