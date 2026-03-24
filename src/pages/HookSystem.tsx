import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 {
 id: 'policy-engine',
 label: 'Policy 策略引擎',
 description: '安全决策系统',
 },
 { id: 'message-bus', label: '消息总线', description: '异步事件协调' },
 { id: 'approval-mode', label: '审批模式', description: '工具执行权限控制' },
 { id: 'tool-arch', label: '工具架构', description: '工具系统基础' },
 { id: 'subagent', label: '子代理系统', description: 'Agent 事件触发' },
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
 <span className="text-heading font-bold">
 一句话：
 </span>
 事件驱动的拦截机制，通过 Shell
 命令在关键节点（工具执行、模型调用、会话生命周期）注入自定义逻辑
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">
 11
 </div>
 <div className="text-xs text-dim">事件类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">
 4
 </div>
 <div className="text-xs text-dim">配置层级</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">5</div>
 <div className="text-xs text-dim">决策类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">6</div>
 <div className="text-xs text-dim">核心组件</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">
 Hook 执行流程
 </h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Event 触发
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Planner 规划
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Runner 执行
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Aggregator 聚合
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 gemini-cli/packages/core/src/hooks/hookSystem.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function HookSystem() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const hookEventFlowChart = `flowchart TD
 trigger([事件触发点])
 planner[HookPlanner<br/>规划执行计划]
 registry[(HookRegistry<br/>Hook 配置注册表)]
 policy{Policy Engine<br/>权限检查}
 runner[HookRunner<br/>Shell 命令执行]
 aggregator[HookAggregator<br/>结果聚合]
 output([Hook 输出<br/>decision/systemMessage])

 trigger --> planner
 planner --> registry
 registry --> planner
 planner --> policy
 policy -->|ALLOW| runner
 policy -->|DENY| output
 runner --> aggregator
 aggregator --> output

 style trigger fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style planner fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style registry fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style policy fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style runner fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style aggregator fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style output fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const hookEventTypesCode = `// gemini-cli/packages/core/src/hooks/types.ts

export enum HookEventName {
  BeforeTool = 'BeforeTool', // 工具执行前
  AfterTool = 'AfterTool', // 工具执行后
  BeforeAgent = 'BeforeAgent', // Agent 执行前
  AfterAgent = 'AfterAgent', // Agent 执行后
  Notification = 'Notification', // 通知事件
  SessionStart = 'SessionStart', // 会话开始
  SessionEnd = 'SessionEnd', // 会话结束
  PreCompress = 'PreCompress', // 上下文压缩前
  BeforeModel = 'BeforeModel', // 模型调用前
  AfterModel = 'AfterModel', // 模型调用后
  BeforeToolSelection = 'BeforeToolSelection', // 工具选择前
}

// 配置来源优先级（从高到低）
export enum ConfigSource {
  Project = 'project', // 项目级 .gemini/settings.json
  User = 'user', // 用户级 ~/.config/gemini/
  System = 'system', // 系统级
  Extensions = 'extensions', // 扩展提供
}`;

 const hookDecisionCode = `// Hook 决策类型
export type HookDecision =
  | 'ask' // 询问用户
  | 'block' // 阻止执行
  | 'deny' // 拒绝操作
  | 'approve' // 批准执行
  | 'allow' // 允许继续
  | undefined; // 无决策，继续默认流程

// Hook 输出结构
export interface HookOutput {
  continue?: boolean; // 是否继续执行
  stopReason?: string; // 停止原因
  suppressOutput?: boolean; // 抑制输出
  systemMessage?: string; // 注入系统消息
  decision?: HookDecision; // 决策类型
  reason?: string; // 决策原因
  hookSpecificOutput?: Record<string, unknown>; // 特定输出
}`;

 const hookConfigCode = `// .gemini/settings.yaml - Hook 配置示例

hooks:
  BeforeTool:
  - matcher: "run_shell_command" # 匹配特定工具
  sequential: true # 顺序执行
  hooks:
  - type: command
  name: "security-check"
  command: "python scripts/check_command.py"
  timeout: 5000

  SessionStart:
  - hooks:
  - type: command
  name: "init-env"
  command: "./scripts/init.sh"

  BeforeModel:
  - hooks:
  - type: command
  name: "token-budget"
  command: "node scripts/check-tokens.js"`;

 const hookSystemCode = `// gemini-cli/packages/core/src/hooks/hookSystem.ts

