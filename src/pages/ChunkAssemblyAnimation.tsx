import { useState, useEffect, useCallback, useMemo } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Chunk 类型
interface StreamChunk {
 id: number;
 raw: string;
 parsed: {
 delta?: {
 content?: string;
 tool_calls?: Array<{
 index: number;
 id?: string;
 function?: { name?: string; arguments?: string };
 }>;
 };
 finish_reason?: string | null;
 };
 type: 'content' | 'tool_meta' | 'tool_args' | 'finish' | 'usage';
}

// 解析器状态
interface ParserState {
 textBuffer: string;
 toolCalls: Map<number, {
 id: string;
 name: string;
 argsBuffer: string;
 depth: number;
 complete: boolean;
 }>;
 finishReason?: string;
 usageMetadata?: { prompt: number; completion: number; total: number };
}

// 模拟的 chunk 序列
const chunks: StreamChunk[] = [
 {
 id: 1,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}`,
 parsed: { delta: { content: '' } },
 type: 'content',
 },
 {
 id: 2,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"content":"好"},"index":0}]}`,
 parsed: { delta: { content: '好' } },
 type: 'content',
 },
 {
 id: 3,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"content":"的，"},"index":0}]}`,
 parsed: { delta: { content: '的，' } },
 type: 'content',
 },
 {
 id: 4,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"content":"让我"},"index":0}]}`,
 parsed: { delta: { content: '让我' } },
 type: 'content',
 },
 {
 id: 5,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"content":"读取文件。"},"index":0}]}`,
 parsed: { delta: { content: '读取文件。' } },
 type: 'content',
 },
 {
 id: 6,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_abc","type":"function","function":{"name":"read_file"}}]},"index":0}]}`,
 parsed: { delta: { tool_calls: [{ index: 0, id: 'call_abc', function: { name: 'read_file' } }] } },
 type: 'tool_meta',
 },
 {
 id: 7,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"pa"}}]},"index":0}]}`,
 parsed: { delta: { tool_calls: [{ index: 0, function: { arguments: '{"pa' } }] } },
 type: 'tool_args',
 },
 {
 id: 8,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"th\\":\\"/pack"}}]},"index":0}]}`,
 parsed: { delta: { tool_calls: [{ index: 0, function: { arguments: 'th":"/pack' } }] } },
 type: 'tool_args',
 },
 {
 id: 9,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"age.json\\"}"}}]},"index":0}]}`,
 parsed: { delta: { tool_calls: [{ index: 0, function: { arguments: 'age.json"}' } }] } },
 type: 'tool_args',
 },
 {
 id: 10,
 raw: `{"id":"chatcmpl-001","choices":[{"delta":{},"finish_reason":"tool_calls","index":0}]}`,
 parsed: { finish_reason: 'tool_calls' },
 type: 'finish',
 },
 {
 id: 11,
 raw: `{"id":"chatcmpl-001","usage":{"prompt_tokens":150,"completion_tokens":45,"total_tokens":195}}`,
 parsed: {},
 type: 'usage',
 },
];

// Chunk 可视化
function ChunkVisual({
 chunk,
 isActive,
 isPast,
}: {
 chunk: StreamChunk;
 isActive: boolean;
 isPast: boolean;
}) {
 const typeColors = {
 content: 'var(--color-primary)',
 tool_meta: '#f59e0b',
 tool_args: 'var(--color-primary)',
 finish: 'var(--color-primary)',
 usage: 'var(--color-text-muted)',
 };

 return (
 <div
 className={`p-2 rounded border transition-all duration-300 ${
 isActive
 ? ' bg-elevated border-edge scale-105'
 : isPast
 ? 'bg-base border-edge opacity-50'
 : 'bg-base border-edge opacity-30'
 }`}
 >
 <div className="flex items-center gap-2 mb-1">
 <span
 className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
 style={{ backgroundColor: typeColors[chunk.type] }}
 />
 <span className="text-xs font-mono" style={{ color: typeColors[chunk.type] }}>
 #{chunk.id} {chunk.type}
 </span>
 </div>
 <div className="text-xs font-mono text-dim truncate">
 {chunk.raw.slice(0, 50)}...
 </div>
 </div>
 );
}

