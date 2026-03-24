// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 流式响应生成动画
 *
 * 可视化 useGeminiStream 处理流程
 * 源码: packages/cli/src/ui/hooks/useGeminiStream.ts
 *
 * 核心流程:
 * 1. prepareQueryForGemini - 命令预处理
 * 2. handleVisionSwitch - VLM切换检测
 * 3. processGeminiStreamEvents - 流式事件处理
 * 4. scheduleToolCalls - 工具调度
 */

type StreamingState = 'Idle' | 'Responding' | 'WaitingForConfirmation';

type EventType =
 | 'Content'
 | 'ToolCallRequest'
 | 'Thought'
 | 'Error'
 | 'ChatCompressed'
 | 'Finished'
 | 'LoopDetected'
 | 'UserCancelled';

interface StreamEvent {
 type: EventType;
 value: string;
 timestamp: number;
}

interface QueryPhase {
 name: string;
 description: string;
 status: 'pending' | 'active' | 'complete' | 'skipped';
}

const SAMPLE_EVENTS: StreamEvent[] = [
 { type: 'Thought', value: '分析用户请求...', timestamp: 0 },
 { type: 'Content', value: '让我帮你', timestamp: 100 },
 { type: 'Content', value: '检查这个文件', timestamp: 200 },
 { type: 'Content', value: '的内容。', timestamp: 300 },
 { type: 'ToolCallRequest', value: 'read_file({ file_path: "src/app.ts" })', timestamp: 400 },
 { type: 'ToolCallRequest', value: 'search_file_content({ pattern: "export" })', timestamp: 500 },
 { type: 'Finished', value: 'STOP', timestamp: 600 },
];

const QUERY_PHASES: QueryPhase[] = [
 { name: 'isSlashCommand', description: '检查 /命令', status: 'pending' },
 { name: 'handleShellCommand', description: '检查 Shell 模式', status: 'pending' },
 { name: 'handleAtCommand', description: '检查 @命令', status: 'pending' },
 { name: 'handleVisionSwitch', description: 'VLM 模型切换', status: 'pending' },
 { name: 'sendMessageStream', description: '发送到 API', status: 'pending' },
 { name: 'processEvents', description: '处理流事件', status: 'pending' },
];

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">核心概念</h4>
 <p className="text-body text-sm">
 useGeminiStream 是 CLI 交互的核心 Hook，负责管理用户查询的完整生命周期：
 从输入预处理到流式响应接收、工具调度和结果展示。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么需要</h4>
 <p className="text-body text-sm">
 LLM 响应是异步流式的，包含多种事件类型（内容、工具调用、思考过程）。
 需要统一状态机管理 Idle/Responding/WaitingForConfirmation 三态转换。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">处理流程</h4>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
 <div className="bg-surface p-3 rounded border border-edge/30">
 <div className="text-heading font-semibold text-sm">1. 预处理</div>
 <div className="text-xs text-dim mt-1">
 检测 /命令、@引用<br/>
 VLM 模型切换
 </div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge/30">
 <div className="text-heading font-semibold text-sm">2. 发送请求</div>
 <div className="text-xs text-dim mt-1">
 sendMessageStream<br/>
 启动 SDK 流式迭代
 </div>
 </div>
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-semibold text-sm">3. 事件处理</div>
 <div className="text-xs text-dim mt-1">
 Content/ToolCall<br/>
 Thought/Finished
 </div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge/30">
 <div className="text-heading font-semibold text-sm">4. 工具调度</div>
 <div className="text-xs text-dim mt-1">
 scheduleToolCalls<br/>
 Continuation 机制
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">13</div>
 <div className="text-xs text-dim">事件类型</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">6</div>
 <div className="text-xs text-dim">预处理阶段</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">状态机状态</div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-xl font-bold text-heading">∞</div>
 <div className="text-xs text-dim">Continuation 循环</div>
 </div>
 </div>

 <div className="text-xs text-dim bg-surface px-3 py-2 rounded flex items-center gap-2">
  <code>packages/cli/src/ui/hooks/useGeminiStream.ts</code>
 </div>
 </div>
 )}
 </div>
 );
}

