// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { HighlightBox } from '../components/HighlightBox';

/**
 * 流式响应解码器动画
 *
 * （fork-only）可视化 OpenAI-compatible SSE chunk 解析和工具调用重组流程
 * 源码: packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts
 *
 * 核心功能:
 * - addChunk() - 添加流式块
 * - JSON 深度追踪 (depth, inString, escape)
 * - 索引碰撞检测 (idToIndexMap)
 * - 自动修复未闭合字符串
 */

interface StreamChunk {
  id: string;
  index: number;
  content: string;
  toolCallId?: string;
  functionName?: string;
  timestamp: number;
}

interface ParserState {
  buffer: string;
  depth: number;
  inString: boolean;
  escape: boolean;
  complete: boolean;
  repaired: boolean;
}

interface ToolCallBuffer {
  index: number;
  id?: string;
  name?: string;
  state: ParserState;
}

const SAMPLE_CHUNKS: StreamChunk[] = [
  { id: 'c1', index: 0, content: '{"', toolCallId: 'call_123', functionName: 'Read', timestamp: 0 },
  { id: 'c2', index: 0, content: 'file_path": "', timestamp: 100 },
  { id: 'c3', index: 0, content: '/src/app.ts"', timestamp: 200 },
  { id: 'c4', index: 0, content: ', "encoding": "utf-8"', timestamp: 300 },
  { id: 'c5', index: 0, content: '}', timestamp: 400 },
  { id: 'c6', index: 1, content: '{"command": "', toolCallId: 'call_456', functionName: 'Bash', timestamp: 500 },
  { id: 'c7', index: 1, content: 'npm test', timestamp: 600 },
  { id: 'c8', index: 1, content: '"}', timestamp: 700 },
];

