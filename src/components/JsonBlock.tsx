import { useEffect, useMemo, useState } from 'react';
import { loadPrism, normalizeLanguage } from '../utils/prism';

interface JsonBlockProps {
  code: string;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedHeightPx?: number;
}

export function JsonBlock({
  code,
  title,
  collapsible = true,
  defaultCollapsed,
  collapsedHeightPx = 160,
}: JsonBlockProps) {
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const autoCollapsed = defaultCollapsed ?? lineCount > 30;
  const [collapsed, setCollapsed] = useState(autoCollapsed);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const normalizedLang = useMemo(
    () => normalizeLanguage('json', title, code),
    [title, code]
  );

  const showToggle = collapsible && lineCount > 8;
  void collapsedHeightPx;

  useEffect(() => {
    if (collapsed) return;
    let cancelled = false;

    (async () => {
      try {
        const Prism = await loadPrism();
        const langKey = normalizedLang === 'text' ? 'plaintext' : normalizedLang;
        const languages = Prism.languages as Record<string, unknown>;
        const grammar = languages[langKey] ?? languages.plaintext;
        if (!grammar) return;
        const html = Prism.highlight(code, grammar as never, langKey);
        if (!cancelled) setHighlightedHtml(html);
      } catch {
        if (!cancelled) setHighlightedHtml(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collapsed, code, normalizedLang]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4">
      {(title || showToggle) && (
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-sm text-dim font-mono truncate">
            {title ?? 'JSON 示例'}
          </div>
          <div className="flex items-center gap-1.5">
            {!collapsed && (
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 px-2.5 py-1 text-xs rounded-md bg-base border border-edge text-body hover:bg-surface hover:border-edge-hover hover:text-heading transition-all duration-150"
              >
                {copied ? '已复制' : '复制代码'}
              </button>
            )}
            {showToggle && (
              <button
                type="button"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((v) => !v)}
                className="shrink-0 px-2.5 py-1 text-xs rounded-md bg-base border border-edge text-heading hover:bg-surface hover:border-edge-hover transition-all duration-150"
              >
                {collapsed ? `展开代码（${lineCount} 行）` : '收起代码'}
              </button>
            )}
          </div>
        </div>
      )}

      {collapsed ? (
        <div className="rounded-xl border border-edge bg-surface/50 px-4 py-3 text-sm text-dim">
          已折叠（{lineCount} 行）。点击右侧"展开代码"查看。
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-code-border)] overflow-hidden">
          <pre className={`json-block language-${normalizedLang}`} style={{ margin: 0, borderRadius: 0, border: 'none' }}>
            <code
              className={`language-${normalizedLang}`}
              dangerouslySetInnerHTML={{
                __html: highlightedHtml ?? escapeHtml(code),
              }}
            />
          </pre>
        </div>
      )}
    </div>
  );
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
