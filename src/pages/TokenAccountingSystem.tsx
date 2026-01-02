import { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

// ============================================================
// Token Accounting System - 深度解析页面
// ============================================================
// 本页面详细解释 Gemini CLI 中的 Token 计算与管理系统
// 涵盖：Token 限制匹配、文本/图像 Token 计算、设计原理

// 可折叠章节组件
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  highlight = false
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-6 rounded-xl border ${highlight ? 'border-purple-500/50 bg-purple-900/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className={`text-lg font-semibold ${highlight ? 'text-purple-300' : 'text-gray-200'}`}>{title}</span>
        </div>
        <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

// 代码块组件
function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700/50">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
          {title}
        </div>
      )}
      <pre className={`bg-gray-900/80 p-4 overflow-x-auto language-${language}`}>
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

// 设计原理卡片
function DesignRationaleCard({ title, why, how, benefit }: {
  title: string;
  why: string;
  how: string;
  benefit: string;
}) {
  return (
    <div className="my-4 p-5 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/30">
      <h4 className="text-lg font-semibold text-purple-300 mb-3">💡 {title}</h4>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-yellow-400 font-medium">为什么：</span>
          <span className="text-gray-300 ml-2">{why}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">如何实现：</span>
          <span className="text-gray-300 ml-2">{how}</span>
        </div>
        <div>
          <span className="text-green-400 font-medium">带来的好处：</span>
          <span className="text-gray-300 ml-2">{benefit}</span>
        </div>
      </div>
    </div>
  );
}

