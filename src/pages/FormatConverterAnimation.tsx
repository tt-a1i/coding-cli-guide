import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';
import { HighlightBox } from '../components/HighlightBox';

// 转换阶段
type ConversionPhase =
 | 'gemini_input'
 | 'extract_system'
 | 'process_contents'
 | 'convert_tool_calls'
 | 'openai_output'
 | 'api_call'
 | 'openai_response'
 | 'convert_response'
 | 'gemini_output';

interface ConversionStep {
 phase: ConversionPhase;
 title: string;
 description: string;
 leftData: string;
 rightData: string;
 code: string;
}

const conversionSteps: ConversionStep[] = [
 {
 phase: 'gemini_input',
 title: 'Gemini 请求格式',
 description: '接收 Gemini SDK 格式的请求参数',
 leftData: `// GenerateContentParameters
{
 contents: [
 {
 role: "user",
 parts: [{ text: "读取 package.json" }]
 }
 ],
 config: {
 systemInstruction: {
 parts: [{ text: "You are a helpful assistant..." }]
 }
 },
 tools: [
 {
 functionDeclarations: [
 {
 name: "read_file",
 description: "Read file content",
 parameters: {
 type: "object",
 properties: {
 path: { type: "string" }
 }
 }
 }
 ]
 }
 ]
}`,
 rightData: '',
 code: `// converter.ts:201 - 入口函数
export function convertGeminiRequestToOpenAI(
 request: GenerateContentParameters
): OpenAI.Chat.ChatCompletionCreateParams {

 const messages: ChatCompletionMessageParam[] = [];

 // Step 1: 提取系统指令
 // Step 2: 处理 contents
 // Step 3: 转换工具定义
 // Step 4: 清理和合并消息

 return { model, messages, tools, ... };
}`,
 },
 {
 phase: 'extract_system',
 title: '提取系统指令',
 description: 'systemInstruction → system message',
 leftData: `// Gemini systemInstruction
{
 parts: [
 { text: "You are a helpful assistant..." },
 { text: "Follow these rules..." }
 ]
}`,
 rightData: `// OpenAI system message
{
 role: "system",
 content: "You are a helpful assistant...\\n\\nFollow these rules..."
}`,
 code: `// converter.ts:225 - addSystemInstructionMessage()
function addSystemInstructionMessage(
 messages: ChatCompletionMessageParam[],
 systemInstruction: Content | string
): void {
 let systemText = '';

 if (typeof systemInstruction === 'string') {
 systemText = systemInstruction;
 } else if (systemInstruction.parts) {
 // 拼接所有 text parts
 systemText = systemInstruction.parts
 .filter(p => p.text)
 .map(p => p.text)
 .join('\\n\\n');
 }

 if (systemText) {
 messages.push({
 role: 'system',
 content: systemText
 });
 }
}`,
 },
 {
 phase: 'process_contents',
 title: '处理消息内容',
 description: 'Gemini Content[] → OpenAI messages[]',
 leftData: `// Gemini Contents
[
 {
 role: "user",
 parts: [
 { text: "读取 package.json" },
 { inlineData: { mimeType: "image/png", data: "..." } }
 ]
 },
 {
 role: "model",
 parts: [
 { text: "好的，让我读取这个文件" },
 { functionCall: { name: "read_file", args: {...} } }
 ]
 }
]`,
 rightData: `// OpenAI Messages
[
 {
 role: "user",
 content: [
 { type: "text", text: "读取 package.json" },
 { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
 ]
 },
 {
 role: "assistant",
 content: "好的，让我读取这个文件",
 tool_calls: [{
 id: "call_001",
 type: "function",
 function: { name: "read_file", arguments: "..." }
 }]
 }
]`,
 code: `// converter.ts:280 - processContent()
function processContent(
 content: Content,
 messages: ChatCompletionMessageParam[]
): void {
 const role = content.role === 'model' ? 'assistant' : content.role;

 // 分离不同类型的 parts
 const textParts = content.parts.filter(p => p.text);
 const imageParts = content.parts.filter(p => p.inlineData || p.fileData);
 const functionCalls = content.parts.filter(p => p.functionCall);
 const functionResponses = content.parts.filter(p => p.functionResponse);

 // 根据内容类型构建消息
 if (functionResponses.length > 0) {
 // 工具响应 → role: 'tool'
 for (const fr of functionResponses) {
 messages.push({
 role: 'tool',
 tool_call_id: fr.functionResponse.id,
 content: JSON.stringify(fr.functionResponse.response)
 });
 }
 } else if (role === 'assistant') {
 // 助手消息，可能包含 tool_calls
 const msg: ChatCompletionAssistantMessageParam = {
 role: 'assistant',
 content: textParts.map(p => p.text).join('')
 };

 if (functionCalls.length > 0) {
 msg.tool_calls = functionCalls.map((fc, i) => ({
 id: fc.functionCall.id || \`call_\${i}\`,
 type: 'function',
 function: {
 name: fc.functionCall.name,
 arguments: JSON.stringify(fc.functionCall.args)
 }
 }));
 }

 messages.push(msg);
 } else {
 // 用户消息
 // ...
 }
}`,
 },
 {
 phase: 'convert_tool_calls',
 title: '转换工具定义',
 description: 'Gemini FunctionDeclaration → OpenAI Tool',
 leftData: `// Gemini FunctionDeclaration
{
 name: "read_file",
 description: "Read file content",
 parameters: {
 type: "object",
 properties: {
 path: {
 type: "string",
 description: "File path"
 }
 },
 required: ["path"]
 }
}`,
 rightData: `// OpenAI Tool
{
 type: "function",
 function: {
 name: "read_file",
 description: "Read file content",
 parameters: {
 type: "object",
 properties: {
 path: {
 type: "string",
 description: "File path"
 }
 },
 required: ["path"]
 }
 }
}`,
 code: `// converter.ts:420 - convertGeminiToolsToOpenAI()
function convertGeminiToolsToOpenAI(
 geminiTools: GeminiTool[]
): ChatCompletionTool[] {
 const openaiTools: ChatCompletionTool[] = [];

 for (const tool of geminiTools) {
 // Gemini Tool 可能有两种格式:
 // 1. functionDeclarations[]
 // 2. 直接的 MCP tool

 if (tool.functionDeclarations) {
 for (const fd of tool.functionDeclarations) {
 openaiTools.push({
 type: 'function',
 function: {
 name: fd.name,
 description: fd.description,
 parameters: convertParameters(fd.parameters)
 }
 });
 }
 }
 }

 return openaiTools;
}

// 参数 Schema 转换 (处理类型差异)
function convertParameters(params: FunctionDeclarationSchema) {
 // 递归转换，处理:
 // - 数值约束: string → number
 // - 嵌套对象: 递归应用
 return convertedSchema;
}`,
 },
 {
 phase: 'openai_output',
 title: 'OpenAI 请求构建完成',
 description: '准备发送给 OpenAI 兼容 API',
 leftData: '',
 rightData: `// ChatCompletionCreateParams
{
 model: "gemini-1.5-pro",
 messages: [
 { role: "system", content: "You are..." },
 { role: "user", content: "读取 package.json" }
 ],
 tools: [{
 type: "function",
 function: {
 name: "read_file",
 description: "...",
 parameters: {...}
 }
 }],
 stream: true,
 stream_options: { include_usage: true }
}`,
 code: `// converter.ts:500 - 最终组装
return {
 model: request.model || DEFAULT_MODEL,
 messages: cleanedMessages,
 tools: openaiTools.length > 0 ? openaiTools : undefined,
 stream: true,
 stream_options: {
 include_usage: true // 获取 token 统计
 },
 // 可选参数
 temperature: request.config?.temperature,
 max_tokens: request.config?.maxOutputTokens,
 top_p: request.config?.topP,
};`,
 },
 {
 phase: 'api_call',
 title: 'API 调用',
 description: '发送请求到 OpenAI 兼容端点',
 leftData: `// 请求
POST /v1/chat/completions
Authorization: Bearer sk-xxx
Content-Type: application/json

{
 "model": "gemini-1.5-pro",
 "messages": [...],
 "tools": [...],
 "stream": true
}`,
 rightData: `// SSE 响应流
data: {"id":"...","choices":[{"delta":{"role":"assistant"}}]}

data: {"id":"...","choices":[{"delta":{"content":"好"}}]}

data: {"id":"...","choices":[{"delta":{"content":"的"}}]}

data: {"id":"...","choices":[{"delta":{"tool_calls":[...]}}]}

data: {"id":"...","choices":[{"finish_reason":"tool_calls"}]}

data: {"usage":{"prompt_tokens":150,"completion_tokens":45}}

data: [DONE]`,
 code: `// pipeline.ts:180 - API 调用
const stream = await this.openai.chat.completions.create({
 ...params,
 stream: true
});

// 处理 SSE 流
for await (const chunk of stream) {
 // 每个 chunk 是 ChatCompletionChunk
 const geminiChunk = this.converter.convertChunkToGemini(chunk);
 yield geminiChunk;
}`,
 },
 {
 phase: 'openai_response',
 title: 'OpenAI Chunk 格式',
 description: '接收到的流式响应 chunk',
 leftData: `// ChatCompletionChunk
{
 id: "chatcmpl-xxx",
 object: "chat.completion.chunk",
 created: 1703123456,
 model: "gemini-1.5-pro",
 choices: [{
 index: 0,
 delta: {
 tool_calls: [{
 index: 0,
 id: "call_abc123",
 type: "function",
 function: {
 name: "read_file",
 arguments: "{\\"path\\":"
 }
 }]
 },
 finish_reason: null
 }]
}`,
 rightData: '',
 code: `// converter.ts:612 - convertOpenAIChunkToGemini()
export function convertOpenAIChunkToGemini(
 chunk: ChatCompletionChunk
): GenerateContentResponse {
 const choice = chunk.choices[0];
 if (!choice) {
 return { candidates: [] };
 }

 const parts: Part[] = [];
 const delta = choice.delta;

 // 1. 处理文本内容
 if (delta.content) {
 parts.push({ text: delta.content });
 }

 // 2. 处理工具调用 (使用 StreamingToolCallParser)
 if (delta.tool_calls) {
 for (const tc of delta.tool_calls) {
 const parseResult = this.toolCallParser.addChunk(
 tc.index,
 tc.function?.arguments || '',
 tc.id,
 tc.function?.name
 );

 if (parseResult.complete) {
 parts.push({
 functionCall: {
 id: tc.id,
 name: parseResult.name,
 args: parseResult.value
 }
 });
 }
 }
 }

 // 3. 构建 Gemini 格式响应
 return {
 candidates: [{
 content: { parts, role: 'model' },
 finishReason: mapFinishReason(choice.finish_reason),
 index: 0
 }],
 usageMetadata: chunk.usage ? {
 promptTokenCount: chunk.usage.prompt_tokens,
 candidatesTokenCount: chunk.usage.completion_tokens,
 totalTokenCount: chunk.usage.total_tokens
 } : undefined
 };
}`,
 },
 {
 phase: 'convert_response',
 title: '响应格式转换',
 description: 'OpenAI chunk → Gemini GenerateContentResponse',
 leftData: `// OpenAI finish chunk
{
 choices: [{
 delta: {},
 finish_reason: "tool_calls"
 }],
 usage: {
 prompt_tokens: 150,
 completion_tokens: 45,
 total_tokens: 195
 }
}`,
 rightData: `// Gemini GenerateContentResponse
{
 candidates: [{
 content: {
 parts: [{
 functionCall: {
 id: "call_abc123",
 name: "read_file",
 args: { file_path: "/package.json" }
 }
 }],
 role: "model"
 },
 finishReason: "TOOL_USE",
 index: 0
 }],
 usageMetadata: {
 promptTokenCount: 150,
 candidatesTokenCount: 45,
 totalTokenCount: 195
 }
}`,
 code: `// converter.ts:680 - finishReason 映射
function mapOpenAIFinishReasonToGemini(
 reason: string | null
): FinishReason | undefined {
 switch (reason) {
 case 'stop':
 return 'STOP';
 case 'tool_calls':
 case 'function_call':
 return 'TOOL_USE';
 case 'length':
 return 'MAX_TOKENS';
 case 'content_filter':
 return 'SAFETY';
 default:
 return undefined;
 }
}

// Token 使用映射
function mapUsageMetadata(usage: OpenAI.CompletionUsage) {
 return {
 promptTokenCount: usage.prompt_tokens,
 candidatesTokenCount: usage.completion_tokens,
 totalTokenCount: usage.total_tokens,
 // 某些 API 提供缓存信息
 cachedContentTokenCount: usage.cached_tokens
 };
}`,
 },
 {
 phase: 'gemini_output',
 title: 'Gemini 格式输出',
 description: '转换完成，返回给上层调用者',
 leftData: '',
 rightData: `// 最终 GenerateContentResponse
{
 candidates: [{
 content: {
 parts: [
 { text: "好的，让我读取这个文件。" },
 {
 functionCall: {
 id: "call_abc123",
 name: "read_file",
 args: { file_path: "/package.json" }
 }
 }
 ],
 role: "model"
 },
 finishReason: "TOOL_USE",
 index: 0,
 safetyRatings: []
 }],
 usageMetadata: {
 promptTokenCount: 150,
 candidatesTokenCount: 45,
 totalTokenCount: 195
 }
}`,
 code: `// 上层使用转换后的响应
// geminiChat.ts - sendMessageStream()

for await (const response of contentGenerator.stream()) {
 // response 是 Gemini 格式
 // 上层代码无需知道底层是 OpenAI API

 if (response.candidates?.[0]?.content?.parts) {
 for (const part of response.candidates[0].content.parts) {
 if (part.text) {
 yield { type: 'content', data: part.text };
 }
 if (part.functionCall) {
 yield { type: 'tool_call', data: part.functionCall };
 }
 }
 }
}

// 优点:
// 1. 上层代码与底层 API 解耦
// 2. 可以透明切换 Gemini/OpenAI/其他 API
// 3. 统一的事件处理逻辑`,
 },
];

