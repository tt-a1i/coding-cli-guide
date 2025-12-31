import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'hook-system', label: 'Hook 事件系统', description: '事件拦截机制' },
  { id: 'message-bus', label: '消息总线', description: '异步事件协调' },
  { id: 'approval-mode', label: '审批模式', description: '用户交互层权限' },
  { id: 'sandbox', label: '沙箱系统', description: '执行隔离机制' },
  { id: 'trusted-folders', label: '信任机制', description: '文件夹信任级别' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--amber)]/10 to-red-500/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
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
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--amber)] font-bold">一句话：</span>
              多层次安全决策系统，通过规则匹配和 Safety Checker 对工具调用和 Hook 执行进行 ALLOW/DENY/ASK_USER 决策
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">决策类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">审批模式</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">Checker 类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">自定义规则</div>
            </div>
          </div>

          {/* 核心决策 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Policy 决策类型</h4>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-semibold">
                ALLOW ✓
              </span>
              <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 font-semibold">
                DENY ✗
              </span>
              <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 font-semibold">
                ASK_USER ?
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/policy/policy-engine.ts
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

    style request fill:#22d3ee,color:#000
    style allow fill:#22c55e,color:#000
    style deny fill:#ef4444,color:#fff
    style ask fill:#f59e0b,color:#000
    style rules fill:#a855f7,color:#fff
    style checkers fill:#6366f1,color:#fff`;

  const policyTypesCode = `// packages/core/src/policy/types.ts

// 决策类型
export enum PolicyDecision {
  ALLOW = 'allow',      // 允许执行
  DENY = 'deny',        // 拒绝执行
  ASK_USER = 'ask_user', // 询问用户
}

// 审批模式（与 ApprovalMode 不同，这是 Policy 层面的）
export enum ApprovalMode {
  DEFAULT = 'default',     // 默认模式
  AUTO_EDIT = 'autoEdit',  // 自动编辑
  YOLO = 'yolo',           // 全自动
}

// Hook 来源类型
export type HookSource = 'project' | 'user' | 'system' | 'extension';`;

  const policyRuleCode = `// 策略规则定义
export interface PolicyRule {
  toolName?: string;       // 工具名称（支持通配符 serverName__*）
  argsPattern?: RegExp;    // 参数匹配正则
  decision: PolicyDecision; // 决策结果
  priority?: number;       // 优先级（越高越先匹配）
  modes?: ApprovalMode[];  // 适用的审批模式
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
  | ExternalCheckerConfig   // 外部脚本
  | InProcessCheckerConfig; // 内置检查器

// 内置 Checker 类型
export enum InProcessCheckerType {
  ALLOWED_PATH = 'allowed-path', // 路径白名单检查
}`;

  const policyEngineCode = `// packages/core/src/policy/policy-engine.ts

export class PolicyEngine {
  private rules: PolicyRule[];
  private checkers: SafetyCheckerRule[];
  private hookCheckers: HookCheckerRule[];
  private readonly defaultDecision: PolicyDecision;
  private readonly nonInteractive: boolean;
  private approvalMode: ApprovalMode;

  constructor(config: PolicyEngineConfig = {}, checkerRunner?: CheckerRunner) {
    // 按优先级排序规则
    this.rules = (config.rules ?? []).sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    this.checkers = (config.checkers ?? []).sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    this.defaultDecision = config.defaultDecision ?? PolicyDecision.ASK_USER;
    this.nonInteractive = config.nonInteractive ?? false;
  }

  // 检查工具调用
  async check(toolCall: FunctionCall, serverName?: string): Promise<{
    decision: PolicyDecision;
    rule?: PolicyRule;
  }> {
    // 1. 序列化参数用于模式匹配
    const stringifiedArgs = stableStringify(toolCall.args);

    // 2. 查找匹配的规则
    for (const rule of this.rules) {
      if (ruleMatches(rule, toolCall, stringifiedArgs, serverName, this.approvalMode)) {
        // Shell 命令特殊处理：检查子命令
        if (SHELL_TOOL_NAMES.includes(toolCall.name) && rule.decision === PolicyDecision.ALLOW) {
          const subDecision = await this.checkShellSubCommands(toolCall, serverName);
          if (subDecision !== PolicyDecision.ALLOW) {
            return { decision: subDecision, rule };
          }
        }
        return { decision: this.applyNonInteractiveMode(rule.decision), rule };
      }
    }

    // 3. 运行 Safety Checkers
    if (this.checkerRunner) {
      for (const checkerRule of this.checkers) {
        if (ruleMatches(checkerRule, toolCall, ...)) {
          const result = await this.checkerRunner.runChecker(toolCall, checkerRule.checker);
          if (result.decision === SafetyCheckDecision.DENY) {
            return { decision: PolicyDecision.DENY };
          }
        }
      }
    }

    // 4. 默认决策
    return { decision: this.applyNonInteractiveMode(this.defaultDecision) };
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

  const tomlConfigCode = `# .gemini/policy.toml - Policy 配置示例

# 默认决策
[defaults]
decision = "ask_user"
non_interactive = false

# 工具规则
[[rules]]
tool_name = "read_file"
decision = "allow"
priority = 100

[[rules]]
tool_name = "run_shell_command"
args_pattern = "^git\\s"  # 只允许 git 命令
decision = "allow"
priority = 50

[[rules]]
tool_name = "run_shell_command"
decision = "ask_user"
priority = 10

# MCP 服务器工具（通配符）
[[rules]]
tool_name = "trusted-server__*"
decision = "allow"
priority = 80

[[rules]]
tool_name = "untrusted-server__*"
decision = "deny"
priority = 90

# Safety Checker
[[checkers]]
tool_name = "write_file"
priority = 100
[checkers.checker]
type = "in-process"
name = "allowed-path"
[checkers.checker.config]
excluded_args = ["temp_path"]`;

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
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Policy 策略引擎</h2>
        <p className="text-gray-300 mb-4">
          Policy Engine 是 Gemini CLI 的核心安全决策系统，负责对工具调用和 Hook 执行进行权限判定。
          通过规则匹配、Safety Checker 和审批模式的组合，实现细粒度的安全控制。
        </p>
      </section>

      {/* 1. 核心概念 */}
      <Layer title="核心概念" icon="🎯">
        <div className="space-y-4">
          <CodeBlock code={policyTypesCode} language="typescript" title="Policy 类型定义" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="ALLOW" variant="green">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">允许执行</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 自动执行工具</li>
                  <li>• 无需用户确认</li>
                  <li>• 用于可信操作</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="DENY" variant="red">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">拒绝执行</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 直接阻止操作</li>
                  <li>• 返回错误给 AI</li>
                  <li>• 用于危险操作</li>
                </ul>
              </div>
            </HighlightBox>

            <HighlightBox title="ASK_USER" variant="yellow">
              <div className="text-sm space-y-2">
                <p className="text-gray-300 font-semibold">询问用户</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 显示确认对话框</li>
                  <li>• 用户决定批准/拒绝</li>
                  <li>• 默认决策类型</li>
                </ul>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 2. 决策流程 */}
      <Layer title="决策流程" icon="📊">
        <div className="space-y-4">
          <MermaidDiagram chart={policyDecisionFlowChart} title="Policy 决策流程" />
          <CodeBlock code={policyEngineCode} language="typescript" title="PolicyEngine 核心逻辑" />
        </div>
      </Layer>

      {/* 3. 规则定义 */}
      <Layer title="规则定义" icon="📜">
        <div className="space-y-4">
          <CodeBlock code={policyRuleCode} language="typescript" title="PolicyRule 结构" />

          <HighlightBox title="规则字段说明" variant="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-cyan-300 mb-2">匹配条件</h5>
                <ul className="text-gray-400 space-y-1">
                  <li>• <code className="text-cyan-300">toolName</code>: 工具名或通配符模式</li>
                  <li>• <code className="text-cyan-300">argsPattern</code>: 参数正则匹配</li>
                  <li>• <code className="text-cyan-300">modes</code>: 适用的审批模式</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-cyan-300 mb-2">决策控制</h5>
                <ul className="text-gray-400 space-y-1">
                  <li>• <code className="text-cyan-300">priority</code>: 数字越大优先级越高</li>
                  <li>• <code className="text-cyan-300">decision</code>: 决策结果</li>
                  <li>• 首个匹配的规则生效</li>
                </ul>
              </div>
            </div>
          </HighlightBox>

          <CodeBlock code={ruleMatchingCode} language="typescript" title="规则匹配逻辑" />
        </div>
      </Layer>

      {/* 4. 通配符匹配 */}
      <Layer title="通配符与 MCP 工具" icon="🔗">
        <div className="space-y-4">
          <HighlightBox title="MCP 服务器工具匹配" variant="purple">
            <div className="text-sm space-y-3">
              <p className="text-gray-300">
                MCP 工具名格式：<code className="bg-black/30 px-1 rounded">serverName__toolName</code>
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-cyan-300">trusted-server__*</code>
                  <span className="text-gray-400">→ 匹配 trusted-server 的所有工具</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-cyan-300">github__create_issue</code>
                  <span className="text-gray-400">→ 精确匹配单个工具</span>
                </div>
              </div>
              <p className="text-amber-400 text-xs">
                ⚠️ 安全检查：serverName 必须精确匹配前缀，防止恶意服务器伪造名称
              </p>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 5. Safety Checker */}
      <Layer title="Safety Checker" icon="🔍">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="External Checker" variant="blue">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">外部脚本检查器</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• 执行自定义脚本</li>
                  <li>• 通过 stdout JSON 返回结果</li>
                  <li>• 可访问完整上下文</li>
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
                <p className="text-gray-300">内置检查器</p>
                <ul className="text-gray-400 space-y-1">
                  <li>• <code>allowed-path</code>: 路径白名单</li>
                  <li>• 高效，无进程开销</li>
                  <li>• 可配置参数</li>
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
      <Layer title="TOML 配置" icon="⚙️">
        <div className="space-y-4">
          <CodeBlock code={tomlConfigCode} language="toml" title=".gemini/policy.toml" />

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">配置文件位置</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-gray-300">.gemini/policy.toml</code>
                <span className="text-gray-400">项目级配置</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-gray-300">~/.config/gemini/policy.toml</code>
                <span className="text-gray-400">用户级配置</span>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 7. Hook 策略检查 */}
      <Layer title="Hook 策略检查" icon="🪝">
        <div className="space-y-4">
          <CodeBlock code={hookPolicyCode} language="typescript" title="checkHook 方法" />

          <HighlightBox title="不可信文件夹限制" variant="red">
            <div className="text-sm space-y-2 text-gray-300">
              <p>
                当 <code className="bg-black/30 px-1 rounded">trustedFolder === false</code> 时，
                来自项目配置（<code>hookSource === 'project'</code>）的 Hook 会被自动拒绝。
              </p>
              <p className="text-amber-400">
                这防止恶意项目通过 Hook 在用户机器上执行任意命令。
              </p>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 8. Shell 命令特殊处理 */}
      <Layer title="Shell 命令特殊处理" icon="💻">
        <div className="space-y-4">
          <MermaidDiagram chart={`flowchart TD
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

    style shell fill:#22d3ee,color:#000
    style allow fill:#22c55e,color:#000
    style deny fill:#ef4444,color:#fff
    style ask fill:#f59e0b,color:#000`} title="复合 Shell 命令处理" />

          <HighlightBox title="复合命令检查" variant="yellow">
            <div className="text-sm space-y-2 text-gray-300">
              <p>
                当 Shell 命令包含多个子命令（如 <code className="bg-black/30 px-1 rounded">cmd1 && cmd2</code>）时，
                Policy Engine 会递归检查每个子命令。
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>任一子命令 DENY → 整体 DENY</li>
                <li>任一子命令 ASK_USER → 整体 ASK_USER</li>
                <li>全部子命令 ALLOW → 整体 ALLOW</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 9. 非交互模式 */}
      <Layer title="非交互模式" icon="🤖">
        <div className="space-y-4">
          <HighlightBox title="nonInteractive 模式" variant="purple">
            <div className="text-sm space-y-2 text-gray-300">
              <p>
                在非交互模式（如 CI/CD 环境）下，<code className="bg-black/30 px-1 rounded">ASK_USER</code>
                决策会自动转换为 <code className="bg-black/30 px-1 rounded text-red-400">DENY</code>。
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
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/policy/types.ts
            </code>
            <span className="text-gray-400">PolicyDecision、PolicyRule 等类型定义</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/policy/policy-engine.ts
            </code>
            <span className="text-gray-400">PolicyEngine 核心实现</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/policy/toml-loader.ts
            </code>
            <span className="text-gray-400">TOML 配置加载器</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/policy/config.ts
            </code>
            <span className="text-gray-400">配置解析与验证</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/safety/checker-runner.ts
            </code>
            <span className="text-gray-400">Safety Checker 执行器</span>
          </div>
        </div>
      </Layer>

      {/* 设计决策 */}
      <Layer title="设计决策" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么默认是 ASK_USER 而非 DENY？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>无匹配规则时默认 ASK_USER，而非更严格的 DENY。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>用户体验</strong>：DENY 会阻塞工作流，用户可能不清楚原因</li>
                <li><strong>渐进式安全</strong>：让用户有机会了解工具行为后做决定</li>
                <li><strong>学习曲线</strong>：新用户可以通过确认对话框学习规则配置</li>
              </ul>
              <p><strong>权衡：</strong>在非交互模式下自动降级为 DENY。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么使用 stableStringify？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>参数序列化使用 stable JSON stringify（键排序）。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>确定性匹配</strong>：相同参数始终生成相同字符串</li>
                <li><strong>正则可靠性</strong>：argsPattern 匹配结果可预测</li>
                <li><strong>缓存友好</strong>：相同参数的决策可以缓存</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
