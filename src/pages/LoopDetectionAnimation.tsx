// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Introduction component for context
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-red-500/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="text-red-400 font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              循环检测服务 (LoopDetectionService) 是防止 AI 陷入无限循环的安全机制。
              当 AI 重复执行相同操作或产生重复内容时，系统会自动检测并中断。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🛡️ 为什么需要</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              AI 可能陷入循环模式：反复调用相同工具、生成重复内容、或进入认知死循环。
              三层检测机制在不同粒度上捕获这些问题，确保系统稳定性。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🏗️ 三层检测策略</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-green-500/30">
                <div className="text-green-400 font-semibold text-sm">Layer 1: 工具调用</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  SHA256 哈希检测相同工具调用<br/>
                  阈值: 连续 5 次触发
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-blue-500/30">
                <div className="text-blue-400 font-semibold text-sm">Layer 2: 内容流</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  滑动窗口检测重复内容块<br/>
                  阈值: 10 次相同块
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-purple-500/30">
                <div className="text-purple-400 font-semibold text-sm">Layer 3: LLM 分析</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  AI 自我评估是否陷入循环<br/>
                  每 3-15 turns 自适应检查
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">📍 源码:</span>
              <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
                packages/core/src/services/loopDetectionService.ts
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">🔗 相关:</span>
              <span className="text-[var(--cyber-blue)] text-xs">GeminiChat, CoreToolScheduler</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 检测层级
type DetectionLayer = 'tool_call' | 'content_stream' | 'llm_analysis';

// 检测阶段
type DetectionPhase =
  | 'init'
  | 'tool_hash'
  | 'tool_repeat_check'
  | 'tool_loop_detected'
  | 'content_window'
  | 'content_hash'
  | 'content_position_check'
  | 'content_false_positive'
  | 'content_loop_detected'
  | 'llm_interval_check'
  | 'llm_analysis'
  | 'llm_result'
  | 'adaptive_adjust';

