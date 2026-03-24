import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { slugifyTitle, useOutline } from './OutlineContext';

interface LayerProps {
  children: ReactNode;
  title?: string;
  icon?: string;
  /** 层级深度，影响视觉样式。1=主层级，2=子层级，3+=更深层级 */
  depth?: number;
  /** 是否默认展开，默认为 true */
  defaultOpen?: boolean;
  color?: string;
}

// 根据层级深度获取样式
function getDepthStyles(depth: number) {
  switch (depth) {
    case 1:
      return {
        container: 'mb-8',
        header: 'pb-3 border-b border-edge mb-4',
        title: 'text-lg',
        content: '',
      };
    case 2:
      return {
        container: 'mb-6',
        header: 'pb-2 mb-3',
        title: 'text-base',
        content: 'pl-4 border-l-2 border-edge/40 ml-1',
      };
    default:
      return {
        container: 'mb-4',
        header: 'pb-2 mb-2',
        title: 'text-sm',
        content: 'pl-3.5 border-l-2 border-edge/30 ml-0.5',
      };
  }
}

export function Layer({ children, title, icon, depth = 1, defaultOpen = true }: LayerProps) {
  const outline = useOutline();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sectionId = useMemo(() => {
    if (!title) return undefined;
    const slug = slugifyTitle(title);
    if (!slug) return undefined;
    return `sec-${slug}`;
  }, [title]);

  useEffect(() => {
    if (!outline || !title || !sectionId) return;
    if (depth === 1) {
      outline.registerSection({ id: sectionId, title });
    }
  }, [outline, sectionId, title, depth]);

  const handleToggle = () => {
    if (title) setIsOpen(!isOpen);
  };

  if (!title) {
    return (
      <div id={sectionId} className="scroll-mt-8">
        {children}
      </div>
    );
  }

  const styles = getDepthStyles(depth);

  return (
    <div id={sectionId} className={`scroll-mt-8 ${styles.container}`}>
      <button
        onClick={handleToggle}
        className={`group w-full flex items-center gap-2 text-left cursor-pointer transition-colors duration-150 ${styles.header}`}
      >
        <svg
          className={`w-3 h-3 text-dim shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {icon && <span className="text-base opacity-60">{icon}</span>}
        <span className={`flex-1 font-semibold text-heading ${styles.title}`}>
          {title}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[100000px] opacity-100' : 'max-h-0 opacity-0'
        } ${styles.content}`}
      >
        {children}
      </div>
    </div>
  );
}
