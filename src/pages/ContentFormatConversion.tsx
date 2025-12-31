import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

export function ContentFormatConversion() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['quickstart'])
  );

  const relatedPages: RelatedPage[] = [
    { id: 'multi-provider', label: '多厂商架构', description: 'OpenAI/Gemini 统一抽象' },
    { id: 'streaming-response-processing', label: '流式响应处理', description: 'Chunk 处理管道' },
    { id: 'format-converter-anim', label: '格式转换动画', description: '转换过程可视化' },
    { id: 'streaming-tool-parser-anim', label: '流式工具调用解析', description: '增量解析机制' },
    { id: 'content-gen', label: 'API 调用层', description: 'ContentGenerator 架构' },
    { id: 'ai-tool', label: 'AI 工具交互', description: 'FunctionCall 完整生命周期' },
  ];

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const conversionPipelineDiagram = `
graph LR
    subgraph Request["请求转换"]
        GR[Gemini Request<br/>GenerateContentParameters]
        OR[OpenAI Request<br/>ChatCompletionCreateParams]
    end

    subgraph Converter["OpenAIContentConverter"]
        C[双向转换器]
    end

    subgraph Response["响应转换"]
        OResp[OpenAI Response<br/>ChatCompletion/Chunk]
        GResp[Gemini Response<br/>GenerateContentResponse]
    end

    GR --> C --> OR
    OResp --> C --> GResp

    style Request fill:#1a365d,stroke:#3182ce
    style Converter fill:#553c9a,stroke:#805ad5
    style Response fill:#22543d,stroke:#38a169
`;

  const streamingPipelineDiagram = `
flowchart TB
    subgraph Stage1["Stage 1"]
        CREATE[创建 OpenAI Stream]
    end

    subgraph Stage2["Stage 2: 流式处理"]
        CONVERT[2a: Chunk 转换]
        FILTER[2b: 过滤空响应]
        MERGE[2c: Chunk 合并]
        PENDING[2d: 处理待定响应]
    end

    subgraph Output["输出"]
        YIELD[Yield Response]
        LOG[2e: 记录日志]
    end

    CREATE --> CONVERT --> FILTER --> MERGE
    MERGE -->|shouldYield| YIELD
    MERGE -->|pending| PENDING --> YIELD
    YIELD --> LOG

    style Stage1 fill:#3182ce,stroke:#2b6cb0
    style Stage2 fill:#805ad5,stroke:#6b46c1
    style Output fill:#38a169,stroke:#2f855a
`;

  const chunkMergingDiagram = `
stateDiagram-v2
    [*] --> Normal: 普通 chunk
    [*] --> Finish: finishReason chunk

    Normal --> Yield: 直接输出
    Finish --> Pending: 暂存等待

    Pending --> Merge: 收到后续 chunk
    Merge --> Yield: 输出合并结果

    Pending --> Yield: 流结束，输出
`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          🔄 内容格式转换
        </h1>
        <p className="text-[var(--text-secondary)]">
          深入理解 Gemini ↔ OpenAI 格式的双向转换机制
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] text-xs rounded">
            核心机制
          </span>
          <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] text-xs rounded">
            packages/core/src/core/openaiContentGenerator/
          </span>
        </div>
      </div>

      {/* 30秒速览 */}
      <section className="bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--cyber-purple)]/10 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          ⚡ 30秒速览
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">➡️</div>
            <h3 className="text-[var(--terminal-green)] font-bold mb-1">请求转换</h3>
            <p className="text-[var(--text-secondary)] text-sm">Gemini → OpenAI</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Contents → Messages</p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">⬅️</div>
            <h3 className="text-[var(--cyber-blue)] font-bold mb-1">响应转换</h3>
            <p className="text-[var(--text-secondary)] text-sm">OpenAI → Gemini</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Choices → Candidates</p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">▶️</div>
            <h3 className="text-[var(--cyber-purple)] font-bold mb-1">流式处理</h3>
            <p className="text-[var(--text-secondary)] text-sm">Chunk → Response</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">增量工具调用解析</p>
          </div>
        </div>
      </section>

      {/* 架构总览 */}
      <section>
        <button
          onClick={() => toggleSection('arch')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-purple)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🏗️ 转换架构总览
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('arch') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('arch') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <MermaidDiagram chart={conversionPipelineDiagram} />
          </div>
        )}
      </section>

      {/* 请求转换 */}
      <section>
        <button
          onClick={() => toggleSection('request')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--terminal-green)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            ➡️ 请求转换: Gemini → OpenAI
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('request') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('request') && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 内容类型映射 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--terminal-green)] font-bold mb-4">📋 内容类型映射</h3>
              <div className="space-y-2">
                {[
                  { gemini: 'content.role: "user"', openai: 'message.role: "user"', icon: '👤' },
                  { gemini: 'content.role: "model"', openai: 'message.role: "assistant"', icon: '🤖' },
                  { gemini: 'TextPart { text }', openai: 'ChatCompletionContentPartText', icon: '📝' },
                  { gemini: 'InlineDataPart { image }', openai: 'ChatCompletionContentPartImage', icon: '🖼️' },
                  { gemini: 'InlineDataPart { audio }', openai: 'ChatCompletionContentPartInputAudio', icon: '🔊' },
                  { gemini: 'FunctionCall', openai: 'ChatCompletionMessageToolCall', icon: '🔧' },
                  { gemini: 'FunctionResponse', openai: 'ChatCompletionToolMessageParam', icon: '✅' },
                ].map((mapping, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[var(--bg-terminal)]/50 rounded-lg p-2">
                    <span className="text-xl">{mapping.icon}</span>
                    <div className="flex-1 text-xs">
                      <div className="text-[var(--cyber-blue)] font-mono">{mapping.gemini}</div>
                      <div className="text-[var(--text-muted)]">↓</div>
                      <div className="text-[var(--terminal-green)] font-mono">{mapping.openai}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 代码示例 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--terminal-green)] font-bold mb-4">核心转换逻辑</h3>
              <CodeBlock
                code={`// converter.ts - convertGeminiRequestToOpenAI
convertGeminiRequestToOpenAI(request) {
  const messages = [];

  // 处理系统指令
  if (request.config?.systemInstruction) {
    messages.push({
      role: 'system',
      content: this.extractSystemContent(
        request.config.systemInstruction
      )
    });
  }

  // 处理对话内容
  for (const content of request.contents) {
    const role = content.role === 'model'
      ? 'assistant'
      : content.role;

    // 处理多模态内容
    const parts = [];
    for (const part of content.parts) {
      if ('text' in part) {
        parts.push({ type: 'text', text: part.text });
      }
      if ('inlineData' in part) {
        parts.push(this.convertInlineData(part));
      }
      if ('functionCall' in part) {
        // 工具调用需要特殊处理
        this.addToolCall(messages, part);
      }
    }

    messages.push({ role, content: parts });
  }

  return messages;
}`}
                language="typescript"
              />
            </div>
          </div>
        )}
      </section>

      {/* 响应转换 */}
      <section>
        <button
          onClick={() => toggleSection('response')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-blue)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            ⬅️ 响应转换: OpenAI → Gemini
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('response') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('response') && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 非流式响应 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--cyber-blue)] font-bold mb-4">📦 非流式响应</h3>
              <CodeBlock
                code={`// convertOpenAIResponseToGemini
convertOpenAIResponseToGemini(response) {
  const geminiResponse = new GenerateContentResponse();

  // 基础属性
  geminiResponse.responseId = response.id;
  geminiResponse.modelVersion = response.model;
  geminiResponse.createTime = new Date(
    response.created * 1000
  ).toISOString();

  // 转换 choices → candidates
  geminiResponse.candidates = response.choices.map(
    (choice) => ({
      content: {
        role: 'model',
        parts: this.convertMessageToParts(choice.message)
      },
      finishReason: this.mapFinishReason(
        choice.finish_reason
      ),
      index: choice.index
    })
  );

  // 转换 usage → usageMetadata
  if (response.usage) {
    geminiResponse.usageMetadata = {
      promptTokenCount: response.usage.prompt_tokens,
      candidatesTokenCount: response.usage.completion_tokens,
      totalTokenCount: response.usage.total_tokens
    };
  }

  return geminiResponse;
}`}
                language="typescript"
              />
            </div>

            {/* 完成原因映射 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--amber)] font-bold mb-4">✅ 完成原因映射</h3>
              <div className="space-y-2">
                {[
                  { openai: 'stop', gemini: 'STOP', desc: '正常结束', color: 'terminal-green' },
                  { openai: 'length', gemini: 'MAX_TOKENS', desc: '达到最大长度', color: 'amber' },
                  { openai: 'tool_calls', gemini: 'TOOL_CALL', desc: '需要工具调用', color: 'cyber-blue' },
                  { openai: 'content_filter', gemini: 'SAFETY', desc: '内容过滤', color: 'cyber-pink' },
                  { openai: 'function_call', gemini: 'TOOL_CALL', desc: '函数调用(旧)', color: 'cyber-purple' },
                ].map((reason, idx) => (
                  <div key={idx} className={`flex items-center gap-3 bg-[var(--${reason.color})]/10 rounded-lg p-3 border border-[var(--${reason.color})]/30`}>
                    <code className="text-[var(--terminal-green)] text-xs bg-[var(--bg-terminal)] px-2 py-1 rounded">{reason.openai}</code>
                    <span className="text-[var(--text-muted)]">→</span>
                    <code className="text-[var(--cyber-blue)] text-xs bg-[var(--bg-terminal)] px-2 py-1 rounded">{reason.gemini}</code>
                    <span className="text-xs text-[var(--text-secondary)] ml-auto">{reason.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 流式处理 */}
      <section>
        <button
          onClick={() => toggleSection('streaming')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-purple)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            ▶️ 流式处理机制
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('streaming') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('streaming') && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--cyber-purple)] font-bold mb-4">流式处理流水线</h3>
              <MermaidDiagram chart={streamingPipelineDiagram} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chunk 合并策略 */}
              <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <h3 className="text-[var(--amber)] font-bold mb-4">🔀 Chunk 合并策略</h3>
                <MermaidDiagram chart={chunkMergingDiagram} />
                <div className="mt-4 p-3 bg-[var(--amber)]/10 rounded-lg border border-[var(--amber)]/30">
                  <h4 className="text-[var(--amber)] font-bold mb-2 flex items-center gap-2">
                    ⚠️ 设计考量
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    部分 OpenAI 兼容 API (如 Gemini) 会将 finishReason 和 usageMetadata
                    分成两个 chunk 发送。合并策略确保最终 chunk 包含完整信息。
                  </p>
                </div>
              </div>

              {/* 流式工具调用解析 */}
              <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <h3 className="text-[var(--cyber-blue)] font-bold mb-4">🔧 流式工具调用解析</h3>
                <CodeBlock
                  code={`// StreamingToolCallParser - 增量解析
class StreamingToolCallParser {
  private partialToolCalls = new Map<number, PartialToolCall>();

  processChunk(delta: ChatCompletionChunkDelta) {
    if (!delta.tool_calls) return [];

    const completedCalls = [];

    for (const toolCallDelta of delta.tool_calls) {
      const index = toolCallDelta.index;

      // 获取或创建部分调用
      let partial = this.partialToolCalls.get(index);
      if (!partial) {
        partial = { id: '', name: '', arguments: '' };
        this.partialToolCalls.set(index, partial);
      }

      // 增量合并
      if (toolCallDelta.id) partial.id = toolCallDelta.id;
      if (toolCallDelta.function?.name) {
        partial.name = toolCallDelta.function.name;
      }
      if (toolCallDelta.function?.arguments) {
        partial.arguments += toolCallDelta.function.arguments;
      }

      // 检查是否完成
      if (this.isComplete(partial)) {
        completedCalls.push(partial);
        this.partialToolCalls.delete(index);
      }
    }

    return completedCalls;
  }
}`}
                  language="typescript"
                />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[var(--cyber-blue)]/10 rounded border border-[var(--cyber-blue)]/30">
                    <span className="text-[var(--cyber-blue)] font-bold">增量拼接</span>
                    <p className="text-[var(--text-muted)] mt-1">arguments 字符串逐步累积</p>
                  </div>
                  <div className="p-2 bg-[var(--cyber-blue)]/10 rounded border border-[var(--cyber-blue)]/30">
                    <span className="text-[var(--cyber-blue)] font-bold">索引追踪</span>
                    <p className="text-[var(--text-muted)] mt-1">使用 index 区分多个并发调用</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 孤儿工具调用清理 */}
      <section>
        <button
          onClick={() => toggleSection('orphan')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-pink)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🧹 孤儿工具调用清理
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('orphan') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('orphan') && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--cyber-pink)] font-bold mb-4">❌ 问题场景</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--cyber-pink)]/10 rounded-lg border border-[var(--cyber-pink)]/30">
                  <div className="text-[var(--cyber-pink)] font-bold mb-1">孤儿 FunctionCall</div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    模型生成了 tool_call，但后续没有对应的 tool_result
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    原因: 用户取消、网络中断、工具执行失败等
                  </p>
                </div>
                <div className="p-3 bg-[var(--cyber-pink)]/10 rounded-lg border border-[var(--cyber-pink)]/30">
                  <div className="text-[var(--cyber-pink)] font-bold mb-1">孤儿 FunctionResponse</div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    存在 tool_result，但没有对应的 tool_call
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    原因: 上下文被截断、消息丢失等
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--terminal-green)] font-bold mb-4">✅ 清理算法</h3>
              <CodeBlock
                code={`// converter.ts - cleanOrphanedToolCalls
cleanOrphanedToolCalls(messages) {
  // 1. 收集所有 tool_call IDs
  const toolCallIds = new Set<string>();
  const toolResponseIds = new Set<string>();

  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        toolCallIds.add(tc.id);
      }
    }
    if (msg.role === 'tool') {
      toolResponseIds.add(msg.tool_call_id);
    }
  }

  // 2. 过滤孤儿
  return messages.filter((msg) => {
    if (msg.role === 'assistant' && msg.tool_calls) {
      msg.tool_calls = msg.tool_calls.filter(
        (tc) => toolResponseIds.has(tc.id)
      );
      return msg.tool_calls.length > 0 || msg.content;
    }
    if (msg.role === 'tool') {
      return toolCallIds.has(msg.tool_call_id);
    }
    return true;
  });
}`}
                language="typescript"
              />
            </div>
          </div>
        )}
      </section>

      {/* 工具定义转换 */}
      <section>
        <button
          onClick={() => toggleSection('tools')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--amber)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🔧 工具定义转换
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('tools') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('tools') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-[var(--cyber-blue)] font-bold mb-3">Gemini Tool 格式</h3>
                <CodeBlock
                  code={`{
  functionDeclarations: [{
    name: "search_web",
    description: "Search the web",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  }]
}`}
                  language="json"
                />
              </div>
              <div>
                <h3 className="text-[var(--terminal-green)] font-bold mb-3">OpenAI Tool 格式</h3>
                <CodeBlock
                  code={`{
  type: "function",
  function: {
    name: "search_web",
    description: "Search the web",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  }
}`}
                  language="json"
                />
              </div>
            </div>
            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              <p className="flex items-center gap-2">
                <span className="text-[var(--amber)]">⚠️</span>
                转换时需要: 类型名称大小写转换 (OBJECT → object, STRING → string)
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 错误状态处理 */}
      <section>
        <button
          onClick={() => toggleSection('error')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-pink)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            ⚠️ 错误状态处理
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('error') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('error') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <CodeBlock
              code={`// pipeline.ts - processStreamWithLogging 错误处理
try {
  for await (const chunk of stream) {
    // ... 处理 chunk
  }
} catch (error) {
  // 1. 清理流式工具调用状态，防止数据污染
  this.converter.resetStreamingToolCalls();

  // 2. 使用共享错误处理逻辑
  await this.handleError(error, context, request);
}

// handleError 实现
private async handleError(error, context, request) {
  context.duration = Date.now() - context.startTime;

  // 构建最小化请求用于日志记录
  let openaiRequest;
  try {
    openaiRequest = await this.buildRequest(request, ...);
  } catch {
    openaiRequest = { model: this.config.model, messages: [] };
  }

  // 记录遥测
  await this.config.telemetryService.logError(context, error, openaiRequest);

  // 调用错误处理器
  this.config.errorHandler.handle(error, context, request);
}`}
              language="typescript"
            />

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-[var(--cyber-pink)]/10 rounded-lg border border-[var(--cyber-pink)]/30">
                <div className="text-[var(--cyber-pink)] font-bold mb-1">状态清理</div>
                <p className="text-[var(--text-secondary)]">
                  resetStreamingToolCalls() 防止部分解析的工具调用污染下次请求
                </p>
              </div>
              <div className="p-3 bg-[var(--amber)]/10 rounded-lg border border-[var(--amber)]/30">
                <div className="text-[var(--amber)] font-bold mb-1">遥测记录</div>
                <p className="text-[var(--text-secondary)]">
                  错误信息、上下文、请求内容都会记录用于调试
                </p>
              </div>
              <div className="p-3 bg-[var(--cyber-blue)]/10 rounded-lg border border-[var(--cyber-blue)]/30">
                <div className="text-[var(--cyber-blue)] font-bold mb-1">统一处理</div>
                <p className="text-[var(--text-secondary)]">
                  handleError 集中处理流式和非流式错误
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 状态重置机制 */}
      <section>
        <button
          onClick={() => toggleSection('reset')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-blue)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🔄 状态重置机制
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('reset') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('reset') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <CodeBlock
              code={`// converter.ts
resetStreamingToolCalls(): void {
  this.streamingToolCallParser?.reset();
}

// 调用时机:
// 1. 新流开始前 (pipeline.ts:146)
//    this.converter.resetStreamingToolCalls();
//
// 2. 流式处理出错时 (pipeline.ts:212)
//    catch (error) {
//      this.converter.resetStreamingToolCalls();
//      ...
//    }

// StreamingToolCallParser.reset()
reset(): void {
  this.partialToolCalls.clear();
  this.completedToolCalls = [];
}`}
              language="typescript"
            />

            <div className="mt-4 p-3 bg-[var(--cyber-blue)]/10 rounded-lg border border-[var(--cyber-blue)]/30">
              <div className="text-[var(--cyber-blue)] font-bold mb-2">为什么需要重置?</div>
              <p className="text-sm text-[var(--text-secondary)]">
                流式工具调用解析器维护了部分完成的工具调用状态。如果不在新流开始前重置，
                上一次未完成的解析状态会污染新的流处理，导致工具调用参数错乱。
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 源码参考 */}
      <section className="bg-[var(--bg-terminal)]/30 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-4">📚 源码参考</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-[var(--text-muted)] mb-2">核心文件</h4>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              <li>• packages/core/src/core/openaiContentGenerator/converter.ts</li>
              <li>• packages/core/src/core/openaiContentGenerator/pipeline.ts</li>
              <li>• packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[var(--text-muted)] mb-2">关键方法</h4>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              <li>• convertGeminiRequestToOpenAI() - 请求转换</li>
              <li>• convertOpenAIResponseToGemini() - 响应转换</li>
              <li>• convertOpenAIChunkToGemini() - 流式转换</li>
              <li>• cleanOrphanedToolCalls() - 孤儿清理</li>
              <li>• handleChunkMerging() - Chunk 合并</li>
            </ul>
          </div>
        </div>
      </section>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

export default ContentFormatConversion;
