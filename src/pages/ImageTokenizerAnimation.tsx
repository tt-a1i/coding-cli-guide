import { useState, useCallback } from 'react';

// Image format signatures
const FORMAT_SIGNATURES = {
  PNG: { magic: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], hex: '89 50 4E 47 0D 0A 1A 0A', name: 'PNG' },
  JPEG: { magic: [0xFF, 0xD8, 0xFF], hex: 'FF D8 FF', name: 'JPEG' },
  GIF87a: { magic: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], hex: '47 49 46 38 37 61', name: 'GIF87a' },
  GIF89a: { magic: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], hex: '47 49 46 38 39 61', name: 'GIF89a' },
  WEBP: { magic: [0x52, 0x49, 0x46, 0x46], hex: '52 49 46 46 ... 57 45 42 50', name: 'WebP' },
  BMP: { magic: [0x42, 0x4D], hex: '42 4D', name: 'BMP' },
  TIFF_LE: { magic: [0x49, 0x49, 0x2A, 0x00], hex: '49 49 2A 00', name: 'TIFF (LE)' },
  TIFF_BE: { magic: [0x4D, 0x4D, 0x00, 0x2A], hex: '4D 4D 00 2A', name: 'TIFF (BE)' },
  HEIC: { magic: [0x66, 0x74, 0x79, 0x70], hex: '... 66 74 79 70 (ftyp)', name: 'HEIC/HEIF' },
};

// Constants from source
const PIXELS_PER_TOKEN = 28 * 28; // 784
const MIN_TOKENS = 4;
const MAX_TOKENS = 16384;
const VISION_SPECIAL_TOKENS = 85;

type Phase = 'idle' | 'loading' | 'detecting' | 'parsing' | 'scaling' | 'complete';
type ImageFormat = 'PNG' | 'JPEG' | 'WebP' | 'GIF' | 'BMP' | 'TIFF' | 'HEIC';

interface ImageData {
  format: ImageFormat;
  width: number;
  height: number;
  bytes: number[];
}

interface ScalingStep {
  step: string;
  hBar: number;
  wBar: number;
  pixels: number;
  tokens: number;
  beta?: number;
  action?: string;
}

// Sample images for demonstration
const SAMPLE_IMAGES: Record<string, ImageData> = {
  'small_png': {
    format: 'PNG',
    width: 64,
    height: 64,
    bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x40, 0x08, 0x06, 0x00, 0x00, 0x00]
  },
  'large_jpeg': {
    format: 'JPEG',
    width: 4096,
    height: 3072,
    bytes: [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x48,
            0xFF, 0xC0, 0x00, 0x11, 0x08, 0x0C, 0x00, 0x10, 0x00, 0x03, 0x01, 0x22, 0x00]
  },
  'medium_webp': {
    format: 'WebP',
    width: 1920,
    height: 1080,
    bytes: [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4C,
            0x00, 0x00, 0x00, 0x00, 0x2F, 0x00, 0x00, 0x00]
  },
  'tiny_gif': {
    format: 'GIF',
    width: 16,
    height: 16,
    bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x10, 0x00, 0x10, 0x00, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00]
  },
};

