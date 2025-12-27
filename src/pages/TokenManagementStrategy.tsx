import React from 'react';
import { motion } from 'framer-motion';
import {
  Hash,
  Image,
  FileText,
  Volume2,
  Code,
  Calculator,
  Layers,
  Scale,
  AlertTriangle,
  Zap,
  Box,
  ArrowRight,
  ArrowDown,
  Target,
  Cpu,
  Binary,
} from 'lucide-react';

const TokenManagementStrategy: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <Calculator className="text-blue-400" />
          Token 计算策略
        </h1>
        <p className="text-gray-400 text-lg">
          深入理解 Innies CLI 如何精确计算多模态内容的 Token 数量
        </p>
      </motion.div>

      {/* 30-Second Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30"
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          30 秒速览
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <FileText className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-sm text-gray-400">文本</div>
            <div className="text-lg text-white font-bold">tiktoken (cl100k_base)</div>
            <div className="text-xs text-gray-500 mt-1">Fallback: 1 token ≈ 4 chars</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Image className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-sm text-gray-400">图片</div>
            <div className="text-lg text-white font-bold">28×28 px = 1 token</div>
            <div className="text-xs text-gray-500 mt-1">Min: 4, Max: 16384 tokens</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Volume2 className="w-8 h-8 text-orange-400 mb-2" />
            <div className="text-sm text-gray-400">音频</div>
            <div className="text-lg text-white font-bold">1 token / 100 bytes</div>
            <div className="text-xs text-gray-500 mt-1">Min: 10 tokens</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Code className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-400">其他 (函数/文件)</div>
            <div className="text-lg text-white font-bold">JSON 序列化后按文本计算</div>
            <div className="text-xs text-gray-500 mt-1">使用 tiktoken</div>
          </div>
        </div>
      </motion.div>

      {/* Architecture Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="text-purple-400" />
          Token 计算架构
        </h2>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          {/* Architecture Diagram */}
          <div className="flex flex-col items-center gap-4">
            {/* Input */}
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30 w-full max-w-md text-center">
              <div className="text-blue-400 font-bold">CountTokensParameters</div>
              <div className="text-xs text-gray-400 mt-1">请求内容（多模态）</div>
            </div>

            <ArrowDown className="text-gray-500" />

            {/* DefaultRequestTokenizer */}
            <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30 w-full">
              <div className="text-purple-400 font-bold text-center mb-4">DefaultRequestTokenizer</div>
              <div className="text-xs text-gray-400 text-center mb-4">processAndGroupContents() 按类型分组</div>

              <div className="grid grid-cols-4 gap-4">
                {/* Text Branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30 w-full text-center">
                    <FileText className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-green-400">textContents[]</div>
                  </div>
                  <ArrowDown className="text-gray-500 my-2 w-4 h-4" />
                  <div className="bg-green-800/30 rounded p-2 text-center">
                    <div className="text-xs text-green-400">TextTokenizer</div>
                    <div className="text-[10px] text-gray-500">tiktoken</div>
                  </div>
                </div>

                {/* Image Branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 w-full text-center">
                    <Image className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-purple-400">imageContents[]</div>
                  </div>
                  <ArrowDown className="text-gray-500 my-2 w-4 h-4" />
                  <div className="bg-purple-800/30 rounded p-2 text-center">
                    <div className="text-xs text-purple-400">ImageTokenizer</div>
                    <div className="text-[10px] text-gray-500">维度解析</div>
                  </div>
                </div>

                {/* Audio Branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30 w-full text-center">
                    <Volume2 className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <div className="text-xs text-orange-400">audioContents[]</div>
                  </div>
                  <ArrowDown className="text-gray-500 my-2 w-4 h-4" />
                  <div className="bg-orange-800/30 rounded p-2 text-center">
                    <div className="text-xs text-orange-400">Size-based</div>
                    <div className="text-[10px] text-gray-500">估算</div>
                  </div>
                </div>

                {/* Other Branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30 w-full text-center">
                    <Code className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <div className="text-xs text-cyan-400">otherContents[]</div>
                  </div>
                  <ArrowDown className="text-gray-500 my-2 w-4 h-4" />
                  <div className="bg-cyan-800/30 rounded p-2 text-center">
                    <div className="text-xs text-cyan-400">TextTokenizer</div>
                    <div className="text-[10px] text-gray-500">JSON序列化</div>
                  </div>
                </div>
              </div>
            </div>

            <ArrowDown className="text-gray-500" />

            {/* Output */}
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30 w-full max-w-md">
              <div className="text-green-400 font-bold text-center">TokenCalculationResult</div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="text-gray-400">totalTokens:</div>
                <div className="text-white">sum(all)</div>
                <div className="text-gray-400">breakdown:</div>
                <div className="text-white">{`{ text, image, audio, other }`}</div>
                <div className="text-gray-400">processingTime:</div>
                <div className="text-white">performance.now()</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Token Calculation - Deep Dive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Image className="text-purple-400" />
          图片 Token 计算详解
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Core Formula */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              核心公式
            </h3>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300">
{`// 核心常量 (imageTokenizer.ts:22-31)
PIXELS_PER_TOKEN = 28 × 28 = 784
MIN_TOKENS_PER_IMAGE = 4
MAX_TOKENS_PER_IMAGE = 16384
VISION_SPECIAL_TOKENS = 2  // vision_bos + vision_eos

// Token 计算
imageTokens = floor(pixels / 784) + 2`}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white">标准计算</div>
                  <div className="text-xs text-gray-400">28×28 像素块 = 1 个 token</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white">边界归一化</div>
                  <div className="text-xs text-gray-400">尺寸向 28 的倍数取整</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Box className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white">特殊 Token</div>
                  <div className="text-xs text-gray-400">始终 +2 (vision_bos/eos)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scaling Logic */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              缩放策略
            </h3>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300">
{`// 缩放逻辑 (imageTokenizer.ts:275-297)
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
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-red-900/20 rounded p-3 border border-red-500/30">
                <div className="text-red-400 font-bold">大图 → 缩小</div>
                <div className="text-xs text-gray-400 mt-1">
                  {`> ${(16384 * 784 / 1000000).toFixed(1)}M 像素时缩放`}
                </div>
              </div>
              <div className="bg-blue-900/20 rounded p-3 border border-blue-500/30">
                <div className="text-blue-400 font-bold">小图 → 放大</div>
                <div className="text-xs text-gray-400 mt-1">
                  {`< ${(4 * 784)} 像素时放大`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Supported Image Formats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Binary className="text-cyan-400" />
          图片格式解析
        </h2>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 mb-4">
            ImageTokenizer 支持从二进制数据中直接解析多种图片格式的尺寸，无需依赖外部库：
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { format: 'PNG', method: 'extractPngDimensions', location: 'IHDR chunk @ bytes 16-23', color: 'green' },
              { format: 'JPEG', method: 'extractJpegDimensions', location: 'SOF markers (0xC0-0xCF)', color: 'yellow' },
              { format: 'WebP', method: 'extractWebpDimensions', location: 'VP8/VP8L/VP8X format', color: 'blue' },
              { format: 'GIF', method: 'extractGifDimensions', location: 'Header @ bytes 6-9', color: 'purple' },
              { format: 'BMP', method: 'extractBmpDimensions', location: 'Header @ bytes 18-25', color: 'orange' },
              { format: 'TIFF', method: 'extractTiffDimensions', location: 'IFD tags 0x0100/0x0101', color: 'pink' },
              { format: 'HEIC', method: 'extractHeicDimensions', location: 'ispe box in meta', color: 'cyan' },
            ].map((fmt) => (
              <div key={fmt.format} className={`bg-${fmt.color}-900/20 rounded-lg p-4 border border-${fmt.color}-500/30`}>
                <div className={`text-${fmt.color}-400 font-bold text-lg`}>{fmt.format}</div>
                <div className="text-xs text-gray-400 mt-2 font-mono">{fmt.method}</div>
                <div className="text-xs text-gray-500 mt-1">{fmt.location}</div>
              </div>
            ))}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="text-gray-400 font-bold text-lg">Fallback</div>
              <div className="text-xs text-gray-400 mt-2">不支持的格式</div>
              <div className="text-xs text-gray-500 mt-1">默认 512×512</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Text Tokenizer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="text-green-400" />
          文本 Token 计算
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-green-400 mb-4">TextTokenizer 实现</h3>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300">
{`// textTokenizer.ts
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
              </pre>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-green-400 mb-4">设计要点</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-medium">懒加载初始化</div>
                  <div className="text-sm text-gray-400 mt-1">
                    tiktoken 编码器仅在首次需要时加载，避免启动开销
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-medium">优雅降级</div>
                  <div className="text-sm text-gray-400 mt-1">
                    如果 tiktoken 加载失败，使用字符估算 (1:4 比例)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium">资源管理</div>
                  <div className="text-sm text-gray-400 mt-1">
                    dispose() 释放 WASM 内存，避免内存泄漏
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-medium">批量处理</div>
                  <div className="text-sm text-gray-400 mt-1">
                    calculateTokensBatch() 复用编码器实例
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Processing Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="text-orange-400" />
          内容处理流水线
        </h2>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <pre className="text-sm text-gray-300">
{`// requestTokenizer.ts:243-327 - 内容分类逻辑
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
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">支持的内容类型</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">string - 纯文本</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">TextPart - {`{ text: "..." }`}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">InlineData (image/*) - 图片</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">InlineData (audio/*) - 音频</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">FileData - 文件引用</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">FunctionCall/Response - 工具调用</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">Fallback 策略</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">tiktoken 失败 → 字符数/4</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">图片格式不支持 → 512×512</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">图片解析失败 → 最小 6 tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">完全失败 → JSON.stringify 后估算</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Example Calculations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="text-pink-400" />
          计算示例
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Example 1: Small Image */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="text-pink-400 font-bold mb-4">示例 1: 小图放大</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">原始尺寸:</span>
                <span className="text-white">50 × 50 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">像素数:</span>
                <span className="text-white">2,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">最小阈值:</span>
                <span className="text-yellow-400">3,136 (需放大)</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <span className="text-gray-400">beta:</span>
                <span className="text-white">√(3136/2500) ≈ 1.12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">放大后:</span>
                <span className="text-white">56 × 56 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span className="text-green-400 font-bold">4 + 2 = 6</span>
              </div>
            </div>
          </div>

          {/* Example 2: Normal Image */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="text-pink-400 font-bold mb-4">示例 2: 标准图片</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">原始尺寸:</span>
                <span className="text-white">1920 × 1080 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">归一化:</span>
                <span className="text-white">1932 × 1092 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">像素数:</span>
                <span className="text-white">2,109,744</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <span className="text-gray-400">计算:</span>
                <span className="text-white">2109744 / 784</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">图片Token:</span>
                <span className="text-white">2691</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">总Token:</span>
                <span className="text-green-400 font-bold">2691 + 2 = 2693</span>
              </div>
            </div>
          </div>

          {/* Example 3: Large Image */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="text-pink-400 font-bold mb-4">示例 3: 大图缩小</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">原始尺寸:</span>
                <span className="text-white">8000 × 6000 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">像素数:</span>
                <span className="text-white">48,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">最大阈值:</span>
                <span className="text-yellow-400">12,845,056 (需缩小)</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <span className="text-gray-400">beta:</span>
                <span className="text-white">√(48M/12.8M) ≈ 1.93</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">缩小后:</span>
                <span className="text-white">4144 × 3108 px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span className="text-green-400 font-bold">16384 + 2 = 16386</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Singleton Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Hash className="text-indigo-400" />
          单例模式与资源管理
        </h2>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <pre className="text-sm text-gray-300">
{`// request-tokenizer/index.ts - 单例管理
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
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-900/20 rounded p-4 border border-green-500/30">
              <div className="text-green-400 font-bold mb-2">为什么使用单例?</div>
              <ul className="text-gray-300 space-y-1">
                <li>• tiktoken 编码器加载开销大</li>
                <li>• WASM 模块只需初始化一次</li>
                <li>• 全局共享减少内存占用</li>
              </ul>
            </div>
            <div className="bg-yellow-900/20 rounded p-4 border border-yellow-500/30">
              <div className="text-yellow-400 font-bold mb-2">何时调用 dispose?</div>
              <ul className="text-gray-300 space-y-1">
                <li>• 应用程序退出时</li>
                <li>• 长时间不需要时释放内存</li>
                <li>• 需要重新配置编码时</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Source References */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-300 mb-4">源码参考</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-2">核心文件</div>
            <ul className="space-y-1 text-gray-500">
              <li>• packages/core/src/utils/request-tokenizer/index.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/requestTokenizer.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/imageTokenizer.ts</li>
              <li>• packages/core/src/utils/request-tokenizer/textTokenizer.ts</li>
            </ul>
          </div>
          <div>
            <div className="text-gray-400 mb-2">关键接口</div>
            <ul className="space-y-1 text-gray-500">
              <li>• RequestTokenizer - 请求 Token 计算接口</li>
              <li>• TokenCalculationResult - 计算结果结构</li>
              <li>• ImageMetadata - 图片元数据</li>
              <li>• TokenizerConfig - 配置选项</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenManagementStrategy;
