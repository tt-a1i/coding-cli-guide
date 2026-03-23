import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'react-hooks', label: 'React Hooks', description: 'Hook 库' },
 { id: 'key-bindings', label: '键盘绑定', description: '快捷键系统' },
 { id: 'ui-components', label: 'UI 组件库', description: '终端组件' },
 { id: 'ui-state-management', label: 'UI 状态管理', description: '状态流转' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📝</span>
 <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 多行文本编辑器核心，支持 Vim 模式、多语言脚本边界、视觉换行、Undo/Redo 和外部编辑器集成
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">1800+</div>
 <div className="text-xs text-dim">行核心代码</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Vim</div>
 <div className="text-xs text-dim">模式支持</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-amber-500">Unicode</div>
 <div className="text-xs text-dim">完整支持</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">useReducer</div>
 <div className="text-xs text-dim">状态管理</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">核心能力</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 多行编辑
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 词边界导航
 </span>
 <span className="px-3 py-1.5 bg-amber-500/20 text-amber-500 rounded-lg border border-amber-500/30">
 视觉换行
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 剪贴板
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码位置:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/ui/components/shared/text-buffer.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function TextBuffer() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const architectureChart = `flowchart TD
 subgraph Hook["useTextBuffer Hook"]
 INIT[初始化状态]
 REDUCER[textBufferReducer]
 STATE[TextBufferState]
 end

 subgraph State["状态结构"]
 LINES[lines: string[]]
 CURSOR[cursorRow/cursorCol]
 UNDO[undoStack/redoStack]
 CLIP[clipboard]
 VISUAL[visualLayout]
 end

 subgraph Actions["Action 类型"]
 INSERT[insert]
 DELETE[backspace/delete]
 MOVE[move_cursor]
 VIM[vim_action]
 SELECTION[set_selection]
 end

 subgraph Layout["视觉布局"]
 WRAP[行换行计算]
 MAP[逻辑↔视觉映射]
 SCROLL[滚动管理]
 end

 INIT --> STATE
 STATE --> REDUCER
 REDUCER --> STATE

 LINES --> VISUAL
 VISUAL --> WRAP
 WRAP --> MAP
 MAP --> SCROLL

 INSERT --> REDUCER
 DELETE --> REDUCER
 MOVE --> REDUCER
 VIM --> REDUCER

 style Hook stroke:#00d4ff
 style State stroke:#00ff88
 style Actions stroke:#f59e0b
 style Layout stroke:#a855f7`;

 const stateTypeCode = `// TextBuffer 状态结构
interface TextBufferState {
 lines: string[]; // 逻辑行数组
 cursorRow: number; // 光标所在行
 cursorCol: number; // 光标所在列（code point）
 preferredCol: number | null; // 上下移动时的首选列
 undoStack: UndoHistoryEntry[];
 redoStack: UndoHistoryEntry[];
 clipboard: string | null; // Vim yank 剪贴板
 selectionAnchor: [number, number] | null; // 选区锚点
 viewportWidth: number;
 viewportHeight: number;
 visualLayout: VisualLayout; // 视觉换行布局
}

interface VisualLayout {
 visualLines: string[]; // 换行后的视觉行
 logicalToVisualMap: Array<Array<[number, number]>>;
 visualToLogicalMap: Array<[number, number]>;
}

interface UndoHistoryEntry {
 lines: string[];
 cursorRow: number;
 cursorCol: number;
}`;

 const wordBoundaryCode = `// 词边界检测 - 支持多语言脚本
export const isWordCharStrict = (char: string): boolean =>
 /[\\w\\p{L}\\p{N}]/u.test(char); // Unicode 字母、数字、下划线

export const isCombiningMark = (char: string): boolean =>
 /\\p{M}/u.test(char); // 组合标记（如变音符号）

// 脚本类型检测
export const getCharScript = (char: string): string => {
 if (/[\\p{Script=Latin}]/u.test(char)) return 'latin';
 if (/[\\p{Script=Han}]/u.test(char)) return 'han'; // 中文
 if (/[\\p{Script=Arabic}]/u.test(char)) return 'arabic';
 if (/[\\p{Script=Hiragana}]/u.test(char)) return 'hiragana';
 if (/[\\p{Script=Katakana}]/u.test(char)) return 'katakana';
 if (/[\\p{Script=Cyrillic}]/u.test(char)) return 'cyrillic';
 return 'other';
};

// 不同脚本之间视为词边界
export const isDifferentScript = (char1: string, char2: string): boolean => {
 if (!isWordCharStrict(char1) || !isWordCharStrict(char2)) return false;
 return getCharScript(char1) !== getCharScript(char2);
};

// 查找下一个词开始位置
export const findNextWordStartInLine = (line: string, col: number): number | null => {
 const chars = toCodePoints(line);
 let i = col;

 // 跳过当前词
 if (isWordCharStrict(chars[i])) {
 while (i < chars.length && isWordCharWithCombining(chars[i])) {
 // 检测脚本边界
 if (i + 1 < chars.length && isDifferentScript(chars[i], chars[i + 1])) {
 i++;
 break;
 }
 i++;
 }
 }

 // 跳过空白
 while (i < chars.length && isWhitespace(chars[i])) i++;

 return i < chars.length ? i : null;
};`;

 const useTextBufferCode = `// useTextBuffer Hook - 主入口
export function useTextBuffer({
 initialText = '',
 initialCursorOffset = 0,
 viewport,
 stdin,
 setRawMode,
 onChange,
 isValidPath,
 shellModeActive = false,
}: UseTextBufferProps): TextBuffer {

 const initialState = useMemo((): TextBufferState => {
 const lines = initialText.split('\\n');
 const [initialCursorRow, initialCursorCol] =
 calculateInitialCursorPosition(lines, initialCursorOffset);
 const visualLayout = calculateLayout(lines, viewport.width);

 return {
 lines: lines.length === 0 ? [''] : lines,
 cursorRow: initialCursorRow,
 cursorCol: initialCursorCol,
 preferredCol: null,
 undoStack: [],
 redoStack: [],
 clipboard: null,
 selectionAnchor: null,
 viewportWidth: viewport.width,
 viewportHeight: viewport.height,
 visualLayout,
 };
 }, [initialText, initialCursorOffset, viewport.width, viewport.height]);

 const [state, dispatch] = useReducer(textBufferReducer, initialState);

 // 返回 TextBuffer 接口
 return {
 text,
 lines,
 cursorRow,
 cursorCol,
 insert,
 backspace,
 delete: deleteChar,
 moveCursor,
 // ... 更多方法
 };
}`;

 const actionsCode = `// TextBuffer Actions
type TextBufferAction =
 | { type: 'insert'; payload: string }
 | { type: 'backspace' }
 | { type: 'delete' }
 | { type: 'move_cursor'; payload: { direction: Direction; count?: number } }
 | { type: 'set_cursor'; payload: { row: number; col: number } }
 | { type: 'set_text'; payload: string }
 | { type: 'undo' }
 | { type: 'redo' }
 | { type: 'yank' } // Vim: 复制
 | { type: 'put' } // Vim: 粘贴
 | { type: 'vim_action'; payload: VimAction }
 | { type: 'set_selection'; payload: [number, number] | null }
 | { type: 'delete_selection' }
 | { type: 'set_viewport'; payload: { width: number; height: number } };

type Direction =
 | 'left' | 'right' | 'up' | 'down'
 | 'wordLeft' | 'wordRight'
 | 'home' | 'end';

// Reducer 处理
function textBufferReducer(state: TextBufferState, action: TextBufferAction) {
 const newState = textBufferReducerLogic(state, action);

 // 行内容或视口变化时重新计算视觉布局
 if (newState.lines !== state.lines ||
 newState.viewportWidth !== state.viewportWidth) {
 return {
 ...newState,
 visualLayout: calculateLayout(newState.lines, newState.viewportWidth),
 };
 }

 return newState;
}`;

 const visualLayoutCode = `// 视觉换行布局计算
function calculateLayout(logicalLines: string[], viewportWidth: number): VisualLayout {
 const visualLines: string[] = [];
 const logicalToVisualMap: Array<Array<[number, number]>> = [];
 const visualToLogicalMap: Array<[number, number]> = [];

 for (let logicalRow = 0; logicalRow < logicalLines.length; logicalRow++) {
 const line = logicalLines[logicalRow];
 const wrappedSegments: Array<[number, number]> = [];

 if (line.length === 0) {
 // 空行处理
 visualLines.push('');
 wrappedSegments.push([visualLines.length - 1, 0]);
 visualToLogicalMap.push([logicalRow, 0]);
 } else {
 // 按视口宽度换行
 let startCol = 0;
 while (startCol < cpLen(line)) {
 const segment = wrapLineSegment(line, startCol, viewportWidth);
 visualLines.push(segment.text);
 wrappedSegments.push([visualLines.length - 1, startCol]);
 visualToLogicalMap.push([logicalRow, startCol]);
 startCol = segment.endCol;
 }
 }

 logicalToVisualMap.push(wrappedSegments);
 }

 return { visualLines, logicalToVisualMap, visualToLogicalMap };
}

// 逻辑坐标 → 视觉坐标
function calculateVisualCursorFromLayout(
 layout: VisualLayout,
 logicalPos: [number, number]
): [number, number] {
 const [logicalRow, logicalCol] = logicalPos;
 const segments = layout.logicalToVisualMap[logicalRow] || [[0, 0]];

 // 找到包含 logicalCol 的视觉行
 for (let i = segments.length - 1; i >= 0; i--) {
 const [visualRow, startCol] = segments[i];
 if (logicalCol >= startCol) {
 return [visualRow, logicalCol - startCol];
 }
 }

 return [segments[0][0], 0];
}`;

 const externalEditorCode = `// 外部编辑器集成
const openExternalEditor = useCallback((): void => {
 if (!stdin || !setRawMode) return;

 // 暂停原始模式
 setRawMode(false);

 // 创建临时文件
 const tempFile = pathMod.join(os.tmpdir(), \`gemini-edit-\${Date.now()}.txt\`);
 fs.writeFileSync(tempFile, text, 'utf8');

 // 选择编辑器
 const editor = process.env.EDITOR || process.env.VISUAL || 'nano';

 // 同步执行编辑器
 const result = spawnSync(editor, [tempFile], {
 stdio: 'inherit',
 shell: true,
 });

 if (result.status === 0) {
 const newText = fs.readFileSync(tempFile, 'utf8');
 dispatch({ type: 'set_text', payload: newText });
 }

 // 清理并恢复
 fs.unlinkSync(tempFile);
 setRawMode(true);
}, [stdin, setRawMode, text]);`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">TextBuffer 文本缓冲区</h1>
 <p className="text-body text-lg">
 CLI 的多行文本编辑器核心，支持 Vim 模式、Unicode、视觉换行和外部编辑器集成
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="架构概览" icon="🏗️" defaultOpen={true}>
 <HighlightBox title="TextBuffer 架构" color="blue" className="mb-6">
 <MermaidDiagram chart={architectureChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">🎯 设计目标</div>
 <ul className="text-sm text-body space-y-1">
 <li>• 多行文本编辑（类似 IDE）</li>
 <li>• 完整 Vim 键位支持</li>
 <li>• Unicode/多语言正确处理</li>
 <li>• 终端视觉换行</li>
 <li>• Undo/Redo 历史</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">📦 核心模式</div>
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>useReducer</strong> 驱动状态更新</li>
 <li>• <strong>useMemo</strong> 缓存视觉布局</li>
 <li>• <strong>Action/Reducer</strong> 模式</li>
 <li>• 逻辑/视觉坐标分离</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="状态结构" icon="📊" defaultOpen={true}>
 <CodeBlock code={stateTypeCode} language="typescript" title="TextBufferState 类型定义" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">字段</th>
 <th className="text-left py-2 text-dim">类型</th>
 <th className="text-left py-2 text-dim">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2"><code>lines</code></td>
 <td>string[]</td>
 <td>逻辑行数组，不含换行符</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>cursorRow/Col</code></td>
 <td>number</td>
 <td>光标位置（code point 单位）</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>preferredCol</code></td>
 <td>number | null</td>
 <td>上下移动时保持的首选列</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>undoStack</code></td>
 <td>UndoHistoryEntry[]</td>
 <td>Undo 历史栈</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>clipboard</code></td>
 <td>string | null</td>
 <td>Vim yank 剪贴板</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>visualLayout</code></td>
 <td>VisualLayout</td>
 <td>视觉换行布局映射</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="词边界检测" icon="🔤" defaultOpen={true}>
 <CodeBlock code={wordBoundaryCode} language="typescript" title="多语言词边界算法" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="支持的脚本类型" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>Latin</strong> - 英文、西欧语言</li>
 <li>• <strong>Han</strong> - 中文汉字</li>
 <li>• <strong>Hiragana/Katakana</strong> - 日文</li>
 <li>• <strong>Arabic</strong> - 阿拉伯语</li>
 <li>• <strong>Cyrillic</strong> - 俄语等</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="边界检测规则" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>• 不同脚本之间视为词边界</li>
 <li>• 组合标记(变音符)属于前一个字符</li>
 <li>• 空白和标点为词分隔符</li>
 <li>• 支持 Vim w/b/e 移动</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="Action 系统" icon="⚡" defaultOpen={false}>
 <CodeBlock code={actionsCode} language="typescript" title="TextBuffer Actions" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">Action</th>
 <th className="text-left py-2 text-dim">用途</th>
 <th className="text-left py-2 text-dim">触发方式</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2"><code>insert</code></td>
 <td>插入文本</td>
 <td>普通输入、粘贴</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>move_cursor</code></td>
 <td>移动光标</td>
 <td>方向键、h/j/k/l、w/b/e</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>vim_action</code></td>
 <td>Vim 操作</td>
 <td>dd、yy、p、dw 等</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>undo/redo</code></td>
 <td>撤销/重做</td>
 <td>Ctrl+Z、u/Ctrl+R</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2"><code>yank/put</code></td>
 <td>Vim 剪贴板</td>
 <td>y、p</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="useTextBuffer Hook" icon="🪝" defaultOpen={false}>
 <CodeBlock code={useTextBufferCode} language="typescript" title="useTextBuffer 入口" />
 </Layer>

 <Layer title="视觉换行" icon="📐" defaultOpen={false}>
 <CodeBlock code={visualLayoutCode} language="typescript" title="视觉布局计算" />

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">逻辑 vs 视觉坐标</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>逻辑坐标</strong>：原始文本中的 (row, col)，col 以 code point 为单位</p>
 <p><strong>视觉坐标</strong>：终端显示中的 (visualRow, visualCol)，考虑换行</p>
 <p className="text-dim">
 例如：一行 200 字符在 80 列终端会显示为 3 行视觉行
 </p>
 </div>
 </div>
 </Layer>

 <Layer title="外部编辑器" icon="🖥️" defaultOpen={false}>
 <CodeBlock code={externalEditorCode} language="typescript" title="外部编辑器集成" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="支持的编辑器" color="green">
 <ul className="text-sm text-body space-y-1">
 <li>• <code>$EDITOR</code> 环境变量</li>
 <li>• <code>$VISUAL</code> 环境变量</li>
 <li>• 默认回退到 <code>nano</code></li>
 <li>• vim, nvim, emacs, code...</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="工作流程" color="blue">
 <ul className="text-sm text-body space-y-1">
 <li>1. 暂停 raw mode</li>
 <li>2. 写入临时文件</li>
 <li>3. 同步启动编辑器</li>
 <li>4. 读回修改内容</li>
 <li>5. 恢复 raw mode</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="使用示例" icon="💡" defaultOpen={false}>
 <CodeBlock
 code={`// 在 Composer 组件中使用
const buffer = useTextBuffer({
 initialText: '',
 viewport: { width: columns, height: rows },
 stdin: process.stdin,
 setRawMode: (mode) => process.stdin.setRawMode?.(mode),
 onChange: (text) => console.log('Text changed:', text),
 isValidPath: (path) => fs.existsSync(path),
 shellModeActive: false,
});

// 插入文本
buffer.insert('Hello, World!');

// Vim 风格移动
buffer.moveCursor('wordRight');
buffer.moveCursor('down');

// 删除操作
buffer.backspace();
buffer.delete();

// Undo/Redo
buffer.undo();
buffer.redo();

// 获取当前文本
console.log(buffer.text);
console.log('Cursor at:', buffer.cursorRow, buffer.cursorCol);`}
 language="typescript"
 title="使用示例"
 />
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
