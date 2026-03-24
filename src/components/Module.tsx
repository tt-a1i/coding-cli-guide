interface ModuleProps {
  name: string;
  path?: string;
  description: string;
  icon?: string;
}

export function Module({ name, path, description, icon }: ModuleProps) {
  return (
    <div className="bg-base border border-edge rounded-xl p-4 min-w-[200px] flex-1 cursor-pointer transition-all duration-150 hover:border-edge-hover hover:bg-surface">
      <div className="font-semibold text-heading mb-1 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {name}
      </div>
      {path && (
        <div className="text-xs text-dim font-mono mb-2">{path}</div>
      )}
      <div className="text-sm text-body">{description}</div>
    </div>
  );
}
