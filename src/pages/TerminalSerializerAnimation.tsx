// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 序列化阶段
type SerializerPhase =
  | 'init'
  | 'buffer_iterate'
  | 'cell_extract'
  | 'attribute_decode'
  | 'color_extract'
  | 'cell_compare'
  | 'token_aggregate'
  | 'line_build'
  | 'output_structure'
  | 'complete';

// 序列化步骤
interface SerializerStep {
  phase: SerializerPhase;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// 序列化流程
const serializerSequence: SerializerStep[] = [
  {
    phase: 'init',
    title: '初始化 Terminal Serializer',
    description: '准备从终端缓冲区提取 ANSI 信息',
    codeSnippet: `// terminalSerializer.ts:15-40
interface Cell {
  char: string;
  fg: number;
  bg: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  inverse: boolean;
  dim: boolean;
}

interface AnsiToken {
  text: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

type AnsiLine = AnsiToken[];
type AnsiOutput = AnsiLine[];

function serializeTerminalToObject(terminal: Terminal): AnsiOutput {
  // 遍历终端缓冲区，提取格式化信息
}`,
    visualData: {
      terminalSize: { cols: 80, rows: 24 },
      bufferType: 'active',
    },
  },
  {
    phase: 'buffer_iterate',
    title: '遍历终端缓冲区',
    description: '按行列顺序遍历每个单元格 (x, y)',
    codeSnippet: `// terminalSerializer.ts:50-75
function serializeTerminalToObject(terminal: Terminal): AnsiOutput {
  const buffer = terminal.buffer.active;
  const output: AnsiOutput = [];

  // 遍历每一行
  for (let y = 0; y < buffer.length; y++) {
    const line = buffer.getLine(y);
    if (!line) continue;

    const tokens: AnsiLine = [];

    // 遍历每一列
    for (let x = 0; x < line.length; x++) {
      const cell = line.getCell(x);
      if (!cell) continue;

      // 处理单元格...
    }

    output.push(tokens);
  }

  return output;
}`,
    visualData: {
      grid: [
        ['H', 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd'],
        ['$', ' ', 'n', 'p', 'm', ' ', 'r', 'u', 'n', ' ', 'b'],
        ['>', ' ', 'O', 'u', 't', 'p', 'u', 't', ' ', '.', '.'],
      ],
      currentPos: { x: 0, y: 0 },
    },
    highlight: '逐单元格遍历',
  },
  {
    phase: 'cell_extract',
    title: '提取单元格内容',
    description: '获取字符和 ANSI 属性',
    codeSnippet: `// terminalSerializer.ts:80-100
function extractCell(cell: IBufferCell): Cell {
  return {
    // 获取字符内容
    char: cell.getChars() || ' ',

    // 获取属性标志
    bold: cell.isBold() === 1,
    italic: cell.isItalic() === 1,
    underline: cell.isUnderline() === 1,
    inverse: cell.isInverse() === 1,
    dim: cell.isDim() === 1,

    // 获取颜色
    fg: cell.getFgColor(),
    bg: cell.getBgColor(),
    fgMode: cell.getFgColorMode(),
    bgMode: cell.getBgColorMode(),
  };
}

// 示例单元格
cell = {
  char: 'H',
  bold: true,
  fg: 2,  // 绿色
}`,
    visualData: {
      cell: {
        char: 'H',
        bold: true,
        italic: false,
        underline: false,
        fg: 2,
        bg: 0,
      },
    },
    highlight: '提取 char + 属性',
  },
  {
    phase: 'attribute_decode',
    title: '属性位运算解码',
    description: '使用位标志高效编码多个属性',
    codeSnippet: `// terminalSerializer.ts:110-140
// ANSI 属性使用位标志编码
const Attribute = {
  inverse:   0b00001,  // 1
  bold:      0b00010,  // 2
  italic:    0b00100,  // 4
  underline: 0b01000,  // 8
  dim:       0b10000,  // 16
};

function encodeAttributes(cell: Cell): number {
  let flags = 0;
  if (cell.inverse)   flags |= Attribute.inverse;
  if (cell.bold)      flags |= Attribute.bold;
  if (cell.italic)    flags |= Attribute.italic;
  if (cell.underline) flags |= Attribute.underline;
  if (cell.dim)       flags |= Attribute.dim;
  return flags;
}

function decodeAttributes(flags: number): AttributeSet {
  return {
    inverse:   (flags & Attribute.inverse) !== 0,
    bold:      (flags & Attribute.bold) !== 0,
    italic:    (flags & Attribute.italic) !== 0,
    underline: (flags & Attribute.underline) !== 0,
    dim:       (flags & Attribute.dim) !== 0,
  };
}`,
    visualData: {
      encoding: [
        { attr: 'inverse', bit: 0, mask: '0b00001', value: false },
        { attr: 'bold', bit: 1, mask: '0b00010', value: true },
        { attr: 'italic', bit: 2, mask: '0b00100', value: false },
        { attr: 'underline', bit: 3, mask: '0b01000', value: true },
        { attr: 'dim', bit: 4, mask: '0b10000', value: false },
      ],
      result: '0b01010', // bold + underline = 10
    },
    highlight: '位标志: 0b01010',
  },
  {
    phase: 'color_extract',
    title: '颜色模式提取',
    description: '处理三种颜色模式：默认、调色板、RGB',
    codeSnippet: `// terminalSerializer.ts:150-185
enum ColorMode {
  DEFAULT = 0,   // 使用终端默认颜色
  PALETTE = 1,   // 256 色调色板索引
  RGB = 2,       // 24 位真彩色
}

function extractColor(
  colorValue: number,
  colorMode: number
): string | undefined {
  switch (colorMode) {
    case ColorMode.DEFAULT:
      return undefined;  // 使用默认

    case ColorMode.PALETTE:
      // 16 色基本 + 240 扩展
      return paletteToHex(colorValue);

    case ColorMode.RGB:
      // 24 位颜色编码在 colorValue 中
      const r = (colorValue >> 16) & 0xFF;
      const g = (colorValue >> 8) & 0xFF;
      const b = colorValue & 0xFF;
      return \`#\${r.toString(16).padStart(2,'0')}\${g.toString(16).padStart(2,'0')}\${b.toString(16).padStart(2,'0')}\`;
  }
}

// 调色板映射
const palette16 = [
  '#000000', '#cd0000', '#00cd00', '#cdcd00',
  '#0000ee', '#cd00cd', '#00cdcd', '#e5e5e5',
  // ... 共 256 色
];`,
    visualData: {
      modes: [
        { mode: 'DEFAULT', value: 0, result: '终端默认' },
        { mode: 'PALETTE', value: 2, result: '#00cd00 (绿)' },
        { mode: 'RGB', value: 0x1E90FF, result: '#1e90ff' },
      ],
    },
    highlight: '三种颜色模式',
  },
  {
    phase: 'cell_compare',
    title: '单元格比较',
    description: '检测相邻单元格属性是否相同',
    codeSnippet: `// terminalSerializer.ts:190-215
function cellsEqual(a: Cell, b: Cell): boolean {
  // 比较所有 6 个属性标志
  if (a.bold !== b.bold) return false;
  if (a.italic !== b.italic) return false;
  if (a.underline !== b.underline) return false;
  if (a.inverse !== b.inverse) return false;
  if (a.dim !== b.dim) return false;

  // 比较颜色
  if (a.fg !== b.fg) return false;
  if (a.bg !== b.bg) return false;
  if (a.fgMode !== b.fgMode) return false;
  if (a.bgMode !== b.bgMode) return false;

  return true;
}

// 用途：判断是否可以合并为同一个 token
// cell[0] = { char: 'H', bold: true, fg: 2 }
// cell[1] = { char: 'e', bold: true, fg: 2 }
// → 属性相同，可合并为 "He"`,
    visualData: {
      cells: [
        { char: 'H', bold: true, fg: 2 },
        { char: 'e', bold: true, fg: 2 },
        { char: 'l', bold: true, fg: 2 },
        { char: 'l', bold: false, fg: 0 },
        { char: 'o', bold: false, fg: 0 },
      ],
      groups: [
        { chars: 'Hel', attrs: 'bold,green' },
        { chars: 'lo', attrs: 'normal' },
      ],
    },
    highlight: '相邻相同属性合并',
  },
  {
    phase: 'token_aggregate',
    title: 'Token 聚合',
    description: '将连续相同属性的字符合并为单个 Token',
    codeSnippet: `// terminalSerializer.ts:220-260
function aggregateTokens(line: IBufferLine): AnsiToken[] {
  const tokens: AnsiToken[] = [];
  let currentText = '';
  let lastCell: Cell | null = null;

  for (let x = 0; x < line.length; x++) {
    const cell = extractCell(line.getCell(x));

    if (lastCell && cellsEqual(cell, lastCell)) {
      // 相同属性，累积文本
      currentText += cell.char;
    } else {
      // 属性改变，输出当前 token
      if (currentText && lastCell) {
        tokens.push(buildToken(currentText, lastCell));
      }
      // 开始新 token
      currentText = cell.char;
      lastCell = cell;
    }
  }

  // 输出最后一个 token
  if (currentText && lastCell) {
    tokens.push(buildToken(currentText, lastCell));
  }

  return tokens;
}`,
    visualData: {
      input: ['H', 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd'],
      output: [
        { text: 'Hello', fg: '#00cd00', bold: true },
        { text: ' ', fg: undefined, bold: false },
        { text: 'World', fg: '#cd0000', bold: false },
      ],
    },
    highlight: '11 单元格 → 3 Token',
  },
  {
    phase: 'line_build',
    title: '构建行结构',
    description: '将 Token 数组组装为行',
    codeSnippet: `// terminalSerializer.ts:270-290
function buildToken(text: string, cell: Cell): AnsiToken {
  const token: AnsiToken = { text };

  // 只添加非默认属性
  if (cell.bold) token.bold = true;
  if (cell.italic) token.italic = true;
  if (cell.underline) token.underline = true;

  // 只添加非默认颜色
  const fg = extractColor(cell.fg, cell.fgMode);
  const bg = extractColor(cell.bg, cell.bgMode);
  if (fg) token.fg = fg;
  if (bg) token.bg = bg;

  return token;
}

// 输出行
line = [
  { text: "Hello", fg: "#00cd00", bold: true },
  { text: " " },
  { text: "World", fg: "#cd0000" }
]`,
    visualData: {
      line: [
        { text: 'Hello', fg: '#00cd00', bold: true },
        { text: ' ' },
        { text: 'World', fg: '#cd0000' },
      ],
    },
    highlight: '构建 AnsiLine',
  },
  {
    phase: 'output_structure',
    title: '最终输出结构',
    description: '组装完整的 AnsiOutput 多维数组',
    codeSnippet: `// 最终输出结构
type AnsiOutput = AnsiLine[];  // 行数组
type AnsiLine = AnsiToken[];   // Token 数组

const output: AnsiOutput = [
  // 第一行
  [
    { text: "Hello", fg: "#00cd00", bold: true },
    { text: " " },
    { text: "World", fg: "#cd0000" }
  ],
  // 第二行
  [
    { text: "$ npm run build", fg: "#808080" }
  ],
  // 第三行
  [
    { text: "> ", fg: "#00cd00" },
    { text: "Output...", italic: true }
  ]
];

// 优势：
// 1. 紧凑表示（合并相同属性）
// 2. 可序列化为 JSON
// 3. 易于渲染和传输`,
    visualData: {
      output: [
        [
          { text: 'Hello', fg: '#00cd00', bold: true },
          { text: ' ' },
          { text: 'World', fg: '#cd0000' },
        ],
        [{ text: '$ npm run build', fg: '#808080' }],
        [
          { text: '> ', fg: '#00cd00' },
          { text: 'Output...', italic: true },
        ],
      ],
    },
    highlight: 'AnsiOutput 完成',
  },
  {
    phase: 'complete',
    title: '序列化完成',
    description: '终端状态已转换为结构化数据',
    codeSnippet: `// 序列化优势总结

1. 内存效率
   - 原始: 80×24 = 1920 个 Cell 对象
   - 优化: ~100 个 Token（取决于样式变化）
   - 压缩率: 通常 90%+

2. 传输效率
   - JSON 序列化后可网络传输
   - 支持增量更新（diff）

3. 渲染兼容
   - 可直接映射到 HTML/React 组件
   - 支持 CSS 样式

4. 信息保留
   - 完整保留 ANSI 属性
   - 支持 256 色 + 真彩色
   - 光标位置追踪

// 使用场景
// - 终端截图
// - 会话回放
// - 远程终端同步
// - AI 终端输出分析`,
    visualData: {
      stats: {
        originalCells: 1920,
        outputTokens: 85,
        compressionRate: '95.6%',
      },
    },
    highlight: '压缩率 95.6%',
  },
];

// 终端网格可视化
function TerminalGridVisualizer({
  grid,
  currentPos,
}: {
  grid?: string[][];
  currentPos?: { x: number; y: number };
}) {
  if (!grid) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">Terminal Buffer</div>
      <div className="font-mono text-sm">
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((char, x) => {
              const isCurrent = currentPos?.x === x && currentPos?.y === y;
              return (
                <span
                  key={x}
                  className={`
                    w-4 h-6 flex items-center justify-center
                    ${isCurrent ? 'bg-[var(--terminal-green)] text-black' : 'text-gray-300'}
                  `}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// 位标志可视化
function BitFlagsVisualizer({
  encoding,
  result,
}: {
  encoding?: Array<{ attr: string; bit: number; mask: string; value: boolean }>;
  result?: string;
}) {
  if (!encoding) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">属性位编码</div>
      <div className="space-y-2">
        {encoding.map((e) => (
          <div
            key={e.attr}
            className={`flex items-center gap-3 p-2 rounded ${
              e.value ? 'bg-green-500/20' : 'bg-black/20'
            }`}
          >
            <span className="w-20 text-sm text-gray-400">{e.attr}</span>
            <span className="font-mono text-xs text-gray-500">{e.mask}</span>
            <div className="flex-1" />
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                e.value ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {e.value ? '1' : '0'}
            </span>
          </div>
        ))}
      </div>
      {result && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-center">
          <span className="text-gray-500">结果: </span>
          <span className="font-mono text-[var(--terminal-green)] text-lg">{result}</span>
        </div>
      )}
    </div>
  );
}

// 颜色模式可视化
function ColorModeVisualizer({
  modes,
}: {
  modes?: Array<{ mode: string; value: number; result: string }>;
}) {
  if (!modes) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">颜色模式</div>
      <div className="space-y-2">
        {modes.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded bg-black/20"
          >
            <span className="w-20 text-sm text-gray-400">{m.mode}</span>
            <span className="font-mono text-xs text-gray-500">
              0x{m.value.toString(16).toUpperCase().padStart(6, '0')}
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              {m.result.startsWith('#') && (
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: m.result }}
                />
              )}
              <span className="text-sm text-white">{m.result}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 单元格分组可视化
function CellGroupVisualizer({
  cells,
  groups,
}: {
  cells?: Array<{ char: string; bold: boolean; fg: number }>;
  groups?: Array<{ chars: string; attrs: string }>;
}) {
  if (!cells) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">单元格分组</div>

      {/* 原始单元格 */}
      <div className="flex gap-1 mb-4">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`
              w-8 h-8 flex items-center justify-center rounded font-mono
              ${cell.bold ? 'font-bold' : ''}
            `}
            style={{
              backgroundColor: cell.bold ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.3)',
              color: cell.bold ? '#10b981' : '#9ca3af',
            }}
          >
            {cell.char}
          </div>
        ))}
      </div>

