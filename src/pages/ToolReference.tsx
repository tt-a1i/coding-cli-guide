import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'tool-arch', label: '工具架构', description: '工具系统设计详解' },
 { id: 'tool-scheduler', label: '工具调度', description: '调度器状态机' },
 { id: 'tool-dev-guide', label: '工具开发', description: '自定义工具开发指南' },
 { id: 'approval-mode', label: '审批模式', description: '权限控制机制' },
 { id: 'mcp', label: 'MCP 集成', description: '外部工具集成' },
 { id: 'glossary', label: '术语表', description: '术语快速索引' },
];

/**
 * Tool Reference Page - 工具系统参考
 *
 * 聚焦于内置工具的分类、参数规范、注册机制和使用指南
 * Source: packages/core/src/tools/*.ts
 */
export function ToolReference() {
 // 工具注册和发现流程
 const toolRegistrationFlow = `flowchart TD
 start([启动 Gemini CLI])
 init_config[初始化 Config]
 create_registry[createToolRegistry]
 register_core[注册核心工具]
 register_optional[条件注册 tools<br/>write_todos / agents]
 discover[discoverAllTools<br/>discovered_tool_*]
 sort[sortTools]
 build_schema[生成 FunctionDeclaration<br/>parametersJsonSchema]
 gemini_tools[传给模型的 tools[]]
 available[工具可用]

 start --> init_config
 init_config --> create_registry
 create_registry --> register_core
 register_core --> register_optional
 register_optional --> discover
 discover --> sort
 sort --> build_schema
 build_schema --> gemini_tools
 gemini_tools --> available

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style available fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style create_registry fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style build_schema fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 // 工具 Kind 分类系统
 const toolKindClassification = `flowchart LR
 subgraph Read["🔵 Read (只读)"]
 read_file[read_file]
 read_many[read_many_files]
 end

 subgraph Search["🟢 Search (搜索)"]
 list_dir[list_directory]
 grep[search_file_content]
 glob[glob]
 web_search[google_web_search]
 end

 subgraph Edit["🟡 Edit (修改)"]
 replace[replace]
 write[write_file]
 end

 subgraph Execute["🟠 Execute (执行)"]
 shell[run_shell_command]
 end

 subgraph Think["🔵 Think (思考)"]
 memory[save_memory]
 delegate[delegate_to_agent]
 end

 subgraph Fetch["🌐 Fetch (网络)"]
 web_fetch[web_fetch]
 end

 subgraph Other["⚪ Other (其他)"]
 todo[write_todos]
 skill[activate_skill]
 end

 style Read fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Search fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Edit fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Execute fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Think fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Fetch fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Other fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}`;

 // 工具调用生命周期
 const toolInvocationLifecycle = `sequenceDiagram
 participant AI as AI Model
 participant Scheduler as ToolScheduler
 participant Registry as Tool Registry
 participant Tool as DeclarativeTool
 participant Inv as ToolInvocation

 AI->>Scheduler: schedule(tool_call)
 Scheduler->>Registry: getToolByName(name)
 Registry-->>Scheduler: DeclarativeTool
 Scheduler->>Tool: build(args) (schema validate)
 Tool-->>Scheduler: ToolInvocation | Error
 Scheduler->>Inv: shouldConfirmExecute()
 Inv-->>Scheduler: false | confirmationDetails | Error(DENY)
 Scheduler->>Inv: execute(signal, updateOutput?)
 activate Inv
 Inv->>Inv: process logic
 Inv-->>Scheduler: ToolResult
 deactivate Inv
 Scheduler->>Scheduler: convertToFunctionResponse()
 Scheduler-->>AI: FunctionResponse`;

 return (
 <div className="space-y-8 animate-fadeIn">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-heading">工具系统参考手册</h2>
 <p className="text-body mt-2">
 Gemini CLI 内置工具分类、参数规范与注册机制完整指南
 </p>
 </div>

 {/* 🎯 目标 */}
 <Layer title="目标">
 <div className="space-y-3 text-body">
 <p>
 工具系统是 Gemini CLI 的核心能力，提供了 AI 与本地环境交互的标准化接口。
 主要解决以下问题：
 </p>
 <ul className="list-disc list-inside space-y-2 ml-4">
 <li>
 <strong className="text-heading">标准化 AI 能力</strong> -
 通过统一的工具接口，让 AI 可以执行文件读写、代码搜索、Shell 命令等操作
 </li>
 <li>
 <strong className="text-heading">安全控制</strong> -
 通过 Kind 分类和 ApprovalMode，精确控制哪些操作需要用户确认
 </li>
 <li>
 <strong className="text-heading">扩展性</strong> -
 支持 MCP 外部工具和自定义工具，灵活扩展 AI 能力边界
 </li>
 <li>
 <strong className="text-heading">可维护性</strong> -
 清晰的工具分类和参数规范，便于开发和调试
 </li>
 </ul>
 </div>
 </Layer>

 {/* 工具来源说明 */}
 <Layer title="工具来源说明">
 <div className="space-y-4">
 <p className="text-body">
 Gemini CLI 的工具系统由三种来源组成,提供了从核心功能到动态扩展的完整能力：
 </p>

 <div className="space-y-6">
 {/* Core 工具 */}
 <div>
 <h4 className="text-heading font-semibold mb-2">Core 注册工具</h4>
 <p className="text-body text-sm mb-3">
 来源: <code>config.ts#createToolRegistry()</code>。默认注册到 ToolRegistry，实际启用受 <code>coreTools</code>、<code>tools.allowed</code> 等配置影响。
 </p>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 text-sm text-body mb-3">
 <div><code className="text-heading text-xs">LSTool</code> list_directory</div>
 <div><code className="text-heading text-xs">ReadFileTool</code> read_file</div>
 <div><code className="text-heading text-xs">GrepTool</code> search_file_content</div>
 <div><code className="text-heading text-xs">RipGrepTool</code> search_file_content*</div>
 <div><code className="text-heading text-xs">GlobTool</code> glob</div>
 <div><code className="text-heading text-xs">SmartEditTool</code> replace</div>
 <div><code className="text-heading text-xs">WriteFileTool</code> write_file</div>
 <div><code className="text-heading text-xs">ShellTool</code> run_shell_command</div>
 <div><code className="text-heading text-xs">WebFetchTool</code> web_fetch</div>
 <div><code className="text-heading text-xs">WebSearchTool</code> google_web_search</div>
 <div><code className="text-heading text-xs">MemoryTool</code> save_memory</div>
 <div><code className="text-heading text-xs">ActivateSkillTool</code> activate_skill</div>
 <div><code className="text-heading text-xs">WriteTodosTool</code> write_todos</div>
 <div><code className="text-heading text-xs">DelegateToAgentTool</code> delegate_to_agent</div>
 </div>
 <p className="text-dim text-xs">
 * RipGrepTool/GrepTool 运行时二选一。WriteTodosTool 仅在开启时注册。DelegateToAgentTool 仅在 agents 启用时注册。
 </p>
 </div>

 {/* tool-names.ts */}
 <div>
 <h4 className="text-heading font-semibold mb-2">tool-names.ts 常量</h4>
 <p className="text-body text-sm mb-3">
 来源: <code>packages/core/src/tools/tool-names.ts</code>，共 14 个核心工具名称常量。
 </p>
 <div className="flex flex-wrap gap-1.5">
 {['glob', 'write_file', 'web_fetch', 'run_shell_command', 'read_many_files', 'list_directory', 'activate_skill', 'write_todos', 'google_web_search', 'replace', 'search_file_content', 'read_file', 'save_memory', 'delegate_to_agent'].map(name => (
 <code key={name} className="text-xs px-1.5 py-0.5 bg-surface border border-edge rounded">{name}</code>
 ))}
 </div>
 </div>

 {/* 动态工具 */}
 <div>
 <h4 className="text-heading font-semibold mb-2">动态工具（MCP + Extensions）</h4>
 <p className="text-body text-sm">
 通过 MCP 协议和扩展系统在运行时动态注册。包括 <strong>MCP 工具</strong>（Model Context Protocol）和 <strong>Discovered 工具</strong>（运行时发现的扩展），根据配置和环境动态加载。
 </p>
 </div>
 </div>

 <div className="bg-elevated/20 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">工具来源架构图</h4>
 <div className="text-xs text-body font-mono space-y-1">
 <div className="flex items-center space-x-2">
 <span className="text-heading">Static</span>
 <span>→ tool-names.ts 定义的核心工具 (编译时确定)</span>
 </div>
 <div className="flex items-center space-x-2">
 <span className="text-heading">Built-in</span>
 <span>→ 其他内建工具 (运行时注册, 非 tool-names.ts 常量)</span>
 </div>
 <div className="flex items-center space-x-2">
 <span className="text-heading">Dynamic</span>
 <span>→ MCP + Extensions (运行时动态加载)</span>
 </div>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-3">
 <p className="text-sm text-heading">
 <strong>重要提示：</strong> <code>tool-names.ts</code> 定义的是核心工具常量,
 但不是工具系统的唯一来源。实际可用工具还包括内建工具和动态加载的 MCP 工具。
 </p>
 </div>
 </div>
 </Layer>

 {/* 📥 输入 */}
 <Layer title="输入">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="工具调用请求" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-body">来自 AI Model 的工具调用：</p>
 <ul className="space-y-1 text-body">
 <li><code className="text-heading">name</code> - 工具名称（必须匹配 ToolRegistry 已注册的工具名）</li>
 <li><code className="text-heading">callId</code> - 唯一调用标识符</li>
 <li><code className="text-heading">args</code> - JSON 参数对象</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="工具注册配置" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body">工具系统初始化依赖：</p>
 <ul className="space-y-1 text-body">
 <li><code className="text-heading">Config</code> - 配置对象（工作目录、临时目录等）</li>
 <li><code className="text-heading">allowedTools</code> - 白名单工具列表</li>
 <li><code className="text-heading">ApprovalMode</code> - 审批模式设置</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 📤 输出 */}
 <Layer title="输出">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="Gemini 格式响应" variant="yellow">
 <CodeBlock
 code={`// 内部使用 Gemini FunctionResponse 格式
{
 role: 'user',
 parts: [{
 functionResponse: {
 id: 'call_xxx',
 name: 'read_file',
 response: {
 output: '文件内容...',
 error: null
 }
 }
 }]
}`}
 />
 </HighlightBox>

 <HighlightBox title="（fork-only）OpenAI 兼容格式" variant="green">
 <CodeBlock
 code={`// 发送到 OpenAI API 时转换为
{
 role: 'tool',
 tool_call_id: 'call_xxx',
 content: '文件内容...'
}`}
 />
 </HighlightBox>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-3 mt-4">
 <p className="text-sm text-heading">
 <strong>重要：</strong> 上游 Gemini CLI 内部统一使用 Gemini 格式（<code>functionCall</code>/<code>functionResponse</code>）。
 OpenAI 的 <code>role=tool</code>/<code>tool_calls</code> 属于某些 fork 的额外兼容层，不是上游核心链路。
 </p>
 </div>
 </Layer>

 {/* 📁 关键文件与入口 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">核心定义文件</h4>
 <div className="text-xs font-mono space-y-1 text-body">
 <div className="flex justify-between">
 <code>packages/core/src/tools/tool-names.ts</code>
 <span className="text-heading">核心工具名称常量</span>
 </div>
 <div className="flex justify-between">
 <code>packages/core/src/tools/tools.ts</code>
 <span className="text-heading">Kind / ToolInvocation / 基类</span>
 </div>
 <div className="flex justify-between">
 <code>packages/core/src/tools/tool-registry.ts</code>
 <span className="text-heading">注册表 + 发现机制</span>
 </div>
 </div>
 <div className="mt-2 text-xs text-heading">
 注: tool-names.ts 定义核心工具,另有内建工具和 MCP 动态工具
 </div>
 </div>

 <div className="bg-base rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">工具实现文件</h4>
 <div className="text-xs font-mono space-y-1 text-body">
 <div>packages/core/src/tools/edit.ts</div>
 <div>packages/core/src/tools/write-file.ts</div>
 <div>packages/core/src/tools/read-file.ts</div>
 <div>packages/core/src/tools/read-many-files.ts</div>
 <div>packages/core/src/tools/grep.ts</div>
 <div>packages/core/src/tools/ripGrep.ts</div>
 <div>packages/core/src/tools/glob.ts</div>
 <div>packages/core/src/tools/ls.ts</div>
 <div>packages/core/src/tools/shell.ts</div>
 <div>packages/core/src/tools/memoryTool.ts</div>
 <div>packages/core/src/tools/write-todos.ts</div>
 <div>packages/core/src/tools/activate-skill.ts</div>
 <div>packages/core/src/tools/web-fetch.ts</div>
 <div>packages/core/src/tools/web-search.ts</div>
 <div>packages/core/src/agents/delegate-</div>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">注册和调度</h4>
 <div className="text-xs font-mono space-y-1 text-body">
 <div className="flex justify-between">
 <code>packages/core/src/config/config.ts#createToolRegistry()</code>
 <span className="text-heading">组装 ToolRegistry</span>
 </div>
 <div className="flex justify-between">
 <code>packages/core/src/core/coreToolScheduler.ts</code>
 <span className="text-heading">工具调度器</span>
 </div>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">工具工具函数</h4>
 <div className="text-xs font-mono space-y-1 text-body">
 <div>packages/core/src/utils/tool-utils.ts</div>
 <div className="text-dim mt-1">白名单匹配、工具查找等</div>
 </div>
 </div>
 </div>
 </Layer>

 {/* 📊 流程图 */}
 <Layer title="流程图">
 <div className="space-y-6">
 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">工具注册和发现流程</h4>
 <MermaidDiagram chart={toolRegistrationFlow} title="Tool Registration Flow" />
 </div>

 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">工具 Kind 分类体系</h4>
 <MermaidDiagram chart={toolKindClassification} title="Tool Kind Classification" />
 </div>

 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">工具调用生命周期</h4>
 <MermaidDiagram chart={toolInvocationLifecycle} title="Tool Invocation Lifecycle" />
 </div>
 </div>
 </Layer>

 {/* ⚡ 关键分支与边界条件 */}
 <Layer title="关键分支与边界条件">
 <div className="space-y-4">
 <HighlightBox title="工具名称区分大小写" variant="red">
 <p className="text-sm text-body mb-2">
 工具名称必须完全匹配 <code>ToolRegistry</code> 中已注册的工具名（大小写敏感）。
 <code>tool-names.ts</code> 是内置工具名常量表，但实际可用工具还包括 discovered_tool_* 与 MCP 工具。
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">错误写法</th>
 <th className="py-1 px-2">正确写法</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge bg-elevated">
 <td className="py-1 px-2 text-heading line-through">'bash'</td>
 <td className="py-1 px-2 text-heading">'run_shell_command'</td>
 <td className="py-1 px-2 font-sans text-body">Shell 工具正确名称</td>
 </tr>
 <tr className="border- border-edge bg-elevated">
 <td className="py-1 px-2 text-heading line-through">'grep'</td>
 <td className="py-1 px-2 text-heading">'search_file_content'</td>
 <td className="py-1 px-2 font-sans text-body">内容搜索工具的 <code>name</code>（旧称 Grep/RipGrep）</td>
 </tr>
 <tr className="border- border-edge bg-elevated">
 <td className="py-1 px-2 text-heading line-through">'memory'</td>
 <td className="py-1 px-2 text-heading">'save_memory'</td>
 <td className="py-1 px-2 font-sans text-body">Memory 工具正确名称</td>
 </tr>
 <tr className="bg-elevated">
 <td className="py-1 px-2 text-heading line-through">'read'</td>
 <td className="py-1 px-2 text-heading">'read_file'</td>
 <td className="py-1 px-2 font-sans text-body">读取文件工具的 <code>name</code></td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 <HighlightBox title="Kind 分类决定审批行为" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <code>Kind</code> 是 PolicyEngine 决策的重要维度之一，但不是"硬编码的自动批准/必须确认"。最终取决于：policy rules、approvalMode、
 以及 shell 子命令/重定向等解析结果。
 </p>
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-surface rounded p-2">
 <h5 className="font-semibold text-heading mb-1">常见默认更"容易放行"</h5>
 <ul className="space-y-1 text-body text-xs">
 <li><code className="text-heading">Kind.Read</code> - 只读操作</li>
 <li><code className="text-heading">Kind.Search</code> - 搜索操作</li>
 <li><code className="text-heading font-medium">Kind.Fetch</code> - 抓取类工具</li>
 <li><code className="text-heading">Kind.Think</code> - 代理/记忆等</li>
 </ul>
 </div>
 <div className="bg-surface rounded p-2">
 <h5 className="font-semibold text-heading mb-1">常见默认更"需要确认"</h5>
 <ul className="space-y-1 text-body text-xs">
 <li><code className="text-heading">Kind.Edit</code> - 修改文件</li>
 <li><code className="text-heading">Kind.Execute</code> - 执行命令</li>
 <li><code className="text-heading">Kind.Delete/Kind.Move</code> - 破坏性操作</li>
 <li><code className="text-body">Kind.Other</code> - 注入/扩展类操作</li>
 </ul>
 </div>
 </div>
 </div>
 </HighlightBox>

 <HighlightBox title="参数验证失败" variant="red">
 <p className="text-sm text-body mb-2">
 每个工具都有严格的参数 Schema，违反规范会导致执行失败：
 </p>
 <ul className="text-xs text-body space-y-1">
 <li>必需参数缺失 → <code className="text-heading">error: Missing required parameter</code></li>
 <li>类型不匹配 → <code className="text-heading">error: Invalid parameter type</code></li>
 <li>路径/目录不在工作区 → <code className="text-heading">error: Path is not within workspace</code></li>
 </ul>
 </HighlightBox>

 <HighlightBox title="📌 Edit 工具命名说明" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-heading font-medium">
 <strong>命名约定：</strong> 文件编辑工具的 API 名称是 <code className="text-heading">replace</code>，
 常量名是 <code className="text-heading">EDIT_TOOL_NAME</code>。
 </p>
 <div>
 <h5 className="font-semibold text-heading mb-1">EDIT_TOOL_NAMES 集合</h5>
 <ul className="space-y-1 text-body">
 <li><code className="text-heading">replace</code> - 文件内容替换工具</li>
 <li><code className="text-heading">write_file</code> - 文件写入工具</li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-heading mb-1">用途</h5>
 <ul className="space-y-1 text-body">
 <li><strong>AUTO_EDIT 模式：</strong> 自动批准 EDIT_TOOL_NAMES 集合中的工具</li>
 <li><strong>Checkpointing：</strong> 在执行 EDIT_TOOL_NAMES 工具前创建检查点</li>
 </ul>
 </div>
 <div className="bg-elevated/20 border border-edge rounded p-2 mt-2">
 <p className="text-xs text-body">
 <strong>源码：</strong> packages/core/src/tools/tool-names.ts
 </p>
 </div>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 🔧 失败与恢复 */}
 <Layer title="失败与恢复">
 <div className="space-y-4">
 <HighlightBox title="工具未找到" variant="red">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <strong>错误：</strong> 工具名称未在 ToolRegistry 中注册（或被禁用）
 </p>
 <CodeBlock
 code={`// 错误响应
{
 status: 'error',
 error: 'Tool not found: bash',
 suggestion: 'Available tools: read_file, write_file, ...'
}`}
 />
 <p className="text-heading">
 <strong>恢复策略：</strong> 检查当前会话的工具列表（ToolRegistry）或参考 <code>tool-names.ts</code> 的内置工具名常量
 </p>
 </div>
 </HighlightBox>

 <HighlightBox title="参数验证失败" variant="yellow">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <strong>错误：</strong> 参数类型或格式不符合 Schema 要求
 </p>
 <CodeBlock
 code={`// 错误响应
{
 status: 'error',
 error: 'Invalid parameters provided. Reason: "file_path" must be a string',
 received: { file_path: 123 }
}`}
 />
 <p className="text-heading">
 <strong>恢复策略：</strong> 参考工具参数 Schema，调整参数格式
 </p>
 </div>
 </HighlightBox>

 <HighlightBox title="ApprovalMode 限制" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">
 <strong>场景：</strong> 在非 YOLO 模式下执行需要确认的工具
 </p>
 <CodeBlock
 code={`// ApprovalMode 决策
{
 approvalMode: 'default', // 或 'autoEdit'
 toolKind: Kind.Edit,
 decision: PolicyDecision.ASK_USER // 需要用户确认
}`}
 />
 <p className="text-heading">
 <strong>恢复策略：</strong> 等待用户确认或切换到 YOLO 模式
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* ⚙️ 相关配置项 */}
 <Layer title="相关配置项">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-2 px-3">配置项</th>
 <th className="py-2 px-3">类型</th>
 <th className="py-2 px-3">默认值</th>
 <th className="py-2 px-3">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code className="text-heading">approvalMode</code></td>
 <td className="py-2 px-3">ApprovalMode</td>
 <td className="py-2 px-3"><code>DEFAULT</code></td>
 <td className="py-2 px-3">工具审批模式（DEFAULT/AUTO_EDIT/YOLO）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code className="text-heading">allowedTools</code></td>
 <td className="py-2 px-3">string[]</td>
 <td className="py-2 px-3"><code>[]</code></td>
 <td className="py-2 px-3">白名单工具列表，支持精确匹配和模式匹配</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code className="text-heading">enableToolOutputTruncation</code></td>
 <td className="py-2 px-3">boolean</td>
 <td className="py-2 px-3"><code>true</code></td>
 <td className="py-2 px-3">是否启用工具输出截断</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code className="text-heading">truncateToolOutputThreshold</code></td>
 <td className="py-2 px-3">number</td>
 <td className="py-2 px-3"><code>50000</code></td>
 <td className="py-2 px-3">输出截断阈值（字符数）</td>
 </tr>
 <tr>
 <td className="py-2 px-3"><code className="text-heading">truncateToolOutputLines</code></td>
 <td className="py-2 px-3">number</td>
 <td className="py-2 px-3"><code>100</code></td>
 <td className="py-2 px-3">截断后保留的行数</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* 工具名称常量表 */}
 <Layer title="tool-names.ts 常量表（14 个内置工具名）">
 <p className="text-body mb-4">
 来源: <code className="text-heading">packages/core/src/tools/tool-names.ts</code>
 <span className="text-heading ml-2">(工具名常量表 ≠ 实际会话可用工具)</span>
 </p>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-2 px-3">常量</th>
 <th className="py-2 px-3">工具名称 (API)</th>
 <th className="py-2 px-3">类名</th>
 <th className="py-2 px-3">Kind</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">EDIT</td>
 <td className="py-2 px-3 text-heading">'replace'</td>
 <td className="py-2 px-3">SmartEditTool / EditTool</td>
 <td className="py-2 px-3 text-heading">Edit</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">WRITE_FILE</td>
 <td className="py-2 px-3 text-heading">'write_file'</td>
 <td className="py-2 px-3">WriteFileTool</td>
 <td className="py-2 px-3 text-heading">Edit</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">READ_FILE</td>
 <td className="py-2 px-3 text-heading">'read_file'</td>
 <td className="py-2 px-3">ReadFileTool</td>
 <td className="py-2 px-3 text-heading">Read</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">READ_MANY_FILES</td>
 <td className="py-2 px-3 text-heading">'read_many_files'</td>
 <td className="py-2 px-3">ReadManyFilesTool</td>
 <td className="py-2 px-3 text-heading">Read</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">GREP</td>
 <td className="py-2 px-3 text-heading">'search_file_content'</td>
 <td className="py-2 px-3">GrepTool / RipGrepTool</td>
 <td className="py-2 px-3 text-heading">Search</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">GLOB</td>
 <td className="py-2 px-3 text-heading">'glob'</td>
 <td className="py-2 px-3">GlobTool</td>
 <td className="py-2 px-3 text-heading">Search</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">SHELL</td>
 <td className="py-2 px-3 text-heading">'run_shell_command'</td>
 <td className="py-2 px-3">ShellTool</td>
 <td className="py-2 px-3 text-heading">Execute</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">TODO_WRITE</td>
 <td className="py-2 px-3 text-heading">'write_todos'</td>
 <td className="py-2 px-3">WriteTodosTool</td>
 <td className="py-2 px-3 text-body">Other</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">MEMORY</td>
 <td className="py-2 px-3 text-heading">'save_memory'</td>
 <td className="py-2 px-3">MemoryTool</td>
 <td className="py-2 px-3 text-heading">Think</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">LS</td>
 <td className="py-2 px-3 text-heading">'list_directory'</td>
 <td className="py-2 px-3">LSTool</td>
 <td className="py-2 px-3 text-heading">Search</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">WEB_SEARCH</td>
 <td className="py-2 px-3 text-heading">'google_web_search'</td>
 <td className="py-2 px-3">WebSearchTool</td>
 <td className="py-2 px-3 text-heading">Search</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">WEB_FETCH</td>
 <td className="py-2 px-3 text-heading">'web_fetch'</td>
 <td className="py-2 px-3">WebFetchTool</td>
 <td className="py-2 px-3 text-accent">Fetch</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3 text-heading">ACTIVATE_SKILL</td>
 <td className="py-2 px-3 text-heading">'activate_skill'</td>
 <td className="py-2 px-3">ActivateSkillTool</td>
 <td className="py-2 px-3 text-body">Other</td>
 </tr>
 <tr>
 <td className="py-2 px-3 text-heading">DELEGATE_TO_AGENT</td>
 <td className="py-2 px-3 text-heading">'delegate_to_agent'</td>
 <td className="py-2 px-3">DelegateToAgentTool</td>
 <td className="py-2 px-3 text-heading">Think</td>
 </tr>
 </tbody>
 </table>
 </div>

 <CodeBlock
 title="tool-names.ts - 源码"
 code={`// packages/core/src/tools/tool-names.ts
