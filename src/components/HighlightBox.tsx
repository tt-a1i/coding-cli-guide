interface HighlightBoxProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange';
  color?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'orange'; // Alias for variant
  className?: string;
}

const variantStyles = {
  default: 'bg-orange-500/10 border-orange-500',
  blue: 'bg-cyan-500/10 border-cyan-500',
  green: 'bg-green-500/10 border-green-500',
  purple: 'bg-purple-500/10 border-purple-500',
  red: 'bg-red-500/10 border-red-500',
  yellow: 'bg-yellow-500/10 border-yellow-500',
  orange: 'bg-orange-500/10 border-orange-500',
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
  return (
    <div
      className={`rounded-lg border p-4 my-4 ${variantStyles[style]} ${className}`}
    >
      {title && (
        <div className="font-bold mb-2 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
