import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'mcp-integration', label: 'MCP 集成', description: 'MCP 协议' },
  { id: 'tool-system', label: 'Tool 系统', description: '工具执行' },
  { id: 'approval-mode', label: '审批模式', description: '权限控制' },
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
          <span className="text-2xl">🔌</span>
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
              基于 MCP 协议的 IDE 集成客户端，支持 VS Code、Antigravity 等编辑器，提供 Diff 视图、工作区上下文和信任管理
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">MCP</div>
              <div className="text-xs text-[var(--text-muted)]">协议基础</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">Diff</div>
              <div className="text-xs text-[var(--text-muted)]">视图集成</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">Trust</div>
              <div className="text-xs text-[var(--text-muted)]">工作区信任</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">Context</div>
              <div className="text-xs text-[var(--text-muted)]">工作区状态</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">支持的 IDE</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                VS Code
              </span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                VS Code Forks
              </span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                Antigravity
              </span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                Cursor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码位置:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/ide/ide-client.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function IDEClient() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const architectureChart = `flowchart TD
    subgraph CLI["Gemini CLI"]
        CLIENT[IdeClient 单例]
        TOOLS[Tool 执行器]
        UI[UI 组件]
    end

    subgraph Transport["连接层"]
        HTTP[HTTP Transport]
        STDIO[Stdio Transport]
    end

    subgraph IDE["IDE Extension"]
        MCP[MCP Server]
        DIFF[Diff View]
        CONTEXT[Workspace Context]
        TRUST[Trust Manager]
    end

    CLIENT --> HTTP
    CLIENT --> STDIO
    HTTP --> MCP
    STDIO --> MCP

    MCP --> DIFF
    MCP --> CONTEXT
    MCP --> TRUST

    TOOLS --> CLIENT
    UI --> CLIENT

    style CLI fill:#1a1a2e,stroke:#00d4ff
    style Transport fill:#1a1a2e,stroke:#00ff88
    style IDE fill:#2d1f3d,stroke:#a855f7`;

  const connectionFlowChart = `sequenceDiagram
    participant CLI as Gemini CLI
    participant Client as IdeClient
    participant Ext as IDE Extension
    participant User as 用户

    CLI->>Client: getInstance()
    Client->>Client: detectIde()
    Client->>Client: getConnectionConfig()

    alt HTTP 连接
        Client->>Ext: HTTP Transport (port)
    else Stdio 连接
        Client->>Ext: Stdio Transport (command)
    end

    Ext-->>Client: 连接成功
    Client->>Client: setState(Connected)
    Client->>Ext: 订阅通知

    Note over Client,Ext: 开始交互

    CLI->>Client: openDiff(filePath, newContent)
    Client->>Ext: tools/call openDiff
    Ext->>User: 显示 Diff 视图
    User-->>Ext: Accept/Reject
    Ext-->>Client: notification (accepted/rejected)
    Client-->>CLI: DiffUpdateResult`;

  const ideClientCode = `// IdeClient - 单例模式管理 IDE 连接
export class IdeClient {
  private static instancePromise: Promise<IdeClient> | null = null;
  private client: Client | undefined = undefined;
  private state: IDEConnectionState = {
    status: IDEConnectionStatus.Disconnected,
    details: 'IDE integration is currently disabled. To enable it, run /ide enable.',
  };
  private currentIde: IdeInfo | undefined;
  private ideProcessInfo: { pid: number; command: string } | undefined;
  private connectionConfig: ConnectionConfig | undefined;
  private authToken: string | undefined;
  private diffResponses = new Map<string, (result: DiffUpdateResult) => void>();
  private statusListeners = new Set<(state: IDEConnectionState) => void>();
  private trustChangeListeners = new Set<(isTrusted: boolean) => void>();
  private availableTools: string[] = [];
  private diffMutex = Promise.resolve();  // Diff 互斥锁

  private constructor() {}

  static getInstance(): Promise<IdeClient> {
    if (!IdeClient.instancePromise) {
      IdeClient.instancePromise = (async () => {
        const client = new IdeClient();
        client.ideProcessInfo = await getIdeProcessInfo();
        client.connectionConfig = await client.getConnectionConfigFromFile();
        client.currentIde = detectIde(
          client.ideProcessInfo,
          client.connectionConfig?.ideInfo,
        );
        return client;
      })();
    }
    return IdeClient.instancePromise;
  }
}`;

  const connectionStatusCode = `// 连接状态枚举
export enum IDEConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
}

export type IDEConnectionState = {
  status: IDEConnectionStatus;
  details?: string;  // 用户可见的详情
};

// 连接配置
type ConnectionConfig = {
  port?: string;           // HTTP 端口
  authToken?: string;      // 认证 Token
  stdio?: StdioConfig;     // Stdio 配置
  workspacePath?: string;  // 工作区路径
  ideInfo?: IdeInfo;       // IDE 信息
};

type StdioConfig = {
  command: string;
  args: string[];
};`;

  const connectCode = `// 连接到 IDE
async connect(options: { logToConsole?: boolean } = {}): Promise<void> {
  const logError = options.logToConsole ?? true;

  if (!this.currentIde) {
    this.setState(
      IDEConnectionStatus.Disconnected,
      'IDE integration is not supported in your current environment.',
      false,
    );
    return;
  }

  this.setState(IDEConnectionStatus.Connecting);

  // 获取连接配置
  this.connectionConfig = await this.getConnectionConfigFromFile();
  this.authToken =
    this.connectionConfig?.authToken ??
    process.env['GEMINI_CLI_IDE_AUTH_TOKEN'];

  // 验证工作区路径
  const workspacePath =
    this.connectionConfig?.workspacePath ??
    process.env['GEMINI_CLI_IDE_WORKSPACE_PATH'];

  const { isValid, error } = IdeClient.validateWorkspacePath(
    workspacePath,
    process.cwd(),
  );

  if (!isValid) {
    this.setState(IDEConnectionStatus.Disconnected, error, logError);
    return;
  }

  // 尝试 HTTP 连接
  if (this.connectionConfig?.port) {
    const connected = await this.establishHttpConnection(
      this.connectionConfig.port,
    );
    if (connected) return;
  }

  // 尝试 Stdio 连接
  if (this.connectionConfig?.stdio) {
    const connected = await this.establishStdioConnection(
      this.connectionConfig.stdio,
    );
    if (connected) return;
  }

  // 尝试从环境变量连接
  const portFromEnv = this.getPortFromEnv();
  if (portFromEnv) {
    const connected = await this.establishHttpConnection(portFromEnv);
    if (connected) return;
  }

  this.setState(
    IDEConnectionStatus.Disconnected,
    'Failed to connect to IDE companion extension.',
    logError,
  );
}`;

  const diffCode = `// Diff 视图管理
export type DiffUpdateResult =
  | { status: 'accepted'; content?: string }
  | { status: 'rejected'; content: undefined };

// 打开 Diff 视图
async openDiff(
  filePath: string,
  newContent: string,
): Promise<DiffUpdateResult> {
  // 获取互斥锁 - 确保同时只有一个 Diff 视图
  const release = await this.acquireMutex();

  const promise = new Promise<DiffUpdateResult>((resolve, reject) => {
    if (!this.client) {
      return reject(new Error('IDE client is not connected.'));
    }

    // 保存回调
    this.diffResponses.set(filePath, resolve);

    // 发送 openDiff 请求
    this.client.request(
      {
        method: 'tools/call',
        params: {
          name: 'openDiff',
          arguments: { filePath, newContent },
        },
      },
      CallToolResultSchema,
      { timeout: IDE_REQUEST_TIMEOUT_MS },
    )
    .then((result) => {
      if (result.isError) {
        this.diffResponses.delete(filePath);
        reject(new Error(result.content[0]?.text));
      }
    })
    .catch((err) => {
      this.diffResponses.delete(filePath);
      reject(err);
    });
  });

  // 确保释放互斥锁
  promise.finally(release);
  return promise;
}

// 互斥锁实现
private acquireMutex(): Promise<() => void> {
  let release: () => void;
  const newMutex = new Promise<void>((resolve) => {
    release = resolve;
  });
  const oldMutex = this.diffMutex;
  this.diffMutex = newMutex;
  return oldMutex.then(() => release);
}`;

  const ideCommandCode = `// /ide 命令实现
export const ideCommand = async (): Promise<SlashCommand> => {
  const ideClient = await IdeClient.getInstance();
  const currentIDE = ideClient.getCurrentIde();

  if (!currentIDE) {
    return {
      name: 'ide',
      description: 'Manage IDE integration',
      kind: CommandKind.BUILT_IN,
      action: () => ({
        type: 'message',
        messageType: 'error',
        content: 'IDE integration is not supported in your current environment.',
      }),
    };
  }

  // 根据连接状态动态生成子命令
  const { status } = ideClient.getConnectionStatus();
  const isConnected = status === IDEConnectionStatus.Connected;

  const subCommands = isConnected
    ? [statusCommand, disableCommand]
    : [enableCommand, statusCommand, installCommand];

  return {
    name: 'ide',
    description: 'Manage IDE integration',
    kind: CommandKind.BUILT_IN,
    subCommands,
  };
};

// 状态检查命令
const statusCommand: SlashCommand = {
  name: 'status',
  description: 'Check status of IDE integration',
  action: async () => {
    const ideClient = await IdeClient.getInstance();
    const connection = ideClient.getConnectionStatus();

    switch (connection.status) {
      case IDEConnectionStatus.Connected:
        // 获取打开的文件列表
        const context = ideContextStore.get();
        const openFiles = context?.workspaceState?.openFiles;
        let content = '🟢 Connected to ' + ideClient.getDetectedIdeDisplayName();
        if (openFiles?.length > 0) {
          content += formatFileList(openFiles);
        }
        return { type: 'message', messageType: 'info', content };

      case IDEConnectionStatus.Connecting:
        return { type: 'message', messageType: 'info', content: '🟡 Connecting...' };

      default:
        return { type: 'message', messageType: 'error', content: '🔴 Disconnected' };
    }
  },
};`;

  const trustListenerCode = `// Trust 状态监听 Hook
export function useIdeTrustListener() {
  const settings = useSettings();
  const [connectionStatus, setConnectionStatus] = useState<IDEConnectionStatus>(
    IDEConnectionStatus.Disconnected,
  );
  const previousTrust = useRef<boolean | undefined>(undefined);
  const [restartReason, setRestartReason] = useState<RestartReason>('NONE');
  const [needsRestart, setNeedsRestart] = useState(false);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStatusChange = (state: IDEConnectionState) => {
      setConnectionStatus(state.status);
      setRestartReason('CONNECTION_CHANGE');
      onStoreChange();
    };

    const handleTrustChange = () => {
      setRestartReason('TRUST_CHANGE');
      onStoreChange();
    };

    (async () => {
      const ideClient = await IdeClient.getInstance();
      ideClient.addTrustChangeListener(handleTrustChange);
      ideClient.addStatusChangeListener(handleStatusChange);
      setConnectionStatus(ideClient.getConnectionStatus().status);
    })();

    return () => {
      // 清理监听器
    };
  }, []);

  // 使用 useSyncExternalStore 同步 IDE Trust 状态
  const isIdeTrusted = useSyncExternalStore(subscribe, getSnapshot);

  // 检测 Trust 变化是否需要重启
  useEffect(() => {
    const currentTrust = isWorkspaceTrusted(settings.merged).isTrusted;
    if (previousTrust.current !== undefined &&
        previousTrust.current !== currentTrust) {
      setNeedsRestart(true);
    }
    previousTrust.current = currentTrust;
  }, [isIdeTrusted, settings.merged]);

  return { isIdeTrusted, needsRestart, restartReason };
}

export type RestartReason = 'NONE' | 'CONNECTION_CHANGE' | 'TRUST_CHANGE';`;

  const statusTableData = [
    { status: 'Connected', icon: '🟢', description: 'IDE 扩展已连接，可以使用 Diff 视图等功能' },
    { status: 'Connecting', icon: '🟡', description: '正在尝试连接 IDE 扩展' },
    { status: 'Disconnected', icon: '🔴', description: '未连接，需要启用或安装扩展' },
  ];

  const commandsTableData = [
    { command: '/ide status', description: '查看当前 IDE 连接状态和打开的文件' },
    { command: '/ide enable', description: '启用 IDE 集成并尝试连接' },
    { command: '/ide disable', description: '禁用 IDE 集成并断开连接' },
    { command: '/ide install', description: '安装 IDE companion 扩展' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">IDE Client 集成</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          基于 MCP 协议的 IDE 集成客户端，提供 Diff 视图、工作区上下文和信任管理
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="架构概览" icon="🏗️" defaultOpen={true}>
        <HighlightBox title="IDE Client 架构" color="blue" className="mb-6">
          <MermaidDiagram chart={architectureChart} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">🔌 MCP 协议</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• Model Context Protocol</li>
              <li>• HTTP 或 Stdio 传输</li>
              <li>• 双向工具调用</li>
              <li>• 实时通知订阅</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">📂 工作区感知</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 获取打开的文件列表</li>
              <li>• 活动文件标记</li>
              <li>• 工作区路径验证</li>
              <li>• 上下文自动同步</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--purple)]/30">
            <div className="text-[var(--purple)] font-bold mb-2">🔐 信任管理</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• IDE 信任状态同步</li>
              <li>• Trust 变化检测</li>
              <li>• 重启提示</li>
              <li>• 权限自动调整</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="连接流程" icon="🔗" defaultOpen={true}>
        <MermaidDiagram chart={connectionFlowChart} />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">状态</th>
                <th className="text-left py-2 text-[var(--text-muted)]">图标</th>
                <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {statusTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium">{row.status}</td>
                  <td className="py-2">{row.icon}</td>
                  <td className="py-2">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="IdeClient 单例" icon="🎯" defaultOpen={false}>
        <CodeBlock code={ideClientCode} language="typescript" title="IdeClient 类结构" />

        <div className="mt-4">
          <CodeBlock code={connectionStatusCode} language="typescript" title="连接状态类型" />
        </div>
      </Layer>

      <Layer title="连接管理" icon="🔌" defaultOpen={false}>
        <CodeBlock code={connectCode} language="typescript" title="connect() 方法" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="连接优先级" color="blue">
            <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
              <li>配置文件 HTTP 端口</li>
              <li>配置文件 Stdio 命令</li>
              <li>环境变量 HTTP 端口</li>
              <li>环境变量 Stdio 配置</li>
            </ol>
          </HighlightBox>
          <HighlightBox title="环境变量" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>GEMINI_CLI_IDE_AUTH_TOKEN</code></li>
              <li>• <code>GEMINI_CLI_IDE_WORKSPACE_PATH</code></li>
              <li>• <code>GEMINI_CLI_IDE_PORT</code></li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="Diff 视图" icon="📝" defaultOpen={false}>
        <CodeBlock code={diffCode} language="typescript" title="Diff 视图管理" />

        <div className="mt-4 bg-[var(--bg-terminal)] p-4 rounded-lg">
          <h4 className="text-[var(--terminal-green)] font-bold mb-2">Diff 互斥锁</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            VS Code 等 IDE 无法同时处理多个 Diff 视图，因此使用 Promise 链式互斥锁确保同时只有一个 Diff 视图打开。
            每次 <code>openDiff</code> 调用都会等待前一个完成后才开始。
          </p>
        </div>
      </Layer>

      <Layer title="/ide 命令" icon="⌨️" defaultOpen={false}>
        <CodeBlock code={ideCommandCode} language="typescript" title="/ide 命令实现" />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">命令</th>
                <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {commandsTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2"><code className="text-[var(--cyber-blue)]">{row.command}</code></td>
                  <td className="py-2">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="Trust 监听" icon="🔐" defaultOpen={false}>
        <CodeBlock code={trustListenerCode} language="typescript" title="useIdeTrustListener Hook" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="Trust 变化触发" color="orange">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• IDE 工作区信任状态变化</li>
              <li>• 连接状态变化</li>
              <li>• 设置修改</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="重启原因" color="blue">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>NONE</code> - 无需重启</li>
              <li>• <code>CONNECTION_CHANGE</code> - 连接变化</li>
              <li>• <code>TRUST_CHANGE</code> - 信任状态变化</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="IDE 检测" icon="🔍" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">检测方式</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 父进程命令行分析</li>
              <li>• 配置文件 ideInfo</li>
              <li>• 环境变量检测</li>
              <li>• 进程树遍历</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--cyber-blue)]/30">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">IdeInfo 结构</h4>
            <CodeBlock
              code={`interface IdeInfo {
  name: string;        // 内部名称
  displayName: string; // 显示名称
  extensionId: string; // 扩展 ID
  marketplaceUrl?: string;
}`}
              language="typescript"
            />
          </div>
        </div>
      </Layer>

      <Layer title="使用场景" icon="💡" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">✅ 适用场景</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 在 IDE 集成终端中运行 CLI</li>
              <li>• 需要可视化 Diff 审查的编辑</li>
              <li>• 想要获取 IDE 打开文件上下文</li>
              <li>• 利用 IDE 工作区信任设置</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--error)]/30">
            <h4 className="text-[var(--error)] font-bold mb-2">❌ 限制</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 需要安装 companion 扩展</li>
              <li>• 仅支持特定 IDE（VS Code 系）</li>
              <li>• 工作区路径必须匹配</li>
              <li>• 同时只能打开一个 Diff 视图</li>
            </ul>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
