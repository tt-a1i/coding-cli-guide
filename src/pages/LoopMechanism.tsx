import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { ComparisonTable } from '../components/ComparisonTable';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

// ===== Introduction Component =====
function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Agentic Loop 机制详解
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              理解 CLI 如何持续工作直到任务完成
            </p>
          </div>
        </div>
        <span
          className={`text-[var(--text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--terminal-green)]">
                🎯 核心概念
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>Agentic Loop</strong>: AI 可以自主决定调用工具，循环执行直到任务完成
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>Turn</strong>: 一次完整的请求-响应周期，可能包含多个工具调用
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>finish_reason</strong>: AI 响应的终止原因，"stop" 表示完成
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>Next Speaker</strong>: 检查 AI 是否需要继续发言
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--amber)]">
                📂 核心文件
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/core/client.ts
                  </code>
                  <span>sendMessageStream 主循环</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/core/turn.ts
                  </code>
                  <span>Turn 状态管理</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/services/loopDetectionService.ts
                  </code>
                  <span>循环检测服务</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[var(--bg-terminal)] rounded-lg">
            <h4 className="text-sm font-semibold text-[var(--purple)] mb-2">
              💡 设计亮点
            </h4>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>
                Agentic Loop 是 CLI 实现自主任务执行的核心。AI 不仅能回答问题，还能主动调用工具、
                读取文件、执行命令，形成"思考-行动-观察"的循环，直到任务完成。
              </p>
              <p className="mt-2">
                循环具有多重安全机制：最大轮次限制（100轮）、Token 限制、循环检测、
                用户中断支持，确保不会陷入无限循环。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Loop Node Component =====
interface LoopNodeProps {
  icon: string;
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'warning';
}

function LoopNode({ icon, title, description, variant = 'default' }: LoopNodeProps) {
  const baseClass = variant === 'success'
    ? 'bg-green-500/20 border-green-500'
    : variant === 'warning'
      ? 'bg-amber-500/20 border-amber-500'
      : 'bg-cyan-400/10 border-cyan-400';

  return (
    <div
      className={`
        ${baseClass} border-2 rounded-xl p-5 text-center min-w-[150px]
        transition-all hover:scale-105
      `}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold mb-1">{title}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
  );
}

// ===== Related Pages =====
const relatedPages: RelatedPage[] = [
  { id: 'turn-state-machine', label: 'Turn 状态机', description: '深入理解 Turn 的生命周期' },
  { id: 'loop-detection-anim', label: '循环检测动画', description: '可视化循环检测过程' },
  { id: 'tool-scheduler-anim', label: '工具调度动画', description: '工具并行执行机制' },
  { id: 'streaming-response-processing', label: '流式响应处理', description: 'Chunk 解析与工具调用重组' },
  { id: 'token-management-strategy', label: 'Token 管理策略', description: '会话 Token 限制机制' },
  { id: 'e2e', label: '端到端流程', description: '完整请求处理链路' },
];

// ===== Main Component =====
export function LoopMechanism() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      <h2 className="text-2xl text-cyan-400 mb-5">
        为什么能持续工作？循环机制详解
      </h2>

      {/* 核心概念 */}
      <Layer title="核心概念" icon="💡">
        <HighlightBox title="关键理解" icon="🔑" variant="blue">
          <p className="text-lg">
            CLI 中有一个 <strong>while 循环</strong>，不断地：
            <br />
            请求 AI → 检查是否需要工具 → 执行工具 → 再请求 AI → ...
          </p>
          <p className="mt-2">
            直到 AI 的{' '}
            <code className="bg-black/30 px-1 rounded">finish_reason</code> 是
            "stop"（表示完成），循环才结束。
          </p>
        </HighlightBox>
      </Layer>

      {/* 循环流程图 - 增强版 */}
      <Layer title="循环流程图" icon="🔄">
        <div className="flex justify-center items-center gap-5 flex-wrap p-8 bg-black/20 rounded-xl my-5">
          <LoopNode icon="📤" title="发送请求" description="用户消息 + 工具定义" />
          <div className="text-3xl text-cyan-400">→</div>
          <LoopNode icon="🤖" title="AI 处理" description="生成 Turn 响应" />
          <div className="text-3xl text-cyan-400">→</div>
          <LoopNode icon="❓" title="检查响应" description="有 pendingToolCalls?" />
        </div>

        <div className="flex justify-center items-center gap-5 flex-wrap p-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-amber-400 font-bold">有工具调用</div>
            <div className="text-3xl text-amber-400">↓</div>
          </div>
          <LoopNode icon="🔧" title="执行工具" description="调度器并行执行" variant="warning" />
          <div className="text-3xl text-amber-400">→</div>
          <LoopNode icon="📝" title="收集结果" description="工具响应加入历史" variant="warning" />
          <div className="text-3xl text-cyan-400">↩️</div>
        </div>

        <div className="text-center my-5">
          <div className="text-lg text-gray-400 mb-4">无工具调用时检查 Next Speaker</div>
          <div className="flex justify-center gap-8">
            <LoopNode
              icon="🗣️"
              title="Model 继续"
              description="nextSpeaker = model"
              variant="warning"
            />
            <LoopNode
              icon="✅"
              title="完成"
              description='finish_reason = "stop"'
              variant="success"
            />
          </div>
        </div>
      </Layer>

      {/* 核心代码 - 更详细版本 */}
      <Layer title="核心代码解析" icon="📝">
        <CodeBlock
          title="packages/core/src/core/client.ts - sendMessageStream"
          language="typescript"
          code={`// GeminiClient.sendMessageStream() - 主循环核心逻辑

async *sendMessageStream(
  request: PartListUnion,
  signal: AbortSignal,
  prompt_id: string,
  turns: number = MAX_TURNS  // 默认最大 100 轮
): AsyncGenerator<ServerGeminiStreamEvent, Turn> {

  // 1. 递增会话轮次计数
  this.sessionTurnCount++;

  // 2. 检查最大轮次限制
  if (this.sessionTurnCount > this.config.get('maxSessionTurns')) {
    yield { type: GeminiEventType.MaxSessionTurns };
    return turn;
  }

  // 3. 尝试压缩历史（如果需要）
  const compressed = await this.tryCompressHistory();
  if (compressed) {
    yield { type: GeminiEventType.ChatCompressed };
  }

  // 4. 检查 Token 限制
  const tokenCount = await this.countSessionTokens();
  if (tokenCount > this.config.get('sessionTokenLimit')) {
    yield { type: GeminiEventType.SessionTokenLimitExceeded };
    return turn;
  }

  // 5. 循环检测（防止 AI 陷入重复行为）
  const loopDetected = await this.loopDetector.turnStarted(signal);
  if (loopDetected) {
    yield { type: GeminiEventType.LoopDetected };
    return turn;
  }

  // 6. 创建新的 Turn 并执行
  const turn = new Turn(this.getChat(), prompt_id);
  for await (const event of turn.run(model, request, signal)) {
    // 实时循环检测
    if (this.loopDetector.addAndCheck(event)) {
      yield { type: GeminiEventType.LoopDetected };
      return turn;
    }
    yield event;
  }

  // 7. 检查是否需要继续（没有待处理的工具调用时）
  if (turn.pendingToolCalls.length === 0 && !signal.aborted) {
    // Next Speaker 检查：AI 是否需要继续发言？
    const shouldContinue = await this.checkNextSpeaker();
    if (shouldContinue) {
      // 递归调用，继续对话
      yield* this.sendMessageStream(
        [{ text: '' }],  // 空消息触发继续
        signal,
        prompt_id,
        turns - 1
      );
    }
  }

  return turn;
}`}
        />
      </Layer>

      {/* Turn 内部处理 */}
      <Layer title="Turn 内部处理" icon="🎯">
        <p className="mb-4 text-gray-300">
          每个 Turn 代表一次完整的 AI 响应周期，内部包含多个事件类型：
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <h4 className="font-bold text-cyan-400 mb-2">📤 Content 事件</h4>
            <p className="text-sm text-gray-400">AI 输出的文本内容，流式传输给 UI</p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <h4 className="font-bold text-amber-400 mb-2">🔧 ToolCallRequest 事件</h4>
            <p className="text-sm text-gray-400">AI 请求调用工具，加入 pendingToolCalls</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="font-bold text-purple-400 mb-2">💭 Thought 事件</h4>
            <p className="text-sm text-gray-400">AI 的内部思考过程（如果模型支持）</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="font-bold text-green-400 mb-2">✅ Finished 事件</h4>
            <p className="text-sm text-gray-400">Turn 完成，包含 finishReason 和 usage</p>
          </div>
        </div>

        <CodeBlock
          title="packages/core/src/core/turn.ts - GeminiEventType"
          language="typescript"
          code={`// Turn 可以产生的事件类型
enum GeminiEventType {
  Content = 'content',                    // 文本内容
  ToolCallRequest = 'tool_call_request',  // 工具调用请求
  ToolCallResponse = 'tool_call_response',// 工具执行结果
  ToolCallConfirmation = 'tool_call_confirmation',
  UserCancelled = 'user_cancelled',       // 用户取消
  Error = 'error',                        // 错误
  ChatCompressed = 'chat_compressed',     // 历史被压缩
  Thought = 'thought',                    // AI 思考
  MaxSessionTurns = 'max_session_turns',  // 达到最大轮次
  SessionTokenLimitExceeded = 'session_token_limit_exceeded',
  Finished = 'finished',                  // 完成
  LoopDetected = 'loop_detected',         // 检测到循环
  Citation = 'citation',                  // 引用
  Retry = 'retry',                        // 重试
}`}
        />
      </Layer>

      {/* 多工具调用示例 */}
      <Layer title="复杂场景：多工具链式调用" icon="🔗">
        <p className="mb-4">
          用户请求："帮我在 src 目录下找所有 .ts 文件，然后统计总行数"
        </p>

        <ComparisonTable
          headers={['轮次', 'AI 决定', 'CLI 执行']}
          rows={[
            [
              '第 1 轮',
              <span key="1">
                调用 <code className="bg-black/30 px-1 rounded">Glob</code>{' '}
                工具，pattern: "src/**/*.ts"
              </span>,
              '返回文件列表：[src/a.ts, src/b.ts, ...]',
            ],
            [
              '第 2 轮',
              <span key="2">
                调用 <code className="bg-black/30 px-1 rounded">Bash</code>{' '}
                工具，command: "wc -l src/*.ts"
              </span>,
              '返回行数统计',
            ],
            [
              '第 3 轮',
              '生成最终回复："共找到 15 个文件，总计 2,345 行"',
              '显示给用户，finish_reason = "stop"',
            ],
          ]}
        />

        <HighlightBox title="AI 可以并行调用多个工具" icon="💡">
          <p>
            一次响应中可以包含多个{' '}
            <code className="bg-black/30 px-1 rounded">tool_calls</code>，
            工具调度器会并行执行它们，提高效率。
          </p>
        </HighlightBox>
      </Layer>

      {/* 循环检测机制 */}
      <Layer title="循环检测机制" icon="🔍">
        <p className="mb-4 text-gray-300">
          防止 AI 陷入无限循环的多重检测机制：
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-400 mb-2">1. 工具调用循环检测</h4>
            <p className="text-sm text-gray-400">
              同一工具以相同参数连续调用 5 次以上触发警告
            </p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-400 mb-2">2. 内容重复检测</h4>
            <p className="text-sm text-gray-400">
              相同内容连续出现 10 次以上触发警告
            </p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-400 mb-2">3. LLM 辅助检测</h4>
            <p className="text-sm text-gray-400">
              30 轮后使用 LLM 分析对话是否陷入认知循环
            </p>
          </div>
        </div>

        <CodeBlock
          title="packages/core/src/services/loopDetectionService.ts"
          language="typescript"
          code={`// 循环检测服务核心逻辑
class LoopDetectionService {
  private toolCallHistory: Map<string, number> = new Map();
  private contentHistory: string[] = [];

  addAndCheck(event: ServerGeminiStreamEvent): boolean {
    // 检查工具调用重复
    if (event.type === 'tool_call_request') {
      const key = \`\${event.value.name}:\${JSON.stringify(event.value.args)}\`;
      const count = (this.toolCallHistory.get(key) || 0) + 1;
      this.toolCallHistory.set(key, count);

      if (count >= 5) {
        return true;  // 检测到循环
      }
    }

    // 检查内容重复
    if (event.type === 'content') {
      this.contentHistory.push(event.value);
      const lastN = this.contentHistory.slice(-10);
      if (lastN.length === 10 && new Set(lastN).size === 1) {
        return true;  // 10 次相同内容
      }
    }

    return false;
  }
}`}
        />
      </Layer>

      {/* 最大轮次限制 */}
      <Layer title="安全机制：最大轮次限制" icon="🛡️">
        <CodeBlock
          language="typescript"
          code={`// packages/core/src/core/client.ts
const MAX_TURNS = 100;  // 单次对话最多 100 轮

// 为什么需要这个限制？
// 1. 防止 AI "陷入循环"，不断调用工具
// 2. 控制 API 调用成本
// 3. 防止意外的无限执行
// 4. 保护用户资源（CPU、内存、API 配额）

// 还有会话级别的限制
const maxSessionTurns = config.get('maxSessionTurns');  // 可配置`}
        />

        <p className="mt-4">
          如果 AI 连续调用工具 100 次还没完成，CLI 会强制停止并提示用户。
          用户也可以通过配置 <code className="bg-black/30 px-1 rounded">maxSessionTurns</code> 调整限制。
        </p>
      </Layer>

      {/* Next Speaker 机制 */}
      <Layer title="Next Speaker 机制" icon="🗣️">
        <p className="mb-4 text-gray-300">
          当 AI 完成一轮响应但没有工具调用时，需要决定谁是下一个发言者：
        </p>

        <CodeBlock
          title="Next Speaker 检查逻辑"
          language="typescript"
          code={`// 检查 AI 是否需要继续发言
async checkNextSpeaker(): Promise<boolean> {
  // 某些情况下 AI 需要继续发言
  // 例如：正在执行多步骤任务、需要确认用户意图等

  // 1. 检查上下文是否暗示需要继续
  const lastMessages = this.conversationHistory.slice(-3);

  // 2. 如果最后一条是工具响应，可能需要继续分析
  if (lastMessages.some(m => m.role === 'tool')) {
    return true;  // AI 应该继续解释工具结果
  }

  // 3. 检查 AI 响应是否以问题或未完成状态结束
  // ...

  return false;  // 等待用户输入
}`}
        />

        <HighlightBox title="递归调用" icon="⚡">
          <p>
            当 <code className="bg-black/30 px-1 rounded">checkNextSpeaker()</code> 返回 true 时，
            <code className="bg-black/30 px-1 rounded">sendMessageStream</code> 会递归调用自己，
            形成连续对话，直到 AI 完成所有分析。
          </p>
        </HighlightBox>
      </Layer>

      {/* 设计考虑 */}
      <Layer title="设计考虑" icon="🎨">
        <div className="space-y-4">
          <HighlightBox title="为什么使用 AsyncGenerator?" icon="❓" variant="blue">
            <p>
              <code className="bg-black/30 px-1 rounded">async *sendMessageStream</code> 是一个异步生成器，
              可以逐个 yield 事件，实现真正的流式处理。UI 可以实时显示 AI 响应，而不用等待完整响应。
            </p>
          </HighlightBox>

          <HighlightBox title="为什么 Turn 要独立?" icon="❓" variant="blue">
            <p>
              Turn 封装了一次响应的完整状态（pendingToolCalls、finishReason 等），
              使得状态管理清晰，便于调试和测试。每个 Turn 是独立的生命周期单元。
            </p>
          </HighlightBox>

          <HighlightBox title="为什么需要循环检测?" icon="❓" variant="blue">
            <p>
              AI 可能会陷入"认知循环"，不断尝试相同的操作。循环检测服务使用多种策略
              （工具调用重复、内容重复、LLM 分析）来识别和中断这种情况。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
