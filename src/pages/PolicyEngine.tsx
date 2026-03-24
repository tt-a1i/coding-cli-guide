import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 { id: 'hook-system', label: 'Hook 事件系统', description: '事件拦截机制' },
 { id: 'message-bus', label: '消息总线', description: '异步事件协调' },
 { id: 'approval-mode', label: '审批模式', description: '用户交互层权限' },
 { id: 'sandbox', label: '沙箱系统', description: '执行隔离机制' },
 { id: 'trusted-folders', label: '信任机制', description: '文件夹信任级别' },
];

function QuickSummary({
 isExpanded,
 onToggle,
}: {
 isExpanded: boolean;
 onToggle: () => void;
}) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🛡️</span>
 <span className="text-xl font-bold text-heading">
 30秒快速理解
 </span>
 </div>
 <span
 className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}
 >
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 多层次安全决策系统，通过规则匹配和 Safety Checker 对工具调用和
 Hook 执行进行 ALLOW/DENY/ASK_USER 决策
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">
 3
 </div>
 <div className="text-xs text-dim">决策类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">
 3
 </div>
 <div className="text-xs text-dim">审批模式</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">
 Checker 类型
 </div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">∞</div>
 <div className="text-xs text-dim">自定义规则</div>
 </div>
 </div>

 {/* 核心决策 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">
 Policy 决策类型
 </h4>
 <div className="flex items-center gap-3 flex-wrap text-sm">
 <span className="px-4 py-2 text-heading pl-3 border-l-2 border-l-edge-hover/30 font-semibold">
 ALLOW ✓
 </span>
 <span className="px-4 py-2 text-heading pl-3 border-l-2 border-l-edge-hover/30 font-semibold">
 DENY ✗
 </span>
 <span className="px-4 py-2 text-heading pl-3 border-l-2 border-l-edge-hover/30 font-semibold">
 ASK_USER ?
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 gemini-cli/packages/core/src/policy/policy-engine.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function PolicyEngine() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const policyDecisionFlowChart = `flowchart TD
 request([工具调用请求])
 stringify[参数序列化<br/>stableStringify]
 rules{规则匹配<br/>PolicyRule}
 checkers{Safety Checker<br/>执行}
 allow([ALLOW<br/>自动执行])
 deny([DENY<br/>拒绝执行])
 ask([ASK_USER<br/>用户确认])

 request --> stringify
 stringify --> rules
 rules -->|匹配 ALLOW| checkers
 rules -->|匹配 DENY| deny
 rules -->|匹配 ASK_USER| ask
 rules -->|无匹配| ask
 checkers -->|通过| allow
 checkers -->|拒绝| deny
 checkers -->|需确认| ask

 style request fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style allow fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style deny fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style ask fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style rules fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style checkers fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const policyTypesCode = `// gemini-cli/packages/core/src/policy/types.ts

// 决策类型
export enum PolicyDecision {
  ALLOW = 'allow', // 允许执行
  DENY = 'deny', // 拒绝执行
  ASK_USER = 'ask_user', // 询问用户
}

// 审批模式（与 ApprovalMode 不同，这是 Policy 层面的）
export enum ApprovalMode {
  DEFAULT = 'default', // 默认模式
  AUTO_EDIT = 'autoEdit', // 自动编辑
  YOLO = 'yolo', // 全自动
}

// Hook 来源类型
export type HookSource = 'project' | 'user' | 'system' | 'extension';`;

 const policyRuleCode = `// 策略规则定义
export interface PolicyRule {
  toolName?: string; // 工具名称（支持通配符 serverName__*）
  argsPattern?: RegExp; // 参数匹配正则
  allowRedirection?: boolean; // 仅对 shell 生效：含重定向时是否仍允许 ALLOW（否则会降级 ASK_USER）
  decision: PolicyDecision; // 决策结果
  priority?: number; // 优先级（越高越先匹配）
  modes?: ApprovalMode[]; // 适用的审批模式
}

// Safety Checker 规则
export interface SafetyCheckerRule {
  toolName?: string;
  argsPattern?: RegExp;
  priority?: number;
  checker: SafetyCheckerConfig;
  modes?: ApprovalMode[];
}

// Checker 配置（外部或内置）
export type SafetyCheckerConfig =
  | ExternalCheckerConfig // 外部脚本
  | InProcessCheckerConfig; // 内置检查器

// 内置 Checker 类型
export enum InProcessCheckerType {
  ALLOWED_PATH = 'allowed-path', // 路径白名单检查
}

// Hook Checker 规则（用于 Hook 执行的安全检查）
export interface HookCheckerRule {
  eventName?: string; // Hook 事件名（BeforeTool, AfterModel 等）
  hookSource?: HookSource; // Hook 来源（project, user, system, extension）
  checker: string; // 检查器名称
  priority?: number; // 优先级（越高越先匹配）
}`;

 const policyEngineCode = `// gemini-cli/packages/core/src/policy/policy-engine.ts

export class PolicyEngine {
  private rules: PolicyRule[];
  private checkers: SafetyCheckerRule[];
  private hookCheckers: HookCheckerRule[];
  private readonly defaultDecision: PolicyDecision;
  private readonly nonInteractive: boolean;
  private readonly checkerRunner?: CheckerRunner;
  private readonly allowHooks: boolean;
  private approvalMode: ApprovalMode;

  constructor(config: PolicyEngineConfig = {}, checkerRunner?: CheckerRunner) {
  // 按优先级排序规则
  this.rules = (config.rules ?? []).sort(
  (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );
  this.checkers = (config.checkers ?? []).sort(
  (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );
  this.hookCheckers = (config.hookCheckers ?? []).sort(
  (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );
  this.defaultDecision = config.defaultDecision ?? PolicyDecision.ASK_USER;
  this.nonInteractive = config.nonInteractive ?? false;
  this.checkerRunner = checkerRunner;
  this.allowHooks = config.allowHooks ?? true;
  this.approvalMode = config.approvalMode ?? ApprovalMode.DEFAULT;
  }

  // 检查工具调用
  async check(toolCall: FunctionCall, serverName: string | undefined): Promise<{
  decision: PolicyDecision;
  rule?: PolicyRule;
  }> {
  let stringifiedArgs: string | undefined;

  // 1. 序列化参数用于模式匹配（仅在必要时计算）
  if (
  toolCall.args &&
  (this.rules.some((rule) => rule.argsPattern) ||
  this.checkers.some((checker) => checker.argsPattern))
  ) {
  stringifiedArgs = stableStringify(toolCall.args);
  }

  // 2. 查找匹配的规则（已按 priority 排序）
  let matchedRule: PolicyRule | undefined;
  let decision: PolicyDecision | undefined;

  for (const rule of this.rules) {
  if (ruleMatches(rule, toolCall, stringifiedArgs, serverName, this.approvalMode)) {
  if (toolCall.name && SHELL_TOOL_NAMES.includes(toolCall.name)) {
  const args = toolCall.args as { command?: string; dir_path?: string };
  decision = await this.checkShellCommand(
  toolCall.name,
  args?.command,
  rule.decision,
  serverName,
  args?.dir_path,
  rule.allowRedirection,
  );
  } else {
  decision = this.applyNonInteractiveMode(rule.decision);
  }
  matchedRule = rule;
  break;
  }
  }

  if (!decision) {
  // 未命中规则：使用默认决策
  decision = this.applyNonInteractiveMode(this.defaultDecision);
  }

  // 3. 运行 Safety Checkers（DENY 直接短路）
  if (decision !== PolicyDecision.DENY && this.checkerRunner) {
  for (const checkerRule of this.checkers) {
  if (
  ruleMatches(
  checkerRule,
  toolCall,
  stringifiedArgs,
  serverName,
  this.approvalMode
  )
  ) {
  const result = await this.checkerRunner.runChecker(toolCall, checkerRule.checker);
  if (result.decision === SafetyCheckDecision.DENY) {
  return { decision: PolicyDecision.DENY, rule: matchedRule };
  } else if (result.decision === SafetyCheckDecision.ASK_USER) {
  decision = PolicyDecision.ASK_USER;
  }
  }
  }
  }

  return { decision: this.applyNonInteractiveMode(decision), rule: matchedRule };
  }
}`;

 const ruleMatchingCode = `// 规则匹配逻辑
function ruleMatches(
  rule: PolicyRule | SafetyCheckerRule,
  toolCall: FunctionCall,
  stringifiedArgs: string | undefined,
  serverName: string | undefined,
  currentApprovalMode: ApprovalMode,
): boolean {
  // 1. 检查审批模式
  if (rule.modes?.length > 0 && !rule.modes.includes(currentApprovalMode)) {
  return false;
  }

  // 2. 检查工具名称
  if (rule.toolName) {
  // 支持通配符：serverName__* 匹配该服务器所有工具
  if (rule.toolName.endsWith('__*')) {
  const prefix = rule.toolName.slice(0, -3);
  // 安全检查：serverName 必须精确匹配
  if (serverName !== undefined && serverName !== prefix) {
  return false;
  }
  if (!toolCall.name?.startsWith(prefix + '__')) {
  return false;
  }
  } else if (toolCall.name !== rule.toolName) {
  return false;
  }
  }

  // 3. 检查参数模式
  if (rule.argsPattern && !rule.argsPattern.test(stringifiedArgs ?? '')) {
  return false;
  }

  return true;
}`;

 const tomlConfigCode = `# ~/.gemini/policies/my-rules.toml - Policy 配置示例

# 允许执行 git status（无需确认）
[[rule]]
toolName = "run_shell_command"
commandPrefix = "git status"
decision = "allow"
priority = 100

# 其他 git 命令仍需要确认
[[rule]]
toolName = "run_shell_command"
commandPrefix = "git "
decision = "ask_user"
priority = 90

# 例：禁止危险命令（使用 argsPattern 匹配 stable JSON）
[[rule]]
toolName = "run_shell_command"
argsPattern = '"command":"rm -rf'
decision = "deny"
priority = 200

# 注意：modes 当前只允许在内置（Tier 1）策略中使用；
# 用户/管理员策略里会被忽略并产生告警（见 gemini-cli/packages/core/src/policy/toml-loader.ts）。

# Safety Checker：限制 write_file 可写路径（allowed-path）
[[safety_checker]]
toolName = "write_file"
priority = 100

[safety_checker.checker]
type = "in-process"
name = "allowed-path"
required_context = ["environment"]

[safety_checker.checker.config]
included_args = ["file_path"]`;

 const hookPolicyCode = `// Hook 执行的策略检查
async checkHook(
  request: HookExecutionRequest | HookExecutionContext
): Promise<PolicyDecision> {
  // 1. 全局 Hook 开关
  if (!this.allowHooks) {
  return PolicyDecision.DENY;
  }

  const context = 'input' in request ? {
  eventName: request.eventName,
  hookSource: getHookSource(request.input),
  trustedFolder: request.input['trusted_folder'],
  } : request;

  // 2. 不可信文件夹：拒绝项目级 Hook
  if (context.trustedFolder === false && context.hookSource === 'project') {
  return PolicyDecision.DENY;
  }

  // 3. 运行 Hook Checker
  for (const checkerRule of this.hookCheckers) {
  if (hookCheckerMatches(checkerRule, context)) {
  const result = await this.checkerRunner.runChecker(
  { name: \`hook:\${context.eventName}\`, args: {...} },
  checkerRule.checker
  );
  if (result.decision === SafetyCheckDecision.DENY) {
  return PolicyDecision.DENY;
  }
  }
  }

  return PolicyDecision.ALLOW;
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">
 Policy 策略引擎
 </h2>
 <p className="text-body mb-4">
 Policy Engine 是 Gemini CLI 的核心安全决策系统，负责对工具调用和 Hook
 执行进行权限判定。 通过规则匹配、Safety Checker
 和审批模式的组合，实现细粒度的安全控制。
 </p>
 </section>

 {/* 1. 核心概念 */}
 <Layer title="核心概念">
 <div className="space-y-4">
 <CodeBlock
 code={policyTypesCode}
 language="typescript"
 title="Policy 类型定义"
 />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="ALLOW" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body font-semibold">允许执行</p>
 <ul className="text-body space-y-1">
 <li>自动执行工具</li>
 <li>无需用户确认</li>
 <li>用于可信操作</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="DENY" variant="red">
 <div className="text-sm space-y-2">
 <p className="text-body font-semibold">拒绝执行</p>
 <ul className="text-body space-y-1">
 <li>直接阻止操作</li>
 <li>返回错误给 AI</li>
 <li>用于危险操作</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="ASK_USER" variant="yellow">
 <div className="text-sm space-y-2">
 <p className="text-body font-semibold">询问用户</p>
 <ul className="text-body space-y-1">
 <li>显示确认对话框</li>
 <li>用户决定批准/拒绝</li>
 <li>默认决策类型</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 2. 决策流程 */}
 <Layer title="决策流程">
 <div className="space-y-4">
 <MermaidDiagram
 chart={policyDecisionFlowChart}
 title="Policy 决策流程"
 />
 <CodeBlock
 code={policyEngineCode}
 language="typescript"
 title="PolicyEngine 核心逻辑"
 />
 </div>
 </Layer>

 {/* 3. 规则定义 */}
 <Layer title="规则定义">
 <div className="space-y-4">
 <CodeBlock
 code={policyRuleCode}
 language="typescript"
 title="PolicyRule 结构"
 />

 <HighlightBox title="规则字段说明" variant="blue">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-heading mb-2">匹配条件</h5>
 <ul className="text-body space-y-1">
 <li>
 • <code className="text-heading">toolName</code>:
 工具名或通配符模式
 </li>
 <li>
 • <code className="text-heading">argsPattern</code>:
 参数正则匹配
 </li>
 <li>
 • <code className="text-heading">modes</code>:
 适用的审批模式
 </li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-heading mb-2">决策控制</h5>
 <ul className="text-body space-y-1">
 <li>
 • <code className="text-heading">priority</code>:
 数字越大优先级越高
 </li>
 <li>
 • <code className="text-heading">decision</code>: 决策结果
 </li>
 <li>首个匹配的规则生效</li>
 </ul>
 </div>
 </div>
 </HighlightBox>

 <CodeBlock
 code={ruleMatchingCode}
 language="typescript"
 title="规则匹配逻辑"
 />
 </div>
 </Layer>

 {/* 4. 通配符匹配 */}
 <Layer title="通配符与 MCP 工具">
 <div className="space-y-4">
 <HighlightBox title="MCP 服务器工具匹配" variant="purple">
 <div className="text-sm space-y-3">
 <p className="text-body">
 MCP 工具名格式：
 <code className="bg-base/30 px-1 rounded">
 serverName__toolName
 </code>
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-heading">
 trusted-server__*
 </code>
 <span className="text-body">
 → 匹配 trusted-server 的所有工具
 </span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-heading">
 github__create_issue
 </code>
 <span className="text-body">→ 精确匹配单个工具</span>
 </div>
 </div>
 <p className="text-heading text-xs">安全检查：serverName 必须精确匹配前缀，防止恶意服务器伪造名称
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 5. Safety Checker */}
 <Layer title="Safety Checker">
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="External Checker" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-body">外部脚本检查器</p>
 <ul className="text-body space-y-1">
 <li>执行自定义脚本</li>
 <li>通过 stdout JSON 返回结果</li>
 <li>可访问完整上下文</li>
 </ul>
 <CodeBlock
 code={`{
 "type": "external",
 "name": "custom-checker",
 "config": { "script": "./check.py" }
}`}
 language="json"
 title=""
 />
 </div>
 </HighlightBox>

 <HighlightBox title="In-Process Checker" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body">内置检查器</p>
 <ul className="text-body space-y-1">
 <li>
 • <code>allowed-path</code>: 路径白名单
 </li>
 <li>高效，无进程开销</li>
 <li>可配置参数</li>
 </ul>
 <CodeBlock
 code={`{
 "type": "in-process",
 "name": "allowed-path",
 "config": {
 "included_args": ["file_path"],
 "excluded_args": ["temp_path"]
 }
}`}
 language="json"
 title=""
 />
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 6. TOML 配置 */}
 <Layer title="TOML 配置">
 <div className="space-y-4">
 <CodeBlock
 code={tomlConfigCode}
 language="toml"
 title="~/.gemini/policies/my-rules.toml"
 />

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">配置文件位置</h4>
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-body">
 gemini-cli/packages/core/src/policy/policies/*.toml
 </code>
 <span className="text-body">
 内置默认策略（Default tier）
 </span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-body">
 ~/.gemini/policies/*.toml
 </code>
 <span className="text-body">用户策略（User tier）</span>
 </div>
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-body">
 /etc/gemini-cli/policies/*.toml
 </code>
 <span className="text-body">
 管理员策略（Admin tier，macOS 在 /Library/Application
 Support/GeminiCli/policies）
 </span>
 </div>
 </div>
 </div>
 </div>
 </Layer>

 {/* 7. Hook 策略检查 */}
 <Layer title="Hook 策略检查">
 <div className="space-y-4">
 <CodeBlock
 code={hookPolicyCode}
 language="typescript"
 title="checkHook 方法"
 />

 <HighlightBox title="不可信文件夹限制" variant="red">
 <div className="text-sm space-y-2 text-body">
 <p>
 当{' '}
 <code className="bg-base/30 px-1 rounded">
 trustedFolder === false
 </code>{' '}
 时， 来自项目配置（<code>hookSource === 'project'</code>）的
 Hook 会被自动拒绝。
 </p>
 <p className="text-heading">
 这防止恶意项目通过 Hook 在用户机器上执行任意命令。
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 8. Shell 命令特殊处理 */}
 <Layer title="Shell 命令特殊处理">
 <div className="space-y-4">
 <MermaidDiagram
 chart={`flowchart TD
 shell[run_shell_command<br/>规则匹配 ALLOW]
 parse[解析命令<br/>splitCommands]
 single{单条命令?}
 allow([ALLOW])
 multi[多条子命令<br/>递归检查]
 sub1{子命令1 决策}
 sub2{子命令2 决策}
 final{聚合决策}

 shell --> parse
 parse --> single
 single -->|是| allow
 single -->|否| multi
 multi --> sub1
 multi --> sub2
 sub1 --> final
 sub2 --> final
 final -->|全部 ALLOW| allow
 final -->|任一 DENY| deny([DENY])
 final -->|任一 ASK_USER| ask([ASK_USER])

 style shell fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style allow fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style deny fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style ask fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`}
 title="复合 Shell 命令处理"
 />

 <HighlightBox title="复合命令检查" variant="yellow">
 <div className="text-sm space-y-2 text-body">
 <p>
 当 Shell 命令包含多个子命令（如{' '}
 <code className="bg-base/30 px-1 rounded">cmd1 && cmd2</code>
 ）时， Policy Engine 会递归检查每个子命令。
 </p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>任一子命令 DENY → 整体 DENY</li>
 <li>任一子命令 ASK_USER → 整体 ASK_USER</li>
 <li>全部子命令 ALLOW → 整体 ALLOW</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="重定向降级（allowRedirection）" variant="orange">
 <div className="text-sm space-y-2 text-body">
 <p>
 上游新增了{' '}
 <code className="bg-base/30 px-1 rounded">
 PolicyRule.allowRedirection
 </code>
 ： 当命令（或子命令）包含重定向符号（如{' '}
 <code className="bg-base/30 px-1 rounded">&gt;</code> /{' '}
 <code className="bg-base/30 px-1 rounded">&lt;</code>）时，
 即使命中 <code className="bg-base/30 px-1 rounded">ALLOW</code>{' '}
 规则，默认也会被降级为{' '}
 <code className="bg-base/30 px-1 rounded">ASK_USER</code>。
 </p>
 <p className="text-body">
 目的：避免“看似 allowlisted 的 shell
 命令”通过重定向隐式写文件或覆盖内容；如果你确实希望放行重定向，需要在规则中显式设置{' '}
 <code className="bg-base/30 px-1 rounded">
 allowRedirection=true
 </code>
 。
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 9. 非交互模式 */}
 <Layer title="非交互模式">
 <div className="space-y-4">
 <HighlightBox title="nonInteractive 模式" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p>
 在非交互模式（如 CI/CD 环境）下，
 <code className="bg-base/30 px-1 rounded">ASK_USER</code>
 决策会自动转换为{' '}
 <code className="bg-base/30 px-1 rounded text-heading">
 DENY
 </code>
 。
 </p>
 <CodeBlock
 code={`private applyNonInteractiveMode(decision: PolicyDecision): PolicyDecision {
 if (this.nonInteractive && decision === PolicyDecision.ASK_USER) {
 return PolicyDecision.DENY;
 }
 return decision;
}`}
 language="typescript"
 title=""
 />
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 10. 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/policy/types.ts
 </code>
 <span className="text-body">
 PolicyDecision、PolicyRule 等类型定义
 </span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/policy/policy-engine.ts
 </code>
 <span className="text-body">PolicyEngine 核心实现</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/policy/toml-loader.ts
 </code>
 <span className="text-body">TOML 配置加载器</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/policy/config.ts
 </code>
 <span className="text-body">配置解析与验证</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/safety/checker-runner.ts
 </code>
 <span className="text-body">Safety Checker 执行器</span>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 为什么默认是 ASK_USER 而非 DENY？
 </h4>
 <div className="text-sm text-body space-y-2">
 <p>
 <strong>决策：</strong>无匹配规则时默认 ASK_USER，而非更严格的
 DENY。
 </p>
 <p>
 <strong>原因：</strong>
 </p>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 <strong>用户体验</strong>：DENY
 会阻塞工作流，用户可能不清楚原因
 </li>
 <li>
 <strong>渐进式安全</strong>：让用户有机会了解工具行为后做决定
 </li>
 <li>
 <strong>学习曲线</strong>
 ：新用户可以通过确认对话框学习规则配置
 </li>
 </ul>
 <p>
 <strong>权衡：</strong>在非交互模式下自动降级为 DENY。
 </p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 为什么使用 stableStringify？
 </h4>
 <div className="text-sm text-body space-y-2">
 <p>
 <strong>决策：</strong>参数序列化使用 stable JSON
 stringify（键排序）。
 </p>
 <p>
 <strong>原因：</strong>
 </p>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 <strong>确定性匹配</strong>：相同参数始终生成相同字符串
 </li>
 <li>
 <strong>正则可靠性</strong>：argsPattern 匹配结果可预测
 </li>
 <li>
 <strong>缓存友好</strong>：相同参数的决策可以缓存
 </li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
