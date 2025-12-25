import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 压缩阶段
type CompressionPhase =
  | 'init'
  | 'check_threshold'
  | 'calculate_chars'
  | 'find_split_point'
  | 'partition_history'
  | 'generate_summary'
  | 'reconstruct_history'
  | 'verify_tokens'
  | 'complete';

// 消息类型
interface Message {
  id: number;
  role: 'user' | 'model';
  content: string;
  charCount: number;
  isFunctionResponse?: boolean;
}

// 压缩状态
interface CompressionState {
  phase: CompressionPhase;
  messages: Message[];
  totalTokens: number;
  tokenLimit: number;
  threshold: number;
  preserveFraction: number;
  splitPoint: number | null;
  historyToCompress: Message[];
  historyToKeep: Message[];
  summary: string | null;
  newTokens: number | null;
}

// 压缩步骤
interface CompressionStep {
  phase: CompressionPhase;
  title: string;
  description: string;
  codeSnippet: string;
}

// 示例对话历史
const sampleHistory: Message[] = [
  { id: 1, role: 'user', content: '帮我分析这段代码的性能问题', charCount: 45 },
  { id: 2, role: 'model', content: '我来分析一下这段代码。首先，我需要检查几个关键点...', charCount: 120 },
  { id: 3, role: 'user', content: '具体是哪些函数有问题？', charCount: 35 },
  { id: 4, role: 'model', content: '经过分析，主要有以下几个性能瓶颈：\n1. 数据库查询没有使用索引\n2. 循环中有重复计算...', charCount: 280 },
  { id: 5, role: 'user', content: '请修复数据库查询问题', charCount: 40 },
  { id: 6, role: 'model', content: '好的，我来优化数据库查询...', charCount: 180, isFunctionResponse: true },
  { id: 7, role: 'user', content: '还有其他优化建议吗？', charCount: 38 },
  { id: 8, role: 'model', content: '是的，我还建议：\n1. 使用缓存减少重复计算\n2. 考虑异步处理...', charCount: 350 },
  { id: 9, role: 'user', content: '帮我实现缓存功能', charCount: 32 },
  { id: 10, role: 'model', content: '我来实现缓存功能，使用 LRU 缓存策略...', charCount: 420 },
];

