import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

type ToolKind =
  | 'read'
  | 'edit'
  | 'delete'
  | 'move'
  | 'search'
  | 'execute'
  | 'think'
  | 'fetch'
  | 'other';

interface ToolCardProps {
  name: string;
  displayName: string;
  description: string;
  kind: ToolKind;
  params: string[];
  notes?: string;
}

const KIND_META: Record<
  ToolKind,
  { label: string; color: string; border: string; bg: string }
> = {
  read: {
    label: 'Read',
    color: 'text-blue-400',
    border: 'border-blue-400/40',
    bg: 'bg-blue-400/5',
  },
  edit: {
    label: 'Edit',
    color: 'text-amber-400',
    border: 'border-amber-400/40',
    bg: 'bg-amber-400/5',
  },
  delete: {
    label: 'Delete',
    color: 'text-red-400',
    border: 'border-red-400/40',
    bg: 'bg-red-400/5',
  },
  move: {
    label: 'Move',
    color: 'text-purple-400',
    border: 'border-purple-400/40',
    bg: 'bg-purple-400/5',
  },
  search: {
    label: 'Search',
    color: 'text-green-400',
    border: 'border-green-400/40',
    bg: 'bg-green-400/5',
  },
  execute: {
    label: 'Execute',
    color: 'text-orange-400',
    border: 'border-orange-400/40',
    bg: 'bg-orange-400/5',
  },
  think: {
    label: 'Think',
    color: 'text-cyan-400',
    border: 'border-cyan-400/40',
    bg: 'bg-cyan-400/5',
  },
  fetch: {
    label: 'Fetch',
    color: 'text-teal-400',
    border: 'border-teal-400/40',
    bg: 'bg-teal-400/5',
  },
  other: {
    label: 'Other',
    color: 'text-gray-300',
    border: 'border-gray-500/40',
    bg: 'bg-gray-500/5',
  },
};

