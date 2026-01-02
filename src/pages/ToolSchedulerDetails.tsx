import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

export function ToolSchedulerDetails() {
  const relatedPages: RelatedPage[] = [
    { id: 'tool-arch', label: '工具系统', description: '工具架构总览' },
    { id: 'tool-detail', label: '工具详情', description: '各工具实现' },
    { id: 'concurrency-patterns', label: '并发模式', description: '并发调度' },
    { id: 'approval-mode', label: '审批模式', description: '权限控制' },
    { id: 'interaction-loop', label: '交互循环', description: '调用入口' },
    { id: 'error', label: '错误处理', description: '工具错误' },
  ];

  // 工具调度完整流程 - Mermaid flowchart
  const toolSchedulerFlowChart = `flowchart TD
    start([AI 请求执行工具])
    schedule_entry[schedule 入口]
    is_running{是否有工具<br/>正在执行?}
    queue_request[加入等待队列]
    validate[validateParams<br/>参数验证]
    build_invocation[buildInvocation<br/>构建调用对象]
    validation_error{参数验证<br/>是否通过?}
    should_confirm[shouldConfirmExecute<br/>确认决策]
    policy_check{PolicyEngine<br/>决策检查}
    is_yolo{YOLO 模式<br/>或白名单?}
    policy_denied([Policy 拒绝<br/>返回错误])
    auto_approve([标记为 scheduled<br/>自动批准])
    await_approval([标记为 awaiting_approval<br/>等待确认])
    execute[execute 执行]
    convert_response[convertToFunctionResponse<br/>结果转换]
    truncate{输出是否<br/>超过阈值?}
    truncate_output[truncateAndSaveToFile<br/>截断并保存]
    success_response([返回成功响应])
    error_response([返回错误响应])

    start --> schedule_entry
    schedule_entry --> is_running
    is_running -->|Yes| queue_request
    is_running -->|No| validate
    validate --> build_invocation
    build_invocation --> validation_error
    validation_error -->|失败| error_response
    validation_error -->|通过| should_confirm
    should_confirm --> policy_check
    policy_check -->|ALLOW| auto_approve
    policy_check -->|DENY| policy_denied
    policy_check -->|ASK_USER| is_yolo
    is_yolo -->|Yes| auto_approve
    is_yolo -->|No| await_approval
    await_approval --> |用户批准| auto_approve
    auto_approve --> execute
    execute --> convert_response
    convert_response --> truncate
    truncate -->|Yes| truncate_output
    truncate -->|No| success_response
    truncate_output --> success_response

    style start fill:#22d3ee,color:#000
    style policy_denied fill:#ef4444,color:#fff
    style auto_approve fill:#22c55e,color:#000
    style await_approval fill:#f59e0b,color:#000
    style success_response fill:#22c55e,color:#000
    style error_response fill:#ef4444,color:#fff
    style policy_check fill:#a855f7,color:#fff
    style is_yolo fill:#a855f7,color:#fff
    style is_running fill:#a855f7,color:#fff
    style validation_error fill:#a855f7,color:#fff
    style truncate fill:#a855f7,color:#fff`;

  // 确认决策逻辑详细流程 - 基于 MessageBus + PolicyEngine
  const confirmationDecisionChart = `flowchart TD
    start([shouldConfirmExecute])
    has_bus{有 MessageBus?}
    get_decision[getMessageBusDecision<br/>向 PolicyEngine 请求决策]
    policy{PolicyEngine<br/>决策结果}
    allow([返回 false<br/>自动执行])
    deny([抛出错误<br/>拒绝执行])
    ask_user[getConfirmationDetails<br/>构建确认 UI]
    need_confirm([返回 ConfirmationDetails<br/>等待用户确认])
    default_flow[默认确认流程<br/>getConfirmationDetails]

    start --> has_bus
    has_bus -->|Yes| get_decision
    has_bus -->|No| default_flow
    get_decision --> policy
    policy -->|ALLOW| allow
    policy -->|DENY| deny
    policy -->|ASK_USER| ask_user
    ask_user --> need_confirm
    default_flow --> need_confirm

    style start fill:#22d3ee,color:#000
    style allow fill:#22c55e,color:#000
    style deny fill:#ef4444,color:#fff
    style need_confirm fill:#f59e0b,color:#000
    style policy fill:#a855f7,color:#fff
    style has_bus fill:#a855f7,color:#fff`;

  // 并发控制流程
  const concurrencyControlChart = `sequenceDiagram
    participant AI as AI Model
    participant Scheduler as CoreToolScheduler
    participant Queue as Request Queue
    participant Tool as Tool Invocation

    AI->>Scheduler: schedule(tool_call_1)
    Scheduler->>Scheduler: isRunning() = false
    Scheduler->>Tool: validate & execute
    activate Tool

    AI->>Scheduler: schedule(tool_call_2)
    Scheduler->>Scheduler: isRunning() = true
    Scheduler->>Queue: enqueue(tool_call_2)
    Queue-->>AI: Promise (pending)

    AI->>Scheduler: schedule(tool_call_3)
    Scheduler->>Queue: enqueue(tool_call_3)
    Queue-->>AI: Promise (pending)

    Tool-->>Scheduler: execution complete
    deactivate Tool
    Scheduler->>Scheduler: checkAndNotifyCompletion()
    Scheduler->>Queue: dequeue next request
    Scheduler->>Tool: validate & execute (tool_call_2)
    activate Tool

    Tool-->>Scheduler: execution complete
    deactivate Tool
    Scheduler->>Queue: dequeue next request
    Scheduler->>Tool: validate & execute (tool_call_3)`;

  const scheduleMethodCode = `// packages/core/src/core/coreToolScheduler.ts:625

/**
 * 调度工具执行的主入口
 * @param request 单个或多个工具调用请求
 * @param signal AbortSignal 用于取消执行
 */
schedule(
  request: ToolCallRequestInfo | ToolCallRequestInfo[],
  signal: AbortSignal,
): Promise<void> {
  // 如果有工具正在执行或正在调度，将请求加入队列
  if (this.isRunning() || this.isScheduling) {
    return new Promise((resolve, reject) => {
      const abortHandler = () => {
        // 从队列中移除请求
        const index = this.requestQueue.findIndex(
          (item) => item.request === request,
        );
        if (index > -1) {
          this.requestQueue.splice(index, 1);
          reject(new Error('Tool call cancelled while in queue.'));
        }
      };

      signal.addEventListener('abort', abortHandler, { once: true });

      this.requestQueue.push({
        request,
        signal,
        resolve: () => {
          signal.removeEventListener('abort', abortHandler);
          resolve();
        },
        reject: (reason?: Error) => {
          signal.removeEventListener('abort', abortHandler);
          reject(reason);
        },
      });
    });
  }
  return this._schedule(request, signal);
}`;

  const shouldConfirmCode = `// packages/core/src/tools/tools.ts:98-117

// BaseToolInvocation.shouldConfirmExecute - 确认决策的核心逻辑
async shouldConfirmExecute(
  abortSignal: AbortSignal,
): Promise<ToolCallConfirmationDetails | false> {
  if (this.messageBus) {
    // 通过 MessageBus 向 PolicyEngine 请求决策
    const decision = await this.getMessageBusDecision(abortSignal);

    if (decision === 'ALLOW') {
      // PolicyEngine 决定自动批准
      return false;
    }

    if (decision === 'DENY') {
      // PolicyEngine 决定拒绝执行
      throw new Error(
        \`Tool execution for "\${
          this._toolDisplayName || this._toolName
        }" denied by policy.\`,
      );
    }

    if (decision === 'ASK_USER') {
      // PolicyEngine 决定需要用户确认
      return this.getConfirmationDetails(abortSignal);
    }
  }

  // 没有 MessageBus 时使用默认确认流程
  return this.getConfirmationDetails(abortSignal);
}

// packages/core/src/core/coreToolScheduler.ts:602
// 调度器中的调用
const confirmationDetails = await invocation.shouldConfirmExecute(signal);

if (!confirmationDetails) {
  // 返回 false 表示不需要确认，自动批准
  this.setStatusInternal(reqInfo.callId, 'scheduled');
  continue;
}

// 需要用户确认
this.setStatusInternal(
  reqInfo.callId,
  'awaiting_approval',
  wrappedConfirmationDetails,
);`;

  const convertResponseCode = `// packages/core/src/core/coreToolScheduler.ts:162

/**
 * 将工具执行结果转换为 Gemini FunctionResponse 格式
 * @param toolName 工具名称
 * @param callId 调用 ID
 * @param llmContent 工具返回的内容（字符串、Part、Part[] 等）
 * @returns Part[] 格式的 FunctionResponse
 */
export function convertToFunctionResponse(
  toolName: string,
  callId: string,
  llmContent: PartListUnion,
): Part[] {
  const contentToProcess =
    Array.isArray(llmContent) && llmContent.length === 1
      ? llmContent[0]
      : llmContent;

  // 处理字符串内容
  if (typeof contentToProcess === 'string') {
    return [createFunctionResponsePart(callId, toolName, contentToProcess)];
  }

  // 处理数组内容
  if (Array.isArray(contentToProcess)) {
    const functionResponse = createFunctionResponsePart(
      callId,
      toolName,
      'Tool execution succeeded.',
    );
    return [functionResponse, ...toParts(contentToProcess)];
  }

  // 处理 Part 对象（functionResponse、inlineData、fileData、text 等）
  // ...
}`;

  const truncateOutputCode = `// packages/core/src/core/coreToolScheduler.ts:256

/**
 * 截断大型输出并保存到文件
 * @param content 原始输出内容
 * @param callId 调用 ID
 * @param projectTempDir 项目临时目录
 * @param threshold 截断阈值（字符数）
 * @param truncateLines 保留的行数
 */
export async function truncateAndSaveToFile(
  content: string,
  callId: string,
  projectTempDir: string,
  threshold: number,
  truncateLines: number,
): Promise<{ content: string; outputFile?: string }> {
  // 如果内容未超过阈值，直接返回
  if (content.length <= threshold) {
    return { content };
  }

  let lines = content.split('\\n');

  // 如果内容很长但行数很少，先进行换行处理
  if (lines.length <= truncateLines) {
    const wrapWidth = 120;
    const wrappedLines: string[] = [];
    for (const line of lines) {
      if (line.length > wrapWidth) {
        for (let i = 0; i < line.length; i += wrapWidth) {
          wrappedLines.push(line.substring(i, i + wrapWidth));
        }
      } else {
        wrappedLines.push(line);
      }
    }
    lines = wrappedLines;
  }

  // 保留开头 20% 和结尾 80% 的行
  const head = Math.floor(truncateLines / 5);
  const beginning = lines.slice(0, head);
  const end = lines.slice(-(truncateLines - head));
  const truncatedContent =
    beginning.join('\\n') + '\\n... [CONTENT TRUNCATED] ...\\n' + end.join('\\n');

  // 保存完整输出到文件
  const safeFileName = \`\${path.basename(callId)}.output\`;
  const outputFile = path.join(projectTempDir, safeFileName);
  await fs.writeFile(outputFile, fileContent);

  return {
    content: \`Tool output was too large and has been truncated.
The full output has been saved to: \${outputFile}
To read the complete output, use the read_file tool...
Truncated part of the output:
\${truncatedContent}\`,
    outputFile,
  };
}`;

  const allowedToolsMatchCode = `// packages/core/src/utils/tool-utils.ts

/**
 * 检查工具调用是否匹配白名单配置
 * 支持精确匹配和带参数的模式匹配
 */
export function doesToolInvocationMatch(
  tool: AnyDeclarativeTool,
  invocation: AnyToolInvocation,
  allowedTools: string[],
): boolean {
  const toolName = tool.declaration.name;

  for (const allowedPattern of allowedTools) {
    // 精确匹配：read_file
    if (allowedPattern === toolName) {
      return true;
    }

    // 模式匹配：run_shell_command(git)
    if (allowedPattern.includes('(')) {
      const [patternToolName, patternArgs] = allowedPattern.split('(');
      if (patternToolName === toolName) {
        // 提取工具的实际参数并检查是否匹配模式
        const commandArg = extractCommandArg(invocation);
        if (commandArg && commandArg.startsWith(patternArgs.replace(')', ''))) {
          return true;
        }
      }
    }
  }

  return false;
}

// 示例配置
{
  "tools": {
    "allowed": [
      "read_file",                  // 精确匹配
      "run_shell_command(git)",     // 只允许 git 开头的命令
      "run_shell_command(npm test)" // 只允许 npm test 命令
    ]
  }
}`;

  const queueManagementCode = `// packages/core/src/core/coreToolScheduler.ts:340

// 请求队列定义
private requestQueue: Array<{
  request: ToolCallRequestInfo | ToolCallRequestInfo[];
  signal: AbortSignal;
  resolve: () => void;
  reject: (reason?: Error) => void;
}> = [];

// 队列处理逻辑
private async checkAndNotifyCompletion(): Promise<void> {
  const allCallsAreTerminal = this.toolCalls.every(
    (call) =>
      call.status === 'success' ||
      call.status === 'error' ||
      call.status === 'cancelled',
  );

  if (this.toolCalls.length > 0 && allCallsAreTerminal) {
    const completedCalls = [...this.toolCalls] as CompletedToolCall[];
    this.toolCalls = [];

    // 记录工具调用日志
    for (const call of completedCalls) {
      logToolCall(this.config, new ToolCallEvent(call));
    }

    // 通知所有工具调用完成
    if (this.onAllToolCallsComplete) {
      this.isFinalizingToolCalls = true;
      await this.onAllToolCallsComplete(completedCalls);
      this.isFinalizingToolCalls = false;
    }

    // 处理队列中的下一个请求
    if (this.requestQueue.length > 0) {
      const next = this.requestQueue.shift()!;
      this._schedule(next.request, next.signal)
        .then(next.resolve)
        .catch(next.reject);
    }
  }
}`;

  const toolCallStatusCode = `// packages/core/src/scheduler/types.ts:38-115

// 工具调用状态类型定义
export type ValidatingToolCall = {
  status: 'validating';         // 验证参数阶段
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  startTime?: number;
  outcome?: ToolConfirmationOutcome;
};

export type ScheduledToolCall = {
  status: 'scheduled';           // 已排期，等待执行
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  startTime?: number;
  outcome?: ToolConfirmationOutcome;
};

export type WaitingToolCall = {
  status: 'awaiting_approval';   // 等待用户批准
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  confirmationDetails: ToolCallConfirmationDetails;
  startTime?: number;
  outcome?: ToolConfirmationOutcome;
};

export type ExecutingToolCall = {
  status: 'executing';           // 执行中
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  liveOutput?: string | AnsiOutput; // 实时输出（ANSI 格式）
  startTime?: number;
  outcome?: ToolConfirmationOutcome;
  pid?: number;                   // 进程 ID (Shell 工具)
};

export type SuccessfulToolCall = {
  status: 'success';             // 执行成功
  request: ToolCallRequestInfo;
  tool: AnyDeclarativeTool;
  response: ToolCallResponseInfo;
  invocation: AnyToolInvocation;
  durationMs?: number;
  outcome?: ToolConfirmationOutcome;
};

export type ErroredToolCall = {
  status: 'error';               // 执行失败
  request: ToolCallRequestInfo;
  response: ToolCallResponseInfo;
  tool?: AnyDeclarativeTool;
  durationMs?: number;
  outcome?: ToolConfirmationOutcome;
};

export type CancelledToolCall = {
  status: 'cancelled';           // 已取消
  request: ToolCallRequestInfo;
  response: ToolCallResponseInfo;
  tool: AnyDeclarativeTool;
  invocation: AnyToolInvocation;
  durationMs?: number;
  outcome?: ToolConfirmationOutcome;
};

export type ToolCall =
  | ValidatingToolCall
  | ScheduledToolCall
  | ErroredToolCall
  | SuccessfulToolCall
  | ExecutingToolCall
  | CancelledToolCall
  | WaitingToolCall;`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">CoreToolScheduler 执行模型</h2>
        <p className="text-gray-300 mb-4">
          CoreToolScheduler 是工具执行的核心调度器，负责工具验证、审批、执行和结果处理。
          它控制工具的整个生命周期，从 AI 请求到结果返回，确保安全性和可控性。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="调度管理" variant="blue">
            <div className="text-sm">
              <p className="font-semibold text-blue-300 mb-1">工具队列调度</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 并发控制和队列管理</li>
                <li>• 状态转换和追踪</li>
                <li>• AbortSignal 取消支持</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="确认决策" variant="yellow">
            <div className="text-sm">
              <p className="font-semibold text-yellow-300 mb-1">智能审批</p>
              <ul className="space-y-1 text-gray-300">
                <li>• ApprovalMode 模式判断</li>
                <li>• 工具 Kind 类型检查</li>
                <li>• allowedTools 白名单匹配</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="输出处理" variant="green">
            <div className="text-sm">
              <p className="font-semibold text-green-300 mb-1">结果优化</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 大输出自动截断</li>
                <li>• 文件保存和引导</li>
                <li>• 格式转换和包装</li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </section>

      {/* 设计哲学 */}
      <section className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl p-6 border border-amber-500/20">
        <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
          <span>💡</span>
          设计哲学：为什么这样设计
        </h3>

        {/* 核心问题 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border-l-4 border-amber-500">
          <h4 className="text-amber-300 font-bold mb-2">🎯 核心问题</h4>
          <p className="text-gray-300 text-sm">
            AI 可以调用工具执行任意操作（读写文件、执行命令、网络请求）。
            如何在<strong className="text-amber-200">保持 AI 自主性</strong>的同时，
            确保<strong className="text-cyan-300">用户对系统的控制权</strong>？
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 为什么需要审批机制 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-red-500/30">
            <h5 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>🛡️</span>
              为什么需要审批机制？
            </h5>
            <p className="text-gray-400 text-sm mb-2">
              AI 可能执行破坏性操作：
            </p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-4">
              <li>删除重要文件 <code className="text-red-300">rm -rf /</code></li>
              <li>泄露敏感信息到网络</li>
              <li>修改关键配置文件</li>
              <li>执行恶意代码</li>
            </ul>
            <div className="mt-3 bg-red-500/10 rounded p-2 text-xs text-red-200">
              <strong>解决：</strong>修改类工具默认需要用户确认
            </div>
          </div>

          {/* 为什么串行队列 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30">
            <h5 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <span>📋</span>
              为什么串行队列执行？
            </h5>
            <p className="text-gray-400 text-sm mb-2">
              并行执行工具会带来问题：
            </p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-4">
              <li>文件读写冲突</li>
              <li>命令执行顺序不确定</li>
              <li>用户无法逐个审批</li>
              <li>错误难以定位</li>
            </ul>
            <div className="mt-3 bg-blue-500/10 rounded p-2 text-xs text-blue-200">
              <strong>解决：</strong>队列保证有序 + 用户可逐个审核
            </div>
          </div>

          {/* 为什么输出截断 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30">
            <h5 className="text-green-400 font-bold mb-2 flex items-center gap-2">
              <span>✂️</span>
              为什么输出截断 + 保存文件？
            </h5>
            <p className="text-gray-400 text-sm mb-2">
              工具输出可能非常大：
            </p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-4">
              <li>日志文件几十 MB</li>
              <li>大型代码库搜索结果</li>
              <li>二进制文件输出</li>
            </ul>
            <div className="mt-3 bg-green-500/10 rounded p-2 text-xs text-green-200">
              <strong>解决：</strong>截断节省 Token + 文件保留完整数据 + 引导 AI 按需读取
            </div>
          </div>

          {/* 为什么多种审批模式 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
            <h5 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
              <span>🎚️</span>
              为什么需要多种审批模式？
            </h5>
            <p className="text-gray-400 text-sm mb-2">
              不同场景需要不同信任级别：
            </p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-4">
              <li><strong className="text-gray-300">DEFAULT</strong>：修改需确认（最安全）</li>
              <li><strong className="text-blue-300">AUTO_EDIT</strong>：文件编辑自动（效率）</li>
              <li><strong className="text-red-300">YOLO</strong>：全部自动（最快）</li>
            </ul>
            <div className="mt-3 bg-purple-500/10 rounded p-2 text-xs text-purple-200">
              <strong>解决：</strong>用户按需选择安全 vs 效率的平衡点
            </div>
          </div>
        </div>

        {/* 设计权衡表 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
            <span>⚖️</span>
            关键设计权衡
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">决策点</th>
                  <th className="text-left py-2 text-green-400">选择</th>
                  <th className="text-left py-2 text-amber-400">代价</th>
                  <th className="text-left py-2 text-cyan-400">收益</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">并发模型</td>
                  <td className="py-2 text-green-400">串行队列</td>
                  <td className="py-2 text-amber-400">执行速度较慢</td>
                  <td className="py-2 text-cyan-400">可预测 + 可审批</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">默认审批</td>
                  <td className="py-2 text-green-400">修改类需确认</td>
                  <td className="py-2 text-amber-400">用户需要频繁操作</td>
                  <td className="py-2 text-cyan-400">防止意外破坏</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">大输出处理</td>
                  <td className="py-2 text-green-400">截断 + 保存文件</td>
                  <td className="py-2 text-amber-400">AI 需要额外读取</td>
                  <td className="py-2 text-cyan-400">节省 Token + 保留完整</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-2">PolicyEngine</td>
                  <td className="py-2 text-green-400">规则驱动决策</td>
                  <td className="py-2 text-amber-400">需要配置规则</td>
                  <td className="py-2 text-cyan-400">灵活的权限控制</td>
                </tr>
                <tr>
                  <td className="py-2">白名单机制</td>
                  <td className="py-2 text-green-400">精确 + 模式匹配</td>
                  <td className="py-2 text-amber-400">配置复杂度增加</td>
                  <td className="py-2 text-cyan-400">细粒度权限控制</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 架构定位 */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <div className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">
            上层：GeminiChat 发起调用
          </div>
          <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
            下层：Tool.execute() 执行
          </div>
          <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
            平级：Config 提供审批配置
          </div>
          <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
            UI 层：展示状态 + 收集用户决策
          </div>
        </div>
      </section>

      {/* 调度流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">完整调度流程</h3>
        <MermaidDiagram chart={toolSchedulerFlowChart} title="CoreToolScheduler 调度流程" />
        <CodeBlock code={scheduleMethodCode} language="typescript" title="schedule() 主入口" />
      </section>

      {/* 确认决策逻辑 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">确认决策逻辑</h3>
        <p className="text-gray-300 mb-4">
          工具调度的核心是 <code className="text-cyan-300">shouldConfirmExecute()</code> 方法，
          它根据 ApprovalMode、工具 Kind 和 allowedTools 配置决定是否需要用户确认。
        </p>

        <MermaidDiagram chart={confirmationDecisionChart} title="确认决策流程" />
        <CodeBlock code={shouldConfirmCode} language="typescript" title="确认决策核心代码" />

        <HighlightBox title="⚠️ 工具命名不一致警告" variant="yellow">
          <div className="text-sm space-y-2">
            <p className="text-yellow-200">
              <strong>已知问题：</strong> Core 层定义的工具名是 <code className="text-cyan-300">edit</code>，
              但 CLI 层的 EDIT_TOOL_NAMES 使用 <code className="text-cyan-300">replace</code>。
            </p>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">影响范围</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• <strong>AUTO_EDIT 模式：</strong> 自动批准 <code className="text-orange-300">replace</code> 和 <code className="text-orange-300">write_file</code>，而非 <code className="text-cyan-300">edit</code></li>
                <li>• <strong>Checkpointing：</strong> 监听 <code className="text-orange-300">replace</code> 和 <code className="text-orange-300">write_file</code> 的 awaiting_approval 状态</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">源码位置</h5>
              <ul className="space-y-1 text-gray-400 text-xs font-mono">
                <li>• packages/core/src/tools/tool-names.ts:13 - <code className="text-cyan-300">EDIT: 'edit'</code></li>
                <li>• packages/cli/src/ui/hooks/useGeminiStream.ts:75 - <code className="text-orange-300">new Set(['replace', 'write_file'])</code></li>
              </ul>
            </div>
            <p className="text-yellow-200 mt-2">
              <strong>建议：</strong> 在实际使用时确认 AI 返回的工具调用名称与 CLI 预期是否一致。
            </p>
          </div>
        </HighlightBox>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">自动批准条件</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-cyan-300">Kind = Read/Search/Fetch</code> - 只读工具</li>
              <li>• <code className="text-cyan-300">ApprovalMode = YOLO</code> - YOLO 模式</li>
              <li>• <code className="text-cyan-300">ApprovalMode = AUTO_EDIT + Kind = Edit</code> - 自动编辑模式</li>
              <li>• <code className="text-cyan-300">工具在 allowedTools 白名单</code> - 白名单匹配</li>
              <li>• <code className="text-cyan-300">PolicyEngine 规则匹配 ALLOW</code> - 规则自动批准</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-2">需要确认条件</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-orange-300">Kind = Edit/Delete/Execute</code> - 修改类工具</li>
              <li>• <code className="text-orange-300">ApprovalMode = DEFAULT</code> - 默认模式</li>
              <li>• <code className="text-orange-300">工具不在 allowedTools</code> - 白名单外</li>
              <li>• <code className="text-orange-300">MCP 外部工具</code> - 外部服务器工具</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PolicyEngine 决策机制 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">PolicyEngine 决策机制</h3>
        <p className="text-gray-300 mb-4">
          PolicyEngine 是工具执行的核心决策引擎，通过规则匹配和 SafetyChecker 来决定工具是否可以执行。
          支持三种审批模式：DEFAULT（默认确认）、AUTO_EDIT（自动编辑）、YOLO（全自动）。
        </p>

        <HighlightBox title="PolicyEngine 决策逻辑" variant="purple">
          <div className="text-sm space-y-2">
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">三种决策结果</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• <code>ALLOW</code> - 自动批准执行，无需用户确认</li>
                <li>• <code>DENY</code> - 拒绝执行，抛出错误</li>
                <li>• <code>ASK_USER</code> - 需要用户确认后才能执行</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">决策优先级</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• 规则按 <code>priority</code> 排序，高优先级先匹配</li>
                <li>• 规则可限定 <code>modes</code>，只在特定 ApprovalMode 下生效</li>
                <li>• 支持 <code>toolName</code> 精确匹配和通配符（如 <code>serverName__*</code>）</li>
                <li>• 支持 <code>argsPattern</code> 正则匹配参数</li>
              </ul>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          code={`// packages/core/src/policy/policy-engine.ts:147-180

/**
 * Check if a tool call is allowed based on the configured policies.
 * Returns the decision and the matching rule (if any).
 */
async check(
  toolCall: FunctionCall,
  serverName: string | undefined,
): Promise<{
  decision: PolicyDecision;
  rule?: PolicyRule;
}> {
  // Compute stringified args once before the loop
  let stringifiedArgs: string | undefined;
  if (toolCall.args && (this.rules.some(r => r.argsPattern) || ...)) {
    stringifiedArgs = stableStringify(toolCall.args);
  }

  // Find the first matching rule (already sorted by priority)
  for (const rule of this.rules) {
    if (ruleMatches(rule, toolCall, stringifiedArgs, serverName, this.approvalMode)) {
      // Shell 命令特殊处理：检查子命令
      if (SHELL_TOOL_NAMES.includes(toolCall.name) && rule.decision === ALLOW) {
        // 拆分并检查每个子命令
        const subCommands = splitCommands(command);
        // ... 子命令逐一验证
      }
      return { decision: rule.decision, rule };
    }
  }
  return { decision: this.defaultDecision };
}`}
          language="typescript"
          title="PolicyEngine.check 决策代码"
        />
      </section>

      {/* 输出截断机制 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">输出截断机制</h3>
        <p className="text-gray-300 mb-4">
          为了避免超大输出消耗过多 Token 和内存，CoreToolScheduler 实现了智能截断机制。
          当工具输出超过阈值时，自动截断并保存到文件，同时在响应中引导 AI 使用 read_file 工具读取完整输出。
        </p>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-cyan-400 font-semibold mb-3">截断配置</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-gray-300 mb-1">配置参数</h5>
              <ul className="space-y-1 text-gray-400">
                <li>• <code className="text-cyan-300">enableToolOutputTruncation</code> - 是否启用截断</li>
                <li>• <code className="text-cyan-300">truncateToolOutputThreshold</code> - 截断阈值（字符数）</li>
                <li>• <code className="text-cyan-300">truncateToolOutputLines</code> - 保留的行数</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-300 mb-1">默认值</h5>
              <ul className="space-y-1 text-gray-400">
                <li>• 启用截断: <code className="text-green-300">true</code></li>
                <li>• 阈值: <code className="text-green-300">50000</code> 字符</li>
                <li>• 保留行数: <code className="text-green-300">100</code> 行</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock code={truncateOutputCode} language="typescript" title="truncateAndSaveToFile 实现" />

        <HighlightBox title="截断策略" variant="blue">
          <div className="text-sm space-y-2">
            <div>
              <h5 className="font-semibold text-blue-300 mb-1">截断逻辑</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• 保留开头 <code>20%</code> 的行（前 20 行）</li>
                <li>• 保留结尾 <code>80%</code> 的行（后 80 行）</li>
                <li>• 中间部分用 <code>... [CONTENT TRUNCATED] ...</code> 标记</li>
                <li>• 完整输出保存到 <code>.gemini/tmp/&lt;callId&gt;.output</code></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-blue-300 mb-1">AI 引导</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• 响应中包含完整文件路径</li>
                <li>• 提示使用 <code>read_file</code> 工具读取</li>
                <li>• 建议使用 <code>offset</code> 和 <code>limit</code> 参数分段读取</li>
                <li>• 显示截断部分的预览内容</li>
              </ul>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 工具白名单匹配 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">allowedTools 白名单匹配</h3>
        <p className="text-gray-300 mb-4">
          通过 <code>allowedTools</code> 配置，可以精确控制哪些工具可以自动执行。
          支持精确匹配和带参数的模式匹配。
        </p>

        <CodeBlock code={allowedToolsMatchCode} language="typescript" title="白名单匹配逻辑" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">匹配模式示例</h4>
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
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-cyan-300">run_shell_command(npm test)</code></td>
                <td className="p-2">匹配工具名 + 精确命令</td>
                <td className="p-2">只允许 <code>npm test</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 并发控制 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">并发控制和队列管理</h3>
        <p className="text-gray-300 mb-4">
          CoreToolScheduler 通过队列机制确保工具调用的有序执行，避免并发冲突和资源竞争。
        </p>

        <MermaidDiagram chart={concurrencyControlChart} title="并发控制流程" />
        <CodeBlock code={queueManagementCode} language="typescript" title="队列管理代码" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">入队条件</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 有工具正在执行（<code>isRunning() = true</code>）</li>
              <li>• 正在调度其他工具（<code>isScheduling = true</code>）</li>
              <li>• 有工具等待用户批准（<code>awaiting_approval</code>）</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">出队时机</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 所有工具调用完成（<code>allCallsAreTerminal</code>）</li>
              <li>• <code>onAllToolCallsComplete</code> 回调执行完毕</li>
              <li>• 调度器空闲状态（<code>isRunning() = false</code>）</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 工具调用状态 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">工具调用状态定义</h3>
        <CodeBlock code={toolCallStatusCode} language="typescript" title="工具调用状态类型" />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="border border-gray-700 p-3 text-left text-gray-400">状态</th>
                <th className="border border-gray-700 p-3 text-left text-gray-400">含义</th>
                <th className="border border-gray-700 p-3 text-left text-gray-400">后续转换</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-cyan-300">validating</code>
                </td>
                <td className="border border-gray-700 p-3">验证参数，构建调用对象</td>
                <td className="border border-gray-700 p-3">
                  → <code>scheduled</code> / <code>awaiting_approval</code> / <code>error</code>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-green-300">scheduled</code>
                </td>
                <td className="border border-gray-700 p-3">已排期，等待执行</td>
                <td className="border border-gray-700 p-3">
                  → <code>executing</code>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-yellow-300">awaiting_approval</code>
                </td>
                <td className="border border-gray-700 p-3">等待用户批准</td>
                <td className="border border-gray-700 p-3">
                  → <code>scheduled</code> / <code>cancelled</code>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-blue-300">executing</code>
                </td>
                <td className="border border-gray-700 p-3">执行中，可能有实时输出</td>
                <td className="border border-gray-700 p-3">
                  → <code>success</code> / <code>error</code> / <code>cancelled</code>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-green-300">success</code>
                </td>
                <td className="border border-gray-700 p-3">执行成功（终态）</td>
                <td className="border border-gray-700 p-3">无</td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="border border-gray-700 p-3">
                  <code className="text-red-300">error</code>
                </td>
                <td className="border border-gray-700 p-3">执行失败（终态）</td>
                <td className="border border-gray-700 p-3">无</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-3">
                  <code className="text-gray-300">cancelled</code>
                </td>
                <td className="border border-gray-700 p-3">用户取消（终态）</td>
                <td className="border border-gray-700 p-3">无</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 结果转换 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">结果转换逻辑</h3>
        <p className="text-gray-300 mb-4">
          工具执行完成后，需要将结果转换为 Gemini API 的 <code>FunctionResponse</code> 格式。
          <code>convertToFunctionResponse()</code> 方法处理各种类型的工具输出（字符串、Part、Part[] 等）。
        </p>

        <CodeBlock code={convertResponseCode} language="typescript" title="convertToFunctionResponse 实现" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">支持的输出类型</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">输入类型</th>
                <th className="text-left p-2">处理方式</th>
                <th className="text-left p-2">输出格式</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-cyan-300">string</code></td>
                <td className="p-2">直接包装为 functionResponse</td>
                <td className="p-2"><code>[&#123;functionResponse: &#123;...&#125;&#125;]</code></td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-cyan-300">Part[]</code></td>
                <td className="p-2">添加 functionResponse + 保留所有 Part</td>
                <td className="p-2"><code>[&#123;functionResponse&#125;, ...parts]</code></td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-cyan-300">Part (text)</code></td>
                <td className="p-2">提取 text 字段包装</td>
                <td className="p-2"><code>[&#123;functionResponse: &#123;output: text&#125;&#125;]</code></td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="p-2"><code className="text-cyan-300">Part (inlineData/fileData)</code></td>
                <td className="p-2">添加描述 + 保留二进制数据</td>
                <td className="p-2"><code>[&#123;functionResponse&#125;, &#123;inlineData&#125;]</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 源码位置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">源码位置</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:410</code>
            <span className="text-gray-400">schedule() 主入口</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:483</code>
            <span className="text-gray-400">_schedule() 内部实现</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:602</code>
            <span className="text-gray-400">shouldConfirmExecute 确认逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:947</code>
            <span className="text-gray-400">saveTruncatedContent 输出截断</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:974</code>
            <span className="text-gray-400">convertToFunctionResponse 结果转换</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/policy/policy-engine.ts:147</code>
            <span className="text-gray-400">PolicyEngine.check 决策逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:1140</code>
            <span className="text-gray-400">checkAndNotifyCompletion 队列管理</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/utils/tool-utils.ts</code>
            <span className="text-gray-400">doesToolInvocationMatch 白名单匹配</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/tools/tools.ts:584</code>
            <span className="text-gray-400">Kind 枚举定义</span>
          </div>
        </div>
      </section>

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <section className="bg-gradient-to-r from-red-500/5 to-transparent rounded-xl p-6 border border-red-500/20">
        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
          <span>🔬</span>
          边界条件深度解析
        </h3>
        <p className="text-gray-300 mb-6">
          工具调度系统面临复杂的边界条件。理解这些边界情况有助于诊断调度异常和优化系统稳定性。
        </p>

        {/* 边界条件 1: 用户快速批准/拒绝 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border-l-4 border-yellow-500">
          <h4 className="text-yellow-400 font-bold mb-2">边界 1: 用户批准期间 AbortSignal 被触发</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
              <p className="text-sm text-gray-400">
                工具等待用户批准 (awaiting_approval) 时，用户按 Ctrl+C 或切换会话触发 AbortSignal。
              </p>
              <div className="mt-2 bg-yellow-500/10 p-2 rounded text-xs">
                <strong className="text-yellow-300">触发条件：</strong>
                <code className="text-gray-300 block mt-1">
                  status = 'awaiting_approval' && signal.aborted = true
                </code>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">系统行为</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 立即将状态转为 <code className="text-red-300">cancelled</code></li>
                <li>• 从队列中移除等待的请求</li>
                <li>• 调用 <code className="text-cyan-300">reject(new Error('cancelled'))</code></li>
                <li>• 触发 <code className="text-cyan-300">checkAndNotifyCompletion()</code></li>
              </ul>
              <div className="mt-2 bg-green-500/10 p-2 rounded text-xs">
                <strong className="text-green-300">安全保障：</strong> 不会执行任何半途工具
              </div>
            </div>
          </div>
          <CodeBlock
            code={`// packages/core/src/core/coreToolScheduler.ts:653-662
signal.addEventListener('abort', abortHandler, { once: true });

const abortHandler = () => {
  const index = this.requestQueue.findIndex(
    (item) => item.request === request,
  );
  if (index > -1) {
    this.requestQueue.splice(index, 1);
    reject(new Error('Tool call cancelled while in queue.'));
  }
};`}
            language="typescript"
            title="AbortSignal 处理逻辑"
          />
        </div>

        {/* 边界条件 2: 多个工具同时请求批准 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
          <h4 className="text-blue-400 font-bold mb-2">边界 2: AI 一次返回多个工具调用</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
              <p className="text-sm text-gray-400">
                AI 在一次响应中返回多个工具调用（如同时调用 read_file、edit、run_shell_command）。
                这些工具需要以正确的顺序处理。
              </p>
              <div className="mt-2 bg-blue-500/10 p-2 rounded text-xs">
                <strong className="text-blue-300">典型场景：</strong>
                <span className="text-gray-300 block mt-1">
                  AI 返回 [read_file, edit, run_shell_command(npm test)]
                </span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">调度行为</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 接收数组形式的 <code className="text-cyan-300">ToolCallRequestInfo[]</code></li>
                <li>• 按数组顺序依次验证和调度</li>
                <li>• 只读工具 (read_file) 立即标记为 scheduled</li>
                <li>• 修改类工具逐个等待批准</li>
                <li>• 所有工具完成后一次性返回结果</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-cyan-300 mb-2">批量调度时序图</h5>
            <MermaidDiagram chart={`sequenceDiagram
    participant AI as AI Model
    participant Scheduler as CoreToolScheduler
    participant User as User UI

    AI->>Scheduler: [read_file, edit, bash]
    Scheduler->>Scheduler: validate read_file
    Note right of Scheduler: Kind=Read, auto-approve
    Scheduler->>Scheduler: validate edit
    Note right of Scheduler: Kind=Edit, need confirm
    Scheduler-->>User: await_approval (edit)
    User-->>Scheduler: approve
    Scheduler->>Scheduler: validate bash
    Note right of Scheduler: Kind=Execute, need confirm
    Scheduler-->>User: await_approval (bash)
    User-->>Scheduler: approve
    Scheduler->>Scheduler: execute all tools
    Scheduler-->>AI: [results...]`} />
          </div>
        </div>

        {/* 边界条件 3: 工具执行超时 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border-l-4 border-orange-500">
          <h4 className="text-orange-400 font-bold mb-2">边界 3: 工具执行超时</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
              <p className="text-sm text-gray-400">
                Shell 命令执行时间过长（如编译大项目、运行长时测试），超过配置的超时阈值。
              </p>
              <div className="mt-2 bg-orange-500/10 p-2 rounded text-xs">
                <strong className="text-orange-300">超时配置：</strong>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• Bash 工具默认: 120s (2分钟)</li>
                  <li>• 网络请求工具: 30s</li>
                  <li>• 文件操作: 无超时</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">超时处理</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 工具内部实现 AbortController 超时逻辑</li>
                <li>• 超时时发送 SIGTERM 给子进程</li>
                <li>• 状态转为 <code className="text-red-300">error</code></li>
                <li>• 返回部分输出 + 超时错误信息</li>
                <li>• AI 收到错误后可决定重试或换方案</li>
              </ul>
            </div>
          </div>
          <CodeBlock
            code={`// 工具执行超时处理示例
// packages/core/src/tools/bash/bash-tool.ts

async execute(params: BashParams, signal: AbortSignal) {
  const timeout = params.timeout || 120000; // 默认 2 分钟

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
    // 向子进程发送终止信号
    if (this.childProcess) {
      this.childProcess.kill('SIGTERM');
    }
  }, timeout);

  try {
    const result = await this.runCommand(params.command, {
      signal: AbortSignal.any([signal, timeoutController.signal]),
    });
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}`}
            language="typescript"
            title="Bash 工具超时实现"
          />
        </div>

        {/* 边界条件 4: 输出截断边界 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border-l-4 border-green-500">
          <h4 className="text-green-400 font-bold mb-2">边界 4: 输出刚好在截断阈值附近</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
              <p className="text-sm text-gray-400">
                工具输出长度接近 50000 字符阈值（49900-50100），截断行为需要精确处理。
              </p>
              <div className="mt-2 bg-green-500/10 p-2 rounded text-xs">
                <strong className="text-green-300">边界计算：</strong>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• 阈值: 50000 字符</li>
                  <li>• 保留行数: 100 行</li>
                  <li>• 头部比例: 20% (20 行)</li>
                  <li>• 尾部比例: 80% (80 行)</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">截断策略细节</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <strong>行数少但单行很长：</strong> 先按 120 字符自动换行</li>
                <li>• <strong>超长单行：</strong> 换行后再计算截断点</li>
                <li>• <strong>刚好 50000 字符：</strong> 不截断，直接返回</li>
                <li>• <strong>50001+ 字符：</strong> 执行截断 + 保存文件</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left p-2">输出特征</th>
                  <th className="text-left p-2">处理方式</th>
                  <th className="text-left p-2">文件保存</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">100 行 x 400 字符 = 40000</td>
                  <td className="p-2 text-green-400">不截断</td>
                  <td className="p-2">否</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">100 行 x 600 字符 = 60000</td>
                  <td className="p-2 text-yellow-400">换行后截断</td>
                  <td className="p-2">是</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">10 行 x 6000 字符 = 60000</td>
                  <td className="p-2 text-yellow-400">先换行再截断</td>
                  <td className="p-2">是</td>
                </tr>
                <tr>
                  <td className="p-2">1 行 x 100000 字符</td>
                  <td className="p-2 text-red-400">强制换行并截断</td>
                  <td className="p-2">是</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 边界条件 5: PolicyEngine MCP 工具处理 */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border-l-4 border-purple-500">
          <h4 className="text-purple-400 font-bold mb-2">边界 5: PolicyEngine 对 MCP 工具的处理</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
              <p className="text-sm text-gray-400">
                PolicyEngine 使用通配符规则匹配 MCP 工具：
                <code className="text-purple-300">serverName__*</code> 可匹配某个 Server 的所有工具。
              </p>
              <div className="mt-2 bg-purple-500/10 p-2 rounded text-xs">
                <strong className="text-purple-300">安全机制：</strong>
                <span className="text-gray-300 block mt-1">
                  防止恶意 Server 通过命名伪装成受信任 Server
                </span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">处理策略</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• MCP 工具名格式：<code>serverName__toolName</code></li>
                <li>• 通配符规则验证 serverName 完全匹配前缀</li>
                <li>• 支持 argsPattern 对参数进行正则匹配</li>
                <li>• MCP 工具的 Kind 由 annotations 推断</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-gray-400 mb-2">MCP 工具 Kind 声明</h5>
            <CodeBlock
              code={`// MCP Server 工具声明中包含 Kind 信息
{
  "name": "search_documents",
  "description": "Search documents in the database",
  "inputSchema": { ... },
  // MCP 规范中的安全标记
  "annotations": {
    "readOnly": true,  // 表示只读操作
    "dangerous": false // 表示非危险操作
  }
}

// CoreToolScheduler 对 MCP 工具的 Kind 推断
function getMcpToolKind(tool: McpTool): Kind {
  if (tool.annotations?.readOnly) return Kind.Read;
  if (tool.annotations?.dangerous) return Kind.Delete;
  return Kind.Execute; // 默认视为执行类
}`}
              language="typescript"
              title="MCP 工具 Kind 推断"
            />
          </div>
        </div>

        {/* 边界条件 6: 白名单模式匹配 */}
        <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-cyan-500">
          <h4 className="text-cyan-400 font-bold mb-2">边界 6: 白名单模式匹配的安全边界</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">潜在风险</h5>
              <p className="text-sm text-gray-400 mb-2">
                模式匹配使用前缀匹配，可能存在安全漏洞：
              </p>
              <div className="bg-red-500/10 p-2 rounded text-xs">
                <strong className="text-red-300">危险示例：</strong>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• 配置: <code>run_shell_command(git)</code></li>
                  <li>• 攻击: <code>git; rm -rf /</code> (命令注入)</li>
                  <li>• 结果: 前缀 "git" 匹配，自动通过</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-2">安全建议</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 使用精确命令匹配而非前缀匹配</li>
                <li>• 配置: <code>run_shell_command(git status)</code></li>
                <li>• 避免匹配可组合命令</li>
                <li>• Sandbox 环境提供底层保护</li>
                <li>• 定期审计 allowedTools 配置</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-gray-400 mb-2">安全配置示例</h5>
            <CodeBlock
              code={`// 危险配置 - 不建议
{
  "tools": {
    "allowed": [
      "run_shell_command(git)",     // 可被 "git; malicious" 绕过
      "run_shell_command(npm)"       // 可被 "npm install malware" 利用
    ]
  }
}

// 安全配置 - 推荐
{
  "tools": {
    "allowed": [
      "run_shell_command(git status)",    // 精确匹配
      "run_shell_command(git diff)",
      "run_shell_command(git log)",
      "run_shell_command(npm test)",      // 精确匹配
      "run_shell_command(npm run lint)"
    ]
  }
}`}
              language="json"
              title="allowedTools 安全配置对比"
            />
          </div>
        </div>
      </section>

      {/* 常见问题与调试技巧 */}
      <section className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl p-6 border border-amber-500/20 mt-8">
        <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
          <span>🐛</span>
          常见问题与调试技巧
        </h3>

        <div className="space-y-4">
          {/* 问题 1 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔴</span>
              <div className="flex-1">
                <h4 className="text-red-400 font-bold mb-2">问题：工具卡在 awaiting_approval 状态不响应</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 工具状态显示 awaiting_approval</li>
                      <li>• 用户按 Y/N 无反应</li>
                      <li>• UI 看似卡死</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 1. UI 层 onApprove 回调未正确绑定</li>
                      <li>• 2. 键盘事件被其他组件截获</li>
                      <li>• 3. Scheduler 实例被意外销毁</li>
                      <li>• 4. 状态同步延迟 (React 状态未更新)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-gray-800/50 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">调试步骤</h5>
                  <CodeBlock
                    code={`# 1. 检查 Scheduler 状态
DEBUG=gemini:scheduler gemini

# 2. 查看工具调用日志
# 日志会显示每个工具的状态转换

# 3. 在代码中添加调试点
// packages/cli/src/ui/ToolApproval.tsx
console.log('Current tool status:', toolCall.status);
console.log('onApprove bound:', typeof onApprove);

# 4. 检查 React 状态
// 使用 React DevTools 检查 useGeminiStream hook 状态`}
                    language="bash"
                    title="调试命令"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 问题 2 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🟡</span>
              <div className="flex-1">
                <h4 className="text-yellow-400 font-bold mb-2">问题：YOLO 模式下某些工具仍需确认</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 已设置 <code>--dangerously-skip-permissions</code></li>
                      <li>• 但某些工具仍显示确认提示</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 1. MCP 工具未正确声明 annotations</li>
                      <li>• 2. 工具实现的 shouldConfirmExecute 逻辑有误</li>
                      <li>• 3. ApprovalMode 未正确传递到 Scheduler</li>
                      <li>• 4. 存在硬编码的确认逻辑</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-gray-800/50 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">调试步骤</h5>
                  <CodeBlock
                    code={`# 1. 确认 ApprovalMode 设置正确
# 在 ~/.config/gemini/settings.json 检查
{
  "approval_mode": "yolo"
}

# 2. 检查工具的 shouldConfirmExecute 实现
// packages/core/src/tools/[tool]/[tool].ts
async shouldConfirmExecute(signal: AbortSignal) {
  // 检查这里的逻辑
  console.log('ApprovalMode:', this.config.getApprovalMode());
  // 如果返回非 null，就需要确认
}

# 3. 检查 MCP 工具配置
// MCP Server 的 tool annotations
{
  "annotations": {
    "readOnly": true  // 确保设置正确
  }
}`}
                    language="bash"
                    title="调试命令"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 问题 3 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🟠</span>
              <div className="flex-1">
                <h4 className="text-orange-400 font-bold mb-2">问题：工具输出被截断但找不到完整文件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 输出显示 "[CONTENT TRUNCATED]"</li>
                      <li>• 提示的文件路径不存在</li>
                      <li>• <code>.gemini/tmp/</code> 目录为空</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 1. 临时目录创建失败 (权限问题)</li>
                      <li>• 2. 文件被清理脚本删除</li>
                      <li>• 3. 磁盘空间不足</li>
                      <li>• 4. 路径中含特殊字符</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-gray-800/50 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">调试步骤</h5>
                  <CodeBlock
                    code={`# 1. 检查临时目录
ls -la .gemini/tmp/

# 2. 检查目录权限
ls -la .gemini/

# 3. 手动创建目录测试
mkdir -p .gemini/tmp && touch .gemini/tmp/test.txt

# 4. 检查磁盘空间
df -h .

# 5. 查看完整日志中的文件保存路径
DEBUG=gemini:truncate gemini`}
                    language="bash"
                    title="调试命令"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 问题 4 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div className="flex-1">
                <h4 className="text-blue-400 font-bold mb-2">问题：PolicyEngine 规则不生效</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 配置了 ALLOW 规则但仍需确认</li>
                      <li>• 配置了 DENY 规则但仍可执行</li>
                      <li>• 规则匹配未按预期工作</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 1. 规则 priority 较低被覆盖</li>
                      <li>• 2. 规则 modes 限制不匹配当前模式</li>
                      <li>• 3. toolName 或 argsPattern 格式错误</li>
                      <li>• 4. MCP 工具名格式错误（需 serverName__toolName）</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-gray-800/50 rounded p-3">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">调试步骤</h5>
                  <CodeBlock
                    code={`# 1. 检查当前 ApprovalMode
# 在 UI 中查看 DEFAULT / AUTO_EDIT / YOLO

# 2. 检查 Policy 配置
cat ~/.config/gemini/policy.toml

# 3. 验证规则优先级
# 高 priority 的规则优先匹配

# 4. 添加调试日志
DEBUG=gemini:policy gemini

# 5. 检查 MCP 工具名格式
# 格式应为: serverName__toolName`}
                    language="bash"
                    title="调试命令"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 调试工具速查 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-amber-300 font-bold mb-3">调试工具速查表</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left p-2">调试场景</th>
                  <th className="text-left p-2">环境变量</th>
                  <th className="text-left p-2">输出内容</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">工具调度流程</td>
                  <td className="p-2"><code className="text-cyan-300">DEBUG=gemini:scheduler</code></td>
                  <td className="p-2">调度入口、状态转换、队列操作</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">确认决策逻辑</td>
                  <td className="p-2"><code className="text-cyan-300">DEBUG=gemini:approval</code></td>
                  <td className="p-2">shouldConfirmExecute 返回值、模式判断</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">输出截断</td>
                  <td className="p-2"><code className="text-cyan-300">DEBUG=gemini:truncate</code></td>
                  <td className="p-2">截断阈值、文件保存路径</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">MCP 工具调用</td>
                  <td className="p-2"><code className="text-cyan-300">DEBUG=gemini:mcp</code></td>
                  <td className="p-2">MCP 工具声明、annotations 解析</td>
                </tr>
                <tr>
                  <td className="p-2">全部调试信息</td>
                  <td className="p-2"><code className="text-cyan-300">DEBUG=gemini:*</code></td>
                  <td className="p-2">所有模块的调试输出</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 性能优化建议 */}
      <section className="bg-gradient-to-r from-green-500/5 to-transparent rounded-xl p-6 border border-green-500/20 mt-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
          <span>⚡</span>
          性能优化建议
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 优化 1: 减少确认次数 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>🎯</span>
              减少人工确认次数
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              频繁确认是影响交互效率的主要因素。通过合理配置可大幅减少确认次数。
            </p>
            <div className="space-y-2">
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 1: 使用 AUTO_EDIT 模式</h5>
                <p className="text-xs text-gray-400">
                  自动批准 Edit/Write 类工具，只对 Shell 命令需要确认。
                </p>
                <code className="text-xs text-cyan-300">gemini --auto-edit</code>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 2: 配置常用命令白名单</h5>
                <p className="text-xs text-gray-400">
                  将常用的安全命令加入 allowedTools。
                </p>
                <CodeBlock
                  code={`{
  "tools": {
    "allowed": [
      "run_shell_command(git status)",
      "run_shell_command(git diff)",
      "run_shell_command(npm test)",
      "run_shell_command(npm run build)"
    ]
  }
}`}
                  language="json"
                  title="settings.json"
                />
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 3: Sandbox 环境使用 YOLO 模式</h5>
                <p className="text-xs text-gray-400">
                  在隔离的 Sandbox 中可安全使用 YOLO 模式。
                </p>
                <code className="text-xs text-cyan-300">GEMINI_SANDBOX=docker gemini --yolo</code>
              </div>
            </div>
          </div>

          {/* 优化 2: 减少输出截断开销 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>✂️</span>
              减少输出截断开销
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              输出截断涉及文件 I/O，可通过调整阈值和策略优化性能。
            </p>
            <div className="space-y-2">
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 1: 调整截断阈值</h5>
                <p className="text-xs text-gray-400">
                  根据使用场景调整截断阈值，减少不必要的文件保存。
                </p>
                <CodeBlock
                  code={`{
  "output": {
    "truncateThreshold": 100000,  // 提高到 100K
    "truncateLines": 200           // 保留更多行
  }
}`}
                  language="json"
                  title="settings.json"
                />
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 2: 使用 SSD 存储临时文件</h5>
                <p className="text-xs text-gray-400">
                  确保 .gemini/tmp 目录在 SSD 上，加速文件写入。
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 3: 定期清理临时文件</h5>
                <p className="text-xs text-gray-400">
                  避免临时文件积累影响磁盘性能。
                </p>
                <code className="text-xs text-cyan-300">find .gemini/tmp -mtime +7 -delete</code>
              </div>
            </div>
          </div>

          {/* 优化 3: 加速批量工具执行 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>📦</span>
              加速批量工具执行
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              当 AI 返回多个工具调用时，可通过优化批准策略加速执行。
            </p>
            <div className="space-y-2">
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 1: 使用 "Proceed Always" 选项</h5>
                <p className="text-xs text-gray-400">
                  批准时选择 "Proceed Always"，后续相同工具自动通过。
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 2: 批量只读工具不阻塞</h5>
                <p className="text-xs text-gray-400">
                  确保只读工具 (read_file, grep 等) 不被意外拦截。
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 3: 预热 MCP 连接</h5>
                <p className="text-xs text-gray-400">
                  MCP 工具首次调用有连接延迟，可在会话开始时预热。
                </p>
              </div>
            </div>
          </div>

          {/* 优化 4: 队列管理优化 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/20">
            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <span>📋</span>
              队列管理优化
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              串行队列保证安全但可能成为瓶颈，可通过策略优化。
            </p>
            <div className="space-y-2">
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 1: 减少队列积压</h5>
                <p className="text-xs text-gray-400">
                  快速响应确认请求，避免队列堆积。
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 2: 避免长时间工具</h5>
                <p className="text-xs text-gray-400">
                  将长时间工具（如大型编译）拆分为多个小步骤。
                </p>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <h5 className="text-xs font-semibold text-gray-300 mb-1">策略 3: 监控队列状态</h5>
                <p className="text-xs text-gray-400">
                  启用调试日志查看队列积压情况。
                </p>
                <code className="text-xs text-cyan-300">DEBUG=gemini:queue gemini</code>
              </div>
            </div>
          </div>
        </div>

        {/* 性能基准测试 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-green-300 font-bold mb-3">工具调度性能基准</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left p-2">操作</th>
                  <th className="text-left p-2">典型耗时</th>
                  <th className="text-left p-2">影响因素</th>
                  <th className="text-left p-2">优化建议</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">工具参数验证</td>
                  <td className="p-2 text-green-400">&lt; 1ms</td>
                  <td className="p-2">参数复杂度</td>
                  <td className="p-2">无需优化</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">确认决策判断</td>
                  <td className="p-2 text-green-400">&lt; 1ms</td>
                  <td className="p-2">白名单大小</td>
                  <td className="p-2">保持白名单简洁</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">用户确认等待</td>
                  <td className="p-2 text-yellow-400">100ms - 10s</td>
                  <td className="p-2">用户响应速度</td>
                  <td className="p-2">合理配置自动批准</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">文件读取工具</td>
                  <td className="p-2 text-green-400">1 - 50ms</td>
                  <td className="p-2">文件大小、磁盘类型</td>
                  <td className="p-2">使用 SSD</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">文件编辑工具</td>
                  <td className="p-2 text-green-400">5 - 100ms</td>
                  <td className="p-2">编辑范围</td>
                  <td className="p-2">精确匹配编辑范围</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">Shell 命令执行</td>
                  <td className="p-2 text-yellow-400">10ms - 120s</td>
                  <td className="p-2">命令复杂度</td>
                  <td className="p-2">设置合理超时</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="p-2">输出截断 + 保存</td>
                  <td className="p-2 text-yellow-400">5 - 500ms</td>
                  <td className="p-2">输出大小</td>
                  <td className="p-2">调整截断阈值</td>
                </tr>
                <tr>
                  <td className="p-2">MCP 工具调用</td>
                  <td className="p-2 text-yellow-400">50 - 5000ms</td>
                  <td className="p-2">网络延迟、服务器性能</td>
                  <td className="p-2">本地 MCP Server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 与其他模块的交互关系 */}
      <section className="bg-gradient-to-r from-purple-500/5 to-transparent rounded-xl p-6 border border-purple-500/20 mt-8">
        <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
          <span>🔗</span>
          与其他模块的交互关系
        </h3>

        <MermaidDiagram chart={`flowchart TB
    subgraph CLI["CLI Layer"]
        UI[UI Components]
        Approval[ToolApproval Component]
        useStream[useGeminiStream Hook]
    end

    subgraph Core["Core Layer"]
        GeminiChat[GeminiChat]
        Scheduler[CoreToolScheduler]
        ToolRegistry[Tool Registry]
        Config[CoreConfig]
    end

    subgraph Tools["Tool Layer"]
        BaseTool[BaseTool]
        ReadTool[ReadFileTool]
        EditTool[EditFileTool]
        BashTool[BashTool]
        McpTool[MCP Tool Wrapper]
    end

    subgraph External["External Systems"]
        FS[File System]
        Shell[Shell Process]
        McpServer[MCP Servers]
    end

    GeminiChat -->|"tool_calls"| Scheduler
    Scheduler -->|"shouldConfirmExecute"| Config
    Config -->|"ApprovalMode + allowedTools"| Scheduler
    Scheduler -->|"validate"| ToolRegistry
    ToolRegistry -->|"getToolByName"| BaseTool

    Scheduler -->|"status updates"| UI
    UI -->|"render"| Approval
    Approval -->|"user decision"| useStream
    useStream -->|"setToolCallOutcome"| Scheduler

    Scheduler -->|"execute"| ReadTool
    Scheduler -->|"execute"| EditTool
    Scheduler -->|"execute"| BashTool
    Scheduler -->|"execute"| McpTool

    ReadTool -->|"read"| FS
    EditTool -->|"write"| FS
    BashTool -->|"spawn"| Shell
    McpTool -->|"request"| McpServer

    style Scheduler fill:#22d3ee,color:#000
    style Config fill:#a855f7,color:#fff
    style GeminiChat fill:#22c55e,color:#000
    style McpServer fill:#f59e0b,color:#000`} title="CoreToolScheduler 依赖关系图" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* 上游依赖 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-purple-300 font-bold mb-3">上游依赖 (调用 Scheduler 的模块)</h4>
            <div className="space-y-3">
              <div className="border-l-2 border-cyan-500 pl-3">
                <h5 className="text-sm font-semibold text-cyan-300">GeminiChat</h5>
                <p className="text-xs text-gray-400">
                  主交互循环，解析 AI 响应中的 tool_calls，调用 schedule() 调度执行。
                </p>
                <code className="text-xs text-gray-500">packages/core/src/gemini-chat/gemini-chat.ts</code>
              </div>
              <div className="border-l-2 border-green-500 pl-3">
                <h5 className="text-sm font-semibold text-green-300">useGeminiStream Hook</h5>
                <p className="text-xs text-gray-400">
                  React 层状态管理，监听工具状态变化，触发 UI 更新。
                </p>
                <code className="text-xs text-gray-500">packages/cli/src/ui/hooks/useGeminiStream.ts</code>
              </div>
              <div className="border-l-2 border-yellow-500 pl-3">
                <h5 className="text-sm font-semibold text-yellow-300">ToolApproval Component</h5>
                <p className="text-xs text-gray-400">
                  UI 组件，显示确认对话框，收集用户决策后调用 setToolCallOutcome()。
                </p>
                <code className="text-xs text-gray-500">packages/cli/src/ui/ToolApproval.tsx</code>
              </div>
            </div>
          </div>

          {/* 下游依赖 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-purple-300 font-bold mb-3">下游依赖 (Scheduler 调用的模块)</h4>
            <div className="space-y-3">
              <div className="border-l-2 border-blue-500 pl-3">
                <h5 className="text-sm font-semibold text-blue-300">CoreConfig</h5>
                <p className="text-xs text-gray-400">
                  提供 ApprovalMode、allowedTools 等配置，决定确认策略。
                </p>
                <code className="text-xs text-gray-500">packages/core/src/config/core-config.ts</code>
              </div>
              <div className="border-l-2 border-orange-500 pl-3">
                <h5 className="text-sm font-semibold text-orange-300">Tool Registry</h5>
                <p className="text-xs text-gray-400">
                  工具注册表，通过名称查找工具实例，验证参数 schema。
                </p>
                <code className="text-xs text-gray-500">packages/core/src/tools/registry.ts</code>
              </div>
              <div className="border-l-2 border-red-500 pl-3">
                <h5 className="text-sm font-semibold text-red-300">具体工具实现</h5>
                <p className="text-xs text-gray-400">
                  ReadFileTool、EditFileTool、BashTool 等，执行实际操作。
                </p>
                <code className="text-xs text-gray-500">packages/core/src/tools/</code>
              </div>
              <div className="border-l-2 border-purple-500 pl-3">
                <h5 className="text-sm font-semibold text-purple-300">MCP Client</h5>
                <p className="text-xs text-gray-400">
                  MCP 协议客户端，与外部 MCP Server 通信。
                </p>
                <code className="text-xs text-gray-500">packages/core/src/mcp/client.ts</code>
              </div>
            </div>
          </div>
        </div>

        {/* 数据流图 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-purple-300 font-bold mb-3">核心数据流</h4>
          <MermaidDiagram chart={`sequenceDiagram
    participant AI as AI Model
    participant Chat as GeminiChat
    participant Scheduler as CoreToolScheduler
    participant Config as CoreConfig
    participant Tool as Tool Instance
    participant UI as ToolApproval UI

    AI->>Chat: Response with tool_calls
    Chat->>Scheduler: schedule(tool_calls, signal)

    loop For each tool_call
        Scheduler->>Scheduler: validateParams()
        Scheduler->>Scheduler: buildInvocation()
        Scheduler->>Tool: shouldConfirmExecute()
        Tool-->>Scheduler: ConfirmationDetails | null

        alt No confirmation needed
            Scheduler->>Scheduler: setStatus('scheduled')
        else Confirmation needed
            Scheduler->>Policy: PolicyEngine.check()
            Policy-->>Scheduler: ALLOW | DENY | ASK_USER

            alt PolicyDecision.ALLOW
                Scheduler->>Scheduler: setStatus('scheduled')
            else PolicyDecision.DENY
                Scheduler->>Scheduler: setStatus('error')
                Scheduler-->>Chat: Policy denied
            else PolicyDecision.ASK_USER + YOLO
                Scheduler->>Scheduler: setStatus('scheduled')
            else Need user approval
                Scheduler->>UI: setStatus('awaiting_approval')
                UI-->>Scheduler: User decision
                Scheduler->>Scheduler: setStatus('scheduled')
            end
        end
    end

    loop Execute scheduled tools
        Scheduler->>Tool: execute(params, signal)
        Tool-->>Scheduler: Result
        Scheduler->>Scheduler: truncateIfNeeded()
        Scheduler->>Scheduler: convertToFunctionResponse()
    end

    Scheduler->>Scheduler: checkAndNotifyCompletion()
    Scheduler-->>Chat: CompletedToolCall[]
    Chat-->>AI: FunctionResponse[]`} title="工具调度完整数据流" />
        </div>

        {/* 关键接口 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-purple-300 font-bold mb-3">关键接口定义</h4>
          <CodeBlock
            code={`// CoreToolScheduler 的核心公开接口
interface CoreToolScheduler {
  // 调度工具执行（主入口）
  schedule(
    request: ToolCallRequestInfo | ToolCallRequestInfo[],
    signal: AbortSignal,
  ): Promise<void>;

  // 获取当前所有工具调用状态
  getToolCalls(): ToolCall[];

  // 设置用户确认决策
  setToolCallOutcome(
    callId: string,
    outcome: ToolConfirmationOutcome,
  ): void;

  // 检查是否有工具正在执行
  isRunning(): boolean;

  // 注册工具调用完成回调
  onAllToolCallsComplete?: (
    calls: CompletedToolCall[],
  ) => Promise<void>;
}

// 工具确认决策枚举
enum ToolConfirmationOutcome {
  Proceed = 'proceed',           // 本次通过
  ProceedAlways = 'proceedAlways', // 始终通过
  Reject = 'reject',             // 拒绝
  Cancel = 'cancel',             // 取消
}

// 工具调用请求信息
interface ToolCallRequestInfo {
  callId: string;                 // 唯一调用 ID
  name: string;                   // 工具名称
  args: Record<string, unknown>;  // 工具参数
}`}
            language="typescript"
            title="CoreToolScheduler 公开接口"
          />
        </div>
      </section>

      {/* 设计演进与未来方向 */}
      <section className="bg-gradient-to-r from-indigo-500/5 to-transparent rounded-xl p-6 border border-indigo-500/20 mt-8">
        <h3 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
          <span>🔮</span>
          设计演进与未来方向
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-indigo-300 font-bold mb-3">当前限制</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><strong>串行执行：</strong>多个独立工具无法并行执行</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><strong>工具名不一致：</strong>Core 层与 CLI 层的工具名定义有差异</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><strong>MCP Kind 推断：</strong>依赖 MCP Server 的 annotations，缺少统一标准</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span><strong>白名单前缀匹配：</strong>存在安全漏洞风险</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-indigo-300 font-bold mb-3">潜在改进方向</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>并行执行：</strong>识别无依赖的只读工具，支持并行执行</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>智能批准：</strong>基于历史行为学习，自动调整批准策略</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>正则白名单：</strong>支持正则表达式匹配，提升安全性</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span><strong>工具链优化：</strong>识别常见工具链模式，一次性批准</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
