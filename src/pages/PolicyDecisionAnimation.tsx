// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Introduction component
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--amber)]/10 to-red-500/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              Policy 策略引擎是 Gemini CLI 的安全决策中枢。
              在工具执行前，根据配置的规则决定是否允许、拒绝或询问用户。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🔐 三种决策</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-green-500/30">
                <div className="text-green-400 font-semibold text-sm">ALLOW</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  直接允许执行<br/>
                  无需用户确认
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-red-500/30">
                <div className="text-red-400 font-semibold text-sm">DENY</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  直接拒绝执行<br/>
                  返回拒绝原因
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-amber-500/30">
                <div className="text-amber-400 font-semibold text-sm">ASK_USER</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  询问用户确认<br/>
                  等待用户响应
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🏗️ 三种审批模式</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-amber-400">DEFAULT</div>
                <div className="text-[var(--text-muted)]">默认模式</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-cyan-400">AUTO_EDIT</div>
                <div className="text-[var(--text-muted)]">自动编辑</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-green-400">YOLO</div>
                <div className="text-[var(--text-muted)]">全自动</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">📍 源码:</span>
              <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
                packages/core/src/policy/
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">🔗 相关:</span>
              <span className="text-[var(--cyber-blue)] text-xs">PolicyEngine, SafetyChecker, MessageBus</span>
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
    description: 'Policy Engine 接收工具执行请求，包含工具名称和参数',
    codeSnippet: `// policy-engine.ts:30-60
interface ToolRequest {
  toolName: string;
  toolInput: Record<string, unknown>;
  context: {
    sessionId: string;
    workingDirectory: string;
    approvalMode: ApprovalMode;
  };
}

async checkPermission(
  request: ToolRequest
): Promise<PolicyDecision> {
  // 收到工具请求
  console.debug('[Policy] Checking permission for', request.toolName);

  // 示例请求
  // toolName: "Bash"
  // toolInput: { command: "rm -rf node_modules" }
  // approvalMode: "default"
}`,
    visualData: {
      request: {
        toolName: 'Bash',
        toolInput: { command: 'rm -rf node_modules' },
        approvalMode: 'default'
      }
    },
    highlight: 'Bash: rm -rf',
  },
  {
    phase: 'rule_load',
    group: 'rules',
    title: '加载规则配置',
    description: '从 TOML 配置文件加载 Policy 规则',
    codeSnippet: `// policy-loader.ts:20-50
async loadPolicyRules(): Promise<PolicyRule[]> {
  const rules: PolicyRule[] = [];

  // 1. 项目级规则
  const projectRules = await loadFromPath(
    '.gemini/policy.toml'
  );
  rules.push(...projectRules);

  // 2. 用户级规则
  const userRules = await loadFromPath(
    '~/.gemini/policy.toml'
  );
  rules.push(...userRules);

  // 3. 内置安全规则
  rules.push(...getBuiltinSafetyRules());

  return rules;
}

// 加载结果
// 项目级: 3 条规则
// 用户级: 2 条规则
// 内置: 5 条规则`,
    visualData: {
      sources: [
        { level: '项目级', path: '.gemini/policy.toml', count: 3 },
        { level: '用户级', path: '~/.gemini/policy.toml', count: 2 },
        { level: '内置', path: 'built-in safety', count: 5 },
      ],
      total: 10
    },
    highlight: '10 条规则',
  },
  {
    phase: 'rule_match_tool',
    group: 'rules',
    title: '工具名称匹配',
    description: '根据工具名称筛选匹配的规则，支持通配符',
    codeSnippet: `// policy-engine.ts:80-110
private matchToolName(
  rule: PolicyRule,
  toolName: string
): boolean {
  const pattern = rule.tool;

  // 精确匹配
  if (pattern === toolName) {
    return true;
  }

  // 通配符匹配
  if (pattern.includes('*')) {
    const regex = new RegExp(
      '^' + pattern.replace('*', '.*') + '$'
    );
    return regex.test(toolName);
  }

  return false;
}

// 匹配示例
// rule.tool: "Bash"     → match: true
// rule.tool: "Bash:*"   → match: true
// rule.tool: "*"        → match: true
// rule.tool: "Write"    → match: false`,
    visualData: {
      rules: [
        { tool: 'Bash', match: true, priority: 1 },
        { tool: 'Bash:rm*', match: true, priority: 2 },
        { tool: '*', match: true, priority: 10 },
        { tool: 'Write', match: false, priority: 0 },
      ],
      matched: 3
    },
    highlight: '3 条规则匹配',
  },
  {
    phase: 'rule_match_params',
    group: 'rules',
    title: '参数模式匹配',
    description: '检查工具参数是否匹配规则的参数模式',
    codeSnippet: `// policy-engine.ts:120-160
private matchParams(
  rule: PolicyRule,
  toolInput: Record<string, unknown>
): boolean {
  if (!rule.params) {
    return true; // 无参数限制，直接匹配
  }

  for (const [key, pattern] of Object.entries(rule.params)) {
    const value = toolInput[key];

    if (typeof pattern === 'string') {
      // 字符串模式匹配
      const regex = new RegExp(pattern);
      if (!regex.test(String(value))) {
        return false;
      }
    }
  }

  return true;
}

// 规则参数模式
// params.command: "rm\\s+-rf"
// 实际参数: "rm -rf node_modules"
// → 匹配成功`,
    visualData: {
      rule: {
        tool: 'Bash',
        params: { command: 'rm\\s+-rf' },
        decision: 'ASK_USER'
      },
      input: { command: 'rm -rf node_modules' },
      matched: true
    },
    highlight: '参数匹配成功',
  },
  {
    phase: 'safety_check',
    group: 'safety',
    title: '安全检查器',
    description: 'SafetyChecker 执行额外的安全检查',
    codeSnippet: `// safety-checker.ts:30-70
class SafetyChecker {
  async check(request: ToolRequest): Promise<SafetyResult> {
    const checks: SafetyCheck[] = [];

    // 1. 危险命令检测
    if (request.toolName === 'Bash') {
      const dangerous = this.detectDangerousCommands(
        request.toolInput.command
      );
      if (dangerous) {
        checks.push({
          type: 'dangerous_command',
          severity: 'high',
          message: 'Detected destructive command: rm -rf'
        });
      }
    }

    // 2. 路径越界检测
    const pathEscape = this.detectPathEscape(request);
    if (pathEscape) {
      checks.push({
        type: 'path_escape',
        severity: 'medium',
        message: 'Command may access paths outside project'
      });
    }

    return { passed: checks.length === 0, checks };
  }
}`,
    visualData: {
      checks: [
        { type: 'dangerous_command', severity: 'high', passed: false },
        { type: 'path_escape', severity: 'medium', passed: true },
      ],
      overallPassed: false
    },
    highlight: '检测到危险命令',
  },
  {
    phase: 'approval_mode_check',
    group: 'decision',
    title: '审批模式检查',
    description: '根据当前审批模式决定是否需要用户确认',
    codeSnippet: `// policy-engine.ts:180-220
private checkApprovalMode(
  rule: PolicyRule,
  context: RequestContext
): PolicyDecision | null {
  const mode = context.approvalMode;

  switch (mode) {
    case 'yolo':
      // YOLO 模式：即使匹配危险规则也执行
      // 但仍遵守 DENY 规则
      if (rule.decision === 'DENY') {
        return { action: 'DENY', reason: rule.reason };
      }
      return { action: 'ALLOW' };

    case 'autoEdit':
      // 自动编辑：允许文件操作，其他询问
      if (['Write', 'Edit', 'Read'].includes(this.toolName)) {
        return { action: 'ALLOW' };
      }
      break;

    case 'default':
    default:
      // 默认模式：遵循规则
      break;
  }

  return null; // 继续规则匹配
}`,
    visualData: {
      mode: 'default',
      decision: null, // 继续规则匹配
      reason: '默认模式需遵循规则'
    },
    highlight: 'DEFAULT 模式',
  },
  {
    phase: 'decision_make',
    group: 'decision',
    title: '生成决策',
    description: '综合规则匹配和安全检查结果，生成最终决策',
    codeSnippet: `// policy-engine.ts:230-270
private makeDecision(
  matchedRules: PolicyRule[],
  safetyResult: SafetyResult
): PolicyDecision {
  // 优先级：DENY > ASK_USER > ALLOW

  // 1. 检查是否有 DENY 规则
  const denyRule = matchedRules.find(r => r.decision === 'DENY');
  if (denyRule) {
    return {
      action: 'DENY',
      reason: denyRule.reason || 'Operation not allowed'
    };
  }

  // 2. 安全检查未通过 → ASK_USER
  if (!safetyResult.passed) {
    return {
      action: 'ASK_USER',
      reason: safetyResult.checks[0].message,
      severity: 'warning'
    };
  }

  // 3. 检查 ASK_USER 规则
  const askRule = matchedRules.find(r => r.decision === 'ASK_USER');
  if (askRule) {
    return {
      action: 'ASK_USER',
      reason: askRule.reason
    };
  }

  // 4. 默认允许
  return { action: 'ALLOW' };
}`,
    visualData: {
      decision: 'ASK_USER',
      reason: 'Detected destructive command: rm -rf',
      severity: 'warning'
    },
    highlight: 'ASK_USER',
  },
  {
    phase: 'ask_user',
    group: 'user',
    title: '请求用户确认',
    description: '通过 MessageBus 发送确认请求到 UI 层',
    codeSnippet: `// policy-engine.ts:280-310
private async requestUserConfirmation(
  request: ToolRequest,
  decision: PolicyDecision
): Promise<UserResponse> {
  const confirmRequest: ToolConfirmationRequest = {
    type: 'TOOL_CONFIRMATION_REQUEST',
    toolName: request.toolName,
    toolInput: request.toolInput,
    reason: decision.reason,
    severity: decision.severity,
    options: ['allow', 'deny', 'allow_always']
  };

  // 发送到 MessageBus
  const response = await this.messageBus.request(
    confirmRequest
  );

  return response;
}

// UI 显示确认对话框
// ┌─────────────────────────────────────┐
// │ ⚠️  Tool requires confirmation      │
// │                                     │
// │ Tool: Bash                          │
// │ Command: rm -rf node_modules        │
// │                                     │
// │ Reason: Detected destructive command│
// │                                     │
// │ [Allow] [Deny] [Allow Always]       │
// └─────────────────────────────────────┘`,
    visualData: {
      dialog: {
        tool: 'Bash',
        command: 'rm -rf node_modules',
        reason: 'Detected destructive command',
        options: ['allow', 'deny', 'allow_always']
      }
    },
    highlight: '等待用户响应',
  },
  {
    phase: 'user_response',
    group: 'user',
    title: '用户响应',
    description: '用户选择允许执行该命令',
    codeSnippet: `// message-bus.ts:80-110
// 用户点击 "Allow"
const userResponse: ToolConfirmationResponse = {
  type: 'TOOL_CONFIRMATION_RESPONSE',
  requestId: 'req_12345',
  decision: 'allow',
  timestamp: Date.now()
};

// MessageBus 转发响应到 Policy Engine
messageBus.emit('confirmation_response', userResponse);

// Policy Engine 处理响应
handleUserResponse(response: UserResponse): PolicyDecision {
  switch (response.decision) {
    case 'allow':
      return { action: 'ALLOW' };

    case 'deny':
      return { action: 'DENY', reason: 'User denied' };

    case 'allow_always':
      // 添加到白名单
      this.addToWhitelist(request);
      return { action: 'ALLOW' };
  }
}`,
    visualData: {
      response: 'allow',
      finalDecision: 'ALLOW'
    },
    highlight: '用户选择 Allow',
  },
  {
    phase: 'result_return',
    group: 'result',
    title: '返回决策结果',
    description: 'Policy Engine 返回最终决策，工具继续执行',
    codeSnippet: `// policy-engine.ts:320-350
async checkPermission(
  request: ToolRequest
): Promise<PolicyDecision> {
  // ... 规则匹配和安全检查 ...

  const decision = this.makeDecision(
    matchedRules,
    safetyResult
  );

  if (decision.action === 'ASK_USER') {
    const userResponse = await this.requestUserConfirmation(
      request,
      decision
    );
    return this.handleUserResponse(userResponse);
  }

  return decision;
}

// 最终决策
{
  action: 'ALLOW',
  source: 'user_confirmation',
  timestamp: Date.now()
}

// → 工具 Bash 执行 "rm -rf node_modules"`,
    visualData: {
      finalDecision: {
        action: 'ALLOW',
        source: 'user_confirmation'
      },
      toolExecuted: true
    },
    highlight: 'ALLOW → 执行',
  },
];