function ToolCard({ name, displayName, description, kind, params, notes }: ToolCardProps) {
  const meta = KIND_META[kind];
  return (
    <div className={`rounded-lg p-4 border ${meta.border} ${meta.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <code className="text-cyan-400 font-bold">{name}</code>
        <span className={`text-xs px-2 py-1 rounded ${meta.color} bg-black/30`}>{meta.label}</span>
      </div>
      <div className="text-sm text-gray-400 mb-2">{displayName}</div>
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      <div className="text-xs mb-2">
        <span className="text-gray-500">关键参数: </span>
        {params.map((p) => (
          <code key={p} className="bg-black/30 px-1 rounded mr-1">
            {p}
          </code>
        ))}
      </div>
      {notes ? <div className="text-xs text-[var(--text-muted)]">{notes}</div> : null}
    </div>
  );
}

const BUILTIN_TOOL_INDEX: ToolCardProps[] = [
  {
    name: 'read_file',
    displayName: 'Read File',
    kind: 'read',
    description: '读取单个文件（文本/图片/PDF），支持 offset/limit 分段读取；大文件/长行会被截断并提示续读。',
    params: ['file_path', 'offset?', 'limit?'],
  },
  {
    name: 'read_many_files',
    displayName: 'Read Many Files',
    kind: 'read',
    description: '按 glob 规则批量读取并拼接多个文件（用于快速补齐上下文）。',
    params: ['include[]', 'exclude[]?', 'useDefaultExcludes?'],
    notes:
      '注意：当前上游实现包含该工具与名称常量，但默认 createToolRegistry() 里未注册（可用性取决于具体版本/配置）。',
  },
  {
    name: 'list_directory',
    displayName: 'List Directory',
    kind: 'search',
    description: '列出目录条目并做文件过滤（.gitignore/.geminiignore + ignore patterns）。',
    params: ['dir_path', 'ignore[]?', 'file_filtering_options?'],
  },
  {
    name: 'glob',
    displayName: 'Glob',
    kind: 'search',
    description: '按 glob 模式在工作区目录中查找文件，可选择大小写与 ignore 策略。',
    params: ['pattern', 'dir_path?', 'respect_git_ignore?'],
  },
  {
    name: 'search_file_content',
    displayName: 'Grep / RipGrep',
    kind: 'search',
    description: '在文件内容中搜索正则匹配；在部分平台会自动选择 ripgrep 或内置 grep 实现（对模型同名）。',
    params: ['pattern', 'dir_path?', 'include?'],
  },
  {
    name: 'replace',
    displayName: 'Smart Edit (Replace)',
    kind: 'edit',
    description: '基于 old_string/new_string 的替换式编辑；会校正、生成 diff，并可走 IDE diff 或用户确认。',
    params: ['file_path', 'old_string', 'new_string', 'expected_replacements?'],
  },
  {
    name: 'write_file',
    displayName: 'Write File',
    kind: 'edit',
    description: '写入/创建文件；确认阶段展示 patch diff，并支持 AUTO_EDIT/IDE diff 等路径。',
    params: ['file_path', 'content'],
  },
  {
    name: 'run_shell_command',
    displayName: 'Shell',
    kind: 'execute',
    description: '执行 shell 命令；PolicyEngine 会拆分子命令、检测重定向并按规则决定 ALLOW/ASK/DENY。',
    params: ['command', 'dir_path?', 'description?'],
  },
  {
    name: 'web_fetch',
    displayName: 'Web Fetch',
    kind: 'fetch',
    description: '从 prompt 中提取 URL 并抓取网页内容，必要时 fallback 与重试；输出会被截断到上限。',
    params: ['prompt'],
  },
  {
    name: 'google_web_search',
    displayName: 'Web Search',
    kind: 'search',
    description: '调用 web-search 模型进行检索并返回带引用标记的结果与 sources。',
    params: ['query'],
  },
  {
    name: 'save_memory',
    displayName: 'Save Memory',
    kind: 'think',
    description: '把“长期事实”写入用户记忆文件（GEMINI.md），用于跨会话个性化。',
    params: ['fact'],
  },
  {
    name: 'write_todos',
    displayName: 'Write TODOs',
    kind: 'other',
    description: '把结构化 todos 写入 UI 状态（用于让模型显式管理任务拆分与进度）。',
    params: ['todos[]'],
  },
  {
    name: 'activate_skill',
    displayName: 'Activate Skill',
    kind: 'other',
    description:
      '激活技能（SKILL.md），把技能指令与资源目录结构封装进 <ACTIVATED_SKILL> 返回给模型。',
    params: ['name'],
  },
  {
    name: 'delegate_to_agent',
    displayName: 'Delegate to Agent',
    kind: 'think',
    description: '委托给子代理/子任务（schema 根据 agent 注册动态生成）。',
    params: ['agent_name', '...agentInputs'],
  },
];

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--amber)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔧</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {isExpanded ? (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🎯 这套系统解决什么问题？</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              工具系统是 Gemini CLI 与“外部世界”（文件系统、Shell、网络、MCP 服务、技能库）交互的桥梁。模型不直接操作环境，而是输出{' '}
              <code>functionCall</code>；CLI 负责验证、审批、执行，并把执行结果以 <code>functionResponse</code> 回注给模型继续生成（continuation）。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🧩 三层对象：Tool / Invocation / Scheduler</h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>DeclarativeTool</strong>：声明工具元信息 + JSON Schema（发给模型）</li>
              <li>• <strong>ToolInvocation</strong>：一次具体调用（已校验 params + 可执行）</li>
              <li>• <strong>CoreToolScheduler</strong>：把工具调用排队/执行，并生成 functionResponse</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🔐 “是否需要确认”不是写死的</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              Gemini CLI 通过 <code>PolicyEngine</code> + <code>MessageBus</code> 决策：ALLOW / ASK_USER / DENY。
              工具的 <code>Kind</code>（9 类）是重要输入，但最终以 policy rules、approvalMode、命令解析（shell）等综合结果为准。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">14</div>
              <div className="text-xs text-[var(--text-muted)]">内置工具名常量</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">9</div>
              <div className="text-xs text-[var(--text-muted)]">Kind 分类</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">MCP / discovered_tool_</div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-2 rounded flex items-center gap-2">
            <span>📁</span>
            <code>packages/core/src/tools/</code>
            <span className="opacity-70">（工具实现）</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ToolSystemArchitecture() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const relatedPages: RelatedPage[] = [
    { id: 'tool-reference', label: '工具参考', description: '参数与清单' },
    { id: 'tool-scheduler', label: '工具调度器', description: '并发与状态机' },
    { id: 'policy-engine', label: 'PolicyEngine', description: 'ALLOW/ASK/DENY' },
    { id: 'approval-mode', label: '审批模式', description: 'ApprovalMode 行为' },
    { id: 'mcp', label: 'MCP 集成', description: '外部工具协议' },
    { id: 'agent-skills', label: 'Agent Skills', description: '技能注入机制' },
  ];

  const toolLoopDiagram = `sequenceDiagram
    participant M as Model
    participant C as GeminiClient
    participant T as Turn.run()
    participant S as CoreToolScheduler
    participant R as ToolRegistry
    participant I as ToolInvocation

    M->>C: stream events (parts / functionCalls)
    C->>T: decode + emit GeminiEventType.*
    alt ToolCallRequest
      T->>S: schedule(requests)
      S->>R: getTool(name)
      R-->>S: DeclarativeTool
      S->>I: tool.build(args)
      I->>I: shouldConfirmExecute() (PolicyEngine via MessageBus)
      I-->>S: confirmationDetails? / false
      S->>I: execute(signal, updateOutput?)
      I-->>S: ToolResult
      S-->>T: functionResponse parts (continuation)
      T-->>M: send continuation
    end
    M-->>C: Finished (finishReason + usageMetadata)`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <h2 className="text-2xl text-cyan-400 mb-5">工具系统架构（对齐上游 gemini-cli）</h2>

      <Layer title="主链路：模型 → 工具 → 继续生成" icon="🔁">
        <MermaidDiagram chart={toolLoopDiagram} />
        <div className="mt-4 text-sm text-[var(--text-secondary)]">
          关键点：Gemini CLI 直接消费 <code>AsyncGenerator</code> 的结构化事件，并用 <code>functionResponse</code> 做 continuation；
          不是去解析 OpenAI 的 SSE/tool_calls 增量 JSON。
        </div>
      </Layer>

      <Layer title="注册：Config.createToolRegistry()" icon="🧩">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          上游的“哪些工具可用”主要由 <code>Config.createToolRegistry()</code> 组装：注册核心工具、按条件切换实现（ripgrep fallback）、
          按配置开关启用 write_todos / agents，并在最后执行动态发现（discovered tools）。
        </p>
        <CodeBlock
          title="packages/core/src/config/config.ts (节选)"
          code={`async createToolRegistry(): Promise<ToolRegistry> {
  const registry = new ToolRegistry(this);
  registry.setMessageBus(this.messageBus);

  const registerCoreTool = (ToolClass: any, ...args: unknown[]) => {
    const toolName = ToolClass.Name || ToolClass.name;
    const coreTools = this.getCoreTools();
    const isEnabled =
      !coreTools || coreTools.some((t) => t === toolName || t.startsWith(\`\${toolName}(\`));
    if (isEnabled) registry.registerTool(new ToolClass(...args, this.getMessageBus()));
  };

  registerCoreTool(LSTool, this);
  registerCoreTool(ReadFileTool, this);

  if (this.getUseRipgrep() && (await canUseRipgrep())) {
    registerCoreTool(RipGrepTool, this);
  } else {
    registerCoreTool(GrepTool, this);
  }

  registerCoreTool(GlobTool, this);
  registerCoreTool(ActivateSkillTool, this);
  registerCoreTool(SmartEditTool, this);    // tool name: "replace"
  registerCoreTool(WriteFileTool, this);
  registerCoreTool(WebFetchTool, this);
  registerCoreTool(ShellTool, this);
  registerCoreTool(MemoryTool);
  registerCoreTool(WebSearchTool, this);
  if (this.getUseWriteTodos()) registerCoreTool(WriteTodosTool, this);

  if (this.isAgentsEnabled()) {
    const allowedTools = this.getAllowedTools();
    if (!allowedTools || allowedTools.includes(DELEGATE_TO_AGENT_TOOL_NAME)) {
      registry.registerTool(new DelegateToAgentTool(this.agentRegistry, this, this.getMessageBus()));
    }
  }

  await registry.discoverAllTools(); // discovered_tool_*
  registry.sortTools();
  return registry;
}`}
        />
      </Layer>

      <Layer title="工具定义：DeclarativeTool / BaseDeclarativeTool" icon="📜">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          工具的 schema 会作为 <code>FunctionDeclaration</code> 发给模型。<code>BaseDeclarativeTool</code> 提供“先 schema 校验、再生成 invocation”的标准路径。
        </p>
        <CodeBlock
          title="packages/core/src/tools/tools.ts (节选)"
          code={`export abstract class DeclarativeTool<TParams extends object, TResult extends ToolResult> {
  constructor(
    readonly name: string,
    readonly displayName: string,
    readonly description: string,
    readonly kind: Kind,
    readonly parameterSchema: unknown,
  ) {}

  get schema(): FunctionDeclaration {
    return { name: this.name, description: this.description, parametersJsonSchema: this.parameterSchema };
  }

  abstract build(params: TParams): ToolInvocation<TParams, TResult>;
}

export abstract class BaseDeclarativeTool<TParams extends object, TResult extends ToolResult>
  extends DeclarativeTool<TParams, TResult> {
  build(params: TParams): ToolInvocation<TParams, TResult> {
    const errors = SchemaValidator.validate(this.schema.parametersJsonSchema, params);
    if (errors) throw new Error(errors);
    return this.createInvocation(params, this.messageBus, this.name, this.displayName);
  }
}`}
        />
      </Layer>

      <Layer title="调用与确认：BaseToolInvocation.shouldConfirmExecute()" icon="🔐">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Invocation 层负责把 “PolicyEngine 的决策”翻译成三种行为：直接执行、抛错拒绝、返回 confirmationDetails 交给 UI。并且用户选择
          “总是允许/保存规则”会通过 <code>UPDATE_POLICY</code> 写入用户策略文件。
        </p>
        <CodeBlock
          title="packages/core/src/tools/tools.ts (节选)"
          code={`async shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false> {
  if (this.messageBus) {
    const decision = await this.getMessageBusDecision(abortSignal); // ALLOW / DENY / ASK_USER
    if (decision === 'ALLOW') return false;
    if (decision === 'DENY') throw new Error(\`Tool execution for "\${this._toolName}" denied by policy.\`);
    if (decision === 'ASK_USER') return this.getConfirmationDetails(abortSignal);
  }
  return this.getConfirmationDetails(abortSignal);
}`}
        />
        <JsonBlock
          code={`# policy rules (示例，TOML)
# user policies: ~/.gemini/policy/auto-saved.toml

[[rule]]
toolName = "run_shell_command"
decision = "allow"
priority = 100
commandPrefix = ["git", "npm"]`}
        />
      </Layer>

      <Layer title="ToolRegistry：内置 + discovered + MCP" icon="🗂️">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          ToolRegistry 维护“模型看到的工具集合”。它会把 Built-in、discovered_tool_*、以及 MCP server__tool 放进同一个注册表，并用稳定排序确保顺序一致。
        </p>
        <CodeBlock
          title="packages/core/src/tools/tool-registry.ts (节选)"
          code={`export class ToolRegistry {
  private allKnownTools: Map<string, AnyDeclarativeTool> = new Map();

  registerTool(tool: AnyDeclarativeTool): void {
    this.allKnownTools.set(tool.name, tool);
  }

  async discoverAllTools(): Promise<void> {
    // remove previous discovered tools, then run toolDiscoveryCommand
    await this.discoverAndRegisterToolsFromCommand();
  }

  sortTools(): void {
    // 0: built-in, 1: discovered_tool_*, 2: MCP server__tool (按 serverName 排序)
  }
}`}
        />
        <HighlightBox title="命名规则速记" icon="🧠" variant="green">
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li><code>ALL_BUILTIN_TOOL_NAMES</code>：内置工具“名称常量表”（14 个）</li>
            <li>
              <code>discovered_tool_&lt;name&gt;</code>：通过 toolDiscoveryCommand 发现的工具（本地子进程）
            </li>
            <li>
              <code>&lt;server&gt;__&lt;tool&gt;</code>：MCP 工具（server 与 tool 做 slug 校验，支持 <code>server__*</code>）
            </li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="内置工具索引（名称常量 = 14）" icon="🛠️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUILTIN_TOOL_INDEX.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>
        <div className="mt-4 text-sm text-[var(--text-secondary)]">
          这些是“名称常量表”。实际会话中是否可用，还会受到 <code>coreTools</code> / <code>allowedTools</code> / 平台能力（ripgrep）/ 是否启用 agents 等影响。
        </div>
        <JsonBlock
          code={`// packages/core/src/tools/tool-names.ts
export const ALL_BUILTIN_TOOL_NAMES = [
  "glob",
  "write_todos",
  "write_file",
  "google_web_search",
  "web_fetch",
  "replace",
  "run_shell_command",
  "search_file_content",
  "read_many_files",
  "read_file",
  "list_directory",
  "save_memory",
  "activate_skill",
  "delegate_to_agent",
] as const;`}
        />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
