import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

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
    register_tools[registerTools]
    create_instances[创建工具实例]
    group_by_kind[按 Kind 分组]
    build_schema[构建 JSON Schema]
    gemini_tools[Gemini Tools Array]
    available[工具可用]

    start --> init_config
    init_config --> register_tools
    register_tools --> create_instances
    create_instances --> group_by_kind
    group_by_kind --> build_schema
    build_schema --> gemini_tools
    gemini_tools --> available

    style start fill:#22d3ee,color:#000
    style available fill:#22c55e,color:#000
    style register_tools fill:#a855f7,color:#fff
    style build_schema fill:#f59e0b,color:#000`;

  // 工具 Kind 分类系统
  const toolKindClassification = `flowchart LR
    subgraph Read["🔵 Read (只读)"]
      read_file[read_file]
      read_many[read_many_files]
      list_dir[list_directory]
    end

    subgraph Search["🟢 Search (搜索)"]
      grep[search_file_content]
      glob[glob]
    end

    subgraph Edit["🟡 Edit (修改)"]
      edit[replace]
      write[write_file]
    end

    subgraph Execute["🟠 Execute (执行)"]
      shell[run_shell_command]
    end

    subgraph Think["🔵 Think (思考)"]
      todo[write_todos]
      memory[save_memory]
    end

    subgraph Fetch["🌐 Fetch (网络)"]
      web_search[google_web_search]
      web_fetch[web_fetch]
    end

    subgraph Other["⚪ Other (其他)"]
      task[delegate_to_agent]
    end

    style Read fill:#3b82f6,color:#fff
    style Search fill:#22c55e,color:#000
    style Edit fill:#f59e0b,color:#000
    style Execute fill:#f97316,color:#fff
    style Think fill:#6366f1,color:#fff
    style Fetch fill:#06b6d4,color:#fff
    style Other fill:#6b7280,color:#fff`;

  // 工具调用生命周期
  const toolInvocationLifecycle = `sequenceDiagram
    participant AI as AI Model
    participant Scheduler as ToolScheduler
    participant Registry as Tool Registry
    participant Tool as Tool Implementation

    AI->>Scheduler: schedule(tool_call)
    Scheduler->>Registry: getToolByName(name)
    Registry-->>Scheduler: Tool Instance
    Scheduler->>Tool: validateParams(args)
    Tool-->>Scheduler: validation result
    Scheduler->>Tool: shouldConfirmExecute()
    Tool-->>Scheduler: null (auto-approve) or details
    Scheduler->>Tool: execute(params)
    activate Tool
    Tool->>Tool: process logic
    Tool-->>Scheduler: output (string | Part[])
    deactivate Tool
    Scheduler->>Scheduler: convertToFunctionResponse()
    Scheduler-->>AI: FunctionResponse`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">工具系统参考手册</h2>
        <p className="text-gray-400 mt-2">
          Gemini CLI 内置工具分类、参数规范与注册机制完整指南
        </p>
      </div>

      {/* 🎯 目标 */}
      <Layer title="目标" icon="🎯">
        <div className="space-y-3 text-gray-300">
          <p>
            工具系统是 Gemini CLI 的核心能力，提供了 AI 与本地环境交互的标准化接口。
            主要解决以下问题：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-cyan-400">标准化 AI 能力</strong> -
              通过统一的工具接口，让 AI 可以执行文件读写、代码搜索、Shell 命令等操作
            </li>
            <li>
              <strong className="text-cyan-400">安全控制</strong> -
              通过 Kind 分类和 ApprovalMode，精确控制哪些操作需要用户确认
            </li>
            <li>
              <strong className="text-cyan-400">扩展性</strong> -
              支持 MCP 外部工具和自定义工具，灵活扩展 AI 能力边界
            </li>
            <li>
              <strong className="text-cyan-400">可维护性</strong> -
              清晰的工具分类和参数规范，便于开发和调试
            </li>
          </ul>
        </div>
      </Layer>

      {/* 工具来源说明 */}
      <Layer title="工具来源说明" icon="🔍">
        <div className="space-y-4">
          <p className="text-gray-300">
            Gemini CLI 的工具系统由三种来源组成,提供了从核心功能到动态扩展的完整能力：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="Core 内置工具 (13个)" variant="blue">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">来源: config.ts:1092-1178</p>
                <p className="text-gray-400 text-xs mb-2">
                  在 <code className="text-cyan-300">createToolRegistry()</code> 中注册的所有核心工具
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="text-gray-400">• <code className="text-cyan-300">TaskTool</code> - 子任务委托</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">LSTool</code> - 列出目录</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ReadFileTool</code> - 读取文件</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ReadManyFilesTool</code> - 批量读取</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">GrepTool</code> - 内容搜索</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">RipGrepTool</code> - 快速搜索*</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">GlobTool</code> - 文件匹配</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">EditTool</code> - 编辑文件</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">SmartEditTool</code> - 智能编辑*</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WriteFileTool</code> - 写入文件</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ShellTool</code> - 执行命令</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">MemoryTool</code> - 保存记忆</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">TodoWriteTool</code> - 待办事项</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">AskUserQuestionTool</code> - 询问用户</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WebFetchTool</code> - 网页获取</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WebSearchTool</code> - 网页搜索*</div>
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  * 条件注册: RipGrep/Grep、SmartEdit/Edit 二选一；WebSearch 需配置
                </p>
              </div>
            </HighlightBox>

            <HighlightBox title="tool-names.ts 常量" variant="green">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">来源: tool-names.ts</p>
                <p className="text-gray-400 text-xs mb-2">
                  核心工具名称常量（非完整工具列表）
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="text-gray-400">• <code className="text-cyan-300">edit</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">write_file</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">read_file</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">read_many_files</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">search_file_content</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">glob</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">run_shell_command</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">write_todos</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">save_memory</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">list_directory</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">google_web_search</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">web_fetch</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">delegate_to_agent</code></div>
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  共 13 个内置工具 (packages/core/src/tools/tool-names.ts)
                </p>
              </div>
            </HighlightBox>

            <HighlightBox title="动态工具" variant="purple">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">MCP + Extensions</p>
                <p className="text-gray-400">
                  通过 MCP 协议和扩展系统动态注册的工具
                </p>
                <ul className="space-y-1 text-gray-400 text-xs">
                  <li>• <strong>MCP 工具</strong> - 通过 Model Context Protocol 动态注册</li>
                  <li>• <strong>Discovered 工具</strong> - 运行时发现的扩展工具</li>
                </ul>
                <p className="text-purple-300 text-xs mt-2">
                  这些工具在运行时根据配置和环境动态加载
                </p>
              </div>
            </HighlightBox>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-semibold mb-2">工具来源架构图</h4>
            <div className="text-xs text-gray-400 font-mono space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">📦 Static</span>
                <span>→ tool-names.ts 定义的核心工具 (编译时确定)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">🔧 Built-in</span>
                <span>→ 其他内建工具 (运行时注册, 非 ToolNames)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400">🔌 Dynamic</span>
                <span>→ MCP + Extensions (运行时动态加载)</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-300">
              <strong>重要提示：</strong> <code>tool-names.ts</code> 定义的是核心工具常量,
              但不是工具系统的唯一来源。实际可用工具还包括内建工具和动态加载的 MCP 工具。
            </p>
          </div>
        </div>
      </Layer>

      {/* 📥 输入 */}
      <Layer title="输入" icon="📥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="工具调用请求" variant="blue">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">来自 AI Model 的工具调用：</p>
              <ul className="space-y-1 text-gray-400">
                <li>• <code className="text-cyan-300">name</code> - 工具名称（必须匹配 ToolRegistry 已注册的工具名）</li>
                <li>• <code className="text-cyan-300">callId</code> - 唯一调用标识符</li>
                <li>• <code className="text-cyan-300">args</code> - JSON 参数对象</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="工具注册配置" variant="green">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">工具系统初始化依赖：</p>
              <ul className="space-y-1 text-gray-400">
                <li>• <code className="text-cyan-300">Config</code> - 配置对象（工作目录、临时目录等）</li>
                <li>• <code className="text-cyan-300">allowedTools</code> - 白名单工具列表</li>
                <li>• <code className="text-cyan-300">ApprovalMode</code> - 审批模式设置</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 📤 输出 */}
      <Layer title="输出" icon="📤">
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

          <HighlightBox title="OpenAI 兼容格式" variant="green">
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

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-yellow-300">
            <strong>重要：</strong> Gemini CLI 内部统一使用 Gemini 格式，
            仅在与 OpenAI 兼容 API 通信时才进行格式转换。
          </p>
        </div>
      </Layer>

      {/* 📁 关键文件与入口 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">核心定义文件</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div className="flex justify-between">
                <code>packages/core/src/tools/tool-names.ts</code>
                <span className="text-purple-400">核心工具名称常量</span>
              </div>
              <div className="flex justify-between">
                <code>packages/core/src/tools/tools.ts:584</code>
                <span className="text-purple-400">Kind 枚举定义</span>
              </div>
              <div className="flex justify-between">
                <code>packages/core/src/tools/tools.ts:1-500</code>
                <span className="text-purple-400">工具基类和接口</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-300">
              注: tool-names.ts 定义核心工具,另有内建工具和 MCP 动态工具
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">工具实现文件</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>packages/core/src/tools/edit.ts</div>
              <div>packages/core/src/tools/write-file.ts</div>
              <div>packages/core/src/tools/read-file.ts</div>
              <div>packages/core/src/tools/grep.ts</div>
              <div>packages/core/src/tools/glob.ts</div>
              <div>packages/core/src/tools/shell.ts</div>
              <div>packages/core/src/tools/memoryTool.ts</div>
              <div>packages/core/src/tools/todoWrite.ts</div>
              <div>packages/core/src/agents/delegate-to-agent-tool.ts</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">注册和调度</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div className="flex justify-between">
                <code>packages/core/src/config/config.ts:1092</code>
                <span className="text-green-400">registerTools()</span>
              </div>
              <div className="flex justify-between">
                <code>packages/core/src/core/coreToolScheduler.ts</code>
                <span className="text-green-400">工具调度器</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">工具工具函数</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>packages/core/src/utils/tool-utils.ts</div>
              <div className="text-gray-500 mt-1">白名单匹配、工具查找等</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 📊 流程图 */}
      <Layer title="流程图" icon="📊">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">工具注册和发现流程</h4>
            <MermaidDiagram chart={toolRegistrationFlow} title="Tool Registration Flow" />
          </div>

          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">工具 Kind 分类体系</h4>
            <MermaidDiagram chart={toolKindClassification} title="Tool Kind Classification" />
          </div>

          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">工具调用生命周期</h4>
            <MermaidDiagram chart={toolInvocationLifecycle} title="Tool Invocation Lifecycle" />
          </div>
        </div>
      </Layer>

      {/* ⚡ 关键分支与边界条件 */}
      <Layer title="关键分支与边界条件" icon="⚡">
        <div className="space-y-4">
          <HighlightBox title="工具名称区分大小写" variant="red">
            <p className="text-sm text-gray-300 mb-2">
              工具名称必须完全匹配 <code>ToolNames</code> 常量，大小写敏感。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-1 px-2">错误写法</th>
                    <th className="py-1 px-2">正确写法</th>
                    <th className="py-1 px-2">说明</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 font-mono">
                  <tr className="border-b border-gray-800 bg-red-900/10">
                    <td className="py-1 px-2 text-red-400 line-through">'bash'</td>
                    <td className="py-1 px-2 text-green-400">'run_shell_command'</td>
                    <td className="py-1 px-2 font-sans text-gray-400">Shell 工具正确名称</td>
                  </tr>
                  <tr className="border-b border-gray-800 bg-red-900/10">
                    <td className="py-1 px-2 text-red-400 line-through">'grep'</td>
                    <td className="py-1 px-2 text-green-400">'search_file_content'</td>
                    <td className="py-1 px-2 font-sans text-gray-400">Grep 工具正确名称</td>
                  </tr>
                  <tr className="border-b border-gray-800 bg-red-900/10">
                    <td className="py-1 px-2 text-red-400 line-through">'memory'</td>
                    <td className="py-1 px-2 text-green-400">'save_memory'</td>
                    <td className="py-1 px-2 font-sans text-gray-400">Memory 工具正确名称</td>
                  </tr>
                  <tr className="bg-red-900/10">
                    <td className="py-1 px-2 text-red-400 line-through">'read'</td>
                    <td className="py-1 px-2 text-green-400">'read_file'</td>
                    <td className="py-1 px-2 font-sans text-gray-400">Read 工具正确名称</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>

          <HighlightBox title="Kind 分类决定审批行为" variant="purple">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">工具的 Kind 决定了是否需要用户确认：</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded p-2">
                  <h5 className="font-semibold text-green-300 mb-1">自动批准 Kind</h5>
                  <ul className="space-y-1 text-gray-400 text-xs">
                    <li>• <code className="text-blue-300">Read</code> - 只读操作</li>
                    <li>• <code className="text-green-300">Search</code> - 搜索操作</li>
                    <li>• <code className="text-blue-300">Think</code> - 思考类工具</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <h5 className="font-semibold text-yellow-300 mb-1">需要确认 Kind</h5>
                  <ul className="space-y-1 text-gray-400 text-xs">
                    <li>• <code className="text-yellow-300">Edit</code> - 修改文件</li>
                    <li>• <code className="text-orange-300">Execute</code> - 执行命令</li>
                    <li>• <code className="text-gray-300">Other</code> - 其他操作</li>
                  </ul>
                </div>
              </div>
            </div>
          </HighlightBox>

          <HighlightBox title="参数验证失败" variant="red">
            <p className="text-sm text-gray-300 mb-2">
              每个工具都有严格的参数 Schema，违反规范会导致执行失败：
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 必需参数缺失 → <code className="text-red-400">error: Missing required parameter</code></li>
              <li>• 类型不匹配 → <code className="text-red-400">error: Invalid parameter type</code></li>
              <li>• 路径必须为绝对路径 → <code className="text-red-400">error: Path must be absolute</code></li>
            </ul>
          </HighlightBox>

          <HighlightBox title="📌 Edit 工具命名说明" variant="blue">
            <div className="text-sm space-y-2">
              <p className="text-blue-200">
                <strong>命名约定：</strong> 文件编辑工具的 API 名称是 <code className="text-cyan-300">replace</code>，
                常量名是 <code className="text-purple-300">EDIT_TOOL_NAME</code>。
              </p>
              <div>
                <h5 className="font-semibold text-blue-300 mb-1">EDIT_TOOL_NAMES 集合</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>• <code className="text-cyan-300">replace</code> - 文件内容替换工具</li>
                  <li>• <code className="text-cyan-300">write_file</code> - 文件写入工具</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-blue-300 mb-1">用途</h5>
                <ul className="space-y-1 text-gray-300">
                  <li>• <strong>AUTO_EDIT 模式：</strong> 自动批准 EDIT_TOOL_NAMES 集合中的工具</li>
                  <li>• <strong>Checkpointing：</strong> 在执行 EDIT_TOOL_NAMES 工具前创建检查点</li>
                </ul>
              </div>
              <div className="bg-blue-900/20 border border-blue-600/30 rounded p-2 mt-2">
                <p className="text-xs text-blue-200">
                  <strong>源码：</strong> packages/core/src/tools/tool-names.ts
                </p>
              </div>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 🔧 失败与恢复 */}
      <Layer title="失败与恢复" icon="🔧">
        <div className="space-y-4">
          <HighlightBox title="工具未找到" variant="red">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                <strong>错误：</strong> 工具名称不存在于 ToolNames 或工具未注册
              </p>
              <CodeBlock
                code={`// 错误响应
{
  status: 'error',
  error: 'Tool not found: bash',
  suggestion: 'Available tools: read_file, write_file, ...'
}`}
              />
              <p className="text-cyan-300">
                <strong>恢复策略：</strong> 检查 <code>ToolNames</code> 常量表，使用正确的工具名称
              </p>
            </div>
          </HighlightBox>

          <HighlightBox title="参数验证失败" variant="yellow">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                <strong>错误：</strong> 参数类型或格式不符合 Schema 要求
              </p>
              <CodeBlock
                code={`// 错误响应
{
  status: 'error',
  error: 'Invalid parameter: file_path must be absolute',
  received: './relative/path.ts'
}`}
              />
              <p className="text-cyan-300">
                <strong>恢复策略：</strong> 参考工具参数 Schema，调整参数格式
              </p>
            </div>
          </HighlightBox>

          <HighlightBox title="ApprovalMode 限制" variant="purple">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                <strong>场景：</strong> 在非 YOLO 模式下执行需要确认的工具
              </p>
              <CodeBlock
                code={`// ApprovalMode 决策
{
  approvalMode: 'default',  // 或 'autoEdit'
  toolKind: 'Edit',
  decision: PolicyDecision.ASK_USER  // 需要用户确认
}`}
              />
              <p className="text-cyan-300">
                <strong>恢复策略：</strong> 等待用户确认或切换到 YOLO 模式
              </p>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* ⚙️ 相关配置项 */}
      <Layer title="相关配置项" icon="⚙️">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">配置项</th>
                <th className="py-2 px-3">类型</th>
                <th className="py-2 px-3">默认值</th>
                <th className="py-2 px-3">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3"><code className="text-cyan-400">approvalMode</code></td>
                <td className="py-2 px-3">ApprovalMode</td>
                <td className="py-2 px-3"><code>DEFAULT</code></td>
                <td className="py-2 px-3">工具审批模式（DEFAULT/AUTO_EDIT/YOLO）</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3"><code className="text-cyan-400">allowedTools</code></td>
                <td className="py-2 px-3">string[]</td>
                <td className="py-2 px-3"><code>[]</code></td>
                <td className="py-2 px-3">白名单工具列表，支持精确匹配和模式匹配</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3"><code className="text-cyan-400">enableToolOutputTruncation</code></td>
                <td className="py-2 px-3">boolean</td>
                <td className="py-2 px-3"><code>true</code></td>
                <td className="py-2 px-3">是否启用工具输出截断</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3"><code className="text-cyan-400">truncateToolOutputThreshold</code></td>
                <td className="py-2 px-3">number</td>
                <td className="py-2 px-3"><code>50000</code></td>
                <td className="py-2 px-3">输出截断阈值（字符数）</td>
              </tr>
              <tr>
                <td className="py-2 px-3"><code className="text-cyan-400">truncateToolOutputLines</code></td>
                <td className="py-2 px-3">number</td>
                <td className="py-2 px-3"><code>100</code></td>
                <td className="py-2 px-3">截断后保留的行数</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 工具名称常量表 */}
      <Layer title="核心工具名称常量表 (ToolNames)" icon="🏷️">
        <p className="text-gray-300 mb-4">
          来源: <code className="text-cyan-400">packages/core/src/tools/tool-names.ts</code>
          <span className="text-yellow-400 ml-2">(核心工具定义,非全部工具)</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">常量</th>
                <th className="py-2 px-3">工具名称 (API)</th>
                <th className="py-2 px-3">类名</th>
                <th className="py-2 px-3">Kind</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 font-mono">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">EDIT</td>
                <td className="py-2 px-3 text-cyan-400">'replace'</td>
                <td className="py-2 px-3">EditTool</td>
                <td className="py-2 px-3 text-yellow-400">Edit</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WRITE_FILE</td>
                <td className="py-2 px-3 text-cyan-400">'write_file'</td>
                <td className="py-2 px-3">WriteFileTool</td>
                <td className="py-2 px-3 text-yellow-400">Edit</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">READ_FILE</td>
                <td className="py-2 px-3 text-cyan-400">'read_file'</td>
                <td className="py-2 px-3">ReadFileTool</td>
                <td className="py-2 px-3 text-blue-400">Read</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">READ_MANY_FILES</td>
                <td className="py-2 px-3 text-cyan-400">'read_many_files'</td>
                <td className="py-2 px-3">ReadManyFilesTool</td>
                <td className="py-2 px-3 text-blue-400">Read</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">GREP</td>
                <td className="py-2 px-3 text-cyan-400">'search_file_content'</td>
                <td className="py-2 px-3">GrepTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">GLOB</td>
                <td className="py-2 px-3 text-cyan-400">'glob'</td>
                <td className="py-2 px-3">GlobTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">SHELL</td>
                <td className="py-2 px-3 text-cyan-400">'run_shell_command'</td>
                <td className="py-2 px-3">ShellTool</td>
                <td className="py-2 px-3 text-orange-400">Execute</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">TODO_WRITE</td>
                <td className="py-2 px-3 text-cyan-400">'write_todos'</td>
                <td className="py-2 px-3">TodoWriteTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">MEMORY</td>
                <td className="py-2 px-3 text-cyan-400">'save_memory'</td>
                <td className="py-2 px-3">MemoryTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">LS</td>
                <td className="py-2 px-3 text-cyan-400">'list_directory'</td>
                <td className="py-2 px-3">LsTool</td>
                <td className="py-2 px-3 text-blue-400">Read</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WEB_SEARCH</td>
                <td className="py-2 px-3 text-cyan-400">'google_web_search'</td>
                <td className="py-2 px-3">WebSearchTool</td>
                <td className="py-2 px-3 text-teal-400">Fetch</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WEB_FETCH</td>
                <td className="py-2 px-3 text-cyan-400">'web_fetch'</td>
                <td className="py-2 px-3">WebFetchTool</td>
                <td className="py-2 px-3 text-teal-400">Fetch</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-purple-400">DELEGATE_TO_AGENT</td>
                <td className="py-2 px-3 text-cyan-400">'delegate_to_agent'</td>
                <td className="py-2 px-3">DelegateToAgentTool</td>
                <td className="py-2 px-3 text-gray-400">Other</td>
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
export const EDIT_TOOL_NAME = 'replace';        // 注意: 不是 'edit'
export const SHELL_TOOL_NAME = 'run_shell_command';
export const GREP_TOOL_NAME = 'search_file_content';
export const READ_MANY_FILES_TOOL_NAME = 'read_many_files';
export const READ_FILE_TOOL_NAME = 'read_file';
export const LS_TOOL_NAME = 'list_directory';
export const MEMORY_TOOL_NAME = 'save_memory';
export const DELEGATE_TO_AGENT_TOOL_NAME = 'delegate_to_agent';

