import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 { id: 'hook-system', label: 'Hook 事件系统', description: '事件拦截机制' },
 { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
 { id: 'approval-mode', label: '审批模式', description: '用户交互层权限' },
 { id: 'tool-arch', label: '工具架构', description: '工具执行系统' },
 { id: 'interaction-loop', label: '交互主循环', description: '消息处理流程' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 基于 EventEmitter 的异步消息总线，连接工具调度、Policy 引擎和 UI 层，支持发布/订阅和请求/响应模式
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">9</div>
 <div className="text-xs text-dim">消息类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">通信模式</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">UUID</div>
 <div className="text-xs text-dim">关联 ID</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">60s</div>
 <div className="text-xs text-dim">默认超时</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">消息流转</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Publisher
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 MessageBus
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Policy Check
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Subscriber
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/confirmation-bus/message-bus.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function MessageBus() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const messageFlowChart = `flowchart TD
 pub(["Publisher<br/>发布消息"])
 bus["MessageBus<br/>消息路由"]
 policy{"Policy Engine<br/>策略检查"}
 sub(["Subscriber<br/>消息处理"])
 ui(["UI Layer<br/>用户交互"])

 pub -->|publish| bus
 bus -->|TOOL_CONFIRMATION_REQUEST| policy
 policy -->|ALLOW| sub
 policy -->|DENY| sub
 policy -->|ASK_USER| ui
 ui -->|用户决策| sub
 bus -->|其他消息类型| sub

 style pub fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style bus fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style policy fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style sub fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style ui fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const messageTypesCode = `// packages/core/src/confirmation-bus/types.ts

export enum MessageBusType {
  // 工具确认流程
  TOOL_CONFIRMATION_REQUEST = 'tool-confirmation-request',
  TOOL_CONFIRMATION_RESPONSE = 'tool-confirmation-response',
  TOOL_POLICY_REJECTION = 'tool-policy-rejection',

  // 工具执行结果
  TOOL_EXECUTION_SUCCESS = 'tool-execution-success',
  TOOL_EXECUTION_FAILURE = 'tool-execution-failure',

  // 策略更新
  UPDATE_POLICY = 'update-policy',

  // Hook 执行流程
  HOOK_EXECUTION_REQUEST = 'hook-execution-request',
  HOOK_EXECUTION_RESPONSE = 'hook-execution-response',
  HOOK_POLICY_DECISION = 'hook-policy-decision',
}`;

 const messageStructuresCode = `// 工具确认请求
export interface ToolConfirmationRequest {
  type: MessageBusType.TOOL_CONFIRMATION_REQUEST;
  toolCall: FunctionCall; // 工具调用信息
  correlationId: string; // 关联 ID
  serverName?: string; // MCP 服务器名称
}

// 工具确认响应
export interface ToolConfirmationResponse {
  type: MessageBusType.TOOL_CONFIRMATION_RESPONSE;
  correlationId: string;
  confirmed: boolean;
  requiresUserConfirmation?: boolean; // ASK_USER 时为 true
}

// Hook 执行请求
export interface HookExecutionRequest {
  type: MessageBusType.HOOK_EXECUTION_REQUEST;
  eventName: string;
  input: Record<string, unknown>;
  correlationId: string;
}

// 策略更新
export interface UpdatePolicy {
  type: MessageBusType.UPDATE_POLICY;
  toolName: string;
  persist?: boolean; // 是否持久化
  argsPattern?: string; // 参数模式
  commandPrefix?: string | string[]; // Shell 命令前缀
  mcpName?: string; // MCP 服务器名称
}`;

 const messageBusCode = `// packages/core/src/confirmation-bus/message-bus.ts

export class MessageBus extends EventEmitter {
  constructor(
  private readonly policyEngine: PolicyEngine,
  private readonly debug = false,
  ) {
  super();
  }

  // 发布消息（带完整错误处理）
  async publish(message: Message): Promise<void> {
  try {
  if (!this.isValidMessage(message)) {
  throw new Error(\`Invalid message structure: \${safeJsonStringify(message)}\`);
  }

  if (message.type === MessageBusType.TOOL_CONFIRMATION_REQUEST) {
  // 工具确认请求：先经过 Policy 检查
  const { decision } = await this.policyEngine.check(
  message.toolCall,
  message.serverName,
  );

  switch (decision) {
  case PolicyDecision.ALLOW:
  this.emitMessage({
  type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
  correlationId: message.correlationId,
  confirmed: true,
  });
  break;

  case PolicyDecision.DENY:
  this.emitMessage({
  type: MessageBusType.TOOL_POLICY_REJECTION,
  toolCall: message.toolCall,
  });
  this.emitMessage({
  type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
  correlationId: message.correlationId,
  confirmed: false,
  });
  break;

  case PolicyDecision.ASK_USER:
  // 传递给 UI 层处理
  this.emitMessage(message);
  break;

  default:
  throw new Error(\`Unknown policy decision: \${decision}\`);
  }
  } else if (message.type === MessageBusType.HOOK_EXECUTION_REQUEST) {
  // Hook 执行请求：经过 Hook 策略检查
  const decision = await this.policyEngine.checkHook(message);

  // 发送策略决策事件（用于可观测性）
  this.emitMessage({
  type: MessageBusType.HOOK_POLICY_DECISION,
  eventName: message.eventName,
  hookSource: getHookSource(message.input),
  decision: decision === PolicyDecision.ALLOW ? 'allow' : 'deny',
  reason: decision !== PolicyDecision.ALLOW
  ? 'Hook execution denied by policy'
  : undefined,
  });

  if (decision === PolicyDecision.ALLOW) {
  this.emitMessage(message);
  } else {
  // Hook 不支持交互式确认，直接返回错误
  this.emitMessage({
  type: MessageBusType.HOOK_EXECUTION_RESPONSE,
  correlationId: message.correlationId,
  success: false,
  error: new Error('Hook execution denied by policy'),
  });
  }
  } else {
  // 其他消息类型直接转发
  this.emitMessage(message);
  }
  } catch (error) {
  // 错误不抛出，而是通过 'error' 事件发送
  this.emit('error', error);
  }
  }
}`;

 // 错误处理机制代码
 const errorHandlingCode = `// 错误处理机制

// 1. 订阅错误事件
messageBus.on('error', (error: Error) => {
  console.error('[MessageBus Error]', error.message);
  // 可以发送到日志系统或监控平台
  telemetry.recordError('message_bus', error);
});

// 2. ToolExecutionFailure 接口
export interface ToolExecutionFailure<E = Error> {
  type: MessageBusType.TOOL_EXECUTION_FAILURE;
  correlationId: string;
  error: E;
}

// 3. HookExecutionResponse 可包含错误
export interface HookExecutionResponse {
  type: MessageBusType.HOOK_EXECUTION_RESPONSE;
  correlationId: string;
  success: boolean;
  error?: Error; // 失败时包含错误信息
}

// 4. 使用示例：处理工具执行失败
messageBus.subscribe(
  MessageBusType.TOOL_EXECUTION_FAILURE,
  (message: ToolExecutionFailure) => {
  console.error(\`Tool execution failed: \${message.error.message}\`);
  // 可以触发重试逻辑或通知用户
  }
);`;

 const subscribePatternCode = `// 订阅消息
subscribe<T extends Message>(
  type: T['type'],
  listener: (message: T) => void,
): void {
  this.on(type, listener);
}

// 取消订阅
unsubscribe<T extends Message>(
  type: T['type'],
  listener: (message: T) => void,
): void {
  this.off(type, listener);
}

// 使用示例
messageBus.subscribe(
  MessageBusType.TOOL_CONFIRMATION_REQUEST,
  (message: ToolConfirmationRequest) => {
  // 显示确认对话框
  showConfirmationDialog(message.toolCall);
  }
);`;

 const requestResponseCode = `// 请求-响应模式
async request<TRequest extends Message, TResponse extends Message>(
  request: Omit<TRequest, 'correlationId'>,
  responseType: TResponse['type'],
  timeoutMs: number = 60000,
): Promise<TResponse> {
  const correlationId = randomUUID();

  return new Promise<TResponse>((resolve, reject) => {
  const timeoutId = setTimeout(() => {
  cleanup();
  reject(new Error(\`Request timed out waiting for \${responseType}\`));
  }, timeoutMs);

  const cleanup = () => {
  clearTimeout(timeoutId);
  this.unsubscribe(responseType, responseHandler);
  };

  const responseHandler = (response: TResponse) => {
  // 检查关联 ID 匹配
  if ('correlationId' in response && response.correlationId === correlationId) {
  cleanup();
  resolve(response);
  }
  };

  this.subscribe<TResponse>(responseType, responseHandler);
  this.publish({ ...request, correlationId } as TRequest);
  });
}

// 使用示例
const response = await messageBus.request<
  ToolConfirmationRequest,
  ToolConfirmationResponse
>(
  {
  type: MessageBusType.TOOL_CONFIRMATION_REQUEST,
  toolCall: { name: 'write_file', args: {...} },
  serverName: undefined,
  },
  MessageBusType.TOOL_CONFIRMATION_RESPONSE,
);

if (response.confirmed) {
  // 执行工具
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">消息总线 (MessageBus)</h2>
 <p className="text-body mb-4">
 MessageBus 是 Gemini CLI 的异步事件协调系统，基于 Node.js EventEmitter 实现。
 它连接了工具调度器、Policy 引擎、Hook 系统和 UI 层，通过发布/订阅模式实现解耦通信。
 </p>
 </section>

 {/* 1. 消息类型 */}
 <Layer title="消息类型">
 <div className="space-y-4">
 <CodeBlock code={messageTypesCode} language="typescript" title="MessageBusType 枚举" />

 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-3 text-left text-body">消息类型</th>
 <th className="border border-edge p-3 text-left text-body">方向</th>
 <th className="border border-edge p-3 text-left text-body">用途</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">TOOL_CONFIRMATION_REQUEST</code></td>
 <td className="border border-edge p-3">Scheduler → UI</td>
 <td className="border border-edge p-3">请求用户确认工具执行</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">TOOL_CONFIRMATION_RESPONSE</code></td>
 <td className="border border-edge p-3">UI → Scheduler</td>
 <td className="border border-edge p-3">用户确认结果</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">TOOL_POLICY_REJECTION</code></td>
 <td className="border border-edge p-3">Policy → UI</td>
 <td className="border border-edge p-3">策略拒绝通知</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">TOOL_EXECUTION_SUCCESS</code></td>
 <td className="border border-edge p-3">Executor → *</td>
 <td className="border border-edge p-3">工具执行成功</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">TOOL_EXECUTION_FAILURE</code></td>
 <td className="border border-edge p-3">Executor → *</td>
 <td className="border border-edge p-3">工具执行失败</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">UPDATE_POLICY</code></td>
 <td className="border border-edge p-3">UI → Policy</td>
 <td className="border border-edge p-3">更新策略规则</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">HOOK_EXECUTION_REQUEST</code></td>
 <td className="border border-edge p-3">HookSystem → Policy</td>
 <td className="border border-edge p-3">Hook 执行请求</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3"><code className="text-heading">HOOK_EXECUTION_RESPONSE</code></td>
 <td className="border border-edge p-3">Policy → HookSystem</td>
 <td className="border border-edge p-3">Hook 执行结果</td>
 </tr>
 <tr>
 <td className="border border-edge p-3"><code className="text-heading">HOOK_POLICY_DECISION</code></td>
 <td className="border border-edge p-3">Policy → Observer</td>
 <td className="border border-edge p-3">Hook 策略决策（可观测性）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 2. 消息结构 */}
 <Layer title="消息结构">
 <div className="space-y-4">
 <CodeBlock code={messageStructuresCode} language="typescript" title="消息接口定义" />

 <HighlightBox title="correlationId 的作用" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p>
 <code className="bg-base/30 px-1 rounded">correlationId</code> 是请求-响应模式的关键：
 </p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>由发起方生成（UUID）</li>
 <li>响应方原样返回</li>
 <li>用于匹配请求和响应</li>
 <li>支持并发多个请求</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 3. 消息流转 */}
 <Layer title="消息流转">
 <div className="space-y-4">
 <MermaidDiagram chart={messageFlowChart} title="MessageBus 消息流转" />
 <CodeBlock code={messageBusCode} language="typescript" title="MessageBus.publish 核心逻辑" />
 </div>
 </Layer>

 {/* 4. 工具确认流程 */}
 <Layer title="工具确认流程">
 <div className="space-y-4">
 <MermaidDiagram chart={`sequenceDiagram
 participant S as ToolScheduler
 participant MB as MessageBus
 participant PE as PolicyEngine
 participant UI as UI Layer

 S->>MB: publish(TOOL_CONFIRMATION_REQUEST)
 MB->>PE: check(toolCall, serverName)

 alt ALLOW
 PE-->>MB: PolicyDecision.ALLOW
 MB->>S: emit(TOOL_CONFIRMATION_RESPONSE, confirmed=true)
 S->>S: 执行工具
 else DENY
 PE-->>MB: PolicyDecision.DENY
 MB->>S: emit(TOOL_POLICY_REJECTION)
 MB->>S: emit(TOOL_CONFIRMATION_RESPONSE, confirmed=false)
 else ASK_USER
 PE-->>MB: PolicyDecision.ASK_USER
 MB->>UI: emit(TOOL_CONFIRMATION_REQUEST)
 UI->>UI: 显示确认对话框
 UI->>MB: publish(TOOL_CONFIRMATION_RESPONSE)
 MB->>S: emit(TOOL_CONFIRMATION_RESPONSE)
 end`} title="工具确认流程时序图" />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="ALLOW 路径" variant="green">
 <div className="text-sm space-y-1 text-body">
 <p>Policy 返回 ALLOW</p>
 <p>→ 直接发送 confirmed=true</p>
 <p>→ 工具立即执行</p>
 </div>
 </HighlightBox>

 <HighlightBox title="DENY 路径" variant="red">
 <div className="text-sm space-y-1 text-body">
 <p>Policy 返回 DENY</p>
 <p>→ 发送 POLICY_REJECTION</p>
 <p>→ 发送 confirmed=false</p>
 </div>
 </HighlightBox>

 <HighlightBox title="ASK_USER 路径" variant="yellow">
 <div className="text-sm space-y-1 text-body">
 <p>Policy 返回 ASK_USER</p>
 <p>→ 转发给 UI 层</p>
 <p>→ 等待用户决策</p>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 5. 通信模式 */}
 <Layer title="通信模式">
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h4 className="text-heading font-semibold mb-3">发布/订阅模式</h4>
 <CodeBlock code={subscribePatternCode} language="typescript" title="subscribe / unsubscribe" />
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">请求/响应模式</h4>
 <HighlightBox title="request() 方法" variant="purple">
 <div className="text-sm space-y-2 text-body">
 <p>同步风格的异步通信：</p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>自动生成 correlationId</li>
 <li>自动订阅响应类型</li>
 <li>支持超时（默认 60s）</li>
 <li>返回 Promise</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>

 <CodeBlock code={requestResponseCode} language="typescript" title="request() 实现" />
 </div>
 </Layer>

 {/* 6. Hook 执行流程 */}
 <Layer title="Hook 执行流程">
 <div className="space-y-4">
 <MermaidDiagram chart={`sequenceDiagram
 participant HS as HookSystem
 participant MB as MessageBus
 participant PE as PolicyEngine
 participant O as Observer

 HS->>MB: publish(HOOK_EXECUTION_REQUEST)
 MB->>PE: checkHook(request)
 MB->>O: emit(HOOK_POLICY_DECISION)

 alt ALLOW
 PE-->>MB: PolicyDecision.ALLOW
 MB->>HS: emit(HOOK_EXECUTION_REQUEST)
 HS->>HS: 执行 Hook
 HS->>MB: publish(HOOK_EXECUTION_RESPONSE, success=true)
 else DENY
 PE-->>MB: PolicyDecision.DENY
 MB->>HS: emit(HOOK_EXECUTION_RESPONSE, success=false, error)
 end`} title="Hook 执行流程时序图" />

 <HighlightBox title="Hook 与 Tool 的区别" variant="blue">
 <div className="text-sm space-y-2 text-body">
 <p>Hook 执行不支持 ASK_USER：</p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>Hook 在工具/模型执行前触发，无法等待用户交互</li>
 <li>ASK_USER 自动降级为 DENY</li>
 <li>通过 HOOK_POLICY_DECISION 消息提供可观测性</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 7. 错误处理机制 */}
 <Layer title="错误处理机制">
 <div className="space-y-4">
 <HighlightBox title="错误不抛出，通过事件传递" variant="red">
 <div className="text-sm space-y-2 text-body">
 <p>
 MessageBus 的 <code className="bg-base/30 px-1 rounded">publish()</code> 方法将整个逻辑包裹在 try-catch 中，
 错误不会抛出导致程序崩溃，而是通过 <code className="bg-base/30 px-1 rounded">'error'</code> 事件发送。
 </p>
 <p className="text-heading">
 这保证了消息总线的稳定性，即使某个消息处理失败，其他消息仍可正常处理。
 </p>
 </div>
 </HighlightBox>

 <CodeBlock code={errorHandlingCode} language="typescript" title="错误处理示例" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="错误类型" variant="blue">
 <div className="text-sm space-y-2">
 <ul className="text-body space-y-1">
 <li><code className="text-heading">Invalid message structure</code>: 消息格式错误</li>
 <li><code className="text-heading">Unknown policy decision</code>: 未知策略决策</li>
 <li><code className="text-heading">Request timed out</code>: 请求超时</li>
 <li><code className="text-heading">Hook execution denied</code>: Hook 执行被拒绝</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="错误观测性" variant="green">
 <div className="text-sm space-y-2">
 <ul className="text-body space-y-1">
 <li>订阅 <code className="text-heading">'error'</code> 事件监控错误</li>
 <li>错误可发送到遥测系统</li>
 <li>支持自定义错误处理逻辑</li>
 <li>可结合日志系统记录</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 8. 策略更新 */}
 <Layer title="动态策略更新">
 <div className="space-y-4">
 <CodeBlock
 code={`// 用户选择"总是允许"后发送策略更新
messageBus.publish({
 type: MessageBusType.UPDATE_POLICY,
 toolName: 'run_shell_command',
 commandPrefix: 'git', // 允许 git 开头的命令
 persist: true, // 持久化到配置文件
});

// 允许特定 MCP 服务器的所有工具
messageBus.publish({
 type: MessageBusType.UPDATE_POLICY,
 toolName: 'github__*',
 mcpName: 'github',
 persist: true,
});`}
 language="typescript"
 title="UPDATE_POLICY 使用示例"
 />

 <HighlightBox title="persist 选项" variant="yellow">
 <div className="text-sm space-y-2 text-body">
 <p>
 <code className="bg-base/30 px-1 rounded">persist: true</code> 时，
 策略更新会写入配置文件（如 <code>.gemini/settings.json</code>），
 下次会话启动时自动加载。
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
 packages/core/src/confirmation-bus/types.ts
 </code>
 <span className="text-body">MessageBusType、消息接口定义</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/confirmation-bus/message-bus.ts
 </code>
 <span className="text-body">MessageBus 实现</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/confirmation-bus/index.ts
 </code>
 <span className="text-body">模块导出</span>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么基于 EventEmitter？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>MessageBus 继承自 Node.js EventEmitter。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>成熟可靠</strong>：Node.js 核心模块，久经考验</li>
 <li><strong>异步友好</strong>：天然支持异步事件处理</li>
 <li><strong>内存高效</strong>：无需外部消息队列</li>
 <li><strong>简单直接</strong>：on/emit API 直观易用</li>
 </ul>
 <p><strong>局限：</strong>单进程内有效，不支持分布式。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么 Policy 检查在 MessageBus 中？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>工具确认和 Hook 执行请求在 MessageBus 中经过 Policy 检查。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>单一入口</strong>：所有请求必经 MessageBus，确保策略一致性</li>
 <li><strong>解耦</strong>：发送方无需关心策略逻辑</li>
 <li><strong>可观测性</strong>：集中记录所有决策</li>
 </ul>
 <p><strong>权衡：</strong>MessageBus 与 PolicyEngine 紧耦合。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么默认超时是 60 秒？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>request() 方法默认 60 秒超时。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>用户交互</strong>：用户可能需要时间阅读确认对话框</li>
 <li><strong>复杂工具</strong>：某些工具执行时间较长</li>
 <li><strong>网络延迟</strong>：MCP 服务器可能有网络开销</li>
 </ul>
 <p><strong>可配置：</strong>调用方可传入自定义 timeoutMs。</p>
 </div>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
