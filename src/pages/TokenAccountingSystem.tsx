import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'token-lifecycle-overview', label: 'Token生命周期全景', description: '端到端视角先建立直觉' },
  { id: 'token-management-strategy', label: 'Token计算策略', description: '预估/预警/对齐' },
  { id: 'token-counting-anim', label: 'Token 计数动画', description: '本地启发式与 API 分支' },
  { id: 'token-limit-matcher-anim', label: 'Token 限制匹配', description: 'tokenLimit(model)' },
  { id: 'chat-recording', label: '会话记录', description: 'usageMetadata 如何落盘' },
  { id: 'chat-compression', label: '聊天压缩系统', description: '压缩触发与收益' },
];

export function TokenAccountingSystem() {
  const coreFlow = `
flowchart TD
  A[GeminiChat 初始化] --> B[lastPromptTokenCount = estimateTokenCountSync(history.parts)]
  B --> C[processTurn: 计算 remainingTokenCount]
  C --> D[calculateRequestTokenCount(request)]
  D --> E{将溢出?}
  E -- Yes --> F[Yield ContextWindowWillOverflow 并停止]
  E -- No --> G[tryCompressChat (optional)]
  G --> H[sendMessageStream → generateContentStream]
  H --> I[chunk.usageMetadata → record + update lastPromptTokenCount]
  H --> J[Turn.run → yield GeminiEventType]
  J --> K[Finished(reason + usageMetadata)]
`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          🧾 Token 计费与记录系统（上游 Gemini CLI）
        </h1>
        <p className="text-[var(--text-secondary)]">
          “计费系统”在上游语境里更准确的说法是：<strong>token 使用量的预估、预警、以及对齐记录</strong>。
          精确 token 主要来自 API 返回的 <code>usageMetadata</code>。
        </p>
      </div>

      <HighlightBox title="⚡ 30 秒速览" variant="blue">
        <ul className="m-0 leading-relaxed">
          <li><strong>预估入口</strong>：<code>estimateTokenCountSync()</code>（快、保守、无依赖）</li>
          <li><strong>媒体分支</strong>：含图片/文件时用 <code>countTokens</code> API（失败再降级）</li>
          <li><strong>预警出口</strong>：<code>ContextWindowWillOverflow</code>（请求前就停，不赌 API）</li>
          <li><strong>真实对齐</strong>：<code>usageMetadata.promptTokenCount</code> → 更新 <code>lastPromptTokenCount</code></li>
          <li><strong>Finished 携带 usage</strong>：UI 以事件流消费，不直接依赖 SDK 结构</li>
        </ul>
      </HighlightBox>

      <Layer title="核心流程图" icon="🧭" defaultOpen>
        <MermaidDiagram chart={coreFlow} />
      </Layer>

      <Layer title="1) lastPromptTokenCount：从“估算”到“对齐”" icon="📌" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          <code>lastPromptTokenCount</code> 是“当前历史 + 系统指令 + 工具等”大致占用的 prompt token 数：
          初始化时用启发式估算；一旦后续响应带回真实 <code>promptTokenCount</code>，会被更新为更准确的值。
        </p>

        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/geminiChat.ts (constructor)
this.lastPromptTokenCount = estimateTokenCountSync(
  this.history.flatMap((c) => c.parts || []),
);`}
        />

        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/geminiChat.ts (processStreamResponse)
if (chunk.usageMetadata?.promptTokenCount !== undefined) {
  this.lastPromptTokenCount = chunk.usageMetadata.promptTokenCount;
}`}
        />

        <HighlightBox title="为什么要更新 lastPromptTokenCount？" icon="💡" variant="green">
          <p className="m-0 text-sm text-[var(--text-secondary)]">
            因为后续 turn 的溢出判断依赖 <code>remainingTokenCount = tokenLimit(model) - lastPromptTokenCount</code>。
            如果一直只用启发式，误差会累积；用 API 回传对齐后会稳定很多。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="2) estimateTokenCountSync：上游启发式（ASCII/CJK）" icon="🧮" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          上游把 token 估算做成<strong>快速且偏保守</strong>的本地计算，用于“预警”和“流程控制”，不是用于计费准确性。
        </p>

        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/tokenCalculation.ts
const ASCII_TOKENS_PER_CHAR = 0.25;
const NON_ASCII_TOKENS_PER_CHAR = 1.3;

// Text: per-char heuristic; Non-text: JSON length / 4
export function estimateTokenCountSync(parts: Part[]): number { /* ... */ }`}
        />
      </Layer>

      <Layer title="3) calculateRequestTokenCount：媒体走 countTokens API" icon="🔀" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          图片/文件的 token 估算在本地很难可靠；上游选择调用 <code>countTokens</code> API。
          这也意味着：当网络/权限导致 API 失败时，系统会退回启发式估算，宁可保守。
        </p>

        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/tokenCalculation.ts (simplified)
const hasMedia = parts.some((p) => 'inlineData' in p || 'fileData' in p);
if (hasMedia) {
  try {
    const resp = await contentGenerator.countTokens({ model, contents: [{ role: 'user', parts }] });
    return resp.totalTokens ?? 0;
  } catch {
    return estimateTokenCountSync(parts);
  }
}`}
        />
      </Layer>

      <Layer title="4) ContextWindowWillOverflow：请求前的硬门槛" icon="🛑" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          这个事件不是模型“说我超了”，而是客户端在发请求前做的预警：当本次请求预计会占用剩余窗口的 95% 以上，就停止并交给 UI 处理。
        </p>

        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/client.ts (simplified)
const remainingTokenCount = tokenLimit(model) - chat.getLastPromptTokenCount();
if (estimatedRequestTokenCount > remainingTokenCount * 0.95) {
  yield { type: GeminiEventType.ContextWindowWillOverflow, value: { estimatedRequestTokenCount, remainingTokenCount } };
  return turn;
}`}
        />

        <HighlightBox title="UI 可以怎么做？" icon="🧠" variant="yellow">
          <ul className="m-0 text-sm text-[var(--text-secondary)] space-y-1">
            <li>提示用户缩短输入（特别是粘贴的大段日志/代码）。</li>
            <li>引导用户拆分任务或让模型先做高层总结。</li>
            <li>必要时切换模型（tokenLimit 更大的模型），或先触发压缩（如果产品允许）。</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="5) Finished：把 usageMetadata 带到事件层" icon="🏁" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          上游把底层 SDK 的 chunk 流封装成 <code>GeminiEventType</code> 事件流；
          当检测到 <code>finishReason</code> 时发出 <code>Finished</code>，并携带 <code>usageMetadata</code> 供 UI 展示与持久化。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/turn.ts (simplified)
const finishReason = resp.candidates?.[0]?.finishReason;
if (finishReason) {
  yield { type: GeminiEventType.Finished, value: { reason: finishReason, usageMetadata: resp.usageMetadata } };
}`}
        />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

