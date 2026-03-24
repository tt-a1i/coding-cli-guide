import { useState, useCallback } from 'react';
import { HighlightBox } from '../components/HighlightBox';

/**
 * Multi-Provider Content Pipeline 动画
 *
 * 可视化 OpenAI/Gemini 多厂商内容生成管道：
 * 1. ContentGenerator 接口抽象
 * 2. AuthType 鉴权类型分发
 * 3. Gemini ↔ OpenAI 格式转换
 * 4. 流式响应处理与 Chunk 合并
 * 5. Provider 特定增强 (DashScope, DeepSeek, OpenRouter)
 *
 * 源码位置:
 * - packages/core/src/core/contentGenerator.ts
 * - packages/core/src/core/openaiContentGenerator/pipeline.ts
 * - packages/core/src/core/openaiContentGenerator/converter.ts
 */

interface Message {
 role: 'system' | 'user' | 'assistant' | 'tool';
 content: string;
 tool_calls?: { id: string; name: string; arguments: string }[];
 tool_call_id?: string;
}

interface GeminiContent {
 role: 'user' | 'model';
 parts: { text?: string; functionCall?: { name: string; args: object }; functionResponse?: { id: string; response: object } }[];
}

interface StreamChunk {
 id: number;
 type: 'delta' | 'tool_call' | 'finish' | 'usage';
 content?: string;
 toolIndex?: number;
 toolId?: string;
 toolName?: string;
 toolArgs?: string;
 finishReason?: string;
 usage?: { prompt: number; completion: number; total: number };
}

type Phase =
 | 'idle'
 | 'auth_type_check'
 | 'provider_select'
 | 'build_client'
 | 'gemini_to_openai'
 | 'add_system_instruction'
 | 'process_contents'
 | 'clean_orphans'
 | 'merge_messages'
 | 'add_tools'
 | 'provider_enhance'
 | 'send_request'
 | 'receive_stream'
 | 'parse_chunk'
 | 'accumulate_tool_call'
 | 'convert_to_gemini'
 | 'handle_chunk_merge'
 | 'yield_response'
 | 'complete';

type AuthType = 'google-oauth' | 'openai' | 'gemini-api-key' | 'vertex-ai';
type Provider = 'dashscope' | 'deepseek' | 'openrouter' | 'default';

