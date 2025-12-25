import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 内容类型
interface ContentItem {
  type: 'text' | 'image' | 'audio' | 'tool';
  content: string;
  tokens: number;
  method: string;
}

// 模拟的请求内容
const requestContents: ContentItem[] = [
  {
    type: 'text',
    content: 'System prompt: You are a helpful coding assistant...',
    tokens: 150,
    method: 'tiktoken (cl100k_base)',
  },
  {
    type: 'text',
    content: '用户消息: 帮我读取 package.json 并分析依赖',
    tokens: 45,
    method: 'tiktoken (cl100k_base)',
  },
  {
    type: 'image',
    content: 'screenshot.png (1920x1080)',
    tokens: 1105,
    method: '基于图像尺寸估算',
  },
  {
    type: 'tool',
    content: 'Tool definitions: read_file, edit_file, shell...',
    tokens: 380,
    method: 'JSON 序列化后 tiktoken',
  },
  {
    type: 'text',
    content: '历史消息: 之前的对话上下文...',
    tokens: 820,
    method: 'tiktoken (cl100k_base)',
  },
];

// 模型限制配置
const modelLimits = {
  'qwen-coder-plus': { input: 131072, output: 16384 },
  'gemini-1.5-pro': { input: 2097152, output: 8192 },
  'gpt-4o': { input: 128000, output: 16384 },
};

type CountingPhase =
  | 'init'
  | 'classify'
  | 'count_text'
  | 'count_image'
  | 'count_tool'
  | 'aggregate'
  | 'check_limit'
  | 'complete';

interface CountingStep {
  phase: CountingPhase;
  title: string;
  description: string;
  code: string;
}