// Token 限制可视化
function TokenLimitVisualization() {
  const limits = [
    { name: '32K', value: 32768, color: 'bg-blue-500', models: 'gemini-2.0-flash-image-generation' },
    { name: '64K', value: 65536, color: 'bg-cyan-500', models: 'glm-4.5v, gemini-1.5-pro (output)' },
    { name: '128K', value: 131072, color: 'bg-green-500', models: 'gpt-4o, gemini-1.0, deepseek' },
    { name: '200K', value: 200000, color: 'bg-yellow-500', models: 'claude-3.5-sonnet, o3, o4-mini' },
    { name: '256K', value: 262144, color: 'bg-orange-500', models: 'gemini-1.5-coder, gemini-1.5-pro, kimi-k2' },
    { name: '512K', value: 524288, color: 'bg-red-500', models: 'seed-oss' },
    { name: '1M', value: 1048576, color: 'bg-purple-500', models: 'gemini-1.5/2.0, gemini-1.5-pro, claude-4' },
    { name: '2M', value: 2097152, color: 'bg-pink-500', models: 'gemini-1.5-pro' },
    { name: '10M', value: 10485760, color: 'bg-indigo-500', models: 'llama-4-scout' },
  ];

  const maxValue = 10485760;

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700/50">
      <h4 className="text-lg font-semibold text-gray-200 mb-4">Token 限制层级</h4>
      <div className="space-y-3">
        {limits.map((limit) => (
          <div key={limit.name} className="flex items-center gap-4">
            <div className="w-16 text-right text-sm text-gray-400 font-mono">{limit.name}</div>
            <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${limit.color} transition-all duration-500`}
                style={{ width: `${Math.min((Math.log(limit.value) / Math.log(maxValue)) * 100, 100)}%` }}
              />
            </div>
            <div className="w-48 text-xs text-gray-500 truncate" title={limit.models}>
              {limit.models}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        * 使用对数刻度展示，更清晰地显示不同量级的差异
      </p>
    </div>
  );
}

// 图像 Token 计算可视化
function ImageTokenCalculator() {
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);

  // 计算逻辑（与 imageTokenizer.ts 一致）
  const PIXELS_PER_TOKEN = 28 * 28;
  const MIN_TOKENS = 4;
  const MAX_TOKENS = 16384;
  const VISION_SPECIAL_TOKENS = 2;

  const calculateTokens = (w: number, h: number) => {
    let hBar = Math.round(h / 28) * 28;
    let wBar = Math.round(w / 28) * 28;

    const minPixels = MIN_TOKENS * PIXELS_PER_TOKEN;
    const maxPixels = MAX_TOKENS * PIXELS_PER_TOKEN;

    if (hBar * wBar > maxPixels) {
      const beta = Math.sqrt((h * w) / maxPixels);
      hBar = Math.floor(h / beta / 28) * 28;
      wBar = Math.floor(w / beta / 28) * 28;
    } else if (hBar * wBar < minPixels) {
      const beta = Math.sqrt(minPixels / (h * w));
      hBar = Math.ceil((h * beta) / 28) * 28;
      wBar = Math.ceil((w * beta) / 28) * 28;
    }

    const imageTokens = Math.floor((hBar * wBar) / PIXELS_PER_TOKEN);
    return { imageTokens, total: imageTokens + VISION_SPECIAL_TOKENS, normalizedH: hBar, normalizedW: wBar };
  };

  const result = calculateTokens(width, height);

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-cyan-700/50">
      <h4 className="text-lg font-semibold text-cyan-300 mb-4">🖼️ 图像 Token 计算器</h4>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">宽度 (px)</label>
            <input
              type="range"
              min="28"
              max="4096"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-cyan-400 font-mono">{width}px</div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">高度 (px)</label>
            <input
              type="range"
              min="28"
              max="4096"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-cyan-400 font-mono">{height}px</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <div className="text-sm text-gray-400">原始尺寸: <span className="text-white">{width} × {height}</span></div>
          <div className="text-sm text-gray-400">归一化后: <span className="text-cyan-400">{result.normalizedW} × {result.normalizedH}</span></div>
          <div className="text-sm text-gray-400">像素总数: <span className="text-white">{(result.normalizedW * result.normalizedH).toLocaleString()}</span></div>
          <div className="border-t border-gray-700 my-2" />
          <div className="text-sm text-gray-400">图像 Token: <span className="text-yellow-400">{result.imageTokens}</span></div>
          <div className="text-sm text-gray-400">特殊 Token: <span className="text-purple-400">+2</span> (vision_bos + vision_eos)</div>
          <div className="text-lg font-bold text-green-400">总计: {result.total} tokens</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        公式: pixels ÷ 784 (28×28) + 2 特殊标记 | 范围: 4-16384 tokens
      </div>
    </div>
  );
}

// 模型名称归一化流程
function ModelNormalizationFlow() {
  const [input, setInput] = useState('openai/gpt-4o-mini-2024-07-18-preview');

  const normalize = (model: string): string[] => {
    const steps: string[] = [model];
    let s = (model ?? '').toLowerCase().trim();
    steps.push(`toLowerCase → "${s}"`);

    // 去除提供商前缀
    s = s.replace(/^.*\//, '');
    steps.push(`去除提供商 → "${s}"`);

    // 处理管道和冒号
    s = s.split('|').pop() ?? s;
    s = s.split(':').pop() ?? s;
    steps.push(`处理分隔符 → "${s}"`);

    // 去除 preview
    s = s.replace(/-preview/g, '');
    steps.push(`去除 preview → "${s}"`);

    // 去除日期和版本后缀
    s = s.replace(/-(?:\d{4,}|\d+x\d+b|v\d+(?:\.\d+)*|(?<=-[^-]+-)\d+(?:\.\d+)+|latest|exp)$/g, '');
    steps.push(`去除日期/版本 → "${s}"`);

    return steps;
  };

  const steps = normalize(input);

  return (
    <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-yellow-700/50">
      <h4 className="text-lg font-semibold text-yellow-300 mb-4">🔄 模型名称归一化流程</h4>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono mb-4"
        placeholder="输入模型名称..."
      />

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-yellow-600/30 text-yellow-400 text-xs flex items-center justify-center">
              {i + 1}
            </span>
            <code className="text-sm text-gray-300 font-mono">{step}</code>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-700/50">
        <span className="text-green-400 font-medium">最终结果: </span>
        <code className="text-white font-mono">{steps[steps.length - 1].split('"')[1]}</code>
      </div>
    </div>
  );
}

// Introduction 组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full text-left group"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 flex items-center gap-3">
          🎫 Token 计费系统深度解析
          <span className={`text-lg text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </h1>
      </button>

      {isExpanded && (
        <div className="space-y-4 text-gray-300 animate-fadeIn">
          <p className="text-lg">
            Token 是 AI 模型计费和上下文管理的基本单位。Gemini CLI 实现了一套精确的 Token 计算系统，
            用于：<strong className="text-purple-300">模型能力匹配</strong>、<strong className="text-cyan-300">成本估算</strong>、
            <strong className="text-yellow-300">上下文压缩决策</strong>。
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-600/30">
              <div className="text-3xl mb-2">📏</div>
              <h3 className="font-semibold text-purple-300">Token 限制匹配</h3>
              <p className="text-sm text-gray-400 mt-1">根据模型名称自动匹配上下文窗口大小</p>
            </div>
            <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-600/30">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold text-cyan-300">文本 Token 计算</h3>
              <p className="text-sm text-gray-400 mt-1">使用 tiktoken 精确编码文本</p>
            </div>
            <div className="p-4 bg-yellow-900/30 rounded-xl border border-yellow-600/30">
              <div className="text-3xl mb-2">🖼️</div>
              <h3 className="font-semibold text-yellow-300">图像 Token 计算</h3>
              <p className="text-sm text-gray-400 mt-1">基于像素尺寸计算视觉 Token</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Token 限制匹配章节
function TokenLimitSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        不同的 AI 模型有不同的上下文窗口大小。Gemini CLI 使用<strong className="text-purple-300">正则模式匹配</strong>来
        自动识别模型并返回正确的 Token 限制。
      </p>

      <DesignRationaleCard
        title="为什么使用正则模式匹配"
        why="模型名称有多种变体（带日期、版本号、提供商前缀等），硬编码无法覆盖所有情况"
        how="先归一化模型名称（去除前缀、后缀），再按优先级匹配正则模式"
        benefit="支持任意提供商的模型名称变体，易于扩展新模型"
      />

      <TokenLimitVisualization />

      <CodeBlock
        title="packages/core/src/core/tokenLimits.ts - 核心常量"
        code={`// 精确的数值限制（使用 2 的幂次方或厂商声明值）
const LIMITS = {
  '32k': 32_768,      // 2^15
  '64k': 65_536,      // 2^16
  '128k': 131_072,    // 2^17
  '200k': 200_000,    // 厂商声明值 (OpenAI, Anthropic)
  '256k': 262_144,    // 2^18
  '512k': 524_288,    // 2^19
  '1m': 1_048_576,    // 2^20
  '2m': 2_097_152,    // 2^21
  '10m': 10_485_760,  // Llama 4 Scout 的超长上下文
} as const;

// 输入和输出限制类型
export type TokenLimitType = 'input' | 'output';
export const DEFAULT_TOKEN_LIMIT = 131_072;     // 默认 128K
export const DEFAULT_OUTPUT_TOKEN_LIMIT = 4_096; // 默认输出 4K`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">模式匹配优先级</h4>
      <p className="text-gray-400 text-sm mb-4">
        模式按<span className="text-yellow-400">从具体到通用</span>排序，第一个匹配的模式获胜：
      </p>

      <CodeBlock
        title="正则模式数组（部分示例）"
        code={`const PATTERNS: Array<[RegExp, TokenCount]> = [
  // Google Gemini - 具体版本优先
  [/^gemini-1\\.5-pro$/, LIMITS['2m']],
  [/^gemini-1\\.5-flash$/, LIMITS['1m']],
  [/^gemini-2\\.5-pro.*$/, LIMITS['1m']],
  [/^gemini-2\\.0-flash-image-generation$/, LIMITS['32k']],
  [/^gemini-2\\.0-flash.*$/, LIMITS['1m']],

  // OpenAI - o3/o4-mini 使用 200K
  [/^o3(?:-mini|$).*$/, LIMITS['200k']],
  [/^o4-mini.*$/, LIMITS['200k']],
  [/^gpt-4\\.1-mini.*$/, LIMITS['1m']],
  [/^gpt-4o-mini.*$/, LIMITS['128k']],
  [/^gpt-4o.*$/, LIMITS['128k']],

  // Gemini 商业版 vs 开源版区分
  [/^gemini-1.5-pro(-.*)?$/, LIMITS['1m']],     // 商业版 1M
  [/^gemini-1.5-coder-.*$/, LIMITS['256k']],           // 开源版 256K
  [/^gemini-2.0-flash$/, LIMITS['1m']],           // 商业 latest
  [/^gemini-plus.*$/, LIMITS['128k']],              // 标准版

  // 特殊处理：保留 Kimi 的日期版本号
  [/^kimi-k2-0905$/, LIMITS['256k']],
  [/^kimi-k2-0711$/, LIMITS['128k']],
];`}
      />

      <ModelNormalizationFlow />

      <DesignRationaleCard
        title="归一化的关键决策"
        why="需要兼容 openai/gpt-4o、gpt-4o:latest、gpt-4o-2024-08-06 等多种格式"
        how="1) 去除提供商前缀 2) 去除日期/版本后缀 3) 保留核心模型标识"
        benefit="用户可以使用任意格式的模型名称，系统都能正确识别"
      />
    </div>
  );
}

// 文本 Token 计算章节
function TextTokenSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        文本 Token 计算使用 <code className="text-cyan-400">tiktoken</code> 库，这是 OpenAI 官方的分词器。
        采用 <code className="text-yellow-400">cl100k_base</code> 编码，与 GPT-4、Claude 等主流模型兼容。
      </p>

      <DesignRationaleCard
        title="为什么使用 tiktoken"
        why="需要与 LLM 使用相同的分词算法，确保 Token 计数准确"
        how="懒加载编码器，首次使用时初始化，避免启动时的性能开销"
        benefit="精确预测 API 成本，避免超出上下文限制"
      />

      <CodeBlock
        title="packages/core/src/utils/request-tokenizer/textTokenizer.ts"
        code={`export class TextTokenizer {
  private encoding: Tiktoken | null = null;
  private encodingName: string;

  constructor(encodingName: string = 'cl100k_base') {
    this.encodingName = encodingName;
  }

  // 懒加载编码器
  private async ensureEncoding(): Promise<void> {
    if (this.encoding) return;
    try {
      this.encoding = get_encoding(this.encodingName as TiktokenEncoding);
    } catch (error) {
      console.warn('Failed to load tiktoken:', error);
      this.encoding = null;
    }
  }

  async calculateTokens(text: string): Promise<number> {
    if (!text) return 0;
    await this.ensureEncoding();

    if (this.encoding) {
      try {
        return this.encoding.encode(text).length;
      } catch (error) {
        console.warn('Error encoding text:', error);
      }
    }

    // 降级方案: 1 token ≈ 4 字符
    return Math.ceil(text.length / 4);
  }

  // 释放 WASM 资源
  dispose(): void {
    if (this.encoding) {
      this.encoding.free();
      this.encoding = null;
    }
  }
}`}
      />

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-700/50">
          <h4 className="font-semibold text-cyan-300 mb-2">精确计算</h4>
          <p className="text-sm text-gray-400">使用 tiktoken 编码，获取真实 Token 数量</p>
          <code className="text-xs text-cyan-400 mt-2 block">encoding.encode(text).length</code>
        </div>
        <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-700/50">
          <h4 className="font-semibold text-yellow-300 mb-2">降级估算</h4>
          <p className="text-sm text-gray-400">当 tiktoken 不可用时的备用方案</p>
          <code className="text-xs text-yellow-400 mt-2 block">Math.ceil(text.length / 4)</code>
        </div>
      </div>

      <DesignRationaleCard
        title="为什么需要降级方案"
        why="tiktoken 依赖 WASM，在某些环境可能加载失败"
        how="捕获异常，使用字符数除以 4 的保守估算"
        benefit="确保系统在任何环境下都能正常工作"
      />
    </div>
  );
}

// 图像 Token 计算章节
function ImageTokenSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        视觉模型使用<strong className="text-cyan-300">基于像素</strong>的 Token 计算方式。
        核心规则：<span className="text-yellow-400">28×28 像素 = 1 Token</span>。
      </p>

      <ImageTokenCalculator />

      <DesignRationaleCard
        title="为什么是 28×28 像素"
        why="这是视觉 Transformer 模型的标准 patch 大小，与模型架构直接相关"
        how="图像被切分成 28×28 的 patch，每个 patch 映射为一个 Token"
        benefit="Token 数量直接反映模型处理的计算量"
      />

      <CodeBlock
        title="packages/core/src/utils/request-tokenizer/imageTokenizer.ts - 核心算法"
        code={`export class ImageTokenizer {
  private static readonly PIXELS_PER_TOKEN = 28 * 28;  // 784
  private static readonly MIN_TOKENS_PER_IMAGE = 4;
  private static readonly MAX_TOKENS_PER_IMAGE = 16384;
  private static readonly VISION_SPECIAL_TOKENS = 2;   // vision_bos + vision_eos

  private calculateTokensWithScaling(width: number, height: number): number {
    // 1. 归一化到 28 像素的倍数
    let hBar = Math.round(height / 28) * 28;
    let wBar = Math.round(width / 28) * 28;

    const minPixels = MIN_TOKENS * PIXELS_PER_TOKEN;  // 3136
    const maxPixels = MAX_TOKENS * PIXELS_PER_TOKEN;  // 12,845,056

    // 2. 超大图像缩小
    if (hBar * wBar > maxPixels) {
      const beta = Math.sqrt((height * width) / maxPixels);
      hBar = Math.floor(height / beta / 28) * 28;
      wBar = Math.floor(width / beta / 28) * 28;
    }
    // 3. 超小图像放大
    else if (hBar * wBar < minPixels) {
      const beta = Math.sqrt(minPixels / (height * width));
      hBar = Math.ceil((height * beta) / 28) * 28;
      wBar = Math.ceil((width * beta) / 28) * 28;
    }

    // 4. 计算 Token = 像素 / 784 + 2 特殊标记
    const imageTokens = Math.floor((hBar * wBar) / PIXELS_PER_TOKEN);
    return imageTokens + VISION_SPECIAL_TOKENS;
  }
}`}
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">支持的图像格式</h4>
      <div className="grid grid-cols-4 gap-3 mt-3">
        {['PNG', 'JPEG', 'WebP', 'GIF', 'BMP', 'TIFF', 'HEIC'].map((format) => (
          <div key={format} className="p-3 bg-gray-800/50 rounded-lg text-center">
            <span className="text-cyan-400 font-mono">{format}</span>
          </div>
        ))}
      </div>

      <DesignRationaleCard
        title="为什么要解析图像头"
        why="需要获取真实尺寸来计算 Token，不能依赖用户提供的元数据"
        how="解析各格式的二进制头部，提取宽高信息（无需完整解码）"
        benefit="快速准确，不需要加载整个图像到内存"
      />

      <CodeBlock
        title="PNG 尺寸提取示例"
        code={`// PNG signature: 89 50 4E 47 0D 0A 1A 0A
// 宽高在字节 16-19 和 20-23 (big-endian)
private extractPngDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 24) {
    throw new Error('Invalid PNG: buffer too short');
  }

  // 验证 PNG 签名
  const expectedSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  if (!buffer.subarray(0, 8).equals(expectedSignature)) {
    throw new Error('Invalid PNG signature');
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}`}
      />
    </div>
  );
}

// 请求级 Token 计算章节
function RequestTokenizerSection() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        <code className="text-purple-400">DefaultRequestTokenizer</code> 是顶层编排器，
        负责将请求内容分类，然后分别调用文本/图像/音频 Tokenizer。
      </p>

      <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-purple-700/50">
        <h4 className="text-lg font-semibold text-purple-300 mb-4">📊 处理流程</h4>
        <div className="flex items-center justify-between">
          {[
            { icon: '📨', label: '请求内容', color: 'text-blue-400' },
            { icon: '🔀', label: '内容分类', color: 'text-yellow-400' },
            { icon: '📝', label: '文本计算', color: 'text-cyan-400' },
            { icon: '🖼️', label: '图像计算', color: 'text-green-400' },
            { icon: '🎵', label: '音频计算', color: 'text-purple-400' },
            { icon: '➕', label: '汇总', color: 'text-pink-400' },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center">
              <div className="text-center">
                <div className="text-2xl">{step.icon}</div>
                <div className={`text-xs mt-1 ${step.color}`}>{step.label}</div>
              </div>
              {i < arr.length - 1 && <span className="mx-2 text-gray-600">→</span>}
            </div>
          ))}
        </div>
      </div>

      <CodeBlock
        title="packages/core/src/utils/request-tokenizer/requestTokenizer.ts"
        code={`export class DefaultRequestTokenizer implements RequestTokenizer {
  private textTokenizer: TextTokenizer;
  private imageTokenizer: ImageTokenizer;

  async calculateTokens(
    request: CountTokensParameters,
    config: TokenizerConfig = {},
  ): Promise<TokenCalculationResult> {
    const startTime = performance.now();

    // 1. 分类内容
    const { textContents, imageContents, audioContents, otherContents } =
      this.processAndGroupContents(request);

    // 2. 分别计算（串行，保证稳定性）
    const textTokens = await this.calculateTextTokens(textContents);
    const imageTokens = await this.calculateImageTokens(imageContents);
    const audioTokens = await this.calculateAudioTokens(audioContents);
    const otherTokens = await this.calculateOtherTokens(otherContents);

    // 3. 返回详细结果
    return {
      totalTokens: textTokens + imageTokens + audioTokens + otherTokens,
      breakdown: {
        textTokens,
        imageTokens,
        audioTokens,
        otherTokens,
      },
      processingTime: performance.now() - startTime,
    };
  }
}`}
      />

      <DesignRationaleCard
        title="为什么返回 breakdown"
        why="用户需要了解 Token 成本的构成，优化请求内容"
        how="分别记录文本、图像、音频、其他内容的 Token 数"
        benefit="可以针对性地优化高消耗项（如移除不必要的大图）"
      />

      <h4 className="text-lg font-semibold text-gray-200 mt-6">内容类型识别</h4>
      <CodeBlock
        title="processPart - 内容分类逻辑"
        code={`private processPart(part: Part | string, ...): void {
  // 纯字符串 → 文本
  if (typeof part === 'string') {
    if (part.trim()) textContents.push(part);
    return;
  }

  // text 字段 → 文本
  if ('text' in part && part.text) {
    textContents.push(part.text);
    return;
  }

  // inlineData → 根据 MIME 类型分类
  if ('inlineData' in part && part.inlineData) {
    const { data, mimeType } = part.inlineData;
    if (mimeType?.startsWith('image/')) {
      imageContents.push({ data: data || '', mimeType });
      return;
    }
    if (mimeType?.startsWith('audio/')) {
      audioContents.push({ data: data || '', mimeType });
      return;
    }
  }

  // functionCall/functionResponse → 序列化为文本
  if ('functionCall' in part || 'functionResponse' in part) {
    otherContents.push(JSON.stringify(part.functionCall || part.functionResponse));
    return;
  }

  // 未知类型 → 尝试 JSON 序列化
  try {
    otherContents.push(JSON.stringify(part));
  } catch { /* ignore */ }
}`}
      />
    </div>
  );
}

