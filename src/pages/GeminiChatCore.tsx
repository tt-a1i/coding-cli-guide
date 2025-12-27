import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              GeminiChat 是整个 CLI 的"大脑"，负责管理与 AI 模型的所有通信。
              它实现了关键的 <strong className="text-[var(--terminal-green)]">Continuation 机制</strong>：当 AI 需要执行工具时，
              自动将结果反馈并继续对话，形成 用户→AI→工具→AI→... 的循环。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔧 为什么这样设计</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              AI Agent 需要自主决策何时完成任务。通过 <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded">finish_reason</code> 判断：
              STOP 表示任务完成，TOOL_USE 表示需要执行工具后继续。这让 AI 可以连续执行多个操作直到任务真正完成。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🏗️ 核心流程</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--cyber-blue)]/30 text-center">
                <div className="text-[var(--cyber-blue)] font-semibold text-sm">1. sendMessage</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">发送用户消息</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--terminal-green)]/30 text-center">
                <div className="text-[var(--terminal-green)] font-semibold text-sm">2. Stream</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">流式接收响应</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--amber)]/30 text-center">
                <div className="text-[var(--amber)] font-semibold text-sm">3. Tool Call</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">执行工具调用</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--purple)]/30 text-center">
                <div className="text-[var(--purple)] font-semibold text-sm">4. Continue?</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">判断是否继续</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">100</div>
              <div className="text-xs text-[var(--text-muted)]">最大轮次</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">重试次数</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">13</div>
              <div className="text-xs text-[var(--text-muted)]">事件类型</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--purple)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">Continuation</div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-2 rounded flex items-center gap-2">
            <span>📁</span>
            <code>packages/core/src/core/geminiChat.ts</code>
          </div>
        </div>
      )}
    </div>
  );
}

