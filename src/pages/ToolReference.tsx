import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

/**
 * Tool Reference Page - 工具系统参考
 *
 * 聚焦于内置工具的分类、参数规范、注册机制和使用指南
 * Source: packages/core/src/tools/*.ts
 */
export function ToolReference() {
  // 工具注册和发现流程
  const toolRegistrationFlow = `flowchart TD
    start([启动 Innies CLI])
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
    end

    subgraph Search["🟢 Search (搜索)"]
      grep[grep_search]
      glob[glob]
    end

    subgraph Edit["🟡 Edit (修改)"]
      edit[edit]
      write[write_file]
    end

    subgraph Execute["🟠 Execute (执行)"]
      shell[run_shell_command]
    end

    subgraph Think["🔵 Think (思考)"]
      todo[todo_write]
      memory[save_memory]
      exit_plan[exit_plan_mode]
    end

    subgraph Other["⚪ Other (其他)"]
      task[task - 子代理]
    end

    style Read fill:#3b82f6,color:#fff
    style Search fill:#22c55e,color:#000
    style Edit fill:#f59e0b,color:#000
    style Execute fill:#f97316,color:#fff
    style Think fill:#6366f1,color:#fff
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
          Innies CLI 内置工具分类、参数规范与注册机制完整指南
        </p>
      </div>

      {/* 🎯 目标 */}
      <Layer title="目标" icon="🎯">
        <div className="space-y-3 text-gray-300">
          <p>
            工具系统是 Innies CLI 的核心能力，提供了 AI 与本地环境交互的标准化接口。
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

      {/* 📥 输入 */}
      <Layer title="输入" icon="📥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="工具调用请求" variant="blue">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">来自 AI Model 的工具调用：</p>
              <ul className="space-y-1 text-gray-400">
                <li>• <code className="text-cyan-300">name</code> - 工具名称（必须匹配 ToolNames）</li>
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
            <strong>重要：</strong> Innies CLI 内部统一使用 Gemini 格式，
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
                <span className="text-purple-400">工具名称常量</span>
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
              <div>packages/core/src/tools/task.ts</div>
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
                    <td className="py-1 px-2 text-green-400">'grep_search'</td>
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

          <HighlightBox title="Plan Mode 阻断" variant="purple">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">
                <strong>场景：</strong> 在 Plan Mode 下尝试执行修改类工具
              </p>
              <CodeBlock
                code={`// Plan Mode 系统提示
<system-reminder>
You are in Plan Mode. You can only use read-only tools...
To exit Plan Mode, use the exit_plan_mode tool.
</system-reminder>`}
              />
              <p className="text-cyan-300">
                <strong>恢复策略：</strong> 使用 <code>exit_plan_mode</code> 工具退出 Plan Mode
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
                <td className="py-2 px-3">工具审批模式（DEFAULT/YOLO/AUTO_EDIT/PLAN）</td>
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
      <Layer title="工具名称常量表 (ToolNames)" icon="🏷️">
        <p className="text-gray-300 mb-4">
          来源: <code className="text-cyan-400">packages/core/src/tools/tool-names.ts</code>
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
                <td className="py-2 px-3 text-cyan-400">'edit'</td>
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
                <td className="py-2 px-3 text-cyan-400">'grep_search'</td>
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
                <td className="py-2 px-3 text-cyan-400">'todo_write'</td>
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
                <td className="py-2 px-3 text-purple-400">TASK</td>
                <td className="py-2 px-3 text-cyan-400">'task'</td>
                <td className="py-2 px-3">TaskTool</td>
                <td className="py-2 px-3 text-gray-400">Other</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-purple-400">EXIT_PLAN_MODE</td>
                <td className="py-2 px-3 text-cyan-400">'exit_plan_mode'</td>
                <td className="py-2 px-3">ExitPlanModeTool</td>
                <td className="py-2 px-3 text-blue-400">Think</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          title="tool-names.ts - 源码"
          code={`export const ToolNames = {
  EDIT: 'edit',
  WRITE_FILE: 'write_file',
  READ_FILE: 'read_file',
  READ_MANY_FILES: 'read_many_files',
  GREP: 'grep_search',        // 注意: 不是 'grep'
  GLOB: 'glob',
  SHELL: 'run_shell_command', // 注意: 不是 'bash' 或 'shell'
  TODO_WRITE: 'todo_write',
  MEMORY: 'save_memory',      // 注意: 不是 'memory'
  TASK: 'task',
  EXIT_PLAN_MODE: 'exit_plan_mode',
} as const;`}
        />
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

        {/* grep_search */}
        <HighlightBox title="grep_search - 内容搜索" icon="🔍" variant="green">
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
                  <td className="py-1 px-2 text-cyan-400">respect_innies_ignore</td>
                  <td className="py-1 px-2">boolean</td>
                  <td className="py-1 px-2 text-gray-400">No</td>
                  <td className="py-1 px-2 font-sans">尊重 .inniesignore (默认 true)</td>
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

        {/* todo_write */}
        <HighlightBox title="todo_write - 任务管理" icon="✅" variant="blue">
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

        {/* task */}
        <HighlightBox title="task - 子代理调度" icon="🤖" variant="purple">
          <p className="text-sm text-gray-400 mb-2">
            来源: <code>packages/core/src/tools/task.ts</code> | Kind: <span className="text-gray-400">Other</span>
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
    </div>
  );
}
