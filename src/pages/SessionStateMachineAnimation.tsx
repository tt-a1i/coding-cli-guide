// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 会话状态机动画
 *
 * 可视化 Client/Turn 事件流转（ServerGeminiStreamEvent）
 * 源码: packages/core/src/core/client.ts + packages/core/src/core/turn.ts
 *
 * GeminiEventType 枚举（turn.ts）:
 * content, thought, tool_call_request, tool_call_response, tool_call_confirmation,
 * citation, finished, retry, invalid_stream, error, user_cancelled,
 * chat_compressed, loop_detected, max_session_turns, context_window_will_overflow, model_info
 */

type GeminiEventType =
  | 'content'
  | 'tool_call_request'
  | 'tool_call_response'
  | 'tool_call_confirmation'
  | 'user_cancelled'
  | 'error'
  | 'chat_compressed'
  | 'thought'
  | 'max_session_turns'
  | 'finished'
  | 'loop_detected'
  | 'citation'
  | 'retry'
  | 'context_window_will_overflow'
  | 'invalid_stream'
  | 'model_info';

interface TurnEvent {
  type: GeminiEventType;
  value?: unknown;
  timestamp: number;
}

type TurnPhase =
  | 'idle'
  | 'streaming'
  | 'waiting_confirmation'
  | 'tool_execution'
  | 'error'
  | 'completed';

