interface HighlightBoxProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'red';
}

const variantStyles = {
  default: 'bg-orange-500/10 border-orange-500',
  blue: 'bg-cyan-500/10 border-cyan-500',
  green: 'bg-green-500/10 border-green-500',
  purple: 'bg-purple-500/10 border-purple-500',
  red: 'bg-red-500/10 border-red-500',
};

export function HighlightBox({
  children,
  title,
  icon,
  variant = 'default',
}: HighlightBoxProps) {
  return (
    <div
      className={`rounded-lg border p-4 my-4 ${variantStyles[variant]}`}
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
