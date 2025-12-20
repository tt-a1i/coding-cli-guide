import { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  highlight?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  icon: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navGroups: NavGroup[] = [
  {
    id: 'start',
    title: '快速入门',
    icon: '🚀',
    defaultOpen: true,
    items: [
      { id: 'start-here', label: 'Start Here', highlight: true },
      { id: 'overview', label: '架构概览' },
    ],
  },
  {
    id: 'core',
    title: '核心机制',
    icon: '⚙️',
    defaultOpen: true,
    items: [
      { id: 'startup-chain', label: '启动链路', highlight: true },
      { id: 'lifecycle', label: '请求生命周期', highlight: true },
      { id: 'interaction-loop', label: '交互主循环', highlight: true },
      { id: 'gemini-chat', label: '核心循环' },
      { id: 'system-prompt', label: 'Prompt构建' },
      { id: 'content-gen', label: 'API调用层' },
      { id: 'vlm-switch', label: 'VLM切换' },
      { id: 'memory', label: '上下文管理' },
    ],
  },
  {
    id: 'tools',
    title: '工具系统',
    icon: '🔧',
    defaultOpen: false,
    items: [
      { id: 'tool-ref', label: '工具参考', highlight: true },
      { id: 'tool-scheduler', label: '工具调度详解', highlight: true },
      { id: 'tool-arch', label: '工具架构' },
      { id: 'tool-detail', label: '工具执行' },
      { id: 'ai-tool', label: 'AI工具交互' },
    ],
  },
  {
    id: 'commands',
    title: '命令系统',
    icon: '💻',
    defaultOpen: false,
    items: [
      { id: 'slash-cmd', label: '斜杠命令' },
      { id: 'custom-cmd', label: '自定义命令', highlight: true },
      { id: 'shell-modes', label: 'Shell模式', highlight: true },
      { id: 'at-cmd', label: '@命令' },
      { id: 'memory-split', label: '记忆系统', highlight: true },
    ],
  },
  {
    id: 'extensions',
    title: '扩展集成',
    icon: '🔌',
    defaultOpen: false,
    items: [
      { id: 'subagent', label: '子代理系统' },
      { id: 'mcp', label: 'MCP集成' },
      { id: 'extension', label: '扩展系统' },
      { id: 'ide-integration', label: 'IDE集成' },
      { id: 'ide-diff', label: 'IDE Diff协议', highlight: true },
    ],
  },
  {
    id: 'security',
    title: '安全可靠',
    icon: '🛡️',
    defaultOpen: false,
    items: [
      { id: 'approval-mode', label: '审批模式', highlight: true },
      { id: 'trusted-folders', label: '信任机制' },
      { id: 'checkpointing', label: '检查点恢复' },
      { id: 'sandbox', label: '沙箱系统' },
      { id: 'loop-detect', label: '循环检测' },
      { id: 'retry', label: '重试回退' },
      { id: 'error', label: '错误处理' },
    ],
  },
  {
    id: 'runtime',
    title: '运行模式',
    icon: '▶️',
    defaultOpen: false,
    items: [
      { id: 'non-interactive', label: '非交互模式' },
      { id: 'welcome-back', label: '会话恢复' },
    ],
  },
  {
    id: 'ui',
    title: 'UI与观测',
    icon: '🎨',
    defaultOpen: false,
    items: [
      { id: 'ui', label: 'UI渲染层' },
      { id: 'theme', label: '主题系统' },
      { id: 'telemetry', label: '遥测系统' },
    ],
  },
  {
    id: 'appendix',
    title: '附录',
    icon: '📚',
    defaultOpen: false,
    items: [
      { id: 'config', label: '配置系统' },
      { id: 'auth', label: '认证流程' },
      { id: 'startup', label: '启动流程' },
      { id: 'animation', label: '动画演示', highlight: true },
      { id: 'code', label: '核心代码' },
    ],
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navGroups.forEach((group) => {
      if (group.defaultOpen) {
        initial.add(group.id);
      }
      // Also open the group containing the active tab
      if (group.items.some((item) => item.id === activeTab)) {
        initial.add(group.id);
      }
    });
    return initial;
  });

  // Auto-expand group when activeTab changes (e.g., from StartHere navigation)
  useEffect(() => {
    const groupContainingTab = navGroups.find((group) =>
      group.items.some((item) => item.id === activeTab)
    );
    if (groupContainingTab && !openGroups.has(groupContainingTab.id)) {
      setOpenGroups((prev) => new Set([...prev, groupContainingTab.id]));
    }
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <aside className="w-64 bg-gray-900/50 border-r border-gray-700 h-screen overflow-y-auto sticky top-0">
      {/* Logo/Title */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-cyan-400">Innies CLI</h1>
        <p className="text-xs text-gray-500">架构学习指南</p>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <span>{group.icon}</span>
              <span className="flex-1 text-left">{group.title}</span>
              <span
                className={`text-gray-500 transition-transform ${
                  openGroups.has(group.id) ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
            </button>

            {/* Group Items */}
            {openGroups.has(group.id) && (
              <div className="ml-4 mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                        : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300'
                    }`}
                  >
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                    <span className={item.highlight ? '' : 'ml-3.5'}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 mt-4">
        <p className="text-xs text-gray-500">
          基于 innies-cli 源码分析
        </p>
        <p className="text-xs text-gray-600 mt-1">
          ⭐ = 推荐阅读
        </p>
      </div>
    </aside>
  );
}
