// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Introduction component
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🛡️</span>
 <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🎯 核心概念</h4>
 <p className="text-body text-sm">
 Policy 策略引擎是 Gemini CLI 的安全决策中枢。
 在工具执行前，根据配置的规则决定是否允许、拒绝或询问用户。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🔐 三种决策</h4>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover">
 <div className="text-heading font-semibold text-sm">ALLOW</div>
 <div className="text-xs text-dim mt-1">
 直接允许执行<br/>
 无需用户确认
 </div>
 </div>
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover">
 <div className="text-heading font-semibold text-sm">DENY</div>
 <div className="text-xs text-dim mt-1">
 直接拒绝执行<br/>
 返回拒绝原因
 </div>
 </div>
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover">
 <div className="text-heading font-semibold text-sm">ASK_USER</div>
 <div className="text-xs text-dim mt-1">
 询问用户确认<br/>
 等待用户响应
 </div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🏗️ 三种审批模式</h4>
 <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-heading">DEFAULT</div>
 <div className="text-dim">默认模式</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-heading">AUTO_EDIT</div>
 <div className="text-dim">自动编辑</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-heading">YOLO</div>
 <div className="text-dim">全自动</div>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-4 text-sm">
 <div className="flex items-center gap-2">
 <span className="text-dim">📍 源码:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/policy/
 </code>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-dim">🔗 相关:</span>
 <span className="text-heading text-xs">PolicyEngine, SafetyChecker, MessageBus</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// 决策阶段
type PolicyPhase =
 | 'request_receive'
 | 'rule_load'
 | 'rule_match_tool'
 | 'rule_match_params'
 | 'shell_command_check'
 | 'safety_check'
 | 'approval_mode_check'
 | 'decision_make'
 | 'ask_user'
 | 'user_response'
 | 'result_return';

// 阶段分组
type PhaseGroup = 'request' | 'rules' | 'safety' | 'decision' | 'user' | 'result';

// 执行步骤
interface PolicyStep {
 phase: PolicyPhase;
 group: PhaseGroup;
 title: string;
 description: string;
 codeSnippet: string;
 visualData?: Record<string, unknown>;
 highlight?: string;
}

