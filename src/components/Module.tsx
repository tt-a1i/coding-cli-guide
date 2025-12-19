interface ModuleProps {
  name: string;
  path?: string;
  description: string;
  icon?: string;
}

export function Module({ name, path, description, icon }: ModuleProps) {
  return (
    <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4 min-w-[200px] flex-1 cursor-pointer transition-all hover:bg-cyan-400/20 hover:-translate-y-0.5">
      <div className="font-bold text-cyan-400 mb-1 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {name}
      </div>
      {path && (
        <div className="text-xs text-gray-500 font-mono mb-2">{path}</div>
      )}
      <div className="text-sm text-gray-300">{description}</div>
    </div>
  );
}
