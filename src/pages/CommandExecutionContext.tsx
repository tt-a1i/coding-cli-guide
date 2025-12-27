/**
 * CommandExecutionContext - 命令执行上下文详解
 * 深入解析 CLI 斜杠命令系统的架构设计与执行机制
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { useNavigation } from '../contexts/NavigationContext';

export function CommandExecutionContext() {
  const [activeTab, setActiveTab] = useState<'context' | 'loaders' | 'actions' | 'flow'>('context');
  const { navigate } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto">
      <h1>🎯 命令执行上下文详解</h1>

      <div className="info-box" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        borderLeft: '4px solid var(--cyber-blue)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--cyber-blue)' }}>📌 30秒速览</h3>
        <ul style={{ margin: 0, lineHeight: 1.8 }}>
          <li><strong>CommandContext</strong>：命令执行的核心上下文对象，包含 services、ui、session 三大模块</li>
          <li><strong>Command Loaders</strong>：三种命令加载器 - Built-in、File(TOML)、MCP Prompt</li>
          <li><strong>SlashCommandActionReturn</strong>：8 种命令返回类型，驱动不同的 UI 行为</li>
          <li><strong>核心流程</strong>：输入解析 → 命令匹配 → 上下文注入 → 执行 Action → 处理返回值</li>
        </ul>
      </div>

      {/* 导航标签 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'context', label: '📦 CommandContext', icon: '📦' },
          { key: 'loaders', label: '🔌 命令加载器', icon: '🔌' },
          { key: 'actions', label: '🎬 返回类型', icon: '🎬' },
          { key: 'flow', label: '🔄 执行流程', icon: '🔄' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              padding: '0.75rem 1.5rem',
              border: activeTab === tab.key ? '2px solid var(--terminal-green)' : '1px solid var(--border-dim)',
              borderRadius: '8px',
              background: activeTab === tab.key ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              color: activeTab === tab.key ? 'var(--terminal-green)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Context Tab */}
      {activeTab === 'context' && (
        <section>
          <h2>📦 CommandContext 核心接口</h2>

          <p>
            <code>CommandContext</code> 是命令执行的核心上下文对象，它将所有命令执行所需的依赖项打包在一起，
            使得命令实现可以访问配置、UI 操作、会话状态等功能。
          </p>

          <MermaidDiagram chart={`
graph TB
    subgraph CommandContext["📦 CommandContext"]
        subgraph invocation["🎯 invocation"]
            raw["raw: 原始输入"]
            name["name: 命令名"]
            args["args: 参数字符串"]
        end

        subgraph services["⚙️ services"]
            config["config: Config"]
            settings["settings: LoadedSettings"]
            git["git: GitService"]
            logger["logger: Logger"]
        end

        subgraph ui["🖥️ ui"]
            addItem["addItem()"]
            clear["clear()"]
            setPendingItem["setPendingItem()"]
            loadHistory["loadHistory()"]
            toggleCorgiMode["toggleCorgiMode()"]
            toggleVimEnabled["toggleVimEnabled()"]
            reloadCommands["reloadCommands()"]
        end

        subgraph session["📊 session"]
            stats["stats: SessionStatsState"]
            shellAllowlist["sessionShellAllowlist: Set"]
        end

        overwriteConfirmed["overwriteConfirmed?: boolean"]
    end

    style CommandContext fill:#1a1a2e,stroke:#00ff88
    style services fill:#2a2a4e,stroke:#3b82f6
    style ui fill:#2a2a4e,stroke:#8b5cf6
    style session fill:#2a2a4e,stroke:#f59e0b
    style invocation fill:#2a2a4e,stroke:#10b981
`} />

          <h3>接口定义</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/ui/commands/types.ts

export interface CommandContext {
  // 🎯 调用信息 - 命令被调用时的上下文
  invocation?: {
    raw: string;     // 原始输入，如 "/chat save my-tag"
    name: string;    // 匹配的命令名，如 "save"
    args: string;    // 参数部分，如 "my-tag"
  };

  // ⚙️ 核心服务 - 配置和基础设施
  services: {
    config: Config | null;        // 全局配置对象
    settings: LoadedSettings;     // 用户设置
    git: GitService | undefined;  // Git 操作服务
    logger: Logger;               // 日志记录器
  };

  // 🖥️ UI 操作 - 与界面交互的方法
  ui: {
    addItem: (item: HistoryItemWithoutId, timestamp?: number) => void;
    clear: () => void;
    setDebugMessage: (message: string) => void;
    pendingItem: HistoryItemWithoutId | null;
    setPendingItem: (item: HistoryItemWithoutId | null) => void;
    loadHistory: (history: HistoryItemWithoutId[]) => void;
    toggleCorgiMode: () => void;
    toggleVimEnabled: () => Promise<boolean>;
    setGeminiMdFileCount: (count: number) => void;
    reloadCommands: () => void;
    extensionsUpdateState: Map<string, ExtensionUpdateStatus>;
    dispatchExtensionStateUpdate: (action: ExtensionUpdateAction) => void;
    addConfirmUpdateExtensionRequest: (value: ConfirmationRequest) => void;
  };

  // 📊 会话状态 - 当前会话的运行时数据
  session: {
    stats: SessionStatsState;           // 会话统计
    sessionShellAllowlist: Set<string>; // 已批准的 Shell 命令
  };

  // 🔐 确认标记 - 用于覆盖确认流程
  overwriteConfirmed?: boolean;
}`} />

          <h3>设计考量</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--cyber-blue)' }}>🎯 依赖注入</h4>
              <p>
                将所有依赖通过 Context 注入，而非直接导入。这使得命令实现可以被隔离测试，
                通过 <code>createMockCommandContext()</code> 创建测试用的 mock 对象。
              </p>
            </div>

            <div className="card" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--purple-accent)' }}>📦 分层设计</h4>
              <p>
                Context 分为 services（基础设施）、ui（界面操作）、session（会话状态）三层，
                职责清晰，便于理解和维护。
              </p>
            </div>

            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--terminal-green)' }}>🔄 动态扩展</h4>
              <p>
                <code>invocation</code> 和 <code>overwriteConfirmed</code> 是可选字段，
                在执行时动态注入，支持命令重试和确认流程。
              </p>
            </div>
          </div>

          <h3>测试 Mock 示例</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/test-utils/mockCommandContext.ts

export const createMockCommandContext = (
  overrides: DeepPartial<CommandContext> = {},
): CommandContext => {
  const defaultMocks: CommandContext = {
    invocation: { raw: '', name: '', args: '' },
    services: {
      config: null,
      settings: { merged: {}, setValue: vi.fn() } as LoadedSettings,
      git: undefined,
      logger: {
        log: vi.fn(),
        logMessage: vi.fn(),
        saveCheckpoint: vi.fn(),
        loadCheckpoint: vi.fn().mockResolvedValue([]),
      } as any,
    },
    ui: {
      addItem: vi.fn(),
      clear: vi.fn(),
      setDebugMessage: vi.fn(),
      pendingItem: null,
      setPendingItem: vi.fn(),
      loadHistory: vi.fn(),
      toggleCorgiMode: vi.fn(),
      toggleVimEnabled: vi.fn(),
      extensionsUpdateState: new Map(),
    } as any,
    session: {
      sessionShellAllowlist: new Set<string>(),
      stats: {
        sessionStartTime: new Date(),
        lastPromptTokenCount: 0,
        metrics: { models: {}, tools: { /* ... */ } },
        promptCount: 0,
      },
    },
  };
  return merge(defaultMocks, overrides);
};`} />
        </section>
      )}

      {/* Loaders Tab */}
      {activeTab === 'loaders' && (
        <section>
          <h2>🔌 命令加载器架构</h2>

          <p>
            Innies CLI 使用<strong>提供者模式</strong>加载命令。三种加载器分别负责不同来源的命令，
            最终由 <code>CommandService</code> 聚合并处理命名冲突。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant App as 🖥️ App
    participant CS as 📦 CommandService
    participant MCP as 🌐 McpPromptLoader
    participant Builtin as 🏗️ BuiltinCommandLoader
    participant File as 📄 FileCommandLoader

    App->>CS: CommandService.create(loaders, signal)

    par 并行加载
        CS->>MCP: loadCommands(signal)
        MCP-->>CS: MCP prompts as commands
    and
        CS->>Builtin: loadCommands(signal)
        Builtin-->>CS: Built-in commands
    and
        CS->>File: loadCommands(signal)
        File-->>CS: TOML file commands
    end

    CS->>CS: 聚合 & 冲突解决
    CS-->>App: CommandService instance

    Note over CS: 扩展命令冲突时重命名为<br/>extensionName.commandName
`} />

          <h3>1. BuiltinCommandLoader - 内置命令</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/services/BuiltinCommandLoader.ts

export class BuiltinCommandLoader implements ICommandLoader {
  constructor(private config: Config | null) {}

  async loadCommands(_signal: AbortSignal): Promise<SlashCommand[]> {
    const allDefinitions: Array<SlashCommand | null> = [
      aboutCommand,
      agentsCommand,
      approvalModeCommand,
      authCommand,
      bugCommand,
      chatCommand,        // 带子命令: save, resume, delete, share
      clearCommand,
      compressCommand,
      // ... 更多内置命令

      // 条件加载示例
      ...(this.config?.getFolderTrust() ? [permissionsCommand] : []),

      // 需要异步初始化的命令
      await ideCommand(),

      // 依赖 config 的命令工厂
      restoreCommand(this.config),
    ];

    return allDefinitions.filter((cmd): cmd is SlashCommand => cmd !== null);
  }
}`} />

          <h3>2. FileCommandLoader - TOML 文件命令</h3>

          <p>支持从三个位置加载自定义命令：用户全局 → 项目级 → 扩展目录</p>

          <CodeBlock language="typescript" code={`// packages/cli/src/services/FileCommandLoader.ts

export class FileCommandLoader implements ICommandLoader {
  private getCommandDirectories(): CommandDirectory[] {
    const dirs: CommandDirectory[] = [];

    // 1. 用户全局命令 (~/.config/innies/commands/)
    dirs.push({ path: Storage.getUserCommandsDir() });

    // 2. 项目级命令 (.innies/commands/)
    dirs.push({ path: storage.getProjectCommandsDir() });

    // 3. 扩展命令 (按字母顺序，便于确定性加载)
    const activeExtensions = this.config
      .getExtensions()
      .filter(ext => ext.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const ext of activeExtensions) {
      dirs.push({
        path: path.join(ext.path, 'commands'),
        extensionName: ext.name,  // 用于冲突重命名
      });
    }

    return dirs;
  }
}`} />

          <h4>TOML 命令文件格式</h4>
          <CodeBlock language="toml" code={`# ~/.config/innies/commands/review.toml

prompt = """
请审查以下代码的质量、安全性和最佳实践:

{{$shell(git diff --cached)}}

{{args}}
"""

description = "审查暂存区的代码变更"

# 支持的占位符:
# {{args}}           - 命令参数
# {{$shell(cmd)}}    - 执行 shell 命令并注入输出
# {{@file}}          - 读取并注入文件内容`} />

          <h3>3. McpPromptLoader - MCP 提示命令</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/services/McpPromptLoader.ts

export class McpPromptLoader implements ICommandLoader {
  loadCommands(_signal: AbortSignal): Promise<SlashCommand[]> {
    const promptCommands: SlashCommand[] = [];
    const mcpServers = this.config.getMcpServers() || {};

    for (const serverName in mcpServers) {
      const prompts = getMCPServerPrompts(this.config, serverName) || [];

      for (const prompt of prompts) {
        promptCommands.push({
          name: prompt.name,
          description: prompt.description || \`Invoke prompt \${prompt.name}\`,
          kind: CommandKind.MCP_PROMPT,
          subCommands: [
            { name: 'help', description: 'Show help for this prompt', /* ... */ }
          ],
          action: async (context, args) => {
            const promptInputs = this.parseArgs(args, prompt.arguments);
            const result = await prompt.invoke(promptInputs);
            return {
              type: 'submit_prompt',
              content: result.messages[0].content.text,
            };
          },
          completion: async (context, partialArg) => {
            // 提供参数自动补全
          },
        });
      }
    }
    return Promise.resolve(promptCommands);
  }
}`} />

          <h3>命名冲突解决</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/services/CommandService.ts

static async create(loaders: ICommandLoader[], signal: AbortSignal) {
  const results = await Promise.allSettled(
    loaders.map(loader => loader.loadCommands(signal))
  );

  const commandMap = new Map<string, SlashCommand>();

  for (const cmd of allCommands) {
    let finalName = cmd.name;

    // 扩展命令冲突时重命名
    if (cmd.extensionName && commandMap.has(cmd.name)) {
      let renamedName = \`\${cmd.extensionName}.\${cmd.name}\`;
      let suffix = 1;

      // 持续尝试直到找到不冲突的名称
      while (commandMap.has(renamedName)) {
        renamedName = \`\${cmd.extensionName}.\${cmd.name}\${suffix}\`;
        suffix++;
      }

      finalName = renamedName;
    }

    commandMap.set(finalName, { ...cmd, name: finalName });
  }

  return new CommandService(Object.freeze(Array.from(commandMap.values())));
}`} />

          <div className="info-box" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderLeft: '4px solid var(--warning-color)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h4 style={{ color: 'var(--warning-color)', margin: '0 0 0.5rem 0' }}>⚠️ 加载顺序影响</h4>
            <p style={{ margin: 0 }}>
              <strong>非扩展命令</strong>（用户/项目）采用"后来者覆盖"策略；
              <strong>扩展命令</strong>冲突时会被重命名为 <code>extensionName.commandName</code>。
            </p>
          </div>
        </section>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <section>
          <h2>🎬 SlashCommandActionReturn 类型</h2>

          <p>
            命令的 <code>action</code> 函数返回不同类型的结果，驱动 UI 层执行相应的操作。
            这是一种<strong>命令模式</strong>的变体，将"做什么"与"怎么做"分离。
          </p>

          <MermaidDiagram chart={`
graph LR
    subgraph Returns["SlashCommandActionReturn"]
        tool["🔧 tool"]
        message["💬 message"]
        quit["🚪 quit"]
        quitConfirm["❓ quit_confirmation"]
        dialog["📑 dialog"]
        loadHistory["📜 load_history"]
        submitPrompt["📤 submit_prompt"]
        confirmShell["🛡️ confirm_shell_commands"]
        confirmAction["✅ confirm_action"]
    end

    tool --> |"调度工具"| ToolScheduler["⚙️ Tool Scheduler"]
    message --> |"显示消息"| UI["🖥️ UI"]
    quit --> |"退出应用"| Exit["🚪 Exit"]
    quitConfirm --> |"显示确认"| QuitDialog["❓ Quit Dialog"]
    dialog --> |"打开对话框"| Dialogs["📑 Various Dialogs"]
    loadHistory --> |"加载历史"| History["📜 History Manager"]
    submitPrompt --> |"提交给 AI"| AI["🤖 AI Model"]
    confirmShell --> |"请求确认"| ShellConfirm["🛡️ Shell Confirm"]
    confirmAction --> |"通用确认"| ActionConfirm["✅ Action Confirm"]

    style Returns fill:#1a1a2e,stroke:#00ff88
`} />

          <h3>完整类型定义</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/ui/commands/types.ts

// 🔧 调度工具执行
export interface ToolActionReturn {
  type: 'tool';
  toolName: string;
  toolArgs: Record<string, unknown>;
}

// 💬 显示消息
export interface MessageActionReturn {
  type: 'message';
  messageType: 'info' | 'error';
  content: string;
}

// 🚪 直接退出
export interface QuitActionReturn {
  type: 'quit';
  messages: HistoryItem[];
}

// ❓ 退出确认
export interface QuitConfirmationActionReturn {
  type: 'quit_confirmation';
  messages: HistoryItem[];
}

// 📑 打开对话框
export interface OpenDialogActionReturn {
  type: 'dialog';
  dialog: 'help' | 'auth' | 'theme' | 'editor' | 'settings'
        | 'model' | 'subagent_create' | 'subagent_list' | 'permissions';
}

// 📜 加载历史记录
export interface LoadHistoryActionReturn {
  type: 'load_history';
  history: HistoryItemWithoutId[];
  clientHistory: Content[];  // AI 客户端的历史格式
}

// 📤 提交提示给 AI
export interface SubmitPromptActionReturn {
  type: 'submit_prompt';
  content: PartListUnion;
}

// 🛡️ Shell 命令确认
export interface ConfirmShellCommandsActionReturn {
  type: 'confirm_shell_commands';
  commandsToConfirm: string[];
  originalInvocation: { raw: string };
}

// ✅ 通用确认
export interface ConfirmActionReturn {
  type: 'confirm_action';
  prompt: ReactNode;
  originalInvocation: { raw: string };
}

export type SlashCommandActionReturn =
  | ToolActionReturn
  | MessageActionReturn
  | QuitActionReturn
  | QuitConfirmationActionReturn
  | OpenDialogActionReturn
  | LoadHistoryActionReturn
  | SubmitPromptActionReturn
  | ConfirmShellCommandsActionReturn
  | ConfirmActionReturn;`} />

          <h3>使用示例</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <div>
              <h4>💬 消息返回</h4>
              <CodeBlock language="typescript" code={`// /chat list 命令
action: async (context): Promise<MessageActionReturn> => {
  const chats = await getSavedChatTags(context, false);
  if (chats.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: 'No saved conversations found.',
    };
  }
  return {
    type: 'message',
    messageType: 'info',
    content: formatChatList(chats),
  };
}`} />
            </div>

            <div>
              <h4>📜 加载历史</h4>
              <CodeBlock language="typescript" code={`// /chat resume 命令
action: async (context, args) => {
  const conversation = await logger.loadCheckpoint(args);
  const uiHistory = convertToUIHistory(conversation);

  return {
    type: 'load_history',
    history: uiHistory,
    clientHistory: conversation,  // 同时设置 AI 客户端
  };
}`} />
            </div>

            <div>
              <h4>✅ 确认流程</h4>
              <CodeBlock language="typescript" code={`// /chat save 命令 - 覆盖确认
action: async (context, args): Promise<SlashCommandActionReturn> => {
  if (!context.overwriteConfirmed) {
    const exists = await logger.checkpointExists(tag);
    if (exists) {
      return {
        type: 'confirm_action',
        prompt: React.createElement(Text, null,
          'Checkpoint ', tag, ' exists. Overwrite?'
        ),
        originalInvocation: {
          raw: context.invocation?.raw || \`/chat save \${tag}\`,
        },
      };
    }
  }
  // 执行保存...
}`} />
            </div>

            <div>
              <h4>📤 提交提示</h4>
              <CodeBlock language="typescript" code={`// MCP 提示命令
action: async (context, args) => {
  const promptInputs = parseArgs(args, prompt.arguments);
  const result = await prompt.invoke(promptInputs);

  return {
    type: 'submit_prompt',
    content: result.messages[0].content.text,
  };
}`} />
            </div>
          </div>
        </section>
      )}

      {/* Flow Tab */}
      {activeTab === 'flow' && (
        <section>
          <h2>🔄 命令执行流程</h2>

          <p>
            <code>useSlashCommandProcessor</code> Hook 是命令系统的核心调度器，
            负责解析输入、匹配命令、构建上下文、执行 action 并处理返回结果。
          </p>

          <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> ParseInput: 用户输入 /command args

    ParseInput --> ValidatePrefix: 提取命令文本
    ValidatePrefix --> NotACommand: 不以 / 或 ? 开头
    ValidatePrefix --> MatchCommand: 匹配命令

    NotACommand --> [*]: return false

    MatchCommand --> CommandFound: 找到匹配
    MatchCommand --> CommandNotFound: 未找到

    CommandNotFound --> ShowError: 显示错误消息
    ShowError --> [*]

    CommandFound --> BuildContext: 构建 fullCommandContext
    BuildContext --> ExecuteAction: 调用 action(context, args)

    ExecuteAction --> ProcessResult: 处理返回值

    state ProcessResult {
        [*] --> CheckType
        CheckType --> HandleTool: type === 'tool'
        CheckType --> HandleMessage: type === 'message'
        CheckType --> HandleDialog: type === 'dialog'
        CheckType --> HandleLoadHistory: type === 'load_history'
        CheckType --> HandleSubmitPrompt: type === 'submit_prompt'
        CheckType --> HandleConfirmShell: type === 'confirm_shell_commands'
        CheckType --> HandleConfirmAction: type === 'confirm_action'
        CheckType --> HandleQuit: type === 'quit'

        HandleConfirmShell --> ShowConfirmDialog
        ShowConfirmDialog --> WaitUserResponse
        WaitUserResponse --> ReExecuteCommand: 用户确认
        WaitUserResponse --> Cancelled: 用户取消
    }

    ProcessResult --> LogEvent: 记录遥测事件
    LogEvent --> [*]
`} />

          <h3>核心处理函数</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/ui/hooks/slashCommandProcessor.ts

const handleSlashCommand = useCallback(
  async (
    rawQuery: PartListUnion,
    oneTimeShellAllowlist?: Set<string>,
    overwriteConfirmed?: boolean,
  ): Promise<SlashCommandProcessorResult | false> => {

    // 1️⃣ 验证是否为斜杠命令
    if (typeof rawQuery !== 'string') return false;
    const trimmed = rawQuery.trim();
    if (!trimmed.startsWith('/') && !trimmed.startsWith('?')) return false;

    setIsProcessing(true);
    addItem({ type: MessageType.USER, text: trimmed }, Date.now());

    // 2️⃣ 解析命令
    const { commandToExecute, args, canonicalPath } = parseSlashCommand(trimmed, commands);

    try {
      if (commandToExecute?.action) {
        // 3️⃣ 构建完整上下文
        const fullCommandContext: CommandContext = {
          ...commandContext,
          invocation: {
            raw: trimmed,
            name: commandToExecute.name,
            args,
          },
          overwriteConfirmed,
        };

        // 4️⃣ 合并一次性 Shell 白名单（用于确认后重试）
        if (oneTimeShellAllowlist?.size > 0) {
          fullCommandContext.session = {
            ...fullCommandContext.session,
            sessionShellAllowlist: new Set([
              ...fullCommandContext.session.sessionShellAllowlist,
              ...oneTimeShellAllowlist,
            ]),
          };
        }

        // 5️⃣ 执行命令
        const result = await commandToExecute.action(fullCommandContext, args);

        // 6️⃣ 处理返回结果
        if (result) {
          switch (result.type) {
            case 'tool':
              return { type: 'schedule_tool', toolName: result.toolName, toolArgs: result.toolArgs };

            case 'message':
              addMessage({ type: result.messageType, content: result.content, timestamp: new Date() });
              return { type: 'handled' };

            case 'dialog':
              actions.openXxxDialog();  // 根据 result.dialog 打开对应对话框
              return { type: 'handled' };

            case 'load_history':
              config?.getGeminiClient()?.setHistory(result.clientHistory);
              fullCommandContext.ui.clear();
              result.history.forEach((item, i) => fullCommandContext.ui.addItem(item, i));
              return { type: 'handled' };

            case 'submit_prompt':
              return { type: 'submit_prompt', content: result.content };

            case 'confirm_shell_commands':
              // 显示 Shell 确认对话框，等待用户响应
              const { outcome, approvedCommands } = await showShellConfirmDialog(result.commandsToConfirm);
              if (outcome === ToolConfirmationOutcome.Cancel) return { type: 'handled' };
              if (outcome === ToolConfirmationOutcome.ProceedAlways) {
                setSessionShellAllowlist(prev => new Set([...prev, ...approvedCommands]));
              }
              // 递归重试命令，带上已批准的命令
              return await handleSlashCommand(result.originalInvocation.raw, new Set(approvedCommands));

            case 'confirm_action':
              const { confirmed } = await showConfirmDialog(result.prompt);
              if (!confirmed) return { type: 'handled' };
              return await handleSlashCommand(result.originalInvocation.raw, undefined, true);

            case 'quit':
              actions.quit(result.messages);
              return { type: 'handled' };
          }
        }
        return { type: 'handled' };
      }
    } catch (e) {
      // 7️⃣ 错误处理 & 遥测
      logSlashCommand(config, makeSlashCommandEvent({ command, status: SlashCommandStatus.ERROR }));
      addItem({ type: MessageType.ERROR, text: e.message }, Date.now());
      return { type: 'handled' };
    } finally {
      logSlashCommand(config, makeSlashCommandEvent({ command, status: SlashCommandStatus.SUCCESS }));
      setIsProcessing(false);
    }
  },
  [/* dependencies */],
);`} />

          <h3>确认流程详解</h3>

          <MermaidDiagram chart={`
sequenceDiagram
    participant User as 👤 用户
    participant Processor as 🔄 SlashCommandProcessor
    participant Command as 📋 Command Action
    participant Dialog as 📑 Confirm Dialog

    User->>Processor: /chat save existing-tag
    Processor->>Command: action(context, "existing-tag")
    Command->>Command: 检测到 checkpoint 已存在
    Command-->>Processor: { type: 'confirm_action', prompt: "Overwrite?", originalInvocation }

    Processor->>Dialog: 显示确认对话框
    Dialog->>User: "Checkpoint exists. Overwrite?"

    alt 用户确认
        User->>Dialog: 点击确认
        Dialog-->>Processor: { confirmed: true }
        Processor->>Processor: handleSlashCommand(raw, undefined, overwriteConfirmed=true)
        Processor->>Command: action(context with overwriteConfirmed=true, args)
        Command->>Command: 跳过存在检查，执行保存
        Command-->>Processor: { type: 'message', content: "Saved!" }
    else 用户取消
        User->>Dialog: 点击取消
        Dialog-->>Processor: { confirmed: false }
        Processor-->>User: "Operation cancelled."
    end
`} />

          <h3>设计亮点</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--terminal-green)' }}>🔄 递归重试</h4>
              <p>
                确认流程通过递归调用 <code>handleSlashCommand</code> 实现，
                传入 <code>oneTimeShellAllowlist</code> 或 <code>overwriteConfirmed</code>
                来修改执行上下文，无需复杂的状态机。
              </p>
            </div>

            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--cyber-blue)' }}>📊 会话级白名单</h4>
              <p>
                <code>sessionShellAllowlist</code> 存储用户在本次会话中批准的 Shell 命令，
                选择 "Proceed Always" 后同类命令不再重复询问。
              </p>
            </div>

            <div className="card" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--purple-accent)' }}>📡 遥测集成</h4>
              <p>
                每个命令执行都会记录遥测事件 (<code>logSlashCommand</code>)，
                包含命令名、子命令、执行状态，便于分析用户行为和错误率。
              </p>
            </div>

            <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--warning-color)' }}>⚡ 热重载</h4>
              <p>
                <code>reloadCommands()</code> 触发命令重新加载，
                IDE 连接状态变化时自动调用，确保命令列表实时更新。
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SlashCommand 结构 */}
      <section style={{ marginTop: '2rem' }}>
        <h2>📋 SlashCommand 接口</h2>

        <CodeBlock language="typescript" code={`// packages/cli/src/ui/commands/types.ts

export enum CommandKind {
  BUILT_IN = 'built-in',   // 内置命令
  FILE = 'file',           // TOML 文件定义
  MCP_PROMPT = 'mcp-prompt', // MCP 服务器提示
}

export interface SlashCommand {
  name: string;           // 命令名，如 "chat"
  altNames?: string[];    // 别名，如 ["load"] for "resume"
  description: string;    // 描述，显示在帮助中
  hidden?: boolean;       // 是否隐藏（不在帮助中显示）

  kind: CommandKind;      // 命令来源类型
  extensionName?: string; // 扩展名（用于冲突重命名）

  // 命令执行函数
  action?: (
    context: CommandContext,
    args: string,
  ) => void | SlashCommandActionReturn | Promise<void | SlashCommandActionReturn>;

  // 参数自动补全
  completion?: (
    context: CommandContext,
    partialArg: string,
  ) => Promise<string[]>;

  // 子命令（如 /chat save, /chat resume）
  subCommands?: SlashCommand[];
}`} />

        <h3>子命令示例</h3>
        <CodeBlock language="typescript" code={`// packages/cli/src/ui/commands/chatCommand.ts

export const chatCommand: SlashCommand = {
  name: 'chat',
  description: 'Manage conversation history.',
  kind: CommandKind.BUILT_IN,
  subCommands: [
    {
      name: 'list',
      description: 'List saved conversation checkpoints',
      kind: CommandKind.BUILT_IN,
      action: async (context): Promise<MessageActionReturn> => { /* ... */ },
    },
    {
      name: 'save',
      description: 'Save the current conversation. Usage: /chat save <tag>',
      kind: CommandKind.BUILT_IN,
      action: async (context, args): Promise<SlashCommandActionReturn> => { /* ... */ },
    },
    {
      name: 'resume',
      altNames: ['load'],  // /chat load 也可以使用
      description: 'Resume a conversation. Usage: /chat resume <tag>',
      kind: CommandKind.BUILT_IN,
      action: async (context, args) => { /* ... */ },
      completion: async (context, partialArg) => {
        // 提供已保存的 tag 列表作为补全建议
        const chats = await getSavedChatTags(context, true);
        return chats.map(c => c.name).filter(name => name.startsWith(partialArg));
      },
    },
    // ...
  ],
};`} />
      </section>

      {/* 相关链接 */}
      <section style={{ marginTop: '2rem' }}>
        <h2>🔗 相关文档</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button onClick={() => navigate('slash-cmd')} className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            transition: 'transform 0.2s',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'var(--cyber-blue)', margin: '0 0 0.5rem 0' }}>💻 斜杠命令</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>命令系统概述</p>
          </button>

          <button onClick={() => navigate('custom-cmd')} className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px',
            transition: 'transform 0.2s',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'var(--purple-accent)', margin: '0 0 0.5rem 0' }}>📝 自定义命令</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>TOML 文件格式详解</p>
          </button>

          <button onClick={() => navigate('mcp')} className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            transition: 'transform 0.2s',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'var(--terminal-green)', margin: '0 0 0.5rem 0' }}>🌐 MCP 集成</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>MCP 提示加载机制</p>
          </button>

          <button onClick={() => navigate('approval-mode')} className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px',
            transition: 'transform 0.2s',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'var(--warning-color)', margin: '0 0 0.5rem 0' }}>🛡️ 审批模式</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Shell 命令确认流程</p>
          </button>
        </div>
      </section>
    </div>
  );
}
