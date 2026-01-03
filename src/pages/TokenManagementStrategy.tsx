import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'token-accounting', label: 'Token计费系统', description: '预估与 usageMetadata 的边界' },
  { id: 'token-lifecycle-overview', label: 'Token生命周期全景', description: '从输入到 Finished 的全链路' },
  { id: 'token-counting-anim', label: 'Token 计数动画', description: 'estimateTokenCountSync / countTokens 分支' },
  { id: 'token-limit-matcher-anim', label: 'Token 限制匹配', description: 'tokenLimit(model) 的来源' },
  { id: 'chat-compression', label: '聊天压缩系统', description: 'tryCompressChat 如何影响上下文' },
  { id: 'retry', label: '重试回退', description: 'InvalidStreamError 与重试信号' },
];

export function TokenManagementStrategy() {
  const overviewDiagram = `
flowchart TD
  A[准备发送请求] --> B[remainingTokenCount = tokenLimit(model) - lastPromptTokenCount]
  B --> C[estimatedRequestTokenCount = calculateRequestTokenCount(request)]
  C --> D{estimatedRequestTokenCount > remainingTokenCount * 0.95?}
  D -- Yes --> E[Yield ContextWindowWillOverflow 并中止本轮]
  D -- No --> F[tryCompressChat()]
  F --> G[Turn.run(): decode stream → GeminiEventType]
  G --> H[usageMetadata 出现时更新 lastPromptTokenCount]
  G --> I[Finished(reason + usageMetadata)]
`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          📊 Token 计算策略（上游 Gemini CLI）
        </h1>
        <p className="text-[var(--text-secondary)]">
          核心目标只有一个：在请求发出去之前尽量避免“上下文窗口溢出”，同时把真实 usage 记录下来用于 UI/遥测/会话记录。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] text-xs rounded">
            核心机制
          </span>
          <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] text-xs rounded">
            gemini-cli/packages/core/src/utils/tokenCalculation.ts
          </span>
          <span className="px-2 py-1 bg-[var(--purple)]/20 text-[var(--purple)] text-xs rounded">
            gemini-cli/packages/core/src/core/client.ts
          </span>
        </div>
      </div>

      <HighlightBox title="⚡ 30 秒速览" variant="blue">
        <ul className="m-0 leading-relaxed">
          <li><strong>两套数字</strong>：预估 token（本地估算/可选 API） vs 真实 token（usageMetadata）</li>
          <li><strong>预警机制</strong>：接近溢出直接 yield <code>ContextWindowWillOverflow</code>，避免 API 失败</li>
          <li><strong>估算策略</strong>：纯文本走字符启发式；带图片/文件走 <code>countTokens</code> API（失败再降级）</li>
          <li><strong>压缩位置</strong>：在通过溢出检查后才尝试 <code>tryCompressChat</code>（优化历史，不救“超大请求”）</li>
          <li><strong>真实对齐</strong>：一旦响应 chunk 带 <code>usageMetadata.promptTokenCount</code>，就更新 <code>lastPromptTokenCount</code></li>
        </ul>
      </HighlightBox>

      <Layer title="关键文件（上游源码）" icon="📁" defaultOpen>
        <ul className="text-sm text-[var(--text-secondary)] space-y-2">
          <li>
            <code className="bg-black/30 px-1 rounded">gemini-cli/packages/core/src/utils/tokenCalculation.ts</code>：
            <span className="text-[var(--text-muted)]">estimateTokenCountSync / calculateRequestTokenCount</span>
          </li>
          <li>
            <code className="bg-black/30 px-1 rounded">gemini-cli/packages/core/src/core/tokenLimits.ts</code>：
            <span className="text-[var(--text-muted)]">tokenLimit(model)（上下文窗口）</span>
          </li>
          <li>
            <code className="bg-black/30 px-1 rounded">gemini-cli/packages/core/src/core/client.ts</code>：
            <span className="text-[var(--text-muted)]">processTurn 里的溢出检查与 ChatCompressed 事件</span>
          </li>
          <li>
            <code className="bg-black/30 px-1 rounded">gemini-cli/packages/core/src/core/geminiChat.ts</code>：
            <span className="text-[var(--text-muted)]">usageMetadata → lastPromptTokenCount 更新与录制</span>
          </li>
        </ul>
      </Layer>

      <Layer title="策略总览：先算再发" icon="🧭" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          这张图对应上游 <code>GeminiClient.processTurn()</code> 的关键顺序：先算剩余空间、再估本次请求、过线就预警并停止。
        </p>
        <MermaidDiagram chart={overviewDiagram} />
      </Layer>

      <Layer title="预估 1：estimateTokenCountSync（字符启发式）" icon="🧮">
        <p className="text-[var(--text-secondary)] mb-4">
          上游对“纯文本/轻量 part”使用本地启发式：ASCII 约 <code>0.25 token/char</code>，非 ASCII（含 CJK）用更保守的
          <code>1.3 token/char</code>；非文本 part（functionCall/response 等）用 <code>JSON.length/4</code> 估算。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/tokenCalculation.ts