// 阶段组颜色
const groupColors: Record<PhaseGroup, string> = {
  request: '#3b82f6',   // blue
  rules: '#8b5cf6',     // purple
  safety: '#ef4444',    // red
  decision: '#f59e0b',  // amber
  user: '#22c55e',      // green
  result: '#10b981',    // emerald
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
  ALLOW: '#22c55e',
  DENY: '#ef4444',
  ASK_USER: '#f59e0b',
};

// 规则匹配可视化
function RuleMatchVisualizer({ rules, matched }: { rules?: Array<{ tool: string; match: boolean; priority: number }>; matched?: number }) {
  if (!rules) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">规则匹配</div>
      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded border transition-all ${
              rule.match
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-gray-700 bg-gray-800/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg ${rule.match ? 'text-green-400' : 'text-gray-500'}`}>
                {rule.match ? '✓' : '✗'}
              </span>
              <code className="text-sm text-white font-mono">{rule.tool}</code>
            </div>
            {rule.match && (
              <span className="text-xs text-gray-400">优先级: {rule.priority}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-right text-sm text-gray-400">
        匹配: <span className="text-green-400 font-bold">{matched}</span> / {rules.length}
      </div>
    </div>
  );
}

// 安全检查可视化
function SafetyCheckVisualizer({ checks, overallPassed }: { checks?: Array<{ type: string; severity: string; passed: boolean }>; overallPassed?: boolean }) {
  if (!checks) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">安全检查</div>
      <div className="space-y-2">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded border ${
              check.passed
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                {check.passed ? '✓' : '✗'}
              </span>
              <span className="text-sm text-white">{check.type}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              check.severity === 'high' ? 'bg-red-500/20 text-red-400' :
              check.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {check.severity}
            </span>
          </div>
        ))}
      </div>
      <div className={`mt-3 p-2 rounded text-center text-sm font-bold ${
        overallPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {overallPassed ? '安全检查通过' : '安全检查未通过'}
      </div>
    </div>
  );
}

// 用户确认对话框可视化
function ConfirmDialogVisualizer({ dialog }: { dialog?: { tool: string; command: string; reason: string; options: string[] } }) {
  if (!dialog) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border-2 border-amber-500/50" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400 text-xl">⚠️</span>
        <span className="text-white font-bold">Tool requires confirmation</span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex">
          <span className="text-gray-400 w-20">Tool:</span>
          <span className="text-white font-mono">{dialog.tool}</span>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-20">Command:</span>
          <code className="text-amber-400 font-mono">{dialog.command}</code>
        </div>
        <div className="flex">
          <span className="text-gray-400 w-20">Reason:</span>
          <span className="text-red-400">{dialog.reason}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {dialog.options.map((opt, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded text-sm font-medium ${
              opt === 'allow' ? 'bg-green-600 text-white' :
              opt === 'deny' ? 'bg-red-600 text-white' :
              'bg-gray-600 text-white'
            }`}
          >
            {opt === 'allow' ? 'Allow' : opt === 'deny' ? 'Deny' : 'Allow Always'}
          </button>
        ))}
      </div>
    </div>
  );
}

// 决策结果可视化
function DecisionVisualizer({ decision, severity }: { decision?: string; reason?: string; severity?: string }) {
  if (!decision) return null;

  const color = decisionColors[decision] || '#6b7280';

  return (
    <div
      className="mb-6 p-4 rounded-lg border-2"
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">决策结果</span>
        {severity && (
          <span className={`text-xs px-2 py-1 rounded ${
            severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
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
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      {/* 标题 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--amber)] mb-2 font-mono">
          Policy 决策流程
        </h1>
        <p className="text-gray-400">
          从请求接收到决策返回的完整安全决策流程
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
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
        <div className="flex justify-between mt-2 text-xs text-gray-500">
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
            className="rounded-xl p-6 border"
            style={{
              borderColor: `${groupColors[step.group]}50`,
              background: `linear-gradient(135deg, ${groupColors[step.group]}10, rgba(0,0,0,0.8))`
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
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
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
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-2 font-mono">请求数据</div>
              <pre className="text-sm text-[var(--terminal-green)] overflow-x-auto">
                {JSON.stringify(step.visualData.request, null, 2)}
              </pre>
            </div>
          )}

          {/* 规则来源 */}
          {step.visualData?.sources && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-3 font-mono">规则来源</div>
              <div className="space-y-2">
                {(step.visualData.sources as Array<{ level: string; path: string; count: number }>).map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                    <div>
                      <span className="text-white text-sm">{source.level}</span>
                      <span className="text-gray-500 text-xs ml-2">{source.path}</span>
                    </div>
                    <span className="text-[var(--terminal-green)] font-bold">{source.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between">
                <span className="text-gray-400">总计</span>
                <span className="text-[var(--terminal-green)] font-bold">{step.visualData.total}</span>
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
            <div className="p-4 rounded-lg border-2 border-green-500/50 bg-green-500/10">
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <div className="text-white font-bold">用户响应: {step.visualData.response as string}</div>
                  <div className="text-green-400 text-sm">
                    最终决策: {step.visualData.finalDecision as string}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 最终执行 */}
          {step.visualData?.toolExecuted && (
            <div className="p-4 rounded-lg border-2 border-green-500 bg-green-500/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">✓</span>
                <span className="font-bold text-white">工具执行中</span>
              </div>
              <code className="text-sm text-[var(--terminal-green)]">
                Bash: rm -rf node_modules
              </code>
            </div>
          )}
        </div>

        {/* 右侧：代码 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">
                policy-engine.ts
              </span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          重置
        </button>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          上一步
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-[var(--amber)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === policySequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>

      {/* 决策优先级说明 */}
      <div className="max-w-6xl mx-auto mt-8">
        <div
          className="rounded-xl p-6 border border-gray-800"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <h3 className="text-lg font-bold text-white mb-4">决策优先级</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white font-bold">1</div>
              <span className="text-red-400">DENY</span>
            </div>
            <span className="text-gray-600">{'>'}</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-black font-bold">2</div>
              <span className="text-amber-400">ASK_USER</span>
            </div>
            <span className="text-gray-600">{'>'}</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white font-bold">3</div>
              <span className="text-green-400">ALLOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
