import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';

/**
 * Turn 状态机深度解析
 *
 * Turn 是 Qwen CLI 的核心概念，代表一次完整的 AI 响应周期。
 * 本页面深入解释 Turn 的设计哲学、状态流转和错误处理。
 *
 * 源码位置: packages/core/src/core/turn.ts
 */

// ===== Introduction Component =====
function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <span className="text-xl font-bold text-gray-100">
            Turn 状态机导读
          </span>
        </div>
        <span
          className={`transform transition-transform text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="text-purple-400 font-bold mb-2">
              🎯 什么是 Turn？
            </h4>
            <p className="text-gray-300 text-sm">
              Turn（轮次）是 Qwen CLI 的<strong>核心抽象单元</strong>，
              代表从用户发送消息到 AI 完成响应的<strong>一个完整周期</strong>。
              它封装了流式响应接收、工具调用请求、错误处理等复杂逻辑。
              可以理解为：<strong>一次"用户问 → AI 答"的完整交互</strong>。
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="text-blue-400 font-bold mb-2">
              🤔 为什么需要 Turn 抽象？
            </h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                • <strong>隔离复杂性</strong>：将流式响应处理、工具调用、
                  错误恢复等逻辑封装在一个清晰的边界内
              </li>
              <li>
                • <strong>支持多轮工具调用</strong>：AI 可能需要调用多个工具
                  才能完成一次响应，Turn 管理这些 pending 状态
              </li>
              <li>
                • <strong>事件驱动</strong>：通过 AsyncGenerator 产出事件，
                  让上层可以响应式地处理 UI 更新
              </li>
              <li>
                • <strong>可取消性</strong>：支持用户随时取消，
                  通过 AbortSignal 优雅地终止
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="text-green-400 font-bold mb-2">📊 关键数字</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">14</div>
                <div className="text-xs text-gray-500">事件类型</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">100</div>
                <div className="text-xs text-gray-500">最大轮次</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">5</div>
                <div className="text-xs text-gray-500">压缩状态</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400">∞</div>
                <div className="text-xs text-gray-500">工具调用数</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Event Types Visualization =====
function EventTypesSection() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const events = [
    {
      type: 'Content',
      icon: '📝',
      color: 'green',
      description: 'AI 生成的文本内容片段',
      when: '每当 AI 产出文本时',
      example: '{ type: "content", value: "让我帮你分析..." }',
    },
    {
      type: 'ToolCallRequest',
      icon: '🔧',
      color: 'blue',
      description: 'AI 请求调用某个工具',
      when: 'AI 决定需要执行工具时',
      example: '{ type: "tool_call_request", value: { name: "Read", args: {...} } }',
    },
    {
      type: 'ToolCallResponse',
      icon: '📥',
      color: 'cyan',
      description: '工具执行完成后的结果',
      when: '工具执行结束时',
      example: '{ type: "tool_call_response", value: { result: "file content..." } }',
    },
    {
      type: 'ToolCallConfirmation',
      icon: '✋',
      color: 'amber',
      description: '需要用户确认才能执行的工具',
      when: '危险操作需要审批时',
      example: '{ type: "tool_call_confirmation", value: { details: {...} } }',
    },
    {
      type: 'Thought',
      icon: '💭',
      color: 'purple',
      description: 'AI 的思考过程（Thinking Mode）',
      when: '启用思考模式时',
      example: '{ type: "thought", value: { summary: "正在分析..." } }',
    },
    {
      type: 'Error',
      icon: '❌',
      color: 'red',
      description: 'API 调用或处理过程中的错误',
      when: '发生可恢复/不可恢复错误时',
      example: '{ type: "error", value: { message: "Rate limit exceeded" } }',
    },
    {
      type: 'Finished',
      icon: '🏁',
      color: 'gray',
      description: 'AI 响应完成',
      when: 'finishReason 不为空时',
      example: '{ type: "finished", value: { reason: "STOP", usageMetadata: {...} } }',
    },
    {
      type: 'ChatCompressed',
      icon: '📦',
      color: 'orange',
      description: '对话历史被压缩',
      when: 'Token 数超过阈值时',
      example: '{ type: "chat_compressed", value: { originalTokenCount: 50000, newTokenCount: 15000 } }',
    },
    {
      type: 'LoopDetected',
      icon: '🔁',
      color: 'pink',
      description: '检测到 AI 陷入循环',
      when: '重复模式超过阈值时',
      example: '{ type: "loop_detected" }',
    },
    {
      type: 'UserCancelled',
      icon: '🛑',
      color: 'gray',
      description: '用户取消了请求',
      when: 'AbortSignal 触发时',
      example: '{ type: "user_cancelled" }',
    },
    {
      type: 'Retry',
      icon: '🔄',
      color: 'yellow',
      description: 'API 调用正在重试',
      when: '遇到临时错误需要重试时',
      example: '{ type: "retry" }',
    },
    {
      type: 'Citation',
      icon: '📚',
      color: 'teal',
      description: 'AI 引用的来源',
      when: '响应包含引用信息时',
      example: '{ type: "citation", value: "Citations:\\n(Title) https://..." }',
    },
    {
      type: 'MaxSessionTurns',
      icon: '⏰',
      color: 'red',
      description: '达到会话最大轮次限制',
      when: 'sessionTurnCount > maxSessionTurns 时',
      example: '{ type: "max_session_turns" }',
    },
    {
      type: 'SessionTokenLimitExceeded',
      icon: '📈',
      color: 'red',
      description: '超过会话 Token 限制',
      when: 'totalTokens > sessionTokenLimit 时',
      example: '{ type: "session_token_limit_exceeded", value: { currentTokens: 150000, limit: 100000 } }',
    },
  ];

  const colorMap: Record<string, string> = {
    green: 'bg-green-500/20 border-green-500 text-green-400',
    blue: 'bg-blue-500/20 border-blue-500 text-blue-400',
    cyan: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    amber: 'bg-amber-500/20 border-amber-500 text-amber-400',
    purple: 'bg-purple-500/20 border-purple-500 text-purple-400',
    red: 'bg-red-500/20 border-red-500 text-red-400',
    gray: 'bg-gray-500/20 border-gray-500 text-gray-400',
    orange: 'bg-orange-500/20 border-orange-500 text-orange-400',
    pink: 'bg-pink-500/20 border-pink-500 text-pink-400',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    teal: 'bg-teal-500/20 border-teal-500 text-teal-400',
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span>📡</span> GeminiEventType 事件类型
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {events.map((event) => (
          <button
            key={event.type}
            onClick={() => setSelectedEvent(selectedEvent === event.type ? null : event.type)}
            className={`p-2 rounded-lg border transition-all ${
              selectedEvent === event.type
                ? colorMap[event.color]
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-xl mb-1">{event.icon}</div>
            <div className="text-xs font-mono truncate">{event.type}</div>
          </button>
        ))}
      </div>

      {selectedEvent && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          {events
            .filter((e) => e.type === selectedEvent)
            .map((event) => (
              <div key={event.type}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="text-lg font-bold text-gray-100">
                    {event.type}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{event.description}</p>
                <div className="text-sm text-gray-400 mb-2">
                  <strong>触发时机：</strong>{event.when}
                </div>
                <div className="bg-gray-900 rounded p-2 font-mono text-xs text-gray-300">
                  {event.example}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ===== State Machine Visualization =====
function StateMachineVisualization() {
  const [currentState, setCurrentState] = useState<string>('idle');

  const states = [
    { id: 'idle', label: '空闲', icon: '⏸️', color: 'gray' },
    { id: 'streaming', label: '流式接收', icon: '📥', color: 'blue' },
    { id: 'tool_pending', label: '工具待执行', icon: '🔧', color: 'amber' },
    { id: 'tool_confirming', label: '等待确认', icon: '✋', color: 'orange' },
    { id: 'tool_executing', label: '工具执行中', icon: '⚙️', color: 'cyan' },
    { id: 'completed', label: '完成', icon: '✅', color: 'green' },
    { id: 'error', label: '错误', icon: '❌', color: 'red' },
    { id: 'cancelled', label: '已取消', icon: '🛑', color: 'gray' },
  ];

  const transitions = [
    { from: 'idle', to: 'streaming', label: 'sendMessageStream()' },
    { from: 'streaming', to: 'streaming', label: 'Content/Thought 事件' },
    { from: 'streaming', to: 'tool_pending', label: 'ToolCallRequest 事件' },
    { from: 'tool_pending', to: 'tool_confirming', label: 'shouldConfirmExecute() = true' },
    { from: 'tool_pending', to: 'tool_executing', label: 'shouldConfirmExecute() = false' },
    { from: 'tool_confirming', to: 'tool_executing', label: '用户确认' },
    { from: 'tool_confirming', to: 'cancelled', label: '用户拒绝' },
    { from: 'tool_executing', to: 'streaming', label: 'ToolCallResponse 事件' },
    { from: 'streaming', to: 'completed', label: 'Finished 事件' },
    { from: 'streaming', to: 'error', label: 'Error 事件' },
    { from: 'streaming', to: 'cancelled', label: 'UserCancelled 事件' },
  ];

  const colorMap: Record<string, string> = {
    gray: 'bg-gray-600',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span>🔄</span> Turn 状态流转图
      </h2>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {states.map((state) => (
            <button
              key={state.id}
              onClick={() => setCurrentState(state.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                currentState === state.id
                  ? `${colorMap[state.color]} text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{state.icon}</span>
              <span className="text-sm">{state.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            从 "{states.find((s) => s.id === currentState)?.label}" 可转换到：
          </h4>
          <div className="space-y-2">
            {transitions
              .filter((t) => t.from === currentState)
              .map((t, idx) => {
                const toState = states.find((s) => s.id === t.to);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-gray-500">→</span>
                    <span className={`${colorMap[toState?.color || 'gray']} px-2 py-1 rounded text-white text-xs`}>
                      {toState?.icon} {toState?.label}
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      ({t.label})
                    </span>
                  </div>
                );
              })}
            {transitions.filter((t) => t.from === currentState).length === 0 && (
              <div className="text-gray-500 text-sm">终态，无后续转换</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Design Rationale Section =====
function DesignRationaleSection() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span>🎨</span> 设计考量
      </h2>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/50">
          <h3 className="text-purple-400 font-bold mb-2">
            为什么使用 AsyncGenerator？
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            Turn.run() 返回 AsyncGenerator{'<'}ServerGeminiStreamEvent{'>'}, 这是一个精心设计的选择：
          </p>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              • <strong>背压控制</strong>：消费者可以按自己的速度处理事件，
                不会因为 AI 生成太快而丢失数据
            </li>
            <li>
              • <strong>懒执行</strong>：只有在消费者请求下一个事件时才会处理，
                节省资源
            </li>
            <li>
              • <strong>组合性</strong>：可以轻松地将多个 Turn 组合成更复杂的流程
            </li>
            <li>
              • <strong>取消支持</strong>：配合 AbortSignal，可以随时终止生成
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg p-4 border border-green-700/50">
          <h3 className="text-green-400 font-bold mb-2">
            为什么 pendingToolCalls 是数组？
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            AI 可能在单次响应中请求多个工具调用（并行工具调用）：
          </p>
          <CodeBlock
            code={`// AI 可能同时请求读取多个文件
{
  "functionCalls": [
    { "name": "Read", "args": { "file_path": "src/main.ts" } },
    { "name": "Read", "args": { "file_path": "package.json" } },
    { "name": "Glob", "args": { "pattern": "**/*.test.ts" } }
  ]
}`}
            language="json"
          />
          <p className="text-gray-400 text-sm mt-2">
            pendingToolCalls 数组存储所有待执行的工具调用，上层（GeminiClient）
            可以决定是串行执行还是并行执行。
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-4 border border-amber-700/50">
          <h3 className="text-amber-400 font-bold mb-2">
            为什么区分 finishReason？
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            FinishReason 告诉我们 AI 为什么停止生成：
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-900 rounded p-2">
              <div className="text-green-400 font-mono">STOP</div>
              <div className="text-gray-400">正常完成</div>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <div className="text-blue-400 font-mono">MAX_TOKENS</div>
              <div className="text-gray-400">达到输出限制</div>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <div className="text-amber-400 font-mono">SAFETY</div>
              <div className="text-gray-400">安全过滤</div>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <div className="text-purple-400 font-mono">RECITATION</div>
              <div className="text-gray-400">版权保护</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-lg p-4 border border-red-700/50">
          <h3 className="text-red-400 font-bold mb-2">
            错误处理策略
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            Turn 内的错误处理遵循"优雅降级"原则：
          </p>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>
              <strong>检查取消</strong>：如果 signal.aborted，直接 yield UserCancelled
            </li>
            <li>
              <strong>转换错误</strong>：调用 toFriendlyError() 将技术错误转为用户友好消息
            </li>
            <li>
              <strong>报告错误</strong>：调用 reportError() 记录完整上下文供调试
            </li>
            <li>
              <strong>抛出 UnauthorizedError</strong>：认证错误需要上层特殊处理
            </li>
            <li>
              <strong>产出 Error 事件</strong>：其他错误包装成事件让上层决定如何处理
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ===== Core Code Section =====
function CoreCodeSection() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span>💻</span> 核心代码解析
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-gray-200 font-medium mb-2">Turn 类结构</h3>
          <CodeBlock
            code={`export class Turn {
  // 待执行的工具调用队列
  readonly pendingToolCalls: ToolCallRequestInfo[] = [];

  // 调试用：保存所有原始响应
  private debugResponses: GenerateContentResponse[] = [];

  // 待收集的引用（批量输出）
  private pendingCitations = new Set<string>();

  // 响应完成的原因
  finishReason: FinishReason | undefined = undefined;

  // 当前响应 ID（用于工具调用关联）
  private currentResponseId?: string;

  constructor(
    private readonly chat: GeminiChat,  // 聊天实例
    private readonly prompt_id: string,  // 当前提示 ID
  ) {}
}`}
            language="typescript"
          />
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-gray-200 font-medium mb-2">run() 方法核心逻辑</h3>
          <CodeBlock
            code={`async *run(
  model: string,
  req: PartListUnion,
  signal: AbortSignal,
): AsyncGenerator<ServerGeminiStreamEvent> {
  try {
    const responseStream = await this.chat.sendMessageStream(
      model,
      { message: req, config: { abortSignal: signal } },
      this.prompt_id,
    );

    for await (const streamEvent of responseStream) {
      // 1. 检查取消
      if (signal?.aborted) {
        yield { type: GeminiEventType.UserCancelled };
        return;
      }

      // 2. 处理重试事件
      if (streamEvent.type === 'retry') {
        yield { type: GeminiEventType.Retry };
        continue;
      }

      const resp = streamEvent.value as GenerateContentResponse;

      // 3. 处理思考内容
      const thoughtPart = resp.candidates?.[0]?.content?.parts?.[0];
      if (thoughtPart?.thought) {
        yield { type: GeminiEventType.Thought, value: parseThought(...) };
        continue;
      }

      // 4. 处理文本内容
      const text = getResponseText(resp);
      if (text) {
        yield { type: GeminiEventType.Content, value: text };
      }

      // 5. 处理工具调用
      for (const fnCall of resp.functionCalls ?? []) {
        const event = this.handlePendingFunctionCall(fnCall);
        if (event) yield event;
      }

      // 6. 收集引用
      for (const citation of getCitations(resp)) {
        this.pendingCitations.add(citation);
      }

      // 7. 检查完成
      const finishReason = resp.candidates?.[0]?.finishReason;
      if (finishReason) {
        this.finishReason = finishReason;
        yield {
          type: GeminiEventType.Finished,
          value: { reason: finishReason, usageMetadata: resp.usageMetadata },
        };
      }
    }
  } catch (e) {
    // 错误处理逻辑...
  }
}`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}

// ===== Compression Status Section =====
function CompressionStatusSection() {
  const statuses = [
    {
      status: 'COMPRESSED',
      value: 1,
      icon: '✅',
      color: 'green',
      description: '压缩成功，历史已被摘要替换',
    },
    {
      status: 'COMPRESSION_FAILED_INFLATED_TOKEN_COUNT',
      value: 2,
      icon: '📈',
      color: 'red',
      description: '压缩后 Token 数反而增加了（摘要太长）',
    },
    {
      status: 'COMPRESSION_FAILED_TOKEN_COUNT_ERROR',
      value: 3,
      icon: '❌',
      color: 'red',
      description: 'Token 计数过程出错',
    },
    {
      status: 'COMPRESSION_FAILED_EMPTY_SUMMARY',
      value: 4,
      icon: '🈳',
      color: 'amber',
      description: 'AI 返回了空摘要',
    },
    {
      status: 'NOOP',
      value: 5,
      icon: '⏭️',
      color: 'gray',
      description: '不需要压缩（Token 数未超阈值）',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span>📦</span> CompressionStatus 压缩状态
      </h2>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-300 text-sm mb-4">
          当对话历史 Token 数超过模型上下文窗口的 70% 时，系统会尝试压缩。
          ChatCompressionInfo 记录压缩结果：
        </p>

        <div className="space-y-2">
          {statuses.map((s) => (
            <div
              key={s.status}
              className="flex items-center gap-3 bg-gray-900 rounded-lg p-3"
            >
              <span className="text-xl">{s.icon}</span>
              <div className="flex-1">
                <div className="font-mono text-sm text-gray-200">{s.status}</div>
                <div className="text-xs text-gray-400">{s.description}</div>
              </div>
              <div className="text-xs text-gray-500">value: {s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 关联页面配置
const turnRelatedPages = [
  { id: 'gemini-chat', label: '🔄 GeminiChat 核心循环' },
  { id: 'lifecycle', label: '🔁 请求生命周期' },
  { id: 'tool-scheduler', label: '🔧 工具调度详解' },
  { id: 'context-compression-anim', label: '📦 上下文压缩动画' },
  { id: 'turn-internal-anim', label: '🎬 Turn 状态流转动画' },
  { id: 'loop-detect', label: '🔁 循环检测' },
];

// ===== Main Component =====
export function TurnStateMachine() {
  const [introExpanded, setIntroExpanded] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          🔄 Turn 状态机深度解析
        </h1>
        <p className="text-gray-400">
          理解 Qwen CLI 的核心抽象单元：一次完整的 AI 响应周期
        </p>
        <div className="mt-2 text-xs text-gray-500 font-mono">
          源码: packages/core/src/core/turn.ts
        </div>
      </div>

      <Introduction isExpanded={introExpanded} onToggle={() => setIntroExpanded(!introExpanded)} />
      <EventTypesSection />
      <StateMachineVisualization />
      <DesignRationaleSection />
      <CompressionStatusSection />
      <CoreCodeSection />
      <RelatedPages title="🔗 相关页面" pages={turnRelatedPages} />
    </div>
  );
}

export default TurnStateMachine;