export default function StreamingDecoderAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [buffers, setBuffers] = useState<Map<number, ToolCallBuffer>>(new Map());
  const [completedCalls, setCompletedCalls] = useState<Array<{ id: string; name: string; args: object }>>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeChunk, setActiveChunk] = useState<StreamChunk | null>(null);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setCurrentChunkIndex(-1);
    setBuffers(new Map());
    setCompletedCalls([]);
    setLogs([]);
    setActiveChunk(null);
    setIsPlaying(false);
  }, []);

  // 模拟 JSON 深度追踪
  const trackJsonDepth = (buffer: string, newChunk: string): ParserState => {
    let depth = 0;
    let inString = false;
    let escape = false;
    const fullBuffer = buffer + newChunk;

    for (const char of fullBuffer) {
      if (!inString) {
        if (char === '{' || char === '[') depth++;
        else if (char === '}' || char === ']') depth--;
      }
      if (char === '"' && !escape) inString = !inString;
      escape = char === '\\' && !escape;
    }

    let complete = false;
    let repaired = false;

    if (depth === 0 && fullBuffer.trim().length > 0) {
      try {
        JSON.parse(fullBuffer);
        complete = true;
      } catch {
        if (inString) {
          try {
            JSON.parse(fullBuffer + '"');
            complete = true;
            repaired = true;
          } catch {}
        }
      }
    }

    return { buffer: fullBuffer, depth, inString, escape, complete, repaired };
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (currentChunkIndex >= SAMPLE_CHUNKS.length) {
      addLog('✅ 流式解析完成');
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const chunk = SAMPLE_CHUNKS[currentChunkIndex];
      if (!chunk) return;

      setActiveChunk(chunk);

      // 获取或创建 buffer
      const existingBuffer = buffers.get(chunk.index);
      const currentBuffer = existingBuffer?.state.buffer || '';
      const newState = trackJsonDepth(currentBuffer, chunk.content);

      const updatedBuffer: ToolCallBuffer = {
        index: chunk.index,
        id: chunk.toolCallId || existingBuffer?.id,
        name: chunk.functionName || existingBuffer?.name,
        state: newState,
      };

      setBuffers(prev => {
        const updated = new Map(prev);
        updated.set(chunk.index, updatedBuffer);
        return updated;
      });

      // 日志
      if (chunk.toolCallId) {
        addLog(`📥 新工具调用 [${chunk.index}]: ${chunk.functionName} (${chunk.toolCallId})`);
      } else {
        addLog(`  + chunk: "${chunk.content.slice(0, 20)}${chunk.content.length > 20 ? '...' : ''}" depth=${newState.depth}`);
      }

      // 检查是否完成
      if (newState.complete) {
        try {
          const args = JSON.parse(newState.repaired ? newState.buffer + '"' : newState.buffer);
          setCompletedCalls(prev => [...prev, {
            id: updatedBuffer.id || `call_${chunk.index}`,
            name: updatedBuffer.name || 'unknown',
            args,
          }]);
          addLog(`  ✓ JSON 解析完成${newState.repaired ? ' (auto-repaired)' : ''}`);
        } catch {}
      }

      setCurrentChunkIndex(prev => prev + 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlaying, currentChunkIndex, buffers, addLog]);

  const getDepthColor = (depth: number) => {
    if (depth === 0) return 'var(--terminal-green)';
    if (depth <= 2) return 'var(--cyber-blue)';
    if (depth <= 4) return 'var(--amber)';
    return '#ef4444';
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            流式响应解码器
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            StreamingToolCallParser - SSE chunk 解析与工具调用重组
          </p>
        </div>
        <button
          onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => { setCurrentChunkIndex(0); setIsPlaying(true); }, 100))}
          className={`px-4 py-2 rounded font-mono text-sm transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
          }`}
        >
          {isPlaying ? '⏹ 停止' : '▶ 开始'}
        </button>
      </div>

      <HighlightBox title="🧭 fork-only 提示" icon="⚠️" variant="yellow">
        <p className="m-0 text-sm text-[var(--text-secondary)]">
          上游 Gemini CLI 的主线不会解析 SSE 文本流或 <code>tool_calls</code> 增量 JSON；它直接消费结构化 <code>functionCalls</code>。
          本动画用于解释当 fork 通过 OpenAI 兼容协议接入其他模型时，为何需要这类“流式拼接/修复”解析器。
        </p>
      </HighlightBox>

      <div className="grid grid-cols-12 gap-6">
        {/* SSE 流 */}
        <div className="col-span-3">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              📡 SSE Stream
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {SAMPLE_CHUNKS.map((chunk, i) => (
                <div
                  key={chunk.id}
                  className={`p-2 rounded border text-xs font-mono transition-all ${
                    i === currentChunkIndex
                      ? 'bg-[var(--terminal-green)]/20 border-[var(--terminal-green)] animate-pulse'
                      : i < currentChunkIndex
                      ? 'bg-[var(--bg-tertiary)] border-[var(--border)] opacity-50'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--muted)]">idx:{chunk.index}</span>
                    {chunk.functionName && (
                      <span className="text-[var(--amber)]">{chunk.functionName}</span>
                    )}
                  </div>
                  <div className="text-[var(--text-secondary)] truncate">
                    {chunk.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 解析器状态 */}
        <div className="col-span-5">
          <div className="bg-black/60 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              🔧 Parser State (per index)
            </h3>
            <div className="space-y-4">
              {Array.from(buffers.entries()).map(([index, buf]) => (
                <div
                  key={index}
                  className={`p-3 rounded border transition-all ${
                    buf.state.complete
                      ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-[var(--text-primary)]">
                      Index {index}: {buf.name || '...'}
                    </span>
                    {buf.state.complete && (
                      <span className="text-xs text-[var(--terminal-green)]">✓ complete</span>
                    )}
                  </div>

                  {/* 状态指示器 */}
                  <div className="flex gap-4 mb-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--muted)]">depth:</span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: getDepthColor(buf.state.depth) }}
                      >
                        {buf.state.depth}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--muted)]">inString:</span>
                      <span className={buf.state.inString ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}>
                        {buf.state.inString ? 'true' : 'false'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--muted)]">escape:</span>
                      <span className={buf.state.escape ? 'text-red-400' : 'text-[var(--muted)]'}>
                        {buf.state.escape ? 'true' : 'false'}
                      </span>
                    </div>
                  </div>

                  {/* Buffer 内容 */}
                  <div className="bg-black/40 rounded p-2 text-xs font-mono text-[var(--text-secondary)] max-h-20 overflow-y-auto">
                    <span className="text-[var(--muted)]">buffer: </span>
                    {buf.state.buffer}
                  </div>

                  {/* 深度可视化 */}
                  <div className="mt-2 h-1 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(buf.state.depth * 25, 100)}%`,
                        backgroundColor: getDepthColor(buf.state.depth)
                      }}
                    />
                  </div>
                </div>
              ))}

              {buffers.size === 0 && (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待流式数据...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 完成的工具调用 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--terminal-green)] mb-3 font-mono">
              ✅ Completed Tool Calls
            </h3>
            <div className="space-y-3">
              {completedCalls.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待解析完成...
                </div>
              ) : (
                completedCalls.map((call, i) => (
                  <div
                    key={i}
                    className="p-3 rounded border bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-[var(--terminal-green)]">
                        {call.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{call.id}</span>
                    </div>
                    <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
                      {JSON.stringify(call.args, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 日志 */}
      <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">Parse Log</h3>
        <div className="space-y-1 text-xs font-mono h-28 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-[var(--muted)]">等待开始...</div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                  log.includes('📥') ? 'text-[var(--cyber-blue)]' :
                  log.includes('depth=0') ? 'text-[var(--terminal-green)]' :
                  'text-[var(--muted)]'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: streamingToolCallParser.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`class StreamingToolCallParser {
  private buffers: Map<number, string> = new Map();
  private depths: Map<number, number> = new Map();
  private inStrings: Map<number, boolean> = new Map();
  private escapes: Map<number, boolean> = new Map();
  private idToIndexMap: Map<string, number> = new Map(); // 碰撞检测

  addChunk(index: number, chunk: string, id?: string, name?: string): ToolCallParseResult {
    // 1. 处理索引碰撞 (同一 index 不同 id)
    // 2. 追踪 JSON 嵌套深度
    // 3. 检测字符串边界和转义
    // 4. depth === 0 时尝试解析
    // 5. 自动修复未闭合字符串
  }
}`}
        </pre>
      </div>
    </div>
  );
}
