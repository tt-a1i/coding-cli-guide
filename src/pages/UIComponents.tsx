import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'react-hooks', label: 'React Hooks', description: 'Hook 库' },
  { id: 'ui-state', label: 'UI 状态管理', description: '状态流转' },
  { id: 'text-buffer', label: 'TextBuffer', description: '文本编辑器' },
  { id: 'key-bindings', label: '键盘绑定', description: '快捷键' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧩</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              基于 React + Ink 的终端 UI 组件库，包含对话框、选择器、消息显示、状态指示等 80+ 组件
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">80+</div>
              <div className="text-xs text-[var(--text-muted)]">UI 组件</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">Ink</div>
              <div className="text-xs text-[var(--text-muted)]">终端渲染</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">组件分类</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">A11y</div>
              <div className="text-xs text-[var(--text-muted)]">无障碍支持</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">组件分类</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                对话框
              </span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                选择器
              </span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                消息展示
              </span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                状态指示
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码目录:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/ui/components/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function UIComponents() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const componentHierarchy = `flowchart TD
    subgraph Layout["布局组件"]
        HEADER[Header]
        FOOTER[Footer]
        MAIN[MainContent]
        BOX[MaxSizedBox]
    end

    subgraph Dialog["对话框"]
        SETTINGS[SettingsDialog]
        MODEL[ModelSwitchDialog]
        THEME[ThemeDialog]
        TRUST[FolderTrustDialog]
        QUIT[QuitConfirmationDialog]
    end

    subgraph Selection["选择器"]
        BASE[BaseSelectionList]
        RADIO[RadioButtonSelect]
        DESC[DescriptiveRadioButtonSelect]
        ENUM[EnumSelector]
        SCOPE[ScopeSelector]
    end

    subgraph Message["消息展示"]
        USER[UserMessage]
        GEMINI[GeminiMessage]
        ERROR[ErrorMessage]
        INFO[InfoMessage]
        TOOL[ToolGroupMessage]
    end

    subgraph Input["输入组件"]
        COMPOSER[Composer]
        TEXT[TextInput]
        SUGGEST[SuggestionsDisplay]
    end

    BASE --> RADIO
    BASE --> DESC
    RADIO --> ENUM
    RADIO --> SCOPE

    style Layout fill:#1a1a2e,stroke:#00d4ff
    style Dialog fill:#1a1a2e,stroke:#00ff88
    style Selection fill:#1a1a2e,stroke:#f59e0b
    style Message fill:#2d1f3d,stroke:#a855f7
    style Input fill:#1a1a2e,stroke:#ec4899`;

  const baseSelectionCode = `// BaseSelectionList.tsx - 选择列表基础组件
export interface BaseSelectionListProps<T> {
  items: SelectionListItem<T>[];
  initialIndex?: number;
  onSelect: (value: T) => void;
  onHighlight?: (value: T) => void;
  isFocused?: boolean;
  showNumbers?: boolean;      // 显示数字快捷键
  showScrollArrows?: boolean; // 显示滚动箭头
  maxItemsToShow?: number;    // 可见项数量
  renderItem: (item: T, context: RenderItemContext) => React.ReactNode;
}

export interface RenderItemContext {
  isSelected: boolean;
  titleColor: string;
  numberColor: string;
}

export function BaseSelectionList<T>({
  items,
  initialIndex = 0,
  onSelect,
  onHighlight,
  isFocused = true,
  showNumbers = true,
  maxItemsToShow = 10,
  renderItem,
}: BaseSelectionListProps<T>) {
  const { activeIndex } = useSelectionList({
    items, initialIndex, onSelect, onHighlight, isFocused, showNumbers,
  });

  const [scrollOffset, setScrollOffset] = useState(0);

  // 处理滚动偏移
  useEffect(() => {
    const newOffset = Math.max(0,
      Math.min(activeIndex - maxItemsToShow + 1, items.length - maxItemsToShow)
    );
    setScrollOffset(newOffset);
  }, [activeIndex, items.length, maxItemsToShow]);

  return (
    <Box flexDirection="column">
      {scrollOffset > 0 && <Text>▲</Text>}
      {visibleItems.map((item, index) => (
        <Box key={item.key}>
          <Text>{isSelected ? '●' : '○'}</Text>
          {showNumbers && <Text color={numberColor}>{index + 1}.</Text>}
          {renderItem(item, { isSelected, titleColor, numberColor })}
        </Box>
      ))}
      {hasMoreBelow && <Text>▼</Text>}
    </Box>
  );
}`;

  const suggestionsCode = `// SuggestionsDisplay.tsx - 补全建议展示
export interface Suggestion {
  label: string;
  value: string;
  description?: string;
  matchedIndex?: number;
  commandKind?: CommandKind;  // INTERNAL | MCP_PROMPT | ...
}

interface SuggestionsDisplayProps {
  suggestions: Suggestion[];
  activeIndex: number;
  isLoading: boolean;
  width: number;
  scrollOffset: number;
  userInput: string;
  mode: 'reverse' | 'slash';  // 反向搜索 或 斜杠命令
  expandedIndex?: number;
}

export const MAX_SUGGESTIONS_TO_SHOW = 8;

export function SuggestionsDisplay({
  suggestions, activeIndex, isLoading, width, scrollOffset, mode,
}: SuggestionsDisplayProps) {
  if (isLoading) {
    return <Text color="gray">Loading suggestions...</Text>;
  }

  if (suggestions.length === 0) return null;

  const visibleSuggestions = suggestions.slice(
    scrollOffset,
    scrollOffset + MAX_SUGGESTIONS_TO_SHOW
  );

  return (
    <Box flexDirection="column" paddingX={1} width={width}>
      {scrollOffset > 0 && <Text>▲</Text>}
      {visibleSuggestions.map((suggestion, index) => {
        const isActive = startIndex + index === activeIndex;
        return (
          <Box key={suggestion.value}>
            <Text color={isActive ? theme.text.accent : theme.text.secondary}>
              {suggestion.label}
            </Text>
            {suggestion.description && (
              <Text color={theme.text.muted}> - {suggestion.description}</Text>
            )}
          </Box>
        );
      })}
      {hasMoreBelow && <Text>▼</Text>}
    </Box>
  );
}`;

  const messageComponentsCode = `// 消息组件系统
// messages/UserMessage.tsx
export function UserMessage({ message }: { message: UIMessage }) {
  return (
    <Box>
      <Text color={theme.text.userLabel}>You: </Text>
      <Text>{message.content}</Text>
    </Box>
  );
}

// messages/GeminiMessage.tsx
export function GeminiMessage({ message, isStreaming }: GeminiMessageProps) {
  return (
    <Box flexDirection="column">
      <Text color={theme.text.assistantLabel}>Gemini: </Text>
      <GeminiMessageContent content={message.content} />
      {isStreaming && <GeminiRespondingSpinner />}
    </Box>
  );
}

// messages/ToolGroupMessage.tsx - 工具调用分组显示
export function ToolGroupMessage({ tools }: { tools: ToolUse[] }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      {tools.map((tool) => (
        <Box key={tool.id}>
          <Text color={theme.tool.name}>{tool.name}</Text>
          <Text color={theme.tool.status}>{tool.status}</Text>
        </Box>
      ))}
    </Box>
  );
}

// messages/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: string }) {
  return (
    <Box>
      <Text color={theme.error.text}>✕ </Text>
      <Text color={theme.error.text}>{error}</Text>
    </Box>
  );
}`;

  const dialogCode = `// 对话框组件模式
// SettingsDialog.tsx
export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSection, setActiveSection] = useState('general');

  useDialogClose({ isOpen, onClose });  // Esc 关闭

  if (!isOpen) return null;

  return (
    <Box flexDirection="column" borderStyle="double" padding={1}>
      <Text bold>Settings</Text>

      <Box marginTop={1}>
        <ScopeSelector
          currentScope={scope}
          onScopeChange={setScope}
        />
      </Box>

      <Box marginTop={1}>
        <EnumSelector
          label="Theme"
          value={localSettings.theme}
          options={['dark', 'light', 'system']}
          onChange={(v) => setLocalSettings({ ...localSettings, theme: v })}
        />
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Press Esc to close, Enter to save</Text>
      </Box>
    </Box>
  );
}

// ModelSwitchDialog.tsx
export function ModelSwitchDialog({ models, currentModel, onSelect }) {
  return (
    <BaseSelectionList
      items={models.map(m => ({ key: m.id, value: m, disabled: !m.available }))}
      onSelect={onSelect}
      renderItem={(model, ctx) => (
        <Text color={ctx.isSelected ? 'cyan' : 'white'}>
          {model.name} {!model.available && '(unavailable)'}
        </Text>
      )}
    />
  );
}`;

  const componentCategories = [
    {
      category: '布局组件',
      icon: '📐',
      color: 'cyber-blue',
      components: [
        { name: 'Header', desc: '应用头部，显示标题和状态' },
        { name: 'Footer', desc: '底部状态栏，快捷键提示' },
        { name: 'MainContent', desc: '主内容区域容器' },
        { name: 'MaxSizedBox', desc: '最大尺寸限制容器' },
        { name: 'AppHeader', desc: '应用级头部组件' },
        { name: 'AboutBox', desc: '关于信息展示框' },
      ],
    },
    {
      category: '对话框',
      icon: '💬',
      color: 'terminal-green',
      components: [
        { name: 'SettingsDialog', desc: '设置对话框，多 Scope 配置' },
        { name: 'ModelSwitchDialog', desc: '模型切换对话框' },
        { name: 'ThemeDialog', desc: '主题选择对话框' },
        { name: 'FolderTrustDialog', desc: '文件夹信任确认' },
        { name: 'QuitConfirmationDialog', desc: '退出确认对话框' },
        { name: 'ProQuotaDialog', desc: 'Pro 配额提示对话框' },
        { name: 'IdeTrustChangeDialog', desc: 'IDE 信任变更对话框' },
        { name: 'EditorSettingsDialog', desc: '编辑器设置对话框' },
        { name: 'WorkspaceMigrationDialog', desc: '工作区迁移对话框' },
        { name: 'LoopDetectionConfirmation', desc: '循环检测确认' },
      ],
    },
    {
      category: '选择器',
      icon: '🔘',
      color: 'amber',
      components: [
        { name: 'BaseSelectionList', desc: '选择列表基础组件' },
        { name: 'RadioButtonSelect', desc: '单选按钮选择器' },
        { name: 'DescriptiveRadioButtonSelect', desc: '带描述的单选器' },
        { name: 'EnumSelector', desc: '枚举值选择器' },
        { name: 'ScopeSelector', desc: 'Scope 选择器 (User/Workspace)' },
        { name: 'ColorSelector', desc: '颜色选择器' },
        { name: 'GenerationMethodSelector', desc: '生成方式选择器' },
        { name: 'LocationSelector', desc: '位置选择器' },
      ],
    },
    {
      category: '消息展示',
      icon: '💭',
      color: 'purple',
      components: [
        { name: 'UserMessage', desc: '用户消息展示' },
        { name: 'GeminiMessage', desc: 'AI 响应消息' },
        { name: 'GeminiMessageContent', desc: 'AI 消息内容渲染' },
        { name: 'ToolGroupMessage', desc: '工具调用分组' },
        { name: 'ErrorMessage', desc: '错误消息' },
        { name: 'InfoMessage', desc: '信息消息' },
        { name: 'WarningMessage', desc: '警告消息' },
        { name: 'SummaryMessage', desc: '摘要消息' },
        { name: 'UserShellMessage', desc: '用户 Shell 命令' },
        { name: 'DiffRenderer', desc: '差异渲染器' },
      ],
    },
    {
      category: '输入组件',
      icon: '⌨️',
      color: 'cyber-blue',
      components: [
        { name: 'Composer', desc: '主输入组件，多行编辑' },
        { name: 'TextInput', desc: '单行文本输入' },
        { name: 'SuggestionsDisplay', desc: '补全建议展示' },
        { name: 'TextEntryStep', desc: '文本输入步骤' },
        { name: 'PrepareLabel', desc: '标签预处理组件' },
      ],
    },
    {
      category: '状态指示',
      icon: '📊',
      color: 'terminal-green',
      components: [
        { name: 'GeminiRespondingSpinner', desc: 'AI 响应加载动画' },
        { name: 'AutoAcceptIndicator', desc: '自动接受倒计时' },
        { name: 'ShellModeIndicator', desc: 'Shell 模式指示' },
        { name: 'ContextUsageDisplay', desc: '上下文使用量显示' },
        { name: 'MemoryUsageDisplay', desc: '内存使用量显示' },
        { name: 'ModelStatsDisplay', desc: '模型统计显示' },
        { name: 'StatsDisplay', desc: '会话统计显示' },
        { name: 'SessionSummaryDisplay', desc: '会话摘要展示' },
        { name: 'ContextSummaryDisplay', desc: '上下文摘要展示' },
        { name: 'ConsoleSummaryDisplay', desc: '控制台摘要展示' },
        { name: 'UpdateNotification', desc: '更新通知' },
        { name: 'Notifications', desc: '通知系统' },
        { name: 'TodoDisplay', desc: 'Todo 列表展示' },
        { name: 'QueuedMessageDisplay', desc: '队列消息展示' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">UI 组件库</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          基于 React + Ink 的终端 UI 组件库，包含对话框、选择器、消息显示等 80+ 组件
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="组件层次结构" icon="🏗️" defaultOpen={true}>
        <HighlightBox title="组件继承与组合关系" color="blue" className="mb-6">
          <MermaidDiagram chart={componentHierarchy} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">🎨 设计原则</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>Ink 渲染</strong>：所有组件渲染到终端</li>
              <li>• <strong>Box + Text</strong>：核心布局原语</li>
              <li>• <strong>组合优于继承</strong>：灵活的组件组合</li>
              <li>• <strong>Hook 驱动</strong>：状态逻辑抽象到 Hook</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">📁 目录结构</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>components/</code> - 主组件目录</li>
              <li>• <code>components/shared/</code> - 共享基础组件</li>
              <li>• <code>components/messages/</code> - 消息类组件</li>
              <li>• <code>components/subagents/</code> - 子代理相关</li>
              <li>• <code>components/views/</code> - 视图组件</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="组件分类目录" icon="📚" defaultOpen={true}>
        <div className="space-y-6">
          {componentCategories.map((cat) => (
            <div key={cat.category} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
              <div className={`px-4 py-3 bg-[var(--${cat.color})]/10 border-b border-[var(--border-subtle)]`}>
                <h3 className={`font-bold text-[var(--${cat.color})]`}>
                  {cat.icon} {cat.category}
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cat.components.map((comp) => (
                    <div key={comp.name} className="flex items-start gap-2">
                      <code className="text-xs px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] whitespace-nowrap">
                        {comp.name}
                      </code>
                      <span className="text-xs text-[var(--text-muted)]">{comp.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Layer>

      <Layer title="BaseSelectionList 详解" icon="🔘" defaultOpen={false}>
        <CodeBlock code={baseSelectionCode} language="typescript" title="BaseSelectionList.tsx" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="核心功能" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 单选按钮指示器 (● / ○)</li>
              <li>• 数字快捷键选择 (1-9)</li>
              <li>• 长列表滚动支持</li>
              <li>• 禁用项处理</li>
              <li>• 选中/高亮回调</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="派生组件" color="blue">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>RadioButtonSelect</code> - 简单单选</li>
              <li>• <code>DescriptiveRadioButtonSelect</code> - 带描述</li>
              <li>• <code>EnumSelector</code> - 枚举选择</li>
              <li>• <code>ScopeSelector</code> - Scope 选择</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="SuggestionsDisplay 详解" icon="✨" defaultOpen={false}>
        <CodeBlock code={suggestionsCode} language="typescript" title="SuggestionsDisplay.tsx" />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">属性</th>
                <th className="text-left py-2 text-[var(--text-muted)]">类型</th>
                <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2"><code>mode</code></td>
                <td>'reverse' | 'slash'</td>
                <td>反向搜索 或 斜杠命令模式</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2"><code>scrollOffset</code></td>
                <td>number</td>
                <td>当前滚动偏移量</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2"><code>expandedIndex</code></td>
                <td>number?</td>
                <td>展开显示详情的项索引</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2"><code>commandKind</code></td>
                <td>CommandKind</td>
                <td>命令类型标识 (INTERNAL/MCP_PROMPT)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="消息组件系统" icon="💭" defaultOpen={false}>
        <CodeBlock code={messageComponentsCode} language="typescript" title="messages/*.tsx" />

        <div className="mt-4 bg-[var(--bg-terminal)] p-4 rounded-lg">
          <h4 className="text-[var(--terminal-green)] font-bold mb-2">消息类型映射</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)] mb-1">用户消息</p>
              <code className="text-[var(--cyber-blue)]">UserMessage</code>
              <code className="text-[var(--text-muted)]"> → UIMessageType.USER</code>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-1">AI 响应</p>
              <code className="text-[var(--terminal-green)]">GeminiMessage</code>
              <code className="text-[var(--text-muted)]"> → UIMessageType.MODEL</code>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-1">工具调用</p>
              <code className="text-[var(--amber)]">ToolGroupMessage</code>
              <code className="text-[var(--text-muted)]"> → UIMessageType.TOOL</code>
            </div>
            <div>
              <p className="text-[var(--text-muted)] mb-1">错误信息</p>
              <code className="text-[var(--error)]">ErrorMessage</code>
              <code className="text-[var(--text-muted)]"> → UIMessageType.ERROR</code>
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="对话框模式" icon="💬" defaultOpen={false}>
        <CodeBlock code={dialogCode} language="typescript" title="Dialog 组件模式" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="对话框设计模式" color="blue">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>isOpen</code> 控制显示/隐藏</li>
              <li>• <code>useDialogClose</code> 处理 Esc 关闭</li>
              <li>• 本地状态 → onSave 提交</li>
              <li>• borderStyle="double" 视觉区分</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="键盘交互" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>Esc</code> - 关闭对话框</li>
              <li>• <code>Enter</code> - 确认/保存</li>
              <li>• <code>↑/↓</code> - 导航选项</li>
              <li>• <code>1-9</code> - 快捷选择</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="主题与颜色" icon="🎨" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">semantic-colors.ts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#00d4ff]"></span>
                <code>theme.text.accent</code>
                <span className="text-[var(--text-muted)]">- 强调色</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#00ff88]"></span>
                <code>theme.text.primary</code>
                <span className="text-[var(--text-muted)]">- 主文本</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#888888]"></span>
                <code>theme.text.secondary</code>
                <span className="text-[var(--text-muted)]">- 次要文本</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#ff5555]"></span>
                <code>theme.error.text</code>
                <span className="text-[var(--text-muted)]">- 错误文本</span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">colors.ts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <code>Colors.USER_LABEL</code>
                <span className="text-[var(--text-muted)]">- 用户标签色</span>
              </div>
              <div className="flex items-center gap-2">
                <code>Colors.ASSISTANT_LABEL</code>
                <span className="text-[var(--text-muted)]">- AI 标签色</span>
              </div>
              <div className="flex items-center gap-2">
                <code>Colors.TOOL_NAME</code>
                <span className="text-[var(--text-muted)]">- 工具名称色</span>
              </div>
              <div className="flex items-center gap-2">
                <code>Colors.SUCCESS</code>
                <span className="text-[var(--text-muted)]">- 成功状态色</span>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
