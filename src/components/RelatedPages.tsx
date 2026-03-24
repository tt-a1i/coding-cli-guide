import { useNavigation } from '../contexts/NavigationContext';

export interface RelatedPage {
  id: string;
  label: string;
  description?: string;
}

interface RelatedPagesProps {
  title?: string;
  pages: RelatedPage[];
}

export function RelatedPages({ title = '相关阅读', pages }: RelatedPagesProps) {
  const { navigate } = useNavigation();

  return (
    <div className="mt-8 rounded-xl border border-edge bg-surface/50 p-5">
      <h3 className="text-sm font-semibold text-body mb-4">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(page.id)}
            className="text-left group rounded-lg border border-edge bg-base px-3 py-2 transition-all duration-150 hover:border-edge-hover hover:bg-surface"
          >
            <span className="text-sm text-heading group-hover:text-accent transition-colors duration-150">
              {page.label}
            </span>
            {page.description && (
              <span className="block text-xs text-dim mt-0.5">{page.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
