/**
 * StreamingResponseProcessing - 流式响应处理详解
 * 深入解析 AI 响应的流式传输、Chunk 解析与工具调用重组机制
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { useNavigation } from '../contexts/NavigationContext';

export function StreamingResponseProcessing() {
  const [activeTab, setActiveTab] = useState<'overview' | 'parser' | 'merge' | 'repair'>('overview');
  const { navigate } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto">
      <h1>🌊 流式响应处理详解</h1>

      <HighlightBox title="📌 30秒速览" variant="blue">
        <ul className="m-0 leading-relaxed">
          <li><strong>核心问题</strong>：流式响应的 Chunk 格式不一致、工具调用分片、Index 冲突</li>
          <li><strong>StreamingToolCallParser</strong>：处理多工具并发的增量 JSON 解析器</li>
          <li><strong>Chunk 合并策略</strong>：finishReason 和 usageMetadata 可能分开到达，需要合并</li>
          <li><strong>JSON 修复</strong>：自动关闭未闭合字符串、容错解析 (safeJsonParse)</li>
          <li><strong>状态追踪</strong>：每个工具调用独立追踪 depth、inString、escape 状态</li>
        </ul>
      </HighlightBox>

      {/* 导航标签 */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { key: 'overview', label: '🔄 流式架构' },
          { key: 'parser', label: '🔧 ToolCall 解析' },
          { key: 'merge', label: '🧩 Chunk 合并' },
          { key: 'repair', label: '🛠️ JSON 修复' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-6 py-3 rounded-lg cursor-pointer transition-all font-medium ${
              activeTab === tab.key
                ? 'border-2 border-[var(--terminal-green)] bg-[rgba(0,255,136,0.1)] text-[var(--terminal-green)]'
                : 'border border-white/10 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section>
          <h2>🔄 流式响应架构</h2>

          <p className="text-[var(--text-primary)]">
            流式响应允许 AI 在生成过程中逐步返回内容，提供更好的用户体验。
            但流式数据带来了新的挑战：Chunk 格式不一致、工具调用分片传输、元数据延迟到达等。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant CLI as 🖥️ CLI
    participant Pipeline as ⚙️ ContentGenerationPipeline
    participant Converter as 🔄 OpenAIContentConverter
    participant Parser as 📝 StreamingToolCallParser
    participant API as 🌐 OpenAI API

    CLI->>Pipeline: executeStreaming(request)
    Pipeline->>API: POST /chat/completions (stream: true)

    loop 流式接收
        API-->>Pipeline: Chunk N
        Pipeline->>Converter: convertOpenAIStreamToGemini(chunk)

        alt 普通文本
            Converter-->>Pipeline: GenerateContentResponse (text)
        else 工具调用片段
            Converter->>Parser: addChunk(index, args, id, name)
            Parser->>Parser: 累积 buffer，追踪 JSON 状态
            Parser-->>Converter: { complete: false }
        else 流结束 (finish_reason)
            Converter->>Parser: getCompletedToolCalls()
            Parser-->>Converter: 完整的工具调用列表
            Converter-->>Pipeline: GenerateContentResponse (tools)
        end

        Pipeline->>Pipeline: handleChunkMerging()
        Pipeline-->>CLI: yield response
    end

    CLI->>CLI: 执行工具，继续对话
`} />

          <h3>流式处理面临的挑战</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="❌ 问题 1: Chunk 格式不一致" variant="red">
              <p className="text-sm m-0">
                不同的 AI Provider 返回的 Chunk 格式差异很大：
                有的在最后一个 Chunk 返回 <code>usage</code>，有的单独发送。
              </p>
            </HighlightBox>

            <HighlightBox title="⚠️ 问题 2: 工具调用分片" variant="yellow">
              <p className="text-sm m-0">
                工具调用的 JSON 参数被拆分成多个 Chunk：
                <code>{`{"file": "src/ma`}</code> ... <code>{`in.ts"}`}</code>
              </p>
            </HighlightBox>

            <HighlightBox title="🔀 问题 3: Index 冲突" variant="purple">
              <p className="text-sm m-0">
                多个工具调用可能使用相同的 index，需要通过 ID 区分并重新分配 index。
              </p>
            </HighlightBox>

            <HighlightBox title="🧩 问题 4: 元数据延迟" variant="green">
              <p className="text-sm m-0">
                <code>finishReason</code> 和 <code>usageMetadata</code> 可能在不同 Chunk 中到达，需要合并。
              </p>
            </HighlightBox>
          </div>

          <h3>Pipeline 核心流程</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/core/openaiContentGenerator/pipeline.ts

async *executeStreaming(request: GenerateContentParameters) {
  const openaiRequest = await this.buildRequest(request, userPromptId, true);

  // 调用 OpenAI 流式 API
  const stream = await this.client.chat.completions.create({
    ...openaiRequest,
    stream: true,
    stream_options: { include_usage: true },  // 请求返回 usage 信息
  });

  let pendingFinishResponse: GenerateContentResponse | null = null;
  const collectedChunks: OpenAI.Chat.ChatCompletionChunk[] = [];

  for await (const chunk of stream) {
    collectedChunks.push(chunk);

    // 转换 OpenAI Chunk → Gemini 格式
    const response = await this.converter.convertOpenAIStreamToGemini(chunk);

    // 处理 Chunk 合并（finishReason + usageMetadata）
    const shouldYield = this.handleChunkMerging(
      response,
      collectedResponses,
      (r) => { pendingFinishResponse = r; }
    );

    if (shouldYield) {
      yield response;
    }
  }

  // 流结束，yield 最终合并的响应（包含完整的 usage）
  if (pendingFinishResponse) {
    yield pendingFinishResponse;
  }
}`} />
        </section>
      )}

      {/* Parser Tab */}
      {activeTab === 'parser' && (
        <section>
          <h2>🔧 StreamingToolCallParser</h2>

          <p className="text-[var(--text-primary)]">
            <code className="text-[var(--cyber-blue)]">StreamingToolCallParser</code> 是处理流式工具调用的核心组件。
            它解决了分片 JSON 累积、多工具 Index 冲突、状态追踪等复杂问题。
          </p>

          <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> ReceiveChunk: addChunk(index, chunk, id, name)

    state ReceiveChunk {
        [*] --> ResolveIndex
        ResolveIndex --> CheckID: 有 ID?

        CheckID --> MapExistingID: ID 已存在
        CheckID --> CheckCollision: ID 不存在
        CheckID --> FindIncomplete: 无 ID (continuation)

        MapExistingID --> UseExistingIndex
        CheckCollision --> AllocateNewIndex: Index 被占用
        CheckCollision --> UseRequestedIndex: Index 可用
        FindIncomplete --> UseIncompleteIndex

        UseExistingIndex --> InitState
        AllocateNewIndex --> InitState
        UseRequestedIndex --> InitState
        UseIncompleteIndex --> InitState
    }

    ReceiveChunk --> AccumulateBuffer: 确定 actualIndex
    AccumulateBuffer --> TrackJSONState: 追踪 depth/inString/escape

    state TrackJSONState {
        [*] --> ScanChars
        ScanChars --> UpdateDepth: { 或 } 在字符串外
        ScanChars --> ToggleString: " 且未转义
        ScanChars --> SetEscape: \\ 字符
        UpdateDepth --> ScanChars
        ToggleString --> ScanChars
        SetEscape --> ScanChars
    }

    TrackJSONState --> CheckComplete: depth == 0?
    CheckComplete --> TryParse: 是
    CheckComplete --> ReturnIncomplete: 否

    TryParse --> ReturnComplete: JSON.parse 成功
    TryParse --> TryRepair: 解析失败
    TryRepair --> ReturnComplete: 修复成功
    TryRepair --> ReturnIncomplete: 修复失败

    ReturnComplete --> [*]
    ReturnIncomplete --> [*]
`} />

          <h3>核心状态追踪</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts

export class StreamingToolCallParser {
  // 每个工具调用 index 的独立状态
  private buffers: Map<number, string> = new Map();      // 累积的 JSON 字符串
  private depths: Map<number, number> = new Map();       // JSON 嵌套深度
  private inStrings: Map<number, boolean> = new Map();   // 是否在字符串内
  private escapes: Map<number, boolean> = new Map();     // 下一个字符是否转义

  // ID → Index 映射（解决 Index 冲突）
  private idToIndexMap: Map<string, number> = new Map();
  private toolCallMeta: Map<number, { id?: string; name?: string }> = new Map();
  private nextAvailableIndex: number = 0;
}`} />

          <h3>Index 冲突解决</h3>

          <p className="text-[var(--text-secondary)]">
            当新的工具调用 ID 请求一个已被占用的 index 时，解析器会自动分配新的 index。
          </p>

          <CodeBlock language="typescript" code={`addChunk(index: number, chunk: string, id?: string, name?: string) {
  let actualIndex = index;

  if (id) {
    if (this.idToIndexMap.has(id)) {
      // 已知 ID，使用映射的 index
      actualIndex = this.idToIndexMap.get(id)!;
    } else {
      // 新 ID，检查请求的 index 是否被占用
      if (this.buffers.has(index)) {
        const existingBuffer = this.buffers.get(index)!;
        const existingMeta = this.toolCallMeta.get(index);

        // 如果存在完整的、不同 ID 的工具调用，分配新 index
        if (existingMeta?.id && existingMeta.id !== id) {
          try {
            JSON.parse(existingBuffer);  // 验证是否完整
            actualIndex = this.findNextAvailableIndex();  // 分配新 index
          } catch {
            // 未完整，可以复用这个 index
          }
        }
      }
      this.idToIndexMap.set(id, actualIndex);
    }
  } else {
    // 无 ID 的 continuation chunk
    // 尝试找到最近的未完成工具调用
    actualIndex = this.findMostRecentIncompleteIndex();
  }

  // 使用 actualIndex 继续处理...
}`} />

          <h3>JSON 结构追踪</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Layer title="📊 depth 追踪">
              <CodeBlock language="typescript" code={`// 只在字符串外计数
for (const char of chunk) {
  if (!inString) {
    if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;
    }
  }
  // ...
}

// depth === 0 表示 JSON 结构完整`} />
            </Layer>

            <Layer title="💬 字符串边界">
              <CodeBlock language="typescript" code={`// 追踪引号切换字符串状态
if (char === '"' && !escape) {
  inString = !inString;
}

// 追踪转义序列
// \\" 中的第二个引号不切换状态
escape = char === '\\\\' && !escape;`} />
            </Layer>
          </div>

          <h3>解析完成判定</h3>
          <CodeBlock language="typescript" code={`// depth === 0 且有内容时尝试解析
if (depth === 0 && newBuffer.trim().length > 0) {
  try {
    const parsed = JSON.parse(newBuffer);
    return { complete: true, value: parsed };
  } catch (e) {
    // 尝试修复（见下一节）
    if (inString) {
      try {
        const repaired = JSON.parse(newBuffer + '"');
        return { complete: true, value: repaired, repaired: true };
      } catch { /* 修复失败 */ }
    }
    return { complete: false, error: e };
  }
}

return { complete: false };  // 继续累积`} />
        </section>
      )}

      {/* Merge Tab */}
      {activeTab === 'merge' && (
        <section>
          <h2>🧩 Chunk 合并策略</h2>

          <p className="text-[var(--text-primary)]">
            不同的 AI Provider 返回流式响应的方式不同。有些在同一个 Chunk 中返回
            <code className="text-[var(--cyber-blue)]">finishReason</code> 和 <code className="text-[var(--cyber-blue)]">usageMetadata</code>，有些分开返回。
            <code className="text-[var(--terminal-green)]">handleChunkMerging</code> 确保最终响应包含完整信息。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant API as 🌐 API
    participant Pipeline as ⚙️ Pipeline
    participant Collector as 📦 Collector

    Note over API,Collector: 场景 A: 分开返回

    API->>Pipeline: Chunk 1: { text: "Hello" }
    Pipeline->>Collector: 收集并 yield
    Pipeline-->>Pipeline: yield chunk1

    API->>Pipeline: Chunk 2: { text: " World" }
    Pipeline->>Collector: 收集并 yield
    Pipeline-->>Pipeline: yield chunk2

    API->>Pipeline: Chunk 3: { finishReason: "stop" }
    Pipeline->>Collector: 收集，设为 pendingFinish
    Note over Pipeline: 不 yield，等待合并

    API->>Pipeline: Chunk 4: { usageMetadata: {...} }
    Pipeline->>Collector: 合并到 pendingFinish
    Note over Pipeline: 合并: finishReason + usage
    Pipeline-->>Pipeline: yield mergedChunk

    Note over API,Collector: 场景 B: 一起返回

    API->>Pipeline: Chunk: { finishReason: "stop", usage: {...} }
    Pipeline->>Collector: 收集并 yield
    Pipeline-->>Pipeline: yield chunk
`} />

          <h3>合并算法实现</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/core/openaiContentGenerator/pipeline.ts

private handleChunkMerging(
  response: GenerateContentResponse,
  collectedResponses: GenerateContentResponse[],
  setPendingFinish: (response: GenerateContentResponse) => void,
): boolean {
  const isFinishChunk = response.candidates?.[0]?.finishReason;
  const lastResponse = collectedResponses[collectedResponses.length - 1];
  const hasPendingFinish = lastResponse?.candidates?.[0]?.finishReason;

  if (isFinishChunk) {
    // 📍 收到 finishReason Chunk
    // 不立即 yield，等待可能的 usageMetadata
    collectedResponses.push(response);
    setPendingFinish(response);
    return false;  // 暂不 yield
  }

  if (hasPendingFinish) {
    // 📍 已有 pendingFinish，当前 Chunk 需要合并进去
    const mergedResponse = new GenerateContentResponse();

    // 保留之前的 finishReason
    mergedResponse.candidates = lastResponse.candidates;

    // 使用当前 Chunk 的 usage（如果有）
    mergedResponse.usageMetadata = response.usageMetadata
      || lastResponse.usageMetadata;

    // 复制其他属性
    mergedResponse.responseId = response.responseId;
    mergedResponse.modelVersion = response.modelVersion;

    // 更新收集器
    collectedResponses[collectedResponses.length - 1] = mergedResponse;
    setPendingFinish(mergedResponse);
    return true;  // yield 合并后的响应
  }

  // 📍 普通 Chunk，直接收集并 yield
  collectedResponses.push(response);
  return true;
}`} />

          <h3>设计考量</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Layer title="✅ 为什么等待合并？">
              <p className="text-sm text-[var(--text-secondary)] m-0">
                如果立即 yield <code>finishReason</code> Chunk，后续的 <code>usageMetadata</code>
                将丢失。等待合并确保最终响应信息完整。
              </p>
            </Layer>

            <Layer title="📊 usage 的重要性">
              <p className="text-sm text-[var(--text-secondary)] m-0">
                <code>usageMetadata</code> 包含 Token 使用量，用于计费、配额管理和 UI 显示。
                必须确保它被正确传递。
              </p>
            </Layer>

            <Layer title="🔄 Provider 兼容">
              <p className="text-sm text-[var(--text-secondary)] m-0">
                这种策略兼容所有 Provider：分开发送的会被合并，一起发送的直接通过。
              </p>
            </Layer>
          </div>

          <h3>stream_options 请求</h3>
          <CodeBlock language="typescript" code={`// 请求 API 返回 usage 信息
const request: OpenAI.Chat.ChatCompletionCreateParams = {
  model: this.contentGeneratorConfig.model,
  messages,
  stream: true,
  stream_options: { include_usage: true },  // 关键！
};

// 没有这个选项，某些 Provider 不会返回 usage`} />
        </section>
      )}

      {/* Repair Tab */}
      {activeTab === 'repair' && (
        <section>
          <h2>🛠️ JSON 修复策略</h2>

          <p className="text-[var(--text-primary)]">
            流式传输中，JSON 可能在字符串中间被截断。解析器采用多种修复策略确保数据不丢失。
          </p>

          <MermaidDiagram chart={`
flowchart TD
    A[接收完整 buffer] --> B{depth == 0?}
    B -- 否 --> C[继续累积]
    B -- 是 --> D[尝试 JSON.parse]

    D -- 成功 --> E[返回 complete: true]
    D -- 失败 --> F{inString == true?}

    F -- 是 --> G[尝试 buffer + '"']
    F -- 否 --> H[尝试 safeJsonParse]

    G -- 成功 --> I[返回 complete: true, repaired: true]
    G -- 失败 --> H

    H -- 成功 --> J[返回 partial value]
    H -- 失败 --> K[返回 complete: false, error]

    style E fill:#059669,stroke:#059669,color:#fff
    style I fill:#d97706,stroke:#d97706,color:#fff
    style J fill:#7c3aed,stroke:#7c3aed,color:#fff
    style K fill:#dc2626,stroke:#dc2626,color:#fff
`} />

          <h3>修复策略 1: 自动关闭字符串</h3>
          <CodeBlock language="typescript" code={`// 场景: JSON 在字符串中间被截断
// buffer: {"file": "src/main.ts", "content": "Hello

// 解析器追踪到 inString = true
if (depth === 0 && newBuffer.trim().length > 0) {
  try {
    JSON.parse(newBuffer);
  } catch {
    // 标准解析失败，检查是否在字符串内
    if (inString) {
      try {
        // 尝试添加闭合引号
        const repaired = JSON.parse(newBuffer + '"');
        return {
          complete: true,
          value: repaired,
          repaired: true,  // 标记为修复过
        };
      } catch {
        // 仍然失败，可能有其他问题
      }
    }
  }
}`} />

          <h3>修复策略 2: safeJsonParse 容错</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/utils/safeJsonParse.ts

/**
 * 容错 JSON 解析器
 * 处理常见的 JSON 格式问题：
 * - 尾部逗号
 * - 未转义的换行符
 * - 单引号字符串
 */
export function safeJsonParse<T>(
  jsonString: string,
  defaultValue: T
): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      // 尝试移除尾部逗号
      const cleaned = jsonString
        .replace(/,\\s*}/g, '}')
        .replace(/,\\s*]/g, ']');
      return JSON.parse(cleaned);
    } catch {
      return defaultValue;
    }
  }
}