const countingSteps: CountingStep[] = [
  {
    phase: 'init',
    title: '初始化计数器',
    description: '准备 tiktoken 编码器和内容分类',
    code: `// requestTokenizer.ts - 初始化
import { Tiktoken, TiktokenModel } from 'tiktoken';

class DefaultRequestTokenizer {
  private encoder: Tiktoken;

  constructor() {
    // 使用 cl100k_base 编码器 (GPT-4 系列)
    this.encoder = new Tiktoken(
      cl100k_base.bpe_ranks,
      cl100k_base.special_tokens,
      cl100k_base.pat_str
    );
  }

  async calculateTokens(
    request: CountTokensParameters
  ): Promise<TokenCountResult> {
    // Step 1: 分类内容
    // Step 2: 并行计数
    // Step 3: 汇总结果
  }
}`,
  },
  {
    phase: 'classify',
    title: '内容分类',
    description: '将请求内容按类型分组',
    code: `// requestTokenizer.ts:48 - processAndGroupContents()
private processAndGroupContents(request: CountTokensParameters) {
  const groups = {
    textContents: [] as string[],
    imageContents: [] as ImageContent[],
    audioContents: [] as AudioContent[],
    toolContents: [] as ToolDefinition[],
    otherContents: [] as unknown[]
  };

  // 处理 contents 数组
  for (const content of request.contents || []) {
    for (const part of content.parts) {
      if (part.text) {
        groups.textContents.push(part.text);
      } else if (part.inlineData?.mimeType?.startsWith('image/')) {
        groups.imageContents.push(part.inlineData);
      } else if (part.inlineData?.mimeType?.startsWith('audio/')) {
        groups.audioContents.push(part.inlineData);
      } else {
        groups.otherContents.push(part);
      }
    }
  }

  // 处理系统指令
  if (request.config?.systemInstruction) {
    groups.textContents.push(
      extractText(request.config.systemInstruction)
    );
  }

  // 处理工具定义
  if (request.tools) {
    groups.toolContents.push(...request.tools);
  }

  return groups;
}`,
  },
  {
    phase: 'count_text',
    title: '文本 Token 计数',
    description: '使用 tiktoken 对文本进行编码计数',
    code: `// requestTokenizer.ts:95 - calculateTextTokens()
private calculateTextTokens(texts: string[]): number {
  let total = 0;

  for (const text of texts) {
    // tiktoken 编码
    const tokens = this.encoder.encode(text);
    total += tokens.length;
  }

  return total;
}

// tiktoken 内部原理:
// 1. BPE (Byte Pair Encoding) 算法
// 2. 将文本拆分为 subword 单元
// 3. 每个 subword 对应一个 token ID

// 示例:
// "Hello world" → [15496, 995] (2 tokens)
// "你好世界" → [57668, 16325, 99257] (3 tokens)
// "package.json" → [1858, 976, 6764] (3 tokens)`,
  },
  {
    phase: 'count_image',
    title: '图像 Token 估算',
    description: '基于图像尺寸计算 token 数量',
    code: `// requestTokenizer.ts:115 - calculateImageTokens()
private calculateImageTokens(images: ImageContent[]): number {
  let total = 0;

  for (const image of images) {
    // 获取图像尺寸
    const { width, height } = this.getImageDimensions(image);

    // 计算 tile 数量 (每个 tile 512x512)
    const tilesX = Math.ceil(width / 512);
    const tilesY = Math.ceil(height / 512);
    const numTiles = tilesX * tilesY;

    // 每个 tile 约 85 tokens
    // 加上基础开销 (约 85 tokens)
    const imageTokens = Math.max(
      6,  // 最小 6 tokens
      numTiles * 85 + 85
    );

    total += imageTokens;
  }

  return total;
}

// 示例计算:
// 1920x1080 图像:
// tilesX = ceil(1920/512) = 4
// tilesY = ceil(1080/512) = 3
// numTiles = 12
// tokens = 12 * 85 + 85 = 1105`,
  },
  {
    phase: 'count_tool',
    title: '工具定义 Token 计数',
    description: '序列化工具定义后计数',
    code: `// requestTokenizer.ts:140 - calculateToolTokens()
private calculateToolTokens(tools: ToolDefinition[]): number {
  // 将工具定义序列化为 JSON 字符串
  const toolsJson = JSON.stringify(tools, null, 0);

  // 使用 tiktoken 计数
  const tokens = this.encoder.encode(toolsJson);

  // 添加格式开销 (约 10%)
  return Math.ceil(tokens.length * 1.1);
}

// 工具定义示例:
{
  "name": "read_file",
  "description": "Read file content from disk",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Absolute file path"
      }
    },
    "required": ["path"]
  }
}
// ≈ 65 tokens per tool`,
  },
  {
    phase: 'aggregate',
    title: '汇总计数结果',
    description: '合并所有类型的 token 计数',
    code: `// requestTokenizer.ts:160 - 汇总
async calculateTokens(request: CountTokensParameters) {
  const groups = this.processAndGroupContents(request);

  // 并行计算各类型 (提高效率)
  const [textTokens, imageTokens, audioTokens, toolTokens] =
    await Promise.all([
      this.calculateTextTokens(groups.textContents),
      this.calculateImageTokens(groups.imageContents),
      this.calculateAudioTokens(groups.audioContents),
      this.calculateToolTokens(groups.toolContents)
    ]);

  // 其他内容使用降级估算
  const otherTokens = this.calculateFallbackTokens(
    groups.otherContents
  );

  const totalTokens = textTokens + imageTokens + audioTokens +
                      toolTokens + otherTokens;

  return {
    totalTokens,
    breakdown: {
      textTokens,
      imageTokens,
      audioTokens,
      toolTokens,
      otherTokens
    }
  };
}`,
  },
  {
    phase: 'check_limit',
    title: '限制检查',
    description: '与模型限制比较，判断是否超限',
    code: `// tokenLimits.ts - 获取模型限制
export function tokenLimit(
  model: string,
  type: 'input' | 'output' = 'input'
): number {
  // 规范化模型名称
  const normalized = normalize(model);
  // "qwen-coder-plus-latest" → "qwen-coder-plus"

  // 匹配限制规则
  for (const [pattern, limit] of PATTERNS) {
    if (pattern.test(normalized)) {
      return limit;
    }
  }

  return type === 'input'
    ? DEFAULT_TOKEN_LIMIT      // 131072
    : DEFAULT_OUTPUT_TOKEN_LIMIT; // 4096
}

// client.ts - 限制检查
async sendMessage(content: string): Promise<void> {
  const inputLimit = tokenLimit(this.model, 'input');
  const requestTokens = await this.tokenizer.calculateTokens(request);

  if (requestTokens.totalTokens > inputLimit) {
    // 触发压缩或警告
    yield {
      type: GeminiEventType.SessionTokenLimitExceeded,
      data: {
        current: requestTokens.totalTokens,
        limit: inputLimit
      }
    };
  }
}`,
  },
  {
    phase: 'complete',
    title: '计数完成',
    description: '返回最终结果供决策使用',
    code: `// 最终 TokenCountResult
{
  totalTokens: 2500,
  breakdown: {
    textTokens: 1015,      // 系统 + 用户 + 历史
    imageTokens: 1105,     // 截图
    audioTokens: 0,
    toolTokens: 380,       // 工具定义
    otherTokens: 0
  },
  processingTime: 12,      // ms

  // 与限制比较
  limit: 131072,
  usage: "1.9%",
  withinLimit: true
}

// 使用场景:
// 1. 请求前预检 - 避免超限请求
// 2. 上下文管理 - 决定是否需要压缩
// 3. 成本估算 - 基于 token 计费
// 4. 调试诊断 - 查看 token 分布`,
  },
];