export default function MultiProviderPipelineAnimation() {
 const [phase, setPhase] = useState<Phase>('idle');
 const [authType, setAuthType] = useState<AuthType>('google-oauth');
 const [provider, setProvider] = useState<Provider>('dashscope');
 const [isRunning, setIsRunning] = useState(false);
 const [logs, setLogs] = useState<string[]>([]);

 // Gemini 格式输入
 const [geminiRequest] = useState<{
 systemInstruction: string;
 contents: GeminiContent[];
 tools: { name: string; description: string }[];
 }>({
 systemInstruction: 'You are a helpful coding assistant.',
 contents: [
 { role: 'user', parts: [{ text: '请帮我读取 app.ts 文件' }] },
 { role: 'model', parts: [{ functionCall: { name: 'read_file', args: { file_path: 'app.ts' } } }] },
 { role: 'user', parts: [{ functionResponse: { id: 'call_1', response: { output: 'export const app = {}' } } }] },
 { role: 'model', parts: [{ text: '文件内容是一个空对象导出' }] },
 { role: 'user', parts: [{ text: '现在请分析这段代码' }] },
 ],
 tools: [
 { name: 'read_file', description: 'Read file contents' },
 { name: 'write_file', description: 'Write file contents' },
 ],
 });

 // OpenAI 格式消息
 const [openaiMessages, setOpenaiMessages] = useState<Message[]>([]);
 const [openaiTools, setOpenaiTools] = useState<{ type: string; function: { name: string; description: string } }[]>([]);

 // 流式处理状态
 const [streamChunks, setStreamChunks] = useState<StreamChunk[]>([]);
 const [currentChunkIdx, setCurrentChunkIdx] = useState(-1);
 const [toolCallBuffers, setToolCallBuffers] = useState<Map<number, { id: string; name: string; args: string }>>(new Map());
 const [pendingFinishResponse, setPendingFinishResponse] = useState<object | null>(null);
 const [geminiResponses, setGeminiResponses] = useState<object[]>([]);

 const addLog = (message: string) => {
 setLogs(prev => [...prev.slice(-14), `[${new Date().toLocaleTimeString()}] ${message}`]);
 };

 // 生成模拟流式响应
 const generateStreamChunks = (): StreamChunk[] => {
 const chunks: StreamChunk[] = [];
 let id = 0;

 // 文本内容片段
 const textParts = [
 '我来分析',
 '这段代码。',
 '\n\n这是一个简单的',
 'ES模块导出，',
 '创建了空对象。',
 ];

 for (const part of textParts) {
 chunks.push({ id: id++, type: 'delta', content: part });
 }

 // 工具调用片段 (模拟流式 JSON)
 chunks.push({ id: id++, type: 'tool_call', toolIndex: 0, toolId: 'call_abc123', toolName: 'read_file', toolArgs: '' });
 chunks.push({ id: id++, type: 'tool_call', toolIndex: 0, toolArgs: '{"file' });
 chunks.push({ id: id++, type: 'tool_call', toolIndex: 0, toolArgs: '_path":' });
 chunks.push({ id: id++, type: 'tool_call', toolIndex: 0, toolArgs: '"src/util' });
 chunks.push({ id: id++, type: 'tool_call', toolIndex: 0, toolArgs: 's.ts"}' });

 // 完成信号
 chunks.push({ id: id++, type: 'finish', finishReason: 'stop' });

 // 用量信息 (某些 provider 单独发送)
 chunks.push({ id: id++, type: 'usage', usage: { prompt: 256, completion: 89, total: 345 } });

 return chunks;
 };

 // 运行完整流程
 const runPipeline = useCallback(async () => {
 if (isRunning) return;
 setIsRunning(true);
 setOpenaiMessages([]);
 setOpenaiTools([]);
 setStreamChunks([]);
 setCurrentChunkIdx(-1);
 setToolCallBuffers(new Map());
 setPendingFinishResponse(null);
 setGeminiResponses([]);
 setLogs([]);

 // Phase 1: Auth Type Check
 setPhase('auth_type_check');
 addLog(`createContentGenerator(config) - 检查 authType: ${authType}`);
 await new Promise(r => setTimeout(r, 600));

 // Phase 2: Provider Selection
 setPhase('provider_select');
 addLog(`根据 baseUrl/model 选择 Provider: ${provider}`);
 await new Promise(r => setTimeout(r, 500));

 // Phase 3: Build Client
 setPhase('build_client');
 addLog('provider.buildClient() - 创建 OpenAI SDK 实例');
 await new Promise(r => setTimeout(r, 500));

 // Phase 4: Gemini to OpenAI Conversion
 setPhase('gemini_to_openai');
 addLog('converter.convertGeminiRequestToOpenAI(request)');
 await new Promise(r => setTimeout(r, 400));

 // Phase 5: Add System Instruction
 setPhase('add_system_instruction');
 const messages: Message[] = [];
 if (geminiRequest.systemInstruction) {
 messages.push({ role: 'system', content: geminiRequest.systemInstruction });
 addLog('添加 system 消息从 systemInstruction');
 }
 setOpenaiMessages([...messages]);
 await new Promise(r => setTimeout(r, 400));

 // Phase 6: Process Contents
 setPhase('process_contents');
 for (const content of geminiRequest.contents) {
 if (content.role === 'user') {
 const textParts = content.parts.filter(p => p.text).map(p => p.text!);
 const funcResponses = content.parts.filter(p => p.functionResponse);

 if (funcResponses.length > 0) {
 for (const fr of funcResponses) {
 messages.push({
 role: 'tool',
 content: JSON.stringify(fr.functionResponse?.response),
 tool_call_id: fr.functionResponse?.id,
 });
 }
 } else if (textParts.length > 0) {
 messages.push({ role: 'user', content: textParts.join('') });
 }
 } else if (content.role === 'model') {
 const textParts = content.parts.filter(p => p.text).map(p => p.text!);
 const funcCalls = content.parts.filter(p => p.functionCall);

 if (funcCalls.length > 0) {
 messages.push({
 role: 'assistant',
 content: textParts.join('') || '',
 tool_calls: funcCalls.map((fc, idx) => ({
 id: `call_${idx}`,
 name: fc.functionCall!.name,
 arguments: JSON.stringify(fc.functionCall!.args),
 })),
 });
 } else {
 messages.push({ role: 'assistant', content: textParts.join('') });
 }
 }
 }
 addLog(`处理 ${geminiRequest.contents.length} 条 Gemini Content → ${messages.length} 条 OpenAI Message`);
 setOpenaiMessages([...messages]);
 await new Promise(r => setTimeout(r, 600));

 // Phase 7: Clean Orphaned Tool Calls
 setPhase('clean_orphans');
 addLog('cleanOrphanedToolCalls() - 移除无响应的工具调用');
 await new Promise(r => setTimeout(r, 400));

 // Phase 8: Merge Consecutive Messages
 setPhase('merge_messages');
 addLog('mergeConsecutiveAssistantMessages() - 合并连续 assistant 消息');
 await new Promise(r => setTimeout(r, 400));

 // Phase 9: Add Tools
 setPhase('add_tools');
 const tools = geminiRequest.tools.map(t => ({
 type: 'function',
 function: { name: t.name, description: t.description },
 }));
 setOpenaiTools(tools);
 addLog(`convertGeminiToolsToOpenAI() - 转换 ${tools.length} 个工具`);
 await new Promise(r => setTimeout(r, 400));

 // Phase 10: Provider Enhance
 setPhase('provider_enhance');
 addLog(`provider.buildRequest() - ${provider} 特定增强 (metadata, cache)`);
 await new Promise(r => setTimeout(r, 500));

 // Phase 11: Send Request
 setPhase('send_request');
 addLog('client.chat.completions.create({ stream: true })');
 await new Promise(r => setTimeout(r, 600));

 // Generate stream chunks
 const chunks = generateStreamChunks();
 setStreamChunks(chunks);

 // Phase 12-17: Process Stream
 const toolBuffers = new Map<number, { id: string; name: string; args: string }>();
 let pendingFinish: object | null = null;
 const responses: object[] = [];

 for (let i = 0; i < chunks.length; i++) {
 const chunk = chunks[i];
 setCurrentChunkIdx(i);

 if (chunk.type === 'delta') {
 setPhase('receive_stream');
 addLog(`收到文本 chunk: "${chunk.content?.slice(0, 15)}..."`);
 await new Promise(r => setTimeout(r, 200));

 setPhase('convert_to_gemini');
 const geminiResponse = {
 candidates: [{ content: { parts: [{ text: chunk.content }], role: 'model' } }],
 };
 responses.push(geminiResponse);
 setGeminiResponses([...responses]);
 addLog('convertOpenAIChunkToGemini() → 生成 Gemini Response');
 await new Promise(r => setTimeout(r, 150));

 setPhase('yield_response');
 addLog('yield response');
 await new Promise(r => setTimeout(r, 100));
 } else if (chunk.type === 'tool_call') {
 setPhase('parse_chunk');
 addLog(`收到 tool_call chunk - index: ${chunk.toolIndex}`);
 await new Promise(r => setTimeout(r, 200));

 setPhase('accumulate_tool_call');
 const idx = chunk.toolIndex || 0;
 if (!toolBuffers.has(idx)) {
 toolBuffers.set(idx, { id: chunk.toolId || '', name: chunk.toolName || '', args: '' });
 }
 const buffer = toolBuffers.get(idx)!;
 if (chunk.toolId) buffer.id = chunk.toolId;
 if (chunk.toolName) buffer.name = chunk.toolName;
 if (chunk.toolArgs) buffer.args += chunk.toolArgs;
 setToolCallBuffers(new Map(toolBuffers));
 addLog(`StreamingToolCallParser.addChunk() - buffer: "${buffer.args.slice(-20)}"`);
 await new Promise(r => setTimeout(r, 150));
 } else if (chunk.type === 'finish') {
 setPhase('handle_chunk_merge');
 addLog(`收到 finishReason: ${chunk.finishReason} - 准备合并`);
 pendingFinish = {
 candidates: [{
 content: { parts: [], role: 'model' },
 finishReason: 'STOP',
 }],
 };
 setPendingFinishResponse(pendingFinish);
 await new Promise(r => setTimeout(r, 300));

 // Emit completed tool calls
 for (const [_idx, buffer] of toolBuffers) {
 const geminiResponse = {
 candidates: [{
 content: {
 parts: [{ functionCall: { id: buffer.id, name: buffer.name, args: JSON.parse(buffer.args || '{}') } }],
 role: 'model',
 },
 finishReason: 'STOP',
 }],
 };
 responses.push(geminiResponse);
 addLog(`getCompletedToolCalls() → 发出工具调用: ${buffer.name}`);
 }
 setGeminiResponses([...responses]);
 await new Promise(r => setTimeout(r, 200));
 } else if (chunk.type === 'usage') {
 setPhase('handle_chunk_merge');
 addLog(`收到 usage metadata - 合并到 pendingFinishResponse`);
 if (pendingFinish) {
 (pendingFinish as Record<string, unknown>).usageMetadata = {
 promptTokenCount: chunk.usage?.prompt,
 candidatesTokenCount: chunk.usage?.completion,
 totalTokenCount: chunk.usage?.total,
 };
 setPendingFinishResponse({ ...pendingFinish });
 }
 await new Promise(r => setTimeout(r, 200));

 setPhase('yield_response');
 addLog('yield mergedResponse (finishReason + usageMetadata)');
 responses.push(pendingFinish!);
 setGeminiResponses([...responses]);
 await new Promise(r => setTimeout(r, 150));
 }
 }

 // Complete
 setPhase('complete');
 addLog('✅ 流处理完成 - 所有 Gemini Response 已发出');
 await new Promise(r => setTimeout(r, 500));

 setIsRunning(false);
 }, [isRunning, authType, provider, geminiRequest]);

 // Reset function
 const reset = () => {
 setPhase('idle');
 setIsRunning(false);
 setOpenaiMessages([]);
 setOpenaiTools([]);
 setStreamChunks([]);
 setCurrentChunkIdx(-1);
 setToolCallBuffers(new Map());
 setPendingFinishResponse(null);
 setGeminiResponses([]);
 setLogs([]);
 };

 // Auth type descriptions
 const authTypeInfo: Record<AuthType, { label: string; description: string; color: string }> = {
 'google-oauth': { label: 'Google OAuth', description: '通义千问 OAuth 认证', color: 'text-heading' },
 'openai': { label: 'OpenAI API', description: 'OpenAI 兼容 API', color: 'text-heading' },
 'gemini-api-key': { label: 'Gemini API', description: 'Google Gemini API', color: 'text-heading' },
 'vertex-ai': { label: 'Vertex AI', description: 'Google Cloud Vertex', color: 'text-heading' },
 };

 const providerInfo: Record<Provider, { label: string; features: string[]; color: string }> = {
 'dashscope': { label: 'DashScope', features: ['Cache Control', 'Metadata'], color: 'text-heading' },
 'deepseek': { label: 'DeepSeek', features: ['Reasoning Tokens', 'FIM'], color: 'text-heading' },
 'openrouter': { label: 'OpenRouter', features: ['Multi-Model', 'Fallback'], color: 'text-heading' },
 'default': { label: 'Default', features: ['Standard OpenAI'], color: 'text-body' },
 };

 const phaseInfo: Record<Phase, { label: string; description: string }> = {
 'idle': { label: '空闲', description: '等待启动' },
 'auth_type_check': { label: '鉴权检查', description: '检查 authType 决定生成器类型' },
 'provider_select': { label: 'Provider 选择', description: '根据配置选择 OpenAI 兼容 Provider' },
 'build_client': { label: '构建客户端', description: 'Provider.buildClient() 创建 SDK 实例' },
 'gemini_to_openai': { label: '格式转换开始', description: '开始 Gemini → OpenAI 转换' },
 'add_system_instruction': { label: '系统指令', description: '提取 systemInstruction 为 system 消息' },
 'process_contents': { label: '处理内容', description: '转换 Gemini Content 为 OpenAI Message' },
 'clean_orphans': { label: '清理孤儿', description: '移除无响应的工具调用' },
 'merge_messages': { label: '合并消息', description: '合并连续的 assistant 消息' },
 'add_tools': { label: '添加工具', description: '转换工具定义为 OpenAI 格式' },
 'provider_enhance': { label: 'Provider 增强', description: 'Provider 特定请求增强' },
 'send_request': { label: '发送请求', description: '调用 OpenAI API' },
 'receive_stream': { label: '接收流', description: '接收 OpenAI 流式响应' },
 'parse_chunk': { label: '解析 Chunk', description: '解析 OpenAI Chunk' },
 'accumulate_tool_call': { label: '累积工具调用', description: 'StreamingToolCallParser 累积 JSON 片段' },
 'convert_to_gemini': { label: '转换为 Gemini', description: 'convertOpenAIChunkToGemini' },
 'handle_chunk_merge': { label: 'Chunk 合并', description: '处理 finishReason 和 usageMetadata 合并' },
 'yield_response': { label: '发出响应', description: 'yield Gemini Response' },
 'complete': { label: '完成', description: '流处理完成' },
 };

 return (
 <div className="space-y-6 p-4">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-heading">Multi-Provider Content Pipeline
 </h2>
 <p className="text-body mt-1">
 可视化 OpenAI/Gemini 多厂商格式转换与流式处理管道
 </p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={runPipeline}
 disabled={isRunning}
 className={`px-4 py-2 rounded-lg font-medium transition-all ${
 isRunning
 ? ' bg-elevated text-dim cursor-not-allowed'
 : ' bg-elevated text-heading hover:brightness-110'
 }`}
 >
 {isRunning ? '运行中...' : '▶ 运行管道'}
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 rounded-lg font-medium bg-elevated text-heading hover:bg-elevated"
 >
 ↺ 重置
 </button>
 </div>
 </div>

 <HighlightBox title="🧭 fork-only 提示" variant="yellow">
 <p className="m-0 text-sm text-body">
 本动画聚焦“多厂商 + OpenAI-compatible 适配 + 格式转换 + tool_calls 流式解析”的兼容层。
 上游 Gemini CLI 的主线不需要这条转换管道；它直接消费 <code>@google/genai</code> 的结构化响应流并在 <code>Turn.run()</code> 中产出事件。
 </p>
 </HighlightBox>

 {/* Configuration Panel */}
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-3">认证类型 (AuthType)</h3>
 <div className="grid grid-cols-2 gap-2">
 {(Object.entries(authTypeInfo) as [AuthType, typeof authTypeInfo[AuthType]][]).map(([type, info]) => (
 <button
 key={type}
 onClick={() => !isRunning && setAuthType(type)}
 className={`p-2 rounded text-left text-sm transition-all ${
 authType === type
 ? ` bg-elevated border-2 border-${info.color.replace('text-', '')}`
 : ' bg-surface border border-edge hover:border-edge-hover'
 } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 <div className={`font-medium ${authType === type ? info.color : 'text-heading'}`}>
 {info.label}
 </div>
 <div className="text-xs text-dim">{info.description}</div>
 </button>
 ))}
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-3">Provider 类型</h3>
 <div className="grid grid-cols-2 gap-2">
 {(Object.entries(providerInfo) as [Provider, typeof providerInfo[Provider]][]).map(([type, info]) => (
 <button
 key={type}
 onClick={() => !isRunning && setProvider(type)}
 className={`p-2 rounded text-left text-sm transition-all ${
 provider === type
 ? ' bg-elevated border-2 border-edge'
 : ' bg-surface border border-edge hover:border-edge-hover'
 } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 <div className={`font-medium ${provider === type ? info.color : 'text-heading'}`}>
 {info.label}
 </div>
 <div className="text-xs text-dim">{info.features.join(', ')}</div>
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Current Phase Display */}
 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full ${phase === 'idle' ? ' bg-elevated' : phase === 'complete' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)] animate-pulse'}`} />
 <div>
 <span className="text-heading font-mono font-bold">
 {phaseInfo[phase].label}
 </span>
 <span className="text-body ml-3">{phaseInfo[phase].description}</span>
 </div>
 </div>
 </div>

 {/* Main Visualization */}
 <div className="grid grid-cols-3 gap-4">
 {/* Column 1: Gemini Request */}
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-heading mb-3 flex items-center gap-2">
 <span className="text-lg">📥</span> Gemini Request 格式
 </h3>

 {/* System Instruction */}
 <div className="mb-3">
 <div className="text-xs text-dim mb-1">systemInstruction:</div>
 <div className="bg-base rounded p-2 text-xs font-mono text-heading truncate">
 {geminiRequest.systemInstruction}
 </div>
 </div>

 {/* Contents */}
 <div className="mb-3">
 <div className="text-xs text-dim mb-1">contents ({geminiRequest.contents.length}):</div>
 <div className="space-y-1 max-h-48 overflow-y-auto">
 {geminiRequest.contents.map((content, idx) => (
 <div
 key={idx}
 className={`bg-base rounded p-2 text-xs ${
 phase === 'process_contents' ? 'ring-1 ring-[var(--color-warning)]/40' : ''
 }`}
 >
 <span className={`font-medium ${content.role === 'user' ? 'text-heading' : 'text-heading'}`}>
 {content.role}:
 </span>
 <span className="text-body ml-2">
 {content.parts[0].text?.slice(0, 30) ||
 (content.parts[0].functionCall ? `📞 ${content.parts[0].functionCall.name}` : '') ||
 (content.parts[0].functionResponse ? `📋 response` : '')}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Tools */}
 <div>
 <div className="text-xs text-dim mb-1">tools ({geminiRequest.tools.length}):</div>
 <div className="flex flex-wrap gap-1">
 {geminiRequest.tools.map((tool, idx) => (
 <span
 key={idx}
 className={`px-2 py-0.5 bg-base rounded text-xs text-heading ${
 phase === 'add_tools' ? 'ring-1 ring-[var(--color-warning)]/40' : ''
 }`}
 >
 {tool.name}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Column 2: Conversion Pipeline */}
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-heading mb-3 flex items-center gap-2">
 <span className="text-lg">⚙️</span> 转换管道
 </h3>

 {/* OpenAI Messages */}
 <div className="mb-3">
 <div className="text-xs text-dim mb-1 flex items-center justify-between">
 <span>OpenAI Messages ({openaiMessages.length}):</span>
 {phase === 'clean_orphans' && <span className="text-heading">清理中</span>}
 {phase === 'merge_messages' && <span className="text-heading">合并中</span>}
 </div>
 <div className="space-y-1 max-h-36 overflow-y-auto">
 {openaiMessages.map((msg, idx) => (
 <div key={idx} className="bg-base rounded p-2 text-xs">
 <span className={`font-medium ${
 msg.role === 'system' ? 'text-heading' :
 msg.role === 'user' ? 'text-heading' :
 msg.role === 'assistant' ? 'text-heading' :
 'text-heading'
 }`}>
 {msg.role}
 </span>
 {msg.tool_calls && (
 <span className="text-heading ml-1">+{msg.tool_calls.length}🔧</span>
 )}
 {msg.tool_call_id && (
 <span className="text-heading ml-1">📋</span>
 )}
 <div className="text-dim truncate mt-0.5">
 {msg.content?.slice(0, 40) || (msg.tool_calls ? `调用: ${msg.tool_calls[0]?.name}` : '')}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* OpenAI Tools */}
 {openaiTools.length > 0 && (
 <div className="mb-3">
 <div className="text-xs text-dim mb-1">OpenAI Tools:</div>
 <div className="flex flex-wrap gap-1">
 {openaiTools.map((tool, idx) => (
 <span key={idx} className="px-2 py-0.5 bg-base rounded text-xs text-heading">
 {tool.function.name}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Tool Call Buffers */}
 {toolCallBuffers.size > 0 && (
 <div className="mb-3">
 <div className="text-xs text-dim mb-1">Tool Call Buffers:</div>
 <div className="space-y-1">
 {Array.from(toolCallBuffers.entries()).map(([idx, buffer]) => (
 <div key={idx} className="bg-base rounded p-2 text-xs">
 <div className="flex justify-between">
 <span className="text-heading">[{idx}] {buffer.name}</span>
 <span className="text-dim">{buffer.id}</span>
 </div>
 <div className="font-mono text-body mt-1 truncate">
 args: {buffer.args || '""'}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Pending Finish Response */}
 {pendingFinishResponse && (
 <div className="bg-elevated rounded p-2 border-l-2 border-l-edge-hover/30">
 <div className="text-xs text-heading font-medium">⏳ Pending Finish Response</div>
 <div className="text-xs text-body mt-1">
 等待 usageMetadata 合并...
 </div>
 </div>
 )}
 </div>

 {/* Column 3: Gemini Response */}
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <h3 className="text-sm font-medium text-heading mb-3 flex items-center gap-2">
 <span className="text-lg">📤</span> Gemini Response 输出
 </h3>

 {/* Stream Chunks Progress */}
 {streamChunks.length > 0 && (
 <div className="mb-3">
 <div className="text-xs text-dim mb-1">
 流式 Chunks ({currentChunkIdx + 1}/{streamChunks.length}):
 </div>
 <div className="flex flex-wrap gap-1">
 {streamChunks.map((chunk, idx) => (
 <div
 key={idx}
 className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
 idx < currentChunkIdx
 ? 'bg-[var(--color-success)] text-heading'
 : idx === currentChunkIdx
 ? 'bg-[var(--color-warning)] text-heading animate-pulse'
 : ' bg-elevated text-dim'
 }`}
 title={`${chunk.type}: ${chunk.content?.slice(0, 20) || chunk.toolName || chunk.finishReason || 'usage'}`}
 >
 {chunk.type === 'delta' ? '📝' :
 chunk.type === 'tool_call' ? '🔧' :
 chunk.type === 'finish' ? '🏁' : '📊'}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Gemini Responses */}
 <div>
 <div className="text-xs text-dim mb-1">
 已生成 Responses ({geminiResponses.length}):
 </div>
 <div className="space-y-1 max-h-48 overflow-y-auto">
 {geminiResponses.map((response, idx) => {
 const resp = response as Record<string, unknown>;
 const candidates = resp.candidates as { content: { parts: { text?: string; functionCall?: { name: string } }[] }; finishReason?: string }[] | undefined;
 const candidate = candidates?.[0];
 const parts = candidate?.content?.parts || [];
 const hasText = parts.some((p: { text?: string }) => p.text);
 const hasFuncCall = parts.some((p: { functionCall?: unknown }) => p.functionCall);
 const hasFinish = candidate?.finishReason;
 const hasUsage = Boolean(resp.usageMetadata);

 return (
 <div
 key={idx}
 className={`bg-base rounded p-2 text-xs ${
 idx === geminiResponses.length - 1 && phase === 'yield_response'
 ? 'ring-1 ring-[var(--color-success)]/40'
 : ''
 }`}
 >
 <div className="flex items-center gap-2">
 <span className="text-dim">#{idx + 1}</span>
 {hasText && <span className="text-heading">text</span>}
 {hasFuncCall && <span className="text-heading">functionCall</span>}
 {hasFinish && <span className="text-heading">{hasFinish ? 'STOP' : ''}</span>}
 {hasUsage && <span className="text-heading">usage</span>}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {/* Pipeline Architecture Diagram */}
 <div className="bg-surface/30 rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-3">管道架构图</h3>
 <div className="flex items-center justify-between text-xs overflow-x-auto pb-2">
 {[
 { id: 'auth_type_check', label: 'AuthType', icon: '🔐' },
 { id: 'provider_select', label: 'Provider', icon: '🏭' },
 { id: 'build_client', label: 'Client', icon: '🔌' },
 { id: 'gemini_to_openai', label: 'G→O 转换', icon: '🔄' },
 { id: 'send_request', label: 'API Call', icon: '📡' },
 { id: 'receive_stream', label: 'Stream', icon: '📥' },
 { id: 'convert_to_gemini', label: 'O→G 转换', icon: '🔄' },
 { id: 'yield_response', label: 'Yield', icon: '📤' },
 ].map((step, idx, arr) => (
 <div key={step.id} className="flex items-center">
 <div
 className={`flex flex-col items-center p-2 rounded ${
 phase === step.id
 ? ' bg-elevated/20 border border-edge'
 : phase === 'complete' || arr.findIndex(s => s.id === phase) > idx
 ? 'bg-elevated border-l-2 border-l-edge-hover/60'
 : ' bg-surface border border-edge'
 }`}
 >
 <span className="text-lg">{step.icon}</span>
 <span className={`mt-1 ${phase === step.id ? 'text-heading' : 'text-body'}`}>
 {step.label}
 </span>
 </div>
 {idx < arr.length - 1 && (
 <div className={`mx-2 text-lg ${
 arr.findIndex(s => s.id === phase) > idx ? 'text-heading' : 'text-dim'
 }`}>
 →
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Logs */}
 <div className="bg-base rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-2 flex items-center gap-2">
 执行日志
 </h3>
 <div className="font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
 {logs.length === 0 ? (
 <div className="text-dim italic">等待执行...</div>
 ) : (
 logs.map((log, idx) => (
 <div
 key={idx}
 className={`${
 log.includes('✅') ? 'text-heading' :
 log.includes('❌') ? 'text-heading' :
 log.includes('→') ? 'text-heading' :
 'text-body'
 }`}
 >
 {log}
 </div>
 ))
 )}
 </div>
 </div>

 {/* Technical Details */}
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-surface/30 rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-3">关键转换逻辑</h3>
 <div className="text-xs space-y-2">
 <div className="bg-base rounded p-2">
 <div className="text-heading font-medium">Gemini Content → OpenAI Message</div>
 <ul className="text-body mt-1 list-disc list-inside space-y-0.5">
 <li><code className="text-heading">role: 'model'</code> → <code className="text-heading">role: 'assistant'</code></li>
 <li><code className="text-heading">functionCall</code> → <code className="text-heading">tool_calls[]</code></li>
 <li><code className="text-heading">functionResponse</code> → <code className="text-heading">role: 'tool'</code></li>
 <li><code className="text-heading">inlineData</code> → <code className="text-heading">image_url</code></li>
 </ul>
 </div>
 <div className="bg-base rounded p-2">
 <div className="text-heading font-medium">FinishReason 映射</div>
 <ul className="text-body mt-1 list-disc list-inside space-y-0.5">
 <li><code className="text-heading">'stop'</code> → <code className="text-heading">STOP</code></li>
 <li><code className="text-heading">'length'</code> → <code className="text-heading">MAX_TOKENS</code></li>
 <li><code className="text-heading">'content_filter'</code> → <code className="text-heading">SAFETY</code></li>
 <li><code className="text-heading">'tool_calls'</code> → <code className="text-heading">STOP</code></li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-surface/30 rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-3">Provider 特性</h3>
 <div className="text-xs space-y-2">
 <div className="bg-base rounded p-2">
 <div className="text-heading font-medium">DashScope (通义千问)</div>
 <ul className="text-body mt-1 list-disc list-inside">
 <li>x-dashscope-request-id 追踪</li>
 <li>Cache Control 头部</li>
 <li>result_format: message</li>
 </ul>
 </div>
 <div className="bg-base rounded p-2">
 <div className="text-heading font-medium">DeepSeek</div>
 <ul className="text-body mt-1 list-disc list-inside">
 <li>Reasoning Tokens 支持</li>
 <li>FIM (Fill-in-Middle) 模式</li>
 </ul>
 </div>
 <div className="bg-base rounded p-2">
 <div className="text-heading font-medium">OpenRouter</div>
 <ul className="text-body mt-1 list-disc list-inside">
 <li>多模型路由</li>
 <li>自动 Fallback</li>
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Source Code Reference */}
 <div className="bg-surface/20 rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-medium text-body mb-2">源码位置</h3>
 <div className="grid grid-cols-3 gap-2 text-xs">
 <div className="bg-base rounded p-2">
 <div className="text-heading">ContentGenerator 接口</div>
 <div className="text-dim font-mono">packages/core/src/core/contentGenerator.ts</div>
 </div>
 <div className="bg-base rounded p-2">
 <div className="text-heading">Pipeline 实现</div>
 <div className="text-dim font-mono">packages/core/src/core/openaiContentGenerator/pipeline.ts</div>
 </div>
 <div className="bg-base rounded p-2">
 <div className="text-heading">格式转换器</div>
 <div className="text-dim font-mono">packages/core/src/core/openaiContentGenerator/converter.ts</div>
 </div>
 </div>
 </div>
 </div>
 );
}
