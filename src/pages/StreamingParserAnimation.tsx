import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';
import { Layer } from '../components/Layer';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

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
    content: 'uments": {"file_path": "/use',
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

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" icon="🔬">
        <p className="text-[var(--text-secondary)] mb-6">
          流式解析器需要处理各种极端情况：不完整的 JSON、Unicode 字符、嵌套结构、
          并发流等。本节深入分析这些边界场景的正确处理方式。
        </p>

        {/* 边界条件 1: 不完整 JSON 处理 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-red-400 font-bold flex items-center gap-2">
              <span>1️⃣</span> 不完整 JSON 的自动修复
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              流式传输可能在任意位置中断，导致 JSON 不完整。解析器需要智能地补全缺失的部分。
            </p>
            <CodeBlock
              title="JSON 修复算法"
              code={`class JsonRepair {
    private unclosedBraces = 0;
    private unclosedBrackets = 0;
    private inString = false;
    private escapeNext = false;

    /**
     * 修复不完整的 JSON 字符串
     * 适用于流中断时的恢复
     */
    repair(incompleteJson: string): string {
        // 1. 分析当前状态
        this.analyze(incompleteJson);

        let repaired = incompleteJson;

        // 2. 如果在字符串中间中断，先关闭字符串
        if (this.inString) {
            repaired += '"';
        }

        // 3. 关闭所有未闭合的括号
        repaired += ']'.repeat(this.unclosedBrackets);
        repaired += '}'.repeat(this.unclosedBraces);

        return repaired;
    }

    private analyze(json: string): void {
        this.reset();

        for (const char of json) {
            if (this.escapeNext) {
                this.escapeNext = false;
                continue;
            }

            if (char === '\\\\' && this.inString) {
                this.escapeNext = true;
                continue;
            }

            if (char === '"') {
                this.inString = !this.inString;
                continue;
            }

            if (!this.inString) {
                switch (char) {
                    case '{': this.unclosedBraces++; break;
                    case '}': this.unclosedBraces--; break;
                    case '[': this.unclosedBrackets++; break;
                    case ']': this.unclosedBrackets--; break;
                }
            }
        }
    }

    private reset(): void {
        this.unclosedBraces = 0;
        this.unclosedBrackets = 0;
        this.inString = false;
        this.escapeNext = false;
    }
}

// 使用示例
const repair = new JsonRepair();

// 场景 1: 字符串中断
repair.repair('{"name": "read_fi')
// → '{"name": "read_fi"}'

// 场景 2: 嵌套对象未闭合
repair.repair('{"name": "replace", "args": {"file_path": "/src')
// → '{"name": "replace", "args": {"file_path": "/src"}}'

// 场景 3: 数组中断
repair.repair('{"files": ["/a", "/b')
// → '{"files": ["/a", "/b"]}'

// 场景 4: 复杂嵌套
repair.repair('{"a": {"b": [{"c": "val')
// → '{"a": {"b": [{"c": "val"}]}}'`}
            />
            <HighlightBox title="修复算法的局限性" icon="⚠️" variant="orange">
              <ul className="text-sm space-y-2">
                <li><strong>值类型猜测</strong>：无法区分 null/true/false/number 的中断</li>
                <li><strong>键值对不完整</strong>：{`{"key":`} 中断后无法确定值类型</li>
                <li><strong>转义序列中断</strong>："\u00 中断时无法确定完整字符</li>
                <li><strong>解决方案</strong>：等待更多数据或返回 partial 状态</li>
              </ul>
            </HighlightBox>
          </div>
        </div>

        {/* 边界条件 2: Unicode 和转义处理 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-amber-400 font-bold flex items-center gap-2">
              <span>2️⃣</span> Unicode 和转义序列处理
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              JSON 中的字符串可能包含各种转义序列和 Unicode 字符，必须正确处理以避免解析错误。
            </p>
            <CodeBlock
              title="转义序列状态机"
              code={`// 转义序列类型
type EscapeState =
    | 'normal'           // 正常状态
    | 'escape_start'     // 遇到 \\
    | 'unicode_1'        // \\u 后第 1 位
    | 'unicode_2'        // \\u 后第 2 位
    | 'unicode_3'        // \\u 后第 3 位
    | 'unicode_4';       // \\u 后第 4 位

class EscapeHandler {
    private state: EscapeState = 'normal';
    private unicodeBuffer = '';

    /**
     * 处理字符串内的字符
     * 返回是否消费了该字符（转义序列的一部分）
     */
    processChar(char: string): { consumed: boolean; char?: string } {
        switch (this.state) {
            case 'normal':
                if (char === '\\\\') {
                    this.state = 'escape_start';
                    return { consumed: true };
                }
                return { consumed: false };

            case 'escape_start':
                this.state = 'normal';
                switch (char) {
                    case 'n': return { consumed: true, char: '\\n' };
                    case 't': return { consumed: true, char: '\\t' };
                    case 'r': return { consumed: true, char: '\\r' };
                    case '"': return { consumed: true, char: '"' };
                    case '\\\\': return { consumed: true, char: '\\\\' };
                    case '/': return { consumed: true, char: '/' };
                    case 'b': return { consumed: true, char: '\\b' };
                    case 'f': return { consumed: true, char: '\\f' };
                    case 'u':
                        this.state = 'unicode_1';
                        this.unicodeBuffer = '';
                        return { consumed: true };
                    default:
                        // 无效转义，保持原样
                        return { consumed: true, char: '\\\\' + char };
                }

            case 'unicode_1':
            case 'unicode_2':
            case 'unicode_3':
                if (/[0-9a-fA-F]/.test(char)) {
                    this.unicodeBuffer += char;
                    this.state = this.nextUnicodeState();
                    return { consumed: true };
                }
                // 无效 Unicode，回退
                this.state = 'normal';
                return { consumed: false, char: '\\\\u' + this.unicodeBuffer };

            case 'unicode_4':
                if (/[0-9a-fA-F]/.test(char)) {
                    this.unicodeBuffer += char;
                    const codePoint = parseInt(this.unicodeBuffer, 16);
                    this.state = 'normal';
                    return { consumed: true, char: String.fromCharCode(codePoint) };
                }
                this.state = 'normal';
                return { consumed: false, char: '\\\\u' + this.unicodeBuffer };
        }
    }

    private nextUnicodeState(): EscapeState {
        const map: Record<EscapeState, EscapeState> = {
            'unicode_1': 'unicode_2',
            'unicode_2': 'unicode_3',
            'unicode_3': 'unicode_4',
            'unicode_4': 'normal',
            'normal': 'normal',
            'escape_start': 'normal'
        };
        return map[this.state];
    }

    // 检查是否在转义序列中间
    isInEscape(): boolean {
        return this.state !== 'normal';
    }
}

