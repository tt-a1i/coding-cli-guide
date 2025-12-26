import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

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
    </div>
  );
}
