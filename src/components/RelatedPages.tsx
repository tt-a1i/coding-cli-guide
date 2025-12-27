interface RelatedPage {
  id: string;
  label: string;
  description?: string;
}

interface RelatedPagesProps {
  title?: string;
  pages: RelatedPage[];
  onNavigate?: (id: string) => void;
}

export function RelatedPages({ title = '🔗 相关阅读', pages, onNavigate }: RelatedPagesProps) {
  return (
    <div className="mt-8 p-5 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)]">
      <h3 className="text-sm font-bold font-mono text-[var(--text-muted)] mb-4 flex items-center gap-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onNavigate?.(page.id)}
            className="text-left p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/5 transition-all group"
          >
            <div className="font-mono text-sm text-[var(--text-primary)] group-hover:text-[var(--terminal-green)] flex items-center gap-2">
              <span className="text-[var(--text-muted)] group-hover:text-[var(--terminal-green)]">→</span>
              {page.label}
            </div>
            {page.description && (
              <div className="text-xs text-[var(--text-muted)] mt-1">{page.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