// 在 getCompletedToolCalls 中使用
getCompletedToolCalls() {
  for (const [index, buffer] of this.buffers.entries()) {
    let args: Record<string, unknown> = {};

    try {
      args = JSON.parse(buffer);
    } catch {
      // 标准修复
      if (this.inStrings.get(index)) {
        try {
          args = JSON.parse(buffer + '"');
        } catch {
          // 最终降级：safeJsonParse
          args = safeJsonParse(buffer, {});
        }
      } else {
        args = safeJsonParse(buffer, {});
      }
    }
  }
}`} />

          <h3>实际修复场景</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="❌ 截断的 JSON" variant="red">
              <CodeBlock language="json" code={`{
  "tool": "Read",
  "file": "/src/main.ts",
  "content": "export function main() {
    console.log("Hello`} />
            </HighlightBox>

            <HighlightBox title="✅ 修复后" variant="green">
              <CodeBlock language="json" code={`{
  "tool": "Read",
  "file": "/src/main.ts",
  "content": "export function main() {
    console.log(\\"Hello"
}`} />
              <p className="text-sm mt-2 text-[var(--text-muted)]">
                添加闭合引号 <code>"</code> 后可解析
              </p>
            </HighlightBox>
          </div>

          <h3>状态重置</h3>
          <CodeBlock language="typescript" code={`// 每次新的流式请求前重置解析器状态
reset(): void {
  this.buffers.clear();
  this.depths.clear();
  this.inStrings.clear();
  this.escapes.clear();
  this.toolCallMeta.clear();
  this.idToIndexMap.clear();
  this.nextAvailableIndex = 0;
}

// 在 Pipeline 中调用
async *executeStreaming(request) {
  // 清理可能残留的状态
  this.converter.resetStreamingToolCalls();
  // ...
}`} />

          <HighlightBox title="⚠️ 修复的局限性" variant="yellow">
            <ul className="m-0 text-sm">
              <li>只能修复简单的字符串截断，复杂的结构损坏无法修复</li>
              <li><code>repaired: true</code> 标记可用于日志和监控，追踪修复频率</li>
              <li>如果修复失败，工具调用可能返回空参数 <code>{`{}`}</code>，上层需要处理</li>
            </ul>
          </HighlightBox>
        </section>
      )}

      {/* 错误处理 */}
      <section className="mt-8">
        <h2>🚨 错误处理</h2>

        <CodeBlock language="typescript" code={`// Pipeline 中的流式错误处理
async *executeStreaming(request) {
  try {
    for await (const chunk of stream) {
      // 处理 chunk...
    }
  } catch (error) {
    // 🔴 关键：错误时清理状态，防止数据污染下一次请求
    this.converter.resetStreamingToolCalls();

    // 记录遥测
    await this.config.telemetryService.logStreamingError(error, context);

    // 使用共享错误处理逻辑
    await this.handleError(error, context, request);
  }
}`} />
      </section>

      {/* 相关链接 */}
      <section className="mt-8">
        <h2>🔗 相关文档</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => navigate('content-format-conversion')} className="block p-4 text-left bg-[rgba(59,130,246,0.1)] rounded-lg hover:bg-[rgba(59,130,246,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-[var(--cyber-blue)] m-0 mb-2">🔄 格式转换详解</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">Gemini ↔ OpenAI 格式</p>
          </button>

          <button onClick={() => navigate('streaming-json-parser-anim')} className="block p-4 text-left bg-[rgba(139,92,246,0.1)] rounded-lg hover:bg-[rgba(139,92,246,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-[var(--purple)] m-0 mb-2">🎬 流式 JSON 解析</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">深度跟踪与碰撞检测</p>
          </button>

          <button onClick={() => navigate('streaming-tool-parser-anim')} className="block p-4 text-left bg-[rgba(236,72,153,0.1)] rounded-lg hover:bg-[rgba(236,72,153,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-pink-400 m-0 mb-2">🎬 工具调用解析</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">ToolCallParser 动画</p>
          </button>

          <button onClick={() => navigate('chunk-assembly-anim')} className="block p-4 text-left bg-[rgba(245,158,11,0.1)] rounded-lg hover:bg-[rgba(245,158,11,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-[var(--amber)] m-0 mb-2">🎬 Chunk 组装</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">数据块合并演示</p>
          </button>

          <button onClick={() => navigate('streaming-decoder-anim')} className="block p-4 text-left bg-[rgba(16,185,129,0.1)] rounded-lg hover:bg-[rgba(16,185,129,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-[var(--terminal-green)] m-0 mb-2">🎬 流式解码器</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">响应解码过程</p>
          </button>

          <button onClick={() => navigate('error-recovery-patterns')} className="block p-4 text-left bg-[rgba(239,68,68,0.1)] rounded-lg hover:bg-[rgba(239,68,68,0.2)] transition-colors border-none cursor-pointer">
            <h4 className="text-red-400 m-0 mb-2">🛡️ 错误恢复模式</h4>
            <p className="m-0 text-sm text-[var(--text-secondary)]">流式错误处理策略</p>
          </button>
        </div>
      </section>
    </div>
  );
}
