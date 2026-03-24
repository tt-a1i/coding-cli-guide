interface HighlightBoxProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: string;
  color?: string;
  className?: string;
}

const variantMap: Record<string, string> = {
  default: 'info',
  blue: 'info',
  purple: 'info',
  green: 'success',
  tip: 'success',
  red: 'danger',
  yellow: 'warning',
  orange: 'warning',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
  success: 'success',
};

const borderColors: Record<string, string> = {
  info: 'border-l-[var(--color-info)]',
  success: 'border-l-[var(--color-success)]',
  warning: 'border-l-[var(--color-warning)]',
  danger: 'border-l-[var(--color-danger)]',
};

const bgColors: Record<string, string> = {
  info: 'bg-[var(--color-info-soft)]',
  success: 'bg-[var(--color-success-soft)]',
  warning: 'bg-[var(--color-warning-soft)]',
  danger: 'bg-[var(--color-danger-soft)]',
};

export function HighlightBox({
  children,
  title,
  icon,
  variant,
  color,
  className = '',
}: HighlightBoxProps) {
  const mapped = variantMap[variant || color || 'info'] || 'info';
  const borderClass = borderColors[mapped] || borderColors.info;
  const bgClass = bgColors[mapped] || bgColors.info;

  return (
    <div
      className={`border-l-2 ${borderClass} ${bgClass} rounded-r-lg pl-4 pr-4 py-3 my-4 ${className}`}
    >
      {title && (
        <div className="font-semibold mb-2 flex items-center gap-2 text-heading text-sm">
          {icon && <span className="opacity-60">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
      <div className="text-body text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