// 缓冲区可视化
function BufferVisual({
 state,
 currentChunk,
}: {
 state: ParserState;
 currentChunk: StreamChunk | null;
}) {
 const toolCall = state.toolCalls.get(0);

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-amber-500">📦</span>
 <span className="text-sm font-mono font-bold text-heading">累积缓冲区</span>
 </div>

 <div className="space-y-3">
 {/* Text buffer */}
 <div className="p-3 bg-base rounded border border-edge">
 <div className="text-xs font-mono text-heading mb-1">textBuffer</div>
 <div className="font-mono text-sm text-heading min-h-[24px]">
 {state.textBuffer || <span className="text-dim">(empty)</span>}
 {currentChunk?.type === 'content' && (
 <span className="text-heading animate-pulse">▋</span>
 )}
 </div>
 </div>

 {/* Tool call buffer */}
 <div className="p-3 bg-base rounded border border-edge">
 <div className="text-xs font-mono text-heading mb-1">
 toolCalls[0].argsBuffer
 {toolCall && (
 <span className="ml-2 text-dim">
 depth={toolCall.depth} complete={toolCall.complete ? 'true' : 'false'}
 </span>
 )}
 </div>
 <div className="font-mono text-sm text-heading min-h-[24px] break-all">
 {toolCall?.argsBuffer || <span className="text-dim">(empty)</span>}
 {currentChunk?.type === 'tool_args' && (
 <span className="text-heading animate-pulse">▋</span>
 )}
 </div>
 </div>

 {/* Tool metadata */}
 {toolCall && (
 <div className="p-3 bg-base rounded border border-amber-600">
 <div className="text-xs font-mono text-amber-500 mb-1">toolCalls[0] metadata</div>
 <div className="font-mono text-xs text-body">
 id: {toolCall.id || '(pending)'}
 <br />
 name: {toolCall.name || '(pending)'}
 </div>
 </div>
 )}

 {/* Finish reason */}
 {state.finishReason && (
 <div className="p-3 bg-base rounded border border-edge">
 <div className="text-xs font-mono text-heading mb-1">finishReason</div>
 <div className="font-mono text-sm text-heading">{state.finishReason}</div>
 </div>
 )}
 </div>
 </div>
 );
}

