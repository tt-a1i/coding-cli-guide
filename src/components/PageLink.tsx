import { type ReactNode } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

interface PageLinkProps {
  /** 目标页面的 tab ID */
  to: string;
  /** 链接文本或子元素 */
  children: ReactNode;
  /** 额外的 className */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 跨页面导航链接组件。
 *
 * 使用此组件代替 `<a href="#xxx">` 来实现真正的页面切换。
 *
 * @example
 * ```tsx
 * <PageLink to="token-accounting">Token 计费系统</PageLink>
 * ```
 */
export function PageLink({ to, children, className, style }: PageLinkProps) {
  const { navigate } = useNavigation();

  return (
    <button
      onClick={() => navigate(to)}
      className={className}
      style={{
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        textAlign: 'inherit',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