export class HookSystem {
  private readonly hookRegistry: HookRegistry;
  private readonly hookRunner: HookRunner;
  private readonly hookAggregator: HookAggregator;
  private readonly hookPlanner: HookPlanner;
  private readonly hookEventHandler: HookEventHandler;

  constructor(config: Config) {
  const logger = logs.getLogger(SERVICE_NAME);
  const messageBus = config.getMessageBus();

  // 初始化各组件
  this.hookRegistry = new HookRegistry(config);
  this.hookRunner = new HookRunner(config);
  this.hookAggregator = new HookAggregator();
  this.hookPlanner = new HookPlanner(this.hookRegistry);
  this.hookEventHandler = new HookEventHandler(
  config, logger,
  this.hookPlanner, this.hookRunner, this.hookAggregator,
  messageBus, // 通过 MessageBus 进行权限检查
  );
  }

  async initialize(): Promise<void> {
  await this.hookRegistry.initialize();
  }

  getEventHandler(): HookEventHandler {
  return this.hookEventHandler;
  }
}`;

 const beforeToolHookCode = `// BeforeTool Hook 输入
export interface BeforeToolInput extends HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
}

// Hook 可以修改工具输入
export class BeforeToolHookOutput extends DefaultHookOutput {
  getModifiedToolInput(): Record<string, unknown> | undefined {
  if (this.hookSpecificOutput?.['tool_input']) {
  return this.hookSpecificOutput['tool_input'] as Record<string, unknown>;
  }
  return undefined;
  }
}

