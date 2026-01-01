import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'token-counting-anim', label: 'Token 计数动画', description: '可视化 Token 计算过程' },
  { id: 'image-tokenizer-anim', label: '图片 Token 动画', description: '图片尺寸归一化演示' },
  { id: 'request-tokenizer-anim', label: '请求 Token 动画', description: '多模态内容处理' },
  { id: 'context-compression-anim', label: '上下文压缩动画', description: '历史消息压缩策略' },
  { id: 'loop', label: '循环机制', description: 'Token 限制与循环控制' },
];

export function TokenManagementStrategy() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['quickstart'])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const architectureDiagram = `
graph TB
    subgraph Input["输入层"]
        REQ[CountTokensParameters<br/>多模态请求]
    end

    subgraph Processor["DefaultRequestTokenizer"]
        GROUP[processAndGroupContents<br/>按类型分组]

        subgraph Types["内容类型分支"]
            TEXT[textContents<br/>📝 文本]
            IMAGE[imageContents<br/>🖼️ 图片]
            AUDIO[audioContents<br/>🔊 音频]
            OTHER[otherContents<br/>📄 其他]
        end

        subgraph Calculators["计算器"]
            TT[TextTokenizer<br/>tiktoken]
            IT[ImageTokenizer<br/>维度解析]
            AT[AudioCalc<br/>大小估算]
            OT[TextTokenizer<br/>JSON序列化]
        end
    end

    subgraph Output["输出层"]
        RESULT[TokenCalculationResult<br/>totalTokens + breakdown]
    end

    REQ --> GROUP
    GROUP --> TEXT & IMAGE & AUDIO & OTHER
    TEXT --> TT
    IMAGE --> IT
    AUDIO --> AT
    OTHER --> OT
    TT & IT & AT & OT --> RESULT

    style Input fill:#1a365d,stroke:#3182ce
    style Processor fill:#1a202c,stroke:#4a5568
    style Output fill:#22543d,stroke:#38a169
`;

  const imageScalingDiagram = `
flowchart LR
    subgraph Input["原始图片"]
        IMG[w × h 像素]
    end

    subgraph Normalize["Step 1: 归一化"]
        NORM["hBar = round(h/28)×28<br/>wBar = round(w/28)×28"]
    end

    subgraph Scale["Step 2: 边界处理"]
        CHECK{"hBar×wBar"}
        LARGE["> 12.8M<br/>缩小"]
        SMALL["< 3136<br/>放大"]
        OK["正常"]
    end

    subgraph Calc["Step 3: 计算"]
        TOKEN["tokens = pixels/784 + 2"]
    end

    IMG --> NORM --> CHECK
    CHECK -->|大图| LARGE --> TOKEN
    CHECK -->|小图| SMALL --> TOKEN
    CHECK -->|标准| OK --> TOKEN

    style Input fill:#3182ce,stroke:#2b6cb0
    style Scale fill:#d69e2e,stroke:#b7791f
    style Calc fill:#38a169,stroke:#2f855a
`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          📊 Token 计算策略
        </h1>
        <p className="text-[var(--text-secondary)]">
          深入理解 Gemini CLI 如何精确计算多模态内容的 Token 数量
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] text-xs rounded">
            核心机制
          </span>
          <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] text-xs rounded">
            packages/core/src/utils/request-tokenizer/
          </span>
        </div>
      </div>

      {/* 30秒速览 */}
      <section className="bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          ⚡ 30秒速览
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-[var(--terminal-green)] font-bold mb-1">文本</h3>
            <p className="text-[var(--text-secondary)] text-sm">tiktoken (cl100k_base)</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Fallback: 1 token ≈ 4 chars</p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🖼️</div>
            <h3 className="text-[var(--cyber-purple)] font-bold mb-1">图片</h3>
            <p className="text-[var(--text-secondary)] text-sm">28×28 px = 1 token</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Min: 4, Max: 16384 tokens</p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🔊</div>
            <h3 className="text-[var(--amber)] font-bold mb-1">音频</h3>
            <p className="text-[var(--text-secondary)] text-sm">1 token / 100 bytes</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Min: 10 tokens</p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="text-[var(--cyber-blue)] font-bold mb-1">其他</h3>
            <p className="text-[var(--text-secondary)] text-sm">JSON 序列化后按文本计算</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">函数调用/文件引用</p>
          </div>
        </div>
      </section>

      {/* 架构总览 */}
      <section>
        <button
          onClick={() => toggleSection('arch')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-blue)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🏗️ Token 计算架构
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('arch') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('arch') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <MermaidDiagram chart={architectureDiagram} />
          </div>
        )}
      </section>

      {/* 图片 Token 计算详解 */}
      <section>
        <button
          onClick={() => toggleSection('image')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-purple)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🖼️ 图片 Token 计算详解
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('image') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('image') && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 核心公式 */}
              <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <h3 className="text-[var(--cyber-purple)] font-bold mb-4">核心公式</h3>
                <CodeBlock
                  code={`// 核心常量 (imageTokenizer.ts:22-31)
PIXELS_PER_TOKEN = 28 × 28 = 784
MIN_TOKENS_PER_IMAGE = 4
MAX_TOKENS_PER_IMAGE = 16384
VISION_SPECIAL_TOKENS = 2  // vision_bos + vision_eos

// Token 计算
imageTokens = floor(pixels / 784) + 2`}
                  language="typescript"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--terminal-green)]">✓</span>
                    <span className="text-[var(--text-secondary)]">标准计算: 28×28 像素块 = 1 个 token</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--amber)]">⚖️</span>
                    <span className="text-[var(--text-secondary)]">边界归一化: 尺寸向 28 的倍数取整</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--cyber-blue)]">📦</span>
                    <span className="text-[var(--text-secondary)]">特殊 Token: 始终 +2 (vision_bos/eos)</span>
                  </div>
                </div>
              </div>

              {/* 缩放策略 */}
              <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <h3 className="text-[var(--amber)] font-bold mb-4">缩放策略</h3>
                <CodeBlock
                  code={`// 缩放逻辑 (imageTokenizer.ts:275-297)
function calculateTokensWithScaling(w, h) {
  // Step 1: 归一化到 28 像素倍数
  let hBar = round(h / 28) * 28
  let wBar = round(w / 28) * 28

  // Step 2: 边界处理
  const minPixels = 4 × 784 = 3,136
  const maxPixels = 16384 × 784 = 12,845,056

  if (hBar × wBar > maxPixels) {
    // 大图缩小
    const beta = sqrt(h × w / maxPixels)
    hBar = floor(h / beta / 28) * 28
    wBar = floor(w / beta / 28) * 28
  } else if (hBar × wBar < minPixels) {
    // 小图放大
    const beta = sqrt(minPixels / (h × w))
    hBar = ceil(h × beta / 28) * 28
    wBar = ceil(w × beta / 28) * 28
  }

  return floor(hBar × wBar / 784) + 2
}`}
                  language="typescript"
                />
              </div>
            </div>

            {/* 缩放图解 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--text-primary)] font-bold mb-4">缩放流程图</h3>
              <MermaidDiagram chart={imageScalingDiagram} />
            </div>
          </div>
        )}
      </section>

      {/* 支持的图片格式 */}
      <section>
        <button
          onClick={() => toggleSection('formats')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--terminal-green)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🔍 图片格式解析
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('formats') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('formats') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] mb-4">
              ImageTokenizer 支持从二进制数据中直接解析多种图片格式的尺寸，无需依赖外部库：
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { format: 'PNG', method: 'extractPngDimensions', location: 'IHDR chunk @ bytes 16-23', color: 'terminal-green' },
                { format: 'JPEG', method: 'extractJpegDimensions', location: 'SOF markers (0xC0-0xCF)', color: 'amber' },
                { format: 'WebP', method: 'extractWebpDimensions', location: 'VP8/VP8L/VP8X format', color: 'cyber-blue' },
                { format: 'GIF', method: 'extractGifDimensions', location: 'Header @ bytes 6-9', color: 'cyber-purple' },
                { format: 'BMP', method: 'extractBmpDimensions', location: 'Header @ bytes 18-25', color: 'amber' },
                { format: 'TIFF', method: 'extractTiffDimensions', location: 'IFD tags 0x0100/0x0101', color: 'cyber-pink' },
                { format: 'HEIC', method: 'extractHeicDimensions', location: 'ispe box in meta', color: 'cyber-blue' },
                { format: 'Fallback', method: '默认', location: '512×512', color: 'text-muted' },
              ].map((fmt) => (
                <div key={fmt.format} className={`bg-[var(--${fmt.color})]/10 rounded-lg p-3 border border-[var(--${fmt.color})]/30`}>
                  <div className={`text-[var(--${fmt.color})] font-bold text-lg`}>{fmt.format}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-2 font-mono">{fmt.method}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{fmt.location}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 文本 Token 计算 */}
      <section>
        <button
          onClick={() => toggleSection('text')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--terminal-green)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            📝 文本 Token 计算
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('text') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('text') && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--terminal-green)] font-bold mb-4">TextTokenizer 实现</h3>
              <CodeBlock
                code={`// textTokenizer.ts
class TextTokenizer {
  private encoding: Tiktoken | null = null;
  private encodingName = 'cl100k_base';  // 默认编码

  // 懒加载初始化
  private async ensureEncoding() {
    if (this.encoding) return;
    this.encoding = get_encoding(this.encodingName);
  }

  async calculateTokens(text: string): Promise<number> {
    await this.ensureEncoding();

    if (this.encoding) {
      return this.encoding.encode(text).length;
    }

    // Fallback: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  dispose() {
    this.encoding?.free();  // 释放 WASM 资源
  }
}`}
                language="typescript"
              />
            </div>

            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
              <h3 className="text-[var(--terminal-green)] font-bold mb-4">设计要点</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">懒加载初始化</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      tiktoken 编码器仅在首次需要时加载，避免启动开销
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">优雅降级</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      如果 tiktoken 加载失败，使用字符估算 (1:4 比例)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🧹</span>
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">资源管理</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      dispose() 释放 WASM 内存，避免内存泄漏
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📦</span>
                  <div>
                    <div className="text-[var(--text-primary)] font-medium">批量处理</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      calculateTokensBatch() 复用编码器实例
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 内容处理流水线 */}
      <section>
        <button
          onClick={() => toggleSection('pipeline')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--amber)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🔄 内容处理流水线
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('pipeline') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('pipeline') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <CodeBlock
              code={`// requestTokenizer.ts:243-327 - 内容分类逻辑
private processPart(part, textContents, imageContents, audioContents, otherContents) {
  // 1. 纯字符串 → textContents
  if (typeof part === 'string') {
    textContents.push(part);
    return;
  }

  // 2. text 属性 → textContents
  if ('text' in part && part.text) {
    textContents.push(part.text);
    return;
  }

  // 3. inlineData → 根据 MIME 类型分类
  if ('inlineData' in part && part.inlineData) {
    const { data, mimeType } = part.inlineData;
    if (mimeType.startsWith('image/')) {
      imageContents.push({ data, mimeType });
    } else if (mimeType.startsWith('audio/')) {
      audioContents.push({ data, mimeType });
    }
    return;
  }

  // 4. fileData → otherContents (JSON序列化)
  if ('fileData' in part) {
    otherContents.push(JSON.stringify(part.fileData));
    return;
  }

  // 5. functionCall/functionResponse → otherContents
  if ('functionCall' in part || 'functionResponse' in part) {
    otherContents.push(JSON.stringify(part));
    return;
  }
}`}
              language="typescript"
            />

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--bg-terminal)]/50 rounded-lg">
                <h4 className="text-[var(--text-primary)] font-bold mb-2">支持的内容类型</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--terminal-green)] rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">string - 纯文本</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--terminal-green)] rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">TextPart - {`{ text: "..." }`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--cyber-purple)] rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">InlineData (image/*) - 图片</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--amber)] rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">InlineData (audio/*) - 音频</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--cyber-blue)] rounded-full"></span>
                    <span className="text-[var(--text-secondary)]">FunctionCall/Response - 工具调用</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-[var(--bg-terminal)]/50 rounded-lg">
                <h4 className="text-[var(--text-primary)] font-bold mb-2">Fallback 策略</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--amber)]">⚠️</span>
                    <span className="text-[var(--text-secondary)]">tiktoken 失败 → 字符数/4</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--amber)]">⚠️</span>
                    <span className="text-[var(--text-secondary)]">图片格式不支持 → 512×512</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--amber)]">⚠️</span>
                    <span className="text-[var(--text-secondary)]">图片解析失败 → 最小 6 tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--amber)]">⚠️</span>
                    <span className="text-[var(--text-secondary)]">完全失败 → JSON.stringify 后估算</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 计算示例 */}
      <section>
        <button
          onClick={() => toggleSection('examples')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-pink)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            📐 计算示例
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('examples') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('examples') && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 示例 1: 小图放大 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--cyber-pink)]/30">
              <h4 className="text-[var(--cyber-pink)] font-bold mb-3">示例 1: 小图放大</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">原始尺寸:</span>
                  <span className="text-[var(--text-primary)]">50 × 50 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">像素数:</span>
                  <span className="text-[var(--text-primary)]">2,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">最小阈值:</span>
                  <span className="text-[var(--amber)]">3,136 (需放大)</span>
                </div>
                <div className="border-t border-[var(--border-subtle)] my-2"></div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">beta:</span>
                  <span className="text-[var(--text-primary)]">√(3136/2500) ≈ 1.12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">放大后:</span>
                  <span className="text-[var(--text-primary)]">56 × 56 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Token:</span>
                  <span className="text-[var(--terminal-green)] font-bold">4 + 2 = 6</span>
                </div>
              </div>
            </div>

            {/* 示例 2: 标准图片 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--cyber-pink)]/30">
              <h4 className="text-[var(--cyber-pink)] font-bold mb-3">示例 2: 标准图片</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">原始尺寸:</span>
                  <span className="text-[var(--text-primary)]">1920 × 1080 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">归一化:</span>
                  <span className="text-[var(--text-primary)]">1932 × 1092 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">像素数:</span>
                  <span className="text-[var(--text-primary)]">2,109,744</span>
                </div>
                <div className="border-t border-[var(--border-subtle)] my-2"></div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">计算:</span>
                  <span className="text-[var(--text-primary)]">2109744 / 784</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">图片Token:</span>
                  <span className="text-[var(--text-primary)]">2691</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">总Token:</span>
                  <span className="text-[var(--terminal-green)] font-bold">2691 + 2 = 2693</span>
                </div>
              </div>
            </div>

            {/* 示例 3: 大图缩小 */}
            <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--cyber-pink)]/30">
              <h4 className="text-[var(--cyber-pink)] font-bold mb-3">示例 3: 大图缩小</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">原始尺寸:</span>
                  <span className="text-[var(--text-primary)]">8000 × 6000 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">像素数:</span>
                  <span className="text-[var(--text-primary)]">48,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">最大阈值:</span>
                  <span className="text-[var(--amber)]">12,845,056 (需缩小)</span>
                </div>
                <div className="border-t border-[var(--border-subtle)] my-2"></div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">beta:</span>
                  <span className="text-[var(--text-primary)]">√(48M/12.8M) ≈ 1.93</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">缩小后:</span>
                  <span className="text-[var(--text-primary)]">4144 × 3108 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Token:</span>
                  <span className="text-[var(--terminal-green)] font-bold">16384 + 2 = 16386</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 单例模式 */}
      <section>
        <button
          onClick={() => toggleSection('singleton')}
          className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--cyber-blue)] transition-colors"
        >
          <span className="text-lg font-bold text-[var(--text-primary)]">
            🔗 单例模式与资源管理
          </span>
          <span className="text-[var(--text-muted)]">
            {expandedSections.has('singleton') ? '收起' : '展开'}
          </span>
        </button>
        {expandedSections.has('singleton') && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
            <CodeBlock
              code={`// request-tokenizer/index.ts - 单例管理
let defaultTokenizer: DefaultRequestTokenizer | null = null;

export function getDefaultTokenizer(): DefaultRequestTokenizer {
  if (!defaultTokenizer) {
    defaultTokenizer = new DefaultRequestTokenizer();
  }
  return defaultTokenizer;
}

export async function disposeDefaultTokenizer(): Promise<void> {
  if (defaultTokenizer) {
    await defaultTokenizer.dispose();  // 释放 tiktoken WASM
    defaultTokenizer = null;
  }
}`}
              language="typescript"
            />

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--terminal-green)]/10 rounded-lg border border-[var(--terminal-green)]/30">
                <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么使用单例?</h4>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• tiktoken 编码器加载开销大</li>
                  <li>• WASM 模块只需初始化一次</li>
                  <li>• 全局共享减少内存占用</li>
                </ul>
              </div>
              <div className="p-3 bg-[var(--amber)]/10 rounded-lg border border-[var(--amber)]/30">
                <h4 className="text-[var(--amber)] font-bold mb-2">何时调用 dispose?</h4>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• 应用程序退出时</li>
                  <li>• 长时间不需要时释放内存</li>
                  <li>• 需要重新配置编码时</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 源码参考 */}
      <section className="bg-[var(--bg-terminal)]/30 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-4">📚 源码参考</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-[var(--text-muted)] mb-2">核心文件</h4>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              <li>• packages/core/src/utils/request-tokenizer/index.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/requestTokenizer.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/imageTokenizer.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/textTokenizer.ts</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[var(--text-muted)] mb-2">关键接口</h4>
            <ul className="space-y-1 text-[var(--text-secondary)]">
              <li>• RequestTokenizer - 请求 Token 计算接口</li>
              <li>• TokenCalculationResult - 计算结果结构</li>
              <li>• ImageMetadata - 图片元数据</li>
              <li>• TokenizerConfig - 配置选项</li>
            </ul>
          </div>
        </div>
      </section>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

export default TokenManagementStrategy;
