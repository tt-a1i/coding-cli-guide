// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

/**
 * Vim 文本缓冲区引擎动画
 *
 * 可视化 Unicode 感知的文本导航系统：
 * 1. Script 边界检测（Latin, Han, Arabic, Cyrillic 等）
 * 2. 词边界检测算法
 * 3. Vim 风格导航命令（w, b, e, W, B, E）
 * 4. Unicode 脚本类型识别
 *
 * 源码位置: packages/cli/src/ui/components/shared/text-buffer.ts
 */

// Unicode 脚本类型
type UnicodeScript =
  | 'Latin'
  | 'Han'
  | 'Hiragana'
  | 'Katakana'
  | 'Arabic'
  | 'Cyrillic'
  | 'Thai'
  | 'Hangul'
  | 'Whitespace'
  | 'Punctuation'
  | 'Other';

// 导航命令类型
type VimCommand = 'w' | 'b' | 'e' | 'W' | 'B' | 'E' | '0' | '$';

// 动画阶段
type AnimationPhase =
  | 'init'
  | 'analyze_text'
  | 'detect_scripts'
  | 'find_boundaries'
  | 'navigate_word'
  | 'cross_script'
  | 'complete';

interface CharInfo {
  char: string;
  script: UnicodeScript;
  index: number;
  isWordBoundary: boolean;
  isScriptBoundary: boolean;
}

interface NavigationStep {
  command: VimCommand;
  fromIndex: number;
  toIndex: number;
  crossedScripts: UnicodeScript[];
  description: string;
}

interface AnimationStep {
  phase: AnimationPhase;
  title: string;
  description: string;
  codeSnippet?: string;
  visualData?: {
    text?: string;
    chars?: CharInfo[];
    cursor?: number;
    navigation?: NavigationStep;
    highlightRange?: [number, number];
  };
  duration: number;
}

// 示例多语言文本
const SAMPLE_TEXT = 'Hello世界 مرحبا Привет こんにちは 안녕';

// 模拟脚本检测
function getCharScript(char: string): UnicodeScript {
  const code = char.charCodeAt(0);

  if (/\s/.test(char)) return 'Whitespace';
  if (/[^\w\s]/.test(char) && code < 128) return 'Punctuation';

  // Latin (Basic Latin + Latin Extended)
  if ((code >= 0x0041 && code <= 0x007A) || (code >= 0x00C0 && code <= 0x024F)) {
    return 'Latin';
  }

  // CJK Unified Ideographs (Han)
  if (code >= 0x4E00 && code <= 0x9FFF) return 'Han';

  // Hiragana
  if (code >= 0x3040 && code <= 0x309F) return 'Hiragana';

  // Katakana
  if (code >= 0x30A0 && code <= 0x30FF) return 'Katakana';

  // Arabic
  if (code >= 0x0600 && code <= 0x06FF) return 'Arabic';

  // Cyrillic
  if (code >= 0x0400 && code <= 0x04FF) return 'Cyrillic';

  // Thai
  if (code >= 0x0E00 && code <= 0x0E7F) return 'Thai';

  // Hangul
  if ((code >= 0xAC00 && code <= 0xD7AF) || (code >= 0x1100 && code <= 0x11FF)) {
    return 'Hangul';
  }

  return 'Other';
}

// 分析文本中的所有字符
function analyzeText(text: string): CharInfo[] {
  const chars: CharInfo[] = [];
  let prevScript: UnicodeScript | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const script = getCharScript(char);
    const isScriptBoundary = prevScript !== null &&
                              prevScript !== script &&
                              script !== 'Whitespace' &&
                              prevScript !== 'Whitespace';
    const isWordBoundary = script === 'Whitespace' || isScriptBoundary;

    chars.push({
      char,
      script,
      index: i,
      isWordBoundary,
      isScriptBoundary
    });

    prevScript = script;
  }

  return chars;
}