// Policy 决策流程
const policySequence: PolicyStep[] = [
 {
 phase: 'request_receive',
 group: 'request',
 title: '接收工具请求',
 description: 'MessageBus 将工具调用交给 PolicyEngine.check()，产出 allow/deny/ask_user 决策',
 codeSnippet: `// packages/core/src/confirmation-bus/message-bus.ts
// (ToolInvocation.shouldConfirmExecute → MessageBus → PolicyEngine)
const { decision } = await policyEngine.check(toolCall, serverName);

switch (decision) {
 case PolicyDecision.ALLOW:
 // MessageBus 回复 confirmed=true
 break;
 case PolicyDecision.DENY:
 // MessageBus 回复 confirmed=false，并发出 TOOL_POLICY_REJECTION
 break;
 case PolicyDecision.ASK_USER:
 // MessageBus 将请求转发到 UI（需要用户确认）
 break;
}`,
 visualData: {
 request: {
 toolCall: { name: 'run_shell_command', args: { command: 'npm test' } },
 serverName: undefined,
 approvalMode: 'default',
 }
 },
 highlight: 'run_shell_command: npm test',
 },
 {
 phase: 'rule_load',
 group: 'rules',
 title: '加载规则配置',
 description: '启动阶段将默认/用户/管理员 TOML 合并为 rules + checkers，并按 tier 计算优先级',
 codeSnippet: `// packages/core/src/policy/config.ts
const policyDirs = getPolicyDirectories(/* defaultPoliciesDir */);
const { rules: tomlRules, checkers: tomlCheckers } =
 await loadPoliciesFromToml(policyDirs, getPolicyTier);

return {
 rules: [...tomlRules, /* settings-based rules */],
 checkers: [...tomlCheckers],
 defaultDecision: PolicyDecision.ASK_USER,
 approvalMode,
};`,
 visualData: {
 sources: [
 { level: 'Admin tier', path: '/etc/gemini-cli/policies/*.toml', count: 0 },
 { level: 'User tier', path: '~/.gemini/policies/*.toml', count: 0 },
 { level: 'Default tier', path: 'packages/core/src/policy/policies/*.toml', count: 15 },
 ],
 total: 15,
 },
 highlight: '加载 policies/*.toml',
 },
 {
 phase: 'rule_match_tool',
 group: 'rules',
 title: '工具名称匹配',
 description: 'ruleMatches() 检查 toolName（支持 MCP wildcard：server__*，并做防伪前缀校验）',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
if (rule.toolName) {
 if (rule.toolName.endsWith('__*')) {
 const prefix = rule.toolName.slice(0, -3);
 if (serverName !== undefined && serverName !== prefix) return false;
 if (!toolCall.name?.startsWith(prefix + '__')) return false;
 } else if (toolCall.name !== rule.toolName) {
 return false;
 }
}`,
 visualData: {
 rules: [
 { tool: 'toolName="run_shell_command" (1.010)', match: true, priority: 1.01 },
 { tool: 'toolName="write_file" (1.010)', match: false, priority: 1.01 },
 { tool: 'toolName="yolo allow-all" (1.999, modes=["yolo"])', match: true, priority: 1.999 },
 ],
 matched: 2,
 },
 highlight: 'match toolName',
 },
 {
 phase: 'rule_match_params',
 group: 'rules',
 title: '参数模式匹配',
 description: '将 args 进行 stableStringify，并用 argsPattern 正则匹配（commandPrefix 会在加载时转换成 argsPattern）',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
// Only compute stringifiedArgs if needed
if (toolCall.args && rules.some((r) => r.argsPattern)) {
 stringifiedArgs = stableStringify(toolCall.args);
}

if (rule.argsPattern) {
 if (stringifiedArgs === undefined) return false;
 if (!rule.argsPattern.test(stringifiedArgs)) return false;
}`,
 visualData: {
 rule: {
 toolName: 'run_shell_command',
 argsPattern: '"command":"npm test',
 decision: 'ALLOW',
 },
 input: { command: 'npm test' },
 matched: false,
 },
 highlight: 'match argsPattern',
 },
 {
 phase: 'shell_command_check',
 group: 'decision',
 title: 'Shell 命令细分检查',
 description:
 '当 tool 是 run_shell_command 时，PolicyEngine 会解析/拆分命令并递归检查每一段；命令包含重定向时默认会把 ALLOW 降级为 ASK_USER（除非 rule.allowRedirection=true）',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
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
}

// checkShellCommand(): parse + recurse + redirection downgrade
await initializeShellParsers();
const subCommands = splitCommands(command);
if (subCommands.length === 0) {
 // 解析失败更保守：回退为 ASK_USER
 return this.applyNonInteractiveMode(PolicyDecision.ASK_USER);
}

// If any sub-command is redirected, downgrade ALLOW → ASK_USER unless allowRedirection=true
if (!allowRedirection && hasRedirection(subCmd)) {
 if (aggregateDecision === PolicyDecision.ALLOW) {
 aggregateDecision = PolicyDecision.ASK_USER;
 }
}`,
 visualData: {
 tool: 'run_shell_command',
 command: 'npm test > output.log',
 allowRedirection: false,
 parsed: ['npm test > output.log'],
 decision: 'ASK_USER (downgraded)',
 },
 highlight: 'ALLOW → ASK_USER（redirection）',
 },
 {
 phase: 'safety_check',
 group: 'safety',
 title: '安全检查器',
 description: '若配置了 Safety Checker（external / in-process），可将决策升级为 ask_user 或 deny',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
if (decision !== PolicyDecision.DENY && checkerRunner) {
 for (const checkerRule of this.checkers) {
 if (ruleMatches(checkerRule, toolCall, stringifiedArgs, serverName, this.approvalMode)) {
 const result = await checkerRunner.runChecker(toolCall, checkerRule.checker);
 if (result.decision === SafetyCheckDecision.DENY) return { decision: PolicyDecision.DENY, rule: matchedRule };
 if (result.decision === SafetyCheckDecision.ASK_USER) decision = PolicyDecision.ASK_USER;
 }
 }
}`,
 visualData: {
 checks: [
 { type: 'allowed-path (in-process)', severity: 'low', passed: true },
 ],
 overallPassed: true,
 },
 highlight: 'Safety checker pass',
 },
 {
 phase: 'approval_mode_check',
 group: 'decision',
 title: '审批模式检查',
 description: 'ruleMatches() 会按当前 ApprovalMode 过滤 rules（modes 目前只允许 Tier 1 默认策略使用）',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
if (rule.modes && rule.modes.length > 0) {
 if (!rule.modes.includes(currentApprovalMode)) {
 return false;
 }
}`,
 visualData: {
 decision: 'ASK_USER',
 reason: '默认模式：run_shell_command 默认 ask_user（除非被策略 allowlist）',
 severity: 'warning',
 },
 highlight: 'filter by approvalMode',
 },
 {
 phase: 'decision_make',
 group: 'decision',
 title: '生成决策',
 description: '取最高优先级匹配规则的决策；若无匹配则使用 defaultDecision；最后应用 non-interactive 转换',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
// No matching rule → use default decision
if (!decision) decision = this.applyNonInteractiveMode(this.defaultDecision);

return {
 decision: this.applyNonInteractiveMode(decision),
 rule: matchedRule,
};`,
 visualData: {
 decision: 'ASK_USER',
 reason: '未匹配 allow 规则 → 默认 ask_user（interactive mode 会弹窗）',
 severity: 'warning',
 },
 highlight: 'ASK_USER',
 },
 {
 phase: 'ask_user',
 group: 'user',
 title: '请求用户确认',
 description: 'MessageBus 将 request 交给 UI；工具侧会生成 ToolCallConfirmationDetails（Diff/命令/风险提示）',
 codeSnippet: `// packages/core/src/tools/tools.ts (BaseToolInvocation)
if (decision === 'ASK_USER') {
 return this.getConfirmationDetails(abortSignal);
}

// packages/cli/src/ui - UI 展示确认对话框（包含 ProceedOnce / Always / Save 等选项）`,
 visualData: {
 dialog: {
 tool: 'run_shell_command',
 command: 'npm test',
 reason: 'ASK_USER (default policy for run_shell_command)',
 options: ['proceed_once', 'proceed_always_and_save', 'cancel'],
 }
 },
 highlight: '等待用户响应',
 },
 {
 phase: 'user_response',
 group: 'user',
 title: '用户响应',
 description: '用户选择 “Always allow + save”，MessageBus 收到 UPDATE_POLICY 并写入 au',
 codeSnippet: `// packages/core/src/policy/config.ts
// MessageBusType.UPDATE_POLICY → createPolicyUpdater() 处理
// 1) policyEngine.addRule({ toolName, decision: allow, priority: 2.95, argsPattern })
// 2) persist=true 时写入 ~/.gemini/policies/au（原子写）`,
 visualData: {
 response: 'proceed_always_and_save',
 finalDecision: 'ALLOW',
 },
 highlight: 'Always allow + save',
 },
 {
 phase: 'result_return',
 group: 'result',
 title: '返回决策结果',
 description: '后续相同工具调用将匹配到新规则（优先级 2.95），从而直接允许并跳过确认',
 codeSnippet: `// packages/core/src/policy/policy-engine.ts
// Next time:
// - matchedRule: user aurule (priority 2.95)
// - decision: allow
// ToolInvocation.shouldConfirmExecute() → returns false → CoreToolScheduler 直接执行`,
 visualData: {
 finalDecision: {
 action: 'ALLOW',
 source: 'aupolicy',
 },
 toolExecuted: true,
 executedLabel: 'run_shell_command: npm test',
 },
 highlight: 'ALLOW → 执行',
 },
];

