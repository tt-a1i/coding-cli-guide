import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

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
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              工具系统是 CLI 与外部世界交互的桥梁。AI 通过调用工具来读取文件、执行命令、搜索代码等。
              工具系统负责：工具注册与发现、参数校验、权限控制、并发调度、结果收集。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🔧 设计原则</h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>ToolKind 分类</strong>：根据危险等级分为 Read/Write/Execute，决定审批策略</li>
              <li>• <strong>声明式定义</strong>：每个工具通过 schema 描述参数和返回值</li>
              <li>• <strong>可扩展性</strong>：支持 MCP 协议动态注册外部工具</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🏗️ 工具类型</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-green-400/30 text-center">
                <div className="text-green-400 font-semibold text-sm">ReadOnly</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Read, Glob, Grep<br/>自动批准</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--amber)]/30 text-center">
                <div className="text-[var(--amber)] font-semibold text-sm">WriteFiles</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Edit, Write<br/>需要确认</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-red-400/30 text-center">
                <div className="text-red-400 font-semibold text-sm">Bash</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">命令执行<br/>高危操作</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">20+</div>
              <div className="text-xs text-[var(--text-muted)]">内置工具</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">ToolKind 类型</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">MCP 扩展</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--purple)]">5</div>
              <div className="text-xs text-[var(--text-muted)]">并发限制</div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-2 rounded flex items-center gap-2">
            <span>📁</span>
            <code>packages/core/src/tools/</code>
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolCardProps {
  name: string;
  displayName: string;
  description: string;
  kind: 'read' | 'write' | 'execute';
  params: string[];
}