// 动画步骤序列
const animationSteps: AnimationStep[] = [
  {
    phase: 'init',
    title: '初始化文本缓冲区',
    description: '创建 Unicode 感知的文本缓冲区，准备处理多语言文本',
    codeSnippet: `class TextBuffer {
  private lines: string[] = [];
  private cursor: { line: number; col: number };

  // Unicode 脚本范围定义
  private readonly SCRIPT_RANGES = {
    Latin: [[0x0041, 0x007A], [0x00C0, 0x024F]],
    Han: [[0x4E00, 0x9FFF]],
    Hiragana: [[0x3040, 0x309F]],
    Katakana: [[0x30A0, 0x30FF]],
    Arabic: [[0x0600, 0x06FF]],
    Cyrillic: [[0x0400, 0x04FF]],
    // ... more scripts
  };
}`,
    visualData: {
      text: SAMPLE_TEXT,
      cursor: 0
    },
    duration: 2000
  },
  {
    phase: 'analyze_text',
    title: '文本分析',
    description: '遍历文本，识别每个字符的 Unicode 码点和脚本类型',
    codeSnippet: `getCharScript(char: string): UnicodeScript {
  const code = char.charCodeAt(0);

  // 检查空白字符
  if (/\\s/.test(char)) return 'Whitespace';

  // 检查 Latin 范围
  if ((code >= 0x0041 && code <= 0x007A) ||
      (code >= 0x00C0 && code <= 0x024F)) {
    return 'Latin';
  }

  // 检查 CJK 统一汉字
  if (code >= 0x4E00 && code <= 0x9FFF) {
    return 'Han';
  }

  // ... 检查其他脚本范围
}`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 0
    },
    duration: 3000
  },
  {
    phase: 'detect_scripts',
    title: '脚本边界检测',
    description: '识别不同 Unicode 脚本之间的边界，用于智能词导航',
    codeSnippet: `isDifferentScript(
  prevScript: UnicodeScript,
  currScript: UnicodeScript
): boolean {
  // 空白和标点不构成脚本边界
  if (currScript === 'Whitespace') return false;
  if (prevScript === 'Whitespace') return false;
  if (currScript === 'Punctuation') return false;
  if (prevScript === 'Punctuation') return false;

  // 不同脚本之间是边界
  return prevScript !== currScript;
}`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 0,
      highlightRange: [5, 7] // "世界" 边界
    },
    duration: 3000
  },
  {
    phase: 'find_boundaries',
    title: '词边界计算',
    description: '根据脚本边界和空白字符计算词的边界位置',
    codeSnippet: `findNextWordStartInLine(
  line: string,
  col: number
): number {
  let i = col;
  const chars = [...line];
  let prevScript = this.getCharScript(chars[i] || '');

  // 跳过当前词
  while (i < chars.length) {
    const currScript = this.getCharScript(chars[i]);
    if (currScript === 'Whitespace' ||
        this.isDifferentScript(prevScript, currScript)) {
      break;
    }
    prevScript = currScript;
    i++;
  }

  // 跳过空白
  while (i < chars.length &&
         this.getCharScript(chars[i]) === 'Whitespace') {
    i++;
  }

  return i;
}`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 0
    },
    duration: 3500
  },
  {
    phase: 'navigate_word',
    title: 'Vim 词导航 (w 命令)',
    description: '执行 w 命令：跳到下一个词的开头，智能识别脚本边界',
    codeSnippet: `moveToNextWordStart(): void {
  const line = this.lines[this.cursor.line];
  const newCol = this.findNextWordStartInLine(
    line,
    this.cursor.col
  );

  if (newCol < line.length) {
    this.cursor.col = newCol;
  } else if (this.cursor.line < this.lines.length - 1) {
    // 跳到下一行
    this.cursor.line++;
    this.cursor.col = this.findFirstNonWhitespace(
      this.lines[this.cursor.line]
    );
  }
}`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 0,
      navigation: {
        command: 'w',
        fromIndex: 0,
        toIndex: 5,
        crossedScripts: ['Latin', 'Han'],
        description: 'Hello → 世界 (Latin → Han)'
      }
    },
    duration: 3000
  },
  {
    phase: 'cross_script',
    title: '跨脚本导航',
    description: '连续执行 w 命令，观察跨越不同 Unicode 脚本的导航行为',
    codeSnippet: `// 导航序列演示
// 位置: 0 "Hello" (Latin)
//   w → 位置: 5 "世界" (Han)
//   w → 位置: 8 "مرحبا" (Arabic)
//   w → 位置: 14 "Привет" (Cyrillic)
//   w → 位置: 21 "こんにちは" (Hiragana)
//   w → 位置: 27 "안녕" (Hangul)

// 每次 w 命令智能识别脚本边界
const boundaries = [
  { pos: 0, script: 'Latin' },
  { pos: 5, script: 'Han' },
  { pos: 8, script: 'Arabic' },
  { pos: 14, script: 'Cyrillic' },
  { pos: 21, script: 'Hiragana' },
  { pos: 27, script: 'Hangul' }
];`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 5,
      navigation: {
        command: 'w',
        fromIndex: 5,
        toIndex: 8,
        crossedScripts: ['Han', 'Arabic'],
        description: '世界 → مرحبا (Han → Arabic)'
      }
    },
    duration: 4000
  },
  {
    phase: 'complete',
    title: '导航完成',
    description: 'Unicode 感知的文本缓冲区成功处理多语言文本导航',
    codeSnippet: `// 支持的 Vim 命令
const VIM_COMMANDS = {
  'w': 'moveToNextWordStart',    // 下一词开头
  'b': 'moveToPrevWordStart',    // 上一词开头
  'e': 'moveToWordEnd',          // 当前词结尾
  'W': 'moveToNextBigWordStart', // 下一大词（忽略脚本边界）
  'B': 'moveToPrevBigWordStart', // 上一大词
  'E': 'moveToBigWordEnd',       // 大词结尾
  '0': 'moveToLineStart',        // 行首
  '$': 'moveToLineEnd',          // 行尾
  'gg': 'moveToFileStart',       // 文件开头
  'G': 'moveToFileEnd',          // 文件结尾
};`,
    visualData: {
      text: SAMPLE_TEXT,
      chars: analyzeText(SAMPLE_TEXT),
      cursor: 27
    },
    duration: 2000
  }
];

