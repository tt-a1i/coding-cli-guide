import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'token-management-strategy', label: 'Token计算策略', description: '预估/预警/对齐策略' },
  { id: 'token-accounting', label: 'Token计费系统', description: '代码级细节与边界' },
  { id: 'chat-compression', label: '聊天压缩系统', description: 'ChatCompressed 与 curated history' },
  { id: 'gemini-chat', label: 'GeminiChat 核心', description: 'usageMetadata 的记录时机' },
  { id: 'turn-state-machine', label: 'Turn状态机', description: 'Finished 事件携带 usageMetadata' },
];

export function TokenLifecycleOverview() {
  const lifecycleDiagram = `
sequenceDiagram
  participant UI as UI (useGeminiStream)
  participant Client as GeminiClient.processTurn
  participant Chat as GeminiChat
  participant Turn as Turn.run
  participant API as Gemini API

  Note over UI,Client: 1) 组装 request parts（含系统指令/工具/历史/用户输入）
  UI->>Client: sendMessageStream(requestParts)

  Note over Client: 2) 计算 remainingTokenCount
  Note over Client: 3) 估算 estimatedRequestTokenCount
  alt 将溢出
    Client-->>UI: ContextWindowWillOverflow(estimated, remaining)
  else 可继续
    Client->>Client: tryCompressChat() (optional)
    Client->>Chat: sendMessageStream()
    Chat->>API: generateContentStream()
    loop stream chunks
      API-->>Chat: GenerateContentResponse (chunk)
      opt usageMetadata present
        Chat->>Chat: recordMessageTokens + update lastPromptTokenCount
      end
      Chat-->>Turn: chunk
      Turn-->>UI: Content/Thought/ToolCallRequest...
    end
    Turn-->>UI: Finished(reason + usageMetadata)
  end
`;

  const tokenSourcesDiagram = `
flowchart TB
  subgraph Prompt["Prompt（进入模型上下文窗口）"]
    SYS[System Prompt]
    MEM[Memory / GEMINI.md]
    TOOLS[Tool declarations]
    HIST[Curated history]
    IDE[IDE context (optional)]
    USER[User request parts]
  end

  subgraph Preflight["Preflight（请求前）"]
    LP[lastPromptTokenCount]
    ER[estimatedRequestTokenCount]
    LIMIT[tokenLimit(model)]
    WARN[ContextWindowWillOverflow]
  end

  subgraph Runtime["Runtime（请求中/请求后）"]
    USAGE[usageMetadata (promptTokenCount...)]
    FIN[Finished event]
  end

  SYS & MEM & TOOLS & HIST & IDE --> LP
  USER --> ER
  LP --> LIMIT
  ER --> WARN
  LIMIT --> WARN
  USAGE --> LP
  USAGE --> FIN
`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          🧬 Token 生命周期全景（上游 Gemini CLI）
        </h1>
        <p className="text-[var(--text-secondary)]">
          这页回答三个问题：Token 从哪里来？什么时候估算？什么时候得到“真实 usage”？
        </p>
      </div>

      <HighlightBox title="⚡ 30 秒速览" variant="blue">
        <ul className="m-0 leading-relaxed">
          <li><strong>Token 主要受上下文窗口限制</strong>：tokenLimit(model) 决定“能塞进 prompt 的上限”</li>
          <li><strong>请求前只做预估</strong>：estimateTokenCountSync / countTokens API（媒体）</li>
          <li><strong>请求中获得真实 usage</strong>：chunk.usageMetadata → 记录并更新 lastPromptTokenCount</li>
          <li><strong>Finished 不是“是否继续”</strong>：是否 continuation 主要取决于 ToolCallRequest；Finished 是本轮流的结束信号</li>
        </ul>
      </HighlightBox>

      <Layer title="Token 从哪里来？（输入源）" icon="🧾" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          进入模型上下文窗口的内容大致分为：系统指令、记忆、工具声明、历史、IDE 上下文、用户本轮输入。
          这些共同构成“prompt token”。
        </p>
        <MermaidDiagram chart={tokenSourcesDiagram} />
      </Layer>

      <Layer title="请求前：为什么要做 Preflight？" icon="🛑" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          请求如果把上下文窗口打满，API 可能直接失败。上游选择在发请求前做一个保守的“将溢出”判断：
          发现风险就 yield <code>ContextWindowWillOverflow</code> 并停止本轮。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/client.ts (simplified)
const estimatedRequestTokenCount = await calculateRequestTokenCount(request, contentGenerator, model);
const remainingTokenCount = tokenLimit(model) - chat.getLastPromptTokenCount();

if (estimatedRequestTokenCount > remainingTokenCount * 0.95) {
  yield { type: GeminiEventType.ContextWindowWillOverflow, value: { estimatedRequestTokenCount, remainingTokenCount } };
  return turn;
}`}
        />
      </Layer>

      <Layer title="请求中：usageMetadata 在哪里出现？" icon="📡" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          真实 token usage 来自模型响应的 <code>usageMetadata</code>（不是本地分词器）。
          上游在流式过程中边 yield chunk，边记录 token，并把 <code>promptTokenCount</code> 写回 <code>lastPromptTokenCount</code>。
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

      <Layer title="请求后：Finished 事件如何携带 usage？" icon="🏁" defaultOpen>
        <p className="text-[var(--text-secondary)] mb-4">
          Turn.run 会把底层响应流归一成事件流，并在检测到 <code>finishReason</code> 时发出 <code>GeminiEventType.Finished</code>：
          其中包含 <code>reason</code> 与 <code>usageMetadata</code>。
        </p>
        <CodeBlock
          language="typescript"
          code={`// gemini-cli/packages/core/src/core/turn.ts (simplified)
const finishReason = resp.candidates?.[0]?.finishReason;
if (finishReason) {
  yield {
    type: GeminiEventType.Finished,
    value: { reason: finishReason, usageMetadata: resp.usageMetadata },
  };
}`}
        />
      </Layer>

      <Layer title="完整生命周期图（事件视角）" icon="🗺️">
        <MermaidDiagram chart={lifecycleDiagram} />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