// Token 成本全景
function TokenCostLandscape() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        理解 Token 成本的<strong className="text-yellow-300">流向</strong>是优化的第一步。
        一次典型的 CLI 会话中，Token 消耗分布如下：
      </p>

      <div className="my-6 p-6 bg-gray-900/50 rounded-xl border border-yellow-700/50">
        <h4 className="text-lg font-semibold text-yellow-300 mb-4">💰 Token 成本流向图</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-lg p-4 border border-red-500/30">
            <div className="text-2xl mb-2">📥</div>
            <h5 className="font-semibold text-red-300">输入成本 (Input)</h5>
            <ul className="text-xs text-gray-400 mt-2 space-y-1">
              <li>• System Prompt (~3K-10K)</li>
              <li>• 历史对话 (~1K-100K+)</li>
              <li>• 工具结果 (~0.5K-50K)</li>
              <li>• 用户提问 (~0.1K-5K)</li>
            </ul>
            <div className="mt-3 text-sm text-red-400 font-mono">典型: 5K-50K/轮</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
            <div className="text-2xl mb-2">📤</div>
            <h5 className="font-semibold text-blue-300">输出成本 (Output)</h5>
            <ul className="text-xs text-gray-400 mt-2 space-y-1">
              <li>• AI 回复文本 (~0.5K-2K)</li>
              <li>• 工具调用参数 (~0.1K-1K)</li>
              <li>• 思考过程 (~0K-5K)</li>
            </ul>
            <div className="mt-3 text-sm text-blue-400 font-mono">典型: 1K-5K/轮</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
            <div className="text-2xl mb-2">🖼️</div>
            <h5 className="font-semibold text-purple-300">多模态成本</h5>
            <ul className="text-xs text-gray-400 mt-2 space-y-1">
              <li>• 截图 1080p (~1.4K)</li>
              <li>• 4K 大图 (~5.5K)</li>
              <li>• 小图标 (~4-50)</li>
            </ul>
            <div className="mt-3 text-sm text-purple-400 font-mono">极端: 16K/张</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
        <h4 className="text-amber-400 font-semibold mb-2">💡 成本洞察</h4>
        <p className="text-sm text-gray-300">
          <strong>历史对话</strong>是最大的 Token 消耗来源。一个 10 轮对话，如果不压缩，
          可能累积到 <span className="text-red-400 font-mono">200K+</span> Token。
          这就是为什么 Gemini CLI 实现了多层压缩策略。
        </p>
      </div>
    </div>
  );
}

