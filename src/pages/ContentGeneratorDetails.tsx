import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'gemini-chat', label: 'GeminiChat 核心', description: 'sendMessageStream 与调用点' },
 { id: 'streaming-response-processing', label: '流式响应处理', description: 'Turn.run 事件解码' },
 { id: 'turn-state-machine', label: 'Turn 状态机', description: '事件驱动生命周期' },
 { id: 'retry', label: '重试回退', description: 'InvalidStreamError / backoff' },
 { id: 'tool-scheduler', label: '工具调度详解', description: 'ToolCallRequest → continuation' },
 { id: 'content-format-conversion', label: 'fork-only：格式转换', description: 'Gemini ↔ OpenAI 兼容层' },
 { id: 'multi-provider', label: 'fork-only：多厂商架构', description: '非上游主线' },
];

export function ContentGeneratorDetails() {
 return (
 <div>
 <h2 className="text-2xl text-heading mb-5">ContentGenerator API 调用层详解</h2>

 {/* 30秒速览 */}
 <Layer title="30秒速览" icon="⚡">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">上游主线：调用链</h4>
 <CodeBlock
 code={`// 主要类层次
useGeminiStream.submitQuery()
 → geminiClient.sendMessageStream()
 → Turn.run() // 事件归一（GeminiEventType）
 → GeminiChat.sendMessageStream() // 处理重试 + history 维护
 → config.getContentGenerator().generateContentStream()

// 上游 ContentGenerator 体系（gemini-cli/packages/core/src/core/contentGenerator.ts）
ContentGenerator (interface)
├─ LoggingContentGenerator // 包装与日志
├─ RecordingContentGenerator // 可选：录制响应
├─ FakeContentGenerator // 可选：回放/测试
└─ GoogleGenAI.models // 真正调用 @google/genai 的实现`}
 />
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">关键点（上游）</h4>
 <ul className="text-sm text-body space-y-2">
 <li><strong>结构化 functionCalls</strong>: <code>resp.functionCalls</code> 直接提供 <code>args</code> 对象</li>
 <li><strong>Finished 触发点</strong>: 仅当 <code>finishReason</code> 存在才发 <code>GeminiEventType.Finished</code></li>
 <li><strong>InvalidStream 重试</strong>: 无效流抛 <code>InvalidStreamError</code> → yield <code>Retry</code></li>
 <li><strong>Thought/Citation</strong>: Thought 单独事件；citations 暂存到 Finished 统一输出</li>
 <li><strong>fork-only 兼容层</strong>: OpenAI <code>tool_calls</code> / SSE / 格式转换不属于上游主线</li>
 </ul>
 </div>
 </div>

 <div className="mt-4 bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">上游流式管道概览</h4>
 <MermaidDiagram
 chart={`flowchart LR
 A[@google/genai stream] --> B[GeminiChat.sendMessageStream]
 B --> C[Turn.run 事件解码]
 C --> D{GeminiEventType}
 D -->|Thought| T[UI Thought]
 D -->|Content| X[UI TextBuffer]
 D -->|ToolCallRequest| Y[ToolScheduler]
 D -->|Finished| Z[结束 turn + usage]
 B --> R[Retry 通知 (StreamEventType.RETRY)]`}
 />
 </div>
 </Layer>

 {/* 概述 */}
 <Layer title="架构概述" icon="🏗️">
 <HighlightBox title="ContentGenerator 的作用" icon="📡" variant="blue">
 <p>
 <code className="bg-base/30 px-1 rounded">ContentGenerator</code> 是 API 调用的抽象层，
 负责与不同的 AI 提供商通信。它将内部格式转换为 API 格式，并处理流式响应。
 </p>
 </HighlightBox>

 <HighlightBox title="⚠️ 重要：上游主线 vs fork-only" icon="🧭" variant="yellow">
 <p className="m-0 text-sm text-heading">
 上游 Gemini CLI 的主线只需要 <code>@google/genai</code> 的结构化流（<code>GenerateContentResponse</code> + <code>functionCalls</code>）。
 如果你的 fork 通过 OpenAI 兼容协议接入其他模型，才会额外引入 <code>tool_calls</code>/SSE/格式转换等兼容层。
 </p>
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-elevated/5 rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold mb-2">上游：Gemini CLI（GoogleGenAI）</h4>
 <code className="text-xs text-body block mb-2">
 gemini-cli/packages/core/src/core/contentGenerator.ts
 </code>
 <p className="text-sm text-body">
 通过 <code>createContentGenerator()</code> 生成 <code>ContentGenerator</code> 实例，底层调用 <code>GoogleGenAI.models</code>（或 Code Assist）。
 </p>
 </div>
 <div className="bg-elevated/5 rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-bold mb-2">fork-only：OpenAI 兼容层</h4>
 <code className="text-xs text-body block mb-2">
 packages/core/src/core/openaiContentGenerator/
 </code>
 <p className="text-sm text-body">
 当通过 OpenAI 兼容协议接入其他模型时，才需要请求/响应格式转换与 <code>tool_calls</code> 流式解析。
 </p>
 </div>
 </div>
 </Layer>

 {/* 上游：ContentGenerator */}
 <Layer title="上游：ContentGenerator 接口与工厂" icon="🏭">
 <CodeBlock
 title="contentGenerator.ts（上游）"
 code={`// gemini-cli/packages/core/src/core/contentGenerator.ts

export interface ContentGenerator {
 generateContent(request: GenerateContentParameters, userPromptId: string): Promise<GenerateContentResponse>;
 generateContentStream(request: GenerateContentParameters, userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
 countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
 embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}

export type ContentGeneratorConfig = {
 apiKey?: string;
 vertexai?: boolean;
 authType?: AuthType;
 proxy?: string;
};

export async function createContentGenerator(
 config: ContentGeneratorConfig,
 gcConfig: Config,
 sessionId?: string,
): Promise<ContentGenerator> {
 // Fake / Recording / Logging / GoogleGenAI.models / Code Assist ...
}`}
 />

 <HighlightBox title="为什么要抽象 ContentGenerator？" icon="🧩" variant="green">
 <ul className="m-0 text-sm leading-relaxed">
 <li><strong>GeminiChat 只依赖接口</strong>：不关心底层是 API Key、Vertex、还是 OAuth Code Assist</li>
 <li><strong>可插拔 wrapper</strong>：Logging/Recording/Fake 组合起来方便测试、录制与排障</li>
 <li><strong>上层拿到统一的 GenerateContentResponse 流</strong>：Turn.run 再做事件归一</li>
 </ul>
 </HighlightBox>
 </Layer>

 <Layer title="上游：GeminiChat 如何调用 ContentGenerator" icon="📤">
 <CodeBlock
 title="makeApiCallAndProcessStream（上游）"
 code={`// gemini-cli/packages/core/src/core/geminiChat.ts (simplified)

return this.config.getContentGenerator().generateContentStream(
 {
 model: modelToUse,
 contents: contentsToUse,
 config: {
 ...generateContentConfig,
 systemInstruction: this.systemInstruction,
 tools: this.tools,
 abortSignal,
 },
 },
 prompt_id,
);`}
 />
 <HighlightBox title="与 Turn.run 的边界" icon="📌" variant="blue">
 <p className="m-0 text-sm text-heading">
 <code>GeminiChat</code> 负责“发请求 + 重试 + history + hooks”；<code>Turn.run</code> 负责“把响应流解码为 GeminiEventType”。
 UI 只消费事件流，不直接依赖底层 SDK 返回结构。
 </p>
 </HighlightBox>
 </Layer>

 {/* OpenAI ContentGenerator */}
 <Layer title="Fork-only：OpenAI ContentGenerator 架构" icon="🔧">
 <CodeBlock
 title="类结构"
 code={`class OpenAIContentGenerator implements ContentGenerator {
 private client: OpenAI; // OpenAI SDK 客户端
 private converter: OpenAIContentConverter; // 格式转换器
 private telemetry: TelemetryService; // 遥测服务

 constructor(config: ContentGeneratorConfig) {
 this.client = new OpenAI({
 apiKey: config.apiKey,
 baseURL: config.baseUrl, // 支持自定义端点
 timeout: config.timeout,
 maxRetries: config.maxRetries
 });

 this.converter = new OpenAIContentConverter();
 }
}`}
 />
 </Layer>

 {/* generateContentStream */}
 <Layer title="Fork-only：generateContentStream()（OpenAI stream）" icon="📤">
 <CodeBlock
 title="核心生成方法"
 code={`async *generateContentStream(
 request: GenerateContentRequest
): AsyncGenerator<GenerateContentResponse> {

 // Stage 1: 转换请求格式
 const openaiRequest = this.converter.convertGeminiToOpenAI(request);

 // Stage 2: 调用 API
 const stream = await this.client.chat.completions.create({
 ...openaiRequest,
 stream: true // 启用流式
 });

 // Stage 3: 处理并转换响应
 for await (const chunk of stream) {
 // 转换 OpenAI 格式 → Gemini 格式
 const geminiChunk = this.converter
 .convertOpenAIResponseToGemini(chunk);

 yield geminiChunk;
 }
}`}
 />
 </Layer>

 {/* 格式转换 */}
 <Layer title="Fork-only：请求格式转换（Gemini ↔ OpenAI）" icon="🔄">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div>
 <h4 className="text-heading font-bold mb-2">Gemini 格式 (内部)</h4>
 <JsonBlock
 code={`{
 "model": "gemini-1.5-pro",
 "contents": [
 {
 "role": "user",
 "parts": [
 { "text": "帮我读取文件" }
 ]
 }
 ],
 "tools": [
 {
 "functionDeclarations": [
 {
 "name": "read_file",
 "description": "读取文件内容",
 "parametersJsonSchema": {
 "type": "object",
 "properties": {
 "file_path": { "type": "string" }
 }
 }
 }
 ]
 }
 ],
 "generationConfig": {
 "temperature": 0.7,
 "maxOutputTokens": 8192
 }
}`}
 />
 </div>
 <div>
 <h4 className="text-heading font-bold mb-2">OpenAI 格式 (API)</h4>
 <JsonBlock
 code={`{
 "model": "gemini-1.5-pro",
 "messages": [
 {
 "role": "user",
 "content": "帮我读取文件"
 }
 ],
 "tools": [
 {
 "type": "function",
 "function": {
 "name": "read_file",
 "description": "读取文件内容",
 "parameters": {
 "type": "object",
 "properties": {
 "file_path": { "type": "string" }
 }
 }
 }
 }
 ],
 "temperature": 0.7,
 "max_tokens": 8192,
 "stream": true
}`}
 />
 </div>
 </div>
 </Layer>

 {/* 响应转换 */}
 <Layer title="Fork-only：响应格式转换（OpenAI → Gemini）" icon="📥">
 <CodeBlock
 title="OpenAIContentConverter.convertOpenAIResponseToGemini()"
 code={`convertOpenAIResponseToGemini(chunk: ChatCompletionChunk) {
 const choice = chunk.choices[0];
 const delta = choice.delta;

 const parts = [];

 // 1. 文本内容
 if (delta.content) {
 parts.push({ text: delta.content });
 }

 // 2. 工具调用
 if (delta.tool_calls) {
 for (const toolCall of delta.tool_calls) {
 parts.push({
 functionCall: {
 name: toolCall.function.name,
 args: JSON.parse(toolCall.function.arguments)
 }
 });
 }
 }

 // 3. 构建 Gemini 格式响应
 return {
 candidates: [{
 content: {
 role: 'model',
 parts: parts
 },
 finishReason: this.mapFinishReason(choice.finish_reason)
 }],
 usageMetadata: this.convertUsage(chunk.usage)
 };
}`}
 />
 </Layer>

 {/* 工具定义转换 */}
 <Layer title="Fork-only：工具定义转换（FunctionDeclaration → OpenAI Tool）" icon="🔧">
 <CodeBlock
 title="convertToolsToOpenAI()"
 code={`convertToolsToOpenAI(tools: Tool[]): OpenAITool[] {
 return tools.map(tool => {
 // Gemini FunctionDeclaration → OpenAI Function
 const funcDecl = tool.functionDeclarations[0];

 return {
 type: 'function',
 function: {
 name: funcDecl.name,
 description: funcDecl.description,
 parameters: {
 type: 'object',
 properties: funcDecl.parameters.properties,
 required: funcDecl.parameters.required || []
 }
 }
 };
 });
}`}
 />

 <HighlightBox title="工具定义结构" icon="📋" variant="green">
 <p className="mb-2">每个工具定义包含：</p>
 <ul className="pl-5 list-disc space-y-1">
 <li><strong>name</strong>: 工具名称（如 read_file, edit, bash）</li>
 <li><strong>description</strong>: 工具描述，帮助 AI 理解何时使用</li>
 <li><strong>parameters</strong>: JSON Schema 定义的参数结构</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 配置选项 */}
 <Layer title="配置：ContentGeneratorConfig（上游）" icon="⚙️">
 <CodeBlock
 code={`// gemini-cli/packages/core/src/core/contentGenerator.ts

export enum AuthType {
 LOGIN_WITH_GOOGLE = 'oauth-personal',
 USE_GEMINI = 'gemini-api-key',
 USE_VERTEX_AI = 'vertex-ai',
 LEGACY_CLOUD_SHELL = 'cloud-shell',
 COMPUTE_ADC = 'compute-default-credentials',
}

export type ContentGeneratorConfig = {
 apiKey?: string;
 vertexai?: boolean;
 authType?: AuthType;
 proxy?: string;
};

// fork-only：如果通过 OpenAI 兼容协议接入其他模型，可能会扩展出 baseUrl/timeout/maxRetries 等字段。`}
 />
 </Layer>

 {/* 错误处理 */}
 <Layer title="错误处理" icon="⚠️">
 <div className="space-y-3">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">429 Rate Limit</h4>
 <p className="text-sm text-body mb-2">请求过多，需要等待</p>
 <code className="text-xs text-body">
 处理：读取 Retry-After 头，等待后重试
 </code>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">401 Unauthorized</h4>
 <p className="text-sm text-body mb-2">认证失败</p>
 <code className="text-xs text-body">
 处理：提示用户检查 API 密钥
 </code>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">500 Server Error</h4>
 <p className="text-sm text-body mb-2">服务器错误</p>
 <code className="text-xs text-body">
 处理：指数退避重试，最多 3 次
 </code>
 </div>

 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">Timeout</h4>
 <p className="text-sm text-body mb-2">请求超时</p>
 <code className="text-xs text-body">
 处理：重试或提示用户网络问题
 </code>
 </div>
 </div>
 </Layer>

 {/* 流式处理管道 */}
 <Layer title="流式处理管道" icon="🌊">
 <div className="bg-base/30 rounded-lg p-6">
 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="bg-accent/10 border border-edge rounded-lg px-4 py-2 text-center">
 <div className="text-sm text-heading">Raw API Stream</div>
 <div className="text-xs text-body">ChatCompletionChunk</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border border-edge rounded-lg px-4 py-2 text-center">
 <div className="text-sm text-heading">转换器</div>
 <div className="text-xs text-body">OpenAI → Gemini</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg px-4 py-2 text-center">
 <div className="text-sm text-heading">标准化 Stream</div>
 <div className="text-xs text-body">GenerateContentResponse</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg px-4 py-2 text-center">
 <div className="text-sm text-heading">GeminiChat</div>
 <div className="text-xs text-body">历史更新</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-[var(--purple-glow)] border border-[var(--purple)] rounded-lg px-4 py-2 text-center">
 <div className="text-sm text-heading">UI 渲染</div>
 <div className="text-xs text-body">实时显示</div>
 </div>
 </div>
 </div>
 </Layer>

 {/* StreamingToolCallParser 详解 */}
 <Layer title="Fork-only：StreamingToolCallParser（tool_calls 增量解析）" icon="🔧">
 <HighlightBox title="核心问题：流式 JSON 解析" icon="⚠️" variant="orange">
 <p className="mb-2">
 当 AI 调用工具时，参数是一个 JSON 对象。但在流式传输中，这个 JSON 被分割成多个小片段依次到达。
 例如 <code className="bg-base/30 px-1 rounded">{`{"path": "/src/app.ts"}`}</code> 可能分成：
 </p>
 <div className="flex flex-wrap gap-2 mt-2">
 <code className="bg-base/50 px-2 py-1 rounded text-xs">{`{"pa`}</code>
 <span className="text-heading">→</span>
 <code className="bg-base/50 px-2 py-1 rounded text-xs">{`th": "/sr`}</code>
 <span className="text-heading">→</span>
 <code className="bg-base/50 px-2 py-1 rounded text-xs">{`c/app.ts"}`}</code>
 </div>
 </HighlightBox>

 <CodeBlock
 title="StreamingToolCallParser 类结构"
 language="typescript"
 code={`// packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts

export interface ToolCallParseResult {
 completed: boolean; // JSON 是否完整
 args?: Record<string, unknown>; // 解析出的参数
 buffer: string; // 当前累积的 JSON 字符串
}

export class StreamingToolCallParser {
 // 每个 tool_call index 独立追踪状态
 private buffers: Map<number, string> = new Map(); // JSON 字符串累积
 private depths: Map<number, number> = new Map(); // 大括号/方括号深度
 private inStrings: Map<number, boolean> = new Map(); // 是否在字符串内
 private escapes: Map<number, boolean> = new Map(); // 上一个字符是否是转义符

 // 处理 index 碰撞：同一 index 可能被不同 tool_call 复用
 private toolCallIds: Map<number, string> = new Map(); // index → id
 private completedToolCalls: Map<string, { // id → 完整数据
 id?: string;
 name?: string;
 args: Record<string, unknown>;
 index: number;
 }> = new Map();
}`}
 />

 <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">深度追踪算法</h4>
 <CodeBlock
 code={`// 逐字符追踪 JSON 结构深度
for (const char of chunk) {
 if (escape) {
 escape = false; // 跳过转义字符
 continue;
 }

 if (char === '\\\\') {
 escape = true;
 continue;
 }

 if (char === '"' && !escape) {
 inString = !inString; // 切换字符串状态
 continue;
 }

 if (!inString) {
 if (char === '{' || char === '[') {
 depth++; // 进入嵌套
 } else if (char === '}' || char === ']') {
 depth--; // 退出嵌套
 }
 }
}

// depth === 0 表示 JSON 完整
if (depth === 0) {
 return { completed: true, args: JSON.parse(buffer) };
}`}
 />
 </div>

 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">Index 碰撞处理</h4>
 <CodeBlock
 code={`// 检测 index 碰撞：新 id 使用相同 index
if (id && this.toolCallIds.has(index)) {
 const existingId = this.toolCallIds.get(index);

 if (existingId !== id) {
 // 碰撞！旧的 tool_call 被新的覆盖
 // 保存旧的未完成数据
 if (this.buffers.has(index)) {
 const oldBuffer = this.buffers.get(index)!;
 // 尝试修复并保存旧数据
 this.saveIncompleteToolCall(existingId, oldBuffer);
 }

 // 重置状态给新 tool_call
 this.resetIndex(index);
 this.toolCallIds.set(index, id);
 }
}`}
 />
 </div>
 </div>

 <CodeBlock
 title="自动修复未闭合的 JSON 字符串"
 language="typescript"
 code={`// 当检测到 index 碰撞时，尝试修复未完成的 JSON
private tryRepairAndParse(buffer: string): Record<string, unknown> | null {
 // 策略1: 直接解析
 try {
 return JSON.parse(buffer);
 } catch {}

 // 策略2: 补全闭合引号和大括号
 let repaired = buffer;

 // 如果在字符串中间断开，补上引号
 if (this.inStrings.get(currentIndex)) {
 repaired += '"';
 }

 // 补全缺失的闭合括号
 const depth = this.depths.get(currentIndex) || 0;
 for (let i = 0; i < depth; i++) {
 repaired += '}';
 }

 try {
 return JSON.parse(repaired);
 } catch {
 return null; // 无法修复
 }
}`}
 />

 <HighlightBox title="典型流式场景示例" icon="📖" variant="green">
 <div className="space-y-3">
 <div className="bg-base/30 rounded p-3">
 <div className="text-xs text-body mb-1">Chunk 1: tool_call 开始</div>
 <code className="text-sm">{`delta: { tool_calls: [{ index: 0, id: "call_123", function: { name: "read_file", arguments: "" }}] }`}</code>
 </div>
 <div className="bg-base/30 rounded p-3">
 <div className="text-xs text-body mb-1">Chunk 2-5: 参数分片</div>
 <code className="text-sm">{`arguments: '{"' → 'path' → '": "/' → 'src/app.ts' → '"}'`}</code>
 </div>
 <div className="bg-base/30 rounded p-3">
 <div className="text-xs text-body mb-1">解析结果</div>
 <code className="text-sm">{`{ completed: true, args: { file_path: "/src/app.ts" } }`}</code>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* ContentGenerationPipeline 详解 */}
 <Layer title="ContentGenerationPipeline 执行管道" icon="⚡">
 <CodeBlock
 title="executeStream() 入口方法"
 language="typescript"
 code={`// packages/core/src/core/openaiContentGenerator/pipeline.ts

async executeStream(
 request: GenerateContentParameters,
 userPromptId: string,
): Promise<AsyncGenerator<GenerateContentResponse>> {
 return this.executeWithErrorHandling(
 request,
 userPromptId,
 true, // isStreaming = true
 async (openaiRequest, context) => {
 // Stage 1: 创建 OpenAI 流
 const stream = (await this.client.chat.completions.create(
 openaiRequest,
 { signal: request.config?.abortSignal }
 )) as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;

 // Stage 2: 处理流并转换格式
 return this.processStreamWithLogging(
 stream,
 context,
 openaiRequest,
 request,
 );
 },
 );
}`}
 />

 <MermaidDiagram
 title="processStreamWithLogging() 完整流程"
 chart={`sequenceDiagram
 participant API as OpenAI API
 participant Pipeline as Pipeline
 participant Converter as Converter
 participant Parser as ToolCallParser
 participant Collector as ResponseCollector

 Note over Pipeline: 重置 ToolCallParser 状态
 Pipeline->>Parser: resetStreamingToolCalls()

 loop 每个 Chunk
 API->>Pipeline: ChatCompletionChunk
 Pipeline->>Collector: 收集原始 Chunk (用于日志)
 Pipeline->>Converter: convertOpenAIChunkToGemini()
 Converter->>Parser: 解析 tool_calls (如果有)
 Converter-->>Pipeline: GenerateContentResponse

 alt 空响应 (无内容/无finishReason/无usage)
 Pipeline->>Pipeline: continue (跳过)
 else 有 finishReason
 Pipeline->>Pipeline: 暂存，等待 usageMetadata
 else 普通内容
 Pipeline-->>Pipeline: yield response
 end
 end

 Note over Pipeline: 流结束
 Pipeline->>Collector: 记录成功日志
 Pipeline->>Pipeline: 返回最终合并的响应`}
 />

 <CodeBlock
 title="processStreamWithLogging() 核心实现"
 language="typescript"
 code={`private async *processStreamWithLogging(
 stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
 context: RequestContext,
 openaiRequest: OpenAI.Chat.ChatCompletionCreateParams,
 request: GenerateContentParameters,
): AsyncGenerator<GenerateContentResponse> {
 const collectedGeminiResponses: GenerateContentResponse[] = [];
 const collectedOpenAIChunks: OpenAI.Chat.ChatCompletionChunk[] = [];

 // 重置状态防止上次流的数据污染
 this.converter.resetStreamingToolCalls();

 // 用于 Chunk 合并的状态
 let pendingFinishResponse: GenerateContentResponse | null = null;

 try {
 for await (const chunk of stream) {
 // 始终收集原始 chunk 用于日志
 collectedOpenAIChunks.push(chunk);

 // 转换为 Gemini 格式
 const response = this.converter.convertOpenAIChunkToGemini(chunk);

 // 过滤空响应
 if (
 response.candidates?.[0]?.content?.parts?.length === 0 &&
 !response.candidates?.[0]?.finishReason &&
 !response.usageMetadata
 ) {
 continue;
 }

 // 处理 Chunk 合并
 const shouldYield = this.handleChunkMerging(
 response,
 collectedGeminiResponses,
 (mergedResponse) => { pendingFinishResponse = mergedResponse; },
 );

 if (shouldYield) {
 if (pendingFinishResponse) {
 yield pendingFinishResponse;
 pendingFinishResponse = null;
 } else {
 yield response;
 }
 }
 }

 // 流结束后如果还有暂存的响应，yield 它
 if (pendingFinishResponse) {
 yield pendingFinishResponse;
 }

 // 记录成功日志
 await this.config.telemetryService.logStreamingSuccess(
 context,
 collectedGeminiResponses,
 openaiRequest,
 collectedOpenAIChunks,
 );
 } catch (error) {
 this.converter.resetStreamingToolCalls();
 await this.handleError(error, context, request);
 }
}`}
 />
 </Layer>

 {/* Chunk 合并策略 */}
 <Layer title="Chunk 合并策略" icon="🔗">
 <HighlightBox title="为什么需要合并？" icon="❓" variant="blue">
 <p>
 某些 API 提供商会将 <code className="bg-base/30 px-1 rounded">finishReason</code> 和{' '}
 <code className="bg-base/30 px-1 rounded">usageMetadata</code> 在不同的 chunk 中发送。
 如果不合并，消费者会收到一个只有 finishReason 但没有 usage 的响应，
 紧接着又收到一个只有 usage 的响应，这会导致状态混乱。
 </p>
 </HighlightBox>

 <CodeBlock
 title="handleChunkMerging() 合并逻辑"
 language="typescript"
 code={`/**
 * 合并策略：当遇到 finishReason chunk 时，暂存它，
 * 然后将后续 chunk 的数据（特别是 usageMetadata）合并进去，
 * 直到流结束再 yield 最终合并的响应。
 */
private handleChunkMerging(
 response: GenerateContentResponse,
 collectedGeminiResponses: GenerateContentResponse[],
 setPendingFinish: (response: GenerateContentResponse) => void,
): boolean {
 const isFinishChunk = response.candidates?.[0]?.finishReason;

 // 检查之前是否已有暂存的 finish 响应
 const hasPendingFinish =
 collectedGeminiResponses.length > 0 &&
 collectedGeminiResponses[collectedGeminiResponses.length - 1]
 .candidates?.[0]?.finishReason;

 if (isFinishChunk) {
 // 这是 finishReason chunk，暂存它
 collectedGeminiResponses.push(response);
 setPendingFinish(response);
 return false; // 不立即 yield，等待后续 chunk
 } else if (hasPendingFinish) {
 // 已有暂存的 finish，将当前 chunk 的数据合并进去
 const lastResponse = collectedGeminiResponses[collectedGeminiResponses.length - 1];
 const mergedResponse = new GenerateContentResponse();

 // 保留 finishReason
 mergedResponse.candidates = lastResponse.candidates;

 // 合并 usageMetadata
 if (response.usageMetadata) {
 mergedResponse.usageMetadata = response.usageMetadata;
 } else {
 mergedResponse.usageMetadata = lastResponse.usageMetadata;
 }

 // 复制其他属性
 mergedResponse.responseId = response.responseId;
 mergedResponse.createTime = response.createTime;
 mergedResponse.modelVersion = response.modelVersion;
 mergedResponse.promptFeedback = response.promptFeedback;

 // 更新收集的响应
 collectedGeminiResponses[collectedGeminiResponses.length - 1] = mergedResponse;
 setPendingFinish(mergedResponse);
 return true; // yield 合并后的响应
 }

 // 普通 chunk，直接收集并 yield
 collectedGeminiResponses.push(response);
 return true;
}`}
 />

 <div className="mt-4 bg-base/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">Chunk 合并时序图</h4>
 <MermaidDiagram
 chart={`sequenceDiagram
 participant API as API Stream
 participant Handler as handleChunkMerging
 participant State as pendingFinish
 participant Output as yield

 API->>Handler: Chunk 1: text content
 Handler->>Output: yield (普通内容)

 API->>Handler: Chunk 2: text content
 Handler->>Output: yield (普通内容)

 API->>Handler: Chunk 3: finishReason="stop"
 Handler->>State: 暂存 (不 yield)
 Note right of State: pendingFinish = response

 API->>Handler: Chunk 4: usageMetadata
 Handler->>State: 合并 usageMetadata
 Handler->>Output: yield (合并后的响应)
 Note right of Output: finishReason + usageMetadata`}
 />
 </div>
 </Layer>

 {/* OpenAIContentConverter 详解 */}
 <Layer title="OpenAIContentConverter 格式转换" icon="🔄">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div>
 <h4 className="text-heading font-bold mb-2">请求转换: Gemini → OpenAI</h4>
 <CodeBlock
 code={`// convertGeminiRequestToOpenAI()
// Gemini contents → OpenAI messages

Gemini Content:
{
 role: "user",
 parts: [
 { text: "读取文件" },
 { inlineData: { mimeType: "image/png", data: "..." } }
 ]
}

 ↓ 转换 ↓

OpenAI Message:
{
 role: "user",
 content: [
 { type: "text", text: "读取文件" },
 { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
 ]
}`}
 />
 </div>
 <div>
 <h4 className="text-heading font-bold mb-2">响应转换: OpenAI → Gemini</h4>
 <CodeBlock
 code={`// convertOpenAIChunkToGemini()
// OpenAI chunk → Gemini response

OpenAI Chunk:
{
 choices: [{
 delta: {
 content: "Hello",
 tool_calls: [{ index: 0, function: { arguments: '{"p' }}]
 },
 finish_reason: null
 }],
 usage: null
}

 ↓ 转换 ↓

Gemini Response:
{
 candidates: [{
 content: {
 role: "model",
 parts: [{ text: "Hello" }]
 },
 finishReason: null
 }],
 usageMetadata: null
}`}
 />
 </div>
 </div>

 <CodeBlock
 title="convertOpenAIChunkToGemini() 完整实现"
 language="typescript"
 code={`convertOpenAIChunkToGemini(
 chunk: OpenAI.Chat.ChatCompletionChunk
): GenerateContentResponse {
 const choice = chunk.choices?.[0];
 const delta = choice?.delta;
 const parts: Part[] = [];

 // 1. 处理文本内容
 if (delta?.content) {
 parts.push({ text: delta.content });
 }

 // 2. 处理工具调用（使用 StreamingToolCallParser）
 if (delta?.tool_calls) {
 for (const toolCall of delta.tool_calls) {
 // 将分片添加到解析器
 const parseResult = this.streamingToolCallParser.addChunk(
 toolCall.index,
 toolCall.function?.arguments || '',
 toolCall.id,
 toolCall.function?.name,
 );

 // 如果 JSON 完整，添加到 parts
 if (parseResult.completed && parseResult.args) {
 parts.push({
 functionCall: {
 name: toolCall.function?.name || this.getToolCallName(toolCall.index),
 args: parseResult.args,
 },
 });
 }
 }
 }

 // 3. 构建 Gemini 格式响应
 const response = new GenerateContentResponse();
 response.candidates = [{
 content: { role: 'model', parts },
 finishReason: this.mapFinishReason(choice?.finish_reason),
 }];

 // 4. 转换 usage 信息
 if (chunk.usage) {
 response.usageMetadata = {
 promptTokenCount: chunk.usage.prompt_tokens,
 candidatesTokenCount: chunk.usage.completion_tokens,
 totalTokenCount: chunk.usage.total_tokens,
 };
 }

 return response;
}`}
 />

 <HighlightBox title="finishReason 映射" icon="🏁" variant="purple">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">OpenAI</div>
 <div className="text-heading">stop</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">Gemini</div>
 <div className="text-heading">STOP</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">OpenAI</div>
 <div className="text-heading">length</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">Gemini</div>
 <div className="text-heading">MAX_TOKENS</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">OpenAI</div>
 <div className="text-heading">tool_calls</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">Gemini</div>
 <div className="text-heading">STOP</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">OpenAI</div>
 <div className="text-heading">content_filter</div>
 </div>
 <div className="bg-base/30 rounded p-2">
 <div className="text-body">Gemini</div>
 <div className="text-heading">SAFETY</div>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* 采样参数构建 */}
 <Layer title="采样参数构建" icon="🎛️">
 <CodeBlock
 title="buildSamplingParameters() 参数优先级"
 language="typescript"
 code={`// packages/core/src/core/openaiContentGenerator/pipeline.ts

private buildSamplingParameters(
 request: GenerateContentParameters,
): Record<string, unknown> {
 const configSamplingParams = this.contentGeneratorConfig.samplingParams;

 // 优先级: config > request > default
 const getParameterValue = <T>(
 configKey: keyof typeof configSamplingParams,
 requestKey: keyof typeof request.config,
 defaultValue?: T,
 ): T | undefined => {
 const configValue = configSamplingParams?.[configKey] as T | undefined;
 const requestValue = request.config?.[requestKey] as T | undefined;

 if (configValue !== undefined) return configValue;
 if (requestValue !== undefined) return requestValue;
 return defaultValue;
 };

 return {
 // 基础采样参数
 temperature: getParameterValue('temperature', 'temperature'),
 top_p: getParameterValue('top_p', 'topP'),
 max_tokens: getParameterValue('max_tokens', 'maxOutputTokens'),

 // 高级参数（仅从 config 读取）
 top_k: configSamplingParams?.top_k,
 repetition_penalty: configSamplingParams?.repetition_penalty,
 presence_penalty: configSamplingParams?.presence_penalty,
 frequency_penalty: configSamplingParams?.frequency_penalty,
 };
}`}
 />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-heading">参数</th>
 <th className="text-left py-2 px-3 text-heading">Config Key</th>
 <th className="text-left py-2 px-3 text-heading">Request Key</th>
 <th className="text-left py-2 px-3 text-heading">范围</th>
 <th className="text-left py-2 px-3 text-heading">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code>temperature</code></td>
 <td className="py-2 px-3">temperature</td>
 <td className="py-2 px-3">temperature</td>
 <td className="py-2 px-3">0-2</td>
 <td className="py-2 px-3">随机性控制</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code>top_p</code></td>
 <td className="py-2 px-3">top_p</td>
 <td className="py-2 px-3">topP</td>
 <td className="py-2 px-3">0-1</td>
 <td className="py-2 px-3">核采样</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code>max_tokens</code></td>
 <td className="py-2 px-3">max_tokens</td>
 <td className="py-2 px-3">maxOutputTokens</td>
 <td className="py-2 px-3">1-∞</td>
 <td className="py-2 px-3">最大输出长度</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code>top_k</code></td>
 <td className="py-2 px-3">top_k</td>
 <td className="py-2 px-3">-</td>
 <td className="py-2 px-3">1-100</td>
 <td className="py-2 px-3">Top-K 采样</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-3"><code>presence_penalty</code></td>
 <td className="py-2 px-3">presence_penalty</td>
 <td className="py-2 px-3">-</td>
 <td className="py-2 px-3">-2 to 2</td>
 <td className="py-2 px-3">新话题倾向</td>
 </tr>
 <tr>
 <td className="py-2 px-3"><code>frequency_penalty</code></td>
 <td className="py-2 px-3">frequency_penalty</td>
 <td className="py-2 px-3">-</td>
 <td className="py-2 px-3">-2 to 2</td>
 <td className="py-2 px-3">重复惩罚</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* 错误处理详解 */}
 <Layer title="错误处理机制" icon="🛡️">
 <CodeBlock
 title="handleError() 统一错误处理"
 language="typescript"
 code={`// 流处理和普通请求共用的错误处理逻辑
private async handleError(
 error: unknown,
 context: RequestContext,
 request: GenerateContentParameters,
 userPromptId?: string,
 isStreaming?: boolean,
): Promise<never> {
 context.duration = Date.now() - context.startTime;

 // 构建请求用于日志（可能失败，但仍需记录错误）
 let openaiRequest: OpenAI.Chat.ChatCompletionCreateParams;
 try {
 if (userPromptId !== undefined && isStreaming !== undefined) {
 openaiRequest = await this.buildRequest(request, userPromptId, isStreaming);
 } else {
 // 流处理中的错误，创建最小请求用于日志
 openaiRequest = { model: this.contentGeneratorConfig.model, messages: [] };
 }
 } catch {
 openaiRequest = { model: this.contentGeneratorConfig.model, messages: [] };
 }

 // 记录错误日志
 await this.config.telemetryService.logError(context, error, openaiRequest);

 // 调用错误处理器（抛出适当的错误）
 this.config.errorHandler.handle(error, context, request);
}`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">流处理特殊处理</h4>
 <ul className="text-sm text-body space-y-2">
 <li><strong>状态清理</strong>: 错误时重置 StreamingToolCallParser</li>
 <li><strong>部分响应</strong>: 已 yield 的响应不会撤回</li>
 <li><strong>日志完整性</strong>: 即使失败也记录已收集的 chunks</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">常见错误类型</h4>
 <ul className="text-sm text-body space-y-2">
 <li><strong>网络中断</strong>: 流在中途断开</li>
 <li><strong>超时</strong>: 响应时间过长</li>
 <li><strong>格式错误</strong>: API 返回非预期格式</li>
 <li><strong>取消请求</strong>: 用户通过 AbortSignal 取消</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 源码导航 */}
 <Layer title="源码导航" icon="📂">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-heading">文件</th>
 <th className="text-left py-2 px-3 text-heading">核心类/函数</th>
 <th className="text-left py-2 px-3 text-heading">职责</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/openaiContentGenerator.ts</code>
 </td>
 <td className="py-2 px-3"><code>OpenAIContentGenerator</code></td>
 <td className="py-2 px-3">ContentGenerator 接口实现，入口类</td>
 </tr>
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/pipeline.ts</code>
 </td>
 <td className="py-2 px-3"><code>ContentGenerationPipeline</code></td>
 <td className="py-2 px-3">流式执行管道，chunk 处理与合并</td>
 </tr>
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/converter.ts</code>
 </td>
 <td className="py-2 px-3"><code>OpenAIContentConverter</code></td>
 <td className="py-2 px-3">Gemini ↔ OpenAI 格式双向转换</td>
 </tr>
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts</code>
 </td>
 <td className="py-2 px-3"><code>StreamingToolCallParser</code></td>
 <td className="py-2 px-3">流式 JSON 解析，深度追踪，index 碰撞处理</td>
 </tr>
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/telemetryService.ts</code>
 </td>
 <td className="py-2 px-3"><code>TelemetryService</code></td>
 <td className="py-2 px-3">请求/响应日志记录</td>
 </tr>
 <tr className="border- border-edge hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/errorHandler.ts</code>
 </td>
 <td className="py-2 px-3"><code>ErrorHandler</code></td>
 <td className="py-2 px-3">错误分类与处理策略</td>
 </tr>
 <tr className="hover:bg-elevated">
 <td className="py-2 px-3">
 <code className="text-xs">packages/core/src/core/openaiContentGenerator/provider/</code>
 </td>
 <td className="py-2 px-3"><code>OpenAICompatibleProvider</code></td>
 <td className="py-2 px-3">提供商特定配置（OpenAI, Azure, 等）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
