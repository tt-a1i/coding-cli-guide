import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              用户输入 → AI 流式响应 → 收集工具调用 → 执行工具 → Continuation 循环，直到无工具调用时结束
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">13</div>
              <div className="text-xs text-[var(--text-muted)]">事件类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">100</div>
              <div className="text-xs text-[var(--text-muted)]">最大轮次</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">重试次数</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">10</div>
              <div className="text-xs text-[var(--text-muted)]">IDE 最大文件</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">核心循环</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                用户输入
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                submitQuery
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                流式响应
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                工具调度
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">
                Continuation
              </span>
              <span className="text-[var(--text-muted)]">↻</span>
            </div>
          </div>

          {/* 关键洞察 */}
          <div className="bg-[var(--amber)]/10 rounded-lg p-3 border border-[var(--amber)]/30">
            <h4 className="text-sm font-semibold text-[var(--amber)] mb-1">💡 核心机制：Continuation</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              工具执行结果被转换为 <code className="text-[var(--cyber-blue)]">functionResponse</code>，
              作为下一条消息重新进入 submitQuery，创造"单次请求即可使用工具"的错觉
            </p>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/ui/hooks/useGeminiStream.ts:786 → submitQuery()
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function InteractionLoop() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  // 主循环流程图
  const mainLoopFlowChart = `flowchart TD
    start([用户输入<br/>TextInput])
    submit[submitQuery<br/>入口]
    collect[收集上下文<br/>IDE/Memory/Files]
    prepare[准备请求<br/>System Prompt]
    stream_start[发起流式请求<br/>sendMessageStream]
    process_events[处理流事件<br/>Content/ToolCall/Thought]
    finished{流结束?}
    has_tools{有工具<br/>调用?}
    schedule[工具调度<br/>CoreToolScheduler]
    execute[并行执行<br/>工具]
    convert[转换为<br/>functionResponse]
    continuation[Continuation<br/>重新进入submitQuery]
    complete([对话完成<br/>等待输入])

    start --> submit
    submit --> collect
    collect --> prepare
    prepare --> stream_start
    stream_start --> process_events
    process_events --> finished
    finished -->|No| process_events
    finished -->|Yes| has_tools
    has_tools -->|Yes| schedule
    has_tools -->|No| complete
    schedule --> execute
    execute --> convert
    convert --> continuation
    continuation --> collect

    style start fill:#00ff41,color:#000
    style complete fill:#00ff41,color:#000
    style has_tools fill:#a855f7,color:#fff
    style finished fill:#a855f7,color:#fff
    style continuation fill:#f59e0b,color:#000`;

  // Stream事件处理流程
  const streamEventsChart = `flowchart LR
    api[API Stream]
    content[Content Event]
    tool[ToolCallRequest Event]
    thought[Thought Event]
    finished[Finished Event]
    error[Error Event]
    token[TokenUsage Event]

    ui_update[UI显示更新]
    queue[工具请求队列]
    log[记录思考过程]
    trigger[触发工具调度]
    retry[重试或显示错误]
    counter[更新Token计数]

    api --> content
    api --> tool
    api --> thought
    api --> finished
    api --> error
    api --> token

    content --> ui_update
    tool --> queue
    thought --> log
    finished --> trigger
    error --> retry
    token --> counter

    style api fill:#00d4ff,color:#000
    style trigger fill:#00ff41,color:#000
    style retry fill:#ef4444,color:#fff`;

  // Continuation机制流程
  const continuationChart = `sequenceDiagram
    participant User as 用户/AI
    participant Submit as submitQuery
    participant API as Gemini API
    participant Tools as 工具执行
    participant Sched as CoreToolScheduler

    Note over User,Sched: Turn 1: 用户输入

    User->>Submit: "读取 package.json"
    Submit->>API: 发送消息流
    API-->>Submit: Content chunks
    API-->>Submit: ToolCallRequest (Read)
    API-->>Submit: Finished

    Submit->>Sched: 调度工具
    Sched->>Tools: 执行 Read
    Tools-->>Sched: 文件内容

    Note over User,Sched: Turn 2: Continuation

    Sched->>Submit: functionResponse (isContinuation=true)
    Submit->>API: 发送工具结果
    API-->>Submit: Content (分析结果)
    API-->>Submit: Finished (无工具)

    Submit-->>User: 对话完成`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-mono text-[var(--terminal-green)]">交互主循环</h2>
        <p className="text-[var(--text-secondary)] mt-2 font-mono">
          // 用户输入 → AI 思考 → 工具执行 → 继续循环的核心流程
        </p>
      </div>

      {/* 1. 目标 */}
      <Layer title="目标" icon="🎯">
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            交互主循环（Interactive Main Loop）是 CLI 的核心机制，负责协调用户输入、AI 响应和工具执行的完整流程。
            它通过流式 API 和 Continuation 机制创造出流畅的对话体验。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="流式响应" icon="⚡" variant="blue">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 实时显示 AI 思考过程</div>
                <div>• 渐进式内容呈现</div>
                <div>• 收集工具调用请求</div>
              </div>
            </HighlightBox>

            <HighlightBox title="工具集成" icon="🔧" variant="green">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 自动调度和验证</div>
                <div>• 并行执行优化</div>
                <div>• 结果转换和反馈</div>
              </div>
            </HighlightBox>

            <HighlightBox title="循环迭代" icon="🔄" variant="purple">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• Continuation 机制</div>
                <div>• 多轮对话支持</div>
                <div>• 上下文保持</div>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 2. 输入 */}
      <Layer title="输入" icon="📥">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono">触发条件</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="初始触发" icon="1️⃣" variant="blue">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 用户在 TextInput 中按 Enter</div>
                <div>• 用户消息 (Part[])</div>
                <div>• 可选的文件 @ 引用</div>
                <div>• 剪贴板内容</div>
              </div>
            </HighlightBox>

            <HighlightBox title="Continuation 触发" icon="2️⃣" variant="green">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 工具执行完成后</div>
                <div>• functionResponse Parts</div>
                <div>• isContinuation: true</div>
                <div>• 相同的 prompt_id</div>
              </div>
            </HighlightBox>
          </div>

          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mt-6">上下文收集</h4>
          <CodeBlock
            title="useGeminiStream.ts:786 - 上下文收集"
            code={`// 收集 IDE 上下文增量
const ideContextDelta = await getIdeContextDelta();

// IDE 上下文包含:
// - 当前打开的文件 (最多 10 个)
// - 每个文件最多 16KB 内容
// - 文件变化增量 (避免重复发送)

// 准备完整请求
const request = await prepareRequest(userParts, ideContextDelta);
// - 添加系统提示 (CLAUDE.md, .qwen/instructions.md)
// - 注入历史消息
// - Token 计数与截断
// - 上下文窗口管理`}
          />
        </div>
      </Layer>

      {/* 3. 输出 */}
      <Layer title="输出" icon="📤">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono">产出物</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="UI 显示" icon="💬" variant="blue">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 流式文本内容</div>
                <div>• 思考过程标记</div>
                <div>• 工具调用卡片</div>
                <div>• 错误提示</div>
              </div>
            </HighlightBox>

            <HighlightBox title="状态变化" icon="📊" variant="green">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 对话历史更新</div>
                <div>• Token 计数累积</div>
                <div>• 工具调用队列</div>
                <div>• Turn 计数递增</div>
              </div>
            </HighlightBox>

            <HighlightBox title="副作用" icon="⚙️" variant="purple">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 文件系统修改</div>
                <div>• Shell 命令执行</div>
                <div>• 网络请求发送</div>
                <div>• MCP 服务调用</div>
              </div>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 4. 关键文件与入口 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mb-3">核心源文件</h4>

          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 space-y-2 font-mono text-sm border border-[var(--border-subtle)]">
            <div className="text-[var(--cyber-blue)] font-bold">packages/cli/src/ui/hooks/useGeminiStream.ts</div>
            <div className="pl-4 space-y-1 text-[var(--text-muted)]">
              <div>:786 - <span className="text-[var(--amber)]">submitQuery()</span> - 主循环入口</div>
              <div>:702 - <span className="text-[var(--amber)]">流事件处理循环</span> - 处理 13 种事件类型</div>
              <div>:994 - <span className="text-[var(--amber)]">handleCompletedTools()</span> - Continuation 触发</div>
              <div>:488 - <span className="text-[var(--amber)]">getIdeContextDelta()</span> - IDE 上下文增量</div>
            </div>

            <div className="text-[var(--cyber-blue)] font-bold mt-4">packages/core/src/core/client.ts</div>
            <div className="pl-4 space-y-1 text-[var(--text-muted)]">
              <div>:396 - <span className="text-[var(--amber)]">sendMessageStream()</span> - API 流式请求</div>
              <div>:155 - <span className="text-[var(--amber)]">AsyncGenerator&lt;TurnEvent&gt;</span> - 事件流生成器</div>
            </div>

            <div className="text-[var(--cyber-blue)] font-bold mt-4">packages/core/src/core/coreToolScheduler.ts</div>
            <div className="pl-4 space-y-1 text-[var(--text-muted)]">
              <div>:625 - <span className="text-[var(--amber)]">schedule()</span> - 工具调度入口</div>
              <div>:970 - <span className="text-[var(--amber)]">并行执行逻辑</span> - Promise.then() 链</div>
              <div>:340 - <span className="text-[var(--amber)]">checkAndNotifyCompletion()</span> - 完成检测</div>
            </div>

            <div className="text-[var(--cyber-blue)] font-bold mt-4">packages/core/src/core/turn.ts</div>
            <div className="pl-4 space-y-1 text-[var(--text-muted)]">
              <div>事件类型定义 - Content, ToolCallRequest, Thought, Finished 等</div>
            </div>

            <div className="text-[var(--cyber-blue)] font-bold mt-4">packages/core/src/core/geminiChat.ts</div>
            <div className="pl-4 space-y-1 text-[var(--text-muted)]">
              <div>对话历史管理 - conversationHistory 维护</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 5. 流程图 */}
      <Layer title="流程图" icon="📊">
        <div className="space-y-6">
          <div>
            <h4 className="text-[var(--terminal-green)] font-semibold font-mono mb-3">主循环完整流程</h4>
            <MermaidDiagram chart={mainLoopFlowChart} title="交互主循环流程" />
          </div>

          <div>
            <h4 className="text-[var(--terminal-green)] font-semibold font-mono mb-3">Stream 事件处理</h4>
            <MermaidDiagram chart={streamEventsChart} title="流事件处理流程" />

            <div className="mt-4">
              <h5 className="text-[var(--text-primary)] font-semibold font-mono mb-2">13 种事件类型</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      <th className="py-2 px-3">事件类型</th>
                      <th className="py-2 px-3">触发时机</th>
                      <th className="py-2 px-3">处理方式</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-secondary)]">
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">Content</td>
                      <td className="py-2 px-3">模型生成文本</td>
                      <td className="py-2 px-3">追加到 UI 显示</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-[var(--amber)]">ToolCallRequest</td>
                      <td className="py-2 px-3">模型请求工具</td>
                      <td className="py-2 px-3">收集到队列，流结束后调度</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-[var(--terminal-green)]">Finished</td>
                      <td className="py-2 px-3">响应完成</td>
                      <td className="py-2 px-3">触发工具调度</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-red-400">Error</td>
                      <td className="py-2 px-3">API 错误</td>
                      <td className="py-2 px-3">重试或显示错误</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-[var(--purple)]">Thought</td>
                      <td className="py-2 px-3">思考过程 (think mode)</td>
                      <td className="py-2 px-3">记录但不加入历史</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]/50">
                      <td className="py-2 px-3 font-mono text-orange-400">TokenUsage</td>
                      <td className="py-2 px-3">Token 使用统计</td>
                      <td className="py-2 px-3">更新计数器</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-[var(--text-muted)]">InputTokenCount</td>
                      <td className="py-2 px-3">输入 token 数</td>
                      <td className="py-2 px-3">缓存用于截断</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[var(--terminal-green)] font-semibold font-mono mb-3">Continuation 机制（核心创新）</h4>
            <div className="bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 border border-[var(--cyber-blue)]/30 rounded-lg p-4 mb-4">
              <h5 className="text-[var(--cyber-blue)] font-bold font-mono mb-2">关键洞察</h5>
              <p className="text-[var(--text-secondary)] text-sm">
                工具执行结果会被转换为 <code className="text-[var(--amber)]">functionResponse</code>，作为<strong className="text-[var(--amber)]">下一条用户消息</strong>
                重新进入 <code className="text-[var(--amber)]">submitQuery</code>，创造出"单次请求即可使用工具"的错觉。
                实际上是多次 API 调用，由相同的 <code className="text-[var(--amber)]">prompt_id</code> 关联。
              </p>
            </div>
            <MermaidDiagram chart={continuationChart} title="Continuation 循环序列" />
          </div>
        </div>
      </Layer>

      {/* 6. 关键分支与边界条件 */}
      <Layer title="关键分支与边界条件" icon="⚡">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono">并发控制</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="防重提交" icon="🔒" variant="red">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <code className="text-[var(--amber)]">isSubmittingQueryRef</code>
                  <span className="text-[var(--text-muted)]">防止并发提交</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-[var(--amber)]">sendPromise</code>
                  <span className="text-[var(--text-muted)]">API 调用串行化</span>
                </div>
                <div className="text-[var(--text-muted)] text-xs mt-2">
                  如果正在提交查询，新的提交会被忽略，确保一次只有一个 API 请求在处理
                </div>
              </div>
            </HighlightBox>

            <HighlightBox title="循环保护" icon="🛡️" variant="yellow">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">最大轮次</span>
                  <code className="text-[var(--cyber-blue)]">100 turns</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">循环检测</span>
                  <code className="text-[var(--cyber-blue)]">模式匹配</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">prompt_id</span>
                  <code className="text-[var(--cyber-blue)]">相同值关联</code>
                </div>
              </div>
            </HighlightBox>
          </div>

          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mt-6">Token 管理</h4>
          <HighlightBox title="上下文窗口策略" icon="📊" variant="blue">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-[var(--cyber-blue)] mb-1">动态截断</h5>
                <p className="text-[var(--text-muted)]">当历史消息超过上下文窗口时，自动移除最旧的消息</p>
              </div>
              <div>
                <h5 className="font-semibold text-[var(--cyber-blue)] mb-1">历史压缩</h5>
                <p className="text-[var(--text-muted)]">使用摘要替换过长的历史对话，保留关键信息</p>
              </div>
              <div>
                <h5 className="font-semibold text-[var(--cyber-blue)] mb-1">思考记录</h5>
                <p className="text-[var(--text-muted)]">Thought 事件不计入对话历史，节省 Token</p>
              </div>
            </div>
          </HighlightBox>

          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mt-6">IDE 上下文增量</h4>
          <CodeBlock
            title="client.ts:488 - IDE 上下文增量计算"
            code={`async function getIdeContextDelta(): Promise<IdeContextDelta | null> {
  const currentContext = await ideClient.getOpenFiles();

  if (!lastIdeContext) {
    // 首次请求，发送完整上下文
    lastIdeContext = currentContext;
    return { type: 'full', files: currentContext };
  }

  // 计算增量
  const delta: FileChange[] = [];
  for (const file of currentContext) {
    const lastFile = lastIdeContext.find(f => f.path === file.path);
    if (!lastFile || lastFile.content !== file.content) {
      delta.push(file);  // 新文件或内容变化
    }
  }

  lastIdeContext = currentContext;
  return delta.length > 0 ? { type: 'delta', files: delta } : null;
}

// 优化效果:
// - 首次: 发送所有打开的文件 (最多 10 个)
// - 后续: 只发送变化的文件
// - 50ms 去抖动，避免频繁更新`}
          />
        </div>
      </Layer>

      {/* 7. 失败与恢复 */}
      <Layer title="失败与恢复" icon="🔧">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono">错误处理策略</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="API 错误重试" icon="🔄" variant="blue">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 指数退避 (100ms → 200ms → 400ms)</div>
                <div>• 最大 3 次重试</div>
                <div>• 429 配额错误特殊处理</div>
                <div>• 自动切换备用模型</div>
              </div>
            </HighlightBox>

            <HighlightBox title="工具执行错误" icon="🔧" variant="orange">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• 错误结果返回给模型</div>
                <div>• 模型可选择重试或放弃</div>
                <div>• 错误不中断对话</div>
                <div>• 记录到工具调用日志</div>
              </div>
            </HighlightBox>

            <HighlightBox title="用户中断" icon="🛑" variant="red">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <div>• Ctrl+C 处理</div>
                <div>• AbortController 传播</div>
                <div>• 清理进行中的工具</div>
                <div>• 保留对话历史</div>
              </div>
            </HighlightBox>
          </div>

          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mt-6">降级策略</h4>
          <CodeBlock
            title="错误处理与重试逻辑"
            code={`// API 错误重试
async function sendMessageStreamWithRetry(request: GenerateContentRequest) {
  let lastError: Error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await geminiClient.sendMessageStream(request);
    } catch (error) {
      lastError = error;

      // 配额错误: 切换备用模型
      if (error.code === 429) {
        await switchToFallbackModel();
        continue;
      }

      // 网络错误: 指数退避
      if (error.code === 'ECONNRESET') {
        await sleep(100 * Math.pow(2, attempt));
        continue;
      }

      // 其他错误: 立即失败
      throw error;
    }
  }
  throw lastError;
}

// 工具执行错误处理
function handleToolExecutionError(toolCall, error) {
  // 构造错误响应，返回给模型
  const errorResponse = {
    functionResponse: {
      id: toolCall.id,
      name: toolCall.name,
      response: {
        error: error.message,
        errorType: error.constructor.name,
      }
    }
  };

  // 继续对话，让模型决定如何处理
  submitQuery([errorResponse], { isContinuation: true });
}

// 用户中断处理
function setupAbortHandler(signal: AbortSignal) {
  signal.addEventListener('abort', () => {
    // 取消所有进行中的工具
    toolScheduler.cancelAll();

    // 终止 API 流
    streamController.abort();

    // 保留对话历史
    saveConversationHistory();
  });
}`}
          />
        </div>
      </Layer>

      {/* 8. 相关配置项 */}
      <Layer title="相关配置项" icon="⚙️">
        <div className="space-y-4">
          <h4 className="text-[var(--terminal-green)] font-semibold font-mono">环境变量</h4>
          <div className="bg-[var(--bg-terminal)] rounded-lg p-4 space-y-2 font-mono text-sm border border-[var(--border-subtle)]">
            <div className="text-[var(--amber)]">GEMINI_API_KEY</div>
            <div className="pl-4 text-[var(--text-muted)]">Gemini API 密钥</div>

            <div className="text-[var(--amber)] mt-2">OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL</div>
            <div className="pl-4 text-[var(--text-muted)]">OpenAI 兼容 API 配置</div>

            <div className="text-[var(--amber)] mt-2">DEBUG=1</div>
            <div className="pl-4 text-[var(--text-muted)]">启用详细日志输出</div>
          </div>

          <h4 className="text-[var(--terminal-green)] font-semibold font-mono mt-6">配置选项</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="py-2 px-3">配置项</th>
                  <th className="py-2 px-3">默认值</th>
                  <th className="py-2 px-3">说明</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">maxTurns</td>
                  <td className="py-2 px-3">100</td>
                  <td className="py-2 px-3">最大循环轮次</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">contextWindowSize</td>
                  <td className="py-2 px-3">模型默认</td>
                  <td className="py-2 px-3">上下文窗口大小</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">ideContextMaxFiles</td>
                  <td className="py-2 px-3">10</td>
                  <td className="py-2 px-3">IDE 上下文最大文件数</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">ideContextMaxFileSize</td>
                  <td className="py-2 px-3">16KB</td>
                  <td className="py-2 px-3">单个文件最大大小</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">streamTimeout</td>
                  <td className="py-2 px-3">60s</td>
                  <td className="py-2 px-3">流式响应超时时间</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">retryAttempts</td>
                  <td className="py-2 px-3">3</td>
                  <td className="py-2 px-3">API 错误重试次数</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 执行时间线示例 */}
      <Layer title="执行时间线示例" icon="⏱️">
        <div className="bg-[var(--bg-terminal)] rounded-lg p-4 font-mono text-xs overflow-x-auto border border-[var(--border-subtle)]">
          <pre className="text-[var(--text-secondary)] whitespace-pre">{`
典型交互时间线 (用户请求: "读取 package.json 并分析依赖"):
────────────────────────────────────────────────────────────────────

T+0ms     用户按 Enter 提交
T+5ms     submitQuery 开始
          ├─ isSubmittingQueryRef = true (防重提交)

T+10ms    收集 IDE 上下文增量
          ├─ 检查打开的文件变化
          └─ 增量: 0 个文件 (无变化)

T+15ms    准备请求 (token 计数)
          ├─ 注入系统提示
          ├─ 添加历史消息 (5 轮)
          └─ 估算 Token: 2,500

T+20ms    发起 API 流式请求
          ├─ sendMessageStream()
          └─ sendPromise 队列化

          ┌─ 流式响应阶段 ─┐
          │
T+50ms    │  收到首个 Content chunk ("我来读取...")
          │  └─ UI 立即显示
          │
T+100ms   │  收到更多 Content chunks
          │
T+200ms   │  收到 ToolCallRequest (Read: package.json)
          │  └─ 加入工具请求队列
          │
T+250ms   │  收到 Finished 事件
          └─ 流结束

T+255ms   开始工具调度
          ├─ CoreToolScheduler.schedule()
          └─ 1 个工具待执行

T+260ms   Read 工具验证通过
          ├─ validateParams()
          └─ shouldConfirmExecute() → null (只读工具)

T+265ms   自动批准 (Read 是只读工具)
          └─ status = 'scheduled'

T+270ms   执行 Read 工具
          ├─ fs.readFile('/path/to/package.json')
          └─ 文件大小: 1.2KB

T+280ms   文件读取完成
          ├─ 转换为 functionResponse
          └─ checkAndNotifyCompletion()

          ┌─ Continuation 阶段 ─┐
          │
T+285ms   │  发送 functionResponse
          │  ├─ isContinuation: true
          │  └─ prompt_id: "abc123" (保持相同)
          │
T+290ms   │  发起第二次 API 请求
          │
T+350ms   │  收到 Content ("这个项目使用了...")
          │
T+500ms   │  收到更多分析内容
          │  ├─ 依赖分析
          │  └─ 建议输出
          │
T+600ms   │  收到 Finished (无更多工具)
          └─ Continuation 结束

T+605ms   对话完成
          ├─ isSubmittingQueryRef = false
          └─ UI 显示完整响应

T+610ms   等待下一次用户输入

────────────────────────────────────────────────────────────────────
总耗时: ~610ms (包含 2 次 API 调用 + 1 次文件读取)
API 轮次: 2 (初始请求 + Continuation)
工具调用: 1 (Read)
Token 消耗: ~4,000 (估算)
`}</pre>
        </div>
      </Layer>

      {/* 状态管理 */}
      <Layer title="关键状态变量" icon="📦">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                <th className="py-2 px-3">变量</th>
                <th className="py-2 px-3">位置</th>
                <th className="py-2 px-3">类型</th>
                <th className="py-2 px-3">用途</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">isSubmittingQueryRef</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">useGeminiStream</td>
                <td className="py-2 px-3">useRef&lt;boolean&gt;</td>
                <td className="py-2 px-3">防止并发提交</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">sendPromise</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">geminiChat.ts</td>
                <td className="py-2 px-3">Promise&lt;void&gt;</td>
                <td className="py-2 px-3">串行化多个 API 调用</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">requestQueue</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">coreToolScheduler</td>
                <td className="py-2 px-3">ToolCallRequest[]</td>
                <td className="py-2 px-3">缓冲工具调用</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">conversationHistory</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">geminiChat.ts</td>
                <td className="py-2 px-3">Message[]</td>
                <td className="py-2 px-3">对话历史记录</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">turnCount</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">client.ts</td>
                <td className="py-2 px-3">number</td>
                <td className="py-2 px-3">当前轮次计数</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">currentPromptId</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">useGeminiStream</td>
                <td className="py-2 px-3">string</td>
                <td className="py-2 px-3">关联同一用户输入的所有轮次</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">lastIdeContext</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">client.ts</td>
                <td className="py-2 px-3">IdeContext</td>
                <td className="py-2 px-3">上次 IDE 上下文，用于增量计算</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 核心代码片段 */}
      <Layer title="核心代码片段" icon="💻">
        <div className="space-y-4">
          <CodeBlock
            title="useGeminiStream.ts:786 - submitQuery 核心逻辑"
            code={`const submitQuery = async (
  userParts: Part[],
  options: { isContinuation?: boolean; prompt_id?: string } = {}
) => {
  // 1. 防止并发提交
  if (isSubmittingQueryRef.current) {
    console.warn('Query submission already in progress');
    return;
  }
  isSubmittingQueryRef.current = true;

  try {
    // 2. 收集 IDE 上下文增量 (仅首次或文件变化时)
    const ideContextDelta = await getIdeContextDelta();

    // 3. 准备完整请求
    const request = await prepareRequest(userParts, ideContextDelta, options);
    // - 添加系统提示
    // - 注入历史消息
    // - Token 计数与截断

    // 4. 发起流式请求 (通过 sendPromise 串行化)
    const stream = geminiClient.sendMessageStream(request);

    // 5. 处理流事件
    for await (const event of stream) {
      switch (event.type) {
        case 'Content':
          // 追加内容到 UI
          appendContent(event.content);
          break;

        case 'ToolCallRequest':
          // 收集工具调用请求
          pendingToolCalls.push(event.toolCall);
          break;

        case 'Thought':
          // 记录思考过程 (不加入历史)
          recordThought(event.thought);
          break;

        case 'Finished':
          // 流结束，准备调度工具
          streamFinished = true;
          break;

        case 'Error':
          // 处理错误 (重试或显示)
          await handleStreamError(event.error);
          break;
      }
    }

    // 6. 流结束后调度工具
    if (pendingToolCalls.length > 0) {
      await scheduleTools(pendingToolCalls);
    }
  } finally {
    isSubmittingQueryRef.current = false;
  }
};`}
          />

          <CodeBlock
            title="useGeminiStream.ts:994 - Continuation 触发"
            code={`function handleCompletedTools(completedTools: ToolCallResult[]) {
  // 转换工具结果为 functionResponse Parts
  const responseParts: Part[] = completedTools.map(result => ({
    functionResponse: {
      id: result.toolCallId,
      name: result.toolName,
      response: {
        output: result.output,
        error: result.error,
      }
    }
  }));

  // 重新进入 submitQuery，保持相同的 prompt_id
  submitQuery(responseParts, {
    isContinuation: true,
    prompt_id: currentPromptId,  // 关联同一次用户输入
  });
}`}
          />
        </div>
      </Layer>
    </div>
  );
}
