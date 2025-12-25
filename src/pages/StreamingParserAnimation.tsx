import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 模拟流式数据块
interface StreamChunk {
  id: number;
  content: string;
  type: 'text' | 'tool_start' | 'tool_args' | 'tool_end';
  description: string;
}

// 解析器状态
interface ParserState {
  buffer: string;
  depth: number;
  inString: boolean;
  escapeNext: boolean;
  currentTool: {
    name: string;
    argsBuffer: string;
  } | null;
  completedTools: {
    name: string;
    args: string;
  }[];
}

// 模拟的流式数据块序列
const streamChunks: StreamChunk[] = [
  {
    id: 0,
    content: '我来帮你读取这个文件',
    type: 'text',
    description: '普通文本内容，直接输出',
  },
  {
    id: 1,
    content: '{"name": "read_',
    type: 'tool_start',
    description: '检测到 JSON 开始，记录深度 depth=1',
  },
  {
    id: 2,
    content: 'file", "arg',
    type: 'tool_args',
    description: '继续累积，name 完成: read_file',
  },
  {
    id: 3,
    content: 'uments": {"path": "/use',
    type: 'tool_args',
    description: '嵌套对象开始 depth=2，累积 arguments',
  },
  {
    id: 4,
    content: 'rs/test/package.j',
    type: 'tool_args',
    description: '路径字符串累积中...',
  },
  {
    id: 5,
    content: 'son"}}',
    type: 'tool_end',
    description: 'depth 归零，工具调用完成！',
  },
  {
    id: 6,
    content: '\n文件内容如下：',
    type: 'text',
    description: '继续处理后续文本',
  },
];

