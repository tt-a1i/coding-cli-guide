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

    style start fill:#22d3ee,color:#000
    style available fill:#22c55e,color:#000
    style create_registry fill:#a855f7,color:#fff
    style build_schema fill:#f59e0b,color:#000`;

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
            <HighlightBox title="Core 注册工具（默认 + 条件）" variant="blue">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">来源: packages/core/src/config/config.ts#createToolRegistry()</p>
                <p className="text-gray-400 text-xs mb-2">
                  这是“默认会注册到 ToolRegistry 的工具实现”。实际启用还会受 <code className="text-cyan-300">coreTools</code>、
                  <code className="text-cyan-300">allowedTools</code>、平台能力（ripgrep）、agents 开关等影响。
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="text-gray-400">• <code className="text-cyan-300">LSTool</code> - list_directory</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ReadFileTool</code> - read_file</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">GrepTool</code> - search_file_content</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">RipGrepTool</code> - search_file_content*</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">GlobTool</code> - glob</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">SmartEditTool</code> - replace</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WriteFileTool</code> - write_file</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ShellTool</code> - run_shell_command</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WebFetchTool</code> - web_fetch</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WebSearchTool</code> - google_web_search</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">MemoryTool</code> - save_memory</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">ActivateSkillTool</code> - activate_skill</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">WriteTodosTool</code> - write_todos†</div>
                  <div className="text-gray-400">• <code className="text-cyan-300">DelegateToAgentTool</code> - delegate_to_agent‡</div>
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  * RipGrep/Grep 在运行时二选一（对模型同名）。† 仅在 useWriteTodos 开启时注册。‡ 仅在 agents 启用且 allowedTools 允许时注册。
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  备注：仓库中存在 <code className="text-cyan-300">ReadManyFilesTool</code> 实现与 <code className="text-cyan-300">read_many_files</code> 名称常量，
                  但默认 createToolRegistry() 当前未注册它（不同版本可能调整）。
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
                  <div className="text-gray-400">• <code className="text-cyan-300">glob</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">write_todos</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">write_file</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">google_web_search</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">web_fetch</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">replace</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">run_shell_command</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">search_file_content</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">read_many_files</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">read_file</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">list_directory</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">save_memory</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">activate_skill</code></div>
                  <div className="text-gray-400">• <code className="text-cyan-300">delegate_to_agent</code></div>
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  共 14 个内置工具 (packages/core/src/tools/tool-names.ts)
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
                <span>→ 其他内建工具 (运行时注册, 非 tool-names.ts 常量)</span>
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

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-yellow-300">
            <strong>重要：</strong> 上游 Gemini CLI 内部统一使用 Gemini 格式（<code>functionCall</code>/<code>functionResponse</code>）。
            OpenAI 的 <code>role=tool</code>/<code>tool_calls</code> 属于某些 fork 的额外兼容层，不是上游核心链路。
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
                <code>packages/core/src/tools/tools.ts</code>
                <span className="text-purple-400">Kind / ToolInvocation / 基类</span>
              </div>
              <div className="flex justify-between">
                <code>packages/core/src/tools/tool-registry.ts</code>
                <span className="text-purple-400">注册表 + 发现机制</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-300">
              注: tool-names.ts 定义核心工具,另有内建工具和 MCP 动态工具
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">工具实现文件</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>packages/core/src/tools/smart-edit.ts</div>
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
              <div>packages/core/src/agents/delegate-to-agent-tool.ts</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">注册和调度</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div className="flex justify-between">
                <code>packages/core/src/config/config.ts#createToolRegistry()</code>
                <span className="text-green-400">组装 ToolRegistry</span>
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
              工具名称必须完全匹配 <code>ToolRegistry</code> 中已注册的工具名（大小写敏感）。
              <code>tool-names.ts</code> 是内置工具名常量表，但实际可用工具还包括 discovered_tool_* 与 MCP 工具。
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
              <p className="text-gray-300">
                <code>Kind</code> 是 PolicyEngine 决策的重要维度之一，但不是“硬编码的自动批准/必须确认”。最终取决于：policy rules、approvalMode、
                以及 shell 子命令/重定向等解析结果。
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded p-2">
                  <h5 className="font-semibold text-green-300 mb-1">常见默认更“容易放行”</h5>
                  <ul className="space-y-1 text-gray-400 text-xs">
                    <li>• <code className="text-blue-300">Read</code> - 只读操作</li>
                    <li>• <code className="text-green-300">Search</code> - 搜索操作</li>
                    <li>• <code className="text-teal-300">Fetch</code> - 抓取类工具</li>
                    <li>• <code className="text-cyan-300">Think</code> - 代理/记忆等</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <h5 className="font-semibold text-yellow-300 mb-1">常见默认更“需要确认”</h5>
                  <ul className="space-y-1 text-gray-400 text-xs">
                    <li>• <code className="text-yellow-300">Edit</code> - 修改文件</li>
                    <li>• <code className="text-orange-300">Execute</code> - 执行命令</li>
                    <li>• <code className="text-red-300">Delete/Move</code> - 破坏性操作</li>
                    <li>• <code className="text-gray-300">Other</code> - 注入/扩展类操作</li>
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
              <li>• 路径/目录不在工作区 → <code className="text-red-400">error: Path is not within workspace</code></li>
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
              <p className="text-cyan-300">
                <strong>恢复策略：</strong> 检查当前会话的工具列表（ToolRegistry）或参考 <code>tool-names.ts</code> 的内置工具名常量
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
  error: 'Invalid parameters provided. Reason: "file_path" must be a string',
  received: { file_path: 123 }
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
      <Layer title="tool-names.ts 常量表（14 个内置工具名）" icon="🏷️">
        <p className="text-gray-300 mb-4">
          来源: <code className="text-cyan-400">packages/core/src/tools/tool-names.ts</code>
          <span className="text-yellow-400 ml-2">(工具名常量表 ≠ 实际会话可用工具)</span>
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
                <td className="py-2 px-3">SmartEditTool / EditTool</td>
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
                <td className="py-2 px-3">GrepTool / RipGrepTool</td>
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
                <td className="py-2 px-3">WriteTodosTool</td>
                <td className="py-2 px-3 text-gray-400">Other</td>
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
                <td className="py-2 px-3">LSTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WEB_SEARCH</td>
                <td className="py-2 px-3 text-cyan-400">'google_web_search'</td>
                <td className="py-2 px-3">WebSearchTool</td>
                <td className="py-2 px-3 text-green-400">Search</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">WEB_FETCH</td>
                <td className="py-2 px-3 text-cyan-400">'web_fetch'</td>
                <td className="py-2 px-3">WebFetchTool</td>
                <td className="py-2 px-3 text-teal-400">Fetch</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 text-purple-400">ACTIVATE_SKILL</td>
                <td className="py-2 px-3 text-cyan-400">'activate_skill'</td>
                <td className="py-2 px-3">ActivateSkillTool</td>
                <td className="py-2 px-3 text-gray-400">Other</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-purple-400">DELEGATE_TO_AGENT</td>
                <td className="py-2 px-3 text-cyan-400">'delegate_to_agent'</td>
                <td className="py-2 px-3">DelegateToAgentTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
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
export const ACTIVATE_SKILL_TOOL_NAME = 'activate_skill';
export const DELEGATE_TO_AGENT_TOOL_NAME = 'delegate_to_agent';

