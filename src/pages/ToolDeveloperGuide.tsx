import { useState } from 'react';
import { RelatedPages } from '../components/RelatedPages';

// ============================================================
// 工具开发者指南 - 如何为 Gemini CLI 开发自定义工具
// ============================================================

// 可折叠章节组件
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  highlight = false
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-6 rounded-xl border ${highlight ? 'border-amber-500/50 bg-amber-900/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className={`text-lg font-semibold ${highlight ? 'text-amber-300' : 'text-gray-200'}`}>{title}</span>
        </div>
        <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

// 代码块组件
function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700/50">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
          {title}
        </div>
      )}
      <pre className={`bg-gray-900/80 p-4 overflow-x-auto language-${language}`}>
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

// 设计原理卡片
function DesignRationaleCard({ title, why, how, benefit }: {
  title: string;
  why: string;
  how: string;
  benefit: string;
}) {
  return (
    <div className="my-4 p-5 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30">
      <h4 className="text-lg font-semibold text-amber-300 mb-3">💡 {title}</h4>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-yellow-400 font-medium">为什么：</span>
          <span className="text-gray-300 ml-2">{why}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">如何实现：</span>
          <span className="text-gray-300 ml-2">{how}</span>
        </div>
        <div>
          <span className="text-green-400 font-medium">带来的好处：</span>
          <span className="text-gray-300 ml-2">{benefit}</span>
        </div>
      </div>
    </div>
  );
}