const ASCII_TOKENS_PER_CHAR = 0.25;
const NON_ASCII_TOKENS_PER_CHAR = 1.3;

export function estimateTokenCountSync(parts: Part[]): number {
  let totalTokens = 0;
  for (const part of parts) {
    if (typeof part.text === 'string') {
      for (const char of part.text) {
        totalTokens += char.codePointAt(0)! <= 127
          ? ASCII_TOKENS_PER_CHAR
          : NON_ASCII_TOKENS_PER_CHAR;
      }
    } else {
      totalTokens += JSON.stringify(part).length / 4;
    }
  }
  return Math.floor(totalTokens);
}`}
        />
        <HighlightBox title="为什么不是 tiktoken？" icon="💡" variant="yellow">
          <p className="m-0 text-sm text-[var(--text-secondary)]">
            Gemini CLI 的上游主线不依赖 OpenAI 分词器；它需要一个“快速、无外部依赖、可保守估计”的方案来做预警与流程控制，
            精确 usage 则交给 API 返回的 <code>usageMetadata</code>。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="预估 2：calculateRequestTokenCount（遇到媒体就用 API）" icon="🔀">
        <p className="text-[var(--text-secondary)] mb-4">
          当请求包含图片/文件等媒体 part（<code>inlineData</code>/<code>fileData</code>）时，本地很难可靠估算，
          上游会调用 <code>countTokens</code> API；如果 API 失败，再降级为本地启发式。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/utils/tokenCalculation.ts
export async function calculateRequestTokenCount(request, contentGenerator, model) {
  const parts = normalizeToParts(request);
  const hasMedia = parts.some((p) => 'inlineData' in p || 'fileData' in p);

  if (hasMedia) {
    try {
      const resp = await contentGenerator.countTokens({
        model,
        contents: [{ role: 'user', parts }],
      });
      return resp.totalTokens ?? 0;
    } catch {
      return estimateTokenCountSync(parts);
    }
  }

  return estimateTokenCountSync(parts);
}`}
        />
      </Layer>

      <Layer title="预警：ContextWindowWillOverflow（95% 阈值）" icon="🚨">
        <p className="text-[var(--text-secondary)] mb-4">
          上游把“溢出风险”作为一个<strong>事件</strong>抛给 UI，而不是赌一把把请求发出去。
          条件是 <code>estimatedRequestTokenCount &gt; remainingTokenCount * 0.95</code>。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/client.ts (simplified)
const estimatedRequestTokenCount = await calculateRequestTokenCount(request, contentGenerator, model);
const remainingTokenCount = tokenLimit(model) - chat.getLastPromptTokenCount();

if (estimatedRequestTokenCount > remainingTokenCount * 0.95) {
  yield {
    type: GeminiEventType.ContextWindowWillOverflow,
    value: { estimatedRequestTokenCount, remainingTokenCount },
  };
  return turn;
}`}
        />
        <HighlightBox title="读者要记住的点" icon="📌" variant="green">
          <ul className="m-0 text-sm text-[var(--text-secondary)] space-y-1">
            <li>这是“请求发出前”的保护门槛；不是模型返回的 finishReason。</li>
            <li>它主要保护上下文窗口（input context），不是输出长度。</li>
            <li>通过预估做早停：宁可保守拒绝，也不要让 API 直接报错。</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="对齐：usageMetadata 更新 lastPromptTokenCount" icon="🧾">
        <p className="text-[var(--text-secondary)] mb-4">
          一旦模型在流式 chunk 里返回 <code>usageMetadata</code>，上游会把它记录到会话记录，并用
          <code>promptTokenCount</code> 更新 <code>lastPromptTokenCount</code>（后续溢出判断更准）。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/geminiChat.ts (simplified)
for await (const chunk of streamResponse) {
  if (chunk.usageMetadata) {
    chatRecordingService.recordMessageTokens(chunk.usageMetadata);
    if (chunk.usageMetadata.promptTokenCount !== undefined) {
      lastPromptTokenCount = chunk.usageMetadata.promptTokenCount;
    }
  }
  yield chunk;
}`}
        />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