// 压缩流程
const compressionSequence: CompressionStep[] = [
  {
    phase: 'init',
    title: '初始化压缩服务',
    description: '加载配置参数：触发阈值 70%，保留比例 30%',
    codeSnippet: `// chatCompressionService.ts:37-50
const COMPRESSION_TOKEN_THRESHOLD = 0.7;   // 70% 触发压缩
const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留最近 30%

interface ChatCompressionConfig {
  model: string;
  tokenLimit: number;
  getContentGenerator: () => ContentGenerator;
}`,
  },
  {
    phase: 'check_threshold',
    title: '检查 Token 阈值',
    description: '当前 token 数 > 70% 限制时触发压缩',
    codeSnippet: `// chatCompressionService.ts:105-124
async compressIfNeeded(
  config: ChatCompressionConfig,
  history: Content[],
  options?: { force?: boolean }
): Promise<ChatCompressionInfo> {
  const tokenCount = await this.getTokenCount(history);
  const threshold = COMPRESSION_TOKEN_THRESHOLD;
  const limit = tokenLimit(config.model);

  // 检查是否需要压缩
  if (!options?.force && tokenCount < threshold * limit) {
    return {
      compressionStatus: CompressionStatus.NOOP,
      originalTokenCount: tokenCount,
      newTokenCount: tokenCount,
    };
  }

  // 需要压缩，继续处理...
}`,
  },
  {
    phase: 'calculate_chars',
    title: '计算字符分布',
    description: '统计每条消息的字符数，用于确定分割点',
    codeSnippet: `// chatCompressionService.ts:37-55
function findCompressSplitPoint(
  contents: Content[],
  fraction: number
): number {
  // 计算每条消息的字符数
  const charCounts = contents.map((c) =>
    JSON.stringify(c).length
  );

  // 计算总字符数
  const totalCharCount = charCounts.reduce((a, b) => a + b, 0);

  // 目标分割位置 (保留 fraction 比例的最近消息)
  const targetCharCount = totalCharCount * fraction;

  console.log(\`Total: \${totalCharCount}, Target: \${targetCharCount}\`);
}`,
  },
  {
    phase: 'find_split_point',
    title: '寻找分割点',
    description: '从前向后累积，在 user 消息边界分割',
    codeSnippet: `// chatCompressionService.ts:56-77
let cumulativeCharCount = 0;
let lastSplitPoint = 0;

for (let i = 0; i < contents.length; i++) {
  const content = contents[i];
  cumulativeCharCount += charCounts[i];

  // 只在 user 消息处分割 (不能在工具响应中间分割)
  const isUserMessage = content.role === 'user';
  const isNotToolResponse = !content.parts?.some(
    (p) => !!p.functionResponse
  );

  if (isUserMessage && isNotToolResponse) {
    if (cumulativeCharCount >= targetCharCount) {
      return i; // 在此处分割
    }
    lastSplitPoint = i;
  }
}

return lastSplitPoint; // 回退到上一个有效分割点`,
  },
  {
    phase: 'partition_history',
    title: '分割历史记录',
    description: '将历史分为待压缩部分和保留部分',
    codeSnippet: `// chatCompressionService.ts:126-132
const splitPoint = findCompressSplitPoint(
  curatedHistory,
  1 - COMPRESSION_PRESERVE_THRESHOLD  // 压缩前 70%
);

// 分割历史
const historyToCompress = curatedHistory.slice(0, splitPoint);
const historyToKeep = curatedHistory.slice(splitPoint);

console.log(\`Compressing \${historyToCompress.length} messages\`);
console.log(\`Keeping \${historyToKeep.length} messages\`);`,
  },
  {
    phase: 'generate_summary',
    title: '生成摘要',
    description: '调用 LLM 生成压缩摘要 (state_snapshot)',
    codeSnippet: `// chatCompressionService.ts:145-165
const summaryResponse = await config.getContentGenerator().generateContent({
  model: config.model,
  contents: [
    ...historyToCompress,
    {
      role: 'user',
      parts: [{
        text: 'First, reason in your scratchpad. ' +
              'Then, generate the <state_snapshot>.'
      }],
    },
  ],
  config: {
    systemInstruction: getCompressionPrompt(),
  },
});

const summary = extractText(summaryResponse);

// 摘要格式:
// <state_snapshot>
// - 用户请求分析代码性能
// - 已识别数据库查询和循环计算问题
// - 已修复数据库查询，正在实现缓存
// </state_snapshot>`,
  },
  {
    phase: 'reconstruct_history',
    title: '重构历史记录',
    description: '用摘要替换压缩部分，保留最近对话',
    codeSnippet: `// chatCompressionService.ts:171-194
// 构建新历史
const compressedHistory: Content[] = [
  // 1. 摘要作为 user 消息
  {
    role: 'user',
    parts: [{ text: summary }],
  },
  // 2. 模型确认收到摘要
  {
    role: 'model',
    parts: [{
      text: 'Got it. Thanks for the additional context!'
    }],
  },
  // 3. 保留的最近历史
  ...historyToKeep,
];

// 新历史结构:
// [摘要] → [确认] → [最近对话...]`,
  },
  {
    phase: 'verify_tokens',
    title: '验证压缩效果',
    description: '计算新历史的 token 数，确认压缩成功',
    codeSnippet: `// chatCompressionService.ts:196-210
// 估算新 token 数
const newTokenCount = Math.ceil(
  JSON.stringify(compressedHistory).length / 4
);

console.log(\`Compression result:\`);
console.log(\`  Original: \${originalTokenCount} tokens\`);
console.log(\`  New: \${newTokenCount} tokens\`);
console.log(\`  Saved: \${originalTokenCount - newTokenCount} tokens\`);
console.log(\`  Ratio: \${(newTokenCount / originalTokenCount * 100).toFixed(1)}%\`);

return {
  compressionStatus: CompressionStatus.SUCCESS,
  originalTokenCount,
  newTokenCount,
};`,
  },
  {
    phase: 'complete',
    title: '压缩完成',
    description: '历史已压缩，可继续对话',
    codeSnippet: `// 压缩完成后的历史结构:
// ┌─────────────────────────────────────┐
// │ [USER] <state_snapshot>             │
// │   - 分析代码性能问题                │
// │   - 修复数据库查询                  │
// │   - 实现缓存功能                    │
// │ </state_snapshot>                   │
// ├─────────────────────────────────────┤
// │ [MODEL] Got it. Thanks for the      │
// │         additional context!         │
// ├─────────────────────────────────────┤
// │ [USER] 帮我实现缓存功能             │  ← 保留的
// ├─────────────────────────────────────┤    最近对话
// │ [MODEL] 我来实现缓存功能...         │
// └─────────────────────────────────────┘`,
  },
];