export default function StreamingResponseAnimation() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);
 const [isPlaying, setIsPlaying] = useState(false);
 const [streamingState, setStreamingState] = useState<StreamingState>('Idle');
 const [phases, setPhases] = useState<QueryPhase[]>(QUERY_PHASES);
 const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);
 const [receivedEvents, setReceivedEvents] = useState<StreamEvent[]>([]);
 const [currentEventIndex, setCurrentEventIndex] = useState(-1);
 const [contentBuffer, setContentBuffer] = useState('');
 const [toolCalls, setToolCalls] = useState<string[]>([]);
 const [thought, setThought] = useState<string | null>(null);
 const [logs, setLogs] = useState<string[]>([]);

 const addLog = useCallback((message: string) => {
 setLogs(prev => [...prev.slice(-12), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
 }, []);

 const resetAnimation = useCallback(() => {
 setIsPlaying(false);
 setStreamingState('Idle');
 setPhases(QUERY_PHASES.map(p => ({ ...p, status: 'pending' })));
 setCurrentPhaseIndex(-1);
 setReceivedEvents([]);
 setCurrentEventIndex(-1);
 setContentBuffer('');
 setToolCalls([]);
 setThought(null);
 setLogs([]);
 }, []);

 // Phase 1: Query preparation
 useEffect(() => {
 if (!isPlaying) return;

 if (currentPhaseIndex === -1) {
 addLog('📝 submitQuery() 开始');
 setStreamingState('Responding');
 setCurrentPhaseIndex(0);
 return;
 }

 if (currentPhaseIndex >= phases.length) {
 // Start event processing
 setCurrentEventIndex(0);
 return;
 }

 const timer = setTimeout(() => {
 const phase = phases[currentPhaseIndex];

 setPhases(prev => prev.map((p, i) => ({
 ...p,
 status: i === currentPhaseIndex ? 'active' : i < currentPhaseIndex ? 'complete' : 'pending'
 })));

 addLog(`🔍 ${phase.name}()`);

 setTimeout(() => {
 // Mark as complete or skipped
 const isSkipped = ['handleShellCommand', 'handleAtCommand', 'handleVisionSwitch'].includes(phase.name);
 setPhases(prev => prev.map((p, i) => ({
 ...p,
 status: i === currentPhaseIndex ? (isSkipped ? 'skipped' : 'complete') : p.status
 })));

 if (isSkipped) {
 addLog(` ↳ 跳过 (不适用)`);
 } else {
 addLog(` ✓ 完成`);
 }

 setCurrentPhaseIndex(prev => prev + 1);
 }, 300);
 }, 400);

 return () => clearTimeout(timer);
 }, [isPlaying, currentPhaseIndex, phases, addLog]);

 // Phase 2: Event processing
 useEffect(() => {
 if (!isPlaying || currentEventIndex < 0) return;

 if (currentEventIndex >= SAMPLE_EVENTS.length) {
 addLog('✅ 流处理完成');
 setStreamingState('Idle');
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 const event = SAMPLE_EVENTS[currentEventIndex];
 setReceivedEvents(prev => [...prev, event]);

 switch (event.type) {
 case 'Thought':
 setThought(event.value);
 addLog(`💭 Thought: ${event.value}`);
 break;
 case 'Content':
 setContentBuffer(prev => prev + event.value);
 addLog(`📜 Content: "${event.value}"`);
 break;
 case 'ToolCallRequest':
 setToolCalls(prev => [...prev, event.value]);
 setStreamingState('WaitingForConfirmation');
 addLog(`🔧 ToolCallRequest: ${event.value}`);
 break;
 case 'Finished':
 addLog(`🏁 Finished: ${event.value}`);
 break;
 default:
 addLog(`📨 ${event.type}: ${event.value}`);
 }

 setCurrentEventIndex(prev => prev + 1);
 }, 500);

 return () => clearTimeout(timer);
 }, [isPlaying, currentEventIndex, addLog]);

 const getStateColor = (state: StreamingState) => {
 switch (state) {
 case 'Idle': return 'var(--color-text-muted)';
 case 'Responding': return 'var(--color-primary)';
 case 'WaitingForConfirmation': return 'var(--color-warning)';
 }
 };

 const getEventColor = (type: EventType) => {
 switch (type) {
 case 'Content': return 'var(--color-primary)';
 case 'ToolCallRequest': return 'var(--color-primary)';
 case 'Thought': return 'var(--color-primary)';
 case 'Error': return 'var(--color-danger)';
 case 'Finished': return 'var(--color-warning)';
 default: return 'var(--color-text-muted)';
 }
 };

 return (
 <div className="p-6 space-y-6">
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* 标题区 */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-heading font-mono">
 流式响应生成
 </h1>
 <p className="text-dim text-sm mt-1">
 useGeminiStream - 消息流处理管道
 </p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-xs text-dim">StreamingState:</span>
 <span
 className="px-2 py-0.5 rounded text-xs font-mono"
 style={{
 backgroundColor: `${getStateColor(streamingState)}20`,
 color: getStateColor(streamingState),
 border: `1px solid ${getStateColor(streamingState)}30`
 }}
 >
 {streamingState}
 </span>
 </div>
 <button
 onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
 className={`px-4 py-2 rounded font-mono text-sm transition-all ${
 isPlaying
 ? 'bg-elevated text-heading border-l-2 border-l-edge-hover/30'
 : ' bg-elevated/20 text-heading border border-edge/30'
 }`}
 >
 {isPlaying ? '⏹ 停止' : '▶ 开始'}
 </button>
 </div>
 </div>

 {/* 主要内容区 */}
 <div className="grid grid-cols-12 gap-6">
 {/* 左侧: 查询预处理阶段 */}
 <div className="col-span-4">
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <h3 className="text-sm font-semibold text-heading mb-3 font-mono">
 prepareQueryForGemini()
 </h3>
 <div className="space-y-2">
 {phases.map((phase, index) => (
 <div
 key={phase.name}
 className={`p-3 rounded-lg border transition-all ${
 phase.status === 'active'
 ? ' bg-elevated/10 border-edge-hover animate-pulse'
 : phase.status === 'complete'
 ? ' bg-elevated/10 border-edge/30'
 : phase.status === 'skipped'
 ? ' bg-elevated/10 border-edge-hover/30 opacity-50'
 : 'bg-base/20 border-edge-hover'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono text-dim">
 {index + 1}.
 </span>
 <span className={`text-sm font-mono ${
 phase.status === 'active' ? 'text-heading' :
 phase.status === 'complete' ? 'text-heading' :
 phase.status === 'skipped' ? 'text-dim' :
 'text-body'
 }`}>
 {phase.name}
 </span>
 </div>
 <span className="text-xs">
 {phase.status === 'complete' && '✓'}
 {phase.status === 'skipped' && '⊘'}
 {phase.status === 'active' && '◉'}
 </span>
 </div>
 <p className="text-xs text-dim mt-1 ml-5">
 {phase.description}
 </p>
 </div>
 ))}
 </div>
 </div>

 {/* Thought 显示 */}
 {thought && (
 <div className="mt-4 bg-elevated rounded-lg p-4 border border-edge">
 <h4 className="text-xs font-mono text-heading mb-2">Thought</h4>
 <p className="text-sm text-heading">{thought}</p>
 </div>
 )}
 </div>

 {/* 中间: 事件流 */}
 <div className="col-span-5">
 <div className="bg-surface rounded-lg p-4 border border-edge-hover h-full">
 <h3 className="text-sm font-semibold text-heading mb-3 font-mono">
 processGeminiStreamEvents()
 </h3>

 {/* 事件类型图例 */}
 <div className="flex flex-wrap gap-2 mb-4">
 {(['Content', 'ToolCallRequest', 'Thought', 'Finished'] as EventType[]).map(type => (
 <span
 key={type}
 className="text-xs font-mono px-2 py-0.5 rounded"
 style={{
 backgroundColor: `${getEventColor(type)}15`,
 color: getEventColor(type),
 }}
 >
 {type}
 </span>
 ))}
 </div>

 {/* 事件流可视化 */}
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {receivedEvents.length === 0 ? (
 <div className="text-center text-dim py-8 text-sm">
 等待事件流...
 </div>
 ) : (
 receivedEvents.map((event, i) => (
 <div
 key={i}
 className="flex items-start gap-3 p-2 rounded-lg bg-base/30 animate-slideIn"
 style={{
 borderLeft: `3px solid ${getEventColor(event.type)}`
 }}
 >
 <span
 className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
 style={{
 backgroundColor: `${getEventColor(event.type)}20`,
 color: getEventColor(event.type),
 }}
 >
 {event.type}
 </span>
 <span className="text-sm text-body font-mono truncate">
 {event.value}
 </span>
 </div>
 ))
 )}
 </div>

 {/* 内容缓冲区 */}
 <div className="mt-4 p-3 bg-base/40 rounded-lg border border-edge/30">
 <h4 className="text-xs font-mono text-heading mb-2">
 geminiMessageBuffer
 </h4>
 <p className="text-sm font-mono text-heading min-h-[2rem]">
 {contentBuffer || <span className="text-dim">""</span>}
 <span className="animate-pulse">▊</span>
 </p>
 </div>

 {/* 工具调用 */}
 {toolCalls.length > 0 && (
 <div className="mt-4 p-3 bg-elevated/10 rounded-lg border border-edge/30">
 <h4 className="text-xs font-mono text-heading mb-2">
 toolCallRequests[]
 </h4>
 <div className="space-y-1">
 {toolCalls.map((tc, i) => (
 <code key={i} className="block text-xs font-mono text-body">
 {tc}
 </code>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* 右侧: 日志 */}
 <div className="col-span-3">
 <div className="bg-base/80 rounded-lg p-4 border border-edge-hover h-full">
 <h3 className="text-xs font-semibold text-dim mb-2 font-mono">
 Execution Log
 </h3>
 <div className="space-y-1 text-xs font-mono h-80 overflow-y-auto">
 {logs.length === 0 ? (
 <div className="text-dim">等待开始...</div>
 ) : (
 logs.map((log, i) => (
 <div
 key={i}
 className={`${
 log.includes('✓') || log.includes('✅') ? 'text-heading' :
 log.includes('⊘') || log.includes('跳过') ? 'text-dim' :
 log.includes('🔧') ? 'text-heading' :
 log.includes('💭') ? 'text-heading' :
 log.includes('📝') || log.includes('🔍') ? 'text-heading' :
 'text-body'
 }`}
 >
 {log}
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>

 {/* 源码说明 */}
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <h3 className="text-sm font-semibold text-heading mb-3">
 源码: useGeminiStream.ts
 </h3>
 <pre className="text-xs font-mono text-body bg-base/30 p-3 rounded overflow-x-auto">
{`// 核心状态机
enum StreamingState {
 Idle, // 空闲
 Responding, // 响应中
 WaitingForConfirmation // 等待确认
}

// 事件处理循环
async function processGeminiStreamEvents(stream, userMessageTimestamp, signal) {
 let geminiMessageBuffer = '';
 const toolCallRequests: ToolCallRequestInfo[] = [];

 for await (const event of stream) {
 switch (event.type) {
 case 'Content':
 geminiMessageBuffer = handleContentEvent(event.value, geminiMessageBuffer);
 break;
 case 'ToolCallRequest':
 toolCallRequests.push(event.value);
 break;
 case 'Thought':
 setThought(event.value);
 break;
 case 'Finished':
 handleFinishedEvent(event);
 break;
 // ... 更多事件类型
 }
 }

 if (toolCallRequests.length > 0) {
 scheduleToolCalls(toolCallRequests, signal);
 }
}`}
 </pre>
 </div>
 </div>
 );
}
