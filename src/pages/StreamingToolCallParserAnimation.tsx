import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 解析器状态类型
type ParserPhase =
  | 'init'
  | 'receive_chunk'
  | 'detect_collision'
  | 'track_depth'
  | 'check_string'
  | 'buffer_accumulate'
  | 'attempt_parse'
  | 'auto_repair'
  | 'safe_parse'
  | 'emit_result'
  | 'complete';

// Buffer 状态
interface BufferState {
  index: number;
  content: string;
  depth: number;
  inString: boolean;
  escapes: number;
  toolId: string | null;
}

// 解析步骤定义
interface ParseStep {
  phase: ParserPhase;
  title: string;
  description: string;
  bufferStates: BufferState[];
  codeSnippet: string;
  highlight?: string;
}

// 完整解析流程
const parseSequence: ParseStep[] = [
  {
    phase: 'init',
    title: '初始化 StreamingToolCallParser',
    description: '创建多 buffer 状态追踪器，准备处理并发工具调用',
    bufferStates: [],
    codeSnippet: `// streamingToolCallParser.ts:15-35
class StreamingToolCallParser {
  private buffers: Map<number, string> = new Map();
  private depths: Map<number, number> = new Map();
  private inStrings: Map<number, boolean> = new Map();
  private escapes: Map<number, number> = new Map();
  private idToIndexMap: Map<string, number> = new Map();
  private nextAvailableIndex = 0;

  constructor() {
    // 每个工具调用索引独立追踪
    // 支持并发多个工具调用流
  }
}`,
  },
  {
    phase: 'receive_chunk',
    title: '接收 OpenAI 流式 Chunk',
    description: 'API 返回不一致的 chunk：可能是空字符串、部分 JSON、或完整对象',
    bufferStates: [
      { index: 0, content: '{"na', depth: 0, inString: false, escapes: 0, toolId: 'call_abc123' },
    ],
    codeSnippet: `// 接收到的 chunk 示例
chunk.choices[0].delta = {
  tool_calls: [{
    index: 0,
    id: "call_abc123",
    function: {
      name: "read_file",
      arguments: '{"na'  // 部分 JSON!
    }
  }]
}

// 问题：arguments 是流式的字符串片段
// 可能在任何位置被切断`,
    highlight: '部分 JSON 需要累积',
  },
  {
    phase: 'detect_collision',
    title: '检测索引碰撞',
    description: '当相同索引被不同 ID 的工具调用重用时，分配新索引',
    bufferStates: [
      { index: 0, content: '{"name":"foo.txt"}', depth: 0, inString: false, escapes: 0, toolId: 'call_abc123' },
      { index: 1, content: '{"pat', depth: 0, inString: false, escapes: 0, toolId: 'call_def456' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:45-65
handleChunk(chunk: ToolCallChunk): void {
  const { index, id } = chunk;

  // 碰撞检测：相同 index 但不同 id
  if (this.idToIndexMap.has(id)) {
    // 已知 ID，使用映射的索引
    const mappedIndex = this.idToIndexMap.get(id)!;
    this.processArguments(mappedIndex, chunk);
  } else if (this.buffers.has(index)) {
    // 索引碰撞！分配新索引
    const newIndex = this.nextAvailableIndex++;
    this.idToIndexMap.set(id, newIndex);
    this.initBuffer(newIndex);
    this.processArguments(newIndex, chunk);
  } else {
    // 新的工具调用
    this.idToIndexMap.set(id, index);
    this.initBuffer(index);
  }
}`,
    highlight: '碰撞检测与恢复',
  },
  {
    phase: 'track_depth',
    title: '追踪 JSON 嵌套深度',
    description: '跟踪 { } 和 [ ] 的嵌套层级，只在深度为 0 时尝试解析',
    bufferStates: [
      { index: 0, content: '{"name":"foo.txt","options":{"recursive":', depth: 2, inString: false, escapes: 0, toolId: 'call_abc123' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:80-110
processCharacter(index: number, char: string): void {
  const inStr = this.inStrings.get(index)!;
  const escaped = this.escapes.get(index)! > 0;

  if (!inStr && !escaped) {
    switch (char) {
      case '{':
      case '[':
        this.depths.set(index, this.depths.get(index)! + 1);
        break;
      case '}':
      case ']':
        this.depths.set(index, this.depths.get(index)! - 1);
        break;
      case '"':
        this.inStrings.set(index, true);
        break;
    }
  }

  // 追踪转义字符
  if (char === '\\\\' && !escaped) {
    this.escapes.set(index, 1);
  } else {
    this.escapes.set(index, 0);
  }
}`,
    highlight: 'depth: 2 (嵌套对象)',
  },
  {
    phase: 'check_string',
    title: '检查字符串状态',
    description: '追踪是否在字符串字面量内，避免误判 { } 字符',
    bufferStates: [
      { index: 0, content: '{"path":"/home/{user}/file', depth: 1, inString: true, escapes: 0, toolId: 'call_abc123' },
    ],
    codeSnippet: `// 字符串内的 { 不应影响深度计数
const content = '{"path": "/home/{user}/file.txt"}';
//                            ^^^^^
//                     这里的 { } 是字符串内容！

// 状态追踪
{
  buffer: '{"path":"/home/{user}/file',
  depth: 1,       // 只有外层 { 计入
  inString: true, // 当前在字符串内
  escapes: 0      // 无转义
}

// 遇到下一个 " 时退出字符串模式
if (char === '"' && !escaped) {
  this.inStrings.set(index, !inString);
}`,
    highlight: '字符串内 { } 不计入深度',
  },
  {
    phase: 'buffer_accumulate',
    title: 'Buffer 累积',
    description: '持续累积字符直到 depth 回到 0',
    bufferStates: [
      { index: 0, content: '{"name":"foo.txt","recursive":true}', depth: 0, inString: false, escapes: 0, toolId: 'call_abc123' },
      { index: 1, content: '{"pattern":"*.ts","case', depth: 1, inString: false, escapes: 0, toolId: 'call_def456' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:120-135
appendToBuffer(index: number, content: string): void {
  const current = this.buffers.get(index) || '';
  this.buffers.set(index, current + content);

  // 逐字符处理更新状态
  for (const char of content) {
    this.processCharacter(index, char);
  }

  // 检查是否可以尝试解析
  const depth = this.depths.get(index)!;
  const buffer = this.buffers.get(index)!;

  if (depth === 0 && buffer.length > 0) {
    this.attemptParse(index);
  }
}`,
    highlight: 'index 0: depth=0 可解析',
  },
  {
    phase: 'attempt_parse',
    title: '尝试标准 JSON 解析',
    description: '深度为 0 时尝试 JSON.parse()，可能失败',
    bufferStates: [
      { index: 0, content: '{"name":"foo.txt","recursive":true}', depth: 0, inString: false, escapes: 0, toolId: 'call_abc123' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:140-160
attemptParse(index: number): ParseResult | null {
  const buffer = this.buffers.get(index)!;

  // 策略 1: 标准 JSON.parse
  try {
    const parsed = JSON.parse(buffer);
    return { success: true, data: parsed };
  } catch (e) {
    // 解析失败，尝试修复
    return this.attemptRepair(index, buffer);
  }
}

// 成功！
JSON.parse('{"name":"foo.txt","recursive":true}')
// → { name: "foo.txt", recursive: true }`,
    highlight: '解析成功',
  },
  {
    phase: 'auto_repair',
    title: '自动修复机制',
    description: '检测到 inString=true 时自动闭合引号重试',
    bufferStates: [
      { index: 1, content: '{"pattern":"*.ts","caseSensitive', depth: 1, inString: true, escapes: 0, toolId: 'call_def456' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:165-190
attemptRepair(index: number, buffer: string): ParseResult | null {
  const inString = this.inStrings.get(index)!;
  const depth = this.depths.get(index)!;

  // 修复策略 1: 闭合未闭合的字符串
  if (inString) {
    const repaired = buffer + '"';
    try {
      const parsed = JSON.parse(repaired + '}'.repeat(depth));
      return {
        success: true,
        data: parsed,
        repaired: true
      };
    } catch (e) {
      // 继续尝试其他策略
    }
  }

  // 修复策略 2: 补全缺失的括号
  if (depth > 0) {
    const repaired = buffer + '}'.repeat(depth);
    // ...
  }

  return this.safeJsonParse(buffer);
}`,
    highlight: '自动闭合字符串',
  },
  {
    phase: 'safe_parse',
    title: '安全降级解析',
    description: '使用宽松的 JSON 解析器处理边缘情况',
    bufferStates: [
      { index: 1, content: '{"pattern":"*.ts"}', depth: 0, inString: false, escapes: 0, toolId: 'call_def456' },
    ],
    codeSnippet: `// streamingToolCallParser.ts:200-220
safeJsonParse(buffer: string): ParseResult | null {
  // 降级策略 1: 移除尾部不完整内容
  const trimmed = buffer.replace(/,[^,}\\]]*$/, '');

  try {
    // 尝试自动闭合
    let attempt = trimmed;
    const openBraces = (attempt.match(/{/g) || []).length;
    const closeBraces = (attempt.match(/}/g) || []).length;
    attempt += '}'.repeat(openBraces - closeBraces);

    return {
      success: true,
      data: JSON.parse(attempt),
      partial: true
    };
  } catch (e) {
    // 最终降级: 返回原始字符串
    return {
      success: false,
      raw: buffer
    };
  }
}`,
    highlight: '宽松解析 + 自动闭合',
  },
  {
    phase: 'emit_result',
    title: '发射解析结果',
    description: '将解析成功的工具调用参数发送给调度器',
    bufferStates: [
      { index: 0, content: '✓ 已解析', depth: 0, inString: false, escapes: 0, toolId: 'call_abc123' },
      { index: 1, content: '✓ 已解析', depth: 0, inString: false, escapes: 0, toolId: 'call_def456' },
    ],
    codeSnippet: `// 解析结果
[
  {
    toolCallId: "call_abc123",
    name: "read_file",
    arguments: { name: "foo.txt", recursive: true }
  },
  {
    toolCallId: "call_def456",
    name: "grep",
    arguments: { pattern: "*.ts" }
  }
]

// 发射到工具调度器
this.emit('toolCallParsed', parsedCalls);`,
    highlight: '双工具调用成功解析',
  },
  {
    phase: 'complete',
    title: '解析完成',
    description: '所有并发工具调用 buffer 清空，准备下一批',
    bufferStates: [],
    codeSnippet: `// 清理状态
this.buffers.clear();
this.depths.clear();
this.inStrings.clear();
this.escapes.clear();
// 保留 idToIndexMap 用于后续调用

// 流式解析的关键优势：
// 1. 处理不完整 JSON 片段
// 2. 支持并发多工具调用
// 3. 自动碰撞检测与恢复
// 4. 多层降级解析策略`,
    highlight: '流式解析完成',
  },
];

// 单个 Buffer 可视化组件
function BufferVisualizer({
  buffer,
  isActive
}: {
  buffer: BufferState;
  isActive: boolean;
}) {
  const getDepthColor = (depth: number) => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    return colors[Math.min(depth, colors.length - 1)];
  };

  return (
    <div
      className={`
        rounded-lg p-4 border-2 transition-all duration-300
        ${isActive
          ? 'border-[var(--terminal-green)] shadow-lg shadow-[var(--terminal-green)]/20'
          : 'border-gray-700'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.9))',
      }}
    >
      {/* Buffer 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Buffer</span>
          <span
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{
              backgroundColor: getDepthColor(buffer.index),
              color: 'white'
            }}
          >
            #{buffer.index}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-500">{buffer.toolId}</span>
      </div>

      {/* Buffer 内容 */}
      <div
        className="font-mono text-sm p-2 rounded mb-3 overflow-x-auto"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: buffer.content.startsWith('✓') ? '#10b981' : '#e5e7eb'
        }}
      >
        {buffer.content || <span className="text-gray-600">(empty)</span>}
      </div>

      {/* 状态指示器 */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <span className="text-gray-500">depth</span>
          <span
            className="font-bold text-lg"
            style={{ color: getDepthColor(buffer.depth) }}
          >
            {buffer.depth}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <span className="text-gray-500">inString</span>
          <span className={`font-bold text-lg ${buffer.inString ? 'text-amber-400' : 'text-gray-600'}`}>
            {buffer.inString ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <span className="text-gray-500">escapes</span>
          <span className="font-bold text-lg text-gray-300">{buffer.escapes}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <span className="text-gray-500">ready</span>
          <span className={`font-bold text-lg ${buffer.depth === 0 && buffer.content.length > 0 ? 'text-green-400' : 'text-gray-600'}`}>
            {buffer.depth === 0 && buffer.content.length > 0 ? '✓' : '✗'}
          </span>
        </div>
      </div>
    </div>
  );
}

// 流式数据可视化
function StreamVisualizer({ currentPhase }: { currentPhase: ParserPhase }) {
  const chunks = [
    '{"na',
    'me":"',
    'foo.',
    'txt",',
    '"recursive":',
    'true}',
  ];

  const getChunkIndex = () => {
    const phaseOrder: ParserPhase[] = [
      'init', 'receive_chunk', 'detect_collision', 'track_depth',
      'check_string', 'buffer_accumulate', 'attempt_parse'
    ];
    const idx = phaseOrder.indexOf(currentPhase);
    return Math.min(idx, chunks.length - 1);
  };

  const activeIndex = getChunkIndex();

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-2 font-mono">OpenAI Streaming Chunks →</div>
      <div className="flex flex-wrap gap-1">
        {chunks.map((chunk, i) => (
          <span
            key={i}
            className={`
              px-2 py-1 rounded font-mono text-sm transition-all duration-300
              ${i <= activeIndex
                ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/50'
                : 'bg-gray-800 text-gray-500 border border-gray-700'
              }
              ${i === activeIndex ? 'ring-2 ring-[var(--terminal-green)] animate-pulse' : ''}
            `}
          >
            {chunk}
          </span>
        ))}
      </div>
    </div>
  );
}

// 碰撞检测可视化
function CollisionVisualizer({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div
      className="mb-6 p-4 rounded-lg border-2 border-amber-500/50 animate-pulse"
      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
    >
      <div className="flex items-center gap-2 text-amber-400 mb-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-bold">索引碰撞检测</span>
      </div>
      <div className="text-sm text-gray-300">
        <code className="text-amber-300">index: 0</code> 被两个不同的工具调用使用：
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-black/30">
            <div className="text-xs text-gray-500">原始</div>
            <div className="font-mono text-green-400">call_abc123</div>
          </div>
          <div className="p-2 rounded bg-black/30">
            <div className="text-xs text-gray-500">碰撞</div>
            <div className="font-mono text-purple-400">call_def456 → 分配新索引 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreamingToolCallParserAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const step = parseSequence[currentStep];

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < parseSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(parseSequence.length - 1, prev + 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 标题 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--terminal-green)] mb-2 font-mono">
          流式工具调用解析器
        </h1>
        <p className="text-gray-400">
          StreamingToolCallParser - 处理 OpenAI 流式 API 的不一致 JSON chunks
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-2">
          {parseSequence.map((s, i) => (
            <button
              key={s.phase}
              onClick={() => setCurrentStep(i)}
              className={`
                flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer
                ${i === currentStep
                  ? 'bg-[var(--terminal-green)]'
                  : i < currentStep
                    ? 'bg-[var(--terminal-green)]/50'
                    : 'bg-gray-700'
                }
              `}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>步骤 {currentStep + 1} / {parseSequence.length}</span>
          <span>{step.phase}</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：可视化 */}
        <div className="space-y-6">
          {/* 当前步骤信息 */}
          <div
            className="rounded-xl p-6 border border-[var(--terminal-green)]/30"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.8))' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: 'var(--terminal-green)', color: 'black' }}
              >
                {currentStep + 1}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>

            {step.highlight && (
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(var(--terminal-green-rgb), 0.2)',
                  color: 'var(--terminal-green)'
                }}
              >
                {step.highlight}
              </div>
            )}
          </div>

          {/* 流式数据可视化 */}
          <StreamVisualizer currentPhase={step.phase} />

          {/* 碰撞检测 */}
          <CollisionVisualizer show={step.phase === 'detect_collision'} />

          {/* Buffer 状态 */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">Buffer 状态</h3>
            {step.bufferStates.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {step.bufferStates.map((buffer, i) => (
                  <BufferVisualizer
                    key={`${buffer.index}-${i}`}
                    buffer={buffer}
                    isActive={true}
                  />
                ))}
              </div>
            ) : (
              <div
                className="p-8 rounded-lg border border-dashed border-gray-700 text-center text-gray-500"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                暂无 Buffer
              </div>
            )}
          </div>
        </div>

        {/* 右侧：代码 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-400 font-mono">源码实现</h3>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showCode ? '隐藏' : '显示'}
            </button>
          </div>

          {showCode && (
            <div
              className="rounded-xl overflow-hidden border border-gray-800"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <div className="p-1 border-b border-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-gray-500 ml-2 font-mono">
                  streamingToolCallParser.ts
                </span>
              </div>
              <JsonBlock code={step.codeSnippet} />
            </div>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          重置
        </button>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一步
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-[var(--terminal-green)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === parseSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步
        </button>
      </div>

      {/* 解析策略说明 */}
      <div className="max-w-6xl mx-auto mt-8">
        <div
          className="rounded-xl p-6 border border-gray-800"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <h3 className="text-lg font-bold text-white mb-4">多层解析策略</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: '标准解析', desc: 'JSON.parse() 直接解析', color: '#10b981' },
              { name: '字符串修复', desc: '自动闭合未闭合的引号', color: '#3b82f6' },
              { name: '括号补全', desc: '根据 depth 补全 { }', color: '#8b5cf6' },
              { name: '安全降级', desc: '移除尾部 + 宽松解析', color: '#f59e0b' },
            ].map((strategy, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: strategy.color + '40',
                  backgroundColor: strategy.color + '10'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: strategy.color }}
                  />
                  <span className="font-medium text-white">{strategy.name}</span>
                </div>
                <p className="text-xs text-gray-400">{strategy.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