export const ALL_BUILTIN_TOOL_NAMES = [...] as const; // 13 个内置工具`}
        />

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-300">
            <strong>补充说明：</strong> 上述表格包含 ALL_BUILTIN_TOOL_NAMES 中的全部 13 个内置工具。此外还有：
          </p>
          <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4">
            <li>• MCP 工具 - 通过 Model Context Protocol 动态注册的外部工具</li>
            <li>• Extension 工具 - 运行时发现的扩展工具</li>
            <li>• Agent 内部工具 - 如 <code className="text-cyan-300">get_internal_docs</code>（仅限内部使用）</li>
          </ul>
        </div>
      </Layer>

      {/* 工具参数 Schema 详解 */}
      <Layer title="工具参数 Schema (详解)" icon="📋">
        {/* edit */}
        <HighlightBox title="edit - 文件编辑" icon="✏️" variant="yellow">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/edit.ts</code> | Kind: <span className="text-yellow-400">Edit</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">file_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">old_string</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要替换的文本</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">new_string</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">替换后的文本</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">expected_replacements</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">预期替换次数 (默认1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* write_file */}
        <HighlightBox title="write_file - 文件写入" icon="📝" variant="yellow">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/write-file.ts</code> | Kind: <span className="text-yellow-400">Edit</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">file_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">content</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">文件内容</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* read_file */}
        <HighlightBox title="read_file - 文件读取" icon="📖" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/read-file.ts</code> | Kind: <span className="text-blue-400">Read</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">absolute_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">绝对路径</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">offset</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">起始行号</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">limit</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">读取行数</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* search_file_content */}
        <HighlightBox title="search_file_content - 内容搜索" icon="🔍" variant="green">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/grep.ts</code> | Kind: <span className="text-green-400">Search</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">pattern</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">正则表达式</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">include</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">文件过滤 (如 "*.js")</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">maxResults</td>
                  <td className="py-1 px-2">number</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">最大结果数 (默认20, 最大100)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* glob */}
        <HighlightBox title="glob - 文件查找" icon="📁" variant="green">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/glob.ts</code> | Kind: <span className="text-green-400">Search</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">pattern</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">Glob 模式 (如 "**/*.ts")</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">case_sensitive</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">大小写敏感 (默认 false)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">respect_git_ignore</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">尊重 .gitignore (默认 true)</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">respect_gemini_ignore</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">尊重 .geminiignore (默认 true)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* run_shell_command */}
        <HighlightBox title="run_shell_command - Shell 执行" icon="💻" variant="orange">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/shell.ts</code> | Kind: <span className="text-orange-400">Execute</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">command</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要执行的命令</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">is_background</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">是否后台执行</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">description</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">命令简述</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">directory</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">工作目录 (绝对路径)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* save_memory */}
        <HighlightBox title="save_memory - 记忆保存" icon="🧠" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/memoryTool.ts</code> | Kind: <span className="text-blue-400">Think</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">fact</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要记住的事实</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">scope</td>
                  <td className="py-1 px-2">'global' | 'project'</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">保存范围</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* write_todos */}
        <HighlightBox title="write_todos - 任务管理" icon="✅" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/todoWrite.ts</code> | Kind: <span className="text-blue-400">Think</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr>
                  <td className="py-1 px-2 text-cyan-400">todos</td>
                  <td className="py-1 px-2">TodoItem[]</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务列表</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <p>TodoItem 结构:</p>
            <pre className="mt-1 text-cyan-400">{`{ id: string, content: string, status: 'pending' | 'in_progress' | 'completed' }`}</pre>
          </div>
        </HighlightBox>

        {/* delegate_to_agent */}
        <HighlightBox title="delegate_to_agent - 子代理调度" icon="🤖" variant="purple">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/agents/delegate-to-agent-tool.ts</code> | Kind: <span className="text-gray-400">Other</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-1 px-2">参数</th>
                  <th className="py-1 px-2">类型</th>
                  <th className="py-1 px-2">必需</th>
                  <th className="py-1 px-2">说明</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-mono">
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">description</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务简述 (3-5 词)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">prompt</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">任务指令</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">subagent_type</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">子代理类型</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计" icon="💡">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-lg p-5 border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold font-mono mb-3">Kind 分类驱动权限</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              工具按 Kind（Read、Edit、Delete、Move、Search、Execute、Think、Fetch、Other，共 9 种）分类，而非按功能分类。
              这种设计让审批系统可以基于操作类型而非工具名称做决策：
              只读操作（Read/Search/Fetch/Think）自动放行，修改操作（Edit/Delete/Move/Execute）需要确认。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-[var(--purple)]/10 rounded-lg p-5 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-bold font-mono mb-3">统一的参数规范</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              所有工具使用 JSON Schema 定义参数。文件路径必须是绝对路径，这避免了工作目录歧义；
              必需参数和可选参数清晰区分，让 AI 能够正确构造调用请求。
              统一的规范减少了工具开发者的心智负担，也让 AI 更容易学习工具使用模式。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--terminal-green)]/10 rounded-lg p-5 border border-[var(--cyber-blue)]/30">
            <h4 className="text-[var(--cyber-blue)] font-bold font-mono mb-3">内部格式统一</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              无论后端使用哪个 AI 厂商，内部统一使用 Gemini 格式的 FunctionResponse。
              这种设计将厂商差异隔离在转换层，核心工具逻辑完全不感知底层 API 的格式变化。
              添加新厂商支持只需实现格式转换，不需要修改任何工具代码。
            </p>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
