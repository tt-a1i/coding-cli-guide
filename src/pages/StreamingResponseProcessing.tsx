/**
 * StreamingResponseProcessing - 流式响应处理详解
 * 以 Gemini CLI（上游实现）为准：深入解析 sendMessageStream → Turn.run → UI 的事件流
 *
 * 重点澄清：Gemini 原生 functionCalls 是结构化对象，不需要 OpenAI SSE/tool_calls 的增量 JSON 拼接解析器。
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { useNavigation } from '../contexts/NavigationContext';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'gemini-chat', label: 'GeminiChat 核心', description: 'sendMessageStream 的真实来源' },
 { id: 'turn-state-machine', label: 'Turn 状态机', description: '事件驱动的 turn 生命周期' },
 { id: 'turn-internal-anim', label: 'Turn 状态流转动画', description: 'GeminiEventType 事件可视化' },
 { id: 'session-state-anim', label: '会话状态机动画', description: 'Retry/Finished/ToolCallRequest' },
 { id: 'retry', label: '重试回退', description: 'InvalidStreamError → RETRY' },
 { id: 'tool-scheduler', label: '工具调度详解', description: 'ToolCallRequest → 执行 → continuation' },
];

export function StreamingResponseProcessing() {
 const [activeTab, setActiveTab] = useState<'overview' | 'parser' | 'merge' | 'repair'>('overview');
 const { navigate } = useNavigation();

 return (
 <div className="max-w-4xl mx-auto">
 <h1>🌊 流式响应处理详解</h1>

 <HighlightBox title="📌 30秒速览（上游 Gemini CLI）" variant="blue">
 <ul className="m-0 leading-relaxed">
 <li><strong>数据来源</strong>：<code>GeminiChat.sendMessageStream()</code> 返回 <code>AsyncGenerator</code>（非 SSE 文本协议叙事）</li>
 <li><strong>事件归一</strong>：<code>Turn.run()</code> 将 chunk 转换为 <code>GeminiEventType</code>（Content / Thought / ToolCallRequest / Finished / Retry…）</li>
 <li><strong>工具调用</strong>：从 <code>resp.functionCalls</code> 直接得到结构化 <code>{`{ name, args, id }`}</code>，无需增量 JSON 拼接</li>
 <li><strong>Finished 触发点</strong>：只有当 <code>finishReason</code> 出现才发 <code>Finished</code>（顺便携带 <code>usageMetadata</code>）</li>
 <li><strong>异常与重试</strong>：流结束但缺少 <code>finishReason</code> 等会抛 <code>InvalidStreamError</code> → 触发 <code>Retry</code>，UI 丢弃半成品内容</li>
 </ul>
 </HighlightBox>

 {/* 导航标签 */}
 <div className="flex gap-2 mb-8 flex-wrap">
 {[
 { key: 'overview', label: '🔄 流式架构' },
 { key: 'parser', label: '🧠 事件解码' },
 { key: 'merge', label: '🏁 Finished/Usage/Citation' },
 { key: 'repair', label: '♻️ InvalidStream & Retry' },
 ].map(tab => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key as typeof activeTab)}
 className={`px-6 py-3 rounded-lg cursor-pointer transition-all font-medium ${
 activeTab === tab.key
 ? 'border-2 border-edge bg-[rgba(0,255,136,0.1)] text-heading'
 : 'border border-white/10 bg-transparent text-body hover:text-heading'
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

 <p className="text-heading">
 Gemini CLI 的“流式”不是把一堆 <code>data: ...</code> 文本行（SSE）交给解析器去拼 JSON；
 上游实现直接消费 <code>@google/genai</code> 的 <code>GenerateContentResponse</code> 流，然后在 <code>Turn.run()</code> 中把它归一成一串语义事件。
 </p>

 <MermaidDiagram chart={`
sequenceDiagram
 participant UI as 🖥️ UI (useGeminiStream)
 participant Turn as 🔁 Turn.run()
 participant Chat as 💬 GeminiChat.sendMessageStream()
 participant CG as 📡 ContentGenerator.generateContentStream()
 participant API as 🌐 Gemini API
 participant TS as 🔧 ToolScheduler

 UI->>Turn: submitQuery(reqParts)
 Turn->>Chat: sendMessageStream(modelKey, reqParts)
 Chat->>CG: generateContentStream({ model, contents, config })
 CG->>API: 流式请求 (SDK/HTTP chunked)

 loop for await chunk
 API-->>CG: GenerateContentResponse
 CG-->>Chat: chunk
 Chat-->>Turn: { type: 'chunk', value: resp }

 alt Thought part
 Turn-->>UI: GeminiEventType.Thought
 else Text content
 Turn-->>UI: GeminiEventType.Content
 else functionCalls
 Turn-->>UI: GeminiEventType.ToolCallRequest (structured args)
 UI->>TS: schedule(toolCallRequests)
 TS-->>UI: Tool results
 UI->>Turn: submitQuery(functionResponse, isContinuation=true)
 end

 opt finishReason present
 Turn-->>UI: GeminiEventType.Finished (reason + usageMetadata)
 end
 end
`} />

 <h3>上游流式处理的“真实挑战”</h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="⚠️ 问题 1: 事件混合出现" variant="yellow">
 <p className="text-sm m-0">
 同一个流中可能出现 Thought/Text/functionCalls/Finished 等不同语义。
 上游用 <code>GeminiEventType</code> 把它们归一，避免 UI 直接处理底层响应结构。
 </p>
 </HighlightBox>

 <HighlightBox title="⚠️ 问题 2: Finished 不是每个 chunk 都有" variant="yellow">
 <p className="text-sm m-0">
 <code>finishReason</code> 只会在“最终”响应出现；
 上游明确只在 <code>finishReason</code> 存在时才发 <code>GeminiEventType.Finished</code>。
 </p>
 </HighlightBox>

 <HighlightBox title="⚠️ 问题 3: 工具调用需要 continuation" variant="purple">
 <p className="text-sm m-0">
 收到 <code>ToolCallRequest</code> 后要执行工具，再把结果作为 <code>functionResponse</code> 回注，触发下一轮 <code>submitQuery(..., {'{'} isContinuation: true {'}'})</code>。
 </p>
 </HighlightBox>

 <HighlightBox title="⚠️ 问题 4: 无效流需要重试" variant="red">
 <p className="text-sm m-0">
 如果流结束却缺少关键字段（例如没有 <code>finishReason</code>），上游会抛 <code>InvalidStreamError</code> 并触发一次 <code>Retry</code>。
 </p>
 </HighlightBox>
 </div>

 <h3>Turn.run 的核心循环（上游源码）</h3>
 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/turn.ts

const responseStream = await chat.sendMessageStream(modelConfigKey, req, prompt_id, signal);

for await (const streamEvent of responseStream) {
 if (signal.aborted) yield { type: GeminiEventType.UserCancelled };

 if (streamEvent.type === 'retry') {
 yield { type: GeminiEventType.Retry };
 continue;
 }

 const resp = streamEvent.value;
 const traceId = resp.responseId;

 // 1) Thought（需要 UI 特殊渲染）
 const thoughtPart = resp.candidates?.[0]?.content?.parts?.[0];
 if (thoughtPart?.thought) {
 yield { type: GeminiEventType.Thought, value: parseThought(thoughtPart.text ?? ''), traceId };
 continue;
 }

 // 2) Text
 const text = getResponseText(resp);
 if (text) yield { type: GeminiEventType.Content, value: text, traceId };

 // 3) Tools（结构化 functionCalls）
 for (const fnCall of resp.functionCalls ?? []) {
 yield { type: GeminiEventType.ToolCallRequest, value: toToolCallRequestInfo(fnCall, traceId) };
 }

 // 4) Finished（只在 finishReason 存在时发出）
 const finishReason = resp.candidates?.[0]?.finishReason;
 if (finishReason) {
 yield { type: GeminiEventType.Finished, value: { reason: finishReason, usageMetadata: resp.usageMetadata } };
 }
}`} />

 <HighlightBox title="✅ 与 OpenAI/tool_calls 的关键差异" variant="green">
 <p className="text-sm m-0 text-body">
 上游 Gemini CLI 不需要 <code>StreamingToolCallParser</code> 之类的“增量 JSON 修复/拼接”。
 如果你的 fork 通过 OpenAI 兼容协议接入其他模型，才会出现 <code>tool_calls</code> 解析与格式转换层（请在文档中明确标注为 fork-only）。
 </p>
 </HighlightBox>
 </section>
 )}

 {/* Parser Tab */}
 {activeTab === 'parser' && (
 <section>
 <h2>🧠 事件解码：从 chunk 到 GeminiEventType</h2>

 <p className="text-heading">
 这一层的目标不是“把字符串拼成 JSON”，而是把底层响应（<code>GenerateContentResponse</code>）转换为 UI/调度器能消费的<strong>语义事件</strong>。
 上游的关键文件是 <code>gemini-cli/packages/core/src/core/turn.ts</code>。
 </p>

 <MermaidDiagram chart={`
flowchart TD
 A[StreamEventType.CHUNK\nGenerateContentResponse] --> B{Thought part?}
 B -- Yes --> T[GeminiEventType.Thought]
 B -- No --> C{Has text?}
 C -- Yes --> D[GeminiEventType.Content]
 C -- No --> E{Has functionCalls?}
 E -- Yes --> F[GeminiEventType.ToolCallRequest\n(callId/name/args)]
 E -- No --> G{Has finishReason?}
 G -- Yes --> H[GeminiEventType.Finished\n(reason + usageMetadata)]
 G -- No --> I[Continue reading stream]
`} />

 <h3>ToolCallRequestInfo 的构建（上游源码）</h3>
 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/turn.ts

private handlePendingFunctionCall(fnCall: FunctionCall, traceId?: string) {
 const callId = fnCall.id ?? \`\${fnCall.name}-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`;
 const name = fnCall.name || 'undefined_tool_name';
 const args = fnCall.args || {};

 const toolCallRequest: ToolCallRequestInfo = {
 callId,
 name,
 args,
 isClientInitiated: false,
 prompt_id: this.prompt_id,
 traceId,
 };

 this.pendingToolCalls.push(toolCallRequest);
 return { type: GeminiEventType.ToolCallRequest, value: toolCallRequest };
}`} />

 <HighlightBox title="✅ 为什么这里不需要“StreamingToolCallParser”" variant="green">
 <ul className="m-0 text-sm leading-relaxed">
 <li><strong>Gemini 原生 functionCalls</strong>：SDK 已经把 <code>args</code> 解析成对象</li>
 <li><strong>UI/调度器拿到的是语义事件</strong>：直接进入“工具确认/审批/执行”链路</li>
 <li><strong>fork-only 才会出现 JSON 拼接</strong>：例如 OpenAI <code>tool_calls</code> 的增量片段</li>
 </ul>
 </HighlightBox>
 </section>
 )}

 {/* Merge Tab */}
 {activeTab === 'merge' && (
 <section>
 <h2>🏁 Finished / UsageMetadata / Citation</h2>

 <p className="text-heading">
 上游 Gemini CLI 的关键规则是：<strong>只在 chunk 出现 <code>finishReason</code> 时发出 <code>GeminiEventType.Finished</code></strong>。
 这样 UI 不需要做“Chunk 合并”来拼出最终的 usage；同时 citations 会在 Finished 前统一 flush。
 </p>

 <MermaidDiagram chart={`
sequenceDiagram
 participant Turn as 🔁 Turn.run()
 participant UI as 🖥️ UI

 Turn-->>UI: Content("...")
 Turn-->>UI: Content("...")
 Turn-->>UI: ToolCallRequest(...)
 Note over UI: 执行工具，提交 functionResponse continuation

 Turn-->>UI: Content("...")

 Note over Turn,UI: 只有当 finishReason 出现时，才结束当前流
 Turn-->>UI: Finished(reason, usageMetadata)
`} />

 <h3>Finished 事件的关键实现（上游源码）</h3>
 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/turn.ts

const finishReason = resp.candidates?.[0]?.finishReason;

// 关键：只有在 finishReason 存在时才 yield Finished
if (finishReason) {
 if (pendingCitations.size > 0) {
 yield { type: GeminiEventType.Citation, value: \`Citations:\\n\${[...pendingCitations].sort().join('\\n')}\` };
 pendingCitations.clear();
 }

 yield {
 type: GeminiEventType.Finished,
 value: { reason: finishReason, usageMetadata: resp.usageMetadata },
 };
}`} />

 <h3>设计考量</h3>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Layer title="✅ UI 简化">
 <p className="text-sm text-body m-0">
 UI 只需要处理 <code>Finished</code> 事件一次，不需要维护“pendingFinish”合并器。
 </p>
 </Layer>

 <Layer title="📊 usage 的位置">
 <p className="text-sm text-body m-0">
 上游把 <code>usageMetadata</code> 绑定在 <code>Finished</code> 事件上，便于计费/配额/UI 展示统一消费。
 </p>
 </Layer>

 <Layer title="🔗 引用输出">
 <p className="text-sm text-body m-0">
 citations 先暂存，直到 <code>Finished</code> 才输出，避免“半截引用”干扰正文流。
 </p>
 </Layer>
 </div>
 </section>
 )}

 {/* Repair Tab */}
 {activeTab === 'repair' && (
 <section>
 <h2>♻️ InvalidStream & Retry</h2>

 <p className="text-heading">
 上游 Gemini CLI 面对“流式不可靠”时的策略不是修复 JSON 字符串，而是把它视为<strong>无效流</strong>并进行一次重试：
 通过 <code>StreamEventType.RETRY</code> 通知 UI 丢弃半成品内容，再发起下一次流式请求。
 </p>

 <MermaidDiagram chart={`
flowchart TD
 A[sendMessageStream() attempt #1] --> B{InvalidStreamError?}
 B -- No --> C[正常消费 CHUNK]
 B -- Yes --> D[Yield StreamEventType.RETRY]
 D --> E[UI 丢弃 partial 内容]
 E --> F[sendMessageStream() attempt #2]

 style C fill:#059669,stroke:#059669,color:#fff
 style D fill:#d97706,stroke:#d97706,color:#fff
 style F fill:#3182ce,stroke:#3182ce,color:#fff
`} />

 <h3>无效流类型（上游源码）</h3>
 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/geminiChat.ts
export class InvalidStreamError extends Error {
 readonly type: 'NO_FINISH_REASON' | 'NO_RESPONSE_TEXT' | 'MALFORMED_FUNCTION_CALL';
}`}/>

 <h3>sendMessageStream 的重试通知</h3>
 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/geminiChat.ts (simplified)

for (let attempt = 0; attempt < maxAttempts; attempt++) {
 if (attempt > 0) yield { type: StreamEventType.RETRY };

 const stream = await makeApiCallAndProcessStream(...);
 for await (const chunk of stream) yield { type: StreamEventType.CHUNK, value: chunk };
}`}/>

 <HighlightBox title="fork-only：什么时候才需要 JSON 修复？" variant="yellow">
 <p className="text-sm m-0 text-body">
 只有当你接入 OpenAI 兼容流（例如 <code>tool_calls</code> 增量参数片段）时，才会遇到“字符串被截断、需要补引号/追踪 depth”的问题。
 上游 Gemini CLI 的主线不依赖这套机制。
 </p>
 </HighlightBox>
 </section>
 )}

 {/* 错误处理 */}
 <section className="mt-8">
 <h2>🚨 错误处理</h2>

 <CodeBlock language="typescript" code={`// gemini-cli/packages/core/src/core/turn.ts (simplified)

try {
 for await (const streamEvent of responseStream) {
 // decode → yield GeminiEventType
 }
} catch (e) {
 if (signal.aborted) yield { type: GeminiEventType.UserCancelled };
 if (e instanceof InvalidStreamError) yield { type: GeminiEventType.InvalidStream };

 // 其他错误：toFriendlyError + reportError + yield GeminiEventType.Error
}`} />
 </section>

 {/* 相关链接 */}
 <section className="mt-8">
 <h2>🔗 相关文档</h2>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <button onClick={() => navigate('gemini-chat')} className="block p-4 text-left bg-[rgba(59,130,246,0.1)] rounded-lg hover:bg-[rgba(59,130,246,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-heading m-0 mb-2">💬 GeminiChat 核心</h4>
 <p className="m-0 text-sm text-body">sendMessageStream 与重试</p>
 </button>

 <button onClick={() => navigate('turn-internal-anim')} className="block p-4 text-left bg-[rgba(139,92,246,0.1)] rounded-lg hover:bg-[rgba(139,92,246,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-heading m-0 mb-2">🎬 Turn 状态流转</h4>
 <p className="m-0 text-sm text-body">GeminiEventType 事件细节</p>
 </button>

 <button onClick={() => navigate('session-state-anim')} className="block p-4 text-left bg-[rgba(236,72,153,0.1)] rounded-lg hover:bg-[rgba(236,72,153,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-heading m-0 mb-2">🎬 会话状态机</h4>
 <p className="m-0 text-sm text-body">Retry/Finished/ToolCallRequest</p>
 </button>

 <button onClick={() => navigate('retry')} className="block p-4 text-left bg-[rgba(245,158,11,0.1)] rounded-lg hover:bg-[rgba(245,158,11,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-amber-500 m-0 mb-2">♻️ 重试回退</h4>
 <p className="m-0 text-sm text-body">InvalidStream / 网络错误处理</p>
 </button>

 <button onClick={() => navigate('tool-scheduler')} className="block p-4 text-left bg-[rgba(16,185,129,0.1)] rounded-lg hover:bg-[rgba(16,185,129,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-heading m-0 mb-2">🔧 工具调度详解</h4>
 <p className="m-0 text-sm text-body">ToolCallRequest → 执行 → continuation</p>
 </button>

 <button onClick={() => navigate('error-recovery-patterns')} className="block p-4 text-left bg-[rgba(239,68,68,0.1)] rounded-lg hover:bg-[rgba(239,68,68,0.2)] transition-colors border-none cursor-pointer">
 <h4 className="text-red-400 m-0 mb-2">🛡️ 错误恢复模式</h4>
 <p className="m-0 text-sm text-body">流式错误处理策略</p>
 </button>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