export const ALL_BUILTIN_TOOL_NAMES = [...] as const; // 14 个内置工具`}
        />

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-300">
            <strong>补充说明：</strong> 上述表格包含 ALL_BUILTIN_TOOL_NAMES 中的全部 14 个内置工具。此外还有：
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
        {/* replace */}
        <HighlightBox title="replace - 文件编辑" icon="✏️" variant="yellow">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/smart-edit.ts</code> | Kind: <span className="text-yellow-400">Edit</span>
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
                  <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；建议使用相对路径）</td>
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
                  <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；建议使用相对路径）</td>
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
                  <td className="py-1 px-2 text-cyan-400">file_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">文件路径（会 resolve 到 targetDir；offset 为 0-based 行号）</td>
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
                  <td className="py-1 px-2 text-cyan-400">dir_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录（相对 targetDir；会做 workspace 校验）</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">include</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">文件过滤 (如 "*.js")</td>
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
                  <td className="py-1 px-2 text-cyan-400">dir_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">搜索目录（相对 targetDir；会做 workspace 校验）</td>
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
                  <td className="py-1 px-2 text-cyan-400">description</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">命令简述</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">dir_path</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">工作目录（相对 targetDir；不传则使用当前工作目录）</td>
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
              </tbody>
            </table>
          </div>
        </HighlightBox>

        {/* write_todos */}
        <HighlightBox title="write_todos - 任务管理" icon="✅" variant="blue">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/write-todos.ts</code> | Kind: <span className="text-gray-400">Other</span>
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

        {/* activate_skill */}
        <HighlightBox title="activate_skill - 激活技能" icon="🧩" variant="purple">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/activate-skill.ts</code> | Kind: <span className="text-gray-400">Other</span>
          </p>
          <p className="text-sm text-gray-300 mb-3">
            激活 Agent Skills（技能系统）。执行后会把技能指令以 <code>&lt;ACTIVATED_SKILL&gt;</code> 包裹返回给模型，
            并附带该技能目录的文件结构（作为可用资源提示）。通常在 PolicyEngine 决策为 <code>ASK_USER</code> 时，会展示确认提示并列出将共享的资源。
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
                  <td className="py-1 px-2 text-cyan-400">name</td>
                  <td className="py-1 px-2">string</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要激活的 skill 名称（启用 skills 后会被收敛为枚举）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            相关：<code>packages/core/src/skills/skillManager.ts</code>（技能发现/覆盖优先级）、
            <code>packages/core/src/core/prompts.ts</code>（System Prompt 注入可用技能清单）。
          </div>
        </HighlightBox>

        {/* delegate_to_agent */}
        <HighlightBox title="delegate_to_agent - 子代理调度" icon="🤖" variant="purple">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/agents/delegate-to-agent-tool.ts</code> | Kind: <span className="text-blue-400">Think</span>
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
                  <td className="py-1 px-2 text-cyan-400">agent_name</td>
                  <td className="py-1 px-2">string (enum)</td>
                  <td className="py-1 px-2 text-green-400">Yes</td>
                  <td className="py-1 px-2 font-sans">要委托的 agent 名称（由 AgentRegistry 动态生成）</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-cyan-400">...agentInputs</td>
                  <td className="py-1 px-2">depends on agent</td>
                  <td className="py-1 px-2 text-gray-400">Depends</td>
                  <td className="py-1 px-2 font-sans">不同 agent 暴露不同输入参数（由 inputConfig 定义）</td>
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
              工具按 Kind（read/edit/delete/move/search/execute/think/fetch/other）分类，提供一个“粗粒度安全语义”。
              PolicyEngine 会结合 Kind、toolName、argsPattern（尤其是 shell）、serverName（MCP）与 approvalMode 等信息，输出
              ALLOW / ASK_USER / DENY。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-[var(--purple)]/10 rounded-lg p-5 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-bold font-mono mb-3">统一的参数规范</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              所有工具通过 <code>parametersJsonSchema</code> 描述参数结构，CLI 用 SchemaValidator 做统一校验。
              常见字段名（如 <code>file_path</code>/<code>dir_path</code>/<code>prompt</code>）在工具间保持一致；
              路径通常会在工具内部 resolve 到 targetDir，并在必要时做 workspace 校验与过滤（.gitignore/.geminiignore）。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--terminal-green)]/10 rounded-lg p-5 border border-[var(--cyber-blue)]/30">
            <h4 className="text-[var(--cyber-blue)] font-bold font-mono mb-3">内部协议统一（上游）</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
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