// 检测步骤
interface DetectionStep {
  phase: DetectionPhase;
  layer: DetectionLayer;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// 检测流程
const detectionSequence: DetectionStep[] = [
  {
    phase: 'init',
    layer: 'tool_call',
    title: '初始化 LoopDetectionService',
    description: '创建三层循环检测服务，追踪工具调用、内容流和 LLM 分析',
    codeSnippet: `// loopDetectionService.ts:15-40
class LoopDetectionService {
  // 第一层：工具调用循环检测
  private lastToolCallKey: string | null = null;
  private toolCallRepeatCount = 0;
  private readonly toolCallThreshold = 5;

  // 第二层：内容流循环检测
  private contentStats = new Map<string, number[]>();
  private readonly windowSize = 50;
  private readonly contentThreshold = 10;

  // 第三层：LLM 驱动检测
  private turnsSinceLastCheck = 0;
  private checkInterval = 3;
  private readonly minTurnsBeforeCheck = 30;

  constructor(private readonly llmClient: LLMClient) {}
}`,
    visualData: {
      layers: [
        { name: '工具调用', status: 'ready', threshold: '5 次重复' },
        { name: '内容流', status: 'ready', threshold: '10 次相同块' },
        { name: 'LLM 分析', status: 'ready', threshold: '30+ turns' },
      ]
    },
  },
  {
    phase: 'tool_hash',
    layer: 'tool_call',
    title: '工具调用哈希',
    description: '使用 SHA256 哈希工具名称 + 参数，生成唯一标识',
    codeSnippet: `// loopDetectionService.ts:55-70
checkToolCallLoop(toolCall: ToolCall): boolean {
  // 生成工具调用唯一 key
  const key = this.hashToolCall(toolCall);
  return this.checkRepetition(key);
}

private hashToolCall(toolCall: ToolCall): string {
  const content = JSON.stringify({
    name: toolCall.name,
    arguments: toolCall.arguments,
  });
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 16);
}`,
    visualData: {
      toolCall: {
        name: 'read_file',
        arguments: { path: '/src/index.ts' }
      },
      hash: 'a3f2b8c1e9d04567'
    },
    highlight: 'SHA256 哈希生成',
  },
  {
    phase: 'tool_repeat_check',
    layer: 'tool_call',
    title: '重复计数检查',
    description: '比较当前哈希与上次调用，累计重复次数',
    codeSnippet: `// loopDetectionService.ts:75-95
private checkRepetition(key: string): boolean {
  if (key === this.lastToolCallKey) {
    this.toolCallRepeatCount++;

    if (this.toolCallRepeatCount >= this.toolCallThreshold) {
      // 检测到循环！
      return true;
    }
  } else {
    // 不同的工具调用，重置计数
    this.lastToolCallKey = key;
    this.toolCallRepeatCount = 1;
  }

  return false;
}

// 当前状态
lastKey: 'a3f2b8c1e9d04567'
currentKey: 'a3f2b8c1e9d04567' // 相同！
repeatCount: 3 → 4`,
    visualData: {
      sequence: [
        { key: 'a3f2...', count: 1 },
        { key: 'a3f2...', count: 2 },
        { key: 'a3f2...', count: 3 },
        { key: 'a3f2...', count: 4, current: true },
      ],
      threshold: 5
    },
    highlight: 'repeatCount: 4 / 5',
  },
  {
    phase: 'tool_loop_detected',
    layer: 'tool_call',
    title: '工具调用循环检测',
    description: '重复次数达到阈值，触发循环警告',
    codeSnippet: `// 检测到循环！
repeatCount >= toolCallThreshold (5 >= 5)

// 触发警告
this.emit('loopDetected', {
  type: 'tool_call',
  details: {
    toolName: 'read_file',
    repeatCount: 5,
    suggestion: '相同的文件已读取 5 次，可能陷入循环'
  }
});

// 返回 true 中断执行
return true;`,
    visualData: {
      detected: true,
      type: 'tool_call',
      repeatCount: 5
    },
    highlight: '循环检测触发！',
  },
  {
    phase: 'content_window',
    layer: 'content_stream',
    title: '内容流滑动窗口',
    description: '使用 50 字符块的滑动窗口扫描输出内容',
    codeSnippet: `// loopDetectionService.ts:110-130
checkContentLoop(content: string): boolean {
  // 跳过太短的内容
  if (content.length < this.windowSize) {
    return false;
  }

  // 滑动窗口扫描
  for (let i = 0; i <= content.length - this.windowSize; i++) {
    const chunk = content.substring(i, i + this.windowSize);

    // 跳过代码块内的内容
    if (this.isInsideCodeBlock(content, i)) {
      continue;
    }

    // 检查此 chunk 是否重复
    const isLoop = this.checkChunkRepetition(chunk, i);
    if (isLoop) return true;
  }

  return false;
}`,
    visualData: {
      content: 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps over...',
      windowSize: 50,
      currentPosition: 45
    },
    highlight: '滑动窗口: 50 字符',
  },
  {
    phase: 'content_hash',
    layer: 'content_stream',
    title: '块哈希与位置追踪',
    description: '对每个块计算 SHA256 并记录出现位置',
    codeSnippet: `// loopDetectionService.ts:140-165
private checkChunkRepetition(chunk: string, position: number): boolean {
  const hash = crypto
    .createHash('sha256')
    .update(chunk)
    .digest('hex')
    .substring(0, 16);

  // 获取或创建位置数组
  if (!this.contentStats.has(hash)) {
    this.contentStats.set(hash, []);
  }

  const positions = this.contentStats.get(hash)!;
  positions.push(position);

  // 检查是否在短距离内重复出现
  return this.checkProximity(positions);
}

// 位置记录
contentStats = {
  'f8a3b2c1...': [0, 50, 100, 150],  // 多次出现
  'e9d4c5b6...': [25],               // 仅一次
}`,
    visualData: {
      hash: 'f8a3b2c1e9d04567',
      positions: [0, 50, 100, 150],
      newPosition: 200
    },
    highlight: '追踪出现位置',
  },
  {
    phase: 'content_position_check',
    layer: 'content_stream',
    title: '距离检查',
    description: '检查相同块是否在 1.5 倍窗口大小内重复出现 10+ 次',
    codeSnippet: `// loopDetectionService.ts:170-195
private checkProximity(positions: number[]): boolean {
  if (positions.length < this.contentThreshold) {
    return false;  // 未达到阈值
  }

  // 检查最近的出现是否过于密集
  const maxDistance = this.windowSize * 1.5;  // 75 字符

  let consecutiveNear = 0;
  for (let i = 1; i < positions.length; i++) {
    const distance = positions[i] - positions[i - 1];
    if (distance <= maxDistance) {
      consecutiveNear++;
    } else {
      consecutiveNear = 0;
    }

    if (consecutiveNear >= this.contentThreshold - 1) {
      return true;  // 循环检测！
    }
  }

  return false;
}`,
    visualData: {
      positions: [0, 52, 104, 156, 208, 260, 312, 364, 416, 468],
      distances: [52, 52, 52, 52, 52, 52, 52, 52, 52],
      threshold: 75,
      allNear: true
    },
    highlight: '10 次密集重复',
  },
  {
    phase: 'content_false_positive',
    layer: 'content_stream',
    title: 'False Positive 过滤',
    description: '智能跳过代码块、表格、列表等合法重复结构',
    codeSnippet: `// loopDetectionService.ts:200-230
private shouldSkipChunk(content: string, position: number): boolean {
  // 检查是否在代码块内
  if (this.isInsideCodeBlock(content, position)) {
    return true;  // 代码重复是正常的
  }

  const chunk = content.substring(position, position + this.windowSize);

  // 跳过 Markdown 结构
  const skipPatterns = [
    /^\\|.*\\|/,           // 表格行
    /^\\s*[-*+]\\s/,        // 无序列表
    /^\\s*\\d+\\.\\s/,       // 有序列表
    /^#{1,6}\\s/,          // 标题
    /^>\\s/,               // 引用
    /^---+$/,             // 分隔线
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(chunk)) {
      return true;
    }
  }

  return false;
}`,
    visualData: {
      examples: [
        { text: '| Col1 | Col2 |', skip: true, reason: '表格' },
        { text: '- List item here', skip: true, reason: '列表' },
        { text: '# Heading text', skip: true, reason: '标题' },
        { text: 'Normal repeat...', skip: false, reason: '检查' },
      ]
    },
    highlight: '智能过滤',
  },
  {
    phase: 'content_loop_detected',
    layer: 'content_stream',
    title: '内容循环检测',
    description: '检测到内容输出陷入循环',
    codeSnippet: `// 检测到内容循环！
{
  type: 'content_stream',
  hash: 'f8a3b2c1e9d04567',
  occurrences: 12,
  averageDistance: 52,
  sample: 'The quick brown fox jumps over the lazy dog...'
}

// 触发中断
this.emit('loopDetected', {
  type: 'content_stream',
  suggestion: '输出内容出现重复模式，建议重新生成'
});

return true;  // 中断生成`,
    visualData: {
      detected: true,
      type: 'content_stream',
      occurrences: 12
    },
    highlight: '内容循环触发！',
  },
  {
    phase: 'llm_interval_check',
    layer: 'llm_analysis',
    title: 'LLM 检查间隔',
    description: '在 30+ 个 turn 后启动，使用自适应间隔',
    codeSnippet: `// loopDetectionService.ts:250-275
shouldRunLLMCheck(turnCount: number): boolean {
  // 需要至少 30 个 turn
  if (turnCount < this.minTurnsBeforeCheck) {
    return false;
  }

  this.turnsSinceLastCheck++;

  // 检查是否到达间隔
  if (this.turnsSinceLastCheck >= this.checkInterval) {
    this.turnsSinceLastCheck = 0;
    return true;
  }

  return false;
}

// 当前状态
turnCount: 35
turnsSinceLastCheck: 3
checkInterval: 3  // 默认每 3 个 turn 检查一次
// → 触发 LLM 检查`,
    visualData: {
      turnCount: 35,
      turnsSinceLastCheck: 3,
      checkInterval: 3,
      shouldCheck: true
    },
    highlight: 'turn 35: 触发检查',
  },
  {
    phase: 'llm_analysis',
    layer: 'llm_analysis',
    title: 'LLM 循环分析',
    description: '使用 LLM 分析对话历史，检测语义级循环',
    codeSnippet: `// loopDetectionService.ts:280-310
async runLLMAnalysis(history: Message[]): Promise<LoopAnalysis> {
  const recentHistory = history.slice(-20);  // 最近 20 条

  const prompt = \`分析以下对话历史，判断是否存在循环模式：

1. 相似的问题被重复提问
2. 相同的解决方案被重复建议
3. 对话没有实质性进展

对话历史:
\${this.formatHistory(recentHistory)}

请返回 JSON 格式:
{
  "isLoop": boolean,
  "confidence": 0-1,
  "reason": "循环原因描述",
  "suggestion": "如何打破循环"
}\`;

  return await this.llmClient.analyze(prompt);
}`,
    visualData: {
      analyzing: true,
      historySize: 20
    },
    highlight: 'LLM 语义分析',
  },
  {
    phase: 'llm_result',
    layer: 'llm_analysis',
    title: 'LLM 分析结果',
    description: 'LLM 返回循环判断和置信度',
    codeSnippet: `// LLM 分析结果
{
  "isLoop": true,
  "confidence": 0.85,
  "reason": "用户连续 5 次请求读取相同文件，每次都说'再试一次'",
  "suggestion": "建议询问用户期望的具体结果，或尝试不同的方法"
}

// 置信度判断
if (result.confidence > 0.7) {
  this.emit('loopDetected', {
    type: 'llm_analysis',
    confidence: result.confidence,
    reason: result.reason,
    suggestion: result.suggestion
  });
}`,
    visualData: {
      isLoop: true,
      confidence: 0.85,
      reason: '重复请求相同操作'
    },
    highlight: '置信度 85%',
  },
  {
    phase: 'adaptive_adjust',
    layer: 'llm_analysis',
    title: '自适应间隔调整',
    description: '根据检测结果动态调整检查频率',
    codeSnippet: `// loopDetectionService.ts:320-345
adjustCheckInterval(result: LoopAnalysis): void {
  if (result.confidence > 0.9) {
    // 高置信度 → 更频繁检查
    this.checkInterval = Math.max(
      this.minInterval,  // 最小 5
      this.checkInterval - 1
    );
  } else if (result.confidence < 0.3) {
    // 低置信度 → 减少检查频率
    this.checkInterval = Math.min(
      this.maxInterval,  // 最大 15
      this.checkInterval + 2
    );
  }
}

// 间隔范围
minInterval: 5   // 最频繁：每 5 turn
maxInterval: 15  // 最稀疏：每 15 turn
defaultInterval: 3

// 调整后
confidence: 0.85 → checkInterval: 3 → 2`,
    visualData: {
      before: 3,
      after: 2,
      reason: '高置信度检测'
    },
    highlight: '间隔 3 → 2',
  },
];

// 三层检测可视化
function LayerVisualizer({
  layers,
  activeLayer
}: {
  layers: Array<{ name: string; status: string; threshold: string }>;
  activeLayer: DetectionLayer;
}) {
  const layerMap: Record<string, DetectionLayer> = {
    '工具调用': 'tool_call',
    '内容流': 'content_stream',
    'LLM 分析': 'llm_analysis'
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {layers.map((layer, i) => {
        const isActive = layerMap[layer.name] === activeLayer;
        const colors = ['#10b981', '#3b82f6', '#8b5cf6'];
        const color = colors[i];

        return (
          <div
            key={layer.name}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${isActive ? 'shadow-lg' : 'opacity-60'}
            `}
            style={{
              borderColor: isActive ? color : 'transparent',
              backgroundColor: `${color}10`,
              boxShadow: isActive ? `0 0 20px ${color}40` : 'none'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-bold text-white">{layer.name}</span>
            </div>
            <div className="text-xs text-gray-400">阈值: {layer.threshold}</div>
            <div
              className="text-xs mt-1 font-medium"
              style={{ color }}
            >
              {layer.status}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 哈希可视化
function HashVisualizer({ data }: { data?: { toolCall?: unknown; hash?: string } }) {
  if (!data?.toolCall) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-2 font-mono">Tool Call → Hash</div>
      <div className="flex items-center gap-4">
        <div className="flex-1 p-3 rounded bg-black/30 font-mono text-sm">
          <div className="text-gray-400 text-xs mb-1">Input</div>
          <pre className="text-[var(--terminal-green)] overflow-x-auto">
            {JSON.stringify(data.toolCall, null, 2)}
          </pre>
        </div>
        <svg className="w-8 h-8 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <div className="flex-1 p-3 rounded bg-black/30 font-mono text-sm">
          <div className="text-gray-400 text-xs mb-1">SHA256 (16 chars)</div>
          <div className="text-[var(--cyber-blue)] text-lg tracking-wider">{data.hash}</div>
        </div>
      </div>
    </div>
  );
}

// 重复计数可视化
function RepeatVisualizer({
  sequence,
  threshold
}: {
  sequence?: Array<{ key: string; count: number; current?: boolean }>;
  threshold?: number;
}) {
  if (!sequence) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">重复计数追踪</div>
      <div className="flex items-end gap-2 h-24">
        {sequence.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`
                w-full rounded-t transition-all duration-300
                ${item.current ? 'animate-pulse' : ''}
              `}
              style={{
                height: `${(item.count / (threshold || 5)) * 80}px`,
                backgroundColor: item.current
                  ? item.count >= (threshold || 5)
                    ? '#ef4444'
                    : '#f59e0b'
                  : '#10b981',
                minHeight: '20px'
              }}
            />
            <span className="text-xs text-gray-400 font-mono">{item.count}</span>
          </div>
        ))}
        {/* 阈值线 */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-red-500/50"
          style={{ bottom: `${80}px` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-gray-500">调用序列</span>
        <span className="text-red-400">阈值: {threshold}</span>
      </div>
    </div>
  );
}

// 滑动窗口可视化
function WindowVisualizer({ data }: { data?: { content: string; windowSize: number; currentPosition: number } }) {
  if (!data) return null;

  const { content, windowSize, currentPosition } = data;
  const before = content.substring(0, currentPosition);
  const window = content.substring(currentPosition, currentPosition + windowSize);
  const after = content.substring(currentPosition + windowSize);

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-2 font-mono">滑动窗口 (size: {windowSize})</div>
      <div className="font-mono text-sm p-3 rounded bg-black/30 overflow-x-auto whitespace-nowrap">
        <span className="text-gray-600">{before}</span>
        <span className="bg-[var(--terminal-green)]/30 text-[var(--terminal-green)] px-1 rounded">
          {window}
        </span>
        <span className="text-gray-600">{after}</span>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        当前位置: {currentPosition} / {content.length}
      </div>
    </div>
  );
}

// 距离检查可视化
function DistanceVisualizer({
  data
}: {
  data?: { positions: number[]; distances: number[]; threshold: number; allNear: boolean };
}) {
  if (!data) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">位置距离分析</div>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {data.positions.map((pos, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--terminal-green)',
                  color: 'black'
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs text-gray-500 mt-1">{pos}</span>
            </div>
            {i < data.positions.length - 1 && (
              <div className="flex flex-col items-center mx-1">
                <div
                  className={`h-0.5 w-8 ${data.distances[i] <= data.threshold ? 'bg-red-500' : 'bg-gray-600'}`}
                />
                <span
                  className={`text-xs mt-1 ${data.distances[i] <= data.threshold ? 'text-red-400' : 'text-gray-500'}`}
                >
                  {data.distances[i]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="text-gray-500">距离阈值: {data.threshold}</span>
        <span className={data.allNear ? 'text-red-400' : 'text-green-400'}>
          {data.allNear ? '全部过近 - 检测循环' : '距离正常'}
        </span>
      </div>
    </div>
  );
}

// LLM 分析可视化
function LLMAnalysisVisualizer({
  result
}: {
  result?: { isLoop: boolean; confidence: number; reason: string };
}) {
  if (!result) return null;

  const confidenceColor =
    result.confidence > 0.7 ? '#ef4444' :
    result.confidence > 0.4 ? '#f59e0b' : '#10b981';

  return (
    <div
      className="mb-6 p-4 rounded-lg border-2"
      style={{
        borderColor: confidenceColor,
        backgroundColor: `${confidenceColor}10`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white">LLM 分析结果</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">置信度</span>
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: confidenceColor, color: 'white' }}
          >
            {Math.round(result.confidence * 100)}%
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-300">{result.reason}</div>
    </div>
  );
}

export function LoopDetectionAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const step = detectionSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < detectionSequence.length - 1) {
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
    setCurrentStep(prev => Math.min(detectionSequence.length - 1, prev + 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const layerColors: Record<DetectionLayer, string> = {
    tool_call: '#10b981',
    content_stream: '#3b82f6',
    llm_analysis: '#8b5cf6'
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      {/* 标题 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--terminal-green)] mb-2 font-mono">
          循环检测服务
        </h1>
        <p className="text-gray-400">
          LoopDetectionService - 三层递进式循环检测策略
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/services/loopDetectionService.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {detectionSequence.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className="flex-1 h-2 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor:
                  i === currentStep
                    ? layerColors[s.layer]
                    : i < currentStep
                      ? `${layerColors[s.layer]}80`
                      : '#374151'
              }}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>步骤 {currentStep + 1} / {detectionSequence.length}</span>
          <span
            className="px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${layerColors[step.layer]}20`,
              color: layerColors[step.layer]
            }}
          >
            {step.layer.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：可视化 */}
        <div className="space-y-6">
          {/* 当前步骤 */}
          <div
            className="rounded-xl p-6 border"
            style={{
              borderColor: `${layerColors[step.layer]}50`,
              background: `linear-gradient(135deg, ${layerColors[step.layer]}10, rgba(0,0,0,0.8))`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: layerColors[step.layer], color: 'white' }}
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
                  backgroundColor: `${layerColors[step.layer]}20`,
                  color: layerColors[step.layer]
                }}
              >
                {step.highlight}
              </div>
            )}
          </div>

