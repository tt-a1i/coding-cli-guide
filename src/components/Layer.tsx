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
}

// 根据层级深度获取样式
function getDepthStyles(depth: number) {
  switch (depth) {
    case 1:
      return {
        container: 'bg-white/5 rounded-xl p-5 border border-white/10 mb-5',
        title: 'text-xl text-cyan-400',
        titleIcon: 'text-2xl',
      };
    case 2:
      return {
        container: 'bg-white/[0.03] rounded-lg p-4 border border-white/5 mb-4 ml-2',
        title: 'text-lg text-cyan-300',
        titleIcon: 'text-xl',
      };
    case 3:
    default:
      return {
        container: 'bg-white/[0.02] rounded-md p-3 border border-white/[0.03] mb-3 ml-4',
        title: 'text-base text-cyan-200',
        titleIcon: 'text-lg',
      };
  }
}

export function Layer({ children, title, icon, depth = 1, defaultOpen = true }: LayerProps) {
  const outline = useOutline();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = getDepthStyles(depth);

  const sectionId = useMemo(() => {
    if (!title) return undefined;
    const slug = slugifyTitle(title);
    if (!slug) return undefined;
    return `sec-${slug}`;
  }, [title]);

  useEffect(() => {
    if (!outline || !title || !sectionId) return;
    // 只有顶级层级（depth=1）注册到大纲
    if (depth === 1) {
      outline.registerSection({ id: sectionId, title });
    }
  }, [outline, sectionId, title, depth]);

  const handleToggle = () => {
    if (title) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      id={sectionId}
      className={`${styles.container} scroll-mt-8`}
    >
      {title && (
        <button
          onClick={handleToggle}
          className={`w-full ${styles.title} mb-4 flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer`}
        >
          {icon && <span className={styles.titleIcon}>{icon}</span>}
          <span className="flex-1">{title}</span>
          <span
            className={`transform transition-transform duration-200 text-white/50 text-sm ${isOpen ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>
      )}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[100000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