export function GeminiChatCore() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <h2 className="text-2xl text-cyan-400 mb-5">GeminiChat 核心循环机制</h2>

      {/* 核心概念 */}
      <Layer title="核心概念" icon="🧠">
        <HighlightBox title="GeminiChat 的职责" icon="🎯" variant="blue">
          <p className="mb-2">
            <code className="bg-black/30 px-1 rounded">GeminiChat</code> 是整个 CLI 的核心，
            负责管理与 AI 的通信循环。它位于：
          </p>
          <code className="text-cyan-400">packages/core/src/core/geminiChat.ts</code>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📨</div>
            <h4 className="text-cyan-400 font-bold">消息管理</h4>
            <p className="text-sm text-gray-400">维护完整的对话历史</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="text-cyan-400 font-bold">循环控制</h4>
            <p className="text-sm text-gray-400">处理多轮工具调用</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📡</div>
            <h4 className="text-cyan-400 font-bold">流式处理</h4>
            <p className="text-sm text-gray-400">实时处理 API 响应</p>
          </div>
        </div>
      </Layer>

      {/* 设计哲学深度解析 */}
      <Layer title="设计哲学深度解析" icon="💡">
        <div className="space-y-6">
          {/* 核心约束 */}
          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-transparent rounded-xl p-5 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-bold text-lg mb-3 flex items-center gap-2">
              <span>🧠</span>
              核心约束：AI 是无状态的
            </h4>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              每次 API 调用都是独立的 HTTP 请求，AI 不会"记住"之前说过什么。
              GeminiChat 的存在就是为了解决这个问题 —— 它维护完整的对话历史，
              让每次请求都携带上下文，使 AI 看起来像是"有记忆"的。
            </p>
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-3 text-xs font-mono">
              <span className="text-[var(--text-muted)]">// 每次请求都发送完整历史</span><br/>
              <span className="text-[var(--cyber-blue)]">generateContent</span>({'{'}
              <span className="text-[var(--terminal-green)]">history</span>: [...allPreviousMessages]{'}'})
            </div>
          </div>

          {/* 为什么是 Continuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--terminal-green)]/30">
              <h5 className="text-[var(--terminal-green)] font-bold mb-2 flex items-center gap-2">
                <span>🔄</span>
                为什么需要 Continuation 机制？
              </h5>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                传统 CLI 是"一问一答"，但 AI Agent 需要<strong>自主决策</strong>：
              </p>
              <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
                <li>读取文件后，决定是否需要读更多</li>
                <li>执行命令后，决定下一步操作</li>
                <li>发现问题后，尝试修复</li>
              </ul>
              <div className="mt-3 bg-[var(--terminal-green)]/10 rounded p-2 text-xs">
                <code>finish_reason: "tool_calls"</code> → 继续<br/>
                <code>finish_reason: "stop"</code> → 结束
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--cyber-blue)]/30">
              <h5 className="text-[var(--cyber-blue)] font-bold mb-2 flex items-center gap-2">
                <span>🌊</span>
                为什么选择流式响应？
              </h5>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                批量响应意味着用户要等待整个响应完成，体验很差：
              </p>
              <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-4">
                <li>用户看到"正在生成..."几十秒</li>
                <li>无法及时中断错误的方向</li>
                <li>网络中断意味着全部丢失</li>
              </ul>
              <div className="mt-3 bg-[var(--cyber-blue)]/10 rounded p-2 text-xs">
                流式 = 边生成边显示 + 可中断 + 渐进式反馈
              </div>
            </div>
          </div>

          {/* 历史管理的设计考量 */}
          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--purple)]/30">
            <h5 className="text-[var(--purple)] font-bold mb-3 flex items-center gap-2">
              <span>📚</span>
              为什么有两种历史视图？
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-[var(--text-primary)] mb-1">Comprehensive（完整历史）</div>
                <p className="text-[var(--text-muted)]">
                  包含所有消息，包括失败的尝试、空响应、被中断的调用。
                  用于<strong>调试</strong>和<strong>重放</strong>，可以精确还原会话状态。
                </p>
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)] mb-1">Curated（精选历史）</div>
                <p className="text-[var(--text-muted)]">
                  只保留有效的用户-模型交互。用于<strong>发送给 API</strong>，
                  避免无效内容消耗 token 配额。
                </p>
              </div>
            </div>
          </div>

          {/* 设计权衡表格 */}
          <div className="bg-[var(--bg-terminal)]/30 rounded-lg p-4">
            <h5 className="text-[var(--text-primary)] font-bold mb-3 flex items-center gap-2">
              <span>⚖️</span>
              关键设计权衡
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 text-[var(--text-muted)]">决策</th>
                    <th className="text-left py-2 text-[var(--terminal-green)]">选择</th>
                    <th className="text-left py-2 text-[var(--amber)]">代价</th>
                    <th className="text-left py-2 text-[var(--cyber-blue)]">收益</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-secondary)]">
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2">历史发送</td>
                    <td className="py-2 text-[var(--terminal-green)]">每次全量</td>
                    <td className="py-2 text-[var(--amber)]">Token 消耗大</td>
                    <td className="py-2 text-[var(--cyber-blue)]">上下文完整一致</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2">工具执行</td>
                    <td className="py-2 text-[var(--terminal-green)]">串行等待</td>
                    <td className="py-2 text-[var(--amber)]">速度较慢</td>
                    <td className="py-2 text-[var(--cyber-blue)]">可控可审批</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2">错误处理</td>
                    <td className="py-2 text-[var(--terminal-green)]">指数退避重试</td>
                    <td className="py-2 text-[var(--amber)]">延迟增加</td>
                    <td className="py-2 text-[var(--cyber-blue)]">成功率提高</td>
                  </tr>
                  <tr>
                    <td className="py-2">写操作</td>
                    <td className="py-2 text-[var(--terminal-green)]">第二个前停止</td>
                    <td className="py-2 text-[var(--amber)]">需要多轮</td>
                    <td className="py-2 text-[var(--cyber-blue)]">防止连续破坏</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 与其他模块的关系 */}
          <div className="bg-gradient-to-r from-[var(--cyber-blue)]/5 to-[var(--purple)]/5 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h5 className="text-[var(--text-primary)] font-bold mb-3 flex items-center gap-2">
              <span>🔗</span>
              架构定位
            </h5>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] px-3 py-1 rounded-full">
                上层：InteractionLoop 调用
              </div>
              <div className="bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] px-3 py-1 rounded-full">
                下层：ContentGenerator 生成
              </div>
              <div className="bg-[var(--purple)]/20 text-[var(--purple)] px-3 py-1 rounded-full">
                平级：ToolScheduler 执行工具
              </div>
              <div className="bg-[var(--amber)]/20 text-[var(--amber)] px-3 py-1 rounded-full">
                输出：StreamEvent 事件流
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-sm mt-3">
              GeminiChat 是连接"用户交互层"和"内容生成层"的桥梁，
              向上提供简单的 <code className="text-[var(--terminal-green)]">sendMessage()</code> 接口，
              向下封装复杂的流式处理、重试、历史管理逻辑。
            </p>
          </div>
        </div>
      </Layer>

      {/* sendMessageStream 详解 */}
      <Layer title="sendMessageStream() 核心方法" icon="📤">
        <CodeBlock
          title="packages/core/src/core/geminiChat.ts"
          code={`async sendMessageStream(
    model: string,
    params: SendMessageParameters,
    prompt_id: string,
): Promise<AsyncGenerator<StreamEvent>> {

    // 1. 添加用户消息到历史
    this.history.push(userContent);

    // 2. 调用 API 并处理流
    const stream = await this.makeApiCallAndProcessStream(
        model,
        params,
        prompt_id
    );

    // 3. 处理流式响应
    for await (const event of stream) {
        // 处理每个 chunk
        yield event;
    }

    // 4. 添加模型响应到历史
    this.history.push(modelResponse);
}`}
        />
      </Layer>

      {/* makeApiCallAndProcessStream */}
      <Layer title="API 调用与重试机制" icon="🔁">
        <CodeBlock
          title="makeApiCallAndProcessStream()"
          code={`async makeApiCallAndProcessStream(...) {
    // 重试配置
    const RETRY_OPTIONS = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
    };

    return withRetry(async () => {
        // 1. 构建请求
        const request = this.buildRequest(model, params);

        // 2. 调用 ContentGenerator
        const stream = this.contentGenerator
            .generateContentStream(request);

        // 3. 处理流响应
        return this.processStreamResponse(stream);

    }, RETRY_OPTIONS, {
        // 429 限流特殊处理
        onPersistent429: async (retryAfter) => {
            await this.handle429(retryAfter);
        }
    });
}`}
        />

        <HighlightBox title="重试策略" icon="🔄" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>指数退避</strong>：每次重试延迟翻倍</li>
            <li><strong>最大重试</strong>：默认 3 次</li>
            <li><strong>429 处理</strong>：根据 Retry-After 头等待</li>
            <li><strong>内容验证</strong>：验证响应有效性后才接受</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* processStreamResponse */}
      <Layer title="流响应处理" icon="📥">
        <CodeBlock
          title="processStreamResponse()"
          code={`async *processStreamResponse(stream) {
    let textParts = [];
    let toolCalls = [];
    let thoughts = [];

    for await (const chunk of stream) {
        // 1. 验证响应
        if (!isValidResponse(chunk)) {
            continue;
        }

        // 2. 提取内容部分
        for (const part of chunk.candidates[0].content.parts) {

            if (part.text) {
                // 文本内容
                textParts.push(part.text);
                yield { type: 'text', content: part.text };
            }

            if (part.functionCall) {
                // 工具调用
                toolCalls.push(part.functionCall);
                yield { type: 'tool_call', call: part.functionCall };

                // ⚠️ 关键：阻止第二个写操作
                if (this.stopBeforeSecondMutator && isMutator(part)) {
                    return;  // 提前结束
                }
            }

            if (part.thought) {
                // 思考过程（如果模型支持）
                thoughts.push(part.thought);
                yield { type: 'thought', content: part.thought };
            }
        }

        // 3. 检查完成原因
        if (chunk.candidates[0].finishReason) {
            yield {
                type: 'finish',
                reason: chunk.candidates[0].finishReason
            };
        }
    }
}`}
        />

        <HighlightBox title="stopBeforeSecondMutator" icon="🛡️" variant="red">
          <p>
            这是一个<strong>安全机制</strong>：如果 AI 尝试在一轮中执行多个写操作，
            系统会在第二个写操作之前停止，防止意外的连续修改。
          </p>
        </HighlightBox>
      </Layer>

      {/* 消息历史管理 */}
      <Layer title="消息历史管理" icon="📚">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-cyan-400 font-bold mb-2">完整历史 (Comprehensive)</h4>
            <p className="text-sm text-gray-400 mb-2">
              包含所有消息，包括失败和空响应
            </p>
            <code className="text-xs">getHistory(curated: false)</code>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-green-400/30">
            <h4 className="text-green-400 font-bold mb-2">精选历史 (Curated)</h4>
            <p className="text-sm text-gray-400 mb-2">
              仅有效的用户-模型交互
            </p>
            <code className="text-xs">getHistory(curated: true)</code>
          </div>
        </div>

        <JsonBlock
          code={`// 历史数据结构
history: Content[] = [
    {
        role: "user",
        parts: [{ text: "帮我读取 package.json" }]
    },
    {
        role: "model",
        parts: [
            { functionCall: { name: "read_file", args: {...} } }
        ]
    },
    {
        role: "user",  // 工具结果也是 user 角色
        parts: [
            { functionResponse: { name: "read_file", response: {...} } }
        ]
    },
    {
        role: "model",
        parts: [{ text: "package.json 的内容是..." }]
    }
]`}
        />
      </Layer>

      {/* 循环终止条件 */}
      <Layer title="循环终止条件" icon="🏁">
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg">
            <span className="text-2xl">✅</span>
            <div>
              <strong className="text-green-400">finish_reason: "stop"</strong>
              <p className="text-sm text-gray-400">AI 完成回答，无需更多工具调用</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-orange-500/10 p-3 rounded-lg">
            <span className="text-2xl">🔄</span>
            <div>
              <strong className="text-orange-400">finish_reason: "tool_calls"</strong>
              <p className="text-sm text-gray-400">需要执行工具，执行后继续循环</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-lg">
            <span className="text-2xl">🛑</span>
            <div>
              <strong className="text-red-400">MAX_TURNS 达到上限</strong>
              <p className="text-sm text-gray-400">默认 100 轮，防止无限循环</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-purple-500/10 p-3 rounded-lg">
            <span className="text-2xl">⏹️</span>
            <div>
              <strong className="text-purple-400">用户中断 (Ctrl+C)</strong>
              <p className="text-sm text-gray-400">AbortController 信号触发</p>
            </div>
          </div>
        </div>
      </Layer>

      {/* 完整循环图 */}
      <Layer title="完整循环流程图" icon="🔄">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-cyan-400/20 border border-cyan-400 rounded-lg px-6 py-3 text-center">
              <strong>用户输入</strong>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-6 py-3 text-center">
              <strong>history.push(userMessage)</strong>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-6 py-3 text-center w-full max-w-md">
              <strong>while (turns {'>'} 0)</strong>
              <div className="text-sm text-gray-400 mt-1">核心循环开始</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-pink-400/20 border border-pink-400 rounded-lg px-6 py-3 text-center">
              <strong>API 请求 (generateContentStream)</strong>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-6 py-3 text-center">
              <strong>处理流式响应</strong>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-yellow-400/20 border border-yellow-400 rounded-lg px-6 py-3 text-center">
              <strong>检查 tool_calls?</strong>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex flex-col items-center">
                <div className="text-green-400">↓ 无</div>
                <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center">
                  <strong>break</strong>
                  <div className="text-xs">结束循环</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-orange-400">↓ 有</div>
                <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center">
                  <strong>执行工具</strong>
                </div>
                <div className="text-cyan-400">↓</div>
                <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center">
                  <strong>结果加入历史</strong>
                </div>
                <div className="text-cyan-400">↺ 继续循环</div>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* ==================== 深化内容开始 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          GeminiChat 作为核心对话管理器，需要处理各种边界情况以确保系统的健壮性和可靠性。
        </p>

        {/* 消息历史边界 */}
        <Layer title="1. 消息历史管理边界" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            对话历史是 AI 上下文的核心，需要精确管理以避免上下文丢失或超限。
          </p>

          <CodeBlock
            code={`// 消息历史边界处理
// packages/core/src/core/geminiChat.ts

interface HistoryLimits {
  maxMessages: number;        // 最大消息数
  maxTokens: number;          // 最大 token 数
  maxToolResults: number;     // 单次最大工具结果数
  reserveTokens: number;      // 为响应预留的 token
}

const DEFAULT_LIMITS: HistoryLimits = {
  maxMessages: 500,
  maxTokens: 128000,          // 128K 上下文窗口
  maxToolResults: 50,         // 单轮最多50个工具结果
  reserveTokens: 8000         // 预留给 AI 响应
};

class HistoryManager {
  private history: Content[] = [];
  private tokenCounter: TokenCounter;

  // 添加消息前的边界检查
  addMessage(content: Content): AddMessageResult {
    // 检查单消息 token 限制
    const messageTokens = this.tokenCounter.count(content);

    if (messageTokens > DEFAULT_LIMITS.maxTokens * 0.5) {
      // 单条消息过大，需要截断
      return {
        success: false,
        error: 'message_too_large',
        suggestion: '消息内容过长，请分批发送'
      };
    }

    // 检查总 token 预算
    const currentTokens = this.getTotalTokens();
    const availableTokens = DEFAULT_LIMITS.maxTokens - DEFAULT_LIMITS.reserveTokens;

    if (currentTokens + messageTokens > availableTokens) {
      // 需要压缩历史
      const compressedHistory = this.compressHistory(
        availableTokens - messageTokens
      );

      if (!compressedHistory.success) {
        return {
          success: false,
          error: 'context_overflow',
          suggestion: '上下文已满，建议开始新对话'
        };
      }

      this.history = compressedHistory.history;
    }

    // 检查消息数限制
    if (this.history.length >= DEFAULT_LIMITS.maxMessages) {
      // 移除最早的非系统消息
      this.pruneOldestMessages(10);
    }

    this.history.push(content);
    return { success: true };
  }

  // 压缩历史以腾出空间
  private compressHistory(targetTokens: number): CompressionResult {
    let currentHistory = [...this.history];
    let currentTokens = this.getTotalTokens();

    // 策略1：移除中间的工具调用细节
    if (currentTokens > targetTokens) {
      currentHistory = this.summarizeToolCalls(currentHistory);
      currentTokens = this.countTokens(currentHistory);
    }

    // 策略2：保留最近 N 轮，摘要其余
    if (currentTokens > targetTokens) {
      const recentCount = 10;  // 保留最近10轮完整对话
      const recentHistory = currentHistory.slice(-recentCount * 2);
      const oldHistory = currentHistory.slice(0, -recentCount * 2);

      const summary = this.generateSummary(oldHistory);
      currentHistory = [summary, ...recentHistory];
      currentTokens = this.countTokens(currentHistory);
    }

    // 策略3：强制截断（最后手段）
    if (currentTokens > targetTokens) {
      while (currentTokens > targetTokens && currentHistory.length > 2) {
        currentHistory.shift();
        currentTokens = this.countTokens(currentHistory);
      }
    }

    return {
      success: currentTokens <= targetTokens,
      history: currentHistory,
      removedTokens: this.getTotalTokens() - currentTokens
    };
  }

  // 工具调用摘要化
  private summarizeToolCalls(history: Content[]): Content[] {
    return history.map(content => {
      if (content.role === 'user' && this.hasToolResponse(content)) {
        // 截断过长的工具响应
        return this.truncateToolResponses(content, 1000);  // 最多1000字符
      }
      return content;
    });
  }

  // 截断工具响应
  private truncateToolResponses(content: Content, maxChars: number): Content {
    const newParts = content.parts.map(part => {
      if (part.functionResponse) {
        const responseStr = JSON.stringify(part.functionResponse.response);
        if (responseStr.length > maxChars) {
          return {
            ...part,
            functionResponse: {
              ...part.functionResponse,
              response: {
                truncated: true,
                preview: responseStr.substring(0, maxChars) + '...',
                originalLength: responseStr.length
              }
            }
          };
        }
      }
      return part;
    });

    return { ...content, parts: newParts };
  }
}

/*
上下文压缩策略优先级：

┌─────────────────────────────────────────────────────────────────┐
│ 1. 工具响应截断 (影响最小)                                        │
│    - 保留所有对话结构                                            │
│    - 只截断工具返回的详细内容                                     │
│    - 添加 truncated: true 标记                                  │
├─────────────────────────────────────────────────────────────────┤
│ 2. 历史摘要 (中等影响)                                           │
│    - 保留最近 10 轮完整对话                                       │
│    - 将较早的对话压缩为摘要                                       │
│    - 保持上下文连贯性                                            │
├─────────────────────────────────────────────────────────────────┤
│ 3. 强制截断 (最后手段)                                           │
│    - 直接移除最早的消息                                          │
│    - 可能导致上下文断裂                                          │
│    - 仅在前两种策略失败时使用                                     │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="消息历史边界处理"
          />
        </Layer>

        {/* 流式响应中断处理 */}
        <Layer title="2. 流式响应中断处理" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            流式响应可能在任何时刻中断，需要正确处理各种中断场景。
          </p>

          <CodeBlock
            code={`// 流式响应中断处理
// packages/core/src/core/geminiChat.ts

enum StreamInterruptType {
  USER_ABORT = 'user_abort',       // 用户按 Ctrl+C
  NETWORK_ERROR = 'network_error', // 网络断开
  TIMEOUT = 'timeout',             // 响应超时
  API_ERROR = 'api_error',         // API 返回错误
  CONTENT_FILTER = 'content_filter', // 内容过滤
  TOKEN_LIMIT = 'token_limit'      // Token 耗尽
}

interface StreamState {
  textBuffer: string;           // 已接收的文本
  toolCalls: ToolCall[];        // 已解析的工具调用
  isComplete: boolean;          // 是否完整完成
  interruptType?: StreamInterruptType;
  lastChunkTime: number;        // 最后收到数据的时间
}

class StreamInterruptHandler {
  private streamState: StreamState = this.createInitialState();
  private readonly CHUNK_TIMEOUT = 30000;  // 30秒无数据视为超时

  // 处理流中断
  async handleInterrupt(
    type: StreamInterruptType,
    partialState: StreamState
  ): Promise<InterruptResult> {
    switch (type) {
      case StreamInterruptType.USER_ABORT:
        // 用户主动中断，保存当前状态
        return this.handleUserAbort(partialState);

      case StreamInterruptType.NETWORK_ERROR:
        // 网络错误，尝试恢复
        return this.handleNetworkError(partialState);

      case StreamInterruptType.TIMEOUT:
        // 超时，使用已有内容
        return this.handleTimeout(partialState);

      case StreamInterruptType.API_ERROR:
        // API 错误，检查是否可重试
        return this.handleApiError(partialState);

      case StreamInterruptType.CONTENT_FILTER:
        // 内容被过滤
        return this.handleContentFilter(partialState);

      case StreamInterruptType.TOKEN_LIMIT:
        // Token 耗尽
        return this.handleTokenLimit(partialState);

      default:
        return { action: 'fail', error: '未知中断类型' };
    }
  }

  // 用户中断处理
  private handleUserAbort(state: StreamState): InterruptResult {
    // 如果已有工具调用在执行中，需要等待完成
    if (state.toolCalls.length > 0 && this.hasExecutingTools()) {
      return {
        action: 'wait_tools',
        message: '等待工具执行完成后中断...',
        cancelPendingOnly: true
      };
    }

    // 保存部分响应到历史
    if (state.textBuffer.length > 0) {
      this.savePartialResponse(state.textBuffer, 'user_interrupted');
    }

    return {
      action: 'abort',
      message: '用户中断',
      partialContent: state.textBuffer
    };
  }

  // 网络错误处理
  private async handleNetworkError(state: StreamState): Promise<InterruptResult> {
    // 检查是否有足够内容可以使用
    if (this.isResponseUsable(state)) {
      return {
        action: 'use_partial',
        message: '网络中断，使用已接收内容',
        partialContent: state.textBuffer,
        toolCalls: state.toolCalls
      };
    }

    // 尝试重连
    const reconnected = await this.attemptReconnect(3);
    if (reconnected) {
      return {
        action: 'retry',
        message: '网络恢复，重试请求',
        resumeFrom: state.lastChunkTime
      };
    }

    return {
      action: 'fail',
      error: '网络错误，无法恢复',
      partialContent: state.textBuffer
    };
  }

  // 超时处理
  private handleTimeout(state: StreamState): InterruptResult {
    // 如果有完整的工具调用，可以继续
    if (state.toolCalls.length > 0) {
      return {
        action: 'continue_with_tools',
        message: '响应超时，继续执行已解析的工具调用',
        toolCalls: state.toolCalls
      };
    }

    // 如果有文本内容，标记为不完整但可用
    if (state.textBuffer.length > 100) {
      return {
        action: 'use_partial',
        message: '响应超时，使用部分内容',
        partialContent: state.textBuffer + '\\n[响应被截断]'
      };
    }

    return {
      action: 'retry',
      message: '响应超时，重试请求'
    };
  }

  // 检查响应是否可用
  private isResponseUsable(state: StreamState): boolean {
    // 有完整的工具调用
    if (state.toolCalls.some(tc => tc.name && tc.args)) {
      return true;
    }

    // 有足够长度的文本且看起来完整
    if (state.textBuffer.length > 50) {
      const endsWithPunctuation = /[.。!！?？]$/.test(state.textBuffer.trim());
      return endsWithPunctuation;
    }

    return false;
  }
}

/*
中断处理决策树：

                    ┌─────────────────┐
                    │   流中断发生     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   用户中断 (Ctrl+C)    网络/API 错误        超时
         │                   │                   │
         ▼                   ▼                   ▼
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ 有工具执行中?│   │ 内容可用?    │   │ 有工具调用?  │
  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
    是/否              是/否              是/否
    │  │               │  │               │  │
    ▼  ▼               ▼  ▼               ▼  ▼
 等待 保存           使用 尝试          继续 重试
 完成 部分           部分 重连          工具 请求
*/`}
            language="typescript"
            title="流中断处理"
          />
        </Layer>

        {/* 工具调用顺序与依赖 */}
        <Layer title="3. 工具调用顺序与依赖处理" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            AI 可能在单次响应中发起多个工具调用，需要正确处理执行顺序和依赖关系。
          </p>

          <CodeBlock
            code={`// 工具调用顺序管理
// packages/core/src/core/geminiChat.ts

interface ToolCallBatch {
  calls: ToolCall[];
  executionOrder: 'parallel' | 'sequential' | 'dependency-aware';
}

class ToolCallOrchestrator {
  private pendingCalls: ToolCall[] = [];
  private executedCalls: Map<string, ToolResult> = new Map();

  // 确定执行顺序
  determineExecutionOrder(calls: ToolCall[]): ExecutionPlan {
    // 分析依赖关系
    const dependencies = this.analyzeDependencies(calls);

    // 检测循环依赖
    if (this.hasCircularDependency(dependencies)) {
      throw new Error('检测到循环依赖，无法执行工具调用');
    }

    // 分组：可并行 vs 需串行
    const groups: ToolCallGroup[] = [];
    const remaining = new Set(calls.map(c => c.id));
    const completed = new Set<string>();

    while (remaining.size > 0) {
      const readyForExecution: ToolCall[] = [];

      for (const callId of remaining) {
        const call = calls.find(c => c.id === callId)!;
        const deps = dependencies.get(callId) || [];

        // 如果所有依赖已完成，可以执行
        if (deps.every(depId => completed.has(depId))) {
          readyForExecution.push(call);
        }
      }

      if (readyForExecution.length === 0) {
        throw new Error('无法确定执行顺序，可能存在死锁');
      }

      groups.push({
        calls: readyForExecution,
        canParallel: this.canExecuteInParallel(readyForExecution)
      });

      for (const call of readyForExecution) {
        remaining.delete(call.id);
        completed.add(call.id);
      }
    }

    return {
      groups,
      totalSteps: groups.length,
      estimatedTime: this.estimateExecutionTime(groups)
    };
  }

  // 分析依赖关系
  private analyzeDependencies(calls: ToolCall[]): Map<string, string[]> {
    const deps = new Map<string, string[]>();

    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      const callDeps: string[] = [];

      // 检查参数中是否引用其他调用的结果
      const argsStr = JSON.stringify(call.args);

      for (let j = 0; j < i; j++) {
        const prevCall = calls[j];

        // 如果参数中提到了前一个工具的输出路径
        if (this.referencesOutput(argsStr, prevCall)) {
          callDeps.push(prevCall.id);
        }
      }

      // 写操作通常依赖于之前的读操作
      if (this.isMutatorTool(call.name)) {
        const relatedReads = calls.slice(0, i)
          .filter(c => this.isRelatedReadOperation(c, call));
        callDeps.push(...relatedReads.map(c => c.id));
      }

      deps.set(call.id, callDeps);
    }

    return deps;
  }

  // 判断是否可以并行执行
  private canExecuteInParallel(calls: ToolCall[]): boolean {
    // 多个读操作可以并行
    if (calls.every(c => this.isReadOnlyTool(c.name))) {
      return true;
    }

    // 操作不同资源的写操作可以并行
    const resources = calls.map(c => this.getAffectedResource(c));
    const uniqueResources = new Set(resources);

    if (uniqueResources.size === calls.length) {
      // 每个调用操作不同的资源
      return true;
    }

    // 默认串行执行写操作
    return false;
  }

  // 执行工具调用批次
  async executeBatch(plan: ExecutionPlan): AsyncGenerator<ToolResult> {
    for (const group of plan.groups) {
      if (group.canParallel) {
        // 并行执行
        const results = await Promise.all(
          group.calls.map(call => this.executeTool(call))
        );

        for (const result of results) {
          yield result;
        }
      } else {
        // 串行执行
        for (const call of group.calls) {
          const result = await this.executeTool(call);
          yield result;

          // 检查是否应该中止后续调用
          if (result.error && this.shouldAbortOnError(call, result)) {
            throw new ToolExecutionError(result.error);
          }
        }
      }
    }
  }
}