// 工具架构图
function ToolArchitectureDiagram() {
  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700/50">
      <h4 className="text-lg font-semibold text-gray-200 mb-4">🏗️ 工具系统架构</h4>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50 text-center">
            <div className="text-blue-400 font-semibold">ToolBuilder</div>
            <div className="text-xs text-gray-500">工具定义接口</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50 text-center">
            <div className="text-purple-400 font-semibold">DeclarativeTool</div>
            <div className="text-xs text-gray-500">声明式基类</div>
          </div>
          <span className="text-gray-600">→</span>
          <div className="p-3 bg-green-900/30 rounded-lg border border-green-700/50 text-center">
            <div className="text-green-400 font-semibold">ToolInvocation</div>
            <div className="text-xs text-gray-500">执行实例</div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700" />

        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-cyan-400">name</div>
            <div className="text-xs text-gray-500">内部名称</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-yellow-400">schema</div>
            <div className="text-xs text-gray-500">JSON Schema</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-pink-400">build()</div>
            <div className="text-xs text-gray-500">验证 & 构建</div>
          </div>
          <div className="p-2 bg-gray-800/50 rounded-lg">
            <div className="text-green-400">execute()</div>
            <div className="text-xs text-gray-500">执行逻辑</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 工具类型表 - 基于 gemini-cli/packages/core/src/tools/tools.ts Kind 枚举
function ToolKindTable() {
  const kinds = [
    { kind: 'read', desc: '读取操作', examples: 'Read, Glob, Grep, LS', approval: '无需审批' },
    { kind: 'edit', desc: '编辑操作', examples: 'Edit, Write, NotebookEdit', approval: '需要审批' },
    { kind: 'delete', desc: '删除操作', examples: '文件删除', approval: '需要审批' },
    { kind: 'move', desc: '移动操作', examples: '文件移动/重命名', approval: '需要审批' },
    { kind: 'search', desc: '搜索操作', examples: 'WebSearch', approval: '可配置' },
    { kind: 'execute', desc: '执行操作', examples: 'Bash, Task', approval: '需要审批' },
    { kind: 'think', desc: '思考操作', examples: '内部推理工具', approval: '无需审批' },
    { kind: 'fetch', desc: '获取操作', examples: 'WebFetch', approval: '可配置' },
    { kind: 'other', desc: '其他操作', examples: 'Skill, AskUser', approval: '可配置' },
  ];

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-3 text-amber-400">Kind</th>
            <th className="text-left p-3 text-gray-400">描述</th>
            <th className="text-left p-3 text-gray-400">示例工具</th>
            <th className="text-left p-3 text-gray-400">审批需求</th>
          </tr>
        </thead>
        <tbody>
          {kinds.map((k) => (
            <tr key={k.kind} className="border-b border-gray-800 hover:bg-gray-800/30">
              <td className="p-3 text-cyan-400 font-mono">{k.kind}</td>
              <td className="p-3 text-gray-300">{k.desc}</td>
              <td className="p-3 text-gray-400">{k.examples}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${k.approval === '无需审批' ? 'bg-green-900/50 text-green-400' : k.approval === '需要审批' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                  {k.approval}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 工具生命周期流程图
function ToolLifecycleFlow() {
  const steps = [
    { phase: '定义', icon: '📝', steps: ['声明参数 Schema', '定义 Kind 类型', '编写描述信息'] },
    { phase: '验证', icon: '✅', steps: ['JSON Schema 校验', '自定义验证逻辑', '路径安全检查'] },
    { phase: '确认', icon: '🔐', steps: ['检查审批模式', '展示确认 UI', '等待用户响应'] },
    { phase: '执行', icon: '⚡', steps: ['执行核心逻辑', '流式输出更新', '错误处理'] },
    { phase: '返回', icon: '📤', steps: ['构建返回结果', '记录遥测数据', '通知 UI 更新'] },
  ];

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-amber-700/50">
      <h4 className="text-lg font-semibold text-amber-300 mb-4">🔄 工具生命周期</h4>
      <div className="grid grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className="text-center mb-3">
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className="text-amber-400 font-semibold">{step.phase}</div>
            </div>
            <div className="space-y-1">
              {step.steps.map((s, j) => (
                <div key={j} className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                  {s}
                </div>
              ))}
            </div>
            {i < steps.length - 1 && (
              <div className="absolute top-8 -right-2 text-gray-600">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Introduction 组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full text-left group"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4 flex items-center gap-3">
          🔧 工具开发者指南
          <span className={`text-lg text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </h1>
      </button>

      {isExpanded && (
        <div className="space-y-4 text-gray-300 animate-fadeIn">
          <p className="text-lg">
            Gemini CLI 的工具系统采用<strong className="text-amber-300">声明式架构</strong>，
            将工具定义、参数验证和执行逻辑分离。本指南将教你如何开发自定义工具。
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-amber-900/30 rounded-xl border border-amber-600/30">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-amber-300">声明式定义</h3>
              <p className="text-sm text-gray-400 mt-1">使用 JSON Schema 定义参数结构</p>
            </div>
            <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-600/30">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-cyan-300">安全第一</h3>
              <p className="text-sm text-gray-400 mt-1">内置路径验证和审批机制</p>
            </div>
            <div className="p-4 bg-green-900/30 rounded-xl border border-green-600/30">
              <div className="text-3xl mb-2">🔌</div>
              <h3 className="font-semibold text-green-300">易于扩展</h3>
              <p className="text-sm text-gray-400 mt-1">继承基类快速实现新工具</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 核心概念章节
function CoreConceptsSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        工具系统的核心由三个层次组成：<code className="text-amber-400">ToolBuilder</code>（接口）、
        <code className="text-purple-400">DeclarativeTool</code>（基类）、
        <code className="text-green-400">ToolInvocation</code>（执行实例）。
      </p>

      <ToolArchitectureDiagram />

      <DesignRationaleCard
        title="为什么分离 Builder 和 Invocation"
        why="工具定义是静态的（schema、描述），但每次调用的参数是动态的"
        how="ToolBuilder 负责定义和验证，ToolInvocation 封装特定调用的参数和执行逻辑"
        benefit="复用工具定义，隔离执行状态，支持取消和流式输出"
      />

      <CodeBlock
        title="核心接口定义 - packages/core/src/tools/tools.ts"
        code={`// 工具构建器接口
interface ToolBuilder<TParams, TResult> {
  name: string;           // 内部名称 (如 'Edit')
  displayName: string;    // 显示名称 (如 '编辑文件')
  description: string;    // 工具描述
  kind: Kind;             // 工具类型 (权限相关)
  schema: FunctionDeclaration;  // JSON Schema
  isOutputMarkdown: boolean;    // 输出是否为 Markdown
  canUpdateOutput: boolean;     // 是否支持流式输出

  build(params: TParams): ToolInvocation<TParams, TResult>;
}

// 工具执行实例接口
interface ToolInvocation<TParams, TResult> {
  params: TParams;

  getDescription(): string;        // 执行前的描述
  toolLocations(): ToolLocation[]; // 影响的文件路径
  shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
  execute(signal: AbortSignal, updateOutput?: Function): Promise<TResult>;
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">工具类型 (Kind)</h4>
      <p className="text-gray-400 text-sm mb-4">
        Kind 决定工具的权限级别和审批需求：
      </p>

      <ToolKindTable />

      <ToolLifecycleFlow />
    </div>
  );
}

// 实现自定义工具章节
function ImplementationSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        下面通过一个完整示例展示如何实现自定义工具。我们将创建一个简单的
        <code className="text-amber-400">WordCount</code> 工具。
      </p>

      <h4 className="text-lg font-semibold text-gray-200 mt-6">1. 定义参数接口</h4>
      <CodeBlock
        title="参数类型定义"
        code={`interface WordCountParams {
  file_path: string;  // 目标文件路径
  include_spaces?: boolean;  // 是否统计空格
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">2. 定义 JSON Schema</h4>
      <CodeBlock
        title="参数 Schema"
        code={`const wordCountSchema = {
  type: 'object',
  properties: {
    file_path: {
      type: 'string',
      description: 'The absolute path to the file to count words in',
    },
    include_spaces: {
      type: 'boolean',
      description: 'Whether to include spaces in the character count',
      default: false,
    },
  },
  required: ['file_path'],
};`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">3. 实现 Invocation 类</h4>
      <CodeBlock
        title="执行实例实现"
        code={`class WordCountInvocation extends BaseToolInvocation<WordCountParams, ToolResult> {
  constructor(
    private readonly config: Config,
    params: WordCountParams,
  ) {
    super(params);
  }

  // 描述本次操作
  getDescription(): string {
    return \`Count words in \${this.params.file_path}\`;
  }

  // 声明影响的路径（用于权限检查）
  toolLocations(): ToolLocation[] {
    return [{ path: this.params.file_path }];
  }

  // 执行核心逻辑
  async execute(signal: AbortSignal): Promise<ToolResult> {
    // 检查取消信号
    if (signal.aborted) {
      return { output: 'Aborted' };
    }

    // 读取文件
    const content = await this.config
      .getFileSystemService()
      .readTextFile(this.params.file_path);

    // 统计
    const words = content.split(/\\s+/).filter(w => w.length > 0).length;
    const chars = this.params.include_spaces
      ? content.length
      : content.replace(/\\s/g, '').length;
    const lines = content.split('\\n').length;

    return {
      output: \`Words: \${words}\\nCharacters: \${chars}\\nLines: \${lines}\`,
    };
  }
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">4. 实现 Tool 类</h4>
      <CodeBlock
        title="工具类实现"
        code={`export class WordCountTool extends BaseDeclarativeTool<WordCountParams, ToolResult> {
  constructor(private readonly config: Config) {
    super(
      'WordCount',          // name
      'Word Count',         // displayName
      'Count words, characters, and lines in a file',  // description
      Kind.Read,            // kind (只读，无需审批)
      wordCountSchema,      // parameterSchema
      false,                // isOutputMarkdown
      false,                // canUpdateOutput
    );
  }

  // 自定义验证逻辑（可选）
  validateToolParams(params: WordCountParams): string | null {
    if (!params.file_path.startsWith('/')) {
      return 'file_path must be an absolute path';
    }
    return null;  // 验证通过
  }

  // 构建执行实例
  build(params: WordCountParams): ToolInvocation<WordCountParams, ToolResult> {
    return new WordCountInvocation(this.config, params);
  }
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">5. 注册工具</h4>
      <CodeBlock
        title="在 ToolRegistry 中注册"
        code={`// packages/core/src/tools/tool-registry.ts
import { WordCountTool } from './wordCount.js';

export function createToolRegistry(config: Config): ToolRegistry {
  const registry = new ToolRegistry();

  // ... 其他工具注册

  registry.registerTool(new WordCountTool(config));

  return registry;
}`}
      />

      <DesignRationaleCard
        title="为什么使用 Config 注入"
        why="工具需要访问文件系统、配置、遥测等服务"
        how="通过构造函数注入 Config 对象，按需获取所需服务"
        benefit="解耦工具实现和具体服务，便于测试和复用"
      />
    </div>
  );
}

// 高级特性章节
function AdvancedFeaturesSection() {
  return (
    <div className="pt-6 space-y-4">
      <h4 className="text-lg font-semibold text-gray-200">流式输出</h4>
      <p className="text-gray-400 text-sm mb-4">
        对于长时间运行的工具，可以使用 <code className="text-cyan-400">updateOutput</code> 回调实时更新输出：
      </p>

      <CodeBlock
        title="流式输出示例"
        code={`async execute(
  signal: AbortSignal,
  updateOutput?: (output: ToolResultDisplay) => void,
): Promise<ToolResult> {
  for (let i = 0; i < 100; i++) {
    if (signal.aborted) break;

    // 更新进度
    updateOutput?.({
      output: \`Processing... \${i + 1}%\`,
      isPartial: true,
    });

    await new Promise(r => setTimeout(r, 100));
  }

  return { output: 'Done!' };
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">用户确认</h4>
      <p className="text-gray-400 text-sm mb-4">
        对于危险操作，可以实现 <code className="text-purple-400">shouldConfirmExecute</code> 请求用户确认：
      </p>

      <CodeBlock
        title="请求用户确认"
        code={`async shouldConfirmExecute(
  abortSignal: AbortSignal,
): Promise<ToolCallConfirmationDetails | false> {
  // 检查审批模式
  const approvalMode = this.config.getApprovalMode();
  if (approvalMode === ApprovalMode.TRUST) {
    return false;  // 信任模式无需确认
  }

  // 返回确认详情
  return {
    type: 'edit',  // 或 'shell', 'agent' 等
    details: {
      filePath: this.params.file_path,
      diff: createDiff(oldContent, newContent),
    },
  };
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">路径安全检查</h4>
      <CodeBlock
        title="工作区边界检查"
        code={`private resolveAndValidatePath(relativePath: string): string {
  const targetPath = path.resolve(this.config.getTargetDir(), relativePath);

  // 安全检查：确保路径在工作区内
  const workspaceContext = this.config.getWorkspaceContext();
  if (!workspaceContext.isPathWithinWorkspace(targetPath)) {
    throw new Error(
      \`Path validation failed: \${relativePath} is outside workspace\`
    );
  }

  return targetPath;
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">错误处理</h4>
      <CodeBlock
        title="使用 ToolErrorType"
        code={`import { ToolErrorType } from './tool-error.js';

// 在执行中返回错误信息
if (!fileExists) {
  return {
    output: '',
    error: {
      display: \`File not found: \${filePath}\`,
      raw: \`ENOENT: \${filePath}\`,
      type: ToolErrorType.FILE_NOT_FOUND,
    },
  };
}`}
      />

      <DesignRationaleCard
        title="为什么区分 display 和 raw 错误信息"
        why="display 用于展示给用户，raw 用于调试和日志"
        how="ToolResult 可以包含 error 对象，分别指定两种格式"
        benefit="用户看到友好提示，开发者可以看到详细错误"
      />
    </div>
  );
}

// 最佳实践章节
function BestPracticesSection() {
  return (
    <div className="pt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-900/20 rounded-xl border border-green-700/50">
          <h4 className="text-green-400 font-semibold mb-2">✓ 推荐做法</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 总是验证路径在工作区内</li>
            <li>• 使用 AbortSignal 支持取消</li>
            <li>• 对危险操作请求用户确认</li>
            <li>• 使用 Config 获取服务而非直接导入</li>
            <li>• 编写完整的 JSDoc 注释</li>
            <li>• 使用明确的 Kind 类型</li>
          </ul>
        </div>
        <div className="p-4 bg-red-900/20 rounded-xl border border-red-700/50">
          <h4 className="text-red-400 font-semibold mb-2">✗ 避免做法</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• 直接使用 fs 模块（使用 FileSystemService）</li>
            <li>• 忽略取消信号</li>
            <li>• 在 build() 中执行 I/O 操作</li>
            <li>• 使用相对路径而非绝对路径</li>
            <li>• 硬编码配置值</li>
            <li>• 忽略错误处理</li>
          </ul>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-200 mt-6">测试模式</h4>
      <CodeBlock
        title="单元测试示例"
        code={`import { describe, it, expect, vi } from 'vitest';
import { WordCountTool } from './wordCount.js';

describe('WordCountTool', () => {
  const mockConfig = {
    getFileSystemService: () => ({
      readTextFile: vi.fn().mockResolvedValue('hello world'),
    }),
    getWorkspaceContext: () => ({
      isPathWithinWorkspace: () => true,
    }),
  };

  it('should count words correctly', async () => {
    const tool = new WordCountTool(mockConfig as any);
    const invocation = tool.build({ file_path: '/test.txt' });
    const result = await invocation.execute(new AbortController().signal);

    expect(result.output).toContain('Words: 2');
  });

  it('should validate absolute paths', () => {
    const tool = new WordCountTool(mockConfig as any);
    const error = tool.validateToolParams({ file_path: 'relative/path' });

    expect(error).toBe('file_path must be an absolute path');
  });
});`}
      />
    </div>
  );
}

// 关联页面配置
const toolDevRelatedPages = [
  { id: 'tool-ref', label: '工具参考', description: '所有内置工具的完整文档' },
  { id: 'tool-scheduler', label: '工具调度详解', description: '了解工具如何被调度执行' },
  { id: 'tool-arch', label: '工具架构', description: '工具系统的整体架构' },
  { id: 'approval-mode', label: '审批模式', description: '了解权限审批机制' },
  { id: 'tool-scheduler-anim', label: '工具调度动画', description: '可视化调度过程' },
];

// 主组件
export function ToolDeveloperGuide() {
  const [introExpanded, setIntroExpanded] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <Introduction isExpanded={introExpanded} onToggle={() => setIntroExpanded(!introExpanded)} />

      <CollapsibleSection
        title="核心概念"
        icon="🏗️"
        defaultOpen={true}
        highlight
      >
        <CoreConceptsSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="实现自定义工具"
        icon="⚙️"
        defaultOpen={true}
        highlight
      >
        <ImplementationSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="高级特性"
        icon="🚀"
        defaultOpen={false}
      >
        <AdvancedFeaturesSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="最佳实践"
        icon="📋"
        defaultOpen={false}
      >
        <BestPracticesSection />
      </CollapsibleSection>

      <RelatedPages title="📚 相关页面" pages={toolDevRelatedPages} />
    </div>
  );
}