          {/* 三层检测器 */}
          {step.visualData?.layers !== undefined && (
            <LayerVisualizer
              layers={step.visualData.layers as Array<{ name: string; status: string; threshold: string }>}
              activeLayer={step.layer}
            />
          )}

          {/* 哈希可视化 */}
          {Boolean(step.visualData && step.visualData.toolCall !== undefined) && (
            <HashVisualizer data={step.visualData as { toolCall: unknown; hash: string }} />
          )}

          {/* 重复计数 */}
          {Boolean(step.visualData && step.visualData.sequence !== undefined) && (
            <RepeatVisualizer
              sequence={step.visualData!.sequence as Array<{ key: string; count: number; current?: boolean }>}
              threshold={step.visualData!.threshold as number}
            />
          )}

          {/* 滑动窗口 */}
          {Boolean(step.visualData && step.visualData.content !== undefined) && (
            <WindowVisualizer
              data={step.visualData as { content: string; windowSize: number; currentPosition: number }}
            />
          )}

          {/* 距离检查 */}
          {step.visualData?.positions && step.visualData?.distances && (
            <DistanceVisualizer
              data={step.visualData as { positions: number[]; distances: number[]; threshold: number; allNear: boolean }}
            />
          )}

          {/* LLM 分析结果 */}
          {step.visualData?.confidence !== undefined && (
            <LLMAnalysisVisualizer
              result={step.visualData as { isLoop: boolean; confidence: number; reason: string }}
            />
          )}