// 使用示例：Hook 脚本输出 JSON
// stdout: {"decision": "approve", "hookSpecificOutput": {"tool_input": {"command": "git status"}}}`;

 const beforeModelHookCode = `// BeforeModel Hook 可以拦截和修改 LLM 请求
export interface BeforeModelInput extends HookInput {
  llm_request: LLMRequest; // 包含 messages, tools, config 等
}

export class BeforeModelHookOutput extends DefaultHookOutput {
  // 获取合成响应（绕过实际 LLM 调用）
  getSyntheticResponse(): GenerateContentResponse | undefined {
  if (this.hookSpecificOutput?.['llm_response']) {
  return defaultHookTranslator.fromHookLLMResponse(
  this.hookSpecificOutput['llm_response'] as LLMResponse
  );
  }
  return undefined;
  }

  // 修改 LLM 请求参数
  applyLLMRequestModifications(
  target: GenerateContentParameters
  ): GenerateContentParameters {
  if (this.hookSpecificOutput?.['llm_request']) {
  const hookRequest = this.hookSpecificOutput['llm_request'];
  return { ...target, ...sdkRequest };
  }
  return target;
  }
}`;

 // 完整的 HookOutput 类层次结构
 const hookOutputHierarchyCode = `// gemini-cli/packages/core/src/hooks/types.ts

// 基类：DefaultHookOutput（注意：shouldStopExecution 只看 continue===false）
export class DefaultHookOutput implements HookOutput {
  continue?: boolean;
  stopReason?: string;
  suppressOutput?: boolean;
  systemMessage?: string;
  decision?: HookDecision;
  reason?: string;
  hookSpecificOutput?: Record<string, unknown>;

  constructor(data: Partial<HookOutput> = {}) {
  this.continue = data.continue;
  this.stopReason = data.stopReason;
  this.suppressOutput = data.suppressOutput;
  this.systemMessage = data.systemMessage;
  this.decision = data.decision;
  this.reason = data.reason;
  this.hookSpecificOutput = data.hookSpecificOutput;
  }

  isBlockingDecision(): boolean {
  return this.decision === 'block' || this.decision === 'deny';
  }

  shouldStopExecution(): boolean {
  return this.continue === false;
  }

  getEffectiveReason(): string {
  return this.stopReason || this.reason || 'No reason provided';
  }

  getBlockingError(): { blocked: boolean; reason: string } {
  return this.isBlockingDecision()
  ? { blocked: true, reason: this.getEffectiveReason() }
  : { blocked: false, reason: '' };
  }
}

// BeforeTool：允许 hook 修改 tool_input（coreToolHookTriggers 会 tool.build() 重建 invocation）
export class BeforeToolHookOutput extends DefaultHookOutput {
  getModifiedToolInput(): Record<string, unknown> | undefined {
  if (this.hookSpecificOutput && 'tool_input' in this.hookSpecificOutput) {
  const input = this.hookSpecificOutput['tool_input'];
  return typeof input === 'object' && input !== null && !Array.isArray(input)
  ? (input as Record<string, unknown>)
  : undefined;
  }
  return undefined;
  }
}

// BeforeToolSelection：可修改 toolConfig（比如并行/禁止某些工具）
export class BeforeToolSelectionHookOutput extends DefaultHookOutput {
  override applyToolConfigModifications(target: {
  toolConfig?: GenAIToolConfig;
  tools?: ToolListUnion;
  }) {
  /* ...translator: HookToolConfig -> SDK ToolConfig... */
  return target;
  }
}

// AfterModel：可修改响应；如果 continue=false，会合成一个 finishReason=STOP 的响应
export class AfterModelHookOutput extends DefaultHookOutput {
  getModifiedResponse(): GenerateContentResponse | undefined {
  /* ... */
  return undefined;
  }
}

export function createHookOutput(eventName: string, data: Partial<HookOutput>) {
  switch (eventName) {
  case 'BeforeModel': return new BeforeModelHookOutput(data);
  case 'AfterModel': return new AfterModelHookOutput(data);
  case 'BeforeToolSelection': return new BeforeToolSelectionHookOutput(data);
  case 'BeforeTool': return new BeforeToolHookOutput(data);
  default: return new DefaultHookOutput(data);
  }
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">Hook 事件系统</h2>
 <p className="text-body mb-4">
 Hook 系统是 Gemini CLI
 的事件驱动拦截机制，允许用户在关键执行节点注入自定义 Shell 命令。 通过
 11
 种事件类型，用户可以实现安全审计、输入校验、日志记录、自动化工作流等功能。
 </p>
 </section>

 {/* 1. 核心组件 */}
 <Layer title="核心组件">
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="HookRegistry" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-body">
 Hook 配置注册表，管理所有 Hook 定义
 </p>
 <ul className="text-body space-y-1">
 <li>从多层级配置加载 Hook</li>
 <li>按优先级合并配置</li>
 <li>支持启用/禁用单个 Hook</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="HookPlanner" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">执行计划规划器</p>
 <ul className="text-body space-y-1">
 <li>根据事件类型匹配 Hook</li>
 <li>生成 HookExecutionPlan</li>
 <li>处理 matcher 模式匹配</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="HookRunner" variant="green">
 <div className="text-sm space-y-2">
 <p className="text-body">Shell 命令执行器</p>
 <ul className="text-body space-y-1">
 <li>执行 command 类型 Hook</li>
 <li>处理超时和错误</li>
 <li>解析 JSON 输出</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="HookAggregator" variant="yellow">
 <div className="text-sm space-y-2">
 <p className="text-body">结果聚合器</p>
 <ul className="text-body space-y-1">
 <li>合并多个 Hook 输出</li>
 <li>处理冲突决策</li>
 <li>生成最终 HookOutput</li>
 </ul>
 </div>
 </HighlightBox>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="HookEventHandler" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-body">事件处理器（协调中心）</p>
 <ul className="text-body space-y-1">
 <li>接收事件触发请求</li>
 <li>协调 Planner/Runner/Aggregator</li>
 <li>通过 MessageBus 进行权限检查</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="HookTranslator" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">格式转换器</p>
 <ul className="text-body space-y-1">
 <li>Hook 格式 ↔ SDK 格式</li>
 <li>LLMRequest/Response 转换</li>
 <li>ToolConfig 转换</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 2. 事件类型 */}
 <Layer title="Hook 事件类型">
 <div className="space-y-4">
 <CodeBlock
 code={hookEventTypesCode}
 language="typescript"
 title="HookEventName 枚举"
 />

 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-3 text-left text-body">
 事件
 </th>
 <th className="border border-edge p-3 text-left text-body">
 触发时机
 </th>
 <th className="border border-edge p-3 text-left text-body">
 典型用例
 </th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">BeforeTool</code>
 </td>
 <td className="border border-edge p-3">工具执行前</td>
 <td className="border border-edge p-3">
 参数校验、安全审计、输入转换
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">
 <code className="text-heading">AfterTool</code>
 </td>
 <td className="border border-edge p-3">工具执行后</td>
 <td className="border border-edge p-3">
 结果处理、日志记录、缓存更新
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">BeforeModel</code>
 </td>
 <td className="border border-edge p-3">LLM 调用前</td>
 <td className="border border-edge p-3">
 Token 预算检查、请求修改、缓存命中
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">
 <code className="text-heading">AfterModel</code>
 </td>
 <td className="border border-edge p-3">LLM 调用后</td>
 <td className="border border-edge p-3">
 响应过滤、内容审核、格式转换
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">BeforeAgent</code>
 </td>
 <td className="border border-edge p-3">Agent 执行前</td>
 <td className="border border-edge p-3">
 环境准备、上下文注入
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">
 <code className="text-heading">AfterAgent</code>
 </td>
 <td className="border border-edge p-3">Agent 执行后</td>
 <td className="border border-edge p-3">
 结果验证、清理工作
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">SessionStart</code>
 </td>
 <td className="border border-edge p-3">会话开始</td>
 <td className="border border-edge p-3">
 环境初始化、配置加载
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">
 <code className="text-heading">SessionEnd</code>
 </td>
 <td className="border border-edge p-3">会话结束</td>
 <td className="border border-edge p-3">
 资源清理、日志归档
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">PreCompress</code>
 </td>
 <td className="border border-edge p-3">上下文压缩前</td>
 <td className="border border-edge p-3">
 重要内容保护、压缩策略调整
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">
 <code className="text-heading">BeforeToolSelection</code>
 </td>
 <td className="border border-edge p-3">工具选择前</td>
 <td className="border border-edge p-3">
 工具过滤、动态工具配置
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-3">
 <code className="text-heading">Notification</code>
 </td>
 <td className="border border-edge p-3">通知事件</td>
 <td className="border border-edge p-3">
 权限变更通知、状态更新
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 3. 执行流程 */}
 <Layer title="执行流程">
 <div className="space-y-4">
 <MermaidDiagram chart={hookEventFlowChart} title="Hook 执行流程" />
 <CodeBlock
 code={hookSystemCode}
 language="typescript"
 title="HookSystem 协调器"
 />
 </div>
 </Layer>

 {/* 4. 配置格式 */}
 <Layer title="配置与加载">
 <div className="space-y-4">
 <div>
 <h4 className="text-heading font-semibold mb-2">
 配置层级（优先级从高到低）
 </h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Project 项目级
 </span>
 <span className="text-dim">{'>'}</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 User 用户级
 </span>
 <span className="text-dim">{'>'}</span>
<span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge">
  System 系统级
  </span>
 <span className="text-dim">{'>'}</span>
<span className="px-3 py-1.5 bg-elevated text-heading rounded-lg border border-edge">
  Extensions 扩展
  </span>
 </div>
 </div>

 <CodeBlock
 code={hookConfigCode}
 language="yaml"
 title="Hook 配置示例"
 />

 <HighlightBox title="配置字段说明" variant="blue">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-heading mb-1">
 HookDefinition
 </h5>
 <ul className="text-body space-y-1">
 <li>
 • <code>matcher</code>: 工具名匹配模式
 </li>
 <li>
 • <code>sequential</code>: 是否顺序执行
 </li>
 <li>
 • <code>hooks</code>: Hook 配置数组
 </li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-heading mb-1">
 CommandHookConfig
 </h5>
 <ul className="text-body space-y-1">
 <li>
 • <code>type</code>: 固定为 "command"
 </li>
 <li>
 • <code>command</code>: Shell 命令
 </li>
 <li>
 • <code>timeout</code>: 超时时间 (ms)
 </li>
 <li>
 • <code>name</code>: Hook 名称
 </li>
 </ul>
 </div>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 5. Hook 决策 */}
 <Layer title="Hook 决策机制">
 <div className="space-y-4">
 <CodeBlock
 code={hookDecisionCode}
 language="typescript"
 title="HookDecision 类型"
 />

 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
 <div className="bg-elevated rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">allow</div>
 <div className="text-xs text-body">允许继续</div>
 </div>
 <div className="bg-elevated rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">approve</div>
 <div className="text-xs text-body">批准执行</div>
 </div>
 <div className="bg-elevated rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">ask</div>
 <div className="text-xs text-body">询问用户</div>
 </div>
 <div className="bg-elevated rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">block</div>
 <div className="text-xs text-body">阻止执行</div>
 </div>
 <div className="bg-elevated rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">deny</div>
 <div className="text-xs text-body">拒绝操作</div>
 </div>
 </div>
 </div>
 </Layer>

 {/* 6. 特定事件 Hook */}
 <Layer title="特定事件 Hook 详解">
 <div className="space-y-4">
 <div>
 <h4 className="text-heading font-semibold mb-3">
 BeforeTool Hook
 </h4>
 <CodeBlock
 code={beforeToolHookCode}
 language="typescript"
 title="BeforeTool 输入输出"
 />

 <HighlightBox
 title="STOP_EXECUTION：Hook 可立刻终止整个 Agent"

 variant="orange"
 >
 <div className="text-sm space-y-2 text-body">
 <p>
 上游实现中，若 Hook 输出{' '}
 <code className="bg-base/30 px-1 rounded">
 {'{ continue: false }'}
 </code>
 ，会被视为
 <strong>“停止执行”</strong>：
 </p>
 <ul className="pl-5 list-disc space-y-1">
 <li>
 <strong>BeforeTool/AfterTool</strong>：
 <code>coreToolHookTriggers</code> 返回带{' '}
 <code>ToolErrorType.STOP_EXECUTION</code> 的 ToolResult，CLI
 立即停止后续循环。
 </li>
 <li>
 <strong>AfterModel</strong>：
 <code>AfterModelHookOutput</code> 会合成一个{' '}
 <code>finishReason=STOP</code> 的响应，提前结束本轮生成。
 </li>
 </ul>
 </div>
 </HighlightBox>
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">
 BeforeModel Hook
 </h4>
 <CodeBlock
 code={beforeModelHookCode}
 language="typescript"
 title="BeforeModel 拦截能力"
 />
 </div>
 </div>
 </Layer>

 {/* 6.5. HookOutput 类层次结构 */}
 <Layer title="HookOutput 类层次结构">
 <div className="space-y-4">
 <HighlightBox title="专用 HookOutput 类" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p>
 不同事件类型有对应的专用 HookOutput 类，提供特定的修改能力：
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
 <div className="bg-base/30 p-2 rounded">
 <code className="text-heading">BeforeToolHookOutput</code>
 <p className="text-xs text-body mt-1">
 getModifiedToolInput() - 修改工具输入
 </p>
 </div>
 <div className="bg-base/30 p-2 rounded">
 <code className="text-heading">BeforeModelHookOutput</code>
 <p className="text-xs text-body mt-1">
 getSyntheticResponse() - 绕过 LLM 调用
 </p>
 </div>
 <div className="bg-base/30 p-2 rounded">
 <code className="text-heading">AfterModelHookOutput</code>
 <p className="text-xs text-body mt-1">
 getModifiedResponse() - 修改模型响应
 </p>
 </div>
 <div className="bg-base/30 p-2 rounded">
 <code className="text-heading">
 BeforeToolSelectionHookOutput
 </code>
 <p className="text-xs text-body mt-1">
 applyToolConfigModifications() - 修改工具配置
 </p>
 </div>
 </div>
 </div>
 </HighlightBox>

 <CodeBlock
 code={hookOutputHierarchyCode}
 language="typescript"
 title="HookOutput 类层次结构与工厂函数"
 />

 <HighlightBox title="DefaultHookOutput 基类方法" variant="blue">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
 <div className="bg-base/30 p-3 rounded">
 <code className="text-heading font-semibold">
 isBlockingDecision()
 </code>
 <p className="text-body mt-1">
 判断是否为阻止性决策（block/deny）
 </p>
 </div>
 <div className="bg-base/30 p-3 rounded">
 <code className="text-heading font-semibold">
 shouldStopExecution()
 </code>
 <p className="text-body mt-1">判断是否应停止执行</p>
 </div>
 <div className="bg-base/30 p-3 rounded">
 <code className="text-heading font-semibold">
 getEffectiveReason()
 </code>
 <p className="text-body mt-1">获取有效的停止原因</p>
 </div>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 7. 与 Policy 集成 */}
 <Layer title="与 Policy Engine 集成">
 <div className="space-y-4">
 <MermaidDiagram
 chart={`sequenceDiagram
 participant E as Event Trigger
 participant H as HookEventHandler
 participant MB as MessageBus
 participant PE as PolicyEngine
 participant R as HookRunner

 E->>H: fire(eventName, input)
 H->>MB: publish(HOOK_EXECUTION_REQUEST)
 MB->>PE: checkHook(request)
 alt ALLOW
 PE-->>MB: PolicyDecision.ALLOW
 MB-->>H: emit(HOOK_EXECUTION_REQUEST)
 H->>R: runHook(hookConfig)
 R-->>H: HookOutput
 H->>MB: publish(HOOK_EXECUTION_RESPONSE)
 else DENY
 PE-->>MB: PolicyDecision.DENY
 MB-->>H: emit(HOOK_EXECUTION_RESPONSE, error)
 end`}
 title="Hook 权限检查流程"
 />

 <HighlightBox title="安全边界" variant="red">
 <div className="text-sm space-y-2 text-body">
 <p>
 <strong>不可信文件夹限制：</strong>在{' '}
 <code className="bg-base/30 px-1 rounded">
 trustedFolder === false
 </code>{' '}
 时， 项目级 Hook（<code>hookSource === 'project'</code>
 ）会被自动拒绝执行。
 </p>
 <p>
 <strong>原因：</strong>防止恶意项目通过 Hook 执行危险命令。
 </p>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 8. 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/types.ts
 </code>
 <span className="text-body">
 HookEventName、HookOutput 等类型定义
 </span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookSystem.ts
 </code>
 <span className="text-body">HookSystem 协调器</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookRegistry.ts
 </code>
 <span className="text-body">Hook 配置注册与管理</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookPlanner.ts
 </code>
 <span className="text-body">执行计划生成</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookRunner.ts
 </code>
 <span className="text-body">Shell 命令执行</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookAggregator.ts
 </code>
 <span className="text-body">结果聚合</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 gemini-cli/packages/core/src/hooks/hookEventHandler.ts
 </code>
 <span className="text-body">事件处理与协调</span>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 为什么使用 Shell 命令而非内置函数？
 </h4>
 <div className="text-sm text-body space-y-2">
 <p>
 <strong>决策：</strong>Hook 通过执行外部 Shell
 命令实现，而非注册内置函数。
 </p>
 <p>
 <strong>原因：</strong>
 </p>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 <strong>语言无关</strong>
 ：用户可以用任意语言（Python/Node/Bash）编写 Hook
 </li>
 <li>
 <strong>隔离性</strong>：外部进程崩溃不影响主进程
 </li>
 <li>
 <strong>可调试</strong>：可以独立测试 Hook 脚本
 </li>
 </ul>
 <p>
 <strong>权衡：</strong>启动进程有开销，但对于 Hook 场景可接受。
 </p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 为什么需要 HookAggregator？
 </h4>
 <div className="text-sm text-body space-y-2">
 <p>
 <strong>决策：</strong>多个 Hook 的输出由 Aggregator
 合并为单一结果。
 </p>
 <p>
 <strong>原因：</strong>
 </p>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 <strong>冲突处理</strong>：多个 Hook 可能返回不同决策
 </li>
 <li>
 <strong>优先级</strong>：deny/block 优先于 allow/approve
 </li>
 <li>
 <strong>消息合并</strong>：systemMessage 可以累加
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
