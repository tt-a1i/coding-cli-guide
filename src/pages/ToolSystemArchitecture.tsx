import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

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
  return (
    <div>
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

# 工作区允许列表 (在 .qwen/settings.toml)
allowed = [
    "run_shell_command(./scripts/*)",  # 项目脚本
]`}
        />
      </Layer>
    </div>
  );
}
