// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 会话状态机动画
 *
 * 可视化 Turn 类的事件流转
 * 源码: packages/core/src/core/turn.ts
 *
 * GeminiEventType 枚举:
 * Content, ToolCallRequest, ToolCallResponse, Thought,
 * Finished, Error, Retry, ChatCompressed, LoopDetected
 */

type GeminiEventType =
  | 'Content'
  | 'ToolCallRequest'
  | 'ToolCallResponse'
  | 'Thought'
  | 'Finished'
  | 'Error'
  | 'Retry'
  | 'ChatCompressed'
  | 'LoopDetected'
  | 'Citation'
  | 'UserCancelled';

interface TurnEvent {
  type: GeminiEventType;
  value?: string;
  timestamp: number;
}

type TurnPhase =
  | 'idle'
  | 'streaming'
  | 'tool_execution'
  | 'waiting_response'
  | 'completed';

const SAMPLE_EVENTS: TurnEvent[] = [
  { type: 'Content', value: '我来帮你分析这个文件...', timestamp: 0 },
  { type: 'Thought', value: '需要先读取文件内容，然后进行分析', timestamp: 200 },
  { type: 'Content', value: '让我读取文件', timestamp: 400 },
  { type: 'ToolCallRequest', value: 'Read({file_path: "/src/app.ts"})', timestamp: 600 },
  { type: 'ToolCallResponse', value: 'export default function App() {...}', timestamp: 1000 },
  { type: 'Content', value: '这是一个 React 组件文件...', timestamp: 1200 },
  { type: 'Citation', value: 'https://react.dev/learn', timestamp: 1400 },
  { type: 'Finished', value: 'STOP', timestamp: 1600 },
];

