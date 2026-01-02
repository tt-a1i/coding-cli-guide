import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'policy-engine', label: 'Policy 引擎', description: '策略决策与规则匹配' },
  { id: 'trusted-folders', label: '信任机制', description: '项目信任级别与模式限制' },
  { id: 'sandbox', label: '沙箱系统', description: '审批后的执行隔离' },
  { id: 'tool-arch', label: '工具架构', description: '工具 Kind 与审批规则' },
  { id: 'hook-system', label: 'Hook 系统', description: '事件拦截与扩展' },
  { id: 'message-bus', label: '消息总线', description: '确认请求的异步通信' },
];

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
              通过 3 种 ApprovalMode（default / autoEdit / yolo）控制工具调用的确认与自动批准，并在不可信工作区强制降级到 default
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">审批模式</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">9</div>
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
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">模式切换（快捷键）</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-[var(--bg-terminal)] rounded border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
                  Shift+Tab
                </span>
                <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                  Default
                </span>
                <span className="text-[var(--text-muted)]">↔</span>
                <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                  Auto Edit
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-[var(--bg-terminal)] rounded border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
                  Ctrl+Y
                </span>
                <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                  Default
                </span>
                <span className="text-[var(--text-muted)]">↔</span>
                <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                  YOLO
                </span>
              </div>
            </div>
          </div>

          {/* 关键规则 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <h4 className="text-sm font-semibold text-green-400 mb-1">✅ 自动批准</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                默认策略会允许 read-only 工具（如 read_file、list_directory、glob、search_file_content、google_web_search）
              </p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
              <h4 className="text-sm font-semibold text-red-400 mb-1">🚫 不可信文件夹</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                只能使用 Default 模式，Auto-Edit 和 YOLO 被禁用
              </p>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/tools/tools.ts:98 → BaseToolInvocation.shouldConfirmExecute()
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApprovalModeSystem() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  // 工具审批决策流程 - Mermaid flowchart (基于 PolicyEngine)
  const approvalDecisionFlowChart = `flowchart TD
    start([ToolInvocation.shouldConfirmExecute()])
    bus[MessageBus.publish<br/>TOOL_CONFIRMATION_REQUEST]
    policy[PolicyEngine.check<br/>rules + safety checkers]
    decision{PolicyDecision}
    allow([ALLOW → 不展示确认])
    deny([DENY → 抛错/拒绝])
    ask([ASK_USER → 返回确认详情])
    autoApproved{Auto-approve?}
    prompt_user([UI 展示确认<br/>Diff/参数/风险])
    user_choice{用户选择}
    proceed([Proceed → 执行])
    cancel([Cancel → 取消])

    start --> bus --> policy --> decision
    decision -->|allow| allow
    decision -->|deny| deny
    decision -->|ask_user| ask
    ask --> autoApproved
    autoApproved -->|YOLO 或 allowlisted| proceed
    autoApproved -->|需要用户确认| prompt_user --> user_choice
    user_choice -->|Proceed| proceed
    user_choice -->|Cancel| cancel

    style start fill:#22d3ee,color:#000
    style deny fill:#ef4444,color:#fff
    style allow fill:#22c55e,color:#000
    style prompt_user fill:#f59e0b,color:#000
    style decision fill:#a855f7,color:#fff
    style autoApproved fill:#a855f7,color:#fff`;

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

  const approvalModeEnum = `// packages/core/src/policy/types.ts

export enum ApprovalMode {
  DEFAULT = 'default',   // 默认：只读自动，修改需确认
  AUTO_EDIT = 'autoEdit', // Auto Edit：自动批准 replace/write_file（由 policy rules 控制）
  YOLO = 'yolo',         // YOLO：自动批准所有工具调用
}`;

  const setApprovalModeCode = `// packages/core/src/config/config.ts
setApprovalMode(mode: ApprovalMode): void {
  // 不可信文件夹：禁止开启特权模式（autoEdit / yolo）
  if (!this.isTrustedFolder() && mode !== ApprovalMode.DEFAULT) {
    throw new Error('Cannot enable privileged approval modes in an untrusted folder.');
  }
  this.policyEngine.setApprovalMode(mode);
}

// packages/core/src/policy/policy-engine.ts
setApprovalMode(mode: ApprovalMode): void {
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

// 确认结果类型 - 来自 packages/core/src/tools/tools.ts:721
export enum ToolConfirmationOutcome {
  ProceedOnce = 'proceed_once',           // 批准一次
  ProceedAlways = 'proceed_always',       // 总是批准此工具
  ProceedAlwaysAndSave = 'proceed_always_and_save', // 批准并保存到配置
  ProceedAlwaysServer = 'proceed_always_server', // 总是批准此 MCP 服务器
  ProceedAlwaysTool = 'proceed_always_tool',     // 总是批准此工具类型
  ModifyWithEditor = 'modify_with_editor', // 用外部编辑器修改后批准
  Cancel = 'cancel',                       // 取消
}`;

  const policyDecisionCode = `// PolicyEngine 决策结果
// packages/core/src/policy/types.ts

export enum PolicyDecision {
  ALLOW = 'allow',        // 允许执行
  DENY = 'deny',          // 拒绝执行
  ASK_USER = 'ask_user',  // 需要用户确认
}

// PolicyRule 规则结构
export interface PolicyRule {
  toolName?: string;      // 工具名，支持通配符 serverName__*
  argsPattern?: RegExp;   // 参数匹配正则
  modes?: ApprovalMode[]; // 限定模式
  decision: PolicyDecision;
  priority?: number;      // 优先级，高优先
}`;

  const allowedToolsCode = `// settings.json - v2 配置格式
// 来源: packages/core/src/utils/tool-utils.ts
{
  "tools": {
    // 跳过确认的 allowlist（支持 run_shell_command(...) 这种 invocation pattern）
    "allowed": [
      "glob",
      "read_file",
      "list_directory",
      "search_file_content",
      "google_web_search",
      "run_shell_command(git status)"
    ],

    // 排除某些工具（强制拒绝/禁用）
    "exclude": [
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

// Shift+Tab: Toggle Auto Edit
// default ↔ autoEdit

// Ctrl+Y: Toggle YOLO
// default ↔ yolo

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
              <li>用户通过 Shift+Tab / Ctrl+Y 切换审批模式时</li>
              <li>启动时通过 <code className="bg-black/30 px-1 rounded">--approval-mode</code> / <code className="bg-black/30 px-1 rounded">--yolo</code> 设置初始模式时</li>
              <li>进入不可信文件夹时（强制使用 default）</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">输入参数</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li><strong>当前 ApprovalMode</strong>：DEFAULT / AUTO_EDIT / YOLO</li>
              <li><strong>工具 Kind 类型</strong>：Read / Edit / Delete / Move / Search / Execute / Think / Fetch / Other（共 9 种）</li>
              <li><strong>allowedTools 白名单</strong>：配置文件中定义的自动批准工具列表</li>
              <li><strong>文件夹信任状态</strong>：trustedFolder / isTrustedFolder() 返回值</li>
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
                  <li>返回 <code className="bg-black/30 px-1 rounded">false</code> → 自动批准，立即执行</li>
                  <li>返回 <code className="bg-black/30 px-1 rounded">ToolCallConfirmationDetails</code> → 需要用户确认</li>
                  <li>抛出错误 → Policy DENY 拒绝执行</li>
                </ul>
              </li>
              <li>
                <strong>UI 反馈</strong>：
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>工具确认对话框（包含 Diff 预览、参数详情）</li>
                  <li>模式切换提示（Shift+Tab 时显示）</li>
                  <li>Policy 拒绝错误提示</li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">状态变化</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>工具调用状态：validating → scheduled / awaiting_approval / error</li>
              <li>审批模式切换：Shift+Tab（default ↔ autoEdit），Ctrl+Y（default ↔ yolo）</li>
              <li>ToolConfirmationOutcome 记录：记录用户的批准/拒绝决策</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">副作用</h4>
            <ul className="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>触发 telemetry 事件记录（工具确认/拒绝/模式切换）</li>
              <li>用户选择 “Always allow (+ save)” 时，持久化 Policy 规则到 <code className="bg-black/30 px-1 rounded">~/.gemini/policies/auto-saved.toml</code></li>
              <li>模式切换只影响当前会话（不写入 settings.json）</li>
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
                packages/core/src/policy/types.ts:45-57
              </code>
              <span className="text-gray-400">ApprovalMode 枚举定义</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/tools/tools.ts:98-130
              </code>
              <span className="text-gray-400">BaseToolInvocation.shouldConfirmExecute()（通过 MessageBus 询问 Policy）</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/core/coreToolScheduler.ts:602-654
              </code>
              <span className="text-gray-400">shouldConfirmExecute 确认决策核心逻辑</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/policy/policy-engine.ts
              </code>
              <span className="text-gray-400">PolicyEngine 策略决策引擎</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/confirmation-bus/message-bus.ts
              </code>
              <span className="text-gray-400">MessageBus 确认请求处理</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/core/src/utils/tool-utils.ts
              </code>
              <span className="text-gray-400">doesToolInvocationMatch() 白名单匹配逻辑</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/cli/src/ui/hooks/useAutoAcceptIndicator.ts:30-98
              </code>
              <span className="text-gray-400">Shift+Tab / Ctrl+Y 模式切换（Auto Edit / YOLO）</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                packages/cli/src/config/config.ts:477-519
              </code>
              <span className="text-gray-400">--approval-mode / --yolo 解析与不可信目录降级</span>
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
            <h4 className="text-cyan-400 font-semibold mb-3">三种审批模式对比</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <h4 className="text-cyan-400 font-semibold mb-2">模式切换规则</h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono">Shift+Tab</span>
                  <span className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded">default</span>
                  <span className="text-gray-500">↔</span>
                  <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded">autoEdit</span>
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono">Ctrl+Y</span>
                  <span className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded">default</span>
                  <span className="text-gray-500">↔</span>
                  <span className="px-4 py-2 bg-red-500/20 border border-red-500 rounded">yolo</span>
                </div>
              </div>
              <p className="text-center text-gray-400 mt-4">
                提示：不可信文件夹会阻止启用 <code className="bg-black/30 px-1 rounded">autoEdit</code> / <code className="bg-black/30 px-1 rounded">yolo</code>
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
                  只允许使用 <strong className="text-blue-300">DEFAULT</strong> 模式。
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
            <h4 className="text-cyan-400 font-semibold mb-2">PolicyEngine 决策机制</h4>
            <div className="space-y-3">
              <HighlightBox title="Policy 规则匹配" variant="purple">
                <div className="text-sm space-y-2">
                  <div>
                    <h5 className="font-semibold text-purple-300 mb-1">三种决策结果</h5>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside ml-2">
                      <li><code>ALLOW</code> - 自动批准执行</li>
                      <li><code>DENY</code> - 拒绝执行，抛出错误</li>
                      <li><code>ASK_USER</code> - 需要用户确认</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-300 mb-1">规则匹配逻辑</h5>
                    <ul className="space-y-1 text-gray-300 list-disc list-inside ml-2">
                      <li>规则按 priority 排序，高优先级先匹配</li>
                      <li>支持 toolName 精确匹配和通配符</li>
                      <li>支持 argsPattern 正则匹配参数</li>
                      <li>可限定 modes 只在特定模式下生效</li>
                    </ul>
                  </div>
                </div>
              </HighlightBox>
              <CodeBlock code={policyDecisionCode} language="typescript" title="PolicyEngine 类型定义" />
            </div>
          </div>

          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">工具 Kind 分类</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-green-400 mb-2">自动批准类 (Kind: Read/Search/Fetch/Think/Other)</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <code className="text-cyan-300">read_file</code> - 读取文件</li>
                  <li>• <code className="text-cyan-300">read_many_files</code> - 批量读取</li>
                  <li>• <code className="text-cyan-300">glob</code> - 文件匹配</li>
                  <li>• <code className="text-cyan-300">search_file_content</code> - 内容搜索</li>
                  <li>• <code className="text-cyan-300">google_web_search</code> - 网页搜索</li>
                  <li>• <code className="text-cyan-300">web_fetch</code> - 获取网页</li>
                  <li>• <code className="text-cyan-300">write_todos</code> - 任务管理</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-400 mb-2">需确认类 (Kind: Edit/Delete/Move/Execute)</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <code className="text-orange-300">write_file</code> - 写入文件</li>
                  <li>• <code className="text-orange-300">replace</code> - 编辑文件</li>
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
                    <td className="p-2"><code className="text-emerald-300">ProceedAlwaysAndSave</code></td>
                    <td className="p-2">批准并保存到 TOML 配置文件</td>
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
                  <li><strong>恢复</strong>：将文件夹标记为可信，或继续使用 DEFAULT 模式</li>
                </ul>
              </div>

              <div>
                <h5 className="text-yellow-400 font-semibold mb-1">场景 2：Policy 规则拒绝工具执行</h5>
                <ul className="text-sm text-gray-300 list-disc list-inside ml-4">
                  <li><strong>行为</strong>：PolicyEngine 返回 DENY，抛出错误</li>
                  <li><strong>恢复</strong>：检查 Policy 规则配置，或使用不同的工具/命令</li>
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
            <h4 className="text-cyan-400 font-semibold mb-2">Policy 规则配置</h4>
            <CodeBlock
              code={`// policy.toml - Policy 规则配置示例

# 允许所有 git 命令自动执行
[[rules]]
toolName = "run_shell_command"
argsPattern = "^git\\s+"
decision = "ALLOW"
priority = 100

# 允许特定 MCP Server 的所有工具
[[rules]]
toolName = "trusted-server__*"
decision = "ALLOW"
priority = 50

# 仅在 YOLO 模式下允许危险操作
[[rules]]
toolName = "run_shell_command"
argsPattern = "rm\\s+-rf"
modes = ["yolo"]
decision = "ALLOW"
priority = 10`}
              language="toml"
              title="Policy 规则配置"
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
              code={`// .gemini/settings.json

{
  // 默认审批模式（会话启动时的初始模式）
  "approvalMode": "default", // "default" | "autoEdit" | "yolo"

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

      {/* 补充：三种模式详细对比表 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">三种审批模式详细对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="border border-gray-700 p-3 text-left text-gray-400">工具类型 (Kind)</th>
                <th className="border border-gray-700 p-3 text-center text-blue-400">default</th>
                <th className="border border-gray-700 p-3 text-center text-green-400">autoEdit</th>
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
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">Search</code> 搜索文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">Fetch</code> 网络请求
                </td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-orange-300">Edit</code> 编辑文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-orange-300">Delete</code> 删除文件
                </td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-red-300">Execute</code> Shell 命令
                </td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-purple-300">MCP Tools</code> 外部服务器
                </td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-yellow-400">⚠️ 确认</td>
                <td className="border border-gray-700 p-3 text-center text-green-400">✅ 自动</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          注：🚫 拒绝 = Policy DENY，不执行工具 | ⚠️ 确认 = 等待用户批准 | ✅ 自动 = 自动执行
          （例如 <code className="bg-black/30 px-1 rounded">google_web_search</code> 属于只读，默认自动；<code className="bg-black/30 px-1 rounded">web_fetch</code> 默认需要确认）
        </p>
      </section>

      {/* 补充：PolicyEngine 工作流可视化 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">PolicyEngine 工作流</h3>
        <p className="text-gray-300 mb-4">
          PolicyEngine 是工具执行的核心决策引擎，通过规则匹配和 SafetyChecker 来决定工具是否可以执行。
          支持三种审批模式：DEFAULT、AUTO_EDIT、YOLO。
        </p>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-purple-400 font-semibold mb-3">模式切换流程</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-900/40 border border-gray-700 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-blue-400 font-bold">default</div>
                <span className="text-gray-400 font-mono text-xs">Shift+Tab</span>
              </div>
              <div className="text-gray-400 text-xs mt-1">默认：需要确认（除 read-only）</div>
              <div className="mt-2 text-center text-gray-500">↔</div>
              <div className="text-green-400 font-bold text-center">autoEdit</div>
              <div className="text-gray-400 text-xs mt-1 text-center">自动批准 replace/write_file（由 policy rules 控制）</div>
            </div>
            <div className="bg-gray-900/40 border border-gray-700 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-blue-400 font-bold">default</div>
                <span className="text-gray-400 font-mono text-xs">Ctrl+Y</span>
              </div>
              <div className="text-gray-400 text-xs mt-1">默认：需要确认（除 read-only）</div>
              <div className="mt-2 text-center text-gray-500">↔</div>
              <div className="text-red-400 font-bold text-center">yolo</div>
              <div className="text-gray-400 text-xs mt-1 text-center">自动批准所有工具调用</div>
            </div>
          </div>
        </div>

        <HighlightBox title="PolicyEngine 决策行为" variant="purple">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">自动批准</h5>
              <ul className="space-y-1">
                <li>• PolicyDecision.ALLOW 返回</li>
                <li>• YOLO 模式所有工具</li>
                <li>• AUTO_EDIT 模式启用 <code className="bg-black/30 px-1 rounded">modes=["autoEdit"]</code> 的 allow 规则（如 write_file / replace）</li>
                <li>• 匹配 Policy 规则的工具</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">需要确认</h5>
              <ul className="space-y-1">
                <li>• PolicyDecision.ASK_USER 返回</li>
                <li>• DEFAULT 模式修改类工具</li>
                <li>• 未匹配任何 ALLOW 规则</li>
                <li>• 危险操作（Shell 命令等）</li>
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
              <li>✓ 审查不熟悉的代码时仔细看 Diff</li>
              <li>✓ 只在可信项目中使用 autoEdit</li>
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

      {/* 为什么这样设计审批系统 */}
      <Layer title="为什么这样设计审批系统？" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">🎚️ 为什么需要 3 种模式？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：提供 Default / Auto Edit / YOLO 三种模式。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>场景多样</strong>：日常开发 vs 快速原型 vs 完全自动有不同的安全需求</li>
                <li><strong>渐进信任</strong>：用户可以从保守模式开始，逐步放宽</li>
                <li><strong>可选粒度</strong>：Auto Edit 让 “文件改动” 更高效，YOLO 则在明确接受风险时全自动</li>
              </ul>
              <p><strong>权衡</strong>：Shift+Tab 只切换 default ↔ autoEdit；Ctrl+Y 切换 default ↔ yolo。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">📖 为什么只读工具始终自动批准？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：read-only 工具（如 read_file、list_directory、glob、search_file_content、google_web_search）默认自动执行。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>无副作用</strong>：只读操作不会修改系统状态</li>
                <li><strong>高频使用</strong>：AI 需要频繁读取文件来理解代码</li>
                <li><strong>用户体验</strong>：每次读取都确认会严重影响效率</li>
              </ul>
              <p><strong>边界</strong>：<code className="bg-black/30 px-1 rounded">web_fetch</code> 属于 Fetch/网络请求，默认需要确认；敏感文件（如 .env）也仍受文件系统权限保护。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔄 为什么用 Shift+Tab 而非配置文件？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：支持运行时快捷键切换（Shift+Tab / Ctrl+Y），同时也支持 CLI 启动参数设置初始模式。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>情境变化</strong>：同一会话中可能需要切换模式（如从审计转到修复）</li>
                <li><strong>直观反馈</strong>：状态栏实时显示当前模式，用户清楚权限状态</li>
                <li><strong>零配置</strong>：默认模式足够安全，只有在需要提效时才切换</li>
              </ul>
              <p><strong>补充</strong>：通过 <code className="bg-black/30 px-1 rounded">--approval-mode=auto_edit</code> 或 <code className="bg-black/30 px-1 rounded">--approval-mode=yolo</code> / <code className="bg-black/30 px-1 rounded">--yolo</code> 设置初始模式。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🚫 为什么不可信文件夹限制模式？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：未经信任的项目只能使用 Default 模式。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>恶意项目防护</strong>：防止用户在下载的恶意项目中意外启用自动执行</li>
                <li><strong>主动信任</strong>：强制用户先阅读代码，再决定是否信任</li>
                <li><strong>分层防御</strong>：即使用户习惯性按确认，也不会在陌生项目中自动执行</li>
              </ul>
              <p><strong>信任方式</strong>：通过 <code className="bg-black/30 px-1 rounded">/permissions trust</code> 命令显式添加信任。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--red)]">
            <h4 className="text-[var(--red)] font-bold mb-2">⚠️ 为什么 Shell 命令需要特殊处理？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：Shell 命令（run_shell_command）即使在 Auto Edit 模式也需要确认。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>能力过大</strong>：Shell 可以执行任意系统命令，影响范围无法预估</li>
                <li><strong>不可逆操作</strong>：rm -rf、格式化等操作无法通过检查点恢复</li>
                <li><strong>静态分析难</strong>：无法可靠判断命令的危险性（如变量展开、管道）</li>
              </ul>
              <p><strong>例外</strong>：YOLO 模式会自动执行 Shell，因为用户已明确接受风险。</p>
            </div>
          </div>
        </div>
      </Layer>

      {/* Policy Engine 集成 */}
      <Layer title="与 Policy Engine 集成" icon="🛡️">
        <div className="space-y-4">
          <HighlightBox title="架构关系" variant="blue">
            <div className="text-sm space-y-2">
              <p className="text-[var(--text-secondary)]">
                ApprovalMode 是 Policy Engine 的一个<strong className="text-[var(--cyber-blue)]">输入因素</strong>，
                而非独立决策系统。Policy Engine 综合考虑多个因素做出最终决策：
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-[var(--purple)]/20 text-[var(--purple)] rounded text-xs">ApprovalMode</span>
                <span className="text-[var(--text-muted)]">+</span>
                <span className="px-2 py-1 bg-[var(--amber)]/20 text-[var(--amber)] rounded text-xs">TOML 规则</span>
                <span className="text-[var(--text-muted)]">+</span>
                <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded text-xs">Safety Checker</span>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded text-xs">ALLOW / DENY / ASK_USER</span>
              </div>
            </div>
          </HighlightBox>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-3">Policy Engine 决策流程</h4>
            <MermaidDiagram chart={`flowchart TD
    request[工具调用请求] --> policy[Policy Engine]

    subgraph "Policy Engine 决策"
        policy --> toml{TOML 规则}
        toml -->|匹配 allow| allow[ALLOW]
        toml -->|匹配 deny| deny[DENY]
        toml -->|无匹配| mode{检查 ApprovalMode}

        mode -->|YOLO| allow
        mode -->|Default + 修改工具| safety{Safety Checker}
        mode -->|Auto-Edit + Read| allow

        safety -->|安全| auto[自动决策]
        safety -->|危险| ask[ASK_USER]
    end

    allow --> execute[执行工具]
    deny --> block[阻断执行]
    ask --> bus[MessageBus]
    bus --> ui[UI 确认对话框]

    style policy fill:#ea580c,color:#fff
    style allow fill:#22c55e,color:#000
    style deny fill:#ef4444,color:#fff
    style ask fill:#f59e0b,color:#000
`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">ApprovalMode 角色</h4>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• 提供用户意图的<strong>全局基准</strong></li>
                <li>• 作为 Policy Engine 的<strong>输入参数</strong></li>
                <li>• 可被 TOML 规则<strong>覆盖</strong></li>
              </ul>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
              <h4 className="text-[var(--amber)] font-bold mb-2">TOML 规则优先级</h4>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• <code className="text-[var(--terminal-green)]">allow</code> 规则直接批准</li>
                <li>• <code className="text-red-400">deny</code> 规则直接拒绝</li>
                <li>• 无匹配时回退到 ApprovalMode</li>
              </ul>
            </div>
          </div>

          <CodeBlock
            code={`// Policy Engine 与 ApprovalMode 的交互
// packages/core/src/policy/policy-engine.ts

async evaluate(request: ToolRequest): Promise<PolicyDecision> {
  // 1. 首先检查 TOML 规则
  const ruleMatch = this.matchRules(request);
  if (ruleMatch) {
    return { action: ruleMatch.action };
  }

  // 2. 检查 Safety Checker
  const safetyCheck = this.checkSafety(request);
  if (!safetyCheck.passed) {
    return { action: 'DENY', reason: safetyCheck.reason };
  }

  // 3. 根据 ApprovalMode 决策
  const mode = this.config.approvalMode;

  if (mode === 'yolo') {
    return { action: 'ALLOW' };
  }

  if (mode === 'autoEdit' && request.tool.kind === 'Edit') {
    return { action: 'ALLOW' };
  }

  // default 模式：需要用户确认
  return { action: 'ASK_USER' };
}`}
            language="typescript"
            title="Policy Engine 决策逻辑"
          />
        </div>
      </Layer>

      {/* 模式选择决策树 */}
      <Layer title="模式选择决策树" icon="🌳">
        <MermaidDiagram chart={`flowchart TD
    start[选择审批模式] --> q1{是否信任<br/>此项目？}
    q1 -->|否| default[Default 模式<br/>每次确认]
    q1 -->|是| q2{是否需要<br/>完全自动？}
    q2 -->|是| yolo[YOLO 模式<br/>全自动]
    q2 -->|否| q3{是否信任<br/>文件编辑？}
    q3 -->|否| default
    q3 -->|是| autoedit[Auto-Edit 模式<br/>自动编辑]

    style start fill:#22d3ee,color:#000
    style default fill:#3b82f6,color:#fff
    style autoedit fill:#22c55e,color:#000
    style yolo fill:#ef4444,color:#fff
`} />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
