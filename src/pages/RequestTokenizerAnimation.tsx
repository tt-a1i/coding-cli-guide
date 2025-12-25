// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 处理阶段
type TokenizerPhase =
  | 'init'
  | 'content_classify'
  | 'text_process'
  | 'text_batch'
  | 'image_process'
  | 'audio_process'
  | 'other_fallback'
  | 'aggregate'
  | 'performance_log'
  | 'complete';

// 步骤定义
interface TokenizerStep {
  phase: TokenizerPhase;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// Token 计算流程
const tokenizerSequence: TokenizerStep[] = [
  {
    phase: 'init',
    title: '初始化 RequestTokenizer',
    description: '创建多内容类型 Token 计算器，准备处理混合内容请求',
    codeSnippet: `// requestTokenizer.ts:15-40
class DefaultRequestTokenizer implements RequestTokenizer {
  private textTokenizer: TextTokenizer;
  private imageTokenizer: ImageTokenizer;
  private performanceTracker = new Map<string, number>();

  constructor() {
    // 文本使用 tiktoken 编码器
    this.textTokenizer = new TiktokenTextTokenizer();
    // 图像使用尺寸估算
    this.imageTokenizer = new DimensionImageTokenizer();
  }

  async countTokens(contents: Content[]): Promise<TokenCount> {
    const startTime = performance.now();
    // ...
  }
}`,
    visualData: {
      tokenizers: [
        { type: 'text', name: 'TiktokenTextTokenizer', status: 'ready' },
        { type: 'image', name: 'DimensionImageTokenizer', status: 'ready' },
        { type: 'audio', name: 'HeuristicAudioTokenizer', status: 'ready' },
      ]
    },
  },
  {
    phase: 'content_classify',
    title: '内容类型分类',
    description: '将混合内容按类型分组：文本、图像、音频、其他',
    codeSnippet: `// requestTokenizer.ts:50-75
private classifyContents(contents: Content[]): ClassifiedContents {
  const classified: ClassifiedContents = {
    text: [],
    image: [],
    audio: [],
    other: [],
  };

  for (const content of contents) {
    switch (content.type) {
      case 'text':
        classified.text.push(content);
        break;
      case 'image':
      case 'inlineData':
        if (this.isImage(content)) {
          classified.image.push(content);
        }
        break;
      case 'audio':
        classified.audio.push(content);
        break;
      default:
        classified.other.push(content);
    }
  }

  return classified;
}`,
    visualData: {
      contents: [
        { type: 'text', preview: '"请分析这张图片..."', size: 256 },
        { type: 'image', preview: 'screenshot.png', size: 1024000 },
        { type: 'text', preview: '"并生成报告"', size: 128 },
        { type: 'audio', preview: 'voice.mp3', size: 512000 },
      ],
      classified: {
        text: 2,
        image: 1,
        audio: 1,
        other: 0
      }
    },
    highlight: '按类型分组',
  },
  {
    phase: 'text_process',
    title: '文本 Token 计算',
    description: '使用 tiktoken 编码器精确计算文本 token 数',
    codeSnippet: `// textTokenizer.ts:20-45
class TiktokenTextTokenizer implements TextTokenizer {
  private encoder: Tiktoken;

  constructor() {
    // 使用 cl100k_base 编码（GPT-4/Claude 兼容）
    this.encoder = getEncoding('cl100k_base');
  }

  countTokens(text: string): number {
    try {
      const tokens = this.encoder.encode(text);
      return tokens.length;
    } catch (e) {
      // 降级：字符数 / 4
      return Math.ceil(text.length / 4);
    }
  }
}

// 示例
"请分析这张图片并生成报告"
→ tokens: ['请', '分析', '这', '张', '图片', '并', '生成', '报告']
→ count: 8`,
    visualData: {
      text: '请分析这张图片并生成报告',
      tokens: ['请', '分析', '这', '张', '图片', '并', '生成', '报告'],
      count: 8
    },
    highlight: 'tiktoken 精确编码',
  },
  {
    phase: 'text_batch',
    title: '批量文本处理',
    description: '合并多个文本片段，批量计算 token 提高效率',
    codeSnippet: `// requestTokenizer.ts:85-110
private async countTextTokens(texts: TextContent[]): Promise<number> {
  if (texts.length === 0) return 0;

  // 批量处理优化
  if (texts.length === 1) {
    return this.textTokenizer.countTokens(texts[0].text);
  }

  // 合并后计算（减少编码器调用次数）
  const combined = texts.map(t => t.text).join('\\n');
  const totalTokens = this.textTokenizer.countTokens(combined);

  // 减去分隔符的 token（每个 \\n 约 1 token）
  return totalTokens - (texts.length - 1);
}

// 批量 vs 单独
// 批量: encode("text1\\ntext2\\ntext3") = 1 次调用
// 单独: encode("text1") + encode("text2") + encode("text3") = 3 次调用`,
    visualData: {
      texts: ['请分析这张图片', '并生成报告'],
      combined: '请分析这张图片\n并生成报告',
      batchTokens: 9,
      separatorTokens: 1,
      finalTokens: 8
    },
    highlight: '批量优化',
  },
  {
    phase: 'image_process',
    title: '图像 Token 估算',
    description: '根据图像数量使用公式估算 token 数',
    codeSnippet: `// imageTokenizer.ts:15-40
class DimensionImageTokenizer implements ImageTokenizer {
  // 基于 OpenAI Vision API 的 token 估算公式
  private readonly baseTokensPerImage = 85;
  private readonly tokensPerTile = 170;
  private readonly tileSize = 512;

  countTokens(images: ImageContent[]): number {
    if (images.length === 0) return 0;

    // 简化公式：每张图片至少 6 个 token
    // 实际取决于分辨率和缩放
    const minTokens = 6;

    return Math.max(
      minTokens,
      images.length * minTokens
    );
  }
}

// 示例：1 张图片
// tokens = max(6, 1 * 6) = 6`,
    visualData: {
      images: [{ name: 'screenshot.png', width: 1920, height: 1080 }],
      formula: 'max(6, imageCount × 6)',
      calculation: 'max(6, 1 × 6) = 6',
      tokens: 6
    },
    highlight: '每张图 6+ tokens',
  },
  {
    phase: 'audio_process',
    title: '音频 Token 估算',
    description: '根据音频数据大小使用启发式公式估算',
    codeSnippet: `// requestTokenizer.ts:120-145
private countAudioTokens(audios: AudioContent[]): number {
  if (audios.length === 0) return 0;

  let totalTokens = 0;

  for (const audio of audios) {
    // 获取数据大小
    const dataSize = this.getAudioDataSize(audio);

    // 启发式公式：每 100 字节约 1 token
    // 最小 10 token（元数据开销）
    const tokens = Math.max(
      10,
      Math.ceil(dataSize / 100)
    );

    totalTokens += tokens;
  }

  return totalTokens;
}

// 示例：512KB 音频
// tokens = max(10, ceil(512000 / 100)) = 5120`,
    visualData: {
      audio: { name: 'voice.mp3', size: 512000 },
      formula: 'max(10, ceil(dataSize / 100))',
      calculation: 'max(10, ceil(512000 / 100)) = 5120',
      tokens: 5120
    },
    highlight: '每 100 字节 ≈ 1 token',
  },
  {
    phase: 'other_fallback',
    title: '其他类型降级处理',
    description: '对未知类型使用 JSON 序列化长度估算',
    codeSnippet: `// requestTokenizer.ts:150-170
private countOtherTokens(others: Content[]): number {
  if (others.length === 0) return 0;

  let totalTokens = 0;

  for (const content of others) {
    // 降级策略：JSON 序列化后按字符估算
    try {
      const serialized = JSON.stringify(content);
      // 字符数 / 4 是通用估算
      totalTokens += Math.ceil(serialized.length / 4);
    } catch (e) {
      // 最终降级：固定 100 token
      totalTokens += 100;
    }
  }

  return totalTokens;
}

// 三层降级
// 1. 专用计算器 (Text/Image/Audio)
// 2. JSON.stringify().length / 4
// 3. 固定 100 token`,
    visualData: {
      fallbackLayers: [
        { name: '专用计算器', desc: 'tiktoken / 尺寸公式', priority: 1 },
        { name: 'JSON 序列化', desc: 'length / 4', priority: 2 },
        { name: '固定值', desc: '100 tokens', priority: 3 },
      ]
    },
    highlight: '三层降级策略',
  },
  {
    phase: 'aggregate',
    title: '聚合计算结果',
    description: '汇总所有类型的 token 数',
    codeSnippet: `// requestTokenizer.ts:180-200
async countTokens(contents: Content[]): Promise<TokenCount> {
  const classified = this.classifyContents(contents);

  // 并行计算各类型 token
  const [textTokens, imageTokens, audioTokens, otherTokens] =
    await Promise.all([
      this.countTextTokens(classified.text),
      this.countImageTokens(classified.image),
      this.countAudioTokens(classified.audio),
      this.countOtherTokens(classified.other),
    ]);

  // 聚合结果
  return {
    text: textTokens,
    image: imageTokens,
    audio: audioTokens,
    other: otherTokens,
    total: textTokens + imageTokens + audioTokens + otherTokens,
  };
}`,
    visualData: {
      breakdown: [
        { type: 'text', tokens: 8, color: '#10b981' },
        { type: 'image', tokens: 6, color: '#3b82f6' },
        { type: 'audio', tokens: 5120, color: '#8b5cf6' },
        { type: 'other', tokens: 0, color: '#f59e0b' },
      ],
      total: 5134
    },
    highlight: 'total: 5,134 tokens',
  },
  {
    phase: 'performance_log',
    title: '性能追踪',
    description: '记录计算耗时用于优化分析',
    codeSnippet: `// requestTokenizer.ts:210-230
async countTokens(contents: Content[]): Promise<TokenCount> {
  const startTime = performance.now();

  // ... 计算逻辑 ...

  const endTime = performance.now();
  const duration = endTime - startTime;

  // 记录性能指标
  this.performanceTracker.set('lastDuration', duration);
  this.performanceTracker.set('contentCount', contents.length);
  this.performanceTracker.set('avgTimePerContent',
    duration / contents.length
  );

  // 日志输出（调试模式）
  if (process.env.DEBUG) {
    console.log(\`Token计算耗时: \${duration.toFixed(2)}ms\`);
    console.log(\`内容数: \${contents.length}\`);
    console.log(\`平均: \${(duration / contents.length).toFixed(2)}ms/项\`);
  }

  return result;
}`,
    visualData: {
      metrics: {
        duration: 12.5,
        contentCount: 4,
        avgTimePerContent: 3.125,
        unit: 'ms'
      }
    },
    highlight: '12.5ms / 4 项',
  },
  {
    phase: 'complete',
    title: '计算完成',
    description: '返回详细的 token 统计结果',
    codeSnippet: `// 最终结果
{
  text: 8,
  image: 6,
  audio: 5120,
  other: 0,
  total: 5134,
  metadata: {
    duration: 12.5,
    breakdown: {
      textItems: 2,
      imageItems: 1,
      audioItems: 1,
      otherItems: 0
    }
  }
}

// Token 分布分析
// 文本: 0.16% (8/5134)
// 图像: 0.12% (6/5134)
// 音频: 99.72% (5120/5134)  // 主要消耗
// 其他: 0%`,
    visualData: {
      final: {
        text: 8,
        image: 6,
        audio: 5120,
        other: 0,
        total: 5134
      },
      distribution: [
        { type: 'text', percent: 0.16 },
        { type: 'image', percent: 0.12 },
        { type: 'audio', percent: 99.72 },
      ]
    },
    highlight: '完成',
  },
];

// 分类可视化
function ClassificationVisualizer({
  contents,
  classified
}: {
  contents?: Array<{ type: string; preview: string; size: number }>;
  classified?: { text: number; image: number; audio: number; other: number };
}) {
  if (!contents) return null;

  const typeColors: Record<string, string> = {
    text: '#10b981',
    image: '#3b82f6',
    audio: '#8b5cf6',
    other: '#f59e0b'
  };

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">内容分类</div>
      <div className="space-y-2 mb-4">
        {contents.map((content, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded"
            style={{ backgroundColor: `${typeColors[content.type]}15` }}
          >
            <div
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ backgroundColor: typeColors[content.type], color: 'white' }}
            >
              {content.type}
            </div>
            <span className="flex-1 text-sm text-gray-300 truncate font-mono">
              {content.preview}
            </span>
            <span className="text-xs text-gray-500">
              {content.size > 1000 ? `${(content.size / 1024).toFixed(1)}KB` : `${content.size}B`}
            </span>
          </div>
        ))}
      </div>
      {classified && (
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(classified).map(([type, count]) => (
            <div
              key={type}
              className="p-2 rounded text-center"
              style={{ backgroundColor: `${typeColors[type]}20` }}
            >
              <div className="text-xs text-gray-500">{type}</div>
              <div
                className="text-lg font-bold"
                style={{ color: typeColors[type] }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Token 可视化
function TokenVisualizer({
  tokens
}: {
  tokens?: string[];
}) {
  if (!tokens) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">Tiktoken 分词结果</div>
      <div className="flex flex-wrap gap-1">
        {tokens.map((token, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded text-sm font-mono"
            style={{
              backgroundColor: `hsl(${(i * 40) % 360}, 70%, 25%)`,
              color: 'white'
            }}
          >
            {token}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        共 {tokens.length} 个 token
      </div>
    </div>
  );
}

// 公式可视化
function FormulaVisualizer({
  formula,
  calculation,
  result
}: {
  formula?: string;
  calculation?: string;
  result?: number;
}) {
  if (!formula) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-2 font-mono">计算公式</div>
      <div className="space-y-2">
        <div className="p-2 rounded bg-black/30 font-mono text-[var(--terminal-green)]">
          {formula}
        </div>
        {calculation && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="font-mono text-gray-300">{calculation}</span>
          </div>
        )}
        {result !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">=</span>
            <span className="text-2xl font-bold text-[var(--terminal-green)]">
              {result.toLocaleString()} tokens
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// 聚合可视化
function AggregateVisualizer({
  breakdown,
  total
}: {
  breakdown?: Array<{ type: string; tokens: number; color: string }>;
  total?: number;
}) {
  if (!breakdown) return null;

  const maxTokens = Math.max(...breakdown.map(b => b.tokens));

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">Token 分布</div>
      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <span className="w-16 text-sm text-gray-400">{item.type}</span>
            <div className="flex-1 h-6 bg-black/30 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(item.tokens / maxTokens) * 100}%`,
                  backgroundColor: item.color,
                  minWidth: item.tokens > 0 ? '4px' : '0'
                }}
              />
            </div>
            <span className="w-20 text-right font-mono text-sm" style={{ color: item.color }}>
              {item.tokens.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {total !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
          <span className="text-gray-400">总计</span>
          <span className="text-2xl font-bold text-[var(--terminal-green)]">
            {total.toLocaleString()} tokens
          </span>
        </div>
      )}
    </div>
  );
}

// 降级策略可视化
function FallbackVisualizer({
  layers
}: {
  layers?: Array<{ name: string; desc: string; priority: number }>;
}) {
  if (!layers) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">三层降级策略</div>
      <div className="space-y-2">
        {layers.map((layer, i) => (
          <div
            key={layer.priority}
            className="flex items-center gap-3 p-3 rounded"
            style={{
              backgroundColor: i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.3)'
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: i === 0 ? '#10b981' : '#374151',
                color: 'white'
              }}
            >
              {layer.priority}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{layer.name}</div>
              <div className="text-xs text-gray-400">{layer.desc}</div>
            </div>
            {i === 0 && (
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                优先
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 性能指标可视化
function PerformanceVisualizer({
  metrics
}: {
  metrics?: { duration: number; contentCount: number; avgTimePerContent: number; unit: string };
}) {
  if (!metrics) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">性能指标</div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded bg-black/30 text-center">
          <div className="text-xs text-gray-500">总耗时</div>
          <div className="text-xl font-bold text-[var(--terminal-green)]">
            {metrics.duration}{metrics.unit}
          </div>
        </div>
        <div className="p-3 rounded bg-black/30 text-center">
          <div className="text-xs text-gray-500">内容数</div>
          <div className="text-xl font-bold text-[var(--cyber-blue)]">
            {metrics.contentCount}
          </div>
        </div>
        <div className="p-3 rounded bg-black/30 text-center">
          <div className="text-xs text-gray-500">平均耗时</div>
          <div className="text-xl font-bold text-[var(--purple)]">
            {metrics.avgTimePerContent}{metrics.unit}/项
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestTokenizerAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = tokenizerSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < tokenizerSequence.length - 1) {
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
    setCurrentStep(prev => Math.min(tokenizerSequence.length - 1, prev + 1));
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
          请求 Token 计算器
        </h1>
        <p className="text-gray-400">
          RequestTokenizer - 多内容类型的 Token 精确计算与估算
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/utils/request-tokenizer/requestTokenizer.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {tokenizerSequence.map((s, i) => (
            <button
              key={s.phase}
              onClick={() => setCurrentStep(i)}
              className={`
                flex-1 h-2 rounded-full transition-all cursor-pointer
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
          <span>步骤 {currentStep + 1} / {tokenizerSequence.length}</span>
          <span>{step.phase}</span>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：可视化 */}
        <div className="space-y-6">
          {/* 当前步骤 */}
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
                className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]"
              >
                {step.highlight}
              </div>
            )}
          </div>

          {/* 分类可视化 */}
          {step.visualData?.contents !== undefined && (
            <ClassificationVisualizer
              contents={step.visualData.contents as Array<{ type: string; preview: string; size: number }>}
              classified={step.visualData.classified as { text: number; image: number; audio: number; other: number }}
            />
          )}

          {/* Token 可视化 */}
          {Boolean(step.visualData && step.visualData.tokens !== undefined && Array.isArray(step.visualData.tokens)) && (
            <TokenVisualizer tokens={step.visualData!.tokens as string[]} />
          )}

          {/* 公式可视化 */}
          {Boolean(step.visualData && step.visualData.formula !== undefined) && (
            <FormulaVisualizer
              formula={step.visualData!.formula as string}
              calculation={step.visualData!.calculation as string}
              result={step.visualData!.tokens as number}
            />
          )}

          {/* 聚合可视化 */}
          {step.visualData?.breakdown && (
            <AggregateVisualizer
              breakdown={step.visualData.breakdown as Array<{ type: string; tokens: number; color: string }>}
              total={step.visualData.total as number}
            />
          )}

          {/* 降级可视化 */}
          {step.visualData?.fallbackLayers && (
            <FallbackVisualizer
              layers={step.visualData.fallbackLayers as Array<{ name: string; desc: string; priority: number }>}
            />
          )}

          {/* 性能指标 */}
          {step.visualData?.metrics && (
            <PerformanceVisualizer
              metrics={step.visualData.metrics as { duration: number; contentCount: number; avgTimePerContent: number; unit: string }}
            />
          )}

          {/* 最终结果 */}
          {step.visualData?.distribution && (
            <div className="p-4 rounded-lg border border-[var(--terminal-green)]/50 bg-[var(--terminal-green)]/10">
              <div className="text-sm font-bold text-[var(--terminal-green)] mb-3">Token 分布</div>
              <div className="flex gap-4">
                {(step.visualData.distribution as Array<{ type: string; percent: number }>).map(d => (
                  <div key={d.type} className="flex items-center gap-2">
                    <span className="text-gray-400">{d.type}:</span>
                    <span className="font-mono text-white">{d.percent}%</span>
                  </div>
                ))}
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
                requestTokenizer.ts
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
          disabled={currentStep === tokenizerSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>

      {/* 计算器说明 */}
      <div className="max-w-6xl mx-auto mt-8">
        <div
          className="rounded-xl p-6 border border-gray-800"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <h3 className="text-lg font-bold text-white mb-4">多内容类型计算器</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { type: 'Text', method: 'tiktoken', color: '#10b981', accuracy: '精确' },
              { type: 'Image', method: '尺寸公式', color: '#3b82f6', accuracy: '估算' },
              { type: 'Audio', method: '字节/100', color: '#8b5cf6', accuracy: '启发式' },
              { type: 'Other', method: 'JSON/4', color: '#f59e0b', accuracy: '降级' },
            ].map(calc => (
              <div
                key={calc.type}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: `${calc.color}40`,
                  backgroundColor: `${calc.color}10`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{calc.type}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: `${calc.color}30`, color: calc.color }}
                  >
                    {calc.accuracy}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{calc.method}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