// 脚本颜色映射
const scriptColors: Record<UnicodeScript, string> = {
  Latin: 'var(--terminal-green)',
  Han: 'var(--cyber-blue)',
  Hiragana: 'var(--purple)',
  Katakana: 'var(--purple)',
  Arabic: 'var(--amber)',
  Cyrillic: '#ff6b6b',
  Thai: '#4ecdc4',
  Hangul: '#f7dc6f',
  Whitespace: 'var(--text-secondary)',
  Punctuation: 'var(--text-tertiary)',
  Other: 'var(--text-muted)'
};

// 文本可视化组件
function TextVisualizer({
  chars,
  cursor,
  highlightRange,
  navigation
}: {
  chars: CharInfo[];
  cursor: number;
  highlightRange?: [number, number];
  navigation?: NavigationStep;
}) {
  return (
    <div className="bg-black/40 rounded-lg p-4 font-mono">
      <div className="text-xs text-[var(--text-secondary)] mb-2">
        文本内容（按脚本着色）
      </div>

      <div className="flex flex-wrap gap-0.5 text-xl mb-4">
        {chars.map((charInfo, idx) => {
          const isCursor = idx === cursor;
          const isHighlighted = highlightRange &&
                                idx >= highlightRange[0] &&
                                idx < highlightRange[1];
          const isNavigationFrom = navigation?.fromIndex === idx;
          const isNavigationTo = navigation?.toIndex === idx;

          return (
            <span
              key={idx}
              className={`
                relative px-0.5 transition-all duration-300
                ${isCursor ? 'bg-[var(--terminal-green)] text-black' : ''}
                ${isHighlighted ? 'bg-yellow-500/30' : ''}
                ${isNavigationFrom ? 'ring-2 ring-red-500' : ''}
                ${isNavigationTo ? 'ring-2 ring-green-500' : ''}
                ${charInfo.isScriptBoundary ? 'border-l-2 border-[var(--amber)]' : ''}
              `}
              style={{
                color: isCursor ? 'black' : scriptColors[charInfo.script]
              }}
            >
              {charInfo.char === ' ' ? '␣' : charInfo.char}
              {charInfo.isScriptBoundary && (
                <span className="absolute -top-3 left-0 text-[8px] text-[var(--amber)]">
                  ▼
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* 导航指示 */}
      {navigation && (
        <div className="mt-4 p-3 bg-[var(--terminal-green)]/10 rounded border border-[var(--terminal-green)]/30">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--terminal-green)] font-bold">
              {navigation.command}
            </span>
            <span className="text-[var(--text-secondary)]">→</span>
            <span className="text-[var(--text-primary)]">
              {navigation.description}
            </span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            跨越脚本: {navigation.crossedScripts.join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}

// 脚本图例组件
function ScriptLegend({ chars }: { chars: CharInfo[] }) {
  const scripts = [...new Set(chars.map(c => c.script))].filter(
    s => s !== 'Whitespace' && s !== 'Punctuation'
  );

  return (
    <div className="bg-black/40 rounded-lg p-4">
      <div className="text-xs text-[var(--text-secondary)] mb-3">
        Unicode 脚本类型
      </div>

      <div className="grid grid-cols-3 gap-2">
        {scripts.map(script => (
          <div
            key={script}
            className="flex items-center gap-2 p-2 bg-black/30 rounded"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: scriptColors[script] }}
            />
            <span className="text-sm" style={{ color: scriptColors[script] }}>
              {script}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 字符详情表格
function CharacterTable({ chars, cursor }: { chars: CharInfo[]; cursor: number }) {
  // 只显示光标周围的字符
  const start = Math.max(0, cursor - 3);
  const end = Math.min(chars.length, cursor + 4);
  const visibleChars = chars.slice(start, end);

  return (
    <div className="bg-black/40 rounded-lg p-4">
      <div className="text-xs text-[var(--text-secondary)] mb-3">
        字符分析（光标位置: {cursor}）
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-[var(--text-secondary)]">
            <th className="text-left p-1">索引</th>
            <th className="text-left p-1">字符</th>
            <th className="text-left p-1">脚本</th>
            <th className="text-left p-1">码点</th>
            <th className="text-left p-1">边界</th>
          </tr>
        </thead>
        <tbody>
          {visibleChars.map((char, idx) => {
            const actualIdx = start + idx;
            const isCursor = actualIdx === cursor;

            return (
              <tr
                key={actualIdx}
                className={`
                  ${isCursor ? 'bg-[var(--terminal-green)]/20' : ''}
                  border-t border-white/5
                `}
              >
                <td className="p-1 text-[var(--text-muted)]">
                  {actualIdx}
                  {isCursor && <span className="ml-1">◄</span>}
                </td>
                <td
                  className="p-1 font-mono text-lg"
                  style={{ color: scriptColors[char.script] }}
                >
                  {char.char === ' ' ? '␣' : char.char}
                </td>
                <td className="p-1" style={{ color: scriptColors[char.script] }}>
                  {char.script}
                </td>
                <td className="p-1 text-[var(--text-secondary)]">
                  U+{char.char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}
                </td>
                <td className="p-1">
                  {char.isScriptBoundary && (
                    <span className="text-[var(--amber)]">脚本</span>
                  )}
                  {char.isWordBoundary && !char.isScriptBoundary && (
                    <span className="text-[var(--cyber-blue)]">词</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Vim 命令参考
function VimCommandReference() {
  const commands = [
    { key: 'w', desc: '下一词开头', type: 'word' },
    { key: 'b', desc: '上一词开头', type: 'word' },
    { key: 'e', desc: '词结尾', type: 'word' },
    { key: 'W', desc: '下一大词', type: 'bigword' },
    { key: 'B', desc: '上一大词', type: 'bigword' },
    { key: 'E', desc: '大词结尾', type: 'bigword' },
  ];

  return (
    <div className="bg-black/40 rounded-lg p-4">
      <div className="text-xs text-[var(--text-secondary)] mb-3">
        Vim 导航命令
      </div>

      <div className="grid grid-cols-2 gap-2">
        {commands.map(cmd => (
          <div
            key={cmd.key}
            className={`
              flex items-center justify-between p-2 rounded
              ${cmd.type === 'word'
                ? 'bg-[var(--terminal-green)]/10 border border-[var(--terminal-green)]/30'
                : 'bg-[var(--cyber-blue)]/10 border border-[var(--cyber-blue)]/30'
              }
            `}
          >
            <span className="font-mono font-bold text-[var(--text-primary)]">
              {cmd.key}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {cmd.desc}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-[var(--text-secondary)]">
        <span className="text-[var(--terminal-green)]">●</span> 词命令: 识别脚本边界
        <br />
        <span className="text-[var(--cyber-blue)]">●</span> 大词命令: 只识别空白
      </div>
    </div>
  );
}

export function VimBufferAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedCursor, setAnimatedCursor] = useState(0);

  const step = animationSteps[currentStep];

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < animationSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, step.duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, step.duration]);

  // 光标动画
  useEffect(() => {
    if (step.visualData?.cursor !== undefined) {
      setAnimatedCursor(step.visualData.cursor);
    }
  }, [currentStep, step.visualData?.cursor]);

  const handleStepChange = useCallback((newStep: number) => {
    setCurrentStep(newStep);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentStep >= animationSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentStep]);

  const chars = step.visualData?.chars || analyzeText(SAMPLE_TEXT);

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--terminal-green)' }}>
          Vim 文本缓冲区引擎
        </h1>
        <p className="text-gray-400">
          Unicode 感知的文本导航系统，智能识别脚本边界
        </p>
        <div className="mt-2 text-sm text-gray-500">
          源码: packages/cli/src/ui/components/shared/text-buffer.ts
        </div>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: isPlaying ? '#ef4444' : '#22c55e',
            border: `1px solid ${isPlaying ? '#ef4444' : '#22c55e'}`
          }}
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button
          onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-2 rounded text-sm disabled:opacity-30"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        >
          ← 上一步
        </button>
        <button
          onClick={() => handleStepChange(Math.min(animationSteps.length - 1, currentStep + 1))}
          disabled={currentStep === animationSteps.length - 1}
          className="px-3 py-2 rounded text-sm disabled:opacity-30"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        >
          下一步 →
        </button>
        <button
          onClick={() => { handleStepChange(0); setAnimatedCursor(0); }}
          className="px-3 py-2 rounded text-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#888' }}
        >
          ↺ 重置
        </button>
        <span className="text-gray-500 text-sm ml-auto">
          步骤 {currentStep + 1} / {animationSteps.length}
        </span>
      </div>

      {/* 当前步骤标题 */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--terminal-green)' }}>
          {step.title}
        </h2>
        <p className="text-gray-400">{step.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左侧：文本可视化 */}
        <div className="space-y-4">
          <TextVisualizer
            chars={chars}
            cursor={animatedCursor}
            highlightRange={step.visualData?.highlightRange}
            navigation={step.visualData?.navigation}
          />

          <CharacterTable
            chars={chars}
            cursor={animatedCursor}
          />
        </div>

        {/* 右侧：代码和图例 */}
        <div className="space-y-4">
          {step.codeSnippet && (
            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-xs text-[var(--text-secondary)] mb-2">
                源码实现
              </div>
              <JsonBlock code={step.codeSnippet} />
            </div>
          )}

          <ScriptLegend chars={chars} />

          <VimCommandReference />
        </div>
      </div>

      {/* 阶段指示器 */}
      <div className="mt-8">
        <div className="flex gap-1">
          {animationSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleStepChange(idx)}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-[var(--terminal-green)]'
                  : idx < currentStep
                  ? 'bg-[var(--terminal-green)]/50'
                  : 'bg-gray-700'
              }`}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>初始化</span>
          <span>脚本检测</span>
          <span>词导航</span>
        </div>
      </div>
    </div>
  );
}