// 数据格式可视化
function FormatPanel({
 title,
 data,
 color,
 isActive,
}: {
 title: string;
 data: string;
 color: string;
 isActive: boolean;
}) {
 if (!data) return null;

 return (
 <div
 className={`bg-base rounded-lg border transition-all duration-300 ${
 isActive
 ? `border-[${color}] shadow-[0_0_15px_${color}40]`
 : ' border-edge opacity-60'
 }`}
 style={isActive ? { borderColor: color, boxShadow: `0 0 15px ${color}40` } : {}}
 >
 <div
 className="px-3 py-2 border- border-edge flex items-center gap-2"
 style={{ borderBottomColor: isActive ? color : undefined }}
 >
 <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
 <span className="text-xs font-mono font-bold" style={{ color }}>
 {title}
 </span>
 </div>
 <div className="p-3 max-h-[250px] overflow-auto">
 <pre className="text-xs font-mono text-body whitespace-pre-wrap">
 {data}
 </pre>
 </div>
 </div>
 );
}

export function FormatConverterAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);

 const step = conversionSteps[currentStep];

 useEffect(() => {
 if (!isPlaying) return;
 if (currentStep >= conversionSteps.length - 1) {
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 setCurrentStep((s) => s + 1);
 }, 3000);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep]);

 const play = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(true);
 }, []);

 const stepForward = useCallback(() => {
 if (currentStep < conversionSteps.length - 1) {
 setCurrentStep((s) => s + 1);
 } else {
 setCurrentStep(0);
 }
 }, [currentStep]);

 const reset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 }, []);

 // 判断当前阶段是 Gemini 还是 OpenAI 侧
 const isGeminiPhase = ['gemini_input', 'gemini_output'].includes(step.phase);
 const isOpenAIPhase = ['openai_output', 'api_call', 'openai_response'].includes(step.phase);

 return (
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">🔄</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 消息格式转换管道
 </h2>
 </div>

 <HighlightBox title="🧭 fork-only 提示" variant="yellow">
 <p className="m-0 text-sm text-body">
 上游 Gemini CLI 的主线不会进行 "Gemini SDK ↔ OpenAI API" 的双向转换；它直接调用 <code>@google/genai</code>。
 本动画用于解释当 fork 通过 OpenAI 兼容协议接入其他模型时，转换管道是如何工作的。
 </p>
 </HighlightBox>

 <p className="text-sm text-dim font-mono mb-6">
 // Gemini SDK 格式 ↔ OpenAI API 格式的双向转换
 <br />
 // 源码位置: packages/core/src/core/openaiContentGenerator/converter.ts
 </p>

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56, 189, 248, 0.25)] transition-all cursor-pointer"
 >
 ▶ 播放转换流程
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一步
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Flow indicator */}
 <div className="mb-6 p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center justify-center gap-4 text-sm font-mono">
 <div
 className={`px-4 py-2 rounded-lg transition-all ${
 isGeminiPhase
 ? ' bg-elevated/20 border border-edge text-heading'
 : ' bg-elevated text-dim'
 }`}
 >
 Gemini Format
 </div>
 <span className="text-heading">→</span>
 <div
 className={`px-4 py-2 rounded-lg transition-all ${
 !isGeminiPhase && !isOpenAIPhase
 ? 'bg-elevated border-l-2 border-l-edge-hover text-heading'
 : ' bg-elevated text-dim'
 }`}
 >
 Converter
 </div>
 <span className="text-heading">→</span>
 <div
 className={`px-4 py-2 rounded-lg transition-all ${
 isOpenAIPhase
 ? ' bg-elevated/20 border border-edge text-heading'
 : ' bg-elevated text-dim'
 }`}
 >
 OpenAI Format
 </div>
 </div>
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 {/* Left panel - Gemini / Input */}
 <FormatPanel
 title="输入 / Gemini 格式"
 data={step.leftData}
 color="var(--color-primary)"
 isActive={!!step.leftData}
 />

 {/* Right panel - OpenAI / Output */}
 <FormatPanel
 title="输出 / OpenAI 格式"
 data={step.rightData}
 color="var(--color-primary)"
 isActive={!!step.rightData}
 />
 </div>

 {/* Code panel */}
 <div className="bg-base rounded-xl border border-edge overflow-hidden mb-6">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">{step.title}</span>
 </div>
 <div className="p-4 max-h-[300px] overflow-y-auto">
 <JsonBlock code={step.code} />
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 步骤：<span className="text-heading font-bold">{currentStep + 1}</span>/{conversionSteps.length}
 </span>
 {isPlaying && (
 <span className="text-heading font-mono text-sm animate-pulse">● 转换中</span>
 )}
 </div>
 <div className="font-mono text-sm text-heading pl-6">
 {step.description}
 </div>
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentStep + 1) / conversionSteps.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Key mappings */}
 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-2">消息角色映射</div>
 <div className="space-y-1 text-xs font-mono text-dim">
 <div>user → user</div>
 <div>model → assistant</div>
 <div>functionResponse → tool</div>
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-2">内容类型映射</div>
 <div className="space-y-1 text-xs font-mono text-dim">
 <div>parts[].text → content</div>
 <div>functionCall → tool_calls[]</div>
 <div>inlineData → image_url</div>
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-2">finishReason 映射</div>
 <div className="space-y-1 text-xs font-mono text-dim">
 <div>stop → STOP</div>
 <div>tool_calls → TOOL_USE</div>
 <div>length → MAX_TOKENS</div>
 </div>
 </div>
 </div>
 </div>
 );
}
