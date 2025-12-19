import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function ApprovalModeSystem() {
  // 工具审批决策流程 - Mermaid flowchart
  const approvalDecisionFlowChart = `flowchart TD
    start([AI 请求执行工具])
    check_mode[检查当前<br/>审批模式]
    is_plan{plan 模式<br/>+ 修改类工具?}
    is_yolo{yolo 模式?}
    is_auto_edit{auto-edit?}
    is_readonly{只读工具?}
    is_edit_tool{编辑类工具?}
    block([阻断执行<br/>提示 Plan Mode])
    auto_approve([自动批准<br/>立即执行])
    prompt_user([等待用户确认<br/>显示 Diff])

    start --> check_mode
    check_mode --> is_plan
    is_plan -->|Yes| block
    is_plan -->|No| is_yolo
    is_yolo -->|Yes| auto_approve
    is_yolo -->|No| is_auto_edit
    is_auto_edit -->|Yes| is_edit_tool
    is_auto_edit -->|"No (default)"| is_readonly
    is_edit_tool -->|"Yes (Edit/Write)"| auto_approve
    is_edit_tool -->|"No (Bash等)"| prompt_user
    is_readonly -->|"Yes (Read/Glob)"| auto_approve
    is_readonly -->|No| prompt_user

    style start fill:#22d3ee,color:#000
    style block fill:#ef4444,color:#fff
    style auto_approve fill:#22c55e,color:#000
    style prompt_user fill:#f59e0b,color:#000
    style is_plan fill:#a855f7,color:#fff
    style is_yolo fill:#a855f7,color:#fff
    style is_auto_edit fill:#a855f7,color:#fff
    style is_readonly fill:#a855f7,color:#fff
    style is_edit_tool fill:#a855f7,color:#fff`;

  // 工具调用状态机 - Mermaid stateDiagram
  const toolCallStateChart = `stateDiagram-v2
    [*] --> validating: 开始验证

    validating --> awaiting_approval: 需要确认
    validating --> scheduled: 自动批准
    validating --> error: 参数无效

    awaiting_approval --> scheduled: 用户确认
    awaiting_approval --> cancelled: 用户拒绝

    scheduled --> executing: 开始执行

    executing --> success: 执行成功
    executing --> error: 执行失败
    executing --> cancelled: Ctrl+C

    success --> [*]
    cancelled --> [*]
    error --> [*]

    note right of validating : 验证参数
    note right of awaiting_approval : 等待审批
    note right of scheduled : 已排期
    note right of executing : 执行中`;

  const approvalModeEnum = `// packages/core/src/config/config.ts

export enum ApprovalMode {
  PLAN = 'plan',        // 计划模式：阻止所有修改
  DEFAULT = 'default',  // 默认模式：只读自动，修改需确认
  AUTO_EDIT = 'auto-edit', // 自动编辑：文件编辑自动批准
  YOLO = 'yolo',        // YOLO模式：所有工具自动执行
}

// 模式切换顺序 (Shift+Tab)
export const APPROVAL_MODES = Object.values(ApprovalMode);
// ['plan', 'default', 'auto-edit', 'yolo']`;

  const setApprovalModeCode = `// 设置审批模式时的安全检查
setApprovalMode(mode: ApprovalMode): void {
  // 不可信文件夹只能使用 plan 或 default 模式
  if (
    !this.isTrustedFolder() &&
    mode !== ApprovalMode.DEFAULT &&
    mode !== ApprovalMode.PLAN
  ) {
    throw new Error(
      'Cannot enable privileged approval modes in an untrusted folder.'
    );
  }
  this.approvalMode = mode;
}`;

  const toolConfirmationCode = `// packages/core/src/tools/tools.ts

export type WaitingToolCall = {
  status: 'awaiting_approval';
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  confirmationDetails: ToolCallConfirmationDetails;
  startTime?: number;
  outcome?: ToolConfirmationOutcome;
};

// 确认结果类型 - 来自 packages/core/src/tools/tools.ts:575
export enum ToolConfirmationOutcome {
  ProceedOnce = 'proceed_once',           // 批准一次
  ProceedAlways = 'proceed_always',       // 总是批准此工具
  ProceedAlwaysServer = 'proceed_always_server', // 总是批准此 MCP 服务器
  ProceedAlwaysTool = 'proceed_always_tool',     // 总是批准此工具类型
  ModifyWithEditor = 'modify_with_editor', // 用外部编辑器修改后批准
  Cancel = 'cancel',                       // 取消
}`;

  const planModePromptCode = `// Plan Mode 系统提示注入
// packages/core/src/core/prompts.ts

export function getPlanModeSystemReminder(): string {
  return \`<system-reminder>
Plan mode is active. You MUST NOT make any edits to files or run any
commands that could modify the system. Instead, present your plan
using the exit_plan_mode tool when ready.

In plan mode:
- DO NOT use Write, Edit, Bash, or any modifying tools
- DO analyze and plan the implementation
- DO explain your approach step by step
- When ready, call exit_plan_mode with your plan
</system-reminder>\`;
}`;

  const allowedToolsCode = `// settings.json - v2 配置格式
// 来源: packages/core/src/utils/tool-utils.ts
{
  "tools": {
    // 允许自动执行的工具（使用 tool name，非 displayName）
    "allowed": [
      "read_file",
      "glob",
      "grep_search",
      "web_search",
      "web_fetch"
    ],

    // 或者排除某些工具
    "exclude": [
      "run_shell_command",
      "write_file"
    ]
  }
}

// Pattern 语法 - 支持带参数的命令匹配
// 来源: packages/core/src/utils/tool-utils.ts:doesToolInvocationMatch()
{
  "tools": {
    "allowed": [
      "run_shell_command(git)",      // 只允许 git 开头的命令
      "run_shell_command(npm test)", // 只允许 npm test 命令
      "read_file"                    // 允许所有 read_file 调用
    ]
  }
}`;

  const keyboardShortcutsCode = `// 审批模式相关快捷键

// Shift+Tab: 循环切换审批模式
// plan → default → auto-edit → yolo → plan ...

// 工具确认对话框快捷键
// y / Enter  : 批准执行
// n / Esc    : 拒绝执行
// e          : 编辑工具参数后执行
// a          : 批准所有待执行工具

// 其他相关快捷键
// Ctrl+C     : 取消当前操作
// Ctrl+T     : 切换工具描述显示`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">审批模式系统</h2>
        <p className="text-gray-300 mb-4">
          审批模式是 CLI 的核心安全机制，控制 AI 执行工具时的权限级别。通过不同模式，
          用户可以在便利性和安全性之间取得平衡。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="Plan" variant="purple">
            <div className="text-sm">
              <p className="font-semibold text-purple-300 mb-1">计划模式</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 完全阻止所有修改</li>
                <li>• 只能分析和计划</li>
                <li>• 最安全的模式</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="Default" variant="blue">
            <div className="text-sm">
              <p className="font-semibold text-blue-300 mb-1">默认模式</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 只读工具自动执行</li>
                <li>• 修改工具需确认</li>
                <li>• 推荐日常使用</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="Auto-Edit" variant="green">
            <div className="text-sm">
              <p className="font-semibold text-green-300 mb-1">自动编辑</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 文件编辑自动批准</li>
                <li>• Bash 仍需确认</li>
                <li>• 适合信任的任务</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="YOLO" variant="red">
            <div className="text-sm">
              <p className="font-semibold text-red-300 mb-1">完全自动</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 所有工具自动执行</li>
                <li>• 无需任何确认</li>
                <li>• 仅限可信环境</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </section>

      {/* 模式切换 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">模式切换</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded">plan</span>
            <span className="text-gray-500">→</span>
            <span className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded">default</span>
            <span className="text-gray-500">→</span>
            <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded">auto-edit</span>
            <span className="text-gray-500">→</span>
            <span className="px-4 py-2 bg-red-500/20 border border-red-500 rounded">yolo</span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-400">循环</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            使用 <kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Tab</kbd> 快捷键循环切换模式
          </p>
        </div>

        <CodeBlock code={approvalModeEnum} language="typescript" title="审批模式枚举" />
      </section>

      {/* 审批决策流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">审批决策流程</h3>
        <MermaidDiagram chart={approvalDecisionFlowChart} title="工具审批决策流程" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">自动批准的工具 (Kind: Read/Search/Think/Fetch)</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-cyan-300">read_file</code> - 读取文件</li>
              <li>• <code className="text-cyan-300">read_many_files</code> - 批量读取</li>
              <li>• <code className="text-cyan-300">glob</code> - 文件匹配</li>
              <li>• <code className="text-cyan-300">grep_search</code> - 内容搜索</li>
              <li>• <code className="text-cyan-300">web_search</code> - 网页搜索</li>
              <li>• <code className="text-cyan-300">web_fetch</code> - 获取网页</li>
              <li>• <code className="text-cyan-300">todo_write</code> - 任务管理</li>
              <li>• <code className="text-cyan-300">save_memory</code> - 记忆保存</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">需要确认的工具 (Kind: Edit/Execute)</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-orange-300">write_file</code> - 写入文件</li>
              <li>• <code className="text-orange-300">edit</code> - 编辑文件</li>
              <li>• <code className="text-orange-300">run_shell_command</code> - 执行命令</li>
              <li>• <code className="text-orange-300">notebook_edit</code> - 编辑笔记本</li>
              <li>• <code className="text-orange-300">MCP 工具</code> - 外部 MCP 服务器工具</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 工具调用状态机 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">工具调用状态机</h3>
        <MermaidDiagram chart={toolCallStateChart} title="工具调用状态机" />
        <CodeBlock code={toolConfirmationCode} language="typescript" title="工具调用状态类型" />
      </section>

      {/* 四种模式详细对比 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">四种审批模式详细对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="border border-gray-700 p-3 text-left text-gray-400">工具类型 (Kind)</th>
                <th className="border border-gray-700 p-3 text-center text-purple-400">plan</th>
                <th className="border border-gray-700 p-3 text-center text-blue-400">default</th>
                <th className="border border-gray-700 p-3 text-center text-green-400">auto-edit</th>
                <th className="border border-gray-700 p-3 text-center text-red-400">yolo</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">Read</code> 读取文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">Search</code> 搜索文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">Fetch</code> 网络请求
                </td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-orange-300">Edit</code> 编辑文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-red-400">🚫 阻断</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-orange-300">Delete</code> 删除文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-red-400">🚫 阻断</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-red-300">Execute</code> Shell 命令
                </td>
                <td className="border border-gray-700 p-3 text-center text-red-400">🚫 阻断</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-purple-300">MCP Tools</code> 外部服务器
                </td>
                <td className="border border-gray-700 p-3 text-center text-red-400">🚫 阻断</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          注：🚫 阻断 = 触发 Plan Mode 提示，不执行工具 | ⚠️ 确认 = 等待用户批准 | ✅ 自动 = 自动执行
        </p>
      </section>

      {/* Plan Mode */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Plan Mode 工作流</h3>
        <p className="text-gray-300 mb-4">
          Plan Mode 是一种特殊的只读模式，通过系统提示注入来强制 AI 只进行分析和计划，
          不执行任何可能修改系统的操作。
        </p>

        {/* Plan Mode 生命周期 */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-purple-400 font-semibold mb-3">Plan Mode 生命周期</h4>
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <div className="bg-blue-500/20 border border-blue-500 rounded px-4 py-2 text-center">
              <div className="text-blue-400 font-bold">Default Mode</div>
              <div className="text-xs text-gray-400">正常工作</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-400">Shift+Tab 或</span>
              <span className="text-gray-400">enter_plan_mode</span>
              <span className="text-gray-500">→</span>
            </div>
            <div className="bg-purple-500/20 border border-purple-500 rounded px-4 py-2 text-center">
              <div className="text-purple-400 font-bold">Plan Mode</div>
              <div className="text-xs text-gray-400">分析 + 规划</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-400">exit_plan_mode</span>
              <span className="text-gray-400">(提交计划)</span>
              <span className="text-gray-500">→</span>
            </div>
            <div className="bg-green-500/20 border border-green-500 rounded px-4 py-2 text-center">
              <div className="text-green-400 font-bold">实施阶段</div>
              <div className="text-xs text-gray-400">用户审批后执行</div>
            </div>
          </div>
        </div>

        <CodeBlock code={planModePromptCode} language="typescript" title="Plan Mode 系统提示" />

        <HighlightBox title="Plan Mode 行为" variant="purple">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">允许的操作</h5>
              <ul className="space-y-1">
                <li>• 读取和分析代码</li>
                <li>• 搜索和浏览文件</li>
                <li>• 制定实施计划</li>
                <li>• 调用 exit_plan_mode 提交计划</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">禁止的操作</h5>
              <ul className="space-y-1">
                <li>• Write / Edit 文件</li>
                <li>• Bash 命令执行</li>
                <li>• 任何修改性工具</li>
                <li>• 直接实施变更</li>
              </ul>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          code={`// packages/core/src/tools/exitPlanMode.ts

// exit_plan_mode 工具：提交计划并退出 Plan Mode
export class ExitPlanModeTool extends Tool {
  static readonly Name = 'exit_plan_mode';

  static readonly FUNCTION_DECLARATION = {
    name: 'exit_plan_mode',
    description:
      'Exit plan mode and present a summary of the implementation plan.',
    parameters: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
          description: 'The implementation plan to present to the user.',
        },
      },
      required: ['plan'],
    },
  };

  async run(): Promise<ToolResult> {
    // 1. 将 AI 提交的计划展示给用户
    // 2. 等待用户确认
    // 3. 确认后切换回 Default 模式并执行计划
    return {
      output: 'Plan submitted for user approval.',
    };
  }
}`}
          language="typescript"
          title="exit_plan_mode 工具定义"
        />
      </section>

      {/* 安全限制 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">安全限制</h3>
        <CodeBlock code={setApprovalModeCode} language="typescript" title="不可信文件夹限制" />

        <HighlightBox title="不可信文件夹限制" variant="red">
          <p className="text-sm text-gray-300">
            在未被信任的文件夹中，只能使用 <code className="text-purple-300">plan</code> 或{' '}
            <code className="text-blue-300">default</code> 模式。
            尝试切换到 <code className="text-green-300">auto-edit</code> 或{' '}
            <code className="text-red-300">yolo</code> 会抛出错误。
            这是为了防止恶意项目自动执行危险操作。
          </p>
        </HighlightBox>
      </section>

      {/* 工具白名单 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">工具白名单配置</h3>
        <p className="text-gray-300 mb-4">
          通过 <code>allowedTools</code> 配置，可以精确控制哪些工具可以自动执行。
        </p>
        <CodeBlock code={allowedToolsCode} language="json" title="settings.json 工具配置" />
      </section>

      {/* 快捷键 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">快捷键</h3>
        <CodeBlock code={keyboardShortcutsCode} language="text" title="审批相关快捷键" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">工具确认对话框操作</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">快捷键</th>
                <th className="text-left p-2">操作</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><kbd className="px-2 py-1 bg-gray-700 rounded">y</kbd> / <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd></td>
                <td className="p-2 text-green-400">批准</td>
                <td className="p-2">执行当前工具调用</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><kbd className="px-2 py-1 bg-gray-700 rounded">n</kbd> / <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd></td>
                <td className="p-2 text-red-400">拒绝</td>
                <td className="p-2">取消工具执行</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><kbd className="px-2 py-1 bg-gray-700 rounded">e</kbd></td>
                <td className="p-2 text-yellow-400">编辑</td>
                <td className="p-2">修改工具参数后执行</td>
              </tr>
              <tr>
                <td className="p-2"><kbd className="px-2 py-1 bg-gray-700 rounded">a</kbd></td>
                <td className="p-2 text-blue-400">全部批准</td>
                <td className="p-2">批准所有待执行的工具</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">审批系统架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                         CLI 主循环                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AI Response (Tool Calls)                   │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              CoreToolScheduler                          │    │
│  │                                                         │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐            │    │
│  │  │ Validate │──▶│ Decide   │──▶│ Execute  │            │    │
│  │  │ Params   │   │ Approval │   │ or Wait  │            │    │
│  │  └──────────┘   └────┬─────┘   └──────────┘            │    │
│  │                      │                                  │    │
│  └──────────────────────┼──────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ApprovalMode Check                         │    │
│  │                                                         │    │
│  │   ┌────────┐  ┌─────────┐  ┌───────────┐  ┌──────┐     │    │
│  │   │  plan  │  │ default │  │ auto-edit │  │ yolo │     │    │
│  │   │ BLOCK  │  │ CONFIRM │  │ AUTO-EDIT │  │ AUTO │     │    │
│  │   └────────┘  └─────────┘  └───────────┘  └──────┘     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ToolConfirmation UI                        │    │
│  │                                                         │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │  工具: Edit                                     │    │    │
│  │  │  文件: src/app.ts                              │    │    │
│  │  │  ─────────────────────────────────────────────  │    │    │
│  │  │  - old line                                     │    │    │
│  │  │  + new line                                     │    │    │
│  │  │  ─────────────────────────────────────────────  │    │    │
│  │  │  [y] 批准  [n] 拒绝  [e] 编辑  [a] 全部批准     │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 日常开发使用 default 模式</li>
              <li>✓ 审查不熟悉的代码时使用 plan 模式</li>
              <li>✓ 只在可信项目中使用 auto-edit</li>
              <li>✓ 仔细阅读 Diff 后再批准</li>
              <li>✓ 配置合理的 allowedTools</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">避免做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 在不可信项目中使用 yolo</li>
              <li>✗ 不看 Diff 直接批准</li>
              <li>✗ 对所有 Bash 命令自动批准</li>
              <li>✗ 忽略安全警告</li>
              <li>✗ 在生产环境使用 yolo 模式</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 源码位置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">源码位置</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/config/config.ts:102-107</code>
            <span className="text-gray-400">ApprovalMode 枚举定义</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/tools/tools.ts:584-594</code>
            <span className="text-gray-400">Kind 枚举 (Read/Edit/Execute等)</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/tools/tools.ts:597-602</code>
            <span className="text-gray-400">MUTATOR_KINDS 数组</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/prompts.ts</code>
            <span className="text-gray-400">getPlanModeSystemReminder()</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/tools/exitPlanMode.ts</code>
            <span className="text-gray-400">ExitPlanModeTool 实现</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts</code>
            <span className="text-gray-400">工具调度与审批逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/ui/commands/approvalModeCommand.ts</code>
            <span className="text-gray-400">/approval 命令实现</span>
          </div>
        </div>
      </section>
    </div>
  );
}