// 边界测试用例
const handler = new EscapeHandler();

// 正常转义
'\\n' → '\\n'
'\\t' → '\\t'
'\\"' → '"'

// Unicode 转义
'\\u0041' → 'A'
'\\u4e2d' → '中'
'\\u2764' → '❤'

// 流中断场景
'\\u00' + (中断) → 等待更多数据
'\\' + (中断) → 等待下一字符`}
            />
          </div>
        </div>

        {/* 边界条件 3: 并发工具调用 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-blue-400 font-bold flex items-center gap-2">
              <span>3️⃣</span> 并发工具调用的解析
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 可能同时发起多个工具调用，这些调用的数据块会交错到达。
              解析器需要正确地将它们分离。
            </p>
            <CodeBlock
              title="多工具调用解析"
              code={`/**
 * 处理并发工具调用
 * OpenAI 格式: 每个工具调用有独立的 index
 *
 * 流式数据示例:
 * {"index": 0, "function": {"name": "read_file", "arguments": "{\\"path\\":"}}
 * {"index": 1, "function": {"name": "glob", "arguments": "{\\"pattern\\":"}}
 * {"index": 0, "function": {"arguments": " \\"/src/main.ts\\"}"}}
 * {"index": 1, "function": {"arguments": " \\"*.ts\\"}"}}
 */

class MultiToolParser {
    // 每个 index 对应一个独立的解析上下文
    private contexts = new Map<number, ToolContext>();

    processChunk(chunk: StreamChunk): ToolCallEvent[] {
        const events: ToolCallEvent[] = [];

        for (const toolCall of chunk.tool_calls || []) {
            const { index, function: fn } = toolCall;

            // 获取或创建上下文
            let ctx = this.contexts.get(index);
            if (!ctx) {
                ctx = {
                    index,
                    name: '',
                    argumentsBuffer: '',
                    parser: new JsonParser()
                };
                this.contexts.set(index, ctx);
            }

            // 累积名称（可能分多次到达）
            if (fn.name) {
                ctx.name += fn.name;
            }

            // 累积参数
            if (fn.arguments) {
                ctx.argumentsBuffer += fn.arguments;

                // 尝试解析
                const result = ctx.parser.tryParse(ctx.argumentsBuffer);
                if (result.complete) {
                    events.push({
                        type: 'tool_call_complete',
                        index,
                        name: ctx.name,
                        arguments: result.value
                    });
                    this.contexts.delete(index);
                } else if (result.partial) {
                    events.push({
                        type: 'tool_call_progress',
                        index,
                        name: ctx.name,
                        partialArgs: result.partial
                    });
                }
            }
        }

        return events;
    }

    // 获取所有进行中的工具调用
    getInProgress(): number[] {
        return Array.from(this.contexts.keys());
    }