// 阶段组颜色
const groupColors: Record<PhaseGroup, string> = {
 request: 'var(--color-info)', // blue
 rules: '#8b5cf6', // purple
 safety: 'var(--color-danger)', // red
 decision: 'var(--color-warning)', // amber
 user: 'var(--color-success)', // green
 result: '#10b981', // emerald
};

// 阶段组名称
const groupNames: Record<PhaseGroup, string> = {
 request: '请求接收',
 rules: '规则匹配',
 safety: '安全检查',
 decision: '决策生成',
 user: '用户交互',
 result: '结果返回',
};

// 决策颜色
const decisionColors: Record<string, string> = {
 ALLOW: 'var(--color-success)',
 DENY: 'var(--color-danger)',
 ASK_USER: 'var(--color-warning)',
};

// 规则匹配可视化
function RuleMatchVisualizer({ rules, matched }: { rules?: Array<{ tool: string; match: boolean; priority: number }>; matched?: number }) {
 if (!rules) return null;

 return (
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">规则匹配</div>
 <div className="space-y-2">
 {rules.map((rule, i) => (
 <div
 key={i}
 className={`flex items-center justify-between p-3 rounded border transition-all ${
 rule.match
 ? 'border-edge/40 bg-elevated'
 : ' border-edge bg-surface opacity-60'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className={`text-lg ${rule.match ? 'text-heading' : 'text-dim'}`}>
 {rule.match ? '✓' : '✗'}
 </span>
 <code className="text-sm text-heading font-mono">{rule.tool}</code>
 </div>
 {rule.match && (
 <span className="text-xs text-body">优先级: {rule.priority}</span>
 )}
 </div>
 ))}
 </div>
 <div className="mt-3 text-right text-sm text-body">
 匹配: <span className="text-heading font-bold">{matched}</span> / {rules.length}
 </div>
 </div>
 );
}

// 安全检查可视化
function SafetyCheckVisualizer({ checks, overallPassed }: { checks?: Array<{ type: string; severity: string; passed: boolean }>; overallPassed?: boolean }) {
 if (!checks) return null;

 return (
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">安全检查</div>
 <div className="space-y-2">
 {checks.map((check, i) => (
 <div
 key={i}
 className={`flex items-center justify-between p-3 rounded border ${
 check.passed
 ? 'border-edge bg-elevated'
 : 'border-edge/40 bg-elevated'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className={check.passed ? 'text-heading' : 'text-heading'}>
 {check.passed ? '✓' : '✗'}
 </span>
 <span className="text-sm text-heading">{check.type}</span>
 </div>
 <span className={`text-xs px-2 py-1 rounded ${
 check.severity === 'high' ? 'bg-elevated text-heading' :
 check.severity === 'medium' ? 'bg-elevated text-heading' :
 'bg-elevated text-heading'
 }`}>
 {check.severity}
 </span>
 </div>
 ))}
 </div>
 <div className={`mt-3 p-2 rounded text-center text-sm font-bold ${
 overallPassed ? 'bg-elevated text-heading' : 'bg-elevated text-heading'
 }`}>
 {overallPassed ? '安全检查通过' : '安全检查未通过'}
 </div>
 </div>
 );
}

// 用户确认对话框可视化
function ConfirmDialogVisualizer({ dialog }: { dialog?: { tool: string; command: string; reason: string; options: string[] } }) {
 if (!dialog) return null;

 const getOptionLabel = (opt: string) => {
 switch (opt) {
 case 'proceed_once':
 return 'Proceed once';
 case 'proceed_always':
 return 'Always allow';
 case 'proceed_always_and_save':
 return 'Always allow + save';
 case 'proceed_always_server':
 return 'Always allow server';
 case 'proceed_always_tool':
 return 'Always allow tool';
 case 'modify_with_editor':
 return 'Modify with editor';
 case 'cancel':
 return 'Cancel';
 default:
 return opt;
 }
 };

 const getOptionClassName = (opt: string) => {
 switch (opt) {
 case 'proceed_once':
 return 'bg-[var(--color-success)] text-heading';
 case 'proceed_always':
 case 'proceed_always_and_save':
 return 'bg-[var(--color-success)] text-heading';
 case 'proceed_always_server':
 return ' bg-elevated text-heading';
 case 'proceed_always_tool':
 return ' bg-elevated text-heading';
 case 'modify_with_editor':
 return 'bg-[var(--color-warning)] text-heading';
 case 'cancel':
 return ' bg-elevated text-heading';
 default:
 return ' bg-elevated text-heading';
 }
 };

 return (
 <div className="mb-6 p-4 rounded-lg border-2 border-edge/40" className="bg-elevated">
 <div className="flex items-center gap-2 mb-4">
 <span className="text-heading text-xl">⚠️</span>
 <span className="text-heading font-bold">Tool requires confirmation</span>
 </div>
 <div className="space-y-2 mb-4">
 <div className="flex">
 <span className="text-body w-20">Tool:</span>
 <span className="text-heading font-mono">{dialog.tool}</span>
 </div>
 <div className="flex">
 <span className="text-body w-20">Command:</span>
 <code className="text-heading font-mono">{dialog.command}</code>
 </div>
 <div className="flex">
 <span className="text-body w-20">Reason:</span>
 <span className="text-heading">{dialog.reason}</span>
 </div>
 </div>
 <div className="flex gap-2">
 {dialog.options.map((opt, i) => (
 <button
 key={i}
 className={`px-4 py-2 rounded text-sm font-medium ${getOptionClassName(opt)}`}
 >
 {getOptionLabel(opt)}
 </button>
 ))}
 </div>
 </div>
 );
}

// 决策结果可视化
function DecisionVisualizer({ decision, reason, severity }: { decision?: string; reason?: string; severity?: string }) {
 if (!decision) return null;

 const color = decisionColors[decision] || '#6b7280';

 return (
 <div
 className="mb-6 p-4 rounded-lg border-2"
 style={{ borderColor: color, backgroundColor: `${color}10` }}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm text-body">决策结果</span>
 {severity && (
 <span className={`text-xs px-2 py-1 rounded ${
 severity === 'warning' ? 'bg-elevated text-heading' : ' bg-elevated/20 text-body'
 }`}>
 {severity}
 </span>
 )}
 </div>
 <div
 className="text-2xl font-bold"
 style={{ color }}
 >
 {decision}
 </div>
 {reason && <div className="mt-2 text-sm text-body">{reason}</div>}
 </div>
 );
}

export function PolicyDecisionAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 const step = policySequence[currentStep];

 useEffect(() => {
 if (!isPlaying) return;

 const timer = setTimeout(() => {
 if (currentStep < policySequence.length - 1) {
 setCurrentStep(prev => prev + 1);
 } else {
 setIsPlaying(false);
 }
 }, 3000);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep]);

 const handlePrev = useCallback(() => {
 setCurrentStep(prev => Math.max(0, prev - 1));
 }, []);

 const handleNext = useCallback(() => {
 setCurrentStep(prev => Math.min(policySequence.length - 1, prev + 1));
 }, []);

 const handleReset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 }, []);

 return (
 <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-6xl mx-auto">
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
 </div>

 {/* 标题 */}
 <div className="max-w-6xl mx-auto mb-8">
 <h1 className="text-3xl font-bold text-heading mb-2 font-mono">
 Policy 决策流程
 </h1>
 <p className="text-body">
 从请求接收到决策返回的完整安全决策流程
 </p>
 <div className="text-xs text-dim mt-1 font-mono">
 核心文件: packages/core/src/policy/policy-engine.ts
 </div>
 </div>

 {/* 阶段组指示器 */}
 <div className="max-w-6xl mx-auto mb-6">
 <div className="flex items-center gap-2 flex-wrap">
 {(Object.keys(groupNames) as PhaseGroup[]).map((group) => {
 const isActive = step.group === group;
 return (
 <div
 key={group}
 className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
 isActive ? 'shadow-lg' : 'opacity-50'
 }`}
 style={{
 backgroundColor: isActive ? `${groupColors[group]}20` : 'transparent',
 color: groupColors[group],
 border: `1px solid ${isActive ? groupColors[group] : 'transparent'}`
 }}
 >
 {groupNames[group]}
 </div>
 );
 })}
 </div>
 </div>

 {/* 进度条 */}
 <div className="max-w-6xl mx-auto mb-6">
 <div className="flex items-center gap-1">
 {policySequence.map((s, i) => (
 <button
 key={i}
 onClick={() => setCurrentStep(i)}
 className="flex-1 h-2 rounded-full transition-all cursor-pointer"
 style={{
 backgroundColor:
 i === currentStep
 ? groupColors[s.group]
 : i < currentStep
 ? `${groupColors[s.group]}80`
 : '#374151'
 }}
 title={s.title}
 />
 ))}
 </div>
 <div className="flex justify-between mt-2 text-xs text-dim">
 <span>步骤 {currentStep + 1} / {policySequence.length}</span>
 <span
 className="px-2 py-0.5 rounded"
 style={{
 backgroundColor: `${groupColors[step.group]}20`,
 color: groupColors[step.group]
 }}
 >
 {groupNames[step.group]}
 </span>
 </div>
 </div>

 {/* 主内容 */}
 <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* 左侧：可视化 */}
 <div className="space-y-6">
 {/* 当前步骤 */}
 <div
 className="rounded-lg p-6 border"
 style={{
 borderColor: `${groupColors[step.group]}50`,
 background: `linear-gradient(135deg, ${groupColors[step.group]}10, var(--color-bg))`
 }}
 >
 <div className="flex items-center gap-3 mb-4">
 <div
 className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
 style={{ backgroundColor: groupColors[step.group], color: 'white' }}
 >
 {currentStep + 1}
 </div>
 <div>
 <h2 className="text-xl font-bold text-heading">{step.title}</h2>
 <p className="text-sm text-body">{step.description}</p>
 </div>
 </div>

 {step.highlight && (
 <div
 className="inline-block px-3 py-1 rounded-full text-sm font-medium"
 style={{
 backgroundColor: `${groupColors[step.group]}20`,
 color: groupColors[step.group]
 }}
 >
 {step.highlight}
 </div>
 )}
 </div>

 {/* 请求数据 */}
 {step.visualData?.request && (
 <div className="p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-2 font-mono">请求数据</div>
 <pre className="text-sm text-heading overflow-x-auto">
 {JSON.stringify(step.visualData.request, null, 2)}
 </pre>
 </div>
 )}

 {/* 规则来源 */}
 {step.visualData?.sources && (
 <div className="p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">规则来源</div>
 <div className="space-y-2">
 {(step.visualData.sources as Array<{ level: string; path: string; count: number }>).map((source, i) => (
 <div key={i} className="flex items-center justify-between p-2 rounded bg-surface">
 <div>
 <span className="text-heading text-sm">{source.level}</span>
 <span className="text-dim text-xs ml-2">{source.path}</span>
 </div>
 <span className="text-heading font-bold">{source.count}</span>
 </div>
 ))}
 </div>
 <div className="mt-2 pt-2 border-t border-edge flex justify-between">
 <span className="text-body">总计</span>
 <span className="text-heading font-bold">{step.visualData.total}</span>
 </div>
 </div>
 )}

 {/* 规则匹配 */}
 {step.visualData?.rules && (
 <RuleMatchVisualizer
 rules={step.visualData.rules as Array<{ tool: string; match: boolean; priority: number }>}
 matched={step.visualData.matched as number}
 />
 )}

 {/* 安全检查 */}
 {step.visualData?.checks && (
 <SafetyCheckVisualizer
 checks={step.visualData.checks as Array<{ type: string; severity: string; passed: boolean }>}
 overallPassed={step.visualData.overallPassed as boolean}
 />
 )}

 {/* 决策结果 */}
 {step.visualData?.decision && typeof step.visualData.decision === 'string' && (
 <DecisionVisualizer
 decision={step.visualData.decision as string}
 reason={step.visualData.reason as string}
 severity={step.visualData.severity as string}
 />
 )}

 {/* 用户确认对话框 */}
 {step.visualData?.dialog && (
 <ConfirmDialogVisualizer
 dialog={step.visualData.dialog as { tool: string; command: string; reason: string; options: string[] }}
 />
 )}

 {/* 用户响应 */}
 {step.visualData?.response && (
 <div className="p-4 rounded-lg border-2 border-edge/40 bg-elevated">
 <div className="flex items-center gap-3">
 <span className="text-heading text-2xl">✓</span>
 <div>
 <div className="text-heading font-bold">用户响应: {step.visualData.response as string}</div>
 <div className="text-heading text-sm">
 最终决策: {step.visualData.finalDecision as string}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* 最终执行 */}
 {step.visualData?.toolExecuted && (
 <div className="p-4 rounded-lg border-2 border-edge bg-elevated">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading text-lg">✓</span>
 <span className="font-bold text-heading">工具执行中</span>
 </div>
 <code className="text-sm text-heading">
 {typeof step.visualData.executedLabel === 'string' ? (step.visualData.executedLabel as string) : 'Executing tool…'}
 </code>
 </div>
 )}
 </div>

 {/* 右侧：代码 */}
 <div>
 <JsonBlock code={step.codeSnippet} title="policy-engine.ts" />
 </div>
 </div>

 {/* 控制按钮 */}
 <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
 <button
 onClick={handleReset}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors"
 >
 重置
 </button>
 <button
 onClick={handlePrev}
 disabled={currentStep === 0}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50"
 >
 上一步
 </button>
 <button
 onClick={() => setIsPlaying(!isPlaying)}
 className={`
 px-6 py-2 rounded-lg font-medium transition-colors
 ${isPlaying
 ? 'bg-[var(--color-warning)] text-heading hover:bg-[var(--color-warning)]'
 : 'bg-[var(--color-warning)] text-heading hover:opacity-90'
 }
 `}
 >
 {isPlaying ? '暂停' : '自动播放'}
 </button>
 <button
 onClick={handleNext}
 disabled={currentStep === policySequence.length - 1}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50"
 >
 下一步
 </button>
 </div>

 {/* 决策优先级说明 */}
 <div className="max-w-6xl mx-auto mt-8">
 <div
 className="rounded-lg p-6 border border-edge"
 className="bg-surface"
 >
 <h3 className="text-lg font-bold text-heading mb-4">决策优先级</h3>
 <div className="flex items-center justify-center gap-4 flex-wrap">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded bg-[var(--color-danger)] flex items-center justify-center text-heading font-bold">1</div>
 <span className="text-heading">DENY</span>
 </div>
 <span className="text-dim">{'>'}</span>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded bg-[var(--color-warning)] flex items-center justify-center text-heading font-bold">2</div>
 <span className="text-heading">ASK_USER</span>
 </div>
 <span className="text-dim">{'>'}</span>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded bg-[var(--color-success)] flex items-center justify-center text-heading font-bold">3</div>
 <span className="text-heading">ALLOW</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