// 可视化解析器内部状态
function ParserStateVisual({ state }: { state: ParserState }) {
  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--cyber-blue)]">🔍</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">解析器状态</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        {/* 深度指示器 */}
        <div className="space-y-2">
          <div className="text-[var(--text-muted)]">JSON 深度 (depth)</div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((d) => (
              <div
                key={d}
                className={`w-8 h-8 rounded flex items-center justify-center border ${
                  d <= state.depth
                    ? d === state.depth
                      ? 'bg-[var(--terminal-green)] border-[var(--terminal-green)] text-[var(--bg-void)]'
                      : 'bg-[var(--terminal-green)]/30 border-[var(--terminal-green-dim)] text-[var(--terminal-green)]'
                    : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* 字符串状态 */}
        <div className="space-y-2">
          <div className="text-[var(--text-muted)]">字符串状态</div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded ${
                state.inString
                  ? 'bg-[var(--amber)]/20 border border-[var(--amber)] text-[var(--amber)]'
                  : 'bg-[var(--bg-void)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              inString: {state.inString ? 'true' : 'false'}
            </span>
            <span
              className={`px-3 py-1 rounded ${
                state.escapeNext
                  ? 'bg-[var(--purple)]/20 border border-[var(--purple)] text-[var(--purple)]'
                  : 'bg-[var(--bg-void)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              escape: {state.escapeNext ? 'true' : 'false'}
            </span>
          </div>
        </div>

        {/* 当前工具 */}
        <div className="col-span-2 space-y-2">
          <div className="text-[var(--text-muted)]">当前工具调用</div>
          {state.currentTool ? (
            <div className="p-3 bg-[var(--bg-void)] rounded border border-[var(--cyber-blue-dim)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--cyber-blue)]">⚡</span>
                <span className="text-[var(--cyber-blue)] font-bold">{state.currentTool.name || '解析中...'}</span>
              </div>
              <div className="text-[var(--text-muted)] break-all">
                args: <span className="text-[var(--terminal-green)]">{state.currentTool.argsBuffer || '{}'}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[var(--bg-void)] rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
              无活动工具调用
            </div>
          )}
        </div>

        {/* 已完成的工具 */}
        {state.completedTools.length > 0 && (
          <div className="col-span-2 space-y-2">
            <div className="text-[var(--text-muted)]">已完成的工具调用</div>
            <div className="space-y-2">
              {state.completedTools.map((tool, i) => (
                <div key={i} className="p-2 bg-[var(--terminal-green)]/10 rounded border border-[var(--terminal-green-dim)]">
                  <span className="text-[var(--terminal-green)]">✓ {tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 缓冲区可视化
function BufferVisual({ buffer, newContent }: { buffer: string; newContent: string }) {
  const displayBuffer = buffer.length > 60 ? '...' + buffer.slice(-57) : buffer;

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--amber)]">📦</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">累积缓冲区</span>
      </div>

      <div className="font-mono text-sm p-3 bg-[var(--bg-void)] rounded border border-[var(--border-subtle)] overflow-x-auto">
        <span className="text-[var(--text-muted)]">{displayBuffer}</span>
        <span className="text-[var(--terminal-green)] bg-[var(--terminal-green)]/20 px-1 rounded animate-pulse">
          {newContent}
        </span>
        <span className="text-[var(--cyber-blue)] animate-pulse">▋</span>
      </div>
    </div>
  );
}

// 流式数据块可视化
function ChunkVisual({
  chunks,
  currentIndex,
}: {
  chunks: StreamChunk[];
  currentIndex: number;
}) {
  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--purple)]">📡</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">流式数据块</span>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {chunks.map((chunk, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;

          return (
            <div
              key={chunk.id}
              className={`flex items-start gap-3 p-2 rounded transition-all duration-300 ${
                isActive
                  ? 'bg-[var(--cyber-blue)]/10 border border-[var(--cyber-blue)]'
                  : isPast
                  ? 'bg-[var(--bg-void)] opacity-50'
                  : 'bg-[var(--bg-void)] opacity-30'
              }`}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-mono">
                {isPast ? (
                  <span className="text-[var(--terminal-green)]">✓</span>
                ) : isActive ? (
                  <span className="text-[var(--cyber-blue)] animate-pulse">●</span>
                ) : (
                  <span className="text-[var(--text-muted)]">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-[var(--text-muted)] mb-1">
                  type:{' '}
                  <span
                    className={`${
                      chunk.type === 'text'
                        ? 'text-[var(--text-secondary)]'
                        : chunk.type === 'tool_start'
                        ? 'text-[var(--amber)]'
                        : chunk.type === 'tool_end'
                        ? 'text-[var(--terminal-green)]'
                        : 'text-[var(--cyber-blue)]'
                    }`}
                  >
                    {chunk.type}
                  </span>
                </div>
                <div className="font-mono text-sm text-[var(--text-primary)] break-all">
                  "{chunk.content}"
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StreamingParserAnimation() {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parserState, setParserState] = useState<ParserState>({
    buffer: '',
    depth: 0,
    inString: false,
    escapeNext: false,
    currentTool: null,
    completedTools: [],
  });

  // 模拟解析逻辑
  const processChunk = useCallback((chunk: StreamChunk, prevState: ParserState): ParserState => {
    const newState = { ...prevState };

    switch (chunk.type) {
      case 'text':
        // 文本直接输出，不影响解析状态
        break;

      case 'tool_start':
        newState.buffer = chunk.content;
        newState.depth = 1;
        newState.currentTool = { name: '', argsBuffer: '' };
        // 解析部分 name
        const nameMatch = chunk.content.match(/"name":\s*"([^"]*)/);
        if (nameMatch) {
          newState.currentTool.name = nameMatch[1];
        }
        break;

      case 'tool_args':
        newState.buffer = prevState.buffer + chunk.content;
        // 检查嵌套深度
        if (chunk.content.includes('{')) {
          newState.depth = 2;
        }
        // 继续解析 name
        if (newState.currentTool && !newState.currentTool.name.includes('file')) {
          const fullNameMatch = newState.buffer.match(/"name":\s*"([^"]+)"/);
          if (fullNameMatch) {
            newState.currentTool.name = fullNameMatch[1];
          }
        }
        // 累积 arguments
        if (newState.currentTool) {
          const argsMatch = newState.buffer.match(/"arguments":\s*(\{[^]*)/);
          if (argsMatch) {
            newState.currentTool.argsBuffer = argsMatch[1];
            newState.inString = argsMatch[1].includes('"') && !argsMatch[1].endsWith('"}');
          }
        }
        break;

      case 'tool_end':
        newState.buffer = prevState.buffer + chunk.content;
        newState.depth = 0;
        newState.inString = false;
        if (newState.currentTool) {
          const argsMatch = newState.buffer.match(/"arguments":\s*(\{[^}]+\})/);
          if (argsMatch) {
            newState.currentTool.argsBuffer = argsMatch[1];
          }
          newState.completedTools = [
            ...prevState.completedTools,
            {
              name: newState.currentTool.name,
              args: newState.currentTool.argsBuffer,
            },
          ];
          newState.currentTool = null;
          newState.buffer = '';
        }
        break;
    }

    return newState;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentChunkIndex >= streamChunks.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextIndex = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIndex);
      setParserState((prev) => processChunk(streamChunks[nextIndex], prev));
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentChunkIndex, processChunk]);

  const play = useCallback(() => {
    setCurrentChunkIndex(-1);
    setParserState({
      buffer: '',
      depth: 0,
      inString: false,
      escapeNext: false,
      currentTool: null,
      completedTools: [],
    });
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    if (currentChunkIndex < streamChunks.length - 1) {
      const nextIndex = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIndex);
      setParserState((prev) => processChunk(streamChunks[nextIndex], prev));
    } else {
      setCurrentChunkIndex(-1);
      setParserState({
        buffer: '',
        depth: 0,
        inString: false,
        escapeNext: false,
        currentTool: null,
        completedTools: [],
      });
    }
  }, [currentChunkIndex, processChunk]);

  const reset = useCallback(() => {
    setCurrentChunkIndex(-1);
    setIsPlaying(false);
    setParserState({
      buffer: '',
      depth: 0,
      inString: false,
      escapeNext: false,
      currentTool: null,
      completedTools: [],
    });
  }, []);

  const currentChunk = currentChunkIndex >= 0 ? streamChunks[currentChunkIndex] : null;

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--purple)] via-[var(--cyber-blue)] to-[var(--terminal-green)]" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--cyber-blue)]">📡</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
          StreamingToolCallParser 流式解析
        </h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // 展示如何从流式 SSE 响应中实时解析工具调用
        <br />
        // 源码位置: packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts
      </p>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放解析过程
        </button>
        <button
          onClick={stepForward}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 下一个块
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Stream chunks */}
        <ChunkVisual chunks={streamChunks} currentIndex={currentChunkIndex} />

        {/* Right: Parser state */}
        <ParserStateVisual state={parserState} />
      </div>

      {/* Buffer visualization */}
      <BufferVisual
        buffer={parserState.buffer}
        newContent={currentChunk?.content || ''}
      />

      {/* Current chunk description */}
      <div className="mt-6 p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[var(--terminal-green)] font-mono">$</span>
          <span className="text-[var(--text-secondary)] font-mono">
            当前块：
            <span className="text-[var(--terminal-green)] font-bold">
              {currentChunkIndex + 1}
            </span>
            /{streamChunks.length}
          </span>
          {isPlaying && (
            <span className="text-[var(--amber)] font-mono text-sm animate-pulse">
              ● 处理中...
            </span>
          )}
        </div>
        <div className="font-mono text-sm text-[var(--text-primary)] pl-6">
          {currentChunk?.description || '$ 点击播放开始解析演示'}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--purple)] via-[var(--cyber-blue)] to-[var(--terminal-green)] transition-all duration-300"
            style={{ width: `${((currentChunkIndex + 1) / streamChunks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Code explanation */}
      <div className="mt-6 bg-[var(--bg-void)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center gap-2">
          <span className="text-[var(--terminal-green)]">$</span>
          <span className="text-xs font-mono text-[var(--text-muted)]">核心解析逻辑</span>
        </div>
        <div className="p-4">
          <JsonBlock
            code={`// streamingToolCallParser.ts - 核心状态追踪

class StreamingToolCallParser {
  private depth = 0;           // JSON 嵌套深度
  private inString = false;    // 是否在字符串内
  private escapeNext = false;  // 下一字符是否转义

  processChar(char: string): void {
    if (this.escapeNext) {
      this.escapeNext = false;
      return;
    }

    if (char === '\\\\' && this.inString) {
      this.escapeNext = true;
      return;
    }

    if (char === '"') {
      this.inString = !this.inString;
      return;
    }

    if (!this.inString) {
      if (char === '{') this.depth++;
      if (char === '}') this.depth--;

      // depth 归零表示完整 JSON 对象完成
      if (this.depth === 0 && this.buffer.length > 0) {
        this.emitToolCall(this.parseBuffer());
      }
    }
  }
}`}
          />
        </div>
      </div>

      {/* Key challenges section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--amber-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--amber)]">⚠️</span>
            <span className="text-sm font-mono font-bold text-[var(--amber)]">索引冲突处理</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            多个工具调用可能共享同一索引，需要通过缓冲区隔离
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--purple-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--purple)]">🔧</span>
            <span className="text-sm font-mono font-bold text-[var(--purple)]">不完整 JSON 修复</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            流中断时自动补全括号，确保解析不会失败
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--cyber-blue-dim)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--cyber-blue)]">📊</span>
            <span className="text-sm font-mono font-bold text-[var(--cyber-blue)]">转义序列追踪</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            正确处理 \\" \\\\ 等转义，避免错误计算深度
          </p>
        </div>
      </div>
    </div>
  );
}