      {/* 分组结果 */}
      {groups && (
        <div className="flex gap-2">
          {groups.map((group, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded"
              style={{
                backgroundColor:
                  group.attrs.includes('bold') ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.3)',
              }}
            >
              <div className="font-mono text-white">{group.chars}</div>
              <div className="text-xs text-gray-500">{group.attrs}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Token 聚合可视化
function TokenAggregateVisualizer({
  input,
  output,
}: {
  input?: string[];
  output?: Array<{ text: string; fg?: string; bold?: boolean; italic?: boolean }>;
}) {
  if (!output) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">Token 聚合</div>

      {/* 输入 */}
      {input && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 mb-1">输入: {input.length} 单元格</div>
          <div className="flex gap-0.5">
            {input.map((char, i) => (
              <span
                key={i}
                className="w-5 h-6 flex items-center justify-center bg-black/30 text-gray-400 text-xs font-mono"
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 输出 */}
      <div>
        <div className="text-xs text-gray-600 mb-1">输出: {output.length} Token</div>
        <div className="flex gap-2">
          {output.map((token, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded ${token.italic ? 'italic' : ''} ${token.bold ? 'font-bold' : ''}`}
              style={{
                backgroundColor: token.fg ? `${token.fg}20` : 'rgba(0,0,0,0.3)',
                color: token.fg || '#9ca3af',
              }}
            >
              {token.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 输出结构可视化
function OutputStructureVisualizer({
  output,
}: {
  output?: Array<Array<{ text: string; fg?: string; bold?: boolean; italic?: boolean }>>;
}) {
  if (!output) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">AnsiOutput 结构</div>
      <div className="space-y-2">
        {output.map((line, y) => (
          <div key={y} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">L{y}</span>
            <div className="flex gap-1 flex-1">
              {line.map((token, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-sm ${token.italic ? 'italic' : ''} ${token.bold ? 'font-bold' : ''}`}
                  style={{
                    backgroundColor: token.fg ? `${token.fg}15` : 'rgba(0,0,0,0.3)',
                    color: token.fg || '#9ca3af',
                  }}
                >
                  {token.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 统计可视化
function StatsVisualizer({
  stats,
}: {
  stats?: { originalCells: number; outputTokens: number; compressionRate: string };
}) {
  if (!stats) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/10">
      <div className="text-sm font-bold text-green-400 mb-3">压缩统计</div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400 line-through">
            {stats.originalCells}
          </div>
          <div className="text-xs text-gray-500">原始单元格</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.outputTokens}</div>
          <div className="text-xs text-gray-500">输出 Token</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--terminal-green)]">
            {stats.compressionRate}
          </div>
          <div className="text-xs text-gray-500">压缩率</div>
        </div>
      </div>
    </div>
  );
}

export function TerminalSerializerAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = serializerSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < serializerSequence.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(serializerSequence.length - 1, prev + 1));
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
          终端序列化器
        </h1>
        <p className="text-gray-400">
          TerminalSerializer - 从终端缓冲区提取 ANSI 信息
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/utils/terminalSerializer.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {serializerSequence.map((s, i) => (
            <button
              key={s.phase}
              onClick={() => setCurrentStep(i)}
              className={`
                flex-1 h-2 rounded-full transition-all cursor-pointer
                ${
                  i === currentStep
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
          <span>
            步骤 {currentStep + 1} / {serializerSequence.length}
          </span>
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
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.8))',
            }}
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
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]">
                {step.highlight}
              </div>
            )}
          </div>

          {/* 终端网格 */}
          {step.visualData?.grid !== undefined && (
            <TerminalGridVisualizer
              grid={step.visualData.grid as string[][]}
              currentPos={step.visualData.currentPos as { x: number; y: number }}
            />
          )}

          {/* 位标志 */}
          {Boolean(step.visualData && step.visualData.encoding !== undefined) && (
            <BitFlagsVisualizer
              encoding={
                step.visualData!.encoding as Array<{
                  attr: string;
                  bit: number;
                  mask: string;
                  value: boolean;
                }>
              }
              result={step.visualData!.result as string}
            />
          )}

          {/* 颜色模式 */}
          {Boolean(step.visualData && step.visualData.modes !== undefined) && (
            <ColorModeVisualizer
              modes={
                step.visualData!.modes as Array<{
                  mode: string;
                  value: number;
                  result: string;
                }>
              }
            />
          )}

          {/* 单元格分组 */}
          {step.visualData?.cells && (
            <CellGroupVisualizer
              cells={
                step.visualData.cells as Array<{
                  char: string;
                  bold: boolean;
                  fg: number;
                }>
              }
              groups={step.visualData.groups as Array<{ chars: string; attrs: string }>}
            />
          )}

          {/* Token 聚合 */}
          {step.visualData?.input && step.visualData?.output && (
            <TokenAggregateVisualizer
              input={step.visualData.input as string[]}
              output={
                step.visualData.output as Array<{
                  text: string;
                  fg?: string;
                  bold?: boolean;
                  italic?: boolean;
                }>
              }
            />
          )}

          {/* 输出结构 */}
          {step.visualData?.output && !step.visualData?.input && Array.isArray((step.visualData.output as unknown[])[0]) && (
            <OutputStructureVisualizer
              output={
                step.visualData.output as Array<
                  Array<{ text: string; fg?: string; bold?: boolean; italic?: boolean }>
                >
              }
            />
          )}

          {/* 统计 */}
          {step.visualData?.stats && (
            <StatsVisualizer
              stats={
                step.visualData.stats as {
                  originalCells: number;
                  outputTokens: number;
                  compressionRate: string;
                }
              }
            />
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
                terminalSerializer.ts
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
            ${
              isPlaying
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-[var(--terminal-green)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === serializerSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>
    </div>
  );
}