export const GLOB_TOOL_NAME = 'glob';
export const WRITE_TODOS_TOOL_NAME = 'write_todos';
export const WRITE_FILE_TOOL_NAME = 'write_file';
export const WEB_SEARCH_TOOL_NAME = 'google_web_search';
export const WEB_FETCH_TOOL_NAME = 'web_fetch';
export const EDIT_TOOL_NAME = 'replace'; // 注意: 不是 'edit'
export const SHELL_TOOL_NAME = 'run_shell_command';
export const GREP_TOOL_NAME = 'search_file_content';
export const READ_MANY_FILES_TOOL_NAME = 'read_many_files';
export const READ_FILE_TOOL_NAME = 'read_file';
export const LS_TOOL_NAME = 'list_directory';
export const MEMORY_TOOL_NAME = 'save_memory';
export const ACTIVATE_SKILL_TOOL_NAME = 'activate_skill';
export const DELEGATE_TO_AGENT_TOOL_NAME = 'delegate_to_agent';

export const ALL_BUILTIN_TOOL_NAMES = [...] as const; // 14 个内置工具`}
 />

 <div className="bg-elevated/20 border border-edge rounded-lg p-3 mt-4">
 <p className="text-sm text-heading">
 <strong>补充说明：</strong> 上述表格包含 ALL_BUILTIN_TOOL_NAMES 中的全部 14 个内置工具。此外还有：
 </p>
 <ul className="text-xs text-body mt-2 space-y-1 ml-4">
 <li>MCP 工具 - 通过 Model Context Protocol 动态注册的外部工具</li>
 <li>Extension 工具 - 运行时发现的扩展工具</li>
 <li>Agent 内部工具 - 如 <code className="text-heading">get_internal_docs</code>（仅限内部使用）</li>
 </ul>
 </div>
 </Layer>

 {/* 工具参数 Schema 详解 */}
 <Layer title="工具参数 Schema (详解)">
 {/* replace */}
 <HighlightBox title="replace - 文件编辑" variant="yellow">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/edit.ts</code> | Kind: <span className="text-heading">Edit</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">file_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；建议使用相对路径）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">old_string</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">要替换的文本</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">new_string</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">替换后的文本</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">expected_replacements</td>
 <td className="py-1 px-2">number</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">预期替换次数 (默认1)</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="py-1 px-2 text-heading">instruction</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">编辑说明，用于 LLM 修复与自纠错</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="py-1 px-2 text-heading">modified_by_user</td>
 <td className="py-1 px-2">boolean</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">标记是否由用户手动修改</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="py-1 px-2 text-heading">ai_proposed_content</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">初始提议内容，用于修复/重试</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* write_file */}
 <HighlightBox title="write_file - 文件写入" variant="yellow">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/write-file.ts</code> | Kind: <span className="text-heading">Edit</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">file_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；建议使用相对路径）</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">content</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">文件内容</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* read_file */}
 <HighlightBox title="read_file - 文件读取" variant="blue">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/read-file.ts</code> | Kind: <span className="text-heading">Read</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">file_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；offset 为 0-based 行号）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">offset</td>
 <td className="py-1 px-2">number</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">起始行号</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">limit</td>
 <td className="py-1 px-2">number</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">读取行数</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* search_file_content */}
 <HighlightBox title="search_file_content - 内容搜索" variant="green">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/grep.ts</code> | Kind: <span className="text-heading">Search</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">pattern</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">正则表达式</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">dir_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">搜索目录（相对 targetDir；会做 workspace 校验）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">include</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">文件过滤 (如 "*.js")</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* glob */}
 <HighlightBox title="glob - 文件查找" variant="green">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/glob.ts</code> | Kind: <span className="text-heading">Search</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">pattern</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">Glob 模式 (如 "**/*.ts")</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">dir_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">搜索目录（相对 targetDir；会做 workspace 校验）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">case_sensitive</td>
 <td className="py-1 px-2">boolean</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">大小写敏感 (默认 false)</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">respect_git_ignore</td>
 <td className="py-1 px-2">boolean</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">尊重 .gitignore (默认 true)</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">respect_gemini_ignore</td>
 <td className="py-1 px-2">boolean</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">尊重 .geminiignore (默认 true)</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* run_shell_command */}
 <HighlightBox title="run_shell_command - Shell 执行" variant="orange">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/shell.ts</code> | Kind: <span className="text-heading">Execute</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">command</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">要执行的命令</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">description</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">命令简述</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">dir_path</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-body">No</td>
 <td className="py-1 px-2 font-sans">工作目录（相对 targetDir；不传则使用当前工作目录）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* save_memory */}
 <HighlightBox title="save_memory - 记忆保存" variant="blue">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/memoryTool.ts</code> | Kind: <span className="text-heading">Think</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">fact</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">要记住的事实</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>

 {/* write_todos */}
 <HighlightBox title="write_todos - 任务管理" variant="blue">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/write-todos.ts</code> | Kind: <span className="text-body">Other</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr>
 <td className="py-1 px-2 text-heading">todos</td>
 <td className="py-1 px-2">TodoItem[]</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">任务列表</td>
 </tr>
 </tbody>
 </table>
 </div>
 <div className="mt-2 text-xs text-body">
 <p>TodoItem 结构:</p>
 <pre className="mt-1 text-heading">{`{ id: string, content: string, status: 'pending' | 'in_progress' | 'completed' }`}</pre>
 </div>
 </HighlightBox>

 {/* activate_skill */}
 <HighlightBox title="activate_skill - 激活技能" variant="purple">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/tools/activate-skill.ts</code> | Kind: <span className="text-body">Other</span>
 </p>
 <p className="text-sm text-body mb-3">
 激活 Agent Skills（技能系统）。执行后会把技能指令以 <code>&lt;ACTIVATED_SKILL&gt;</code> 包裹返回给模型，
 并附带该技能目录的文件结构（作为可用资源提示）。通常在 PolicyEngine 决策为 <code>ASK_USER</code> 时，会展示确认提示并列出将共享的资源。
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr>
 <td className="py-1 px-2 text-heading">name</td>
 <td className="py-1 px-2">string</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">要激活的 skill 名称（启用 skills 后会被收敛为枚举）</td>
 </tr>
 </tbody>
 </table>
 </div>
 <div className="mt-3 text-xs text-body">
 相关：<code>packages/core/src/skills/skillManager.ts</code>（技能发现/覆盖优先级）、
 <code>packages/core/src/core/prompts.ts</code>（System Prompt 注入可用技能清单）。
 </div>
 </HighlightBox>

 {/* delegate_to_agent */}
 <HighlightBox title="delegate_to_agent - 子代理调度" variant="purple">
 <p className="text-sm text-body mb-2">
 来源: <code>packages/core/src/agents/delegate-</code> | Kind: <span className="text-heading">Think</span>
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="text-left text-body border- border-edge">
 <th className="py-1 px-2">参数</th>
 <th className="py-1 px-2">类型</th>
 <th className="py-1 px-2">必需</th>
 <th className="py-1 px-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono">
 <tr className="border- border-edge">
 <td className="py-1 px-2 text-heading">agent_name</td>
 <td className="py-1 px-2">string (enum)</td>
 <td className="py-1 px-2 text-heading">Yes</td>
 <td className="py-1 px-2 font-sans">要委托的 agent 名称（由 AgentRegistry 动态生成）</td>
 </tr>
 <tr>
 <td className="py-1 px-2 text-heading">...agentInputs</td>
 <td className="py-1 px-2">depends on agent</td>
 <td className="py-1 px-2 text-body">Depends</td>
 <td className="py-1 px-2 font-sans">不同 agent 暴露不同输入参数（由 inputConfig 定义）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* 为什么这样设计 */}
 <Layer title="为什么这样设计">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-5 border border-edge/30">
 <h4 className="text-heading font-bold font-mono mb-3">Kind 分类驱动权限</h4>
 <p className="text-body text-sm leading-relaxed">
 工具按 Kind（read/edit/delete/move/search/execute/think/fetch/other）分类，提供一个"粗粒度安全语义"。
 PolicyEngine 会结合 Kind、toolName、argsPattern（尤其是 shell）、serverName（MCP）与 approvalMode 等信息，输出
 ALLOW / ASK_USER / DENY。
 </p>
 </div>

 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover">
 <h4 className="text-heading font-bold font-mono mb-3">统一的参数规范</h4>
 <p className="text-body text-sm leading-relaxed">
 所有工具通过 <code>parametersJsonSchema</code> 描述参数结构，CLI 用 SchemaValidator 做统一校验。
 常见字段名（如 <code>file_path</code>/<code>dir_path</code>/<code>prompt</code>）在工具间保持一致；
 路径通常会在工具内部 resolve 到 targetDir，并在必要时做 workspace 校验与过滤（.gitignore/.geminiignore）。
 </p>
 </div>

 <div className="bg-surface rounded-lg p-5 border border-edge/30">
 <h4 className="text-heading font-bold font-mono mb-3">内部协议统一（上游）</h4>
 <p className="text-body text-sm leading-relaxed">
 上游 gemini-cli 端到端使用 Gemini 的 <code>functionCall</code>/<code>functionResponse</code> 与结构化流式事件；
 不包含 OpenAI 的 <code>tool_calls</code>/<code>role=tool</code> 转换逻辑。
 如需对接 OpenAI-compatible API，通常会在 fork 的外围增加格式转换层（fork-only）。
 </p>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
