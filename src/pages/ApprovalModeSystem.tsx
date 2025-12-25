import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-red-500/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--purple)] font-bold">一句话：</span>
              通过 4 种模式（Plan → Default → Auto-Edit → YOLO）控制 AI 执行工具的权限，平衡安全性与便利性
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">4</div>
              <div className="text-xs text-[var(--text-muted)]">审批模式</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">工具 Kind</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">确认结果类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">7</div>
              <div className="text-xs text-[var(--text-muted)]">工具状态</div>
            </div>
          </div>

          {/* 模式切换 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">模式切换（Shift+Tab）</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                Plan 🔒
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                Default ⚠️
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                Auto-Edit ✏️
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                YOLO 🚀
              </span>
              <span className="text-[var(--text-muted)]">↻</span>
            </div>
          </div>

          {/* 关键规则 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <h4 className="text-sm font-semibold text-green-400 mb-1">✅ 自动批准</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Read、Glob、Grep、WebSearch 等只读工具在所有模式下自动执行
              </p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
              <h4 className="text-sm font-semibold text-red-400 mb-1">🚫 不可信文件夹</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                只能使用 Plan 或 Default 模式，Auto-Edit 和 YOLO 被禁用
              </p>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/core/coreToolScheduler.ts:740 → shouldConfirmExecute()
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApprovalModeSystem() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
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
    is_edit_tool -->|"No (Shell等)"| prompt_user
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
- DO NOT use Write, Edit, run_shell_command, or any modifying tools
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
      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 页面标题 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">审批模式系统</h2>
        <p className="text-gray-300 mb-4">
          审批模式是 CLI 的核心安全机制，控制 AI 执行工具时的权限级别。通过不同模式，
          用户可以在便利性和安全性之间取得平衡。
        </p>
      </section>

      {/* 1. 目标 */}
      <Layer title="目标" icon="🎯">
        <div className="space-y-3 text-gray-300">
          <p>
            审批模式系统旨在解决以下核心问题：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-cyan-400">安全风险控制</strong>：防止 AI 未经用户同意执行危险操作（如删除文件、执行系统命令）
            </li>
            <li>
              <strong className="text-cyan-400">用户体验平衡</strong>：在安全性和便利性之间提供灵活的权限级别
            </li>
            <li>
              <strong className="text-cyan-400">信任边界管理</strong>：根据工作环境的可信程度动态调整权限策略
            </li>
            <li>
              <strong className="text-cyan-400">透明化决策</strong>：让用户清楚了解每个工具调用的风险和影响
            </li>
          </ul>
        </div>
      </Layer>

      {/* 2. 输入 */}
      <Layer title="输入" icon="📥">
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">触发条件</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>AI 请求执行任意工具调用时</li>
              <li>用户通过 Shift+Tab 切换审批模式时</li>
              <li>用户通过 <code className="bg-black/30 px-1 rounded">/approval</code> 命令设置模式时</li>
              <li>进入不可信文件夹时（自动降级到 plan/default）</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">输入参数</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li><strong>当前 ApprovalMode</strong>：PLAN / DEFAULT / AUTO_EDIT / YOLO</li>
              <li><strong>工具 Kind 类型</strong>：Read / Search / Fetch / Edit / Delete / Execute</li>
              <li><strong>allowedTools 白名单</strong>：配置文件中定义的自动批准工具列表</li>
              <li><strong>文件夹信任状态</strong>：isTrustedFolder() 返回值</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">前置依赖</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>配置系统（Config）已初始化</li>
              <li>工具注册表（ToolRegistry）已加载所有工具</li>
              <li>CoreToolScheduler 已启动</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 3. 输出 */}
      <Layer title="输出" icon="📤">
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">产出物</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>审批决策</strong>：
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>返回 <code className="bg-black/30 px-1 rounded">null</code> → 自动批准，立即执行</li>
                  <li>返回 <code className="bg-black/30 px-1 rounded">ToolCallConfirmationDetails</code> → 需要用户确认</li>
                  <li>返回 <code className="bg-black/30 px-1 rounded">Plan Mode 提示</code> → 阻断执行</li>
                </ul>
              </li>
              <li>
                <strong>UI 反馈</strong>：
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>工具确认对话框（包含 Diff 预览、参数详情）</li>
                  <li>模式切换提示（Shift+Tab 时显示）</li>
                  <li>Plan Mode 阻断警告</li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">状态变化</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>工具调用状态：validating → scheduled / awaiting_approval / error</li>
              <li>审批模式切换：plan → default → auto-edit → yolo（循环）</li>
              <li>ToolConfirmationOutcome 记录：记录用户的批准/拒绝决策</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">副作用</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>触发 telemetry 事件记录（工具确认/拒绝/模式切换）</li>
              <li>更新 allowedTools 白名单（用户选择"总是批准"时）</li>
              <li>更新会话配置（模式切换时）</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 4. 关键文件与入口 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/config/config.ts:102-107
              </code>
              <span className="text-gray-400">ApprovalMode 枚举定义</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/tools/tools.ts:575-594
              </code>
              <span className="text-gray-400">ToolConfirmationOutcome 枚举、Kind 枚举</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/core/coreToolScheduler.ts:740-790
              </code>
              <span className="text-gray-400">shouldConfirmExecute 确认决策核心逻辑</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/core/prompts.ts
              </code>
              <span className="text-gray-400">getPlanModeSystemReminder() 系统提示生成</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/tools/exitPlanMode.ts
              </code>
              <span className="text-gray-400">ExitPlanModeTool 实现</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/utils/tool-utils.ts
              </code>
              <span className="text-gray-400">doesToolInvocationMatch() 白名单匹配逻辑</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/cli/src/ui/commands/approvalModeCommand.ts
              </code>
              <span className="text-gray-400">/approval 命令实现</span>
            </div>
          </div>
        </div>
      </Layer>

      {/* 5. 流程图 */}
      <Layer title="流程图" icon="📊">
        <div className="space-y-6">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-3">审批决策流程</h4>
            <MermaidDiagram chart={approvalDecisionFlowChart} title="工具审批决策流程" />
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-3">工具调用状态机</h4>
            <MermaidDiagram chart={toolCallStateChart} title="工具调用状态机" />
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-3">四种审批模式对比</h4>
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
                    <li>• run_shell_command 仍需确认</li>
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
          </div>
        </div>
      </Layer>

      {/* 6. 关键分支与边界条件 */}
      <Layer title="关键分支与边界条件" icon="⚡">
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">模式切换循环</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-4 text-lg flex-wrap">
                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded">plan</span>
                <span className="text-gray-500">→</span>
                <span className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded">default</span>
                <span className="text-gray-500">→</span>
                <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded">auto-edit</span>
                <span className="text-gray-500">→</span>
                <span className="px-4 py-2 bg-red-500/20 border border-red-500 rounded">yolo</span>
                <span className="text-gray-500">→</span>
                <span className="text-gray-400">循环回 plan</span>
              </div>
              <p className="text-center text-gray-400 mt-4">
                使用 <kbd className="px-2 py-1 bg-gray-700 rounded">Shift+Tab</kbd> 快捷键循环切换模式
              </p>
            </div>
            <CodeBlock code={approvalModeEnum} language="typescript" title="审批模式枚举定义" />
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">不可信文件夹限制</h4>
            <HighlightBox title="安全边界" variant="red">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">
                  当 <code className="bg-black/30 px-1 rounded">isTrustedFolder() = false</code> 时，
                  只允许使用 <strong className="text-purple-300">PLAN</strong> 或 <strong className="text-blue-300">DEFAULT</strong> 模式。
                </p>
                <p className="text-gray-300">
                  尝试切换到 <strong className="text-green-300">AUTO_EDIT</strong> 或 <strong className="text-red-300">YOLO</strong>
                  会抛出错误：<br/>
                  <code className="bg-black/30 px-1 rounded text-red-300">Cannot enable privileged approval modes in an untrusted folder.</code>
                </p>
              </div>
            </HighlightBox>
            <CodeBlock code={setApprovalModeCode} language="typescript" title="setApprovalMode 安全检查" />
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Plan Mode 特殊行为</h4>
            <div className="space-y-3">
              <HighlightBox title="阻断逻辑" variant="purple">
                <div className="text-sm space-y-2">
                  <div>
                    <h5 className="font-semibold text-purple-300 mb-1">触发条件</h5>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside ml-2">
                      <li><code>ApprovalMode = PLAN</code></li>
                      <li>工具的 <code>shouldConfirmExecute()</code> 返回非空（需要确认）</li>
                      <li>工具名称不是 <code>exit_plan_mode</code></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-300 mb-1">阻断行为</h5>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside ml-2">
                      <li>将工具调用标记为 <code>error</code> 状态</li>
                      <li>返回 <code>getPlanModeSystemReminder()</code> 系统提示</li>
                      <li>AI 收到提示后停止使用修改类工具</li>
                      <li>只有 <code>exit_plan_mode</code> 工具可以突破阻断</li>
                    </ul>
                  </div>
                </div>
              </HighlightBox>
              <CodeBlock code={planModePromptCode} language="typescript" title="Plan Mode 系统提示" />
            </div>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">工具 Kind 分类</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">自动批准类 (Kind: Read/Search/Fetch)</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <code className="text-cyan-300">read_file</code> - 读取文件</li>
                  <li>• <code className="text-cyan-300">read_many_files</code> - 批量读取</li>
                  <li>• <code className="text-cyan-300">glob</code> - 文件匹配</li>
                  <li>• <code className="text-cyan-300">grep_search</code> - 内容搜索</li>
                  <li>• <code className="text-cyan-300">web_search</code> - 网页搜索</li>
                  <li>• <code className="text-cyan-300">web_fetch</code> - 获取网页</li>
                  <li>• <code className="text-cyan-300">todo_write</code> - 任务管理</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-400 mb-2">需确认类 (Kind: Edit/Execute)</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <code className="text-orange-300">write_file</code> - 写入文件</li>
                  <li>• <code className="text-orange-300">edit</code> - 编辑文件</li>
                  <li>• <code className="text-orange-300">run_shell_command</code> - 执行命令</li>
                  <li>• <code className="text-orange-300">save_memory</code> - 保存记忆</li>
                  <li>• <code className="text-orange-300">MCP 工具</code> - 外部服务器工具</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">用户确认结果类型</h4>
            <CodeBlock code={toolConfirmationCode} language="typescript" title="ToolConfirmationOutcome 枚举" />
            <div className="mt-3 bg-gray-800/50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left p-2">确认结果</th>
                    <th className="text-left p-2">行为</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-cyan-300">ProceedOnce</code></td>
                    <td className="p-2">批准一次，仅执行当前工具调用</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-green-300">ProceedAlways</code></td>
                    <td className="p-2">总是批准此工具（加入 allowedTools）</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-blue-300">ProceedAlwaysServer</code></td>
                    <td className="p-2">总是批准此 MCP 服务器的所有工具</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-purple-300">ProceedAlwaysTool</code></td>
                    <td className="p-2">总是批准此类型的工具</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-yellow-300">ModifyWithEditor</code></td>
                    <td className="p-2">用外部编辑器修改参数后批准</td>
                  </tr>
                  <tr>
                    <td className="p-2"><code className="text-red-300">Cancel</code></td>
                    <td className="p-2">取消执行</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layer>

      {/* 7. 失败与恢复 */}
      <Layer title="失败与恢复" icon="🔧">
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">失败场景</h4>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div>
                <h5 className="text-yellow-400 font-semibold mb-1">场景 1：不可信文件夹尝试切换高权限模式</h5>
                <ul className="text-sm text-gray-300 list-disc list-inside ml-4">
                  <li>
                    <strong>错误</strong>：<code className="bg-black/30 px-1 rounded text-red-300">Cannot enable privileged approval modes in an untrusted folder.</code>
                  </li>
                  <li><strong>恢复</strong>：将文件夹标记为可信，或继续使用 PLAN/DEFAULT 模式</li>
                </ul>
              </div>

              <div>
                <h5 className="text-yellow-400 font-semibold mb-1">场景 2：Plan Mode 阻断修改类工具</h5>
                <ul className="text-sm text-gray-300 list-disc list-inside ml-4">
                  <li><strong>行为</strong>：工具调用标记为 error，返回 Plan Mode 系统提示</li>
                  <li><strong>恢复</strong>：AI 停止使用修改工具，通过 <code>exit_plan_mode</code> 提交计划后切换模式</li>
                </ul>
              </div>

              <div>
                <h5 className="text-yellow-400 font-semibold mb-1">场景 3：用户取消工具执行</h5>
                <ul className="text-sm text-gray-300 list-disc list-inside ml-4">
                  <li><strong>行为</strong>：工具调用标记为 cancelled，不执行操作</li>
                  <li><strong>恢复</strong>：AI 收到 cancelled 响应，可以提出替代方案或询问用户意图</li>
                </ul>
              </div>

              <div>
                <h5 className="text-yellow-400 font-semibold mb-1">场景 4：allowedTools 白名单不匹配</h5>
                <ul className="text-sm text-gray-300 list-disc list-inside ml-4">
                  <li><strong>行为</strong>：触发用户确认流程</li>
                  <li><strong>恢复</strong>：用户可选择"总是批准"将工具加入白名单</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">降级策略</h4>
            <HighlightBox title="自动降级机制" variant="blue">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">
                  当进入不可信文件夹时，如果当前模式为 AUTO_EDIT 或 YOLO，系统会自动降级到 DEFAULT 模式，
                  确保用户仍能正常工作，同时保持必要的安全审批。
                </p>
                <div className="mt-2 bg-black/30 rounded p-2">
                  <code className="text-cyan-300">YOLO/AUTO_EDIT</code>
                  <span className="text-gray-400"> → 进入不可信文件夹 → </span>
                  <code className="text-blue-300">DEFAULT</code>
                </div>
              </div>
            </HighlightBox>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Plan Mode 退出机制</h4>
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
              title="exit_plan_mode 工具实现"
            />
          </div>
        </div>
      </Layer>

      {/* 8. 相关配置项 */}
      <Layer title="相关配置项" icon="⚙️">
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">审批模式配置</h4>
            <CodeBlock
              code={`// .qwen/settings.json

{
  // 默认审批模式（会话启动时的初始模式）
  "approvalMode": "default", // "plan" | "default" | "auto-edit" | "yolo"

  // 文件夹信任配置
  "trustedFolders": [
    "/Users/username/trusted-project",
    "/Users/username/work/*"
  ]
}`}
              language="json"
              title="审批模式配置"
            />
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">allowedTools 白名单配置</h4>
            <CodeBlock code={allowedToolsCode} language="json" title="settings.json 工具白名单配置" />
            <div className="mt-3 bg-gray-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-cyan-400 mb-3">白名单匹配示例</h5>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left p-2">配置模式</th>
                    <th className="text-left p-2">匹配行为</th>
                    <th className="text-left p-2">示例</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-cyan-300">read_file</code></td>
                    <td className="p-2">精确匹配工具名称</td>
                    <td className="p-2">允许所有 read_file 调用</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="p-2"><code className="text-cyan-300">run_shell_command(git)</code></td>
                    <td className="p-2">匹配工具名 + 命令前缀</td>
                    <td className="p-2">只允许 <code>git status</code>, <code>git diff</code> 等</td>
                  </tr>
                  <tr>
                    <td className="p-2"><code className="text-cyan-300">run_shell_command(npm test)</code></td>
                    <td className="p-2">匹配工具名 + 精确命令</td>
                    <td className="p-2">只允许 <code>npm test</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">快捷键配置</h4>
            <CodeBlock code={keyboardShortcutsCode} language="text" title="审批相关快捷键" />
            <div className="mt-3 bg-gray-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-cyan-400 mb-3">工具确认对话框操作</h5>
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
          </div>
        </div>
      </Layer>

      {/* 补充：四种模式详细对比表 */}
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

      {/* 补充：Plan Mode 工作流可视化 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Plan Mode 工作流</h3>
        <p className="text-gray-300 mb-4">
          Plan Mode 是一种特殊的只读模式，通过系统提示注入来强制 AI 只进行分析和计划，
          不执行任何可能修改系统的操作。
        </p>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-purple-400 font-semibold mb-3">Plan Mode 生命周期</h4>
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <div className="bg-blue-500/20 border border-blue-500 rounded px-4 py-2 text-center">
              <div className="text-blue-400 font-bold">Default Mode</div>
              <div className="text-xs text-gray-400">正常工作</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-400">Shift+Tab</span>
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
                <li>• Shell 命令执行</li>
                <li>• 任何修改性工具</li>
                <li>• 直接实施变更</li>
              </ul>
            </div>
          </div>
        </HighlightBox>
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
              <li>✗ 对所有 Shell 命令自动批准</li>
              <li>✗ 忽略安全警告</li>
              <li>✗ 在生产环境使用 yolo 模式</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