function ToolCard({ name, displayName, description, kind, params }: ToolCardProps) {
  const kindColors = {
    read: 'border-green-400/50 bg-green-400/5',
    write: 'border-orange-400/50 bg-orange-400/5',
    execute: 'border-red-400/50 bg-red-400/5'
  };

  const kindLabels = {
    read: { text: '读取', color: 'text-green-400' },
    write: { text: '写入', color: 'text-orange-400' },
    execute: { text: '执行', color: 'text-red-400' }
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${kindColors[kind]}`}>
      <div className="flex items-center justify-between mb-2">
        <code className="text-cyan-400 font-bold">{name}</code>
        <span className={`text-xs px-2 py-1 rounded ${kindLabels[kind].color} bg-black/30`}>
          {kindLabels[kind].text}
        </span>
      </div>
      <div className="text-sm text-gray-400 mb-2">{displayName}</div>
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      <div className="text-xs">
        <span className="text-gray-500">参数: </span>
        {params.map((p, i) => (
          <code key={i} className="bg-black/30 px-1 rounded mr-1">{p}</code>
        ))}
      </div>
    </div>
  );
}

export function ToolSystemArchitecture() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const relatedPages: RelatedPage[] = [
    { id: 'tool-detail', label: '工具详情', description: '各工具实现细节' },
    { id: 'tool-scheduler', label: '工具调度器', description: '并发调度机制' },
    { id: 'mcp', label: 'MCP集成', description: '外部工具协议' },
    { id: 'interaction-loop', label: '交互循环', description: '工具调用入口' },
    { id: 'approval-mode', label: '审批模式', description: '工具权限控制' },
    { id: 'extension', label: '扩展系统', description: '工具扩展机制' },
  ];

  return (
    <div>
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <h2 className="text-2xl text-cyan-400 mb-5">工具系统架构详解</h2>

      {/* 核心概念 */}
      <Layer title="工具系统核心概念" icon="🧠">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="text-cyan-400 font-bold">ToolRegistry</h4>
            <p className="text-sm text-gray-400">工具注册表，管理所有可用工具</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔧</div>
            <h4 className="text-cyan-400 font-bold">DeclarativeTool</h4>
            <p className="text-sm text-gray-400">工具基类，定义工具接口</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="text-cyan-400 font-bold">ToolInvocation</h4>
            <p className="text-sm text-gray-400">工具调用实例，执行具体操作</p>
          </div>
        </div>
      </Layer>

      {/* ToolRegistry */}
      <Layer title="ToolRegistry 工具注册表" icon="📚">
        <CodeBlock
          title="packages/core/src/tools/tool-registry.ts"
          code={`export class ToolRegistry {
    private tools: Map<string, AnyDeclarativeTool> = new Map();

    // 注册工具
    registerTool(tool: DeclarativeTool): void {
        if (this.tools.has(tool.name)) {
            throw new Error(\`Tool already registered: \${tool.name}\`);
        }
        this.tools.set(tool.name, tool);
    }

    // 获取单个工具
    getTool(name: string): AnyDeclarativeTool | undefined {
        return this.tools.get(name);
    }

    // 获取所有工具
    getAllTools(): AnyDeclarativeTool[] {
        return Array.from(this.tools.values());
    }

    // 按类型获取工具
    getToolsByKind(kind: Kind): AnyDeclarativeTool[] {
        return this.getAllTools().filter(t => t.kind === kind);
    }

    // 获取工具定义（用于发送给 AI）
    getAllToolDefinitions(): FunctionDeclaration[] {
        return this.getAllTools().map(t => t.schema);
    }
}`}
        />
      </Layer>

      {/* BaseDeclarativeTool */}
      <Layer title="BaseDeclarativeTool 工具基类" icon="🔧">
        <CodeBlock
          title="工具基类结构"
          code={`abstract class BaseDeclarativeTool<TParams, TResult> {
    // 工具元数据
    abstract readonly name: string;           // 内部名称 "read_file"
    abstract readonly displayName: string;    // 显示名称 "Read File"
    abstract readonly description: string;    // 描述（发送给 AI）
    abstract readonly kind: Kind;             // 类型: read | write | execute
    abstract readonly schema: FunctionDeclaration;  // JSON Schema

    // 输出配置
    readonly isOutputMarkdown: boolean = false;
    readonly canUpdateOutput: boolean = false;  // 是否支持流式更新

    // 构建调用实例
    build(params: TParams): ToolInvocation<TParams, TResult> {
        // 1. 验证参数
        const error = this.validateParams(params);
        if (error) {
            throw new ToolValidationError(error);
        }

        // 2. 创建调用实例
        return this.createInvocation(params);
    }

    // 子类实现
    protected abstract validateParams(params: TParams): string | null;
    protected abstract createInvocation(
        params: TParams
    ): ToolInvocation<TParams, TResult>;
}`}
        />
      </Layer>

      {/* ToolInvocation */}
      <Layer title="ToolInvocation 调用实例" icon="⚡">
        <CodeBlock
          title="调用实例接口"
          code={`abstract class ToolInvocation<TParams, TResult> {
    readonly params: TParams;

    // 执行前的描述（显示给用户）
    abstract getDescription(): string;

    // 返回影响的文件路径（用于权限检查）
    abstract toolLocations(): string[];

    // 是否需要用户确认
    shouldConfirmExecute(): boolean {
        return false;  // 默认不需要
    }

    // 执行工具
    abstract execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void  // 流式更新回调
    ): Promise<TResult>;
}

// 执行结果
interface ToolResult {
    llmContent: string;      // 发送给 AI 的内容
    returnDisplay: string;   // 显示在终端的内容
}`}
        />
      </Layer>

      {/* 工具类型 */}
      <Layer title="工具类型 (Kind)" icon="📊">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">📖 Read (读取)</h4>
            <p className="text-sm text-gray-300 mb-2">只读操作，不修改任何内容</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 通常自动执行</li>
              <li>• 不需要用户确认</li>
              <li>• 示例: read_file, glob, grep_search</li>
            </ul>
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">✏️ Write (写入)</h4>
            <p className="text-sm text-gray-300 mb-2">修改文件内容</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 可能需要确认</li>
              <li>• 显示 diff 预览</li>
              <li>• 示例: write_file, edit</li>
            </ul>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">💻 Execute (执行)</h4>
            <p className="text-sm text-gray-300 mb-2">执行系统命令</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 通常需要确认</li>
              <li>• 可能进入沙箱</li>
              <li>• 示例: run_shell_command, task</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 内置工具列表 */}
      <Layer title="内置工具列表" icon="🛠️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToolCard
            name="read_file"
            displayName="Read File"
            description="读取文件内容，支持偏移和行数限制"
            kind="read"
            params={['absolute_path', 'offset?', 'limit?']}
          />
          <ToolCard
            name="write_file"
            displayName="Write File"
            description="写入或创建文件"
            kind="write"
            params={['file_path', 'content']}
          />
          <ToolCard
            name="edit"
            displayName="Edit File"
            description="通过字符串替换编辑文件"
            kind="write"
            params={['file_path', 'old_string', 'new_string']}
          />
          <ToolCard
            name="run_shell_command"
            displayName="Shell"
            description="执行 shell 命令"
            kind="execute"
            params={['command', 'is_background?', 'directory?']}
          />
          <ToolCard
            name="glob"
            displayName="Glob"
            description="使用 glob 模式匹配文件"
            kind="read"
            params={['pattern', 'path?']}
          />
          <ToolCard
            name="grep_search"
            displayName="Grep"
            description="在文件中搜索文本"
            kind="read"
            params={['pattern', 'path?', 'include?']}
          />
          <ToolCard
            name="task"
            displayName="Task"
            description="创建子任务或代理"
            kind="execute"
            params={['description', 'prompt']}
          />
          <ToolCard
            name="web_search"
            displayName="Web Search"
            description="搜索网页内容"
            kind="read"
            params={['query', 'max_results?']}
          />
        </div>
      </Layer>

      {/* 工具实现示例 */}
      <Layer title="工具实现示例：ReadFileTool" icon="📖">
        <CodeBlock
          title="packages/core/src/tools/read-file.ts"
          code={`export class ReadFileTool extends BaseDeclarativeTool<
    ReadFileParams,
    ReadFileResult
> {
    readonly name = 'read_file';
    readonly displayName = 'Read File';
    readonly description = '读取文件内容。可以指定偏移和行数限制。';
    readonly kind: Kind = 'read';

    readonly schema: FunctionDeclaration = {
        name: 'read_file',
        description: this.description,
        parameters: {
            type: 'object',
            properties: {
                absolute_path: {
                    type: 'string',
                    description: '要读取的文件的绝对路径'
                },
                offset: {
                    type: 'number',
                    description: '开始读取的行号（从 0 开始）'
                },
                limit: {
                    type: 'number',
                    description: '要读取的最大行数'
                }
            },
            required: ['absolute_path']
        }
    };

    protected validateParams(params: ReadFileParams): string | null {
        if (!params.absolute_path) {
            return '路径不能为空';
        }
        if (!path.isAbsolute(params.absolute_path)) {
            return '必须是绝对路径';
        }
        if (!this.isPathAllowed(params.absolute_path)) {
            return '路径不在允许的范围内';
        }
        return null;
    }

    protected createInvocation(params: ReadFileParams) {
        return new ReadFileToolInvocation(params, this.config);
    }
}`}
        />

        <CodeBlock
          title="ReadFileToolInvocation"
          code={`class ReadFileToolInvocation extends ToolInvocation<
    ReadFileParams,
    ReadFileResult
> {
    getDescription(): string {
        return \`读取文件: \${this.params.absolute_path}\`;
    }

    toolLocations(): string[] {
        return [this.params.absolute_path];
    }

    async execute(signal: AbortSignal): Promise<ReadFileResult> {
        const { absolute_path, offset = 0, limit } = this.params;

        // 读取文件
        const content = await fs.readFile(absolute_path, 'utf-8');
        const lines = content.split('\\n');

        // 应用偏移和限制
        const selectedLines = limit
            ? lines.slice(offset, offset + limit)
            : lines.slice(offset);

        const result = selectedLines.join('\\n');

        return {
            llmContent: result,  // 发送给 AI
            returnDisplay: \`读取了 \${selectedLines.length} 行\`
        };
    }
}`}
        />
      </Layer>

      {/* 工具调度器 */}
      <Layer title="CoreToolScheduler 工具调度器" icon="📋">
        <CodeBlock
          title="工具调度流程"
          code={`class CoreToolScheduler {
    private queue: ToolCallInfo[] = [];
    private executing: Map<string, ToolCallInfo> = new Map();

    // 调度工具调用
    async scheduleToolCall(request: ToolCallRequest): Promise<void> {
        const info: ToolCallInfo = {
            id: request.id,
            name: request.name,
            args: request.args,
            status: 'validating'
        };

        // 1. 验证阶段
        const tool = this.toolRegistry.getTool(info.name);
        if (!tool) {
            info.status = 'error';
            info.error = \`Unknown tool: \${info.name}\`;
            return;
        }

        try {
            const invocation = tool.build(info.args);
            info.invocation = invocation;
            info.status = 'scheduled';
        } catch (e) {
            info.status = 'error';
            info.error = e.message;
            return;
        }

        // 2. 检查是否需要确认
        if (invocation.shouldConfirmExecute()) {
            info.status = 'awaiting_approval';
            await this.requestApproval(info);
        }

        // 3. 执行
        info.status = 'executing';
        this.executing.set(info.id, info);

        try {
            const result = await invocation.execute(this.signal);
            info.result = result;
            info.status = 'success';
        } catch (e) {
            info.error = e.message;
            info.status = 'error';
        }

        this.executing.delete(info.id);
    }
}`}
        />
      </Layer>

      {/* 权限和安全 */}
      <Layer title="权限和安全机制" icon="🔐">
        <HighlightBox title="工具权限控制" icon="🛡️" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>路径限制</strong>: 只能访问工作区内的文件</li>
            <li><strong>命令白名单</strong>: 某些命令自动批准</li>
            <li><strong>用户确认</strong>: 危险操作需要确认</li>
            <li><strong>沙箱执行</strong>: 可选的隔离环境</li>
          </ul>
        </HighlightBox>

        <JsonBlock
          code={`# 真实配置结构 (settings.toml)
# 来源: packages/cli/src/config/settings.ts

[tools]
# 全局允许列表 - 自动批准
core = [
    "read_file",                    # 读取文件自动批准
    "glob",                         # 文件搜索自动批准
    "grep_search",                  # 内容搜索自动批准
    "run_shell_command(git *)",     # git 命令自动批准
    "run_shell_command(npm test)",  # npm test 自动批准
]

# 全局阻止列表 - 硬拒绝
exclude = [
    "run_shell_command(rm -rf *)",  # 危险删除
    "run_shell_command(sudo *)",    # 提权命令
]

# 工作区允许列表 (在 .gemini/settings.toml)
allowed = [
    "run_shell_command(./scripts/*)",  # 项目脚本
]`}
        />
      </Layer>

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" icon="🔬">
        <p className="text-[var(--text-secondary)] mb-6">
          工具系统作为 AI 与外部世界的桥梁，需要处理各种极端情况和边界条件。
          本节深入分析常见的边界场景及其正确处理方式。
        </p>

        {/* 边界条件 1: 工具参数验证 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-red-400 font-bold flex items-center gap-2">
              <span>1️⃣</span> 参数验证边界
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 生成的工具参数可能存在各种问题：类型错误、缺失必需字段、格式不符等。
              validateParams 方法需要全面检查所有边界情况。
            </p>
            <CodeBlock
              title="参数验证的完整检查链"
              code={`protected validateParams(params: unknown): string | null {
    // 1. 类型检查 - AI 可能传入错误类型
    if (typeof params !== 'object' || params === null) {
        return 'Parameters must be an object';
    }

    const p = params as ReadFileParams;

    // 2. 必需字段检查
    if (!p.absolute_path) {
        return 'absolute_path is required';
    }

    // 3. 类型细化
    if (typeof p.absolute_path !== 'string') {
        return 'absolute_path must be a string';
    }

    // 4. 路径规范化 - 处理 Windows/Unix 差异
    const normalizedPath = path.normalize(p.absolute_path);

    // 5. 绝对路径检查
    if (!path.isAbsolute(normalizedPath)) {
        return \`Path must be absolute, got: \${p.absolute_path}\`;
    }

    // 6. 路径穿越攻击检测
    if (normalizedPath.includes('..')) {
        return 'Path traversal is not allowed';
    }

    // 7. 特殊字符检测 (防止命令注入)
    const dangerousChars = /[\\x00-\\x1f\\|&;$\`]/;
    if (dangerousChars.test(p.absolute_path)) {
        return 'Path contains dangerous characters';
    }

    // 8. 可选参数类型检查
    if (p.offset !== undefined) {
        if (typeof p.offset !== 'number' || !Number.isInteger(p.offset)) {
            return 'offset must be an integer';
        }
        if (p.offset < 0) {
            return 'offset cannot be negative';
        }
    }

    if (p.limit !== undefined) {
        if (typeof p.limit !== 'number' || !Number.isInteger(p.limit)) {
            return 'limit must be an integer';
        }
        if (p.limit <= 0) {
            return 'limit must be positive';
        }
        // 防止内存耗尽
        if (p.limit > MAX_LINES_LIMIT) {
            return \`limit exceeds maximum of \${MAX_LINES_LIMIT}\`;
        }
    }

    // 9. 工作区权限检查
    if (!this.isPathInWorkspace(normalizedPath)) {
        return 'Path is outside the workspace';
    }

    return null;  // 验证通过
}`}
            />
            <HighlightBox title="参数验证最佳实践" icon="💡" variant="green">
              <ul className="text-sm space-y-2">
                <li><strong>防御性编程</strong>：永远不要信任 AI 传入的参数</li>
                <li><strong>详细错误信息</strong>：返回具体的错误原因，帮助 AI 修正</li>
                <li><strong>规范化处理</strong>：统一路径格式，处理系统差异</li>
                <li><strong>安全第一</strong>：路径穿越、命令注入检测是硬性要求</li>
              </ul>
            </HighlightBox>
          </div>
        </div>

        {/* 边界条件 2: 文件系统操作 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-amber-400 font-bold flex items-center gap-2">
              <span>2️⃣</span> 文件系统边界
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              文件读写涉及大量边界情况：文件不存在、权限不足、文件被锁定、
              符号链接、二进制文件、超大文件等。
            </p>
            <CodeBlock
              title="文件读取的完整边界处理"
              code={`async execute(signal: AbortSignal): Promise<ReadFileResult> {
    const { absolute_path, offset = 0, limit } = this.params;

    try {
        // 1. 检查文件是否存在
        const stat = await fs.stat(absolute_path).catch(() => null);
        if (!stat) {
            return {
                llmContent: \`Error: File not found: \${absolute_path}\`,
                returnDisplay: '❌ 文件不存在'
            };
        }

        // 2. 检查是否是目录
        if (stat.isDirectory()) {
            return {
                llmContent: \`Error: Path is a directory, not a file: \${absolute_path}\`,
                returnDisplay: '❌ 路径是目录'
            };
        }

        // 3. 检查符号链接（解析真实路径）
        if (stat.isSymbolicLink()) {
            const realPath = await fs.realpath(absolute_path);
            // 确保真实路径也在工作区内
            if (!this.isPathInWorkspace(realPath)) {
                return {
                    llmContent: \`Error: Symlink target is outside workspace\`,
                    returnDisplay: '❌ 符号链接指向工作区外'
                };
            }
        }

        // 4. 检查文件大小
        const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB
        if (stat.size > MAX_FILE_SIZE) {
            return {
                llmContent: \`File too large: \${(stat.size / 1024 / 1024).toFixed(2)}MB. \\
Use offset/limit to read portions.\`,
                returnDisplay: \`⚠️ 文件过大 (\${(stat.size / 1024 / 1024).toFixed(2)}MB)\`
            };
        }

        // 5. 检测二进制文件
        const isBinary = await this.detectBinaryFile(absolute_path);
        if (isBinary) {
            return {
                llmContent: \`Error: Binary file detected. Cannot read binary files.\`,
                returnDisplay: '❌ 二进制文件'
            };
        }

        // 6. 处理编码（尝试多种编码）
        let content: string;
        try {
            content = await fs.readFile(absolute_path, 'utf-8');
        } catch (e) {
            if (e.code === 'ERR_ENCODING_INVALID_ENCODED_DATA') {
                // 尝试其他编码
                const buffer = await fs.readFile(absolute_path);
                content = iconv.decode(buffer, 'gbk');  // 尝试 GBK
            } else {
                throw e;
            }
        }

        // 7. 处理超长行（截断）
        const MAX_LINE_LENGTH = 2000;
        const lines = content.split('\\n').map(line =>
            line.length > MAX_LINE_LENGTH
                ? line.slice(0, MAX_LINE_LENGTH) + '...[truncated]'
                : line
        );

        // 8. 应用 offset 和 limit
        const totalLines = lines.length;
        const selectedLines = limit
            ? lines.slice(offset, offset + limit)
            : lines.slice(offset);

        // 9. 处理空文件
        if (totalLines === 0 || (totalLines === 1 && lines[0] === '')) {
            return {
                llmContent: '[Empty file]',
                returnDisplay: '📄 空文件'
            };
        }

        // 10. 格式化输出（带行号）
        const formattedContent = selectedLines
            .map((line, i) => \`\${String(offset + i + 1).padStart(6)}→\${line}\`)
            .join('\\n');

        return {
            llmContent: formattedContent,
            returnDisplay: \`读取了 \${selectedLines.length}/\${totalLines} 行\`
        };

    } catch (error) {
        // 11. 分类处理各种错误
        if (error.code === 'EACCES') {
            return {
                llmContent: \`Error: Permission denied: \${absolute_path}\`,
                returnDisplay: '❌ 权限不足'
            };
        }
        if (error.code === 'EBUSY') {
            return {
                llmContent: \`Error: File is locked: \${absolute_path}\`,
                returnDisplay: '❌ 文件被锁定'
            };
        }
        if (error.code === 'EMFILE' || error.code === 'ENFILE') {
            return {
                llmContent: \`Error: Too many open files\`,
                returnDisplay: '❌ 文件句柄耗尽'
            };
        }

        throw error;  // 未知错误继续抛出
    }
}

// 二进制文件检测
private async detectBinaryFile(filePath: string): Promise<boolean> {
    const buffer = Buffer.alloc(512);
    const fd = await fs.open(filePath, 'r');
    try {
        await fd.read(buffer, 0, 512, 0);
        // 检查是否包含 null 字节（二进制特征）
        return buffer.includes(0);
    } finally {
        await fd.close();
    }
}`}
            />
          </div>
        </div>

        {/* 边界条件 3: 并发和超时 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-blue-400 font-bold flex items-center gap-2">
              <span>3️⃣</span> 并发与超时边界
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              工具执行可能耗时很长（大文件、慢网络、复杂命令），需要正确处理
              AbortSignal、超时取消、并发限制等边界情况。
            </p>
            <CodeBlock
              title="超时和取消处理"
              code={`async execute(signal: AbortSignal): Promise<ShellResult> {
    const { command, timeout = 60000 } = this.params;

    // 1. 创建可控的子进程
    const process = spawn('bash', ['-c', command], {
        cwd: this.workdir,
        env: this.env,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // 2. 设置超时定时器
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            process.kill('SIGTERM');
            // 给进程 5 秒时间清理
            setTimeout(() => process.kill('SIGKILL'), 5000);
            reject(new ToolTimeoutError(
                \`Command timed out after \${timeout}ms\`
            ));
        }, timeout);
    });

    // 3. 监听 AbortSignal
    const abortHandler = () => {
        process.kill('SIGTERM');
        setTimeout(() => process.kill('SIGKILL'), 5000);
    };
    signal.addEventListener('abort', abortHandler);

    // 4. 收集输出（带缓冲区大小限制）
    const MAX_OUTPUT = 1024 * 1024;  // 1MB
    let stdout = '';
    let stderr = '';
    let outputTruncated = false;

    process.stdout.on('data', (data) => {
        if (stdout.length < MAX_OUTPUT) {
            stdout += data.toString();
        } else if (!outputTruncated) {
            outputTruncated = true;
            stdout += '\\n...[output truncated]';
        }
    });

    process.stderr.on('data', (data) => {
        if (stderr.length < MAX_OUTPUT) {
            stderr += data.toString();
        }
    });

    // 5. 等待进程完成（竞争超时）
    try {
        const exitCode = await Promise.race([
            new Promise<number>((resolve) => {
                process.on('exit', resolve);
            }),
            timeoutPromise
        ]);

        // 检查是否被取消
        if (signal.aborted) {
            throw new ToolAbortedError('Command was aborted');
        }

        return {
            exitCode,
            stdout,
            stderr,
            truncated: outputTruncated
        };

    } finally {
        // 6. 清理资源
        clearTimeout(timeoutId);
        signal.removeEventListener('abort', abortHandler);

        // 确保子进程被终止
        if (!process.killed) {
            process.kill('SIGKILL');
        }
    }
}`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">边界情况</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">信号</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">处理方式</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-secondary)]">
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">用户取消</td>
                    <td className="py-2 px-3"><code className="text-cyan-400">AbortSignal</code></td>
                    <td className="py-2 px-3">SIGTERM → 5s → SIGKILL</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">执行超时</td>
                    <td className="py-2 px-3"><code className="text-cyan-400">setTimeout</code></td>
                    <td className="py-2 px-3">抛出 ToolTimeoutError</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">输出过大</td>
                    <td className="py-2 px-3"><code className="text-cyan-400">MAX_OUTPUT</code></td>
                    <td className="py-2 px-3">截断并标记 truncated</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">进程僵死</td>
                    <td className="py-2 px-3"><code className="text-cyan-400">SIGKILL</code></td>
                    <td className="py-2 px-3">强制终止进程树</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">并发超限</td>
                    <td className="py-2 px-3"><code className="text-cyan-400">Semaphore</code></td>
                    <td className="py-2 px-3">排队等待或快速失败</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 边界条件 4: MCP 工具集成 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-purple-400 font-bold flex items-center gap-2">
              <span>4️⃣</span> MCP 工具边界
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              通过 MCP 协议集成的外部工具可能出现各种问题：连接失败、响应超时、
              协议不兼容、工具不存在等。
            </p>
            <CodeBlock
              title="MCP 工具调用的边界处理"
              code={`class McpToolInvocation extends ToolInvocation<McpToolParams, McpToolResult> {
    private client: McpClient;

    async execute(signal: AbortSignal): Promise<McpToolResult> {
        // 1. 检查连接状态
        if (!this.client.isConnected()) {
            // 尝试重连（带重试）
            const connected = await this.retryConnect(3, 1000);
            if (!connected) {
                return {
                    llmContent: 'Error: MCP server is not connected',
                    returnDisplay: '❌ MCP 服务器未连接'
                };
            }
        }

        // 2. 检查工具是否存在
        const availableTools = await this.client.listTools();
        if (!availableTools.includes(this.params.toolName)) {
            return {
                llmContent: \`Error: Tool '\${this.params.toolName}' not found. \\
Available tools: \${availableTools.join(', ')}\`,
                returnDisplay: \`❌ 工具不存在: \${this.params.toolName}\`
            };
        }

        // 3. 设置调用超时
        const timeout = this.params.timeout || 30000;
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => {
            timeoutController.abort();
        }, timeout);

        // 4. 合并信号（用户取消或超时都会触发）
        const combinedSignal = AbortSignal.any([
            signal,
            timeoutController.signal
        ]);

        try {
            // 5. 调用 MCP 工具
            const result = await this.client.callTool(
                this.params.toolName,
                this.params.arguments,
                combinedSignal
            );

            // 6. 验证响应格式
            if (!this.isValidResponse(result)) {
                return {
                    llmContent: 'Error: Invalid response format from MCP tool',
                    returnDisplay: '❌ MCP 响应格式错误'
                };
            }

            return this.formatResult(result);

        } catch (error) {
            // 7. 分类处理错误
            if (error.name === 'AbortError') {
                if (signal.aborted) {
                    return {
                        llmContent: 'MCP tool call was cancelled',
                        returnDisplay: '⚡ 已取消'
                    };
                } else {
                    return {
                        llmContent: \`MCP tool call timed out after \${timeout}ms\`,
                        returnDisplay: '⏰ 调用超时'
                    };
                }
            }

            if (error.code === 'ECONNRESET') {
                return {
                    llmContent: 'Error: MCP connection was reset. Server may have crashed.',
                    returnDisplay: '❌ 连接被重置'
                };
            }

            throw error;

        } finally {
            clearTimeout(timeoutId);
        }
    }

    // 带指数退避的重连
    private async retryConnect(
        maxRetries: number,
        baseDelay: number
    ): Promise<boolean> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.client.connect();
                return true;
            } catch (e) {
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(r => setTimeout(r, delay));
            }
        }
        return false;
    }
}`}
            />
          </div>
        </div>

        {/* 边界条件 5: 工具结果处理 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-green-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-green-400 font-bold flex items-center gap-2">
              <span>5️⃣</span> 结果处理边界
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              工具执行结果需要安全地传递给 AI，这涉及到大小限制、编码处理、
              敏感信息过滤等多个边界。
            </p>
            <CodeBlock
              title="工具结果的安全处理"
              code={`class ToolResultProcessor {
    private readonly MAX_RESULT_SIZE = 100_000;  // 100KB
    private readonly sensitivePatterns = [
        /password[s]?\s*[:=]\s*['""][^'""]+['""]/gi,
        /api[_-]?key[s]?\s*[:=]\s*['""][^'""]+['""]/gi,
        /secret[s]?\s*[:=]\s*['""][^'""]+['""]/gi,
        /token\s*[:=]\s*['""][^'""]+['""]/gi,
        /Bearer\s+[A-Za-z0-9_-]+/gi,
        /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/,
    ];

    processResult(result: ToolResult): ProcessedResult {
        let { llmContent, returnDisplay } = result;

        // 1. 大小检查和截断
        if (llmContent.length > this.MAX_RESULT_SIZE) {
            llmContent = llmContent.slice(0, this.MAX_RESULT_SIZE) +
                \`\\n\\n[Content truncated. Original size: \${llmContent.length} bytes]\`;
        }

        // 2. 敏感信息脱敏
        for (const pattern of this.sensitivePatterns) {
            llmContent = llmContent.replace(pattern, '[REDACTED]');
        }

        // 3. 特殊字符处理
        llmContent = this.sanitizeSpecialChars(llmContent);

        // 4. 编码修复（处理乱码）
        llmContent = this.fixEncoding(llmContent);

        return {
            llmContent,
            returnDisplay,
            metadata: {
                originalSize: result.llmContent.length,
                truncated: result.llmContent.length > this.MAX_RESULT_SIZE,
                redacted: this.sensitivePatterns.some(p =>
                    p.test(result.llmContent)
                )
            }
        };
    }

    private sanitizeSpecialChars(content: string): string {
        // 移除控制字符（保留换行和制表符）
        return content.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]/g, '');
    }

    private fixEncoding(content: string): string {
        // 尝试检测和修复常见的编码问题
        try {
            // 检测是否有乱码特征
            if (/\\ufffd/.test(content)) {
                // 包含 Unicode 替换字符，可能是编码问题
                // 尝试重新解码
                const buffer = Buffer.from(content, 'latin1');
                return buffer.toString('utf-8');
            }
        } catch {
            // 保持原样
        }
        return content;
    }
}`}
            />
          </div>
        </div>

        {/* 边界条件总结表 */}
        <HighlightBox title="边界条件速查表" icon="📋" variant="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">分类</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">边界情况</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">标准处理</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">参数验证</td>
                  <td className="py-2 px-3">类型错误/缺失字段</td>
                  <td className="py-2 px-3">返回详细错误信息</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">参数验证</td>
                  <td className="py-2 px-3">路径穿越攻击</td>
                  <td className="py-2 px-3">拒绝并记录安全事件</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-green-400">文件系统</td>
                  <td className="py-2 px-3">文件不存在/权限不足</td>
                  <td className="py-2 px-3">返回友好错误，不抛异常</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-green-400">文件系统</td>
                  <td className="py-2 px-3">超大文件/二进制文件</td>
                  <td className="py-2 px-3">拒绝读取，提示替代方案</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-blue-400">并发超时</td>
                  <td className="py-2 px-3">用户取消/超时</td>
                  <td className="py-2 px-3">优雅终止，清理资源</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-blue-400">并发超时</td>
                  <td className="py-2 px-3">并发数超限</td>
                  <td className="py-2 px-3">排队或快速失败</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-purple-400">MCP</td>
                  <td className="py-2 px-3">连接失败/工具不存在</td>
                  <td className="py-2 px-3">重试 + 降级处理</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400">结果处理</td>
                  <td className="py-2 px-3">敏感信息/结果过大</td>
                  <td className="py-2 px-3">脱敏 + 截断 + 标记</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" icon="🐛">
        <p className="text-[var(--text-secondary)] mb-6">
          工具系统的问题通常表现为：AI 调用失败、执行超时、结果异常等。
          本节提供系统化的调试方法和常见问题解决方案。
        </p>

        {/* 问题 1: 工具不存在或被禁用 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-red-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
            <h4 className="text-red-400 font-bold">❌ 问题1: "Unknown tool" 或 "Tool not available"</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 尝试调用不存在的工具，或者工具被禁用/未加载。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)] rounded p-3">
                <div className="text-red-400 text-xs font-mono mb-2">错误信息</div>
                <pre className="text-xs text-gray-400 overflow-x-auto">{`ToolRegistryError: Unknown tool: read_files
  at ToolRegistry.getTool

ToolDisabledError: Tool 'run_shell_command' is disabled
  reason: User disabled in settings`}</pre>
              </div>
              <div className="bg-[var(--bg-terminal)] rounded p-3">
                <div className="text-green-400 text-xs font-mono mb-2">调试步骤</div>
                <pre className="text-xs text-gray-300 overflow-x-auto">{`# 1. 列出所有已注册工具
DEBUG=tool:registry gemini

# 2. 检查工具定义
gemini extensions list

# 3. 检查配置禁用
cat ~/.gemini/settings.toml | grep -A5 '[tools]'

# 4. 检查 MCP 服务器状态
gemini mcp status`}</pre>
              </div>
            </div>
            <HighlightBox title="常见原因" icon="🔍" variant="orange">
              <ul className="text-sm space-y-1">
                <li><strong>工具名称拼写错误</strong>: AI 可能使用错误的名称（如 read_files vs read_file）</li>
                <li><strong>MCP 服务器未启动</strong>: 外部工具依赖的 MCP 服务器未运行</li>
                <li><strong>配置禁用</strong>: 在 settings.toml 中被显式禁用</li>
                <li><strong>权限不足</strong>: 某些工具在当前模式下不可用（如 --safe 模式）</li>
              </ul>
            </HighlightBox>
          </div>
        </div>

        {/* 问题 2: 参数验证失败 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-amber-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/30">
            <h4 className="text-amber-400 font-bold">⚠️ 问题2: "Invalid parameters" 或 "Validation failed"</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 传入的参数不符合工具的 schema 定义。
            </p>
            <CodeBlock
              title="典型的参数错误场景"
              code={`// 场景 1: 路径不是绝对路径
{
    "tool": "read_file",
    "args": { "absolute_path": "src/main.ts" }  // ❌ 相对路径
}
// 错误: Path must be absolute

// 场景 2: 类型错误
{
    "tool": "read_file",
    "args": {
        "absolute_path": "/src/main.ts",
        "offset": "10"  // ❌ 应该是 number
    }
}
// 错误: offset must be a number

// 场景 3: 必需字段缺失
{
    "tool": "edit",
    "args": {
        "file_path": "/src/main.ts",
        "new_string": "hello"
        // ❌ 缺少 old_string
    }
}
// 错误: old_string is required

// 场景 4: 工作区外的路径
{
    "tool": "read_file",
    "args": { "absolute_path": "/etc/passwd" }  // ❌ 工作区外
}
// 错误: Path is outside the workspace`}
            />
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-green-400 text-xs font-mono mb-2">调试技巧</div>
              <pre className="text-xs text-gray-300 overflow-x-auto">{`# 1. 打印完整的工具 schema
DEBUG=tool:schema gemini

# 2. 查看 AI 发送的原始参数
DEBUG=ai:tools gemini

# 3. 验证路径有效性
node -e "console.log(require('path').isAbsolute('/src/main.ts'))"

# 4. 检查工作区范围
gemini --show-workspace`}</pre>
            </div>
          </div>
        </div>

        {/* 问题 3: 执行超时或挂起 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-blue-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30">
            <h4 className="text-blue-400 font-bold">⏰ 问题3: 工具执行超时或无响应</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              工具执行时间过长，超过预设的超时限制，或者进程完全无响应。
            </p>
            <CodeBlock
              title="超时诊断流程"
              code={`// 1. 检查是哪个阶段超时
async function diagnoseTimeout(toolCall: ToolCallInfo) {
    const stages = [
        'validation',   // 参数验证（应该很快）
        'approval',     // 等待用户批准（可能无限等待）
        'preparation',  // 准备执行（如沙箱启动）
        'execution',    // 实际执行
        'result'        // 结果处理
    ];

    console.log('Current stage:', toolCall.stage);
    console.log('Time in stage:', Date.now() - toolCall.stageStartTime, 'ms');

    // 2. 如果卡在 approval，可能是 UI 问题
    if (toolCall.stage === 'approval') {
        console.log('Waiting for user approval...');
        console.log('Is terminal interactive?', process.stdin.isTTY);
    }

    // 3. 如果卡在 execution，检查子进程
    if (toolCall.stage === 'execution' && toolCall.process) {
        console.log('Process PID:', toolCall.process.pid);
        console.log('Process running:', !toolCall.process.killed);

        // 检查资源使用
        const usage = process.cpuUsage(toolCall.cpuStart);
        console.log('CPU usage:', usage);
    }
}

// 4. 手动设置更长的超时
{
    "tool": "run_shell_command",
    "args": {
        "command": "npm run build",
        "timeout": 300000  // 5 分钟
    }
}`}
            />
            <HighlightBox title="常见超时原因" icon="🔍" variant="blue">
              <ul className="text-sm space-y-1">
                <li><strong>网络操作</strong>: npm install、git clone 等网络依赖操作</li>
                <li><strong>大型构建</strong>: webpack、tsc 编译大型项目</li>
                <li><strong>等待输入</strong>: 命令等待标准输入（没有传入 stdin）</li>
                <li><strong>死锁</strong>: 子进程等待锁或资源</li>
                <li><strong>无限循环</strong>: 命令本身存在 bug</li>
              </ul>
            </HighlightBox>
          </div>
        </div>

        {/* 问题 4: 权限被拒绝 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-purple-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/30">
            <h4 className="text-purple-400 font-bold">🔒 问题4: 权限被拒绝或沙箱限制</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              工具执行被权限系统或沙箱拒绝，需要调整配置或请求用户确认。
            </p>
            <CodeBlock
              title="权限问题诊断"
              code={`// 权限拒绝的几种类型
enum PermissionDenialReason {
    // 1. 硬拒绝 - 永远不允许
    BLOCKED_BY_GLOBAL_POLICY = 'blocked_by_global_policy',

    // 2. 需要确认 - 用户没有批准
    AWAITING_USER_APPROVAL = 'awaiting_user_approval',
    USER_REJECTED = 'user_rejected',

    // 3. 工作区限制
    OUTSIDE_WORKSPACE = 'outside_workspace',

    // 4. 沙箱限制
    SANDBOX_VIOLATION = 'sandbox_violation',

    // 5. 资源限制
    RESOURCE_LIMIT_EXCEEDED = 'resource_limit_exceeded'
}

// 诊断权限问题
async function diagnosePermission(error: PermissionError) {
    console.log('Denial reason:', error.reason);
    console.log('Tool:', error.toolName);
    console.log('Arguments:', JSON.stringify(error.args, null, 2));

    switch (error.reason) {
        case 'blocked_by_global_policy':
            console.log('\\nThis tool/command is blocked globally.');
            console.log('Check: ~/.gemini/settings.toml [tools.exclude]');
            break;

        case 'outside_workspace':
            console.log('\\nPath is outside workspace boundaries.');
            console.log('Workspace:', process.cwd());
            console.log('Requested path:', error.args.path);
            console.log('To allow: add to [tools.allowed_paths]');
            break;

        case 'sandbox_violation':
            console.log('\\nSandbox blocked this operation.');
            console.log('Sandbox type:', process.env.GEMINI_SANDBOX);
            console.log('Violation:', error.sandboxMessage);
            break;
    }
}`}
            />
          </div>
        </div>

        {/* 调试命令速查 */}
        <HighlightBox title="调试命令速查表" icon="🛠️" variant="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">问题类型</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">调试命令</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">说明</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">工具注册</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=tool:* gemini</code></td>
                  <td className="py-2 px-3">查看所有工具日志</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">参数解析</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=ai:tools gemini</code></td>
                  <td className="py-2 px-3">查看 AI 发送的参数</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">权限检查</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=permission:* gemini</code></td>
                  <td className="py-2 px-3">查看权限决策过程</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">沙箱执行</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=sandbox:* gemini</code></td>
                  <td className="py-2 px-3">查看沙箱日志</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">MCP 通信</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=mcp:* gemini</code></td>
                  <td className="py-2 px-3">查看 MCP 协议日志</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">全量日志</td>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=* gemini 2&gt;&amp;1 | tee debug.log</code></td>
                  <td className="py-2 px-3">记录所有调试输出</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" icon="⚡">
        <p className="text-[var(--text-secondary)] mb-6">
          工具系统的性能直接影响 AI 交互的响应速度。本节从多个维度分析性能瓶颈和优化策略。
        </p>

        {/* 优化 1: 并发调度 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-green-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-green-400 font-bold flex items-center gap-2">
              <span>1️⃣</span> 并发调度优化
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 经常需要同时执行多个工具（如同时读取多个文件）。合理的并发调度可以显著提升性能。
            </p>
            <CodeBlock
              title="并发调度器实现"
              code={`class OptimizedToolScheduler {
    // 并发控制
    private readonly maxConcurrent = 5;          // 最大并发数
    private readonly fileReadConcurrent = 10;    // 文件读取可以更高
    private readonly shellConcurrent = 3;        // shell 命令要限制

    private running = 0;
    private queue: PriorityQueue<ToolCall> = new PriorityQueue();

    async schedule(calls: ToolCall[]): Promise<ToolResult[]> {
        // 1. 分析依赖关系
        const { independent, dependent } = this.analyzeDependencies(calls);

        // 2. 独立工具并行执行
        const independentResults = await this.executeParallel(
            independent,
            this.getConcurrencyLimit(independent)
        );

        // 3. 依赖工具按序执行
        const dependentResults = await this.executeSequential(dependent);

        return [...independentResults, ...dependentResults];
    }

    private getConcurrencyLimit(calls: ToolCall[]): number {
        // 根据工具类型动态调整并发数
        const kinds = new Set(calls.map(c => c.tool.kind));

        if (kinds.has('execute')) {
            return this.shellConcurrent;  // shell 命令限制更严
        }
        if (calls.every(c => c.tool.name === 'read_file')) {
            return this.fileReadConcurrent;  // 纯读取可以更高
        }
        return this.maxConcurrent;
    }

    private async executeParallel(
        calls: ToolCall[],
        limit: number
    ): Promise<ToolResult[]> {
        // 使用信号量控制并发
        const semaphore = new Semaphore(limit);

        return Promise.all(calls.map(async (call) => {
            await semaphore.acquire();
            try {
                return await this.executeOne(call);
            } finally {
                semaphore.release();
            }
        }));
    }

    // 优先级队列 - 快速操作先执行
    private prioritize(calls: ToolCall[]): ToolCall[] {
        return calls.sort((a, b) => {
            // 读取操作优先（通常更快）
            if (a.tool.kind === 'read' && b.tool.kind !== 'read') return -1;
            // 短命令优先
            if (a.estimatedTime < b.estimatedTime) return -1;
            return 0;
        });
    }
}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h5 className="text-red-400 font-bold text-sm mb-2">❌ 串行执行</h5>
                <pre className="text-xs text-gray-400">{`read file1 → 50ms
read file2 → 50ms
read file3 → 50ms
─────────────────
Total: 150ms`}</pre>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h5 className="text-green-400 font-bold text-sm mb-2">✅ 并行执行</h5>
                <pre className="text-xs text-gray-400">{`read file1 ─┐
read file2 ─┼─→ 50ms
read file3 ─┘
─────────────────
Total: 50ms (3x faster)`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* 优化 2: 结果缓存 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-blue-400 font-bold flex items-center gap-2">
              <span>2️⃣</span> 结果缓存策略
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              对于频繁访问的只读数据（如文件内容、搜索结果），使用缓存可以避免重复的 I/O 操作。
            </p>
            <CodeBlock
              title="多级缓存实现"
              code={`class ToolResultCache {
    // L1: 内存缓存（最快，容量小）
    private l1Cache = new LRUCache<string, CachedResult>({
        max: 100,
        maxSize: 10 * 1024 * 1024,  // 10MB
        sizeCalculation: (value) => value.data.length
    });

    // L2: 文件系统缓存（较慢，容量大）
    private l2CacheDir = path.join(os.tmpdir(), 'gemini-tool-cache');

    async get(key: string): Promise<CachedResult | null> {
        // 1. 检查 L1
        const l1Result = this.l1Cache.get(key);
        if (l1Result && !this.isExpired(l1Result)) {
            return l1Result;
        }

        // 2. 检查 L2
        const l2Path = path.join(this.l2CacheDir, this.hashKey(key));
        try {
            const l2Data = await fs.readFile(l2Path, 'utf-8');
            const l2Result = JSON.parse(l2Data) as CachedResult;
            if (!this.isExpired(l2Result)) {
                // 提升到 L1
                this.l1Cache.set(key, l2Result);
                return l2Result;
            }
        } catch {
            // L2 不存在或过期
        }

        return null;
    }

    async set(key: string, result: ToolResult, ttl: number): Promise<void> {
        const cached: CachedResult = {
            data: result.llmContent,
            createdAt: Date.now(),
            expiresAt: Date.now() + ttl
        };

        // 写入 L1
        this.l1Cache.set(key, cached);

        // 异步写入 L2（不阻塞）
        const l2Path = path.join(this.l2CacheDir, this.hashKey(key));
        fs.writeFile(l2Path, JSON.stringify(cached)).catch(() => {});
    }

    // 缓存键生成（考虑文件修改时间）
    private async generateCacheKey(
        toolName: string,
        args: Record<string, unknown>
    ): Promise<string> {
        const parts = [toolName, JSON.stringify(args)];

        // 对于文件操作，加入 mtime
        if (args.absolute_path) {
            const stat = await fs.stat(args.absolute_path as string);
            parts.push(stat.mtimeMs.toString());
        }

        return crypto.createHash('sha256')
            .update(parts.join(':'))
            .digest('hex');
    }
}

// 使用示例
const cache = new ToolResultCache();

async function executeWithCache(tool: Tool, args: Args): Promise<Result> {
    // 只缓存只读工具
    if (tool.kind !== 'read') {
        return tool.execute(args);
    }

    const cacheKey = await cache.generateCacheKey(tool.name, args);
    const cached = await cache.get(cacheKey);

    if (cached) {
        return { llmContent: cached.data, fromCache: true };
    }

    const result = await tool.execute(args);

    // 根据工具类型设置不同的 TTL
    const ttl = {
        'read_file': 5000,      // 5秒（文件可能快速变化）
        'glob': 30000,          // 30秒
        'grep_search': 10000,   // 10秒
        'web_search': 300000    // 5分钟
    }[tool.name] || 10000;

    await cache.set(cacheKey, result, ttl);
    return result;
}`}
            />
          </div>
        </div>

        {/* 优化 3: 懒加载和预加载 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-purple-400 font-bold flex items-center gap-2">
              <span>3️⃣</span> 懒加载与预加载
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              工具初始化可能涉及重量级操作（如 MCP 连接、子进程启动）。
              合理的加载策略可以优化启动时间和响应延迟。
            </p>
            <CodeBlock
              title="懒加载 + 预热策略"
              code={`class LazyToolRegistry {
    private tools = new Map<string, Tool | (() => Promise<Tool>)>();
    private initializedTools = new Map<string, Tool>();

    // 注册懒加载工具
    registerLazy(name: string, loader: () => Promise<Tool>): void {
        this.tools.set(name, loader);
    }

    // 按需初始化
    async getTool(name: string): Promise<Tool> {
        // 已初始化，直接返回
        if (this.initializedTools.has(name)) {
            return this.initializedTools.get(name)!;
        }

        const toolOrLoader = this.tools.get(name);
        if (!toolOrLoader) {
            throw new Error(\`Unknown tool: \${name}\`);
        }

        // 如果是加载器，执行加载
        if (typeof toolOrLoader === 'function') {
            const tool = await toolOrLoader();
            this.initializedTools.set(name, tool);
            return tool;
        }

        return toolOrLoader;
    }

    // 预热常用工具（后台执行）
    async warmup(toolNames: string[]): Promise<void> {
        await Promise.all(
            toolNames.map(name =>
                this.getTool(name).catch(() => {})  // 忽略错误
            )
        );
    }
}

// 预测式预加载
class PredictivePreloader {
    private usageHistory: string[] = [];
    private cooccurrence = new Map<string, Map<string, number>>();

    // 记录工具使用
    recordUsage(toolName: string): void {
        // 更新共现矩阵
        for (const prevTool of this.usageHistory.slice(-5)) {
            const cooc = this.cooccurrence.get(prevTool) || new Map();
            cooc.set(toolName, (cooc.get(toolName) || 0) + 1);
            this.cooccurrence.set(prevTool, cooc);
        }
        this.usageHistory.push(toolName);
    }

    // 预测下一个可能使用的工具
    predictNext(currentTool: string): string[] {
        const cooc = this.cooccurrence.get(currentTool);
        if (!cooc) return [];

        return Array.from(cooc.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);
    }
}

// 使用示例
const registry = new LazyToolRegistry();
const preloader = new PredictivePreloader();

// 注册懒加载工具
registry.registerLazy('mcp_tool', async () => {
    const client = await connectToMcpServer();
    return new McpTool(client);
});

// 启动时预热常用工具
await registry.warmup(['read_file', 'glob', 'grep_search']);

// 执行时预测性预加载
async function executeWithPrediction(tool: string, args: Args) {
    preloader.recordUsage(tool);

    // 并行：执行当前 + 预加载预测工具
    const [result] = await Promise.all([
        registry.getTool(tool).then(t => t.execute(args)),
        ...preloader.predictNext(tool).map(name =>
            registry.getTool(name).catch(() => {})
        )
    ]);

    return result;
}`}
            />
          </div>
        </div>

        {/* 优化 4: I/O 优化 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-amber-400 font-bold flex items-center gap-2">
              <span>4️⃣</span> I/O 操作优化
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              文件读写和命令执行是主要的 I/O 瓶颈。以下是针对性的优化策略。
            </p>
            <CodeBlock
              title="I/O 优化技术"
              code={`// 1. 流式读取大文件（避免一次性加载到内存）
async function* readLargeFile(path: string): AsyncGenerator<string> {
    const stream = fs.createReadStream(path, { encoding: 'utf-8' });
    let buffer = '';

    for await (const chunk of stream) {
        buffer += chunk;
        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';  // 保留不完整的行

        for (const line of lines) {
            yield line;
        }
    }

    if (buffer) {
        yield buffer;
    }
}

// 2. 批量文件操作
async function batchReadFiles(paths: string[]): Promise<Map<string, string>> {
    const BATCH_SIZE = 50;
    const results = new Map<string, string>();

    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
        const batch = paths.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map(async (p) => {
                try {
                    const content = await fs.readFile(p, 'utf-8');
                    return [p, content] as const;
                } catch {
                    return [p, null] as const;
                }
            })
        );

        for (const [path, content] of batchResults) {
            if (content !== null) {
                results.set(path, content);
            }
        }
    }

    return results;
}

// 3. 使用 worker_threads 进行 CPU 密集型操作
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

function processInWorker<T>(fn: string, data: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(fn, { workerData: data });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(\`Worker exited with code \${code}\`));
            }
        });
    });
}

// 4. 命令输出流式处理
async function executeWithStreaming(
    command: string,
    onOutput: (chunk: string) => void
): Promise<number> {
    const process = spawn('bash', ['-c', command]);

    process.stdout.on('data', (chunk) => {
        onOutput(chunk.toString());
    });

    return new Promise((resolve) => {
        process.on('exit', resolve);
    });
}`}
            />
          </div>
        </div>

        {/* 性能基准对比 */}
        <HighlightBox title="性能优化效果基准" icon="📊" variant="green">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化项</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化前</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化后</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">提升</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">读取 10 个文件</td>
                  <td className="py-2 px-3">500ms（串行）</td>
                  <td className="py-2 px-3">80ms（并行）</td>
                  <td className="py-2 px-3 text-green-400">6.25x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">重复读取同文件</td>
                  <td className="py-2 px-3">50ms（每次 I/O）</td>
                  <td className="py-2 px-3">0.1ms（缓存命中）</td>
                  <td className="py-2 px-3 text-green-400">500x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">MCP 工具首次调用</td>
                  <td className="py-2 px-3">2000ms（冷启动）</td>
                  <td className="py-2 px-3">50ms（预热后）</td>
                  <td className="py-2 px-3 text-green-400">40x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">glob 搜索大目录</td>
                  <td className="py-2 px-3">800ms</td>
                  <td className="py-2 px-3">150ms（带索引）</td>
                  <td className="py-2 px-3 text-green-400">5.3x</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">读取 100MB 文件</td>
                  <td className="py-2 px-3">3000ms + 高内存</td>
                  <td className="py-2 px-3">500ms（流式）</td>
                  <td className="py-2 px-3 text-green-400">6x + 低内存</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" icon="🔗">
        <p className="text-[var(--text-secondary)] mb-6">
          工具系统是 CLI 的核心模块，与多个其他模块紧密协作。理解这些交互关系有助于全局性地把握系统架构。
        </p>

        {/* 依赖关系图 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">模块依赖关系图</h4>
          <MermaidDiagram chart={`graph TB
    subgraph AI["AI 交互层"]
        GC[GeminiChat<br/>AI 对话核心]
        SP[StreamingParser<br/>流式解析]
    end

    subgraph Tools["工具系统"]
        TR[ToolRegistry<br/>工具注册表]
        TS[ToolScheduler<br/>调度器]
        TI[ToolInvocation<br/>调用实例]
    end

    subgraph Permission["权限系统"]
        PM[PermissionManager<br/>权限管理]
        PA[PermissionApproval<br/>批准流程]
    end

    subgraph Execution["执行环境"]
        SB[Sandbox<br/>沙箱系统]
        MCP[McpClient<br/>MCP 客户端]
    end

    subgraph Storage["存储层"]
        FS[FileSystem<br/>文件操作]
        CF[ConfigFiles<br/>配置管理]
    end

    GC -->|"tool_calls"| SP
    SP -->|"parse"| TS
    TS -->|"lookup"| TR
    TS -->|"check"| PM
    PM -->|"approve"| PA
    TS -->|"build"| TI
    TI -->|"execute"| SB
    TI -->|"call"| MCP
    TI -->|"read/write"| FS
    TR -->|"load"| CF

    style Tools fill:#1a365d,stroke:#3182ce
    style AI fill:#2d3748,stroke:#718096
    style Permission fill:#744210,stroke:#d69e2e
    style Execution fill:#1a3a32,stroke:#48bb78
    style Storage fill:#2d1f3d,stroke:#9f7aea`} />
        </div>

        {/* 核心接口定义 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">核心接口契约</h4>
          <CodeBlock
            title="模块间接口定义"
            code={`// ==================== 工具系统对外接口 ====================

/**
 * AI 交互层 → 工具系统
 * StreamingParser 解析出的工具调用请求
 */
export interface ToolCallRequest {
    id: string;              // 调用 ID（用于关联响应）
    name: string;            // 工具名称
    args: JsonValue;         // 参数（JSON 格式）
    parallel_group?: string; // 并行组标识
}

/**
 * 工具系统 → AI 交互层
 * 工具执行结果
 */
export interface ToolCallResponse {
    id: string;
    status: 'success' | 'error' | 'cancelled';
    result?: {
        llmContent: string;    // 发送给 AI 的内容
        returnDisplay: string; // 显示在终端的内容
    };
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

// ==================== 权限系统接口 ====================

/**
 * 工具系统 → 权限系统
 * 权限检查请求
 */
export interface PermissionCheckRequest {
    tool: string;
    kind: ToolKind;
    locations: string[];     // 影响的路径
    description: string;     // 人类可读的操作描述
    metadata?: {
        command?: string;    // 对于 shell 命令
        isDangerous?: boolean;
    };
}

/**
 * 权限系统 → 工具系统
 * 权限检查结果
 */
export interface PermissionCheckResult {
    decision: 'allow' | 'deny' | 'ask';
    reason?: string;
    rule?: string;           // 匹配的规则
}

// ==================== 沙箱系统接口 ====================

/**
 * 工具系统 → 沙箱系统
 * 命令执行请求
 */
export interface SandboxExecuteRequest {
    command: string;
    cwd: string;
    env: Record<string, string>;
    timeout: number;
    stdin?: string;
}

/**
 * 沙箱系统 → 工具系统
 * 执行结果
 */
export interface SandboxExecuteResult {
    exitCode: number;
    stdout: string;
    stderr: string;
    signal?: string;         // 如果被信号终止
    timedOut?: boolean;
}

// ==================== MCP 接口 ====================

/**
 * 工具系统 → MCP 客户端
 * MCP 工具调用
 */
export interface McpToolCall {
    serverName: string;      // MCP 服务器名称
    toolName: string;        // 工具名称
    arguments: JsonValue;    // 参数
}

/**
 * MCP 客户端 → 工具系统
 * 工具发现
 */
export interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: JsonSchema;
    serverName: string;      // 来源服务器
}`}
          />
        </div>

        {/* 数据流图 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">工具调用数据流</h4>
          <MermaidDiagram chart={`sequenceDiagram
    participant AI as GeminiChat
    participant SP as StreamingParser
    participant TS as ToolScheduler
    participant TR as ToolRegistry
    participant PM as PermissionManager
    participant UI as PermissionUI
    participant TI as ToolInvocation
    participant SB as Sandbox/MCP

    AI->>SP: stream(response)
    SP->>SP: parse tool_call block
    SP->>TS: scheduleToolCall(request)

    TS->>TR: getTool(name)
    TR-->>TS: tool definition

    TS->>TR: tool.build(args)
    Note over TR: 参数验证
    TR-->>TS: invocation

    TS->>PM: checkPermission(request)

    alt 需要用户确认
        PM->>UI: showApprovalDialog()
        UI-->>PM: user decision
    end

    PM-->>TS: permission result

    alt 允许执行
        TS->>TI: execute(signal)

        alt Shell 命令
            TI->>SB: executeCommand()
            SB-->>TI: result
        else MCP 工具
            TI->>SB: callMcpTool()
            SB-->>TI: result
        end

        TI-->>TS: ToolResult
    else 拒绝执行
        TS-->>SP: PermissionDenied
    end

    TS-->>SP: ToolCallResponse
    SP-->>AI: formatted result`} />
        </div>

        {/* 扩展点 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">扩展点与钩子</h4>
          <CodeBlock
            title="工具系统扩展接口"
            code={`// ==================== 工具注册扩展 ====================

/**
 * 自定义工具注册
 */
export interface ToolPlugin {
    name: string;
    version: string;

    // 注册工具
    register(registry: ToolRegistry): void;

    // 清理（可选）
    cleanup?(): Promise<void>;
}

// 示例：注册自定义工具
const myPlugin: ToolPlugin = {
    name: 'my-tools',
    version: '1.0.0',

    register(registry) {
        registry.registerTool(new MyCustomTool());
    }
};

// ==================== 执行钩子 ====================

/**
 * 工具执行生命周期钩子
 */
export interface ToolExecutionHooks {
    // 执行前
    beforeExecute?(context: ExecutionContext): Promise<void>;

    // 执行后（无论成功失败）
    afterExecute?(context: ExecutionContext, result: ToolResult | Error): Promise<void>;

    // 结果转换
    transformResult?(result: ToolResult): Promise<ToolResult>;
}

// 示例：添加执行日志
const loggingHook: ToolExecutionHooks = {
    async beforeExecute(ctx) {
        console.log(\`[Tool] Starting: \${ctx.tool.name}\`);
        ctx.startTime = Date.now();
    },

    async afterExecute(ctx, result) {
        const duration = Date.now() - ctx.startTime;
        console.log(\`[Tool] Finished: \${ctx.tool.name} (\${duration}ms)\`);
    }
};

// ==================== MCP 动态工具 ====================

/**
 * MCP 服务器提供的工具会自动注册到 ToolRegistry
 * 工具名称格式: mcp_<serverName>_<toolName>
 */
export interface McpToolAdapter {
    // 将 MCP 工具转换为内部工具格式
    adaptTool(mcpTool: McpToolDefinition): DeclarativeTool;

    // 处理工具调用结果
    handleResult(mcpResult: unknown): ToolResult;
}

// ==================== 结果处理器 ====================

/**
 * 自定义结果处理（如日志、遥测、审计）
 */
export interface ResultProcessor {
    process(call: ToolCallInfo, result: ToolResult): void;
}

// 示例：遥测处理器
const telemetryProcessor: ResultProcessor = {
    process(call, result) {
        sendTelemetry({
            event: 'tool_execution',
            tool: call.tool.name,
            duration: call.endTime - call.startTime,
            success: call.status === 'success',
            resultSize: result.llmContent.length
        });
    }
};`}
          />
        </div>

        {/* 配置影响 */}
        <HighlightBox title="配置对工具系统的影响" icon="⚙️" variant="orange">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">配置项</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">位置</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">对工具系统的影响</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">tools.core</code></td>
                  <td className="py-2 px-3">settings.toml</td>
                  <td className="py-2 px-3">定义自动批准的工具列表</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">tools.exclude</code></td>
                  <td className="py-2 px-3">settings.toml</td>
                  <td className="py-2 px-3">定义永久禁止的工具/命令</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">sandbox.type</code></td>
                  <td className="py-2 px-3">settings.toml / 环境变量</td>
                  <td className="py-2 px-3">决定 shell 命令的执行环境</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">mcp.servers</code></td>
                  <td className="py-2 px-3">settings.json</td>
                  <td className="py-2 px-3">注册外部 MCP 工具</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><code className="text-cyan-400">extensions.enabled</code></td>
                  <td className="py-2 px-3">settings.toml</td>
                  <td className="py-2 px-3">启用/禁用工具扩展</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计工具系统" icon="🤔" defaultOpen={false}>
        <div className="space-y-6">
          <HighlightBox title="设计决策解析" icon="💡" variant="blue">
            <p className="text-sm text-[var(--text-secondary)]">
              工具系统的设计目标是<strong>可扩展、安全、高效</strong>，
              支持内置工具和外部 MCP 工具的统一管理。
            </p>
          </HighlightBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">1. 为什么使用注册表模式？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                所有工具通过 <code>ToolRegistry</code> 统一注册和管理。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 支持动态添加/移除工具</li>
                <li>• <strong>好处</strong>: 解耦工具实现与调用逻辑</li>
                <li>• <strong>权衡</strong>: 需要维护注册状态</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-2">2. 为什么工具有 Schema 定义？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                每个工具都有 JSON Schema 描述参数结构。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: AI 需要知道如何调用工具</li>
                <li>• <strong>好处</strong>: 自动生成提示、参数验证</li>
                <li>• <strong>权衡</strong>: Schema 维护成本</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--amber)] font-bold mb-2">3. 为什么分离调度器和执行器？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                <code>ToolScheduler</code> 负责调度，各工具负责执行。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 支持并发、重试、超时控制</li>
                <li>• <strong>好处</strong>: 统一的执行策略</li>
                <li>• <strong>权衡</strong>: 增加一层抽象</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="text-[var(--purple)] font-bold mb-2">4. 为什么 MCP 工具与内置工具统一？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                MCP 工具通过适配器注册到同一注册表。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: AI 无需区分工具来源</li>
                <li>• <strong>好处</strong>: 统一的调用接口</li>
                <li>• <strong>权衡</strong>: MCP 通信开销</li>
              </ul>
            </div>

            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)] md:col-span-2">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">5. 为什么工具有权限分级？</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                工具分为只读、写入、危险等级别，配合审批模式使用。
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• <strong>原因</strong>: 保护用户系统安全</li>
                <li>• <strong>好处</strong>: 细粒度的权限控制</li>
                <li>• <strong>权衡</strong>: 需要正确分类工具</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