export default function ImageTokenizerAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [highlightedBytes, setHighlightedBytes] = useState<number[]>([]);
  const [parsedDimensions, setParsedDimensions] = useState<{width: number; height: number} | null>(null);
  const [scalingSteps, setScalingSteps] = useState<ScalingStep[]>([]);
  const [finalTokens, setFinalTokens] = useState<number>(0);
  const [parseInfo, setParseInfo] = useState<string>('');

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateTokensWithScaling = useCallback((width: number, height: number): ScalingStep[] => {
    const steps: ScalingStep[] = [];

    // Step 1: Initial 28-pixel rounding
    let hBar = Math.round(height / 28) * 28;
    let wBar = Math.round(width / 28) * 28;

    steps.push({
      step: '1. 28像素对齐',
      hBar,
      wBar,
      pixels: hBar * wBar,
      tokens: Math.floor((hBar * wBar) / PIXELS_PER_TOKEN),
      action: `height ${height} → ${hBar}, width ${width} → ${wBar}`
    });

    const minPixels = MIN_TOKENS * PIXELS_PER_TOKEN;
    const maxPixels = MAX_TOKENS * PIXELS_PER_TOKEN;

    // Check bounds
    if (hBar * wBar > maxPixels) {
      const beta = Math.sqrt((height * width) / maxPixels);
      const newHBar = Math.floor(height / beta / 28) * 28;
      const newWBar = Math.floor(width / beta / 28) * 28;

      steps.push({
        step: '2. 超出最大限制，缩小',
        hBar: newHBar,
        wBar: newWBar,
        pixels: newHBar * newWBar,
        tokens: Math.floor((newHBar * newWBar) / PIXELS_PER_TOKEN),
        beta: Math.round(beta * 1000) / 1000,
        action: `β = √(${width}×${height} / ${maxPixels}) = ${beta.toFixed(3)}`
      });

      hBar = newHBar;
      wBar = newWBar;
    } else if (hBar * wBar < minPixels) {
      const beta = Math.sqrt(minPixels / (height * width));
      const newHBar = Math.ceil((height * beta) / 28) * 28;
      const newWBar = Math.ceil((width * beta) / 28) * 28;

      steps.push({
        step: '2. 低于最小限制，放大',
        hBar: newHBar,
        wBar: newWBar,
        pixels: newHBar * newWBar,
        tokens: Math.floor((newHBar * newWBar) / PIXELS_PER_TOKEN),
        beta: Math.round(beta * 1000) / 1000,
        action: `β = √(${minPixels} / ${width}×${height}) = ${beta.toFixed(3)}`
      });

      hBar = newHBar;
      wBar = newWBar;
    } else {
      steps.push({
        step: '2. 在合理范围内',
        hBar,
        wBar,
        pixels: hBar * wBar,
        tokens: Math.floor((hBar * wBar) / PIXELS_PER_TOKEN),
        action: `${minPixels} ≤ ${hBar * wBar} ≤ ${maxPixels} ✓`
      });
    }

    // Final token calculation
    const baseTokens = Math.floor((hBar * wBar) / PIXELS_PER_TOKEN);
    steps.push({
      step: '3. 计算最终 Token',
      hBar,
      wBar,
      pixels: hBar * wBar,
      tokens: baseTokens + VISION_SPECIAL_TOKENS,
      action: `${baseTokens} + ${VISION_SPECIAL_TOKENS} (特殊标记) = ${baseTokens + VISION_SPECIAL_TOKENS}`
    });

    return steps;
  }, []);

  const detectFormat = useCallback((bytes: number[]): { format: string; highlight: number[] } => {
    // PNG check
    if (bytes.length >= 8 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { format: 'PNG', highlight: [0, 1, 2, 3, 4, 5, 6, 7] };
    }

    // JPEG check
    if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { format: 'JPEG', highlight: [0, 1, 2] };
    }

    // WebP check
    if (bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { format: 'WebP', highlight: [0, 1, 2, 3, 8, 9, 10, 11] };
    }

    // GIF check
    if (bytes.length >= 6 &&
        bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { format: 'GIF', highlight: [0, 1, 2, 3, 4, 5] };
    }

    return { format: 'Unknown', highlight: [] };
  }, []);

  const getParseInfo = useCallback((format: string): { info: string; dimensionBytes: number[] } => {
    switch (format) {
      case 'PNG':
        return {
          info: 'PNG: IHDR chunk 在偏移 16-23，宽度@16-19 (BE), 高度@20-23 (BE)',
          dimensionBytes: [16, 17, 18, 19, 20, 21, 22, 23]
        };
      case 'JPEG':
        return {
          info: 'JPEG: 搜索 SOF 标记 (0xFFC0-0xFFCF)，高度@offset+5, 宽度@offset+7',
          dimensionBytes: [17, 18, 19, 20, 21, 22]
        };
      case 'WebP':
        return {
          info: 'WebP: 检查 VP8/VP8L/VP8X 子类型，维度编码因类型而异',
          dimensionBytes: [12, 13, 14, 15, 20, 21, 22, 23]
        };
      case 'GIF':
        return {
          info: 'GIF: 逻辑屏幕描述符 @6-9，宽度@6-7 (LE), 高度@8-9 (LE)',
          dimensionBytes: [6, 7, 8, 9]
        };
      default:
        return { info: '未知格式', dimensionBytes: [] };
    }
  }, []);

  const runAnimation = useCallback(async () => {
    if (!selectedImage || !SAMPLE_IMAGES[selectedImage]) return;

    const image = SAMPLE_IMAGES[selectedImage];
    setCurrentImage(image);
    setPhase('loading');
    setDetectedFormat('');
    setHighlightedBytes([]);
    setParsedDimensions(null);
    setScalingSteps([]);
    setFinalTokens(0);
    setParseInfo('');

    await sleep(500);

    // Phase 1: Format Detection
    setPhase('detecting');
    await sleep(300);

    const { format, highlight } = detectFormat(image.bytes);
    setHighlightedBytes(highlight);
    await sleep(800);
    setDetectedFormat(format);
    await sleep(500);

    // Phase 2: Dimension Parsing
    setPhase('parsing');
    const parseResult = getParseInfo(format);
    setParseInfo(parseResult.info);
    await sleep(500);
    setHighlightedBytes(parseResult.dimensionBytes);
    await sleep(800);
    setParsedDimensions({ width: image.width, height: image.height });
    await sleep(500);

    // Phase 3: Token Scaling
    setPhase('scaling');
    const steps = calculateTokensWithScaling(image.width, image.height);

    for (let i = 0; i < steps.length; i++) {
      setScalingSteps(prev => [...prev, steps[i]]);
      await sleep(800);
    }

    setFinalTokens(steps[steps.length - 1].tokens);
    await sleep(300);
    setPhase('complete');
  }, [selectedImage, detectFormat, getParseInfo, calculateTokensWithScaling]);

  const reset = () => {
    setPhase('idle');
    setSelectedImage('');
    setCurrentImage(null);
    setDetectedFormat('');
    setHighlightedBytes([]);
    setParsedDimensions(null);
    setScalingSteps([]);
    setFinalTokens(0);
    setParseInfo('');
  };

  const formatByte = (byte: number) => byte.toString(16).toUpperCase().padStart(2, '0');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-100">Image Tokenizer 二进制解析</h1>
      <p className="text-gray-400 mb-6">
        展示图像二进制格式检测、维度提取和 Vision Token 计算过程
      </p>

      {/* Format Signatures Reference */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">支持的图像格式签名</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {Object.entries(FORMAT_SIGNATURES).map(([key, sig]) => (
            <div key={key} className="p-2 bg-gray-900/50 rounded">
              <span className="font-medium text-blue-400">{sig.name}</span>
              <div className="text-gray-500 font-mono mt-1">{sig.hex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedImage}
          onChange={(e) => setSelectedImage(e.target.value)}
          disabled={phase !== 'idle'}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
        >
          <option value="">选择示例图像...</option>
          <option value="small_png">小型 PNG (64×64)</option>
          <option value="large_jpeg">大型 JPEG (4096×3072)</option>
          <option value="medium_webp">中等 WebP (1920×1080)</option>
          <option value="tiny_gif">微型 GIF (16×16)</option>
        </select>
        <button
          onClick={runAnimation}
          disabled={!selectedImage || phase !== 'idle'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-sm font-medium transition-colors"
        >
          开始解析
        </button>
        <button
          onClick={reset}
          disabled={phase === 'idle'}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-gray-200 text-sm transition-colors"
        >
          重置
        </button>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['loading', 'detecting', 'parsing', 'scaling', 'complete'] as Phase[]).map((p, idx) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              phase === p ? 'bg-blue-500 text-white ring-2 ring-blue-400/50' :
              ['detecting', 'parsing', 'scaling', 'complete'].indexOf(phase) > ['detecting', 'parsing', 'scaling', 'complete'].indexOf(p) - 1 && phase !== 'idle' && phase !== 'loading'
                ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              {idx + 1}
            </div>
            <span className={`text-xs ${phase === p ? 'text-blue-400' : 'text-gray-500'}`}>
              {p === 'loading' ? '加载' : p === 'detecting' ? '检测' : p === 'parsing' ? '解析' : p === 'scaling' ? '缩放' : '完成'}
            </span>
            {idx < 4 && <div className="w-8 h-0.5 bg-gray-700" />}
          </div>
        ))}
      </div>

      {currentImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Binary View */}
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              二进制数据 (前 {currentImage.bytes.length} 字节)
            </h3>
            <div className="font-mono text-xs bg-black/50 p-3 rounded overflow-x-auto">
              <div className="flex flex-wrap gap-1">
                {currentImage.bytes.map((byte, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      highlightedBytes.includes(idx)
                        ? 'bg-yellow-500/30 text-yellow-300 ring-1 ring-yellow-500/50'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatByte(byte)}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-gray-600 flex flex-wrap gap-1">
                {currentImage.bytes.map((_, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 text-center" style={{ minWidth: '1.75rem' }}>
                    {idx.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            {/* Format Detection Result */}
            {detectedFormat && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">检测到格式:</span>
                  <span className="font-bold text-green-300">{detectedFormat}</span>
                </div>
              </div>
            )}

            {/* Parse Info */}
            {parseInfo && (
              <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded">
                <div className="text-xs text-blue-300">{parseInfo}</div>
              </div>
            )}

            {/* Parsed Dimensions */}
            {parsedDimensions && (
              <div className="mt-3 p-3 bg-purple-900/30 border border-purple-700/50 rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-purple-400 text-xs">宽度:</span>
                    <span className="ml-2 font-bold text-purple-300">{parsedDimensions.width}px</span>
                  </div>
                  <div>
                    <span className="text-purple-400 text-xs">高度:</span>
                    <span className="ml-2 font-bold text-purple-300">{parsedDimensions.height}px</span>
                  </div>
                  <div>
                    <span className="text-purple-400 text-xs">像素总数:</span>
                    <span className="ml-2 font-bold text-purple-300">
                      {(parsedDimensions.width * parsedDimensions.height).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Token Scaling Process */}
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Token 缩放计算
            </h3>

            {/* Constants */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              <div className="p-2 bg-gray-800 rounded text-center">
                <div className="text-gray-500">每 Token 像素</div>
                <div className="font-mono text-gray-300">28×28 = {PIXELS_PER_TOKEN}</div>
              </div>
              <div className="p-2 bg-gray-800 rounded text-center">
                <div className="text-gray-500">最小 Token</div>
                <div className="font-mono text-gray-300">{MIN_TOKENS}</div>
              </div>
              <div className="p-2 bg-gray-800 rounded text-center">
                <div className="text-gray-500">最大 Token</div>
                <div className="font-mono text-gray-300">{MAX_TOKENS.toLocaleString()}</div>
              </div>
            </div>

            {/* Scaling Steps */}
            <div className="space-y-3">
              {scalingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-800/50 rounded border-l-2 border-orange-500 animate-fadeIn"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-400">{step.step}</span>
                    {step.beta && (
                      <span className="text-xs bg-orange-900/50 px-2 py-0.5 rounded text-orange-300">
                        β = {step.beta}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="text-gray-400">
                      尺寸: <span className="text-gray-200">{step.wBar}×{step.hBar}</span>
                    </div>
                    <div className="text-gray-400">
                      像素: <span className="text-gray-200">{step.pixels.toLocaleString()}</span>
                    </div>
                  </div>
                  {step.action && (
                    <div className="text-xs text-gray-500 font-mono bg-black/30 p-2 rounded">
                      {step.action}
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <span className="text-xs text-gray-500">Token: </span>
                    <span className={`font-bold ${idx === scalingSteps.length - 1 ? 'text-green-400 text-lg' : 'text-gray-300'}`}>
                      {step.tokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Result */}
            {phase === 'complete' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-600/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-green-400 mb-1">最终 Vision Token 数</div>
                  <div className="text-3xl font-bold text-green-300">{finalTokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    包含 {VISION_SPECIAL_TOKENS} 个特殊标记
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Algorithm Visualization */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">算法流程图</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className={`p-2 rounded border ${phase === 'loading' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600'}`}>
            加载二进制
          </div>
          <span className="text-gray-600">→</span>
          <div className={`p-2 rounded border ${phase === 'detecting' ? 'border-yellow-500 bg-yellow-900/30' : 'border-gray-600'}`}>
            Magic 检测
          </div>
          <span className="text-gray-600">→</span>
          <div className={`p-2 rounded border ${phase === 'parsing' ? 'border-purple-500 bg-purple-900/30' : 'border-gray-600'}`}>
            维度提取
          </div>
          <span className="text-gray-600">→</span>
          <div className={`p-2 rounded border ${phase === 'scaling' ? 'border-orange-500 bg-orange-900/30' : 'border-gray-600'}`}>
            28px 对齐
          </div>
          <span className="text-gray-600">→</span>
          <div className={`p-2 rounded border ${phase === 'scaling' ? 'border-orange-500 bg-orange-900/30' : 'border-gray-600'}`}>
            边界检查
          </div>
          <span className="text-gray-600">→</span>
          <div className={`p-2 rounded border ${phase === 'complete' ? 'border-green-500 bg-green-900/30' : 'border-gray-600'}`}>
            Token 输出
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">缩小公式 (超出最大)</h4>
          <div className="font-mono text-xs text-gray-300 space-y-1">
            <div>β = √(width × height / maxPixels)</div>
            <div>h̄ = ⌊height / β / 28⌋ × 28</div>
            <div>w̄ = ⌊width / β / 28⌋ × 28</div>
          </div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">放大公式 (低于最小)</h4>
          <div className="font-mono text-xs text-gray-300 space-y-1">
            <div>β = √(minPixels / (width × height))</div>
            <div>h̄ = ⌈height × β / 28⌉ × 28</div>
            <div>w̄ = ⌈width × β / 28⌉ × 28</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