// JSON 深度追踪可视化
function DepthTracker({ depth, char }: { depth: number; char: string }) {
 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📊</span>
 <span className="text-sm font-mono font-bold text-heading">JSON 深度追踪</span>
 </div>

 <div className="flex items-center gap-3 mb-3">
 <div className="text-xs font-mono text-dim">当前字符:</div>
 <div className="px-3 py-1 bg-base rounded font-mono text-lg text-amber-500">
 {char || '-'}
 </div>
 </div>

 <div className="flex items-center gap-2">
 {[0, 1, 2, 3].map((d) => (
 <div
 key={d}
 className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold border-2 transition-all ${
 d === depth
 ? ' bg-elevated border-edge text-heading scale-110'
 : d < depth
 ? ' bg-elevated/30 border-edge text-heading'
 : 'bg-base border-edge text-dim'
 }`}
 >
 {d}
 </div>
 ))}
 </div>

 <div className="mt-3 text-xs font-mono text-dim">
 <span className="text-heading">{'{'}</span> → depth++
 <span className="mx-2">|</span>
 <span className="text-red-500">{'}'}</span> → depth--
 <span className="mx-2">|</span>
 depth=0 → JSON 完成
 </div>
 </div>
 );
}

export function ChunkAssemblyAnimation() {
 const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
 const [isPlaying, setIsPlaying] = useState(false);
 const [state, setState] = useState<ParserState>({
 textBuffer: '',
 toolCalls: new Map(),
 });
 const [currentChar, setCurrentChar] = useState('');
 const [currentDepth, setCurrentDepth] = useState(0);

 const currentChunk = currentChunkIndex >= 0 ? chunks[currentChunkIndex] : null;

 // 处理 chunk
 const processChunk = useCallback((chunk: StreamChunk) => {
 setState((prev) => {
 const next = { ...prev, toolCalls: new Map(prev.toolCalls) };

 switch (chunk.type) {
 case 'content':
 next.textBuffer = prev.textBuffer + (chunk.parsed.delta?.content || '');
 break;

 case 'tool_meta': {
 const tc = chunk.parsed.delta?.tool_calls?.[0];
 if (tc) {
 next.toolCalls.set(tc.index, {
 id: tc.id || '',
 name: tc.function?.name || '',
 argsBuffer: '',
 depth: 0,
 complete: false,
 });
 }
 break;
 }

 case 'tool_args': {
 const tc = chunk.parsed.delta?.tool_calls?.[0];
 if (tc) {
 const existing = prev.toolCalls.get(tc.index);
 if (existing) {
 const newArgs = tc.function?.arguments || '';
 const newBuffer = existing.argsBuffer + newArgs;

 // 计算深度
 let depth = existing.depth;
 for (const char of newArgs) {
 if (char === '{') depth++;
 if (char === '}') depth--;
 setCurrentChar(char);
 }

 setCurrentDepth(depth);

 next.toolCalls.set(tc.index, {
 ...existing,
 argsBuffer: newBuffer,
 depth,
 complete: depth === 0 && newBuffer.length > 0,
 });
 }
 }
 break;
 }

 case 'finish':
 next.finishReason = chunk.parsed.finish_reason || undefined;
 break;

 case 'usage':
 // Usage metadata
 break;
 }

 return next;
 });
 }, []);

 useEffect(() => {
 if (!isPlaying) return;
 if (currentChunkIndex >= chunks.length - 1) {
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 const nextIndex = currentChunkIndex + 1;
 setCurrentChunkIndex(nextIndex);
 processChunk(chunks[nextIndex]);
 }, 800);

 return () => clearTimeout(timer);
 }, [isPlaying, currentChunkIndex, processChunk]);

 const play = useCallback(() => {
 setCurrentChunkIndex(-1);
 setState({ textBuffer: '', toolCalls: new Map() });
 setCurrentChar('');
 setCurrentDepth(0);
 setIsPlaying(true);
 }, []);

 const stepForward = useCallback(() => {
 if (currentChunkIndex < chunks.length - 1) {
 const nextIndex = currentChunkIndex + 1;
 setCurrentChunkIndex(nextIndex);
 processChunk(chunks[nextIndex]);
 } else {
 setCurrentChunkIndex(-1);
 setState({ textBuffer: '', toolCalls: new Map() });
 setCurrentChar('');
 setCurrentDepth(0);
 }
 }, [currentChunkIndex, processChunk]);

 const reset = useCallback(() => {
 setCurrentChunkIndex(-1);
 setIsPlaying(false);
 setState({ textBuffer: '', toolCalls: new Map() });
 setCurrentChar('');
 setCurrentDepth(0);
 }, []);

 // 当前代码
 const code = useMemo(() => {
 if (!currentChunk) return '// 点击播放开始';

 switch (currentChunk.type) {
 case 'content':
 return `// 处理文本内容 chunk
const delta = chunk.choices[0].delta;

if (delta.content) {
 // 累积到文本缓冲区
 this.textBuffer += delta.content;

 // 立即发出内容事件 (流式输出)
 yield {
 type: GeminiEventType.Content,
 data: { text: delta.content }
 };
}`;

 case 'tool_meta':
 return `// 处理工具调用元数据 (id, name)
const toolCall = chunk.choices[0].delta.tool_calls[0];

if (toolCall.id || toolCall.function?.name) {
 // 初始化或更新工具调用状态
 const index = toolCall.index;

 if (!this.toolCalls.has(index)) {
 this.toolCalls.set(index, {
 id: toolCall.id,
 name: toolCall.function?.name,
 argsBuffer: '',
 depth: 0,
 complete: false
 });
 } else {
 // 更新已有条目
 const existing = this.toolCalls.get(index);
 if (toolCall.id) existing.id = toolCall.id;
 if (toolCall.function?.name) existing.name = toolCall.function.name;
 }
}`;

 case 'tool_args':
 return `// 处理工具调用参数片段
const toolCall = chunk.choices[0].delta.tool_calls[0];
const argsFragment = toolCall.function?.arguments || '';

// 累积到参数缓冲区
const entry = this.toolCalls.get(toolCall.index);
entry.argsBuffer += argsFragment;

// 追踪 JSON 深度
for (const char of argsFragment) {
 if (char === '{') entry.depth++;
 if (char === '}') entry.depth--;
}

// 检查是否完成 (depth 归零且有内容)
if (entry.depth === 0 && entry.argsBuffer.length > 0) {
 entry.complete = true;

 // 尝试解析 JSON
 try {
 const args = JSON.parse(entry.argsBuffer);
 // 发出完整的工具调用
 yield {
 type: GeminiEventType.ToolCallRequest,
 data: { id: entry.id, name: entry.name, args }
 };
 } catch (e) {
 // JSON 修复逻辑...
 }
}`;

 case 'finish':
 return `// 处理结束标记
const finishReason = chunk.choices[0].finish_reason;

if (finishReason) {
 this.finishReason = finishReason;

 // 映射到 Gemini 格式
 const geminiReason = mapFinishReason(finishReason);
 // 'stop' → 'STOP'
 // 'tool_calls' → 'TOOL_USE'
 // 'length' → 'MAX_TOKENS'

 // 注意: finishReason 可能与 usageMetadata 分开发送
 // 需要等待 usage chunk 再发出最终事件
}`;

 case 'usage':
 return `// 处理 token 使用统计
const usage = chunk.usage;

if (usage) {
 this.usageMetadata = {
 promptTokenCount: usage.prompt_tokens,
 candidatesTokenCount: usage.completion_tokens,
 totalTokenCount: usage.total_tokens
 };
}

// 所有 chunk 处理完成
// 发出 Finished 事件
yield {
 type: GeminiEventType.Finished,
 data: {
 finishReason: this.finishReason,
 usageMetadata: this.usageMetadata
 }
};`;

 default:
 return '';
 }
 }, [currentChunk]);

 return (
 <div className="bg-surface rounded-lg p-8 border border-edge relative overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">📦</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 流式 Chunk 组装
 </h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // SSE 响应的逐 chunk 处理和状态累积
 <br />
 // 源码位置: packages/core/src/core/openaiContentGenerator/pipeline.ts
 </p>

 <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
 注意：本页展示的是 Innies/Qwen CLI 的 OpenAI 兼容流式输出（SSE chunks / tool_calls）如何被组装；
 上游 Gemini CLI 使用 <code className="bg-base/30 px-1 rounded">@google/genai</code> 的流式响应结构，
 不需要解析 OpenAI 的 <code className="bg-base/30 px-1 rounded">tool_calls</code>。
 </div>

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_sky-400] transition-all cursor-pointer"
 >
 ▶ 播放组装过程
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一 Chunk
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-amber-500 rounded-md font-mono font-bold border border-edge hover:border-amber-600 transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Chunk stream */}
 <div className="mb-6 p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📡</span>
 <span className="text-sm font-mono font-bold text-heading">SSE Chunk 流</span>
 </div>
 <div className="flex gap-2 overflow-x-auto pb-2">
 {chunks.map((chunk, i) => (
 <ChunkVisual
 key={chunk.id}
 chunk={chunk}
 isActive={i === currentChunkIndex}
 isPast={i < currentChunkIndex}
 />
 ))}
 </div>
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
 {/* Buffer state */}
 <BufferVisual state={state} currentChunk={currentChunk} />

 {/* Depth tracker */}
 <DepthTracker depth={currentDepth} char={currentChar} />

 {/* Code panel */}
 <div className="bg-base rounded-lg border border-edge overflow-hidden">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">
 {currentChunk?.type || 'pipeline.ts'}
 </span>
 </div>
 <div className="p-4 max-h-[280px] overflow-y-auto">
 <JsonBlock code={code} />
 </div>
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 Chunk：<span className="text-heading font-bold">{currentChunkIndex + 1}</span>/{chunks.length}
 </span>
 {isPlaying && (
 <span className="text-amber-500 font-mono text-sm animate-pulse">● 处理中</span>
 )}
 </div>
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentChunkIndex + 1) / chunks.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Key points */}
 <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">流式累积</div>
 <div className="text-xs font-mono text-dim">
 文本内容逐 chunk 累积到 buffer
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-amber-600">
 <div className="text-xs font-mono text-amber-500 font-bold mb-1">元数据先行</div>
 <div className="text-xs font-mono text-dim">
 工具 id/name 通常先于参数到达
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">深度追踪</div>
 <div className="text-xs font-mono text-dim">
 {'{ → depth++ | } → depth--'}
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">分离发送</div>
 <div className="text-xs font-mono text-dim">
 finish_reason 和 usage 可能分开
 </div>
 </div>
 </div>
 </div>
 );
}
