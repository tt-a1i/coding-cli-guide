import { useEffect, useMemo, useState } from 'react';
import { loadPrism, normalizeLanguage } from '../utils/prism';

interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedHeightPx?: number;
}

export function CodeBlock({
  code,
  title,
  language,
  collapsible = true,
  defaultCollapsed,
  collapsedHeightPx = 160,
}: CodeBlockProps) {
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  // Auto-expand short code blocks (< 30 lines), collapse long ones
  const autoCollapsed = defaultCollapsed ?? lineCount > 30;
  const [collapsed, setCollapsed] = useState(autoCollapsed);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const normalizedLang = useMemo(
    () => normalizeLanguage(language, title, code),
    [language, title, code]
  );
  const prismLangKey = normalizedLang === 'text' ? 'plaintext' : normalizedLang;

  const showToggle = collapsible && lineCount > 8;
  void collapsedHeightPx;

  useEffect(() => {
    if (collapsed) return;
    let cancelled = false;

    (async () => {
      try {
        const Prism = await loadPrism();
        const languages = Prism.languages as Record<string, unknown>;
        const grammar = languages[prismLangKey] ?? languages.plaintext;
        if (!grammar) return;
        const html = Prism.highlight(code, grammar as never, prismLangKey);
        if (!cancelled) setHighlightedHtml(html);
      } catch {
        if (!cancelled) setHighlightedHtml(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collapsed, code, prismLangKey]);

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
          <div className="text-sm text-body font-mono truncate">
            {title ?? '代码示例'}
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
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="w-full text-left rounded-xl border border-edge bg-surface/50 px-4 py-3 text-sm text-dim hover:border-edge-hover hover:text-body transition-colors duration-150 cursor-pointer"
        >
          {normalizedLang} · {lineCount} 行 — 点击展开
        </button>
      ) : (
        <div className="rounded-xl border border-[var(--color-code-border)] overflow-hidden">
          <div className="flex justify-end px-3 py-1.5 bg-[var(--color-code-bg)] border-b border-[var(--color-code-border)]">
            <span className="inline-flex items-center rounded-md border border-[var(--color-code-border)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-code-text)] font-mono opacity-60">
              {normalizedLang}
            </span>
          </div>
          <pre className={`code-block language-${prismLangKey}`} style={{ margin: 0, borderRadius: 0, border: 'none' }}>
            <code
              className={`language-${prismLangKey}`}
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
