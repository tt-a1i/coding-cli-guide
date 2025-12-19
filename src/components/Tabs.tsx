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
    <div className="flex justify-center gap-2 mb-8 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-6 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${
              activeTab === tab.id
                ? 'bg-cyan-400 text-gray-900'
                : tab.highlight
                  ? 'bg-orange-500 text-gray-900 hover:bg-orange-400'
                  : 'bg-white/10 text-white hover:bg-cyan-400/20'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