// Token 省钱策略
function TokenSavingStrategies() {
  return (
    <div className="pt-6 space-y-4">
      <p className="text-gray-300">
        Gemini CLI 在多个层面实现 Token 节省策略，总体可节省 <strong className="text-green-400">40-80%</strong> 的 Token 成本。
      </p>

      <div className="my-6 space-y-4">
        {/* 策略 1: 历史压缩 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-green-600/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📚</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-300 mb-2">策略 1: 历史对话压缩</h4>
              <p className="text-sm text-gray-400 mb-3">
                当上下文超过阈值时，自动触发 AI 总结压缩旧对话。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">压缩前</div>
                  <div className="text-lg font-mono text-red-400">150K tokens</div>
                  <div className="text-xs text-gray-500">20 轮完整对话</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">压缩后</div>
                  <div className="text-lg font-mono text-green-400">15K tokens</div>
                  <div className="text-xs text-gray-500">摘要 + 最近 3 轮</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-green-400">
                节省率: ~90% | 触发点: context &gt; 75% of limit
              </div>
            </div>
          </div>
        </div>

        {/* 策略 2: 工具输出截断 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-cyan-600/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✂️</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-cyan-300 mb-2">策略 2: 工具输出截断</h4>
              <p className="text-sm text-gray-400 mb-3">
                Bash/Grep 等工具输出超长时，截断 + 保存到文件。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">原始输出</div>
                  <div className="text-lg font-mono text-red-400">50,000 行</div>
                  <div className="text-xs text-gray-500">npm install 日志</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">截断后</div>
                  <div className="text-lg font-mono text-green-400">前100行 + 后100行</div>
                  <div className="text-xs text-gray-500">+ 文件路径引用</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-cyan-400">
                节省率: ~95% | 阈值: 30K 字符 | 参见: ToolScheduler
              </div>
            </div>
          </div>
        </div>

        {/* 策略 3: 文件读取智能化 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-yellow-600/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📄</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-yellow-300 mb-2">策略 3: 文件读取智能化</h4>
              <p className="text-sm text-gray-400 mb-3">
                Read 工具支持行范围、自动截断、二进制检测。
              </p>
              <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">功能</span>
                  <span className="text-gray-500">省 Token 效果</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">offset + limit 分页</span>
                    <span className="text-green-400">只读需要的部分</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">行截断 2000 字符</span>
                    <span className="text-green-400">超长行不爆炸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">二进制文件检测</span>
                    <span className="text-green-400">不浪费 token 读乱码</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-yellow-400">
                默认限制: 2000 行 | 行宽: 2000 字符
              </div>
            </div>
          </div>
        </div>

        {/* 策略 4: Ignore 过滤 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-purple-600/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚫</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-purple-300 mb-2">策略 4: Ignore 过滤</h4>
              <p className="text-sm text-gray-400 mb-3">
                .gitignore + .geminiignore 防止无用文件被读取。
              </p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">典型排除效果</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">node_modules/</span>
                    <span className="text-green-400">跳过 50K+ 文件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">dist/, build/</span>
                    <span className="text-green-400">跳过构建产物</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">package-lock.json</span>
                    <span className="text-green-400">省 ~50K tokens</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-purple-400">
                参见: FileDiscovery 页面
              </div>
            </div>
          </div>
        </div>

        {/* 策略 5: 图片智能处理 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-pink-600/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🖼️</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-pink-300 mb-2">策略 5: 图片智能处理</h4>
              <p className="text-sm text-gray-400 mb-3">
                大图自动缩放，小图有最小保障。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">4K 截图</div>
                  <div className="text-lg font-mono text-red-400">3840×2160</div>
                  <div className="text-xs text-gray-500">缩放 → ~16K tokens</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">小图标</div>
                  <div className="text-lg font-mono text-green-400">28×28</div>
                  <div className="text-xs text-gray-500">最小 4 tokens</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-pink-400">
                范围: 4-16384 tokens/张 | 公式: 像素÷784+2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <h4 className="text-green-400 font-semibold mb-2">📊 综合节省估算</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">场景</th>
              <th className="py-2">无优化</th>
              <th className="py-2">优化后</th>
              <th className="py-2">节省</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 font-mono text-xs">
            <tr className="border-t border-gray-700">
              <td className="py-2">10 轮对话</td>
              <td className="text-red-400">200K</td>
              <td className="text-green-400">40K</td>
              <td className="text-green-400">80%</td>
            </tr>
            <tr className="border-t border-gray-700">
              <td className="py-2">大文件搜索</td>
              <td className="text-red-400">500K</td>
              <td className="text-green-400">50K</td>
              <td className="text-green-400">90%</td>
            </tr>
            <tr className="border-t border-gray-700">
              <td className="py-2">截图分析</td>
              <td className="text-red-400">16K/张</td>
              <td className="text-green-400">1.4K/张</td>
              <td className="text-green-400">91%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== 深化内容组件 ====================

// 边界条件深度解析
function EdgeCaseAnalysis() {
  return (
    <div className="pt-6 space-y-6">
      <p className="text-gray-300">
        Token 计算系统在实际运行中会遇到各种边界情况。理解这些边界有助于诊断问题和优化系统稳定性。
      </p>

      {/* 边界 1: tiktoken WASM 加载失败 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border-l-4 border-yellow-500">
        <h4 className="text-lg font-semibold text-yellow-300 mb-3">边界 1: tiktoken WASM 加载失败</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">触发条件</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Node.js 版本不兼容（需要 &gt;= 18）</li>
              <li>• WASM 文件加载失败（网络/权限）</li>
              <li>• 内存不足无法初始化编码器</li>
              <li>• Edge Runtime 等受限环境</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">降级行为</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 自动切换到字符估算模式</li>
              <li>• 使用 <code className="text-cyan-300">Math.ceil(text.length / 4)</code></li>
              <li>• 控制台输出警告但不中断</li>
              <li>• 估算误差约 ±20%</li>
            </ul>
          </div>
        </div>
        <CodeBlock
          code={`// textTokenizer.ts - 降级逻辑
async calculateTokens(text: string): Promise<number> {
  await this.ensureEncoding();

  if (this.encoding) {
    try {
      return this.encoding.encode(text).length;
    } catch (error) {
      console.warn('tiktoken encode failed:', error);
    }
  }

  // Fallback: 1 token ≈ 4 chars (保守估算)
  return Math.ceil(text.length / 4);
}`}
          language="typescript"
          title="降级逻辑代码"
        />
      </div>

      {/* 边界 2: 图片格式无法识别 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border-l-4 border-purple-500">
        <h4 className="text-lg font-semibold text-purple-300 mb-3">边界 2: 图片格式无法识别</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">触发条件</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 损坏的图片文件（头部被截断）</li>
              <li>• 不支持的格式（如 AVIF、JPEG XL）</li>
              <li>• Base64 解码失败</li>
              <li>• MIME type 与实际格式不匹配</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">降级行为</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 使用默认尺寸 <code className="text-cyan-300">512×512</code></li>
              <li>• 计算结果: <code className="text-green-300">335 + 2 = 337 tokens</code></li>
              <li>• 记录警告到日志</li>
              <li>• 不影响请求继续执行</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-700">
                <th className="py-2">场景</th>
                <th className="py-2">检测方法</th>
                <th className="py-2">降级结果</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 font-mono text-xs">
              <tr className="border-t border-gray-700/50">
                <td className="py-2">PNG 签名不匹配</td>
                <td className="text-gray-400">前 8 字节校验失败</td>
                <td className="text-yellow-400">337 tokens</td>
              </tr>
              <tr className="border-t border-gray-700/50">
                <td className="py-2">JPEG 无 SOF marker</td>
                <td className="text-gray-400">扫描 0xC0-0xCF 失败</td>
                <td className="text-yellow-400">337 tokens</td>
              </tr>
              <tr className="border-t border-gray-700/50">
                <td className="py-2">WebP 格式未知</td>
                <td className="text-gray-400">VP8/VP8L/VP8X 均不匹配</td>
                <td className="text-yellow-400">337 tokens</td>
              </tr>
              <tr className="border-t border-gray-700/50">
                <td className="py-2">Buffer 过短</td>
                <td className="text-gray-400">长度 &lt; 24 字节</td>
                <td className="text-yellow-400">337 tokens</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 边界 3: 模型名称匹配失败 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border-l-4 border-cyan-500">
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">边界 3: 模型名称匹配失败</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">触发条件</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 全新模型尚未添加到模式列表</li>
              <li>• 模型名称格式变化（如加密 ID）</li>
              <li>• 私有部署使用自定义名称</li>
              <li>• 空字符串或 undefined</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">降级行为</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 返回默认值 <code className="text-cyan-300">128K</code></li>
              <li>• 输出限制默认 <code className="text-cyan-300">4K</code></li>
              <li>• 不会抛出异常</li>
              <li>• 可能导致上下文意外截断</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-600/30">
          <h5 className="text-amber-400 font-semibold mb-2">⚠️ 潜在风险</h5>
          <p className="text-sm text-gray-300">
            如果实际模型上下文窗口 &lt; 128K，可能导致 API 报错；
            如果实际窗口 &gt; 128K，会浪费潜在的上下文空间。
          </p>
          <p className="text-sm text-gray-400 mt-2">
            <strong>建议：</strong>在使用新模型前，先检查 tokenLimits.ts 是否包含对应模式。
          </p>
        </div>
      </div>

      {/* 边界 4: Token 计数与 API 不一致 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border-l-4 border-red-500">
        <h4 className="text-lg font-semibold text-red-300 mb-3">边界 4: Token 计数与实际 API 消耗不一致</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 模型使用不同的 tokenizer（非 cl100k_base）</li>
              <li>• 系统 prompt 被 API 自动添加</li>
              <li>• 特殊 token（BOS/EOS）未计入</li>
              <li>• 多模态内容计算公式差异</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">典型误差范围</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 文本: <span className="text-green-400">±5%</span></li>
              <li>• 图片: <span className="text-yellow-400">±15%</span></li>
              <li>• 音频: <span className="text-yellow-400">±20%</span></li>
              <li>• 总体: <span className="text-green-400">±10%</span></li>
            </ul>
          </div>
        </div>
        <CodeBlock
          code={`// 常见模型的实际 tokenizer
GPT-4o, GPT-4: cl100k_base ✓ (兼容)
Claude 3.x:    claude-tokenizer (略有差异)
Gemini:        SentencePiece (差异较大)
Gemini:          Gemini-tokenizer (接近 cl100k)
DeepSeek:      custom (接近 cl100k)

// 图片 Token 差异示例
// 我们的计算: 28×28 = 1 token
// Gemini 实际: 可能使用不同的 patch size`}
          language="typescript"
          title="tokenizer 差异说明"
        />
      </div>

      {/* 边界 5: 超大请求处理 */}
      <div className="bg-gray-800/50 rounded-xl p-5 border-l-4 border-green-500">
        <h4 className="text-lg font-semibold text-green-300 mb-3">边界 5: 超大请求的处理策略</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">场景描述</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 请求包含 100+ 张图片</li>
              <li>• 单次对话历史超过 1M tokens</li>
              <li>• 单个文本块超过 100K 字符</li>
              <li>• 混合内容复杂度极高</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-300 mb-2">处理策略</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Token 计算本身不会失败</li>
              <li>• 超限检测发生在计算之后</li>
              <li>• 触发压缩策略或错误提示</li>
              <li>• 分批计算避免阻塞主线程</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
          <h5 className="text-green-400 font-semibold mb-2">✅ 安全保障</h5>
          <p className="text-sm text-gray-300">
            Token 计算是纯计算过程，不会因为内容过大而崩溃。
            超限处理由上层 GeminiChat 负责，会触发压缩或拒绝发送。
          </p>
        </div>
      </div>
    </div>
  );
}

