import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function ToolSchedulerDetails() {
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
    is_plan_mode{Plan Mode<br/>+ 修改类工具?}
    is_yolo{YOLO 模式<br/>或白名单?}
    plan_blocked([返回 Plan Mode<br/>系统提示])
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
    should_confirm --> is_plan_mode
    is_plan_mode -->|Yes| plan_blocked
    is_plan_mode -->|No| is_yolo
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
    style plan_blocked fill:#ef4444,color:#fff
    style auto_approve fill:#22c55e,color:#000
    style await_approval fill:#f59e0b,color:#000
    style success_response fill:#22c55e,color:#000
    style error_response fill:#ef4444,color:#fff
    style is_plan_mode fill:#a855f7,color:#fff
    style is_yolo fill:#a855f7,color:#fff
    style is_running fill:#a855f7,color:#fff
    style validation_error fill:#a855f7,color:#fff
    style truncate fill:#a855f7,color:#fff`;

  // 确认决策逻辑详细流程
  const confirmationDecisionChart = `flowchart TD
    start([shouldConfirmExecute])
    check_kind[检查工具 Kind]
    is_read_kind{Kind 是<br/>Read/Search/Fetch?}
    check_approval_mode[检查 ApprovalMode]
    is_plan{ApprovalMode<br/>是 PLAN?}
    is_yolo{ApprovalMode<br/>是 YOLO?}
    is_auto_edit{ApprovalMode<br/>是 AUTO_EDIT?}
    is_edit_kind{Kind 是<br/>Edit/Write?}
    check_allowed_tools[检查 allowedTools]
    is_in_whitelist{工具在<br/>白名单中?}
    no_confirm([返回 null<br/>自动执行])
    need_confirm([返回 ConfirmationDetails<br/>需要确认])
    plan_block([阻断执行<br/>返回错误])

    start --> check_kind
    check_kind --> is_read_kind
    is_read_kind -->|Yes| no_confirm
    is_read_kind -->|No| check_approval_mode
    check_approval_mode --> is_plan
    is_plan -->|Yes + exit_plan_mode| no_confirm
    is_plan -->|Yes + 其他工具| plan_block
    is_plan -->|No| is_yolo
    is_yolo -->|Yes| no_confirm
    is_yolo -->|No| is_auto_edit
    is_auto_edit -->|Yes| is_edit_kind
    is_auto_edit -->|No| check_allowed_tools
    is_edit_kind -->|Yes| no_confirm
    is_edit_kind -->|No| check_allowed_tools
    check_allowed_tools --> is_in_whitelist
    is_in_whitelist -->|Yes| no_confirm
    is_in_whitelist -->|No| need_confirm

    style start fill:#22d3ee,color:#000
    style no_confirm fill:#22c55e,color:#000
    style need_confirm fill:#f59e0b,color:#000
    style plan_block fill:#ef4444,color:#fff
    style is_read_kind fill:#a855f7,color:#fff
    style is_plan fill:#a855f7,color:#fff
    style is_yolo fill:#a855f7,color:#fff
    style is_auto_edit fill:#a855f7,color:#fff
    style is_edit_kind fill:#a855f7,color:#fff
    style is_in_whitelist fill:#a855f7,color:#fff`;

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

  const shouldConfirmCode = `// packages/core/src/core/coreToolScheduler.ts:740

// 确认决策的核心逻辑
const confirmationDetails = await invocation.shouldConfirmExecute(signal);

if (!confirmationDetails) {
  // 返回 null 表示不需要确认，自动批准
  this.setToolCallOutcome(
    reqInfo.callId,
    ToolConfirmationOutcome.ProceedAlways,
  );
  this.setStatusInternal(reqInfo.callId, 'scheduled');
  continue;
}

// 检查是否处于 Plan Mode
const allowedTools = this.config.getAllowedTools() || [];
const isPlanMode = this.config.getApprovalMode() === ApprovalMode.PLAN;
const isExitPlanModeTool = reqInfo.name === 'exit_plan_mode';

// Plan Mode 阻断逻辑
if (isPlanMode && !isExitPlanModeTool) {
  if (confirmationDetails) {
    // 返回 Plan Mode 系统提示，阻止执行
    this.setStatusInternal(reqInfo.callId, 'error', {
      callId: reqInfo.callId,
      responseParts: convertToFunctionResponse(
        reqInfo.name,
        reqInfo.callId,
        getPlanModeSystemReminder(),
      ),
      resultDisplay: 'Plan mode blocked a non-read-only tool call.',
      error: undefined,
      errorType: undefined,
    });
  } else {
    this.setStatusInternal(reqInfo.callId, 'scheduled');
  }
} else if (
  this.config.getApprovalMode() === ApprovalMode.YOLO ||
  doesToolInvocationMatch(toolCall.tool, invocation, allowedTools)
) {
  // YOLO 模式或工具在白名单中，自动批准
  this.setToolCallOutcome(
    reqInfo.callId,
    ToolConfirmationOutcome.ProceedAlways,
  );
  this.setStatusInternal(reqInfo.callId, 'scheduled');
} else {
  // 需要用户确认
  this.setStatusInternal(
    reqInfo.callId,
    'awaiting_approval',
    wrappedConfirmationDetails,
  );
}`;

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

  const toolCallStatusCode = `// packages/core/src/core/coreToolScheduler.ts:46-123

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
  liveOutput?: ToolResultDisplay; // 实时输出
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">自动批准条件</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <code className="text-cyan-300">Kind = Read/Search/Fetch</code> - 只读工具</li>
              <li>• <code className="text-cyan-300">ApprovalMode = YOLO</code> - YOLO 模式</li>
              <li>• <code className="text-cyan-300">ApprovalMode = AUTO_EDIT + Kind = Edit</code> - 自动编辑模式</li>
              <li>• <code className="text-cyan-300">工具在 allowedTools 白名单</code> - 白名单匹配</li>
              <li>• <code className="text-cyan-300">Plan Mode + exit_plan_mode</code> - 退出 Plan Mode</li>
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

      {/* Plan Mode 阻断机制 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Plan Mode 阻断机制</h3>
        <p className="text-gray-300 mb-4">
          Plan Mode 是一种特殊的安全模式，通过在调度器层面阻断修改类工具的执行，
          强制 AI 只进行分析和规划，不执行任何可能修改系统的操作。
        </p>

        <HighlightBox title="Plan Mode 阻断逻辑" variant="purple">
          <div className="text-sm space-y-2">
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">阻断条件</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• <code>ApprovalMode = PLAN</code></li>
                <li>• 工具的 <code>shouldConfirmExecute()</code> 返回非空（需要确认）</li>
                <li>• 工具名称不是 <code>exit_plan_mode</code></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-purple-300 mb-1">阻断行为</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• 将工具调用标记为 <code>error</code> 状态</li>
                <li>• 返回 <code>getPlanModeSystemReminder()</code> 系统提示</li>
                <li>• AI 收到提示后会停止使用修改类工具</li>
                <li>• 只有 <code>exit_plan_mode</code> 工具可以突破阻断</li>
              </ul>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          code={`// packages/core/src/core/coreToolScheduler.ts:752-772

// Plan Mode 阻断检查
const isPlanMode = this.config.getApprovalMode() === ApprovalMode.PLAN;
const isExitPlanModeTool = reqInfo.name === 'exit_plan_mode';

if (isPlanMode && !isExitPlanModeTool) {
  if (confirmationDetails) {
    // 阻断执行，返回 Plan Mode 提示
    this.setStatusInternal(reqInfo.callId, 'error', {
      callId: reqInfo.callId,
      responseParts: convertToFunctionResponse(
        reqInfo.name,
        reqInfo.callId,
        getPlanModeSystemReminder(), // <system-reminder> 注入
      ),
      resultDisplay: 'Plan mode blocked a non-read-only tool call.',
      error: undefined,
      errorType: undefined,
    });
  } else {
    // 只读工具可以正常执行
    this.setStatusInternal(reqInfo.callId, 'scheduled');
  }
}`}
          language="typescript"
          title="Plan Mode 阻断代码"
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
                <li>• 完整输出保存到 <code>.innies/tmp/&lt;callId&gt;.output</code></li>
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
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:625</code>
            <span className="text-gray-400">schedule() 主入口</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:740</code>
            <span className="text-gray-400">shouldConfirmExecute 确认逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:752</code>
            <span className="text-gray-400">Plan Mode 阻断机制</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:774</code>
            <span className="text-gray-400">YOLO 模式自动通过</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:162</code>
            <span className="text-gray-400">convertToFunctionResponse 结果转换</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/core/src/core/coreToolScheduler.ts:256</code>
            <span className="text-gray-400">truncateAndSaveToFile 输出截断</span>
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
    </div>
  );
}
