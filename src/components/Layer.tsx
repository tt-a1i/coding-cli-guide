interface LayerProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
}

export function Layer({ children, title, icon }: LayerProps) {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-5">
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