export default function SessionStateMachineAnimation() {
  const [events, setEvents] = useState<TurnEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [phase, setPhase] = useState<TurnPhase>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [streamContent, setStreamContent] = useState('');
  const [pendingToolCalls, setPendingToolCalls] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-12), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setEvents([]);
    setCurrentEventIndex(-1);
    setPhase('idle');
    setLogs([]);
    setStreamContent('');
    setPendingToolCalls([]);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentEventIndex >= SAMPLE_EVENTS.length) {
      setPhase('completed');
      addLog('✅ Turn 完成');
      setIsPlaying(false);
      return;
    }

    if (currentEventIndex === -1) {
      addLog('🚀 Turn.run() 开始');
      addLog('  await chat.sendMessageStream()');
      setPhase('streaming');
      setCurrentEventIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const event = SAMPLE_EVENTS[currentEventIndex];
      if (!event) return;

      setEvents(prev => [...prev, event]);

      switch (event.type) {
        case 'Content':
          setStreamContent(prev => prev + event.value);
          addLog(`📝 Content: "${event.value?.slice(0, 30)}..."`);
          break;

        case 'Thought':
          addLog(`💭 Thought: "${event.value?.slice(0, 40)}..."`);
          break;

        case 'ToolCallRequest':
          setPendingToolCalls(prev => [...prev, event.value || '']);
          setPhase('tool_execution');
          addLog(`⚡ ToolCallRequest: ${event.value}`);
          break;

        case 'ToolCallResponse':
          setPendingToolCalls([]);
          setPhase('streaming');
          addLog(`📥 ToolCallResponse received`);
          break;

        case 'Citation':
          addLog(`🔗 Citation: ${event.value}`);
          break;

        case 'Finished':
          addLog(`🏁 Finished: reason=${event.value}`);
          break;

        case 'Error':
          addLog(`❌ Error: ${event.value}`);
          break;

        case 'Retry':
          addLog(`🔄 Retry requested`);
          break;
      }

      setCurrentEventIndex(prev => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIndex, addLog]);

  const getEventColor = (type: GeminiEventType) => {
    switch (type) {
      case 'Content': return 'var(--terminal-green)';
      case 'Thought': return '#a855f7';
      case 'ToolCallRequest': return 'var(--amber)';
      case 'ToolCallResponse': return 'var(--cyber-blue)';
      case 'Finished': return 'var(--terminal-green)';
      case 'Error': return '#ef4444';
      case 'Retry': return 'var(--amber)';
      case 'Citation': return 'var(--cyber-blue)';
      case 'ChatCompressed': return '#6b7280';
      case 'LoopDetected': return '#ef4444';
      case 'UserCancelled': return '#6b7280';
    }
  };

  const getEventIcon = (type: GeminiEventType) => {
    switch (type) {
      case 'Content': return '📝';
      case 'Thought': return '💭';
      case 'ToolCallRequest': return '⚡';
      case 'ToolCallResponse': return '📥';
      case 'Finished': return '🏁';
      case 'Error': return '❌';
      case 'Retry': return '🔄';
      case 'Citation': return '🔗';
      case 'ChatCompressed': return '📦';
      case 'LoopDetected': return '🔁';
      case 'UserCancelled': return '🚫';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            会话状态机
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Turn - GeminiEventType 事件流转与生命周期
          </p>
        </div>
        <button
          onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
          className={`px-4 py-2 rounded font-mono text-sm transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
          }`}
        >
          {isPlaying ? '⏹ 停止' : '▶ 开始'}
        </button>
      </div>

      {/* 事件类型图例 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 font-mono">
          GeminiEventType
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Content', 'Thought', 'ToolCallRequest', 'ToolCallResponse', 'Finished', 'Error', 'Retry', 'Citation'].map((type) => (
            <span
              key={type}
              className="text-xs font-mono px-2 py-1 rounded flex items-center gap-1"
              style={{
                backgroundColor: `${getEventColor(type as GeminiEventType)}20`,
                color: getEventColor(type as GeminiEventType),
                border: `1px solid ${getEventColor(type as GeminiEventType)}40`,
              }}
            >
              {getEventIcon(type as GeminiEventType)} {type}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 事件时间线 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              📡 Event Stream
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待事件流...
                </div>
              ) : (
                events.map((event, i) => (
                  <div
                    key={i}
                    className="p-2 rounded border transition-all"
                    style={{
                      backgroundColor: `${getEventColor(event.type)}10`,
                      borderColor: `${getEventColor(event.type)}40`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getEventIcon(event.type)}</span>
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: getEventColor(event.type) }}
                      >
                        {event.type}
                      </span>
                    </div>
                    {event.value && (
                      <div className="text-xs text-[var(--muted)] font-mono truncate">
                        {event.value.slice(0, 40)}...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Turn 状态 */}
        <div className="col-span-4">
          <div className="bg-black/60 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              🎯 Turn State
            </h3>

            {/* 当前阶段 */}
            <div className="mb-4 p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">Current Phase</div>
              <div
                className="text-lg font-mono font-bold"
                style={{
                  color: phase === 'completed' ? 'var(--terminal-green)' :
                         phase === 'tool_execution' ? 'var(--amber)' : 'var(--cyber-blue)'
                }}
              >
                {phase.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            {/* Pending Tool Calls */}
            <div className="mb-4 p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">pendingToolCalls</div>
              {pendingToolCalls.length === 0 ? (
                <div className="text-sm text-[var(--muted)]">[]</div>
              ) : (
                <div className="space-y-1">
                  {pendingToolCalls.map((tc, i) => (
                    <div key={i} className="text-xs font-mono text-[var(--amber)]">
                      {tc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 流式内容预览 */}
            <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">Streamed Content</div>
              <div className="text-sm font-mono text-[var(--text-secondary)] max-h-20 overflow-y-auto">
                {streamContent || '(waiting...)'}
              </div>
            </div>
          </div>
        </div>

        {/* 日志 + 状态机图 */}
        <div className="col-span-4 space-y-4">
          {/* 状态机简图 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-2 font-mono">
              State Machine
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className={`flex items-center gap-2 ${phase === 'idle' ? 'text-[var(--terminal-green)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'idle' ? 'bg-[var(--terminal-green)]' : 'bg-[var(--muted)]/30'}`} />
                IDLE
              </div>
              <div className="ml-4 text-[var(--muted)]">↓ sendMessageStream()</div>
              <div className={`flex items-center gap-2 ${phase === 'streaming' ? 'text-[var(--terminal-green)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'streaming' ? 'bg-[var(--terminal-green)] animate-pulse' : 'bg-[var(--muted)]/30'}`} />
                STREAMING
              </div>
              <div className="ml-4 text-[var(--muted)]">↓ ToolCallRequest</div>
              <div className={`flex items-center gap-2 ${phase === 'tool_execution' ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'tool_execution' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--muted)]/30'}`} />
                TOOL_EXECUTION
              </div>
              <div className="ml-4 text-[var(--muted)]">↓ ToolCallResponse</div>
              <div className="ml-4 text-[var(--muted)]">↓ Finished</div>
              <div className={`flex items-center gap-2 ${phase === 'completed' ? 'text-[var(--terminal-green)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'completed' ? 'bg-[var(--terminal-green)]' : 'bg-[var(--muted)]/30'}`} />
                COMPLETED
              </div>
            </div>
          </div>

          {/* 日志 */}
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Turn Log
            </h3>
            <div className="space-y-1 text-xs font-mono h-32 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[var(--muted)]">等待开始...</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✅') || log.includes('🏁') ? 'text-[var(--terminal-green)]' :
                      log.includes('⚡') || log.includes('🚀') ? 'text-[var(--amber)]' :
                      log.includes('📝') ? 'text-[var(--terminal-green)]' :
                      log.includes('💭') ? 'text-purple-400' :
                      log.includes('📥') || log.includes('🔗') ? 'text-[var(--cyber-blue)]' :
                      'text-[var(--muted)]'
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
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: turn.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`class Turn {
  readonly pendingToolCalls: ToolCallRequestInfo[] = [];
  finishReason: FinishReason | undefined = undefined;

  async *run(model: string, req: PartListUnion, signal: AbortSignal):
    AsyncGenerator<ServerGeminiStreamEvent> {

    const responseStream = await this.chat.sendMessageStream(model, {message: req});

    for await (const streamEvent of responseStream) {
      if (signal?.aborted) {
        yield { type: GeminiEventType.UserCancelled };
        return;
      }

      // Handle: Retry, Content, Thought, ToolCallRequest, Citation, Finished
      const resp = streamEvent.value as GenerateContentResponse;

      if (resp.text) yield { type: GeminiEventType.Content, value: resp.text };

      for (const fnCall of resp.functionCalls ?? []) {
        this.pendingToolCalls.push(/* ... */);
        yield { type: GeminiEventType.ToolCallRequest, value: /* ... */ };
      }

      if (finishReason) {
        yield { type: GeminiEventType.Finished, value: { reason, usageMetadata } };
      }
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