// Token 分布饼图
function TokenBreakdown({
  items,
  currentIndex,
}: {
  items: ContentItem[];
  currentIndex: number;
}) {
  const total = items.slice(0, currentIndex + 1).reduce((sum, item) => sum + item.tokens, 0);

  const typeColors = {
    text: 'var(--terminal-green)',
    image: 'var(--amber)',
    audio: 'var(--purple)',
    tool: 'var(--cyber-blue)',
  };

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--amber)]">📊</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">Token 分布</span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const percentage = total > 0 ? (item.tokens / total) * 100 : 0;

          return (
            <div
              key={i}
              className={`transition-all duration-300 ${
                isActive ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span style={{ color: typeColors[item.type] }}>
                  {isCurrent && '▶ '}
                  {item.type}
                </span>
                <span className="text-[var(--text-muted)]">{item.tokens} tokens</span>
              </div>
              <div className="h-2 bg-[var(--bg-void)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCurrent ? 'animate-pulse' : ''
                  }`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: typeColors[item.type],
                  }}
                />
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5 truncate">
                {item.content.slice(0, 40)}...
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between text-sm font-mono">
          <span className="text-[var(--text-muted)]">总计</span>
          <span className="text-[var(--terminal-green)] font-bold">{total} tokens</span>
        </div>
      </div>
    </div>
  );
}

// 限制检查可视化
function LimitChecker({
  total,
  limit,
  model,
}: {
  total: number;
  limit: number;
  model: string;
}) {
  const percentage = (total / limit) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;

  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--cyber-blue)]">🔍</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">限制检查</span>
      </div>

      <div className="mb-3">
        <div className="text-xs font-mono text-[var(--text-muted)] mb-1">模型: {model}</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">
          限制: {limit.toLocaleString()} tokens
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-6 bg-[var(--bg-void)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ${
            isOverLimit
              ? 'bg-[var(--error)]'
              : isNearLimit
              ? 'bg-[var(--amber)]'
              : 'bg-[var(--terminal-green)]'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[var(--text-primary)]">
          {percentage.toFixed(2)}%
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isOverLimit
              ? 'bg-[var(--error)]'
              : isNearLimit
              ? 'bg-[var(--amber)] animate-pulse'
              : 'bg-[var(--terminal-green)]'
          }`}
        />
        <span
          className={`text-xs font-mono ${
            isOverLimit
              ? 'text-[var(--error)]'
              : isNearLimit
              ? 'text-[var(--amber)]'
              : 'text-[var(--terminal-green)]'
          }`}
        >
          {isOverLimit ? '超出限制！' : isNearLimit ? '接近限制' : '正常范围'}
        </span>
      </div>
    </div>
  );
}

export function TokenCountingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [contentIndex, setContentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = countingSteps[currentStep];
  const totalTokens = requestContents
    .slice(0, contentIndex + 1)
    .reduce((sum, item) => sum + item.tokens, 0);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= countingSteps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
      // 在 count 阶段递增内容索引
      if (currentStep >= 1 && currentStep <= 4) {
        setContentIndex((i) => Math.min(i + 1, requestContents.length - 1));
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const play = useCallback(() => {
    setCurrentStep(0);
    setContentIndex(-1);
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    if (currentStep < countingSteps.length - 1) {
      setCurrentStep((s) => s + 1);
      if (currentStep >= 1 && currentStep <= 4) {
        setContentIndex((i) => Math.min(i + 1, requestContents.length - 1));
      }
    } else {
      setCurrentStep(0);
      setContentIndex(-1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setContentIndex(-1);
    setIsPlaying(false);
  }, []);

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--terminal-green)] via-[var(--amber)] to-[var(--cyber-blue)]" />

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--terminal-green)]">🔢</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
          Token 计数管道
        </h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // tiktoken 编码和多类型内容的 token 估算
        <br />
        // 源码位置: packages/core/src/utils/request-tokenizer/requestTokenizer.ts
      </p>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放计数过程
        </button>
        <button
          onClick={stepForward}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 下一步
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Token breakdown */}
        <TokenBreakdown items={requestContents} currentIndex={contentIndex} />

        {/* Limit checker */}
        <LimitChecker
          total={totalTokens}
          limit={modelLimits['qwen-coder-plus'].input}
          model="qwen-coder-plus"
        />

        {/* Code panel */}
        <div className="bg-[var(--bg-void)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center gap-2">
            <span className="text-[var(--terminal-green)]">$</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">{step.title}</span>
          </div>
          <div className="p-4 max-h-[350px] overflow-y-auto">
            <JsonBlock code={step.code} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[var(--terminal-green)] font-mono">$</span>
          <span className="text-[var(--text-secondary)] font-mono">
            步骤：<span className="text-[var(--terminal-green)] font-bold">{currentStep + 1}</span>/{countingSteps.length}
          </span>
          {isPlaying && (
            <span className="text-[var(--amber)] font-mono text-sm animate-pulse">● 计数中</span>
          )}
        </div>
        <div className="font-mono text-sm text-[var(--text-primary)] pl-6">
          {step.description}
        </div>
        <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--terminal-green)] via-[var(--amber)] to-[var(--cyber-blue)] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / countingSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Model limits reference */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(modelLimits).map(([model, limits]) => (
          <div key={model} className="p-3 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
            <div className="text-xs font-mono text-[var(--terminal-green)] font-bold mb-2">{model}</div>
            <div className="space-y-1 text-xs font-mono text-[var(--text-muted)]">
              <div>Input: {(limits.input / 1024).toFixed(0)}K tokens</div>
              <div>Output: {(limits.output / 1024).toFixed(0)}K tokens</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