          {/* 循环检测警告 */}
          {step.visualData?.detected && (
            <div className="p-4 rounded-lg border-2 border-red-500 bg-red-500/10 animate-pulse">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-bold text-lg">循环检测触发！</span>
              </div>
              <div className="text-sm text-gray-300">
                类型: {(step.visualData.type as string)?.replace('_', ' ')}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：代码 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">
                loopDetectionService.ts
              </span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
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
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
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
          disabled={currentStep === detectionSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>

      {/* 三层策略说明 */}
      <div className="max-w-6xl mx-auto mt-8">
        <div
          className="rounded-xl p-6 border border-gray-800"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <h3 className="text-lg font-bold text-white mb-4">三层递进检测策略</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: '工具调用层',
                color: '#10b981',
                desc: 'SHA256 哈希比对，5 次重复触发',
                complexity: 'O(1)'
              },
              {
                name: '内容流层',
                color: '#3b82f6',
                desc: '滑动窗口 + 位置追踪，10 次密集重复触发',
                complexity: 'O(n)'
              },
              {
                name: 'LLM 分析层',
                color: '#8b5cf6',
                desc: '语义级分析，自适应间隔，置信度评分',
                complexity: 'O(API)'
              },
            ].map((layer, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: `${layer.color}40`,
                  backgroundColor: `${layer.color}10`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="font-bold text-white">{layer.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{layer.complexity}</span>
                </div>
                <p className="text-xs text-gray-400">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