// Token 使用量可视化
function TokenUsageBar({
  current,
  limit,
  threshold,
  newTokens,
}: {
  current: number;
  limit: number;
  threshold: number;
  newTokens: number | null;
}) {
  const currentPercent = (current / limit) * 100;
  const thresholdPercent = threshold * 100;
  const newPercent = newTokens ? (newTokens / limit) * 100 : null;

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--amber)]">📊</span>
          <span className="text-sm font-mono font-bold text-[var(--text-primary)]">Token 使用量</span>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)]">
          {current.toLocaleString()} / {limit.toLocaleString()}
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-8 bg-black/30 rounded-lg overflow-hidden">
        {/* 阈值线 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--amber)] z-10"
          style={{ left: `${thresholdPercent}%` }}
        />

        {/* 当前使用量 */}
        <div
          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
            currentPercent > thresholdPercent
              ? 'bg-[var(--error-red)]/60'
              : 'bg-[var(--terminal-green)]/60'
          }`}
          style={{ width: `${currentPercent}%` }}
        />

        {/* 压缩后使用量 */}
        {newPercent !== null && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-[var(--cyber-blue)]/80 transition-all duration-500"
            style={{ width: `${newPercent}%` }}
          />
        )}

        {/* 标签 */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-mono text-white/80">
            {currentPercent.toFixed(0)}%
          </span>
          {newPercent !== null && (
            <span className="text-xs font-mono text-[var(--cyber-blue)]">
              → {newPercent.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--amber)]" />
          <span className="text-[var(--text-muted)]">阈值 ({thresholdPercent}%)</span>
        </div>
        {newPercent !== null && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--cyber-blue)]" />
            <span className="text-[var(--text-muted)]">压缩后</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 历史记录可视化
function HistoryVisual({
  messages,
  splitPoint,
  historyToCompress,
  historyToKeep,
  summary,
  phase,
}: {
  messages: Message[];
  splitPoint: number | null;
  historyToCompress: Message[];
  historyToKeep: Message[];
  summary: string | null;
  phase: CompressionPhase;
}) {
  const showSplit = splitPoint !== null && phase !== 'complete';
  const showCompressed = phase === 'complete' || phase === 'reconstruct_history' || phase === 'verify_tokens';

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--terminal-green)]">💬</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
          {showCompressed ? '压缩后历史' : '对话历史'}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {showCompressed ? (
          // 压缩后的历史
          <>
            {/* 摘要 */}
            <div className="p-2 rounded bg-[var(--cyber-blue)]/10 border border-[var(--cyber-blue)]/30">
              <div className="text-[10px] text-[var(--cyber-blue)] mb-1">USER (摘要)</div>
              <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                {summary || '<state_snapshot>...'}
              </pre>
            </div>
            <div className="p-2 rounded bg-[var(--purple)]/10 border border-[var(--purple)]/30">
              <div className="text-[10px] text-[var(--purple)] mb-1">MODEL</div>
              <div className="text-xs font-mono text-[var(--text-secondary)]">
                Got it. Thanks for the additional context!
              </div>
            </div>
            {/* 保留的历史 */}
            {historyToKeep.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded border ${
                  msg.role === 'user'
                    ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                    : 'bg-[var(--amber)]/10 border-[var(--amber)]/30'
                }`}
              >
                <div className="text-[10px] mb-1" style={{
                  color: msg.role === 'user' ? 'var(--terminal-green)' : 'var(--amber)'
                }}>
                  {msg.role.toUpperCase()}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  {msg.content}
                </div>
              </div>
            ))}
          </>
        ) : (
          // 原始历史
          messages.map((msg, i) => {
            const isToCompress = showSplit && splitPoint !== null && i < splitPoint;
            const isToKeep = showSplit && splitPoint !== null && i >= splitPoint;

            return (
              <div
                key={msg.id}
                className={`p-2 rounded border transition-all duration-300 ${
                  isToCompress
                    ? 'bg-[var(--error-red)]/10 border-[var(--error-red)]/30 opacity-60'
                    : isToKeep
                    ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                    : msg.role === 'user'
                    ? 'bg-[var(--cyber-blue)]/10 border-[var(--cyber-blue)]/30'
                    : 'bg-[var(--purple)]/10 border-[var(--purple)]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px]" style={{
                    color: isToCompress ? 'var(--error-red)' :
                           isToKeep ? 'var(--terminal-green)' :
                           msg.role === 'user' ? 'var(--cyber-blue)' : 'var(--purple)'
                  }}>
                    {msg.role.toUpperCase()}
                    {msg.isFunctionResponse && ' (tool response)'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {msg.charCount} chars
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] line-clamp-2">
                  {msg.content}
                </div>
                {showSplit && i === splitPoint && (
                  <div className="mt-2 pt-2 border-t border-dashed border-[var(--amber)] text-[10px] text-[var(--amber)]">
                    ↑ 压缩 | ↓ 保留
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 图例 */}
      {showSplit && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--error-red)]/30" />
            <span className="text-[var(--text-muted)]">待压缩 ({historyToCompress.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--terminal-green)]/30" />
            <span className="text-[var(--text-muted)]">保留 ({historyToKeep.length})</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 主组件
export function HistoryCompressionAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [state, setState] = useState<CompressionState>({
    phase: 'init',
    messages: sampleHistory,
    totalTokens: 2800,
    tokenLimit: 4000,
    threshold: 0.7,
    preserveFraction: 0.3,
    splitPoint: null,
    historyToCompress: [],
    historyToKeep: [],
    summary: null,
    newTokens: null,
  });

  const currentStepData = compressionSequence[currentStep];

  // 更新状态
  useEffect(() => {
    const phase = currentStepData?.phase;
    if (!phase) return;

    setState((prev) => {
      const newState = { ...prev, phase };

      switch (phase) {
        case 'find_split_point':
          newState.splitPoint = 7; // 在第7条消息处分割
          break;
        case 'partition_history':
          newState.historyToCompress = sampleHistory.slice(0, 7);
          newState.historyToKeep = sampleHistory.slice(7);
          break;
        case 'generate_summary':
          newState.summary = `<state_snapshot>
- 用户请求分析代码性能问题
- 已识别两个性能瓶颈：数据库查询和循环计算
- 已完成数据库查询优化
- 正在进行缓存功能实现
</state_snapshot>`;
          break;
        case 'verify_tokens':
        case 'complete':
          newState.newTokens = 1200;
          break;
      }

      return newState;
    });
  }, [currentStep, currentStepData?.phase]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < compressionSequence.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(compressionSequence.length - 1, s + 1));
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setState({
      phase: 'init',
      messages: sampleHistory,
      totalTokens: 2800,
      tokenLimit: 4000,
      threshold: 0.7,
      preserveFraction: 0.3,
      splitPoint: null,
      historyToCompress: [],
      historyToKeep: [],
      summary: null,
      newTokens: null,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          History 压缩算法动画
        </h1>
        <p className="text-[var(--text-secondary)]">
          展示对话历史压缩流程：阈值检测 → 分割点计算 → 摘要生成 → 历史重构
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
          核心代码: packages/core/src/services/chatCompressionService.ts:37-215
        </p>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm"
          >
            ↺ 重置
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            ← 上一步
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              isPlaying
                ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/50'
                : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/50'
            }`}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === compressionSequence.length - 1}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            下一步 →
          </button>
        </div>
        <div className="text-sm text-[var(--text-muted)] font-mono">
          {currentStep + 1} / {compressionSequence.length}
        </div>
      </div>

      {/* 当前步骤 */}
      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--cyber-blue)]/20 flex items-center justify-center text-[var(--cyber-blue)] font-bold">
            {currentStep + 1}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {currentStepData?.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {currentStepData?.description}
            </p>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TokenUsageBar
          current={state.totalTokens}
          limit={state.tokenLimit}
          threshold={state.threshold}
          newTokens={state.newTokens}
        />
        <HistoryVisual
          messages={state.messages}
          splitPoint={state.splitPoint}
          historyToCompress={state.historyToCompress}
          historyToKeep={state.historyToKeep}
          summary={state.summary}
          phase={state.phase}
        />
      </div>

      {/* 代码 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--purple)]">📄</span>
          <span className="text-sm font-mono font-bold text-[var(--text-primary)]">源码实现</span>
        </div>
        <JsonBlock code={currentStepData?.codeSnippet || ''} />
      </div>

      {/* 算法说明 */}
      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">算法要点</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded bg-[var(--amber)]/10 border border-[var(--amber)]/30">
            <div className="font-bold text-[var(--amber)] mb-1">分割点选择</div>
            <div className="text-[var(--text-secondary)]">
              只在 user 消息边界分割，避免在工具响应中间截断
            </div>
          </div>
          <div className="p-3 rounded bg-[var(--cyber-blue)]/10 border border-[var(--cyber-blue)]/30">
            <div className="font-bold text-[var(--cyber-blue)] mb-1">摘要注入</div>
            <div className="text-[var(--text-secondary)]">
              摘要作为 user 消息 + model 确认，保持对话轮次结构
            </div>
          </div>
          <div className="p-3 rounded bg-[var(--terminal-green)]/10 border border-[var(--terminal-green)]/30">
            <div className="font-bold text-[var(--terminal-green)] mb-1">压缩效果</div>
            <div className="text-[var(--text-secondary)]">
              通常可压缩 50-70%，保留最近对话的完整上下文
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
