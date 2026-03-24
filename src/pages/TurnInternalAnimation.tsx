import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-elevated rounded-lg overflow-hidden border border-edge">
 <button
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
 >
 <span className="text-lg font-semibold text-heading">什么是 Turn 状态流转？</span>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 space-y-4 text-sm">
 {/* 核心概念 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">核心概念</h3>
 <p className="text-body">
 <strong>Turn</strong> 代表一次完整的 AI 响应周期。从收到第一个流式 chunk 开始，
 到收到 Finished（finishReason）结束，中间经历思考提取、内容输出、工具调用检测等多个事件。
 </p>
 </div>

 {/* 为什么需要 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">为什么需要 Turn 状态？</h3>
 <ul className="text-body space-y-1 list-disc list-inside">
 <li><strong>状态管理</strong>：追踪一次响应的完整生命周期</li>
 <li><strong>工具调用收集</strong>：积累流式解析出的工具调用</li>
 <li><strong>引用收集</strong>：收集 AI 提及的文件、URL 等</li>
 <li><strong>完成检测</strong>：判断 AI 响应是否真正结束</li>
 </ul>
 </div>

 {/* 事件类型 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">关键事件</h3>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">stream_start</div>
 <div className="text-dim">流式响应开始</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">tool_call_detected</div>
 <div className="text-dim">检测到工具调用</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">content_emitted</div>
 <div className="text-dim">输出文本内容</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">turn_complete</div>
 <div className="text-dim">Turn 完成</div>
 </div>
 </div>
 </div>

 {/* 源码位置 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">源码位置</h3>
 <code className="text-xs bg-base p-2 rounded block border border-edge">
 packages/core/src/core/turn.ts
 </code>
 </div>

 {/* 相关机制 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">相关机制</h3>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">流式解析</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">工具调度</span>
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">Continuation</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">主循环</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// Turn 内部事件类型
type TurnEventType =
 | 'stream_start'
 | 'chunk_received'
 | 'thought_extracted'
 | 'content_emitted'
 | 'tool_call_detected'
 | 'tool_call_stored'
 | 'citation_collected'
 | 'finish_reason_set'
 | 'turn_complete';

interface TurnEvent {
 type: TurnEventType;
 data: Record<string, unknown>;
 timestamp: number;
}

// Turn 内部状态
interface TurnState {
 pendingToolCalls: Array<{
 callId: string;
 name: string;
 args: Record<string, unknown>;
 }>;
 pendingCitations: Set<string>;
 finishReason: string | undefined;
 currentResponseId: string | undefined;
 emittedEvents: TurnEvent[];
 modelResponseParts: Array<{ type: string; content: string }>;
}

// 模拟的事件序列
const eventSequence: Array<{
 type: TurnEventType;
 description: string;
 data: Record<string, unknown>;
 stateChange: Partial<TurnState>;
 code: string;
}> = [
 {
 type: 'stream_start',
 description: '开始处理流式响应',
 data: { responseId: 'resp_abc123' },
 stateChange: { currentResponseId: 'resp_abc123' },
 code: `// turn.ts:227 - run() 方法开始
async *run(): AsyncGenerator<GeminiEvent> {
 const streamResponse = this.geminiChat.sendMessageStream(
 this.config,
 this.isContinuation
 );

 // 开始迭代流式响应
 for await (const response of streamResponse) {
 // 处理每个 chunk...
 }
}`,
 },
 {
 type: 'chunk_received',
 description: '接收到第一个 chunk，包含 thought',
 data: {
 candidates: [{
 content: {
 parts: [{ thought: '让我分析一下这个问题...' }],
 role: 'model'
 }
 }]
 },
 stateChange: {},
 code: `// turn.ts:245 - 处理 chunk
for await (const response of streamResponse) {
 // 保存用于调试
 this.debugResponses.push(response);

 const candidate = response.candidates?.[0];
 if (!candidate?.content?.parts) continue;

 // 检查是否有 thought 部分
 const thoughtPart = candidate.content.parts.find(p => p.thought);
 if (thoughtPart) {
 yield { type: GeminiEventType.Thought, data: thoughtPart.thought };
 }
}`,
 },
 {
 type: 'thought_extracted',
 description: 'thought 部分被提取并发出事件',
 data: { thought: '让我分析一下这个问题...' },
 stateChange: {},
 code: `// turn.ts:258 - 发出 Thought 事件
if (thoughtPart?.thought) {
 yield {
 type: GeminiEventType.Thought,
 data: {
 text: thoughtPart.thought,
 timestamp: Date.now()
 }
 };

 // thought 不加入 modelResponseParts
 // 它是内部推理过程，不显示给用户
}`,
 },
 {
 type: 'chunk_received',
 description: '接收到文本内容 chunk',
 data: {
 candidates: [{
 content: {
 parts: [{ text: '我来帮你读取这个文件。' }],
 role: 'model'
 }
 }]
 },
 stateChange: {
 modelResponseParts: [{ type: 'text', content: '我来帮你读取这个文件。' }]
 },
 code: `// turn.ts:270 - 处理文本内容
const textParts = candidate.content.parts.filter(p => p.text);
for (const part of textParts) {
 // 添加到响应部分列表
 this.modelResponseParts.push({
 type: 'text',
 content: part.text
 });

 // 发出 Content 事件
 yield {
 type: GeminiEventType.Content,
 data: { text: part.text }
 };
}`,
 },
 {
 type: 'content_emitted',
 description: '文本内容事件已发出',
 data: { text: '我来帮你读取这个文件。' },
 stateChange: {},
 code: `// GeminiEventType.Content 事件结构
interface ContentEvent {
 type: 'content';
 data: {
 text: string;
 // 流式文本，可能是部分内容
 // UI 层需要累积显示
 };
}

// 在 UI 层 (client.ts) 处理:
case GeminiEventType.Content:
 this.currentContent += event.data.text;
 this.render();
 break;`,
 },
 {
 type: 'chunk_received',
 description: '接收到工具调用 chunk',
 data: {
 candidates: [{
 content: {
 parts: [{
 functionCall: {
 name: 'read_file',
 args: { file_path: '/package.json' }
 }
 }],
 role: 'model'
 }
 }]
 },
 stateChange: {},
 code: `// turn.ts:285 - 检测工具调用
const functionCallParts = candidate.content.parts.filter(
 p => p.functionCall
);

for (const part of functionCallParts) {
 const fc = part.functionCall!;

 // 生成唯一调用 ID
 const callId = this.generateCallId(fc.name);

 // 构建 ToolCallRequestInfo
 const toolCallInfo: ToolCallRequestInfo = {
 callId,
 name: fc.name,
 args: fc.args ?? {},
 isClientInitiated: false,
 prompt_id: this.config.promptId,
 response_id: this.currentResponseId
 };

 // 存入待处理列表
 this.pendingToolCalls.push(toolCallInfo);
}`,
 },
 {
 type: 'tool_call_detected',
 description: '检测到 read_file 工具调用',
 data: { name: 'read_file', args: { file_path: '/package.json' } },
 stateChange: {},
 code: `// turn.ts:305 - 工具调用检测
// 从 functionCall 中提取信息:
const functionCall = {
 name: 'read_file', // 工具名称
 args: { file_path: '/package.json' } // 参数对象
};

// 验证工具是否存在
const tool = this.toolRegistry.get(functionCall.name);
if (!tool) {
 yield {
 type: GeminiEventType.Error,
 data: { message: \`Unknown tool: \${functionCall.name}\` }
 };
 continue;
}`,
 },
 {
 type: 'tool_call_stored',
 description: '工具调用存入 pendingToolCalls',
 data: {
 callId: 'call_001',
 name: 'read_file',
 args: { file_path: '/package.json' }
 },
 stateChange: {
 pendingToolCalls: [{
 callId: 'call_001',
 name: 'read_file',
 args: { file_path: '/package.json' }
 }]
 },
 code: `// turn.ts:318 - 存储并发出事件
this.pendingToolCalls.push(toolCallInfo);

// 发出 ToolCallRequest 事件
yield {
 type: GeminiEventType.ToolCallRequest,
 data: {
 callId: toolCallInfo.callId,
 name: toolCallInfo.name,
 args: toolCallInfo.args,
 // 此时工具尚未执行
 // 等待外部确认后执行
 }
};

// pendingToolCalls 数据结构:
// Array<{
// callId: string, // 唯一 ID
// name: string, // 工具名
// args: object, // 参数
// isClientInitiated: boolean,
// prompt_id: string,
// response_id?: string
// }>`,
 },
 {
 type: 'chunk_received',
 description: '接收到包含 finishReason 的最终 chunk',
 data: {
 candidates: [{
 content: { parts: [], role: 'model' },
 finishReason: 'TOOL_USE'
 }],
 usageMetadata: {
 promptTokenCount: 1250,
 candidatesTokenCount: 85,
 totalTokenCount: 1335
 }
 },
 stateChange: { finishReason: 'TOOL_USE' },
 code: `// turn.ts:335 - 检查 finishReason
const finishReason = candidate.finishReason;

if (finishReason) {
 this.finishReason = finishReason;

 // 记录 token 使用
 if (response.usageMetadata) {
 this.recordTokenUsage(response.usageMetadata);
 }

 // finishReason 类型:
 // - 'STOP': 正常完成
 // - 'TOOL_USE': 需要执行工具
 // - 'MAX_TOKENS': 达到 token 限制
 // - 'SAFETY': 安全过滤
 // - 'RECITATION': 引用检测
}`,
 },
 {
 type: 'finish_reason_set',
 description: 'finishReason 设置为 TOOL_USE',
 data: { finishReason: 'TOOL_USE', tokenUsage: { total: 1335 } },
 stateChange: {},
 code: `// turn.ts:352 - finishReason 处理逻辑
switch (this.finishReason) {
 case 'STOP':
 // 正常结束，无需继续
 break;

 case 'TOOL_USE':
 // 模型请求执行工具
 // pendingToolCalls 中有待处理的调用
 // 外部会执行工具并调用 continuation
 break;

 case 'MAX_TOKENS':
 // 达到输出限制
 // 可能需要提示用户继续
 break;
}`,
 },
 {
 type: 'citation_collected',
 description: '收集引用信息 (如有)',
 data: { citations: ['source1.md', 'source2.ts'] },
 stateChange: { pendingCitations: new Set(['source1.md', 'source2.ts']) },
 code: `// turn.ts:368 - 收集引用
if (candidate.citationMetadata?.citationSources) {
 for (const source of candidate.citationMetadata.citationSources) {
 this.pendingCitations.add(source.uri);
 }
}

// 在 turn 结束时发出引用事件
if (this.pendingCitations.size > 0) {
 yield {
 type: GeminiEventType.Citation,
 data: {
 sources: Array.from(this.pendingCitations)
 }
 };
}`,
 },
 {
 type: 'turn_complete',
 description: 'Turn 执行完成，发出 Finished 事件',
 data: {
 finishReason: 'TOOL_USE',
 pendingToolCalls: 1,
 tokenUsage: 1335
 },
 stateChange: {},
 code: `// turn.ts:385 - Turn 完成
// 发出 Finished 事件
yield {
 type: GeminiEventType.Finished,
 data: {
 finishReason: this.finishReason,
 pendingToolCalls: this.pendingToolCalls.length,
 usageMetadata: this.usageMetadata,
 // Turn 完成但对话可能继续
 // 如果有 pendingToolCalls，外部会:
 // 1. 执行工具
 // 2. 构建 FunctionResponse
 // 3. 发起 continuation turn
 }
};

// Turn 生命周期结束
// 状态保留用于调试和日志`,
 },
];

// 事件流可视化组件
function EventStream({ currentIndex }: { currentIndex: number }) {
 return (
 <div className="bg-base rounded-lg p-4 border border-edge h-full">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📡</span>
 <span className="text-sm font-mono font-bold text-heading">事件流</span>
 </div>
 <div className="space-y-2 max-h-[350px] overflow-y-auto">
 {eventSequence.slice(0, currentIndex + 1).map((event, i) => {
 const isActive = i === currentIndex;
 const eventColors: Record<TurnEventType, string> = {
 stream_start: 'var(--color-primary)',
 chunk_received: 'var(--color-primary)',
 thought_extracted: 'var(--color-warning)',
 content_emitted: 'var(--color-primary)',
 tool_call_detected: 'var(--color-warning)',
 tool_call_stored: 'var(--color-primary)',
 citation_collected: 'var(--color-primary)',
 finish_reason_set: 'var(--color-warning)',
 turn_complete: 'var(--color-primary)',
 };

 return (
 <div
 key={i}
 className={`p-2 rounded border transition-all duration-300 ${
 isActive
 ? ' bg-elevated border-edge'
 : 'bg-base border-edge opacity-60'
 }`}
 >
 <div className="flex items-center gap-2">
 <span
 className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
 style={{ backgroundColor: eventColors[event.type] }}
 />
 <span className="text-xs font-mono" style={{ color: eventColors[event.type] }}>
 {event.type}
 </span>
 </div>
 <div className="text-xs font-mono text-dim mt-1 truncate">
 {event.description}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

// Turn 状态可视化
function TurnStateVisual({ state }: { state: TurnState }) {
 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📦</span>
 <span className="text-sm font-mono font-bold text-heading">Turn 内部状态</span>
 </div>

 <div className="space-y-3 text-xs font-mono">
 {/* currentResponseId */}
 <div className="p-2 bg-base rounded border border-edge">
 <div className="text-dim">currentResponseId</div>
 <div className="text-heading">
 {state.currentResponseId || 'undefined'}
 </div>
 </div>

 {/* finishReason */}
 <div className="p-2 bg-base rounded border border-edge">
 <div className="text-dim">finishReason</div>
 <div className={state.finishReason ? 'text-heading' : 'text-dim'}>
 {state.finishReason || 'undefined'}
 </div>
 </div>

 {/* pendingToolCalls */}
 <div className="p-2 bg-base rounded border border-edge">
 <div className="text-dim mb-1">
 pendingToolCalls [{state.pendingToolCalls.length}]
 </div>
 {state.pendingToolCalls.length > 0 ? (
 <div className="space-y-1">
 {state.pendingToolCalls.map((tc, i) => (
 <div key={i} className="p-1.5 bg-elevated rounded text-heading">
 {tc.name}({JSON.stringify(tc.args)})
 </div>
 ))}
 </div>
 ) : (
 <div className="text-dim">[]</div>
 )}
 </div>

 {/* modelResponseParts */}
 <div className="p-2 bg-base rounded border border-edge">
 <div className="text-dim mb-1">
 modelResponseParts [{state.modelResponseParts.length}]
 </div>
 {state.modelResponseParts.length > 0 ? (
 <div className="space-y-1">
 {state.modelResponseParts.map((part, i) => (
 <div key={i} className="p-1.5 bg-elevated/10 rounded">
 <span className="text-heading">{part.type}:</span>
 <span className="text-body ml-1 truncate block">
 {part.content.slice(0, 30)}...
 </span>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-dim">[]</div>
 )}
 </div>
 </div>
 </div>
 );
}

export function TurnInternalAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);
 const [turnState, setTurnState] = useState<TurnState>({
 pendingToolCalls: [],
 pendingCitations: new Set(),
 finishReason: undefined,
 currentResponseId: undefined,
 emittedEvents: [],
 modelResponseParts: [],
 });

 const currentEvent = eventSequence[currentStep];

 // 更新状态
 const updateState = useCallback((step: number) => {
 const event = eventSequence[step];
 if (event?.stateChange) {
 setTurnState(prev => ({
 ...prev,
 ...event.stateChange,
 pendingToolCalls: event.stateChange.pendingToolCalls || prev.pendingToolCalls,
 modelResponseParts: event.stateChange.modelResponseParts || prev.modelResponseParts,
 }));
 }
 }, []);

 useEffect(() => {
 if (!isPlaying) return;
 if (currentStep >= eventSequence.length - 1) {
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 const nextStep = currentStep + 1;
 setCurrentStep(nextStep);
 updateState(nextStep);
 }, 2000);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep, updateState]);

 const play = useCallback(() => {
 setCurrentStep(0);
 setTurnState({
 pendingToolCalls: [],
 pendingCitations: new Set(),
 finishReason: undefined,
 currentResponseId: undefined,
 emittedEvents: [],
 modelResponseParts: [],
 });
 setIsPlaying(true);
 }, []);

 const stepForward = useCallback(() => {
 if (currentStep < eventSequence.length - 1) {
 const nextStep = currentStep + 1;
 setCurrentStep(nextStep);
 updateState(nextStep);
 } else {
 setCurrentStep(0);
 setTurnState({
 pendingToolCalls: [],
 pendingCitations: new Set(),
 finishReason: undefined,
 currentResponseId: undefined,
 emittedEvents: [],
 modelResponseParts: [],
 });
 }
 }, [currentStep, updateState]);

 const reset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 setTurnState({
 pendingToolCalls: [],
 pendingCitations: new Set(),
 finishReason: undefined,
 currentResponseId: undefined,
 emittedEvents: [],
 modelResponseParts: [],
 });
 }, []);

 return (
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">🔄</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 Turn 内部状态流转
 </h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // 展示单个 Turn 执行过程中的事件流和状态变化
 </p>

 {/* 介绍部分 */}
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56, 189, 248, 0.25)] transition-all cursor-pointer"
 >
 ▶ 播放 Turn 执行
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一事件
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge/60 transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
 {/* Event stream */}
 <EventStream currentIndex={currentStep} />

 {/* Turn state */}
 <TurnStateVisual state={turnState} />

 {/* Code panel */}
 <div className="bg-base rounded-xl border border-edge overflow-hidden">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">
 {currentEvent?.type || 'turn.ts'}
 </span>
 </div>
 <div className="p-4 max-h-[380px] overflow-y-auto">
 <JsonBlock code={currentEvent?.code || '// 点击播放开始'} />
 </div>
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 事件：<span className="text-heading font-bold">{currentStep + 1}</span>/{eventSequence.length}
 </span>
 {isPlaying && (
 <span className="text-heading font-mono text-sm animate-pulse">● 执行中</span>
 )}
 </div>
 <div className="font-mono text-sm text-heading pl-6">
 {currentEvent?.description || '点击播放开始 Turn 执行演示'}
 </div>
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentStep + 1) / eventSequence.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Key concepts */}
 <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">AsyncGenerator</div>
 <div className="text-xs font-mono text-dim">
 Turn.run() 是异步生成器，逐个 yield 事件
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">Chunk 累积</div>
 <div className="text-xs font-mono text-dim">
 流式响应分多个 chunk，需累积处理
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border-l-2 border-l-edge-hover/60">
 <div className="text-xs font-mono text-heading font-bold mb-1">pendingToolCalls</div>
 <div className="text-xs font-mono text-dim">
 工具调用先存储，等待外部确认执行
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">finishReason</div>
 <div className="text-xs font-mono text-dim">
 决定 Turn 结束后的行为
 </div>
 </div>
 </div>
 </div>
 );
}
