interface HighlightBoxProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange';
  color?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange'; // Alias for variant
  className?: string;
}

const variantStyles = {
  default: {
    container: 'bg-[var(--amber)]/5 border-[var(--amber)]/30 hover:border-[var(--amber)]/50',
    title: 'text-[var(--amber)]',
    accent: 'bg-[var(--amber)]',
  },
  blue: {
    container: 'bg-[var(--cyber-blue)]/5 border-[var(--cyber-blue)]/30 hover:border-[var(--cyber-blue)]/50',
    title: 'text-[var(--cyber-blue)]',
    accent: 'bg-[var(--cyber-blue)]',
  },
  green: {
    container: 'bg-[var(--terminal-green)]/5 border-[var(--terminal-green)]/30 hover:border-[var(--terminal-green)]/50',
    title: 'text-[var(--terminal-green)]',
    accent: 'bg-[var(--terminal-green)]',
  },
  purple: {
    container: 'bg-purple-500/5 border-purple-500/30 hover:border-purple-500/50',
    title: 'text-purple-400',
    accent: 'bg-purple-500',
  },
  red: {
    container: 'bg-red-500/5 border-red-500/30 hover:border-red-500/50',
    title: 'text-red-400',
    accent: 'bg-red-500',
  },
  yellow: {
    container: 'bg-[var(--amber)]/5 border-[var(--amber)]/30 hover:border-[var(--amber)]/50',
    title: 'text-[var(--amber)]',
    accent: 'bg-[var(--amber)]',
  },
  orange: {
    container: 'bg-[var(--amber)]/5 border-[var(--amber)]/30 hover:border-[var(--amber)]/50',
    title: 'text-[var(--amber)]',
    accent: 'bg-[var(--amber)]',
  },
};

export function HighlightBox({
  children,
  title,
  icon,
  variant,
  color,
  className = '',
}: HighlightBoxProps) {
  const style = variant || color || 'default';
  const styles = variantStyles[style];

  return (
    <div
      className={`rounded-lg border p-5 my-4 transition-all duration-200 relative overflow-hidden ${styles.container} ${className}`}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-[1px] ${styles.accent} opacity-40`} />
        <div className={`absolute top-0 left-0 w-[1px] h-full ${styles.accent} opacity-40`} />
      </div>

      {title && (
        <div className={`font-bold font-mono mb-3 flex items-center gap-2 ${styles.title}`}>
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}
