interface Tab {
  id: string;
  label: string;
  highlight?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-0.5 border-b border-edge">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
            activeTab === tab.id
              ? 'text-heading'
              : 'text-dim hover:text-body'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