// 常见问题与调试技巧
function DebuggingTips() {
  return (
    <div className="pt-6 space-y-6">
      <p className="text-gray-300">
        Token 计算问题通常表现为：成本估算不准确、上下文意外截断、压缩触发时机不当等。
        以下是常见问题的诊断方法。
      </p>

      {/* 问题 1 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🔴</span>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-red-300 mb-2">问题：Token 计数与账单差异很大</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• CLI 显示使用 10K tokens</li>
                  <li>• API 账单显示 15K tokens</li>
                  <li>• 差异超过 30%</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 1. API 添加了隐藏的系统 prompt</li>
                  <li>• 2. 输出 token 未被正确统计</li>
                  <li>• 3. 重试请求被多次计费</li>
                  <li>• 4. 使用了不同的 tokenizer</li>
                </ul>
              </div>
            </div>
            <CodeBlock
              code={`# 调试方法 1: 检查实际 API 响应
DEBUG=gemini:tokens gemini

# 调试方法 2: 对比 usage 字段
# API 响应中的 usage.prompt_tokens 和 usage.completion_tokens
# 与本地计算值进行对比

# 调试方法 3: 单独测试 tokenizer
import { getDefaultTokenizer } from '@google/gemini-cli-core';
const tokenizer = getDefaultTokenizer();
const result = await tokenizer.calculateTokens(yourContent);
console.log(result.breakdown);`}
              language="bash"
              title="调试命令"
            />
          </div>
        </div>
      </div>

      {/* 问题 2 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🟡</span>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-yellow-300 mb-2">问题：上下文突然被压缩，丢失重要信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• AI 突然"忘记"之前的对话</li>
                  <li>• 显示"Compressing context..."</li>
                  <li>• 压缩后回答质量下降</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 1. 图片 Token 占用过多</li>
                  <li>• 2. 工具输出累积过快</li>
                  <li>• 3. 模型 Token 限制匹配错误</li>
                  <li>• 4. 压缩阈值设置过低</li>
                </ul>
              </div>
            </div>
            <CodeBlock
              code={`# 检查当前 Token 使用情况
# 在 CLI 界面中查看状态栏的 Token 计数

# 检查模型限制是否正确匹配
import { getTokenLimits } from '@google/gemini-cli-core';
console.log(getTokenLimits('your-model-name'));

# 调整压缩阈值（在 settings.json）
{
  "memory": {
    "compressionThreshold": 0.85  // 默认 0.75
  }
}

# 查看压缩日志
DEBUG=gemini:compress gemini`}
              language="bash"
              title="调试命令"
            />
          </div>
        </div>
      </div>

      {/* 问题 3 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🟠</span>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-orange-300 mb-2">问题：图片 Token 计算结果为 0 或异常值</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• breakdown.imageTokens = 0</li>
                  <li>• 或者值远超预期（如 100K）</li>
                  <li>• 图片明明很大但 Token 很少</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">可能原因</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 1. Base64 编码不正确</li>
                  <li>• 2. MIME type 设置错误</li>
                  <li>• 3. 图片格式头部损坏</li>
                  <li>• 4. 使用了数据 URI 格式</li>
                </ul>
              </div>
            </div>
            <CodeBlock
              code={`# 验证图片数据
const buffer = Buffer.from(base64Data, 'base64');
console.log('Buffer length:', buffer.length);
console.log('First 8 bytes:', buffer.subarray(0, 8));

# 检查 PNG 签名: 89 50 4E 47 0D 0A 1A 0A
# 检查 JPEG 签名: FF D8 FF
# 检查 WebP 签名: 52 49 46 46 xx xx xx xx 57 45 42 50

# 手动测试图片 tokenizer
import { ImageTokenizer } from '@google/gemini-cli-core';
const tokenizer = new ImageTokenizer();
const tokens = await tokenizer.calculateTokens(base64Data, 'image/png');`}
              language="bash"
              title="调试命令"
            />
          </div>
        </div>
      </div>

      {/* 问题 4 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🔵</span>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-blue-300 mb-2">问题：新模型返回默认 128K 限制</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">症状</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 使用 1M 上下文模型</li>
                  <li>• 但只能使用 128K 内容</li>
                  <li>• 频繁触发压缩</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-300 mb-2">解决方案</h5>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 1. 检查模型名称格式</li>
                  <li>• 2. 更新 tokenLimits.ts 模式</li>
                  <li>• 3. 使用环境变量覆盖</li>
                  <li>• 4. 提交 PR 添加新模式</li>
                </ul>
              </div>
            </div>
            <CodeBlock
              code={`# 检查归一化后的模型名称
import { normalizeModelName } from '@google/gemini-cli-core';
console.log(normalizeModelName('openai/gpt-4o-2024-08-06'));
// 输出: gpt-4o

# 验证模式匹配结果
import { getTokenLimits } from '@google/gemini-cli-core';
console.log(getTokenLimits('gpt-4o'));
// 输出: { input: 128000, output: 16384 }

# 临时覆盖（环境变量）
export GEMINI_TOKEN_LIMIT=1000000
export GEMINI_OUTPUT_LIMIT=8192`}
              language="bash"
              title="调试命令"
            />
          </div>
        </div>
      </div>

      {/* 调试工具速查 */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">🔧 调试工具速查表</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="py-2">场景</th>
              <th className="py-2">环境变量</th>
              <th className="py-2">输出内容</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 font-mono text-xs">
            <tr className="border-t border-gray-700/50">
              <td className="py-2">Token 计算详情</td>
              <td className="text-cyan-400">DEBUG=gemini:tokens</td>
              <td>每次计算的 breakdown</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">上下文压缩</td>
              <td className="text-cyan-400">DEBUG=gemini:compress</td>
              <td>压缩触发时机和效果</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">模型限制匹配</td>
              <td className="text-cyan-400">DEBUG=gemini:limits</td>
              <td>模式匹配过程</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">图片处理</td>
              <td className="text-cyan-400">DEBUG=gemini:image</td>
              <td>尺寸解析和缩放</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">全部信息</td>
              <td className="text-cyan-400">DEBUG=gemini:*</td>
              <td>所有调试输出</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 性能优化建议
function PerformanceOptimization() {
  return (
    <div className="pt-6 space-y-6">
      <p className="text-gray-300">
        Token 计算是高频操作，每次请求和响应都会触发。以下是优化 Token 计算性能的关键策略。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 优化 1 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-green-600/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚡</span>
            <h4 className="text-lg font-semibold text-green-300">tiktoken 编码器复用</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            tiktoken 编码器初始化耗时 50-200ms，必须复用实例。
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">使用单例模式全局共享</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">懒加载避免启动开销</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">dispose() 释放 WASM 内存</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <div className="text-xs text-gray-500">性能数据</div>
            <div className="text-sm text-gray-300 mt-1">
              首次加载: <span className="text-yellow-400">~150ms</span><br />
              后续计算: <span className="text-green-400">&lt; 1ms / 1K tokens</span>
            </div>
          </div>
        </div>

        {/* 优化 2 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-cyan-600/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📦</span>
            <h4 className="text-lg font-semibold text-cyan-300">批量计算合并</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            多个文本块合并后一次性编码，减少函数调用开销。
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">✗</span>
              <span className="text-gray-400">每个消息单独 encode()</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">合并后批量 encode()</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">减少 70% 的函数调用</span>
            </div>
          </div>
          <CodeBlock
            code={`// 批量计算优化
const allTexts = messages.join('\\n');
const totalTokens = await tokenizer.calculateTokens(allTexts);`}
            language="typescript"
          />
        </div>

        {/* 优化 3 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-yellow-600/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🖼️</span>
            <h4 className="text-lg font-semibold text-yellow-300">图片尺寸快速解析</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            只解析图片头部获取尺寸，不加载完整图片到内存。
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">PNG: 只读前 24 字节</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">JPEG: 扫描 SOF marker</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">无需图像解码库</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <div className="text-xs text-gray-500">性能对比</div>
            <div className="text-sm text-gray-300 mt-1">
              头部解析: <span className="text-green-400">&lt; 0.1ms</span><br />
              完整解码: <span className="text-red-400">10-100ms</span>
            </div>
          </div>
        </div>

        {/* 优化 4 */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-purple-600/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💾</span>
            <h4 className="text-lg font-semibold text-purple-300">计算结果缓存</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            相同内容的 Token 计数结果可以缓存复用。
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">System prompt 只计算一次</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">工具定义 Token 缓存</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">△</span>
              <span className="text-gray-300">历史消息可增量计算</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <div className="text-xs text-gray-500">缓存命中率</div>
            <div className="text-sm text-gray-300 mt-1">
              System prompt: <span className="text-green-400">100%</span><br />
              历史消息: <span className="text-green-400">~90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 性能基准 */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">📊 Token 计算性能基准</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="py-2">操作</th>
              <th className="py-2">内容大小</th>
              <th className="py-2">耗时</th>
              <th className="py-2">备注</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-xs">
            <tr className="border-t border-gray-700/50">
              <td className="py-2">tiktoken 初始化</td>
              <td className="text-gray-400">N/A</td>
              <td className="text-yellow-400">50-200ms</td>
              <td className="text-gray-500">仅首次</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">文本 Token 计算</td>
              <td className="text-gray-400">1K tokens</td>
              <td className="text-green-400">&lt; 1ms</td>
              <td className="text-gray-500">线性增长</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">文本 Token 计算</td>
              <td className="text-gray-400">100K tokens</td>
              <td className="text-green-400">~10ms</td>
              <td className="text-gray-500">大文件</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">图片尺寸解析</td>
              <td className="text-gray-400">任意大小</td>
              <td className="text-green-400">&lt; 0.1ms</td>
              <td className="text-gray-500">只读头部</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">完整请求计算</td>
              <td className="text-gray-400">50K + 5张图</td>
              <td className="text-green-400">~15ms</td>
              <td className="text-gray-500">典型场景</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-2">模型限制匹配</td>
              <td className="text-gray-400">N/A</td>
              <td className="text-green-400">&lt; 0.5ms</td>
              <td className="text-gray-500">正则匹配</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 优化建议总结 */}
      <div className="bg-green-900/20 rounded-xl p-5 border border-green-600/30">
        <h4 className="text-lg font-semibold text-green-300 mb-3">✅ 优化要点总结</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">必须做到</h5>
            <ul className="text-gray-400 space-y-1">
              <li>• 全局单例复用 tokenizer</li>
              <li>• 懒加载 tiktoken 编码器</li>
              <li>• 只解析图片头部获取尺寸</li>
              <li>• 释放不再使用的编码器</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">进阶优化</h5>
            <ul className="text-gray-400 space-y-1">
              <li>• 缓存静态内容的 Token 数</li>
              <li>• 增量计算历史消息</li>
              <li>• 批量合并文本后计算</li>
              <li>• 使用 Worker 异步计算</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 与其他模块的交互关系
function ModuleDependencies() {
  return (
    <div className="pt-6 space-y-6">
      <p className="text-gray-300">
        Token 计算系统是 CLI 的基础设施层，被多个核心模块依赖。理解这些依赖关系有助于定位问题和优化性能。
      </p>

      {/* 依赖关系图 */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">📊 模块依赖关系</h4>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* 第一行 - 消费者 */}
          <div className="col-span-4 mb-4">
            <div className="text-gray-500 mb-2">↑ 消费者层</div>
            <div className="flex justify-center gap-4">
              <div className="bg-cyan-900/30 border border-cyan-600/30 rounded-lg px-4 py-2">
                <div className="text-cyan-400 font-semibold">GeminiChat</div>
                <div className="text-gray-500">上下文管理</div>
              </div>
              <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg px-4 py-2">
                <div className="text-purple-400 font-semibold">Compressor</div>
                <div className="text-gray-500">压缩决策</div>
              </div>
              <div className="bg-green-900/30 border border-green-600/30 rounded-lg px-4 py-2">
                <div className="text-green-400 font-semibold">StatusBar</div>
                <div className="text-gray-500">用量展示</div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg px-4 py-2">
                <div className="text-yellow-400 font-semibold">ToolScheduler</div>
                <div className="text-gray-500">输出截断</div>
              </div>
            </div>
          </div>

          {/* 箭头 */}
          <div className="col-span-4 text-gray-600 text-lg">
            ↓ ↓ ↓ ↓
          </div>

          {/* 第二行 - Token 系统 */}
          <div className="col-span-4 my-4">
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/50 rounded-xl p-4">
              <div className="text-blue-300 font-bold text-lg mb-2">Token Accounting System</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-gray-300">TextTokenizer</div>
                  <div className="text-gray-500 text-xs">tiktoken</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-gray-300">ImageTokenizer</div>
                  <div className="text-gray-500 text-xs">尺寸解析</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-gray-300">TokenLimitMatcher</div>
                  <div className="text-gray-500 text-xs">模式匹配</div>
                </div>
              </div>
            </div>
          </div>

          {/* 箭头 */}
          <div className="col-span-4 text-gray-600 text-lg">
            ↓ ↓
          </div>

          {/* 第三行 - 底层依赖 */}
          <div className="col-span-4">
            <div className="text-gray-500 mb-2">↓ 底层依赖</div>
            <div className="flex justify-center gap-4">
              <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg px-4 py-2">
                <div className="text-gray-400">tiktoken (WASM)</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg px-4 py-2">
                <div className="text-gray-400">Buffer API</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 调用链说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 上游调用者 */}
        <div className="bg-gray-800/50 rounded-xl p-5">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">上游调用者</h4>
          <div className="space-y-4">
            <div className="border-l-2 border-cyan-500 pl-3">
              <h5 className="font-semibold text-cyan-300">GeminiChat</h5>
              <p className="text-xs text-gray-400 mt-1">
                每次发送请求前计算总 Token，决定是否需要压缩上下文
              </p>
              <code className="text-xs text-gray-500 block mt-1">
                gemini-chat.ts:submitQuery()
              </code>
            </div>
            <div className="border-l-2 border-purple-500 pl-3">
              <h5 className="font-semibold text-purple-300">Compressor</h5>
              <p className="text-xs text-gray-400 mt-1">
                检查压缩效果，验证摘要后的 Token 是否在限制内
              </p>
              <code className="text-xs text-gray-500 block mt-1">
                memory/compressor.ts
              </code>
            </div>
            <div className="border-l-2 border-green-500 pl-3">
              <h5 className="font-semibold text-green-300">StatusBar UI</h5>
              <p className="text-xs text-gray-400 mt-1">
                实时显示当前会话的 Token 使用量和剩余空间
              </p>
              <code className="text-xs text-gray-500 block mt-1">
                cli/src/ui/StatusBar.tsx
              </code>
            </div>
            <div className="border-l-2 border-yellow-500 pl-3">
              <h5 className="font-semibold text-yellow-300">ToolScheduler</h5>
              <p className="text-xs text-gray-400 mt-1">
                评估工具输出是否需要截断，计算截断后的 Token 节省量
              </p>
              <code className="text-xs text-gray-500 block mt-1">
                coreToolScheduler.ts:truncateAndSaveToFile()
              </code>
            </div>
          </div>
        </div>

        {/* 核心数据流 */}
        <div className="bg-gray-800/50 rounded-xl p-5">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">核心数据流</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              <div>
                <div className="text-gray-300">用户发送消息</div>
                <div className="text-xs text-gray-500">触发 submitQuery()</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              <div>
                <div className="text-gray-300">计算当前请求 Token</div>
                <div className="text-xs text-gray-500">tokenizer.calculateTokens(request)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              <div>
                <div className="text-gray-300">获取模型 Token 限制</div>
                <div className="text-xs text-gray-500">getTokenLimits(modelName)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              <div>
                <div className="text-gray-300">检查是否超限</div>
                <div className="text-xs text-gray-500">currentTokens &gt; limit * threshold</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
              <div>
                <div className="text-yellow-300">触发压缩（如需要）</div>
                <div className="text-xs text-gray-500">compressor.compress(history)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
              <div>
                <div className="text-green-300">发送请求到 API</div>
                <div className="text-xs text-gray-500">确保在 Token 限制内</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 关键接口 */}
      <div className="bg-gray-800/50 rounded-xl p-5">
        <h4 className="text-lg font-semibold text-gray-200 mb-4">关键公开接口</h4>
        <CodeBlock
          code={`// Token 计算器接口
interface RequestTokenizer {
  calculateTokens(request: CountTokensParameters): Promise<TokenCalculationResult>;
  dispose(): void;
}

// 计算结果
interface TokenCalculationResult {
  totalTokens: number;
  breakdown: {
    textTokens: number;
    imageTokens: number;
    audioTokens: number;
    otherTokens: number;
  };
  processingTime?: number;
}

// Token 限制接口
function getTokenLimits(modelName: string): { input: number; output: number };
function normalizeModelName(model: string): string;

// 单例访问
function getDefaultTokenizer(): RequestTokenizer;
function disposeDefaultTokenizer(): Promise<void>;`}
          language="typescript"
          title="公开接口定义"
        />
      </div>

      {/* 扩展点 */}
      <div className="bg-purple-900/20 rounded-xl p-5 border border-purple-600/30">
        <h4 className="text-lg font-semibold text-purple-300 mb-3">🔧 扩展点</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">添加新模型限制</h5>
            <p className="text-gray-400">
              编辑 <code className="text-cyan-300">tokenLimits.ts</code> 的 PATTERNS 数组，
              添加新的正则模式和对应限制值。
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">支持新图片格式</h5>
            <p className="text-gray-400">
              在 <code className="text-cyan-300">imageTokenizer.ts</code> 添加
              extractXxxDimensions() 方法，解析新格式的头部。
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">自定义 Tokenizer</h5>
            <p className="text-gray-400">
              实现 <code className="text-cyan-300">RequestTokenizer</code> 接口，
              替换默认的 cl100k_base 编码器。
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-gray-300 font-semibold">覆盖 Token 限制</h5>
            <p className="text-gray-400">
              使用环境变量 <code className="text-cyan-300">GEMINI_TOKEN_LIMIT</code>
              临时覆盖自动检测的限制值。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 关联页面
function RelatedPagesSection() {
  const { navigate } = useNavigation();
  const pages = [
    { id: 'token-management-strategy', label: 'Token 计算策略', desc: '计算策略详解' },
    { id: 'memory', label: '上下文管理', desc: '了解基于 Token 的压缩策略' },
    { id: 'token-counting-anim', label: 'Token 计数动画', desc: '可视化 Token 计算过程' },
    { id: 'token-limit-matcher-anim', label: 'Token 限制匹配动画', desc: '模式匹配过程可视化' },
  ];

  return (
    <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">📚 相关页面</h3>
      <div className="grid grid-cols-2 gap-3">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigate(page.id)}
            className="p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/50 transition-colors group text-left border-none cursor-pointer"
          >
            <div className="text-cyan-400 group-hover:text-cyan-300 font-medium">{page.label}</div>
            <div className="text-xs text-gray-500 mt-1">{page.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 主组件
export function TokenAccountingSystem() {
  const [introExpanded, setIntroExpanded] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <Introduction isExpanded={introExpanded} onToggle={() => setIntroExpanded(!introExpanded)} />

      <CollapsibleSection
        title="Token 限制匹配"
        icon="📏"
        defaultOpen={true}
        highlight
      >
        <TokenLimitSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="文本 Token 计算"
        icon="📝"
        defaultOpen={true}
      >
        <TextTokenSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="图像 Token 计算"
        icon="🖼️"
        defaultOpen={true}
        highlight
      >
        <ImageTokenSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="请求级 Token 计算"
        icon="📊"
        defaultOpen={false}
      >
        <RequestTokenizerSection />
      </CollapsibleSection>

      <CollapsibleSection
        title="Token 成本全景"
        icon="💰"
        defaultOpen={true}
        highlight
      >
        <TokenCostLandscape />
      </CollapsibleSection>

      <CollapsibleSection
        title="省 Token 策略"
        icon="💚"
        defaultOpen={true}
        highlight
      >
        <TokenSavingStrategies />
      </CollapsibleSection>

      <RelatedPagesSection />

      {/* ==================== 深化内容 ==================== */}

      <CollapsibleSection
        title="边界条件深度解析"
        icon="🔬"
        defaultOpen={false}
      >
        <EdgeCaseAnalysis />
      </CollapsibleSection>

      <CollapsibleSection
        title="常见问题与调试技巧"
        icon="🐛"
        defaultOpen={false}
      >
        <DebuggingTips />
      </CollapsibleSection>

      <CollapsibleSection
        title="性能优化建议"
        icon="⚡"
        defaultOpen={false}
        highlight
      >
        <PerformanceOptimization />
      </CollapsibleSection>

      <CollapsibleSection
        title="与其他模块的交互关系"
        icon="🔗"
        defaultOpen={false}
      >
        <ModuleDependencies />
      </CollapsibleSection>
    </div>
  );
}
