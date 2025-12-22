import { useEffect, useMemo, type ReactNode } from 'react';
import { slugifyTitle, useOutline } from './OutlineContext';

interface LayerProps {
  children: ReactNode;
  title?: string;
  icon?: string;
}

export function Layer({ children, title, icon }: LayerProps) {
  const outline = useOutline();
  const sectionId = useMemo(() => {
    if (!title) return undefined;
    const slug = slugifyTitle(title);
    if (!slug) return undefined;
    return `sec-${slug}`;
  }, [title]);

  useEffect(() => {
    if (!outline || !title || !sectionId) return;
    outline.registerSection({ id: sectionId, title });
  }, [outline, sectionId, title]);

  return (
    <div
      id={sectionId}
      className="bg-white/5 rounded-xl p-5 border border-white/10 mb-5 scroll-mt-8"
    >
      {title && (
        <div className="text-xl text-cyan-400 mb-4 flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
