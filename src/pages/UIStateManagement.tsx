import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'ui', label: 'UI渲染层', description: 'Ink 渲染架构' },
  { id: 'theme', label: '主题系统', description: '主题管理' },
  { id: 'interaction-loop', label: '交互主循环', description: '用户交互处理' },
  { id: 'telemetry', label: '遥测系统', description: '指标收集' },
  { id: 'gemini-chat', label: '核心循环', description: 'AI 对话核心' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--purple)] font-bold">一句话：</span>
              React Context 驱动的 UI 状态管理系统，13 个 Context 分层管理应用状态、会话指标、输入焦点等
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">13</div>
              <div className="text-xs text-[var(--text-muted)]">Context 数量</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">150+</div>
              <div className="text-xs text-[var(--text-muted)]">UIState 字段</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">Ink</div>
              <div className="text-xs text-[var(--text-muted)]">渲染引擎</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">React</div>
              <div className="text-xs text-[var(--text-muted)]">状态模型</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Context 分层</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                App 配置
              </span>
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                Session 会话
              </span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                UI 状态
              </span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                输入焦点
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/ui/contexts/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function UIStateManagement() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const contextHierarchyChart = `flowchart TD
    subgraph Root["根级 Context"]
        App[AppContext<br/>版本/启动警告]
        Config[ConfigContext<br/>用户配置]
    end

    subgraph Session["会话级 Context"]
        Session[SessionContext<br/>会话指标/统计]
        Streaming[StreamingContext<br/>流式状态]
    end

    subgraph UI["UI 级 Context"]
        UIState[UIStateContext<br/>UI 完整状态]
        UIActions[UIActionsContext<br/>状态更新函数]
    end

    subgraph Input["输入级 Context"]
        Keypress[KeypressContext<br/>键盘事件]
        VimMode[VimModeContext<br/>Vim 模式状态]
        ShellFocus[ShellFocusContext<br/>嵌入式 Shell 焦点]
    end

    subgraph Other["其他 Context"]
        Settings[SettingsContext<br/>设置面板]
        Overflow[OverflowContext<br/>滚动溢出]
    end

    App --> Session
    Config --> Session
    Session --> UIState
    UIState --> UIActions
    UIActions --> Keypress
    Keypress --> VimMode
    VimMode --> ShellFocus

    style App fill:#a855f7,color:#fff
    style Session fill:#22d3ee,color:#000
    style UIState fill:#22c55e,color:#000
    style Keypress fill:#f59e0b,color:#000`;

  const appContextCode = `// packages/cli/src/ui/contexts/AppContext.tsx

export interface AppState {
  version: string;           // CLI 版本号
  startupWarnings: string[]; // 启动时的警告信息
}

export const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};`;

  const sessionContextCode = `// packages/cli/src/ui/contexts/SessionContext.tsx

export interface SessionStatsState {
  sessionId: string;
  sessionStartTime: Date;
  metrics: SessionMetrics;      // 模型/工具调用统计
  lastPromptTokenCount: number;
  promptCount: number;
}

export interface ComputedSessionStats {
  totalApiTime: number;
  totalToolTime: number;
  agentActiveTime: number;
  cacheEfficiency: number;      // 缓存命中率
  successRate: number;          // 成功率
  totalLinesAdded: number;
  totalLinesRemoved: number;
}

export const SessionStatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stats, setStats] = useState<SessionStatsState>({
    sessionId,
    sessionStartTime: new Date(),
    metrics: uiTelemetryService.getMetrics(),
    lastPromptTokenCount: 0,
    promptCount: 0,
  });

  useEffect(() => {
    // 订阅遥测服务更新
    const handleUpdate = ({ metrics, lastPromptTokenCount }) => {
      setStats((prev) => {
        if (areMetricsEqual(prev.metrics, metrics)) return prev;
        return { ...prev, metrics, lastPromptTokenCount };
      });
    };

    uiTelemetryService.on('update', handleUpdate);
    return () => uiTelemetryService.off('update', handleUpdate);
  }, []);

  // ...
};`;

  const uiStateContextCode = `// packages/cli/src/ui/contexts/UIStateContext.tsx

export interface UIState {
  // 历史与消息
  history: HistoryItem[];
  historyManager: UseHistoryManagerReturn;
  pendingHistoryItems: HistoryItemWithoutId[];

  // 认证状态
  isAuthenticating: boolean;
  authError: string | null;
  isAuthDialogOpen: boolean;
  isGoogleAuth: boolean;
  deviceAuth: DeviceAuthorizationInfo | null;
  authStatus: 'idle' | 'polling' | 'success' | 'error' | 'timeout';

  // 对话框状态
  isThemeDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
  isModelDialogOpen: boolean;
  isPermissionsDialogOpen: boolean;
  isFolderTrustDialogOpen: boolean;
  isVisionSwitchDialogOpen: boolean;
  isAgentsManagerDialogOpen: boolean;

  // 确认请求
  shellConfirmationRequest: ShellConfirmationRequest | null;
  confirmationRequest: ConfirmationRequest | null;
  loopDetectionConfirmationRequest: LoopDetectionConfirmationRequest | null;
  quitConfirmationRequest: QuitConfirmationRequest | null;

  // 流式与输入
  streamingState: StreamingState;
  buffer: TextBuffer;
  isInputActive: boolean;
  shellModeActive: boolean;

  // 布局与尺寸
  terminalWidth: number;
  terminalHeight: number;
  availableTerminalHeight: number | undefined;
  mainAreaWidth: number;

  // 命令与扩展
  slashCommands: readonly SlashCommand[];
  commandContext: CommandContext;
  extensionsUpdateState: Map<string, ExtensionUpdateState>;

  // IDE 集成
  currentIDE: IdeInfo | null;
  ideContextState: IdeContext | undefined;
  shouldShowIdePrompt: boolean;

  // 会话恢复
  showWelcomeBackDialog: boolean;
  welcomeBackInfo: { hasHistory: boolean; lastPrompt?: string } | null;
  welcomeBackChoice: 'continue' | 'restart' | null;

  // ... 150+ 字段
}

export const UIStateContext = createContext<UIState | null>(null);

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};`;

  const keypressContextCode = `// packages/cli/src/ui/contexts/KeypressContext.tsx

export interface KeypressHandler {
  (input: string, key: Key): boolean | void;
}

export interface KeypressContextValue {
  addHandler: (handler: KeypressHandler, priority?: number) => void;
  removeHandler: (handler: KeypressHandler) => void;
}

/**
 * 键盘事件分发系统
 *
 * 特点：
 * - 优先级排序：高优先级处理器先执行
 * - 事件消费：返回 true 阻止后续处理器
 * - 动态注册：组件可按需添加/移除处理器
 */
export const KeypressProvider: React.FC = ({ children }) => {
  const handlersRef = useRef<Map<KeypressHandler, number>>(new Map());

  const addHandler = useCallback((handler, priority = 0) => {
    handlersRef.current.set(handler, priority);
  }, []);

  const removeHandler = useCallback((handler) => {
    handlersRef.current.delete(handler);
  }, []);

  useInput((input, key) => {
    // 按优先级排序
    const sorted = [...handlersRef.current.entries()]
      .sort((a, b) => b[1] - a[1]);

    for (const [handler] of sorted) {
      const consumed = handler(input, key);
      if (consumed) break; // 事件被消费
    }
  });

  return (
    <KeypressContext.Provider value={{ addHandler, removeHandler }}>
      {children}
    </KeypressContext.Provider>
  );
};`;

  const vimModeContextCode = `// packages/cli/src/ui/contexts/VimModeContext.tsx

export interface VimModeState {
  mode: 'normal' | 'insert' | 'visual' | 'command';
  register: string;        // 寄存器内容
  count: number;           // 数字前缀
  pendingOperator: string; // 待执行操作符
}

export const VimModeContext = createContext<{
  state: VimModeState;
  dispatch: React.Dispatch<VimAction>;
} | null>(null);

export const useVimMode = () => {
  const context = useContext(VimModeContext);
  if (!context) {
    throw new Error('useVimMode must be used within VimModeProvider');
  }
  return context;
};`;

  return (
    <div className="space-y-8">
      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 页面标题 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">UI 状态管理</h2>
        <p className="text-gray-300 mb-4">
          Gemini CLI 使用 React Context 进行 UI 状态管理，13 个 Context 分层管理应用配置、会话指标、
          UI 状态、键盘输入等。这种设计确保了状态的模块化和组件间的解耦。
        </p>
      </section>

      {/* 1. Context 层级 */}
      <Layer title="Context 层级结构" icon="🏗️">
        <div className="space-y-4">
          <MermaidDiagram chart={contextHierarchyChart} title="Context 嵌套关系" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="border border-gray-700 p-3 text-left text-gray-400">Context</th>
                  <th className="border border-gray-700 p-3 text-left text-gray-400">职责</th>
                  <th className="border border-gray-700 p-3 text-left text-gray-400">更新频率</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr>
                  <td className="border border-gray-700 p-3"><code className="text-purple-300">AppContext</code></td>
                  <td className="border border-gray-700 p-3">版本号、启动警告</td>
                  <td className="border border-gray-700 p-3">启动时一次</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3"><code className="text-purple-300">ConfigContext</code></td>
                  <td className="border border-gray-700 p-3">用户配置对象</td>
                  <td className="border border-gray-700 p-3">配置变更时</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3"><code className="text-cyan-300">SessionContext</code></td>
                  <td className="border border-gray-700 p-3">会话指标、Token 统计</td>
                  <td className="border border-gray-700 p-3">每次 API 调用后</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3"><code className="text-cyan-300">StreamingContext</code></td>
                  <td className="border border-gray-700 p-3">流式响应状态</td>
                  <td className="border border-gray-700 p-3">流式更新时</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3"><code className="text-green-300">UIStateContext</code></td>
                  <td className="border border-gray-700 p-3">完整 UI 状态</td>
                  <td className="border border-gray-700 p-3">高频</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3"><code className="text-green-300">UIActionsContext</code></td>
                  <td className="border border-gray-700 p-3">状态更新函数</td>
                  <td className="border border-gray-700 p-3">固定引用</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3"><code className="text-amber-300">KeypressContext</code></td>
                  <td className="border border-gray-700 p-3">键盘事件处理器</td>
                  <td className="border border-gray-700 p-3">每次按键</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3"><code className="text-amber-300">VimModeContext</code></td>
                  <td className="border border-gray-700 p-3">Vim 模式状态</td>
                  <td className="border border-gray-700 p-3">模式切换时</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 2. AppContext */}
      <Layer title="AppContext - 应用配置" icon="📦">
        <div className="space-y-4">
          <CodeBlock code={appContextCode} language="typescript" title="AppContext 定义" />

          <HighlightBox title="设计要点" variant="purple">
            <div className="text-sm space-y-2 text-gray-300">
              <ul className="space-y-2">
                <li><strong>不可变：</strong>启动后不再变化</li>
                <li><strong>全局访问：</strong>任何组件可通过 useAppContext 获取</li>
                <li><strong>错误边界：</strong>未在 Provider 内使用会抛出明确错误</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 3. SessionContext */}
      <Layer title="SessionContext - 会话指标" icon="📊">
        <div className="space-y-4">
          <CodeBlock code={sessionContextCode} language="typescript" title="SessionContext 实现" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="SessionMetrics" variant="blue">
              <div className="text-sm space-y-2 text-gray-400">
                <ul className="space-y-1">
                  <li>• <code>models</code>: 各模型 API 调用统计</li>
                  <li>• <code>tools</code>: 工具调用成功/失败计数</li>
                  <li>• <code>files</code>: 文件修改行数统计</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="性能优化" variant="green">
              <div className="text-sm space-y-2 text-gray-400">
                <ul className="space-y-1">
                  <li>• <code>areMetricsEqual</code>: 深度比较避免无效更新</li>
                  <li>• 事件驱动：仅在遥测服务发出事件时更新</li>
                  <li>• useMemo：缓存 context value</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 4. UIStateContext */}
      <Layer title="UIStateContext - 核心状态" icon="🎛️">
        <div className="space-y-4">
          <CodeBlock code={uiStateContextCode} language="typescript" title="UIState 接口（部分）" />

          <HighlightBox title="状态分类" variant="blue">
            <div className="text-sm space-y-3 text-gray-300">
              <div>
                <strong className="text-cyan-400">历史与消息：</strong>
                <span className="text-gray-400">history, pendingHistoryItems, messageQueue</span>
              </div>
              <div>
                <strong className="text-purple-400">认证状态：</strong>
                <span className="text-gray-400">isAuthenticating, authStatus, deviceAuth</span>
              </div>
              <div>
                <strong className="text-amber-400">对话框状态：</strong>
                <span className="text-gray-400">isThemeDialogOpen, isSettingsDialogOpen, ...</span>
              </div>
              <div>
                <strong className="text-green-400">确认请求：</strong>
                <span className="text-gray-400">shellConfirmationRequest, loopDetectionConfirmationRequest</span>
              </div>
              <div>
                <strong className="text-pink-400">布局尺寸：</strong>
                <span className="text-gray-400">terminalWidth, terminalHeight, mainAreaWidth</span>
              </div>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 5. KeypressContext */}
      <Layer title="KeypressContext - 键盘事件" icon="⌨️">
        <div className="space-y-4">
          <CodeBlock code={keypressContextCode} language="typescript" title="KeypressContext 实现" />

          <MermaidDiagram chart={`sequenceDiagram
    participant Ink as Ink useInput
    participant KP as KeypressProvider
    participant H1 as Handler (priority: 10)
    participant H2 as Handler (priority: 5)
    participant H3 as Handler (priority: 0)

    Ink->>KP: 键盘事件 (key)
    KP->>KP: 按优先级排序处理器
    KP->>H1: handler(input, key)
    alt 事件被消费
        H1-->>KP: return true
        Note over KP: 停止传播
    else 继续传播
        H1-->>KP: return false/void
        KP->>H2: handler(input, key)
        H2-->>KP: return false
        KP->>H3: handler(input, key)
    end`} title="键盘事件分发流程" />
        </div>
      </Layer>

      {/* 6. VimModeContext */}
      <Layer title="VimModeContext - Vim 模式" icon="📝">
        <div className="space-y-4">
          <CodeBlock code={vimModeContextCode} language="typescript" title="VimModeContext" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--terminal-green)]/20 rounded-lg p-3 text-center border border-[var(--terminal-green)]/30">
              <div className="text-lg font-bold text-[var(--terminal-green)]">normal</div>
              <div className="text-xs text-gray-400">普通模式</div>
            </div>
            <div className="bg-[var(--cyber-blue)]/20 rounded-lg p-3 text-center border border-[var(--cyber-blue)]/30">
              <div className="text-lg font-bold text-[var(--cyber-blue)]">insert</div>
              <div className="text-xs text-gray-400">插入模式</div>
            </div>
            <div className="bg-[var(--purple)]/20 rounded-lg p-3 text-center border border-[var(--purple)]/30">
              <div className="text-lg font-bold text-[var(--purple)]">visual</div>
              <div className="text-xs text-gray-400">可视模式</div>
            </div>
            <div className="bg-[var(--amber)]/20 rounded-lg p-3 text-center border border-[var(--amber)]/30">
              <div className="text-lg font-bold text-[var(--amber)]">command</div>
              <div className="text-xs text-gray-400">命令模式</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 7. 设计决策 */}
      <Layer title="设计决策" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么使用多个 Context 而非单一全局 Store？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>13 个细粒度 Context 替代单一 Store。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>精确更新</strong>：只有依赖特定 Context 的组件重渲染</li>
                <li><strong>代码分离</strong>：相关状态和逻辑聚合</li>
                <li><strong>类型安全</strong>：每个 Context 有独立的 TypeScript 类型</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么 UIState 有 150+ 字段？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>现实：</strong>CLI 应用的 UI 状态确实复杂。</p>
              <p><strong>考量：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>完整性</strong>：所有 UI 状态集中管理</li>
                <li><strong>可调试</strong>：可以在一处查看完整状态</li>
                <li><strong>权衡</strong>：如需进一步拆分，可引入 UIActions 等分离模式</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      {/* 8. 关键文件 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/AppContext.tsx
            </code>
            <span className="text-gray-400">应用配置 Context</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/SessionContext.tsx
            </code>
            <span className="text-gray-400">会话指标 Context</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/UIStateContext.tsx
            </code>
            <span className="text-gray-400">UI 状态 Context</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/KeypressContext.tsx
            </code>
            <span className="text-gray-400">键盘事件 Context</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/VimModeContext.tsx
            </code>
            <span className="text-gray-400">Vim 模式 Context</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/cli/src/ui/contexts/StreamingContext.tsx
            </code>
            <span className="text-gray-400">流式状态 Context</span>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
