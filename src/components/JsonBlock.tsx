import { useMemo, useState } from 'react';

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
  defaultCollapsed = true,
  collapsedHeightPx = 160,
}: JsonBlockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  const showToggle = collapsible;
  void collapsedHeightPx;

  return (
    <div className="my-4">
      {(title || showToggle) && (
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-sm text-gray-400 font-mono truncate">
            {title ?? 'JSON 示例'}
          </div>
          {showToggle && (
            <button
              type="button"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((v) => !v)}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg bg-gray-900/30 border border-gray-700 text-gray-300 hover:bg-gray-800/40 hover:border-gray-600 hover:text-cyan-300 transition-colors"
            >
              {collapsed ? `展开代码（${lineCount} 行）` : '收起代码'}
            </button>
          )}
        </div>
      )}

      {collapsed ? (
        <div className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-3 text-sm text-gray-500">
          已折叠（{lineCount} 行）。点击右侧“展开代码”查看。
        </div>
      ) : (
        <div className="rounded-lg">
          <pre className="json-block">{code}</pre>
        </div>
      )}
    </div>
  );
}
