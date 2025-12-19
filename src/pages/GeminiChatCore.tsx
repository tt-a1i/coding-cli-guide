import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function GeminiChatCore() {
  return (
    <div>
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