    // 强制完成（超时或流结束时）
    forceComplete(): ToolCallEvent[] {
        const events: ToolCallEvent[] = [];

        for (const [index, ctx] of this.contexts) {
            const repaired = new JsonRepair().repair(ctx.argumentsBuffer);
            try {
                events.push({
                    type: 'tool_call_complete',
                    index,
                    name: ctx.name,
                    arguments: JSON.parse(repaired),
                    repaired: true  // 标记为已修复
                });
            } catch {
                events.push({
                    type: 'tool_call_error',
                    index,
                    name: ctx.name,
                    error: 'Failed to parse arguments'
                });
            }
        }

        this.contexts.clear();
        return events;
    }
}`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">到达顺序</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">Index</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">内容</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">工具 0 缓冲区</th>
                    <th className="text-left py-2 px-3 text-[var(--text-muted)]">工具 1 缓冲区</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-secondary)] font-mono text-xs">
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">1</td>
                    <td className="py-2 px-3 text-cyan-400">0</td>
                    <td className="py-2 px-3">{"{"}"file_path":</td>
                    <td className="py-2 px-3 text-green-400">{"{"}"file_path":</td>
                    <td className="py-2 px-3 text-gray-500">-</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">2</td>
                    <td className="py-2 px-3 text-purple-400">1</td>
                    <td className="py-2 px-3">{"{"}"pattern":</td>
                    <td className="py-2 px-3 text-green-400">{"{"}"file_path":</td>
                    <td className="py-2 px-3 text-purple-400">{"{"}"pattern":</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]/50">
                    <td className="py-2 px-3">3</td>
                    <td className="py-2 px-3 text-cyan-400">0</td>
                    <td className="py-2 px-3">"/src/main.ts"{"}"}</td>
                    <td className="py-2 px-3 text-green-400">✓ 完成</td>
                    <td className="py-2 px-3 text-purple-400">{"{"}"pattern":</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">4</td>
                    <td className="py-2 px-3 text-purple-400">1</td>
                    <td className="py-2 px-3">"*.ts"{"}"}</td>
                    <td className="py-2 px-3 text-gray-500">-</td>
                    <td className="py-2 px-3 text-green-400">✓ 完成</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 边界条件 4: 超大参数和内存管理 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-purple-400 font-bold flex items-center gap-2">
              <span>4️⃣</span> 超大参数和内存控制
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              工具参数可能非常大（如包含完整文件内容的 write_file），需要设置限制防止内存耗尽。
            </p>
            <CodeBlock
              title="内存安全的流式解析"
              code={`class MemorySafeParser {
    // 限制配置
    private readonly MAX_BUFFER_SIZE = 10 * 1024 * 1024;  // 10MB
    private readonly MAX_STRING_LENGTH = 5 * 1024 * 1024;  // 5MB
    private readonly MAX_DEPTH = 50;  // 最大嵌套深度

    private buffer = '';
    private currentStringLength = 0;
    private depth = 0;

    processChunk(chunk: string): ParseResult {
        // 1. 检查缓冲区大小
        if (this.buffer.length + chunk.length > this.MAX_BUFFER_SIZE) {
            return {
                error: new BufferOverflowError(
                    \`Buffer would exceed \${this.MAX_BUFFER_SIZE} bytes\`
                ),
                recovery: 'truncate'  // 或 'abort'
            };
        }

        this.buffer += chunk;

        // 2. 逐字符处理
        for (let i = 0; i < chunk.length; i++) {
            const char = chunk[i];

            // 3. 检查嵌套深度
            if (!this.inString && char === '{' || char === '[') {
                this.depth++;
                if (this.depth > this.MAX_DEPTH) {
                    return {
                        error: new DepthOverflowError(
                            \`Nesting depth exceeds \${this.MAX_DEPTH}\`
                        ),
                        recovery: 'abort'
                    };
                }
            }

            // 4. 检查字符串长度
            if (this.inString) {
                this.currentStringLength++;
                if (this.currentStringLength > this.MAX_STRING_LENGTH) {
                    return {
                        error: new StringOverflowError(
                            \`String exceeds \${this.MAX_STRING_LENGTH} chars\`
                        ),
                        recovery: 'truncate_string'
                    };
                }
            } else if (char === '"') {
                // 字符串开始
                this.currentStringLength = 0;
            }

            // ... 正常解析逻辑
        }

        return { success: true };
    }

    // 内存使用估算
    getMemoryUsage(): MemoryStats {
        return {
            bufferSize: this.buffer.length,
            bufferUsage: this.buffer.length / this.MAX_BUFFER_SIZE,
            depth: this.depth,
            depthUsage: this.depth / this.MAX_DEPTH
        };
    }

    // 强制释放内存
    forceRelease(): void {
        this.buffer = '';
        this.depth = 0;
        this.currentStringLength = 0;
    }
}

// 流式处理超大文件内容
async function handleLargeContent(
    parser: MemorySafeParser,
    stream: AsyncIterable<string>
): Promise<void> {
    for await (const chunk of stream) {
        const result = parser.processChunk(chunk);

        if (result.error) {
            switch (result.recovery) {
                case 'truncate':
                    // 截断并继续
                    console.warn('Buffer truncated:', result.error.message);
                    break;
                case 'abort':
                    // 终止解析
                    throw result.error;
                case 'truncate_string':
                    // 截断当前字符串
                    console.warn('String truncated:', result.error.message);
                    break;
            }
        }

        // 检查内存压力
        const stats = parser.getMemoryUsage();
        if (stats.bufferUsage > 0.8) {
            console.warn('High memory usage:', stats);
        }
    }
}`}
            />
          </div>
        </div>

        {/* 边界条件总结 */}
        <HighlightBox title="边界条件处理速查表" icon="📋" variant="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">场景</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">问题</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">处理策略</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">流中断</td>
                  <td className="py-2 px-3">JSON 不完整</td>
                  <td className="py-2 px-3">自动补全括号 + 标记 repaired</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">转义中断</td>
                  <td className="py-2 px-3">\u00 等未完成</td>
                  <td className="py-2 px-3">保持状态，等待更多数据</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-blue-400">并发调用</td>
                  <td className="py-2 px-3">数据交错到达</td>
                  <td className="py-2 px-3">按 index 分离上下文</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-purple-400">超大参数</td>
                  <td className="py-2 px-3">内存溢出风险</td>
                  <td className="py-2 px-3">设置限制 + 截断或中止</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-green-400">深层嵌套</td>
                  <td className="py-2 px-3">栈溢出风险</td>
                  <td className="py-2 px-3">限制最大深度（50层）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" icon="🐛">
        <p className="text-[var(--text-secondary)] mb-6">
          流式解析是复杂的状态机，问题往往难以重现。本节提供系统化的调试方法和常见问题解决方案。
        </p>

        {/* 问题 1: 工具调用丢失 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-red-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
            <h4 className="text-red-400 font-bold">❌ 问题1: 工具调用丢失或不完整</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              AI 明显发起了工具调用，但解析器没有捕获或只捕获了部分。
            </p>
            <CodeBlock
              title="调试：记录原始流数据"
              code={`// 1. 启用详细日志
DEBUG=stream:* gemini

// 2. 捕获原始 SSE 数据
class DebugParser extends StreamingToolCallParser {
    private rawChunks: string[] = [];

    processChunk(chunk: string): void {
        // 记录原始数据
        this.rawChunks.push(chunk);
        console.log('[RAW]', JSON.stringify(chunk));

        // 记录解析状态
        console.log('[STATE]', {
            depth: this.depth,
            inString: this.inString,
            bufferLength: this.buffer.length
        });

        super.processChunk(chunk);
    }

    // 导出调试数据
    exportDebugData(): string {
        return JSON.stringify({
            chunks: this.rawChunks,
            finalBuffer: this.buffer,
            completedCalls: this.completedTools
        }, null, 2);
    }
}

// 3. 常见原因排查
const checkpoints = [
    '检查 depth 是否正确归零',
    '检查 inString 状态是否正确切换',
    '检查转义序列是否正确处理',
    '检查 chunk 边界是否切分了关键字符'
];`}
            />
            <HighlightBox title="常见原因" icon="🔍" variant="orange">
              <ul className="text-sm space-y-1">
                <li><strong>Chunk 边界切分</strong>：{"{"} 和 {"}"} 被分到不同 chunk</li>
                <li><strong>转义状态错误</strong>：\" 被错误识别为字符串结束</li>
                <li><strong>Unicode 中断</strong>：\u 序列被切分导致状态混乱</li>
                <li><strong>深度计算错误</strong>：字符串内的 {"{"} {"}"} 被误计入深度</li>
              </ul>
            </HighlightBox>
          </div>
        </div>

        {/* 问题 2: 解析卡住 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-amber-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/30">
            <h4 className="text-amber-400 font-bold">⚠️ 问题2: 解析器卡住不返回结果</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              解析器持续累积数据但从不输出完成的工具调用。
            </p>
            <CodeBlock
              title="诊断卡住问题"
              code={`class DiagnosticParser {
    private lastActivityTime = Date.now();
    private activityTimeout = 10000;  // 10秒无活动视为卡住

    processChunk(chunk: string): void {
        this.lastActivityTime = Date.now();

        // 检查是否应该已经完成
        const shouldBeComplete = this.depth === 0 && this.buffer.length > 0;
        if (shouldBeComplete) {
            console.warn('[STUCK?] depth=0 but buffer not empty:', {
                bufferPreview: this.buffer.slice(0, 100),
                inString: this.inString
            });
        }

        // 检查深度异常
        if (this.depth < 0) {
            console.error('[ERROR] Negative depth detected!', {
                depth: this.depth,
                chunk: chunk
            });
        }

        if (this.depth > 10) {
            console.warn('[DEEP] Unusually deep nesting:', this.depth);
        }
    }

    // 定期健康检查
    healthCheck(): HealthStatus {
        const idle = Date.now() - this.lastActivityTime;

        if (idle > this.activityTimeout && this.buffer.length > 0) {
            return {
                status: 'stuck',
                reason: 'No activity with non-empty buffer',
                buffer: this.buffer,
                suggestion: 'Force flush or reset'
            };
        }

        if (this.depth < 0) {
            return {
                status: 'corrupted',
                reason: 'Negative depth',
                suggestion: 'Reset parser state'
            };
        }

        return { status: 'healthy' };
    }

    // 强制重置
    forceReset(): void {
        console.warn('[RESET] Forcing parser reset');
        this.buffer = '';
        this.depth = 0;
        this.inString = false;
        this.escapeNext = false;
    }
}`}
            />
          </div>
        </div>

        {/* 问题 3: 参数解析错误 */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg border border-blue-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30">
            <h4 className="text-blue-400 font-bold">🔧 问题3: 工具参数解析为 null 或错误类型</h4>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">
              工具调用被检测到，但参数解析结果不正确。
            </p>
            <CodeBlock
              title="参数解析调试"
              code={`// 场景 1: 参数为空对象
// 原因: arguments 字段本身就是字符串，需要二次解析
{
    "name": "read_file",
    "arguments": "{\\"file_path\\": \\"/src/main.ts\\"}"  // 注意是字符串！
}

// 正确处理
const args = JSON.parse(toolCall.arguments);  // 二次解析

// 场景 2: 参数被截断
// 原因: 流中断 + 修复不完整
{
    "file_path": "/src/main.ts"  // 原本是 "/src/main.tsx"
}

// 检测方法
if (result.repaired) {
    console.warn('Arguments were repaired, may be incomplete');
}

// 场景 3: 类型转换错误
{
    "offset": "10",  // AI 发送了字符串而非数字
    "limit": null    // AI 发送了显式 null
}

// 健壮的类型处理
function parseArgs(raw: unknown): ParsedArgs {
    const args = typeof raw === 'string' ? JSON.parse(raw) : raw;

    return {
        path: String(args.path || ''),
        offset: parseInt(args.offset, 10) || 0,
        limit: args.limit != null ? parseInt(args.limit, 10) : undefined
    };
}`}
            />
          </div>
        </div>

        {/* 调试工具 */}
        <HighlightBox title="调试命令和工具" icon="🛠️" variant="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">工具/命令</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">用途</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=stream:raw gemini</code></td>
                  <td className="py-2 px-3">打印原始 SSE 数据</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=stream:parser gemini</code></td>
                  <td className="py-2 px-3">打印解析器状态变化</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">DEBUG=stream:tools gemini</code></td>
                  <td className="py-2 px-3">打印检测到的工具调用</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">STREAM_DUMP=1 gemini</code></td>
                  <td className="py-2 px-3">保存完整流数据到文件</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><code className="text-cyan-400 text-xs">gemini --replay stream.log</code></td>
                  <td className="py-2 px-3">回放保存的流数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" icon="⚡">
        <p className="text-[var(--text-secondary)] mb-6">
          流式解析是性能敏感的操作，直接影响用户感知的响应延迟。本节从多个维度分析优化策略。
        </p>

        {/* 优化 1: 字符处理优化 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-green-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-green-400 font-bold flex items-center gap-2">
              <span>1️⃣</span> 字符处理优化
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              逐字符处理是最大的性能瓶颈。以下是几种优化策略。
            </p>
            <CodeBlock
              title="批量字符处理"
              code={`// ❌ 慢：逐字符处理
class SlowParser {
    processChunk(chunk: string): void {
        for (const char of chunk) {
            this.processChar(char);  // 函数调用开销
        }
    }
}

// ✅ 快：使用正则批量跳过
class FastParser {
    // 预编译正则
    private static readonly SKIP_PATTERN = /[^{}\\[\\]"\\\\]+/g;
    private static readonly STRING_END = /[^"\\\\]*(?:\\\\.[^"\\\\]*)*/g;

    processChunk(chunk: string): void {
        let i = 0;

        while (i < chunk.length) {
            const char = chunk[i];

            if (!this.inString) {
                // 批量跳过普通字符
                if (this.isNormalChar(char)) {
                    FastParser.SKIP_PATTERN.lastIndex = i;
                    const match = FastParser.SKIP_PATTERN.exec(chunk);
                    if (match && match.index === i) {
                        i += match[0].length;
                        continue;
                    }
                }

                // 处理结构字符
                switch (char) {
                    case '{': this.depth++; break;
                    case '}': this.depth--; break;
                    case '"': this.inString = true; break;
                }
            } else {
                // 在字符串中，快速扫描到结束
                FastParser.STRING_END.lastIndex = i;
                const match = FastParser.STRING_END.exec(chunk);
                if (match) {
                    i += match[0].length;
                    if (i < chunk.length && chunk[i] === '"') {
                        this.inString = false;
                        i++;
                    }
                    continue;
                }
            }

            i++;
        }
    }

    private isNormalChar(char: string): boolean {
        // 不需要特殊处理的字符
        return char !== '{' && char !== '}' &&
               char !== '[' && char !== ']' &&
               char !== '"' && char !== '\\\\';
    }
}

// 性能对比 (10MB JSON)
// SlowParser: ~800ms
// FastParser: ~120ms (6.7x faster)`}
            />
          </div>
        </div>

        {/* 优化 2: 内存优化 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-blue-400 font-bold flex items-center gap-2">
              <span>2️⃣</span> 内存优化
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              字符串拼接是隐藏的内存杀手。使用数组累积可以显著减少 GC 压力。
            </p>
            <CodeBlock
              title="避免字符串拼接"
              code={`// ❌ 慢：字符串拼接
class SlowBuffering {
    private buffer = '';

    addChunk(chunk: string): void {
        // 每次拼接都会创建新字符串
        this.buffer += chunk;
        // O(n²) 复杂度！
    }
}

// ✅ 快：数组累积
class FastBuffering {
    private chunks: string[] = [];
    private totalLength = 0;

    addChunk(chunk: string): void {
        this.chunks.push(chunk);
        this.totalLength += chunk.length;
    }

    // 仅在需要时才合并
    getBuffer(): string {
        if (this.chunks.length === 1) {
            return this.chunks[0];
        }
        const result = this.chunks.join('');
        // 合并后重置为单个元素
        this.chunks = [result];
        return result;
    }

    // 清除时不创建新数组
    clear(): void {
        this.chunks.length = 0;
        this.totalLength = 0;
    }
}

// ✅ 更快：使用 Buffer（Node.js）
class BufferAccumulator {
    private buffers: Buffer[] = [];
    private totalLength = 0;

    addChunk(chunk: string): void {
        const buf = Buffer.from(chunk, 'utf-8');
        this.buffers.push(buf);
        this.totalLength += buf.length;
    }

    getBuffer(): Buffer {
        return Buffer.concat(this.buffers, this.totalLength);
    }

    getString(): string {
        return this.getBuffer().toString('utf-8');
    }
}

// 性能对比 (1000 chunks, 1KB each)
// String concatenation: ~150ms, 50MB peak memory
// Array join: ~20ms, 5MB peak memory
// Buffer concat: ~15ms, 3MB peak memory`}
            />
          </div>
        </div>

        {/* 优化 3: 早期输出 */}
        <div className="mb-8 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-transparent border-b border-[var(--border-subtle)]">
            <h4 className="text-purple-400 font-bold flex items-center gap-2">
              <span>3️⃣</span> 早期输出和渐进式解析
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[var(--text-secondary)] text-sm">
              不要等待完整解析，尽早输出部分结果可以改善用户体验。
            </p>
            <CodeBlock
              title="渐进式工具调用解析"
              code={`interface ProgressiveToolCall {
    id: string;
    name: string;           // 可能分多次到达
    status: 'parsing_name' | 'parsing_args' | 'complete';
    partialArgs?: unknown;  // 部分解析的参数
    completeArgs?: unknown; // 完整参数
}

class ProgressiveParser {
    private currentCall: ProgressiveToolCall | null = null;

    processChunk(chunk: string): ToolCallEvent[] {
        const events: ToolCallEvent[] = [];

        // 1. 检测工具调用开始
        if (!this.currentCall && this.detectToolStart(chunk)) {
            this.currentCall = {
                id: generateId(),
                name: '',
                status: 'parsing_name'
            };
            events.push({
                type: 'tool_call_started',
                id: this.currentCall.id
            });
        }

        if (!this.currentCall) return events;

        // 2. 解析名称（尽早通知 UI）
        if (this.currentCall.status === 'parsing_name') {
            const name = this.parsePartialName(chunk);
            if (name !== this.currentCall.name) {
                this.currentCall.name = name;
                events.push({
                    type: 'tool_name_update',
                    id: this.currentCall.id,
                    name: name
                });
            }

            if (this.isNameComplete()) {
                this.currentCall.status = 'parsing_args';
                events.push({
                    type: 'tool_name_complete',
                    id: this.currentCall.id,
                    name: this.currentCall.name
                });
            }
        }

        // 3. 渐进式参数解析
        if (this.currentCall.status === 'parsing_args') {
            const partial = this.parsePartialArgs();
            if (partial) {
                this.currentCall.partialArgs = partial;
                events.push({
                    type: 'tool_args_progress',
                    id: this.currentCall.id,
                    partial: partial
                });
            }

            if (this.isArgsComplete()) {
                this.currentCall.status = 'complete';
                this.currentCall.completeArgs = this.parseCompleteArgs();
                events.push({
                    type: 'tool_call_complete',
                    id: this.currentCall.id,
                    call: this.currentCall
                });
                this.currentCall = null;
            }
        }

        return events;
    }
}

// UI 可以立即响应
parser.on('tool_name_update', (event) => {
    ui.showToolIndicator(event.name);  // 立即显示工具名
});

parser.on('tool_args_progress', (event) => {
    ui.updateToolArgs(event.partial);  // 实时更新参数预览
});`}
            />
          </div>
        </div>

        {/* 性能基准 */}
        <HighlightBox title="性能基准" icon="📊" variant="green">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">场景</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">基线</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化后</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">提升</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">解析 1MB 响应</td>
                  <td className="py-2 px-3">80ms</td>
                  <td className="py-2 px-3">12ms</td>
                  <td className="py-2 px-3 text-green-400">6.7x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">首字节到工具名显示</td>
                  <td className="py-2 px-3">等待完成</td>
                  <td className="py-2 px-3">~50ms</td>
                  <td className="py-2 px-3 text-green-400">即时</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">内存峰值 (10MB)</td>
                  <td className="py-2 px-3">~50MB</td>
                  <td className="py-2 px-3">~12MB</td>
                  <td className="py-2 px-3 text-green-400">4x</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">GC 暂停</td>
                  <td className="py-2 px-3">频繁</td>
                  <td className="py-2 px-3">罕见</td>
                  <td className="py-2 px-3 text-green-400">显著改善</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" icon="🔗">
        <p className="text-[var(--text-secondary)] mb-6">
          流式解析器是连接 AI 响应和工具执行的关键桥梁。理解它与其他模块的交互有助于全局把握系统架构。
        </p>

        {/* 依赖关系图 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">数据流架构</h4>
          <MermaidDiagram chart={`graph LR
    subgraph Network["网络层"]
        SSE[SSE 连接<br/>Server-Sent Events]
    end

    subgraph Parser["解析层"]
        SP[StreamingParser<br/>流式解析器]
        JP[JsonParser<br/>JSON 解析]
        TR[ToolRecognizer<br/>工具识别]
    end

    subgraph Output["输出层"]
        TB[TextBuffer<br/>文本缓冲]
        TC[ToolCalls<br/>工具调用队列]
    end

    subgraph Execution["执行层"]
        TS[ToolScheduler<br/>工具调度器]
        UI[UI Renderer<br/>界面渲染]
    end

    SSE -->|"chunks"| SP
    SP -->|"text"| TB
    SP -->|"json"| JP
    JP -->|"tool_call"| TR
    TR -->|"validated"| TC

    TB -->|"stream"| UI
    TC -->|"execute"| TS
    TS -->|"result"| UI

    style Parser fill:#1a365d,stroke:#3182ce
    style Network fill:#2d3748,stroke:#718096
    style Output fill:#1a3a32,stroke:#48bb78
    style Execution fill:#744210,stroke:#d69e2e`} />
        </div>

        {/* 核心接口 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">核心接口契约</h4>
          <CodeBlock
            title="解析器输入输出接口"
            code={`// ==================== 输入接口 ====================

/**
 * SSE 事件格式
 */
interface SSEEvent {
    event?: string;        // 事件类型
    data: string;          // JSON 字符串
    id?: string;           // 事件 ID
    retry?: number;        // 重试间隔
}

/**
 * OpenAI 兼容的 chunk 格式
 */
interface StreamChunk {
    id: string;
    object: 'chat.completion.chunk';
    created: number;
    model: string;
    choices: {
        index: number;
        delta: {
            role?: 'assistant';
            content?: string;
            tool_calls?: ToolCallDelta[];
        };
        finish_reason: 'stop' | 'tool_calls' | null;
    }[];
}

interface ToolCallDelta {
    index: number;
    id?: string;           // 仅首次出现
    type?: 'function';     // 仅首次出现
    function: {
        name?: string;     // 可能分多次到达
        arguments?: string; // 增量参数
    };
}

// ==================== 输出接口 ====================

/**
 * 解析器输出事件
 */
type ParserEvent =
    | { type: 'text'; content: string }
    | { type: 'tool_start'; id: string; name: string }
    | { type: 'tool_args'; id: string; delta: string }
    | { type: 'tool_complete'; id: string; args: unknown }
    | { type: 'tool_error'; id: string; error: string }
    | { type: 'finish'; reason: string };

/**
 * 解析器状态快照（用于调试）
 */
interface ParserSnapshot {
    state: 'idle' | 'parsing_text' | 'parsing_tool';
    buffer: string;
    depth: number;
    inString: boolean;
    activeTools: Map<number, ToolContext>;
    completedTools: CompletedTool[];
}

// ==================== 与调度器的接口 ====================

/**
 * 传递给 ToolScheduler 的调用请求
 */
interface ToolCallRequest {
    id: string;
    name: string;
    arguments: unknown;
    metadata: {
        streamIndex: number;
        parseTime: number;
        repaired: boolean;
    };
}`}
          />
        </div>

        {/* 时序图 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">消息时序</h4>
          <MermaidDiagram chart={`sequenceDiagram
    participant API as AI API
    participant SSE as SSE Handler
    participant SP as StreamingParser
    participant UI as UI Renderer
    participant TS as ToolScheduler

    API->>SSE: data: {"choices":[{"delta":{"content":"Let me"}}]}
    SSE->>SP: processChunk("Let me")
    SP->>UI: emit('text', "Let me")
    UI->>UI: append to display

    API->>SSE: data: {"choices":[{"delta":{"tool_calls":[...]}}]}
    SSE->>SP: processChunk(toolCallDelta)
    SP->>SP: accumulate arguments

    Note over SP: 等待完整 JSON...

    API->>SSE: data: {"choices":[{"delta":{"tool_calls":[...]}}]}
    SSE->>SP: processChunk(moreDelta)
    SP->>SP: depth = 0, JSON complete!

    SP->>UI: emit('tool_complete', {name, args})
    UI->>UI: show tool indicator
    SP->>TS: scheduleToolCall(request)

    TS->>TS: validate & execute
    TS-->>SP: tool result
    SP->>API: continue with result`} />
        </div>

        {/* 错误传播 */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">错误处理和传播</h4>
          <CodeBlock
            title="错误处理链"
            code={`/**
 * 解析错误类型
 */
class ParseError extends Error {
    constructor(
        message: string,
        public readonly code: ParseErrorCode,
        public readonly recoverable: boolean,
        public readonly context?: unknown
    ) {
        super(message);
    }
}

enum ParseErrorCode {
    INVALID_JSON = 'INVALID_JSON',
    BUFFER_OVERFLOW = 'BUFFER_OVERFLOW',
    DEPTH_OVERFLOW = 'DEPTH_OVERFLOW',
    INVALID_ESCAPE = 'INVALID_ESCAPE',
    TIMEOUT = 'TIMEOUT',
    STREAM_ERROR = 'STREAM_ERROR'
}

/**
 * 错误恢复策略
 */
const errorHandlers: Record<ParseErrorCode, ErrorHandler> = {
    INVALID_JSON: async (error, parser) => {
        // 尝试修复 JSON
        const repaired = new JsonRepair().repair(parser.buffer);
        try {
            return JSON.parse(repaired);
        } catch {
            // 修复失败，跳过这个工具调用
            parser.reset();
            return null;
        }
    },

    BUFFER_OVERFLOW: async (error, parser) => {
        // 截断并继续
        parser.truncateBuffer();
        return { truncated: true };
    },

    DEPTH_OVERFLOW: async (error, parser) => {
        // 拒绝过深的嵌套
        parser.reset();
        throw new UserVisibleError('Tool arguments too complex');
    },

    TIMEOUT: async (error, parser) => {
        // 强制完成当前解析
        return parser.forceComplete();
    },

    STREAM_ERROR: async (error, parser) => {
        // 网络错误，尝试重连
        throw error;  // 向上传播
    }
};

/**
 * 使用错误处理
 */
async function safeProcess(
    parser: StreamingParser,
    chunk: string
): Promise<ParserEvent[]> {
    try {
        return parser.processChunk(chunk);
    } catch (error) {
        if (error instanceof ParseError && error.recoverable) {
            const handler = errorHandlers[error.code];
            const result = await handler(error, parser);
            if (result) {
                return [{ type: 'tool_complete', args: result }];
            }
            return [];
        }
        throw error;
    }
}`}
          />
        </div>

        {/* 配置影响 */}
        <HighlightBox title="配置对解析器的影响" icon="⚙️" variant="orange">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">配置项</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">默认值</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">影响</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">parser.maxBufferSize</code></td>
                  <td className="py-2 px-3">10MB</td>
                  <td className="py-2 px-3">超过时截断或报错</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">parser.maxDepth</code></td>
                  <td className="py-2 px-3">50</td>
                  <td className="py-2 px-3">防止栈溢出</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3"><code className="text-cyan-400">parser.timeout</code></td>
                  <td className="py-2 px-3">30s</td>
                  <td className="py-2 px-3">单个工具调用解析超时</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><code className="text-cyan-400">parser.autoRepair</code></td>
                  <td className="py-2 px-3">true</td>
                  <td className="py-2 px-3">自动修复不完整 JSON</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>
    </div>
  );
}
