import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'react-hooks', label: 'React Hooks', description: 'Hook 库' },
  { id: 'ui-state-management', label: 'UI 状态管理', description: '状态流转' },
  { id: 'ui-components', label: 'UI 组件库', description: 'Ink 组件' },
  { id: 'settings-manager', label: '设置管理', description: '配置系统' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔗</span>
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
              React Context 驱动的全局状态系统，管理 UI 状态、会话数据、配置、流式状态和键盘输入
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">12+</div>
              <div className="text-xs text-[var(--text-muted)]">Context 类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">React</div>
              <div className="text-xs text-[var(--text-muted)]">Context API</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">140+</div>
              <div className="text-xs text-[var(--text-muted)]">UIState 字段</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">Hook</div>
              <div className="text-xs text-[var(--text-muted)]">封装访问</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">核心 Context</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                UIStateContext
              </span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                SessionContext
              </span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                ConfigContext
              </span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                KeypressContext
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码位置:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/ui/contexts/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContextSystem() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const contextHierarchyChart = `flowchart TD
    subgraph Providers["Context Providers"]
        APP[AppContext]
        CONFIG[ConfigContext]
        SETTINGS[SettingsContext]
        SESSION[SessionContext]
        UI_STATE[UIStateContext]
        UI_ACTIONS[UIActionsContext]
        KEYPRESS[KeypressContext]
        STREAMING[StreamingContext]
        VIM[VimModeContext]
        SHELL[ShellFocusContext]
        MOUSE[MouseContext]
        SCROLL[ScrollProvider]
    end

    subgraph Consumers["消费者组件"]
        COMPOSER[Composer]
        MESSAGES[MessageDisplay]
        DIALOGS[Dialogs]
        TOOLS[ToolComponents]
    end

    subgraph Hooks["访问 Hooks"]
        USE_CONFIG[useConfig]
        USE_SETTINGS[useSettings]
        USE_SESSION[useSession]
        USE_UI_STATE[useUIState]
        USE_ACTIONS[useUIActions]
        USE_KEYPRESS[useKeypress]
        USE_STREAMING[useStreamingContext]
    end

    APP --> CONFIG
    CONFIG --> SETTINGS
    SETTINGS --> SESSION
    SESSION --> UI_STATE
    UI_STATE --> UI_ACTIONS
    UI_ACTIONS --> KEYPRESS
    KEYPRESS --> VIM
    VIM --> STREAMING
    STREAMING --> SHELL
    SHELL --> MOUSE

    COMPOSER --> USE_UI_STATE
    COMPOSER --> USE_ACTIONS
    COMPOSER --> USE_KEYPRESS
    MESSAGES --> USE_UI_STATE
    MESSAGES --> USE_STREAMING
    DIALOGS --> USE_CONFIG
    DIALOGS --> USE_SETTINGS
    TOOLS --> USE_SESSION

    style Providers fill:#1a1a2e,stroke:#00d4ff
    style Consumers fill:#1a1a2e,stroke:#00ff88
    style Hooks fill:#2d1f3d,stroke:#a855f7`;

  const uiStateCode = `// UIState - 主 UI 状态接口 (140+ 字段)
export interface UIState {
  // === 历史记录 ===
  history: HistoryItem[];
  historyManager: UseHistoryManagerReturn;
  pendingHistoryItems: HistoryItemWithoutId[];
  pendingGeminiHistoryItems: HistoryItemWithoutId[];
  pendingSlashCommandHistoryItems: HistoryItemWithoutId[];
  historyRemountKey: number;

  // === 对话框状态 ===
  isThemeDialogOpen: boolean;
  isAuthDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
  isSessionBrowserOpen: boolean;
  isModelDialogOpen: boolean;
  isPermissionsDialogOpen: boolean;
  isFolderTrustDialogOpen: boolean;
  isEditorDialogOpen: boolean;
  dialogsVisible: boolean;
  customDialog: React.ReactNode | null;

  // === 认证状态 ===
  isAuthenticating: boolean;
  isConfigInitialized: boolean;
  authError: string | null;
  isAwaitingApiKeyInput: boolean;
  apiKeyDefaultValue?: string;

  // === 流式状态 ===
  streamingState: StreamingState;
  thought: ThoughtSummary | null;
  elapsedTime: number;
  currentLoadingPhrase: string;

  // === 输入状态 ===
  buffer: TextBuffer;
  inputWidth: number;
  suggestionsWidth: number;
  isInputActive: boolean;
  shellModeActive: boolean;
  userMessages: string[];
  messageQueue: string[];
  queueErrorMessage: string | null;

  // === 确认请求 ===
  confirmationRequest: ConfirmationRequest | null;
  shellConfirmationRequest: ShellConfirmationRequest | null;
  confirmUpdateExtensionRequests: ConfirmationRequest[];
  loopDetectionConfirmationRequest: LoopDetectionConfirmationRequest | null;

  // === 终端尺寸 ===
  terminalWidth: number;
  terminalHeight: number;
  availableTerminalHeight: number | undefined;
  mainAreaWidth: number;
  staticAreaMaxItemHeight: number;
  staticExtraHeight: number;

  // === IDE 集成 ===
  currentIDE: IdeInfo | null;
  ideContextState: IdeContext | undefined;
  shouldShowIdePrompt: boolean;
  showIdeRestartPrompt: boolean;
  ideTrustRestartReason: RestartReason;

  // === Shell 集成 ===
  activePtyId: number | undefined;
  embeddedShellFocused: boolean;

  // === 模式标志 ===
  corgiMode: boolean;
  renderMarkdown: boolean;
  constrainHeight: boolean;
  showErrorDetails: boolean;
  copyModeEnabled: boolean;
  showDebugProfiler: boolean;
  showFullTodos: boolean;
  nightly: boolean;

  // === 命令系统 ===
  slashCommands: readonly SlashCommand[] | undefined;
  commandContext: CommandContext;
  geminiMdFileCount: number;
  contextFileNames: string[];

  // === 会话统计 ===
  sessionStats: SessionStatsState;
  showAutoAcceptIndicator: ApprovalMode;
  userTier: UserTierId | undefined;
  currentModel: string;
  errorCount: number;

  // ... 更多字段
}`;

  const sessionContextCode = `// SessionContext - 会话指标管理
export interface SessionStatsState {
  sessionId: string;
  sessionStartTime: Date;
  metrics: SessionMetrics;
  lastPromptTokenCount: number;
  promptCount: number;
}

export interface SessionMetrics {
  files: {
    totalLinesAdded: number;
    totalLinesRemoved: number;
  };
  tools: {
    totalCalls: number;
    totalSuccess: number;
    totalFail: number;
    totalDurationMs: number;
    totalDecisions: Record<ToolCallDecision, number>;
    byName: Record<string, ToolCallStats>;
  };
  models: Record<string, ModelMetrics>;
}

export interface ModelMetrics {
  api: {
    totalRequests: number;
    totalErrors: number;
    totalLatencyMs: number;
  };
  tokens: {
    input: number;
    prompt: number;
    candidates: number;
    total: number;
    cached: number;
    thoughts: number;
    tool: number;
  };
}

// 工具调用决策类型
export enum ToolCallDecision {
  ACCEPT = 'accept',
  REJECT = 'reject',
  MODIFY = 'modify',
  AUTO_ACCEPT = 'auto_accept',
}`;

  const configContextCode = `// ConfigContext - 配置上下文
import React, { useContext } from 'react';
import { type Config } from '@google/gemini-cli-core';

// 创建 Context
export const ConfigContext = React.createContext<Config | undefined>(undefined);

// 访问 Hook
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// 使用示例
function MyComponent() {
  const config = useConfig();

  // 访问配置
  const model = config.getModel();
  const sandbox = config.getSandboxMode();
  const approvalMode = config.getApprovalMode();

  return <Text>{model}</Text>;
}`;

  const streamingContextCode = `// StreamingContext - 流式状态上下文
import React, { createContext } from 'react';
import type { StreamingState } from '../types.js';

// 流式状态枚举
export enum StreamingState {
  Idle = 'idle',                              // 空闲
  Responding = 'responding',                  // 响应中
  WaitingForConfirmation = 'waiting_for_confirmation', // 等待确认
}

// 创建 Context
export const StreamingContext = createContext<StreamingState | undefined>(
  undefined,
);

// 访问 Hook
export const useStreamingContext = (): StreamingState => {
  const context = React.useContext(StreamingContext);
  if (context === undefined) {
    throw new Error(
      'useStreamingContext must be used within a StreamingContextProvider',
    );
  }
  return context;
};

// 使用示例
function ResponseIndicator() {
  const streamingState = useStreamingContext();

  if (streamingState === StreamingState.Responding) {
    return <Spinner type="dots" />;
  }

  if (streamingState === StreamingState.WaitingForConfirmation) {
    return <Text color="yellow">Waiting for confirmation...</Text>;
  }

  return null;
}`;

  const keypressContextCode = `// KeypressContext - 键盘输入上下文
export interface KeypressContextValue {
  useInput: (
    callback: (input: string, key: Key) => void,
    options?: UseInputOptions,
  ) => void;
  registerHandler: (id: string, handler: KeyHandler, priority?: number) => void;
  unregisterHandler: (id: string) => void;
}

export const KeypressContext = createContext<KeypressContextValue | null>(null);

export const useKeypress = () => {
  const context = useContext(KeypressContext);
  if (!context) {
    throw new Error('useKeypress must be used within KeypressProvider');
  }
  return context;
};

// 使用示例
function Composer() {
  const { useInput } = useKeypress();

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      handleInterrupt();
    } else if (key.return) {
      submitMessage();
    } else {
      buffer.insert(input);
    }
  });

  return <TextInput ... />;
}`;

  const contextTableData = [
    { name: 'UIStateContext', hook: 'useUIState', description: '主 UI 状态，包含历史、对话框、终端尺寸等' },
    { name: 'UIActionsContext', hook: 'useUIActions', description: 'UI 操作方法，如 addItem、clear、toggle 等' },
    { name: 'SessionContext', hook: 'useSession', description: '会话统计，Token 计数、工具调用统计' },
    { name: 'ConfigContext', hook: 'useConfig', description: '运行时配置，模型、沙盒、审批模式等' },
    { name: 'SettingsContext', hook: 'useSettings', description: '用户设置，主题、Vim 模式、IDE 设置等' },
    { name: 'StreamingContext', hook: 'useStreamingContext', description: '流式状态：Idle、Responding、WaitingForConfirmation' },
    { name: 'KeypressContext', hook: 'useKeypress', description: '键盘输入处理，注册/注销处理器' },
    { name: 'VimModeContext', hook: 'useVimMode', description: 'Vim 模式状态和操作' },
    { name: 'ShellFocusContext', hook: 'useShellFocus', description: 'Shell 焦点状态' },
    { name: 'MouseContext', hook: 'useMouse', description: '鼠标事件处理' },
    { name: 'ScrollProvider', hook: 'useScroll', description: '滚动状态和控制' },
    { name: 'OverflowContext', hook: 'useOverflow', description: '内容溢出处理' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Context 系统</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          React Context 驱动的全局状态管理，为 UI 组件提供统一的状态访问接口
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="Context 层次结构" icon="🏗️" defaultOpen={true}>
        <HighlightBox title="Context Provider 嵌套结构" color="blue" className="mb-6">
          <MermaidDiagram chart={contextHierarchyChart} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">🔗 Provider 嵌套</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 从外到内依次嵌套</li>
              <li>• 内层可访问外层</li>
              <li>• 依赖关系明确</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">🪝 Hook 封装</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 每个 Context 对应一个 Hook</li>
              <li>• 自动错误检查</li>
              <li>• 类型安全访问</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--purple)]/30">
            <div className="text-[var(--purple)] font-bold mb-2">🧩 组件消费</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 组件通过 Hook 访问</li>
              <li>• 解耦状态和 UI</li>
              <li>• 支持选择性订阅</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="Context 一览" icon="📋" defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">Context</th>
                <th className="text-left py-2 text-[var(--text-muted)]">Hook</th>
                <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {contextTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2"><code className="text-[var(--cyber-blue)]">{row.name}</code></td>
                  <td className="py-2"><code className="text-[var(--terminal-green)]">{row.hook}</code></td>
                  <td className="py-2">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="UIStateContext" icon="📊" defaultOpen={false}>
        <CodeBlock code={uiStateCode} language="typescript" title="UIState 接口（部分）" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="状态分类" color="blue">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>历史记录</strong>：消息历史、待处理项</li>
              <li>• <strong>对话框</strong>：各种对话框开关</li>
              <li>• <strong>认证</strong>：认证状态、错误</li>
              <li>• <strong>流式</strong>：响应状态、加载提示</li>
              <li>• <strong>输入</strong>：TextBuffer、Shell 模式</li>
              <li>• <strong>终端</strong>：尺寸、布局信息</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="为什么这么大？" color="orange">
            <p className="text-sm text-[var(--text-secondary)]">
              UIStateContext 包含 140+ 字段是因为：
            </p>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1 mt-2">
              <li>• 单一数据源原则</li>
              <li>• 避免过度拆分导致的复杂性</li>
              <li>• 方便组件间共享状态</li>
              <li>• 配合 memo 优化渲染</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="SessionContext" icon="📈" defaultOpen={false}>
        <CodeBlock code={sessionContextCode} language="typescript" title="SessionContext 类型" />

        <div className="mt-4 bg-[var(--bg-terminal)] p-4 rounded-lg">
          <h4 className="text-[var(--terminal-green)] font-bold mb-2">指标追踪</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• <strong>文件变更</strong>：添加/删除的行数</li>
            <li>• <strong>工具调用</strong>：总数、成功/失败、耗时、按名称分组</li>
            <li>• <strong>模型指标</strong>：请求数、错误、Token 使用</li>
            <li>• <strong>决策统计</strong>：Accept/Reject/Modify/AutoAccept</li>
          </ul>
        </div>
      </Layer>

      <Layer title="ConfigContext" icon="⚙️" defaultOpen={false}>
        <CodeBlock code={configContextCode} language="typescript" title="ConfigContext" />
      </Layer>

      <Layer title="StreamingContext" icon="📡" defaultOpen={false}>
        <CodeBlock code={streamingContextCode} language="typescript" title="StreamingContext" />
      </Layer>

      <Layer title="KeypressContext" icon="⌨️" defaultOpen={false}>
        <CodeBlock code={keypressContextCode} language="typescript" title="KeypressContext" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="处理器优先级" color="blue">
            <p className="text-sm text-[var(--text-secondary)]">
              多个组件可以注册键盘处理器，通过优先级决定谁先处理。
              高优先级处理器可以阻止事件传播。
            </p>
          </HighlightBox>
          <HighlightBox title="焦点管理" color="green">
            <p className="text-sm text-[var(--text-secondary)]">
              与 Shell 焦点、Vim 模式配合，实现复杂的键盘输入分发。
              对话框打开时自动接管键盘。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="最佳实践" icon="💡" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">✅ 推荐做法</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 使用 Hook 访问 Context</li>
              <li>• 只订阅需要的状态</li>
              <li>• 使用 useMemo/useCallback 优化</li>
              <li>• 在顶层提供 Provider</li>
              <li>• 处理 undefined 情况</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--error)]/30">
            <h4 className="text-[var(--error)] font-bold mb-2">❌ 避免做法</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 直接使用 useContext</li>
              <li>• 在 Provider 外使用 Hook</li>
              <li>• 过度拆分 Context</li>
              <li>• 在渲染中修改 Context</li>
              <li>• 忽略性能优化</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <CodeBlock
            code={`// 正确的 Context 使用模式
function MyComponent() {
  // ✅ 使用封装的 Hook
  const { history, streamingState } = useUIState();
  const config = useConfig();

  // ✅ 使用 useMemo 避免不必要的重渲染
  const filteredHistory = useMemo(
    () => history.filter(item => item.type === 'gemini'),
    [history]
  );

  // ✅ 使用 useCallback 稳定回调
  const handleClick = useCallback(() => {
    // do something with config
  }, [config]);

  return <Box>...</Box>;
}`}
            language="typescript"
            title="Context 使用模式"
          />
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