/*
工具调用依赖示例：

场景：AI 想要读取文件、修改内容、然后运行测试

Tool Calls:
1. Read("src/config.ts")              // 独立
2. Read("src/utils.ts")               // 独立
3. Edit("src/config.ts", changes)     // 依赖 #1
4. Bash("npm test")                   // 依赖 #3

执行计划：
┌─────────────────────────────────────────────────────────────────┐
│ Group 1 (并行):                                                  │
│   - Read("src/config.ts")                                       │
│   - Read("src/utils.ts")                                        │
├─────────────────────────────────────────────────────────────────┤
│ Group 2 (串行):                                                  │
│   - Edit("src/config.ts", changes)  // 等待 Group 1 完成        │
├─────────────────────────────────────────────────────────────────┤
│ Group 3 (串行):                                                  │
│   - Bash("npm test")                // 等待 Group 2 完成        │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="工具调用顺序管理"
          />
        </Layer>

        {/* 循环终止边界 */}
        <Layer title="4. 循环终止边界与安全阀" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            防止 AI 陷入无限循环是核心安全机制，需要多层保护。
          </p>

          <CodeBlock
            code={`// 循环终止安全机制
// packages/core/src/core/geminiChat.ts

interface SafetyLimits {
  maxTurns: number;              // 最大轮次
  maxToolCallsPerTurn: number;   // 单轮最大工具调用
  maxTotalToolCalls: number;     // 总工具调用上限
  maxConsecutiveErrors: number;  // 连续错误上限
  maxIdleTime: number;           // 最大空闲时间（毫秒）
  maxTokensPerSession: number;   // 会话最大 token 消耗
}

const SAFETY_LIMITS: SafetyLimits = {
  maxTurns: 100,
  maxToolCallsPerTurn: 20,
  maxTotalToolCalls: 500,
  maxConsecutiveErrors: 5,
  maxIdleTime: 5 * 60 * 1000,   // 5分钟
  maxTokensPerSession: 1000000  // 100万 tokens
};

class LoopSafetyGuard {
  private turnCount = 0;
  private totalToolCalls = 0;
  private consecutiveErrors = 0;
  private lastActivityTime = Date.now();
  private totalTokensUsed = 0;

  // 每轮开始时检查
  checkBeforeTurn(): SafetyCheckResult {
    // 1. 轮次限制
    if (this.turnCount >= SAFETY_LIMITS.maxTurns) {
      return {
        canContinue: false,
        reason: 'max_turns_exceeded',
        message: \`已达到最大轮次限制 (\${SAFETY_LIMITS.maxTurns})，任务可能过于复杂\`,
        suggestion: '建议将任务拆分为更小的子任务'
      };
    }

    // 2. 总工具调用限制
    if (this.totalToolCalls >= SAFETY_LIMITS.maxTotalToolCalls) {
      return {
        canContinue: false,
        reason: 'max_tool_calls_exceeded',
        message: \`工具调用次数过多 (\${SAFETY_LIMITS.maxTotalToolCalls})，可能存在循环\`,
        suggestion: '请检查任务描述是否清晰'
      };
    }

    // 3. 连续错误限制
    if (this.consecutiveErrors >= SAFETY_LIMITS.maxConsecutiveErrors) {
      return {
        canContinue: false,
        reason: 'too_many_errors',
        message: \`连续遇到 \${SAFETY_LIMITS.maxConsecutiveErrors} 个错误\`,
        suggestion: '建议检查环境配置或重新描述任务'
      };
    }

    // 4. 空闲检测
    const idleTime = Date.now() - this.lastActivityTime;
    if (idleTime > SAFETY_LIMITS.maxIdleTime) {
      return {
        canContinue: false,
        reason: 'session_timeout',
        message: \`会话已空闲 \${Math.floor(idleTime / 60000)} 分钟\`,
        suggestion: '会话已超时，请开始新对话'
      };
    }

    // 5. Token 预算检查
    if (this.totalTokensUsed >= SAFETY_LIMITS.maxTokensPerSession) {
      return {
        canContinue: false,
        reason: 'token_budget_exceeded',
        message: \`Token 消耗已达上限 (\${SAFETY_LIMITS.maxTokensPerSession})\`,
        suggestion: '建议开始新会话以继续工作'
      };
    }

    return { canContinue: true };
  }

  // 检查单轮工具调用数
  checkToolCallCount(callCount: number): SafetyCheckResult {
    if (callCount > SAFETY_LIMITS.maxToolCallsPerTurn) {
      return {
        canContinue: false,
        reason: 'too_many_tool_calls_per_turn',
        message: \`单轮工具调用过多 (\${callCount}>\${SAFETY_LIMITS.maxToolCallsPerTurn})\`,
        suggestion: '已限制工具调用数量，继续处理'
      };
    }

    return { canContinue: true };
  }

  // 更新统计
  recordTurnComplete(stats: TurnStats): void {
    this.turnCount++;
    this.totalToolCalls += stats.toolCallCount;
    this.totalTokensUsed += stats.tokensUsed;
    this.lastActivityTime = Date.now();

    if (stats.hasError) {
      this.consecutiveErrors++;
    } else {
      this.consecutiveErrors = 0;  // 成功后重置
    }
  }

  // 获取当前状态
  getStatus(): SafetyStatus {
    return {
      turnCount: this.turnCount,
      turnRemaining: SAFETY_LIMITS.maxTurns - this.turnCount,
      toolCallsRemaining: SAFETY_LIMITS.maxTotalToolCalls - this.totalToolCalls,
      tokensRemaining: SAFETY_LIMITS.maxTokensPerSession - this.totalTokensUsed,
      healthStatus: this.calculateHealthStatus()
    };
  }

  private calculateHealthStatus(): 'healthy' | 'warning' | 'critical' {
    const turnPercent = this.turnCount / SAFETY_LIMITS.maxTurns;
    const toolCallPercent = this.totalToolCalls / SAFETY_LIMITS.maxTotalToolCalls;
    const tokenPercent = this.totalTokensUsed / SAFETY_LIMITS.maxTokensPerSession;

    const maxPercent = Math.max(turnPercent, toolCallPercent, tokenPercent);

    if (maxPercent > 0.9) return 'critical';
    if (maxPercent > 0.7) return 'warning';
    return 'healthy';
  }
}

/*
安全阀触发条件：

┌─────────────────────────────────────────────────────────────────┐
│ 硬性限制（立即终止）                                             │
├─────────────────────────────────────────────────────────────────┤
│ • maxTurns = 100                     已用: [████████░░] 80%     │
│ • maxTotalToolCalls = 500            已用: [███░░░░░░░] 30%     │
│ • maxConsecutiveErrors = 5           当前: 0                    │
│ • maxTokensPerSession = 1M           已用: [██░░░░░░░░] 20%     │
├─────────────────────────────────────────────────────────────────┤
│ 软性限制（警告但可继续）                                          │
├─────────────────────────────────────────────────────────────────┤
│ • maxToolCallsPerTurn = 20           单轮: 8/20                 │
│ • maxIdleTime = 5min                 空闲: 2min                 │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="循环安全机制"
          />

          <HighlightBox title="安全阀层级" color="red" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-red-400 mb-2">第一层：轮次限制</h5>
                <p className="text-gray-300">最多 100 轮对话，防止无限循环</p>
              </div>
              <div>
                <h5 className="font-semibold text-yellow-400 mb-2">第二层：工具调用限制</h5>
                <p className="text-gray-300">总计 500 次工具调用上限</p>
              </div>
              <div>
                <h5 className="font-semibold text-blue-400 mb-2">第三层：循环检测</h5>
                <p className="text-gray-300">检测重复模式自动中断</p>
              </div>
            </div>
          </HighlightBox>
        </Layer>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          GeminiChat 是系统核心，出现问题时需要系统化的调试方法。
        </p>

        {/* 问题1: AI 无响应 */}
        <Layer title="问题1: AI 无响应或响应中断" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• 发送消息后长时间无响应</li>
              <li>• 响应在中间突然停止</li>
              <li>• 出现"正在思考..."但没有后续</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`// 无响应问题诊断
// packages/core/src/core/debug/chatDebugger.ts

class ChatDebugger {
  // 诊断无响应问题
  async diagnoseNoResponse(): Promise<DiagnosisReport> {
    const checks: DiagnosisCheck[] = [];

    // 1. 检查网络连接
    checks.push(await this.checkNetworkConnectivity());

    // 2. 检查 API 健康状态
    checks.push(await this.checkApiHealth());

    // 3. 检查 token 余额
    checks.push(await this.checkTokenBalance());

    // 4. 检查请求是否发出
    checks.push(this.checkRequestSent());

    // 5. 检查响应是否开始
    checks.push(this.checkResponseStarted());

    // 6. 检查流处理状态
    checks.push(this.checkStreamProcessingState());

    return {
      checks,
      diagnosis: this.analyzeDiagnosis(checks),
      recommendations: this.generateRecommendations(checks)
    };
  }

  // 检查请求是否正确发出
  private checkRequestSent(): DiagnosisCheck {
    const lastRequest = this.getLastRequest();

    if (!lastRequest) {
      return {
        name: 'request_sent',
        status: 'fail',
        message: '未发现发出的请求',
        details: '消息可能在发送前就失败了'
      };
    }

    if (lastRequest.status === 'pending') {
      return {
        name: 'request_sent',
        status: 'warning',
        message: '请求已发出但未收到响应',
        details: \`已等待 \${Date.now() - lastRequest.sentAt}ms\`
      };
    }

    return {
      name: 'request_sent',
      status: 'pass',
      message: '请求已成功发出'
    };
  }

  // 检查流处理状态
  private checkStreamProcessingState(): DiagnosisCheck {
    const streamState = this.getStreamState();

    if (!streamState) {
      return {
        name: 'stream_processing',
        status: 'unknown',
        message: '无流状态信息'
      };
    }

    if (streamState.isStalled) {
      return {
        name: 'stream_processing',
        status: 'fail',
        message: '流处理停滞',
        details: \`最后数据接收: \${streamState.timeSinceLastChunk}ms 前
已接收 chunks: \${streamState.chunkCount}
已接收文本: \${streamState.textLength} 字符\`,
        suggestion: '可能是网络问题或 API 端问题'
      };
    }

    return {
      name: 'stream_processing',
      status: 'pass',
      message: '流处理正常'
    };
  }
}

// 使用调试器
const debugger = new ChatDebugger();

// 诊断无响应
const report = await debugger.diagnoseNoResponse();
console.log('诊断报告:', report);

/*
诊断报告示例：

{
  checks: [
    { name: 'network_connectivity', status: 'pass', message: '网络连接正常' },
    { name: 'api_health', status: 'pass', message: 'API 服务健康' },
    { name: 'token_balance', status: 'pass', message: 'Token 余额充足' },
    { name: 'request_sent', status: 'pass', message: '请求已发出' },
    { name: 'response_started', status: 'fail', message: '未收到响应开始' },
    { name: 'stream_processing', status: 'unknown', message: '无流状态' }
  ],
  diagnosis: {
    type: 'api_not_responding',
    confidence: 0.8,
    message: 'API 已收到请求但未开始响应'
  },
  recommendations: [
    '1. 检查 API 服务状态页面',
    '2. 尝试重新发送请求',
    '3. 检查请求是否包含可能触发过滤的内容'
  ]
}
*/`}
            language="typescript"
            title="无响应诊断"
          />

          <HighlightBox title="快速解决方案" color="green" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-green-400 mb-2">网络问题</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• 检查网络连接</li>
                  <li>• 尝试使用代理</li>
                  <li>• 检查防火墙设置</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-green-400 mb-2">API 问题</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• 检查 API 状态页</li>
                  <li>• 验证 API Key</li>
                  <li>• 检查配额限制</li>
                </ul>
              </div>
            </div>
          </HighlightBox>
        </Layer>

        {/* 问题2: 工具调用失败 */}
        <Layer title="问题2: 工具调用执行失败" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• AI 发起工具调用但执行失败</li>
              <li>• 工具返回错误后 AI 反复重试</li>
              <li>• 工具参数解析错误</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`// 工具调用失败诊断
// packages/core/src/core/debug/toolCallDebugger.ts

interface ToolCallFailure {
  toolName: string;
  args: unknown;
  error: Error;
  phase: 'parse' | 'validate' | 'execute' | 'result';
}

class ToolCallDebugger {
  // 分析工具调用失败
  analyzeFailure(failure: ToolCallFailure): FailureAnalysis {
    switch (failure.phase) {
      case 'parse':
        return this.analyzeParseFailure(failure);
      case 'validate':
        return this.analyzeValidationFailure(failure);
      case 'execute':
        return this.analyzeExecutionFailure(failure);
      case 'result':
        return this.analyzeResultFailure(failure);
    }
  }

  // 解析阶段失败
  private analyzeParseFailure(failure: ToolCallFailure): FailureAnalysis {
    const errorMsg = failure.error.message;

    // 常见解析错误
    if (errorMsg.includes('JSON')) {
      return {
        cause: 'invalid_json',
        explanation: 'AI 生成的参数不是有效 JSON',
        details: \`原始参数: \${JSON.stringify(failure.args)}\`,
        fix: '这通常是 AI 模型的问题，重试或重新表述请求'
      };
    }

    if (errorMsg.includes('unexpected token')) {
      return {
        cause: 'malformed_arguments',
        explanation: '参数格式错误',
        fix: '检查 AI 是否正确理解了工具的参数格式'
      };
    }

    return {
      cause: 'unknown_parse_error',
      explanation: errorMsg,
      fix: '查看详细日志了解更多信息'
    };
  }

  // 执行阶段失败
  private analyzeExecutionFailure(failure: ToolCallFailure): FailureAnalysis {
    const errorMsg = failure.error.message;

    // 文件操作错误
    if (failure.toolName === 'Read' || failure.toolName === 'Write') {
      if (errorMsg.includes('ENOENT')) {
        return {
          cause: 'file_not_found',
          explanation: \`文件不存在: \${(failure.args as any).file_path}\`,
          fix: '检查文件路径是否正确'
        };
      }
      if (errorMsg.includes('EACCES')) {
        return {
          cause: 'permission_denied',
          explanation: '没有权限访问文件',
          fix: '检查文件权限或使用 sudo'
        };
      }
    }

    // 命令执行错误
    if (failure.toolName === 'Bash') {
      if (errorMsg.includes('command not found')) {
        const command = (failure.args as any).command?.split(' ')[0];
        return {
          cause: 'command_not_found',
          explanation: \`命令不存在: \${command}\`,
          fix: '确保命令已安装并在 PATH 中'
        };
      }
      if (errorMsg.includes('timeout')) {
        return {
          cause: 'command_timeout',
          explanation: '命令执行超时',
          fix: '增加超时时间或检查命令是否卡住'
        };
      }
    }

    return {
      cause: 'execution_error',
      explanation: errorMsg,
      fix: '查看完整错误堆栈'
    };
  }

  // 生成修复建议
  generateFixSuggestions(analysis: FailureAnalysis): string[] {
    const suggestions: string[] = [];

    switch (analysis.cause) {
      case 'file_not_found':
        suggestions.push('使用 Glob 工具查找正确的文件路径');
        suggestions.push('检查工作目录是否正确');
        break;

      case 'permission_denied':
        suggestions.push('检查文件/目录权限');
        suggestions.push('考虑使用沙箱模式');
        break;

      case 'command_not_found':
        suggestions.push('检查命令是否安装');
        suggestions.push('使用完整路径执行命令');
        break;

      case 'invalid_json':
        suggestions.push('重新表述请求，使 AI 生成正确的参数');
        suggestions.push('简化工具调用参数');
        break;
    }

    return suggestions;
  }
}

/*
工具调用失败类型分布：

┌────────────────────────────────────────────────────────────────┐
│ 失败类型               │ 占比   │ 常见原因                      │
├────────────────────────────────────────────────────────────────┤
│ 文件不存在             │ 35%   │ 路径错误、相对路径问题          │
│ 权限问题               │ 20%   │ 文件权限、目录权限              │
│ 参数解析错误           │ 15%   │ JSON 格式错误、类型不匹配       │
│ 命令执行错误           │ 15%   │ 命令不存在、超时                │
│ 网络错误               │ 10%   │ API 调用失败                   │
│ 其他                   │ 5%    │ 未知错误                       │
└────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="工具调用失败诊断"
          />
        </Layer>

        {/* 问题3: 上下文丢失 */}
        <Layer title="问题3: AI 上下文丢失" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• AI 突然"忘记"之前讨论的内容</li>
              <li>• AI 重复已经完成的操作</li>
              <li>• AI 无法引用之前的文件或代码</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`// 上下文丢失诊断
// packages/core/src/core/debug/contextDebugger.ts

class ContextDebugger {
  // 检查上下文完整性
  checkContextIntegrity(history: Content[]): ContextReport {
    const issues: ContextIssue[] = [];

    // 1. 检查消息连续性
    const continuityCheck = this.checkMessageContinuity(history);
    if (!continuityCheck.continuous) {
      issues.push({
        type: 'discontinuity',
        severity: 'high',
        message: \`消息序列在第 \${continuityCheck.breakPoint} 条消息处断裂\`,
        details: continuityCheck.details
      });
    }

    // 2. 检查角色交替
    const roleCheck = this.checkRoleAlternation(history);
    if (!roleCheck.valid) {
      issues.push({
        type: 'role_issue',
        severity: 'medium',
        message: \`角色序列异常: \${roleCheck.issue}\`,
        details: roleCheck.details
      });
    }

    // 3. 检查工具调用配对
    const toolCheck = this.checkToolCallPairing(history);
    if (toolCheck.unpaired.length > 0) {
      issues.push({
        type: 'unpaired_tool_calls',
        severity: 'high',
        message: \`\${toolCheck.unpaired.length} 个工具调用没有对应的结果\`,
        details: toolCheck.unpaired
      });
    }

    // 4. 检查 Token 使用
    const tokenCheck = this.checkTokenUsage(history);
    if (tokenCheck.nearLimit) {
      issues.push({
        type: 'token_pressure',
        severity: 'warning',
        message: \`Token 使用接近上限 (\${tokenCheck.usedPercent}%)\`,
        details: '可能触发了上下文压缩'
      });
    }

    // 5. 检查压缩标记
    const compressionCheck = this.checkCompressionMarkers(history);
    if (compressionCheck.hasCompression) {
      issues.push({
        type: 'context_compressed',
        severity: 'info',
        message: '上下文已被压缩',
        details: \`压缩了 \${compressionCheck.removedMessages} 条消息\`
      });
    }

    return {
      healthy: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      recommendations: this.generateRecommendations(issues),
      statistics: this.calculateStatistics(history)
    };
  }

  // 检查工具调用配对
  private checkToolCallPairing(history: Content[]): ToolPairingCheck {
    const pendingCalls = new Map<string, ToolCall>();
    const unpaired: string[] = [];

    for (const content of history) {
      for (const part of content.parts) {
        if (part.functionCall) {
          // 记录工具调用
          pendingCalls.set(part.functionCall.name, part.functionCall);
        }

        if (part.functionResponse) {
          // 找到配对的调用
          if (pendingCalls.has(part.functionResponse.name)) {
            pendingCalls.delete(part.functionResponse.name);
          }
        }
      }
    }

    // 检查未配对的调用
    for (const [name, call] of pendingCalls) {
      unpaired.push(\`\${name}(\${JSON.stringify(call.args).substring(0, 50)}...)\`);
    }

    return {
      allPaired: unpaired.length === 0,
      unpaired
    };
  }

  // 检测并报告上下文问题
  diagnoseContextLoss(
    expectedContext: string[],
    currentHistory: Content[]
  ): ContextLossDiagnosis {
    const missingContext: string[] = [];
    const historyText = this.extractTextFromHistory(currentHistory);

    for (const expected of expectedContext) {
      if (!historyText.includes(expected)) {
        missingContext.push(expected);
      }
    }

    if (missingContext.length === 0) {
      return {
        hasLoss: false,
        message: '上下文完整'
      };
    }

    return {
      hasLoss: true,
      missingContext,
      possibleCauses: [
        '上下文因 token 限制被压缩',
        '会话在处理过程中被中断',
        '历史记录被意外清除'
      ],
      recovery: this.suggestRecovery(missingContext)
    };
  }
}

/*
上下文问题诊断流程：

┌─────────────────────────────────────────────────────────────────┐
│                    上下文完整性检查                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [消息连续性] ──→ 是否有断裂？                                 │
│         │                                                       │
│         ▼                                                       │
│   [角色交替] ──→ user/model 是否正确交替？                      │
│         │                                                       │
│         ▼                                                       │
│   [工具配对] ──→ functionCall 是否都有 functionResponse？       │
│         │                                                       │
│         ▼                                                       │
│   [Token检查] ──→ 是否接近上下文窗口限制？                       │
│         │                                                       │
│         ▼                                                       │
│   [压缩检测] ──→ 是否发生过上下文压缩？                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="上下文丢失诊断"
          />
        </Layer>

        {/* 调试日志 */}
        <Layer title="调试日志配置" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// GeminiChat 调试日志
// packages/core/src/core/geminiChat.ts

const DEBUG_FLAGS = {
  // 基础调试
  CHAT_DEBUG: process.env.DEBUG_CHAT === 'true',

  // 详细日志
  LOG_HISTORY: process.env.DEBUG_HISTORY === 'true',
  LOG_STREAM: process.env.DEBUG_STREAM === 'true',
  LOG_TOOLS: process.env.DEBUG_TOOLS === 'true',

  // 性能追踪
  TRACE_TIMING: process.env.TRACE_TIMING === 'true',

  // 数据转储
  DUMP_REQUESTS: process.env.DUMP_REQUESTS === 'true',
  DUMP_RESPONSES: process.env.DUMP_RESPONSES === 'true'
};

class ChatLogger {
  // 记录发送的消息
  logMessageSent(content: Content): void {
    if (!DEBUG_FLAGS.CHAT_DEBUG) return;

    console.log('\\n[GeminiChat] 发送消息:');
    console.log('  角色:', content.role);
    console.log('  部分数:', content.parts.length);

    if (DEBUG_FLAGS.LOG_HISTORY) {
      console.log('  内容预览:', this.previewContent(content));
    }
  }

  // 记录流事件
  logStreamEvent(event: StreamEvent): void {
    if (!DEBUG_FLAGS.LOG_STREAM) return;

    const timestamp = new Date().toISOString();
    console.log(\`[Stream \${timestamp}] 事件: \${event.type}\`);

    switch (event.type) {
      case 'text':
        console.log(\`  文本: "\${event.content.substring(0, 50)}..."\`);
        break;
      case 'tool_call':
        console.log(\`  工具: \${event.call.name}\`);
        console.log(\`  参数: \${JSON.stringify(event.call.args).substring(0, 100)}\`);
        break;
      case 'finish':
        console.log(\`  原因: \${event.reason}\`);
        break;
    }
  }

  // 记录工具执行
  logToolExecution(call: ToolCall, result: ToolResult): void {
    if (!DEBUG_FLAGS.LOG_TOOLS) return;

    console.log(\`\\n[Tool] \${call.name}\`);
    console.log('  参数:', JSON.stringify(call.args, null, 2));
    console.log('  结果:', result.success ? '成功' : '失败');
    if (result.error) {
      console.log('  错误:', result.error);
    }
  }

  // 性能追踪
  logTiming(phase: string, durationMs: number): void {
    if (!DEBUG_FLAGS.TRACE_TIMING) return;

    const bar = '█'.repeat(Math.min(Math.floor(durationMs / 100), 50));
    console.log(\`[Timing] \${phase.padEnd(20)} \${durationMs.toFixed(0).padStart(6)}ms \${bar}\`);
  }
}

// 使用示例
DEBUG_CHAT=true DEBUG_STREAM=true innies

/*
调试输出示例：

[GeminiChat] 发送消息:
  角色: user
  部分数: 1
  内容预览: "请帮我读取 package.json 文件"

[Stream 2024-01-15T10:30:00.123Z] 事件: text
  文本: "好的，我来帮你读取 package.json 文件..."

[Stream 2024-01-15T10:30:00.456Z] 事件: tool_call
  工具: Read
  参数: {"file_path":"/project/package.json"}

[Tool] Read
  参数: { "file_path": "/project/package.json" }
  结果: 成功

[Stream 2024-01-15T10:30:01.234Z] 事件: text
  文本: "package.json 文件的内容如下..."

[Stream 2024-01-15T10:30:02.567Z] 事件: finish
  原因: stop

[Timing] api_call              850ms ████████
[Timing] stream_process        1420ms ██████████████
[Timing] tool_execution        120ms █
[Timing] total                 2390ms ███████████████████████
*/`}
            language="typescript"
            title="调试日志配置"
          />
        </Layer>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          GeminiChat 的性能直接影响用户体验，以下是关键优化策略。
        </p>

        {/* 响应延迟优化 */}
        <Layer title="1. 响应延迟优化" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 响应延迟优化策略
// packages/core/src/core/optimization/latencyOptimizer.ts

interface LatencyMetrics {
  timeToFirstToken: number;    // 首 token 延迟
  streamProcessTime: number;   // 流处理时间
  toolExecutionTime: number;   // 工具执行时间
  totalResponseTime: number;   // 总响应时间
}

class LatencyOptimizer {
  // 优化请求构建
  optimizeRequest(request: GenerateRequest): OptimizedRequest {
    return {
      ...request,

      // 1. 压缩历史以减少传输时间
      history: this.compressHistoryForSpeed(request.history),

      // 2. 优化系统提示
      systemInstruction: this.optimizeSystemPrompt(request.systemInstruction),

      // 3. 设置合理的 token 限制
      generationConfig: {
        ...request.generationConfig,
        maxOutputTokens: this.calculateOptimalMaxTokens(request),
        // 稍微提高温度可以减少思考时间
        temperature: Math.min(request.generationConfig?.temperature || 0.7, 0.9)
      }
    };
  }

  // 预热连接
  async warmupConnection(): Promise<void> {
    // 发送一个轻量级请求来预热 HTTP 连接
    await this.sendPingRequest();

    // 预加载常用工具定义
    await this.preloadToolDefinitions();
  }

  // 并行化可并行的操作
  async parallelizeOperations(
    operations: Operation[]
  ): Promise<OperationResult[]> {
    // 分析依赖关系
    const { independent, dependent } = this.categorizeOperations(operations);

    // 并行执行独立操作
    const independentResults = await Promise.all(
      independent.map(op => this.executeOperation(op))
    );

    // 串行执行依赖操作
    const dependentResults: OperationResult[] = [];
    for (const op of dependent) {
      const result = await this.executeOperation(op);
      dependentResults.push(result);
    }

    return [...independentResults, ...dependentResults];
  }

  // 流式处理优化
  optimizeStreamProcessing(): StreamConfig {
    return {
      // 增大缓冲区减少 yield 次数
      bufferSize: 100,

      // 批量处理小 chunk
      batchSmallChunks: true,
      batchThreshold: 10,

      // 异步解析不阻塞渲染
      asyncParsing: true,

      // 优先处理文本，延迟处理工具调用
      prioritizeText: true
    };
  }
}

// 延迟分析报告
function generateLatencyReport(metrics: LatencyMetrics): LatencyReport {
  const breakdown = [
    { phase: '首 Token', time: metrics.timeToFirstToken, target: 500 },
    { phase: '流处理', time: metrics.streamProcessTime, target: 2000 },
    { phase: '工具执行', time: metrics.toolExecutionTime, target: 1000 },
  ];

  const slowPhases = breakdown.filter(b => b.time > b.target * 1.5);

  return {
    totalTime: metrics.totalResponseTime,
    breakdown,
    bottlenecks: slowPhases.map(p => ({
      phase: p.phase,
      actual: p.time,
      target: p.target,
      excess: p.time - p.target
    })),
    recommendations: generateRecommendations(slowPhases)
  };
}

/*
延迟分解示例：

┌─────────────────────────────────────────────────────────────────┐
│ 阶段                    │ 实际     │ 目标     │ 状态            │
├─────────────────────────────────────────────────────────────────┤
│ 首 Token (TTFT)         │ 450ms   │ 500ms   │ ✅ 正常         │
│ 流处理                  │ 1800ms  │ 2000ms  │ ✅ 正常         │
│ 工具执行                │ 2500ms  │ 1000ms  │ ⚠️ 偏慢         │
│ 总计                    │ 4750ms  │ 3500ms  │ ⚠️ 需优化       │
├─────────────────────────────────────────────────────────────────┤
│ 优化建议：                                                      │
│ 1. 工具执行是瓶颈，考虑并行执行独立的工具调用                     │
│ 2. 检查慢速工具（Read 大文件、Bash 长命令）                      │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="延迟优化策略"
          />
        </Layer>

        {/* Token 使用优化 */}
        <Layer title="2. Token 使用优化" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// Token 使用优化
// packages/core/src/core/optimization/tokenOptimizer.ts

interface TokenUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  contextUtilization: number;  // 上下文使用率
}

class TokenOptimizer {
  private readonly CONTEXT_WINDOW = 128000;  // 128K
  private readonly COST_PER_1K_INPUT = 0.0025;
  private readonly COST_PER_1K_OUTPUT = 0.01;

  // 优化历史发送策略
  optimizeHistory(
    history: Content[],
    importance: ImportanceMap
  ): OptimizedHistory {
    // 1. 计算每条消息的重要性分数
    const scoredHistory = history.map((content, index) => ({
      content,
      score: this.calculateImportance(content, index, importance),
      tokens: this.countTokens(content)
    }));

    // 2. 按重要性排序
    const sorted = [...scoredHistory].sort((a, b) => b.score - a.score);

    // 3. 贪心选择直到达到预算
    const budget = this.CONTEXT_WINDOW * 0.8;  // 保留 20% 给响应
    let selected: typeof scoredHistory = [];
    let usedTokens = 0;

    // 始终包含最近的消息
    const recentCount = Math.min(10, history.length);
    const recentMessages = scoredHistory.slice(-recentCount);
    for (const msg of recentMessages) {
      selected.push(msg);
      usedTokens += msg.tokens;
    }

    // 添加高重要性的历史消息
    for (const msg of sorted) {
      if (selected.includes(msg)) continue;
      if (usedTokens + msg.tokens > budget) continue;

      selected.push(msg);
      usedTokens += msg.tokens;
    }

    // 4. 恢复原始顺序
    selected.sort((a, b) =>
      scoredHistory.indexOf(a) - scoredHistory.indexOf(b)
    );

    return {
      history: selected.map(s => s.content),
      tokensSaved: this.getTotalTokens(history) - usedTokens,
      removedCount: history.length - selected.length
    };
  }

  // 计算消息重要性
  private calculateImportance(
    content: Content,
    index: number,
    importance: ImportanceMap
  ): number {
    let score = 0;

    // 最近的消息更重要
    const recencyScore = 1 / (1 + Math.log(index + 1));
    score += recencyScore * 30;

    // 用户消息通常比 AI 消息重要
    if (content.role === 'user') {
      score += 20;
    }

    // 包含关键信息的消息
    const text = this.extractText(content);
    if (importance.keywords.some(kw => text.includes(kw))) {
      score += 25;
    }

    // 工具调用结果可能可以压缩
    if (this.hasToolResponse(content)) {
      score -= 10;  // 降低优先级，因为可以截断
    }

    // 用户明确标记的重要内容
    if (importance.pinnedMessages.includes(index)) {
      score += 50;
    }

    return score;
  }

  // 压缩工具响应
  compressToolResponses(history: Content[]): Content[] {
    return history.map(content => {
      if (!this.hasToolResponse(content)) {
        return content;
      }

      const compressedParts = content.parts.map(part => {
        if (!part.functionResponse) return part;

        const response = part.functionResponse.response;
        const responseStr = JSON.stringify(response);

        // 超过阈值就压缩
        if (responseStr.length > 2000) {
          return {
            ...part,
            functionResponse: {
              ...part.functionResponse,
              response: this.summarizeResponse(response, 500)
            }
          };
        }

        return part;
      });

      return { ...content, parts: compressedParts };
    });
  }

  // 生成成本报告
  generateCostReport(stats: TokenUsageStats): CostReport {
    const inputCost = (stats.promptTokens / 1000) * this.COST_PER_1K_INPUT;
    const outputCost = (stats.completionTokens / 1000) * this.COST_PER_1K_OUTPUT;

    return {
      inputTokens: stats.promptTokens,
      outputTokens: stats.completionTokens,
      totalTokens: stats.totalTokens,
      inputCost: inputCost.toFixed(4),
      outputCost: outputCost.toFixed(4),
      totalCost: (inputCost + outputCost).toFixed(4),
      contextUtilization: \`\${(stats.contextUtilization * 100).toFixed(1)}%\`,
      recommendations: this.generateCostRecommendations(stats)
    };
  }
}

/*
Token 优化效果：

优化前：
- 平均每轮 input tokens: 50,000
- 上下文使用率: 85%
- 成本: $0.125/轮

优化后（历史压缩 + 工具响应摘要）：
- 平均每轮 input tokens: 25,000
- 上下文使用率: 45%
- 成本: $0.0625/轮

节省: 50% token，50% 成本
*/`}
            language="typescript"
            title="Token 优化策略"
          />
        </Layer>

        {/* 缓存策略 */}
        <Layer title="3. 智能缓存策略" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 智能缓存实现
// packages/core/src/core/optimization/cacheManager.ts

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  ttl: number;
}

class GeminiChatCache {
  private toolResultCache = new LRUCache<string, ToolResult>(1000);
  private promptCache = new LRUCache<string, GenerateResponse>(100);
  private historyCache = new WeakMap<Content[], string>();

  // 工具结果缓存
  async getCachedToolResult(
    toolName: string,
    args: unknown
  ): Promise<ToolResult | null> {
    const key = this.createToolCacheKey(toolName, args);

    // 检查工具是否可缓存
    if (!this.isToolCacheable(toolName)) {
      return null;
    }

    const cached = this.toolResultCache.get(key);
    if (cached && this.isValid(cached)) {
      cached.hits++;
      return cached.value;
    }

    return null;
  }

  // 缓存工具结果
  cacheToolResult(
    toolName: string,
    args: unknown,
    result: ToolResult
  ): void {
    if (!this.isToolCacheable(toolName)) return;
    if (!result.success) return;  // 不缓存失败结果

    const key = this.createToolCacheKey(toolName, args);
    const ttl = this.getTTL(toolName);

    this.toolResultCache.set(key, {
      value: result,
      timestamp: Date.now(),
      hits: 0,
      ttl
    });
  }

  // 判断工具是否可缓存
  private isToolCacheable(toolName: string): boolean {
    const CACHEABLE_TOOLS = [
      'Glob',      // 文件搜索结果短期有效
      'Grep',      // 代码搜索结果短期有效
      'Read',      // 文件内容可缓存（配合文件监控）
      'LSP'        // 符号信息可缓存
    ];

    const NON_CACHEABLE_TOOLS = [
      'Bash',      // 命令结果可能变化
      'Write',     // 写操作不应缓存
      'Edit',      // 编辑操作不应缓存
      'WebFetch'   // 网页内容可能变化
    ];

    return CACHEABLE_TOOLS.includes(toolName);
  }

  // 获取 TTL
  private getTTL(toolName: string): number {
    const TTL_MAP: Record<string, number> = {
      'Glob': 60 * 1000,       // 1 分钟
      'Grep': 30 * 1000,       // 30 秒
      'Read': 5 * 60 * 1000,   // 5 分钟（配合文件监控失效）
      'LSP': 10 * 60 * 1000    // 10 分钟
    };

    return TTL_MAP[toolName] || 60 * 1000;
  }

  // 历史哈希缓存（用于检测重复请求）
  getHistoryHash(history: Content[]): string {
    let hash = this.historyCache.get(history);

    if (!hash) {
      hash = this.computeHistoryHash(history);
      this.historyCache.set(history, hash);
    }

    return hash;
  }

  // 相似请求检测
  findSimilarRequest(
    currentHistory: Content[]
  ): CachedRequest | null {
    const currentHash = this.getHistoryHash(currentHistory);

    // 检查完全匹配
    const exactMatch = this.promptCache.get(currentHash);
    if (exactMatch && this.isValid(exactMatch)) {
      return {
        type: 'exact',
        response: exactMatch.value,
        confidence: 1.0
      };
    }

    // 检查相似匹配（最后 N 条消息相同）
    const similarMatch = this.findSimilarByRecentMessages(currentHistory);
    if (similarMatch) {
      return {
        type: 'similar',
        response: similarMatch.response,
        confidence: similarMatch.similarity
      };
    }

    return null;
  }

  // 缓存统计
  getStats(): CacheStats {
    const toolStats = this.toolResultCache.getStats();
    const promptStats = this.promptCache.getStats();

    return {
      toolResultCache: {
        size: toolStats.size,
        hitRate: toolStats.hitRate,
        memoryUsage: toolStats.memoryUsage
      },
      promptCache: {
        size: promptStats.size,
        hitRate: promptStats.hitRate,
        memoryUsage: promptStats.memoryUsage
      },
      totalHits: toolStats.hits + promptStats.hits,
      totalMisses: toolStats.misses + promptStats.misses,
      estimatedSavings: this.calculateSavings()
    };
  }
}

/*
缓存效果统计：

┌─────────────────────────────────────────────────────────────────┐
│ 缓存类型               │ 命中率   │ 节省时间    │ 节省 Token    │
├─────────────────────────────────────────────────────────────────┤
│ 工具结果缓存           │ 45%     │ ~200ms/次   │ -             │
│ 文件读取缓存           │ 60%     │ ~50ms/次    │ ~500/次       │
│ 搜索结果缓存           │ 30%     │ ~100ms/次   │ ~200/次       │
│ 提示缓存（相似请求）    │ 5%      │ ~2000ms/次  │ ~5000/次      │
├─────────────────────────────────────────────────────────────────┤
│ 总体效果               │         │ 20% 提速    │ 15% Token 节省│
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="缓存策略"
          />
        </Layer>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          GeminiChat 是系统的核心枢纽，与多个模块紧密协作。
        </p>

        {/* 架构位置图 */}
        <Layer title="架构位置" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
flowchart TB
    subgraph "用户交互层"
        UI[UI Components]
        IL[InteractionLoop]
    end

    subgraph "核心对话层"
        GC[GeminiChat<br/>核心聊天]
        HM[HistoryManager<br/>历史管理]
        SM[StreamManager<br/>流管理]
    end

    subgraph "内容生成层"
        CG[ContentGenerator<br/>内容生成器]
        SP[StreamParser<br/>流解析器]
    end

    subgraph "工具执行层"
        TS[ToolScheduler<br/>工具调度器]
        TR[ToolRegistry<br/>工具注册表]
        TE[Tool Executors<br/>工具执行器]
    end

    subgraph "辅助服务"
        LD[LoopDetection<br/>循环检测]
        TM[Telemetry<br/>遥测]
        CFG[Config<br/>配置]
    end

    UI --> IL
    IL --> GC

    GC --> HM
    GC --> SM
    GC --> CG
    GC --> TS
    GC --> LD

    CG --> SP
    TS --> TR
    TS --> TE

    GC --> TM
    CFG --> GC

    style GC fill:#22d3ee,color:#000
    style IL fill:#a855f7,color:#fff
    style CG fill:#22c55e,color:#000
    style TS fill:#f59e0b,color:#000
          `} />

          <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">模块职责说明</h5>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h6 className="text-blue-400 font-semibold mb-1">上游模块</h6>
                <ul className="space-y-1">
                  <li><strong>InteractionLoop：</strong>用户输入处理</li>
                  <li><strong>UI：</strong>界面渲染和交互</li>
                </ul>
              </div>
              <div>
                <h6 className="text-green-400 font-semibold mb-1">下游模块</h6>
                <ul className="space-y-1">
                  <li><strong>ContentGenerator：</strong>API 调用</li>
                  <li><strong>ToolScheduler：</strong>工具执行</li>
                </ul>
              </div>
            </div>
          </div>
        </Layer>

        {/* 核心交互流程 */}
        <Layer title="核心交互流程" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
sequenceDiagram
    participant User as 用户
    participant IL as InteractionLoop
    participant GC as GeminiChat
    participant CG as ContentGenerator
    participant TS as ToolScheduler
    participant LD as LoopDetection

    User->>IL: 输入消息
    IL->>GC: sendMessageStream(message)

    loop 直到 finish_reason = stop
        GC->>GC: history.push(message)
        GC->>CG: generateContentStream(history)

        loop 流式接收
            CG-->>GC: StreamChunk
            GC-->>IL: StreamEvent

            alt 有工具调用
                GC->>TS: executeToolCalls(calls)
                TS-->>GC: ToolResults
                GC->>GC: history.push(results)
            end
        end

        GC->>LD: checkForLoop(response)
        LD-->>GC: LoopStatus

        alt 检测到循环
            GC->>IL: 循环警告
            IL->>User: 显示警告
        end
    end

    GC-->>IL: 对话完成
    IL-->>User: 显示最终结果
          `} />
        </Layer>

        {/* 接口定义 */}
        <Layer title="核心接口定义" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// GeminiChat 对外接口
// packages/core/src/core/geminiChat.ts

// =========================================
// 与 InteractionLoop 的接口
// =========================================

interface GeminiChatInterface {
  // 主要方法：发送消息并获取流式响应
  sendMessageStream(
    model: string,
    params: SendMessageParameters,
    promptId: string
  ): Promise<AsyncGenerator<StreamEvent>>;

  // 获取对话历史
  getHistory(curated?: boolean): Content[];

  // 重置对话
  reset(): void;

  // 中止当前请求
  abort(): void;
}

// StreamEvent 类型
type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'tool_result'; result: ToolResult }
  | { type: 'thought'; content: string }
  | { type: 'finish'; reason: FinishReason }
  | { type: 'error'; error: Error };

// =========================================
// 与 ContentGenerator 的接口
// =========================================

interface ContentGeneratorInterface {
  // 生成内容流
  generateContentStream(
    request: GenerateContentRequest
  ): AsyncGenerator<GenerateContentChunk>;

  // 单次生成（非流式）
  generateContent(
    request: GenerateContentRequest
  ): Promise<GenerateContentResponse>;

  // 计算 token 数
  countTokens(content: Content[]): Promise<number>;
}

// =========================================
// 与 ToolScheduler 的接口
// =========================================

interface ToolSchedulerInterface {
  // 执行工具调用批次
  executeBatch(
    calls: ToolCall[],
    options?: ExecutionOptions
  ): AsyncGenerator<ToolExecutionEvent>;

  // 单个工具调用
  execute(
    call: ToolCall,
    options?: ExecutionOptions
  ): Promise<ToolResult>;

  // 检查工具权限
  checkPermission(
    toolName: string,
    args: unknown
  ): Promise<PermissionResult>;
}

// =========================================
// 与 LoopDetection 的接口
// =========================================

interface LoopDetectionInterface {
  // 检查响应是否表明循环
  checkForLoop(
    response: AIResponse,
    history: Content[]
  ): Promise<LoopCheckResult>;

  // 记录用户覆盖
  recordUserOverride(result: LoopCheckResult): void;

  // 重置检测状态
  reset(): void;
}

// =========================================
// 事件回调接口
// =========================================

interface GeminiChatCallbacks {
  // 开始新轮次
  onTurnStart?: (turnNumber: number) => void;

  // 轮次结束
  onTurnEnd?: (turnNumber: number, stats: TurnStats) => void;

  // 工具调用开始
  onToolCallStart?: (call: ToolCall) => void;

  // 工具调用结束
  onToolCallEnd?: (call: ToolCall, result: ToolResult) => void;

  // 发生错误
  onError?: (error: Error, context: ErrorContext) => void;

  // 检测到循环
  onLoopDetected?: (result: LoopCheckResult) => void;

  // 上下文压缩
  onContextCompressed?: (stats: CompressionStats) => void;
}

/*
模块调用关系：

InteractionLoop
    │
    ├── sendMessageStream() ──→ GeminiChat
    │                              │
    │                              ├── generateContentStream() ──→ ContentGenerator
    │                              │                                    │
    │                              │                                    └── API 调用
    │                              │
    │                              ├── executeBatch() ──→ ToolScheduler
    │                              │                          │
    │                              │                          ├── Read, Write, Bash...
    │                              │                          └── MCP Tools
    │                              │
    │                              └── checkForLoop() ──→ LoopDetection
    │
    └── 接收 StreamEvent ──→ UI 渲染
*/`}
            language="typescript"
            title="接口定义"
          />
        </Layer>

        {/* 状态管理 */}
        <Layer title="状态管理与生命周期" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> Idle: 初始化

    Idle --> Processing: sendMessageStream()
    Processing --> WaitingResponse: API 请求发送
    WaitingResponse --> Streaming: 开始接收流

    Streaming --> ProcessingToolCall: 遇到工具调用
    ProcessingToolCall --> Streaming: 工具执行完成

    Streaming --> CheckingLoop: 响应结束
    CheckingLoop --> Processing: 检测到循环，需继续
    CheckingLoop --> Idle: 无循环，完成

    Processing --> Error: 发生错误
    WaitingResponse --> Error: 请求失败
    Streaming --> Error: 流处理错误

    Error --> Idle: 错误处理完成
    Error --> Processing: 重试

    Idle --> [*]: 销毁

    note right of Processing: 可被 abort() 中断
    note right of Streaming: 实时 yield StreamEvent
    note right of ProcessingToolCall: 支持并行执行
          `} />

          <CodeBlock
            code={`// GeminiChat 状态管理
// packages/core/src/core/geminiChat.ts

enum ChatState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  WAITING_RESPONSE = 'waiting_response',
  STREAMING = 'streaming',
  PROCESSING_TOOL = 'processing_tool',
  CHECKING_LOOP = 'checking_loop',
  ERROR = 'error'
}

class GeminiChatStateMachine {
  private state: ChatState = ChatState.IDLE;
  private stateHistory: StateTransition[] = [];

  // 状态转换
  transition(newState: ChatState, reason?: string): void {
    const transition: StateTransition = {
      from: this.state,
      to: newState,
      timestamp: Date.now(),
      reason
    };

    // 验证转换有效性
    if (!this.isValidTransition(this.state, newState)) {
      throw new InvalidStateTransitionError(this.state, newState);
    }

    this.stateHistory.push(transition);
    this.state = newState;

    // 触发状态变更回调
    this.emit('stateChange', transition);
  }

  // 验证状态转换
  private isValidTransition(from: ChatState, to: ChatState): boolean {
    const validTransitions: Record<ChatState, ChatState[]> = {
      [ChatState.IDLE]: [ChatState.PROCESSING],
      [ChatState.PROCESSING]: [ChatState.WAITING_RESPONSE, ChatState.ERROR, ChatState.IDLE],
      [ChatState.WAITING_RESPONSE]: [ChatState.STREAMING, ChatState.ERROR, ChatState.IDLE],
      [ChatState.STREAMING]: [ChatState.PROCESSING_TOOL, ChatState.CHECKING_LOOP, ChatState.ERROR, ChatState.IDLE],
      [ChatState.PROCESSING_TOOL]: [ChatState.STREAMING, ChatState.ERROR],
      [ChatState.CHECKING_LOOP]: [ChatState.PROCESSING, ChatState.IDLE, ChatState.ERROR],
      [ChatState.ERROR]: [ChatState.IDLE, ChatState.PROCESSING]
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  // 获取当前状态
  getState(): ChatState {
    return this.state;
  }

  // 是否可以发送消息
  canSendMessage(): boolean {
    return this.state === ChatState.IDLE;
  }

  // 是否可以中止
  canAbort(): boolean {
    return [
      ChatState.PROCESSING,
      ChatState.WAITING_RESPONSE,
      ChatState.STREAMING,
      ChatState.PROCESSING_TOOL
    ].includes(this.state);
  }

  // 获取状态历史（用于调试）
  getStateHistory(): StateTransition[] {
    return [...this.stateHistory];
  }
}

/*
状态转换示例：

正常流程：
IDLE → PROCESSING → WAITING_RESPONSE → STREAMING → CHECKING_LOOP → IDLE

有工具调用：
STREAMING → PROCESSING_TOOL → STREAMING → CHECKING_LOOP → PROCESSING → ...

发生错误：
任意状态 → ERROR → IDLE（或 PROCESSING 重试）

用户中止：
任意状态 → IDLE
*/`}
            language="typescript"
            title="状态管理"
          />
        </Layer>
      </Layer>

      {/* ==================== 深化内容结束 ==================== */}
    </div>
  );
}