const SAMPLE_EVENTS: TurnEvent[] = [
  { type: 'model_info', value: 'gemini-2.0-flash', timestamp: 0 },
  { type: 'content', value: '我来帮你分析这个文件…', timestamp: 200 },
  {
    type: 'thought',
    value: { subject: '计划', description: '需要先读取文件内容，然后做结构分析' },
    timestamp: 350,
  },
  { type: 'content', value: '先读取文件内容。', timestamp: 450 },
  {
    type: 'tool_call_request',
    value: { name: 'read_file', args: { file_path: 'src/app.ts' }, callId: 'call_1' },
    timestamp: 650,
  },
  {
    type: 'tool_call_confirmation',
    value: { request: { callId: 'call_1', name: 'read_file' }, details: { type: 'info', title: 'Confirm: read_file' } },
    timestamp: 800,
  },
  {
    type: 'tool_call_response',
    value: { callId: 'call_1', name: 'read_file', resultDisplay: 'export default function App() { … }' },
    timestamp: 1100,
  },
  { type: 'content', value: '这是一个 React 组件文件…', timestamp: 1300 },
  { type: 'citation', value: 'Citations:\nhttps://react.dev/learn', timestamp: 1500 },
  { type: 'finished', value: { reason: 'STOP' }, timestamp: 1700 },
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
      addLog('🚀 client.sendMessageStream() 开始');
      addLog('  yield* processTurn() → turn.run()');
      setPhase('streaming');
      setCurrentEventIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const event = SAMPLE_EVENTS[currentEventIndex];
      if (!event) return;

      setEvents(prev => [...prev, event]);

      switch (event.type) {
        case 'content': {
          const text = typeof event.value === 'string' ? event.value : '';
          setStreamContent(prev => prev + text);
          addLog(`📝 content: "${text.slice(0, 30)}..."`);
          break;
        }

        case 'thought': {
          const thoughtText =
            typeof event.value === 'string'
              ? event.value
              : JSON.stringify(event.value);
          addLog(`💭 thought: "${thoughtText.slice(0, 60)}..."`);
          break;
        }

        case 'tool_call_request': {
          const toolCallText =
            typeof event.value === 'string'
              ? event.value
              : JSON.stringify(event.value);
          setPendingToolCalls(prev => [...prev, toolCallText]);
          setPhase('tool_execution');
          addLog(`⚡ tool_call_request: ${toolCallText}`);
          break;
        }

        case 'tool_call_confirmation': {
          setPhase('waiting_confirmation');
          addLog('🛡️ tool_call_confirmation: waiting for user decision');
          break;
        }

        case 'tool_call_response': {
          setPendingToolCalls([]);
          setPhase('streaming');
          addLog('📥 tool_call_response received');
          break;
        }

        case 'citation':
          addLog(`🔗 citation: ${String(event.value)}`);
          break;

        case 'finished':
          addLog(`🏁 finished: ${JSON.stringify(event.value)}`);
          break;

        case 'model_info':
          addLog(`🤖 model_info: ${String(event.value)}`);
          break;

        case 'chat_compressed':
          addLog('📦 chat_compressed');
          break;

        case 'context_window_will_overflow':
          addLog(`⚠️ context_window_will_overflow: ${JSON.stringify(event.value)}`);
          break;

        case 'invalid_stream':
          setPhase('error');
          addLog('⛔ invalid_stream');
          break;

        case 'max_session_turns':
          addLog('⏱️ max_session_turns');
          break;

        case 'loop_detected':
          addLog('🔁 loop_detected');
          break;

        case 'retry':
          setStreamContent('');
          setPendingToolCalls([]);
          addLog('🔄 retry: UI should discard partial content');
          break;

        case 'user_cancelled':
          setPhase('error');
          addLog('🚫 user_cancelled');
          break;

        case 'error':
          setPhase('error');
          addLog(`❌ error: ${JSON.stringify(event.value)}`);
          break;
      }

      setCurrentEventIndex(prev => prev + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIndex, addLog]);

  const getEventColor = (type: GeminiEventType) => {
    switch (type) {
      case 'content': return 'var(--terminal-green)';
      case 'thought': return '#a855f7';
      case 'tool_call_request': return 'var(--amber)';
      case 'tool_call_confirmation': return '#f59e0b';
      case 'tool_call_response': return 'var(--cyber-blue)';
      case 'finished': return 'var(--terminal-green)';
      case 'error': return '#ef4444';
      case 'retry': return 'var(--amber)';
      case 'citation': return 'var(--cyber-blue)';
      case 'chat_compressed': return '#6b7280';
      case 'loop_detected': return '#ef4444';
      case 'user_cancelled': return '#6b7280';
      case 'context_window_will_overflow': return '#f59e0b';
      case 'invalid_stream': return '#ef4444';
      case 'model_info': return 'var(--cyber-blue)';
      case 'max_session_turns': return '#6b7280';
    }
  };

  const getEventIcon = (type: GeminiEventType) => {
    switch (type) {
      case 'content': return '📝';
      case 'thought': return '💭';
      case 'tool_call_request': return '⚡';
      case 'tool_call_confirmation': return '🛡️';
      case 'tool_call_response': return '📥';
      case 'finished': return '🏁';
      case 'error': return '❌';
      case 'retry': return '🔄';
      case 'citation': return '🔗';
      case 'chat_compressed': return '📦';
      case 'loop_detected': return '🔁';
      case 'user_cancelled': return '🚫';
      case 'context_window_will_overflow': return '⚠️';
      case 'invalid_stream': return '⛔';
      case 'model_info': return '🤖';
      case 'max_session_turns': return '⏱️';
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
          {['model_info', 'content', 'thought', 'tool_call_request', 'tool_call_confirmation', 'tool_call_response', 'citation', 'finished', 'error', 'retry'].map((type) => (
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
                        {(typeof event.value === 'string'
                          ? event.value
                          : JSON.stringify(event.value) ?? String(event.value)
                        ).slice(0, 40)}...
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
                         phase === 'error' ? '#ef4444' :
                         phase === 'tool_execution' || phase === 'waiting_confirmation' ? 'var(--amber)' : 'var(--cyber-blue)'
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
              <div className="ml-4 text-[var(--muted)]">↓ tool_call_request</div>
              <div className={`flex items-center gap-2 ${phase === 'waiting_confirmation' ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'waiting_confirmation' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--muted)]/30'}`} />
                WAITING_CONFIRMATION
              </div>
              <div className="ml-4 text-[var(--muted)]">↓ tool_call_response</div>
              <div className={`flex items-center gap-2 ${phase === 'tool_execution' ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}`}>
                <span className={`w-2 h-2 rounded-full ${phase === 'tool_execution' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--muted)]/30'}`} />
                TOOL_EXECUTION
              </div>
              <div className="ml-4 text-[var(--muted)]">↓ finished</div>
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
          源码: client.ts / turn.ts（简化）
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`// packages/core/src/core/client.ts
yield { type: GeminiEventType.ModelInfo, value: modelToUse };
const resultStream = turn.run(modelConfigKey, request, signal);
for await (const event of resultStream) {
  yield event; // content / thought / tool_call_request / finished / ...
}

// packages/core/src/core/turn.ts
for await (const streamEvent of chat.sendMessageStream(...)) {
  if (streamEvent.type === StreamEventType.RETRY) {
    yield { type: GeminiEventType.Retry };
    continue;
  }
  const resp = streamEvent.value;
  if (resp has thought) yield { type: GeminiEventType.Thought, value: thoughtSummary };
  if (resp has text) yield { type: GeminiEventType.Content, value: text };
  if (resp has functionCalls) yield { type: GeminiEventType.ToolCallRequest, value: ToolCallRequestInfo };
  if (finishReason) yield { type: GeminiEventType.Finished, value: { reason, usageMetadata } };
}`}
        </pre>
      </div>
    </div>
  );
}
