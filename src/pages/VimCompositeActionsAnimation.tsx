import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Vim 复合操作动画
 * 基于 vim-buffer-actions.ts 的实现
 * 展示 Vim 动作的状态转换、词边界检测、范围替换
 */

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-6 bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
      >
        <span className="text-lg font-semibold">📖 什么是 Vim 复合操作？</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          {/* 核心概念 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🎯 核心概念</h3>
            <p className="text-gray-300">
              CLI 的输入框支持 <strong>Vim 风格的快捷键</strong>（如 <code className="bg-gray-700 px-1 rounded">w</code> 跳词、
              <code className="bg-gray-700 px-1 rounded">dw</code> 删词）。这个模块处理所有 Vim 动作的状态转换，
              使用<strong>不可变数据结构</strong>确保每次操作都可撤销。
            </p>
          </div>

          {/* 为什么需要 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">❓ 解决什么问题？</h3>
            <ul className="text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>高效编辑</strong>：熟悉 Vim 的用户可以快速编辑长命令</li>
              <li><strong>Unicode 支持</strong>：正确处理中文、emoji 等多字节字符</li>
              <li><strong>可撤销历史</strong>：每个操作自动入栈，支持无限撤销</li>
              <li><strong>词边界智能</strong>：识别代码标识符、标点、空白的边界</li>
            </ul>
          </div>

          {/* 触发场景 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">⚡ 何时触发？</h3>
            <div className="bg-gray-900 p-3 rounded font-mono text-xs">
              <div className="text-gray-400"># 用户在 CLI 输入框中</div>
              <div className="text-green-400">$ git commit -m "fix bug"</div>
              <div className="text-gray-400"># 按 Esc 进入 Normal 模式</div>
              <div className="text-yellow-400">按 w → 跳到下一个词</div>
              <div className="text-yellow-400">按 dw → 删除当前词</div>
              <div className="text-yellow-400">按 u → 撤销操作</div>
            </div>
          </div>

          {/* 关键设计 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🔧 关键设计</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">不可变状态</div>
                <div className="text-gray-400">action → newState（旧状态保留）</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">纯函数处理</div>
                <div className="text-gray-400">handleVimAction(state, action)</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">Unicode 词检测</div>
                <div className="text-gray-400">/[\w\p{'{L}'}\p{'{N}'}]/u</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">30+ 动作类型</div>
                <div className="text-gray-400">移动、删除、修改、跳转...</div>
              </div>
            </div>
          </div>

          {/* 源码位置 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">📁 源码位置</h3>
            <code className="text-xs bg-gray-900 p-2 rounded block">
              packages/cli/src/ui/components/shared/vim-buffer-actions.ts
            </code>
          </div>

          {/* 相关机制 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🔗 相关机制</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">文本缓冲区</span>
              <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">输入组件</span>
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">Unicode 工具</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TextBufferState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  undoStack: TextBufferState[];
}

interface VimAction {
  type: string;
  count: number;
  description: string;
}

// 演示用的 Vim 动作
const DEMO_ACTIONS: VimAction[] = [
  { type: 'vim_move_word_forward', count: 1, description: 'w - 移动到下一个词' },
  { type: 'vim_move_word_forward', count: 2, description: '2w - 移动两个词' },
  { type: 'vim_delete_word_forward', count: 1, description: 'dw - 删除一个词' },
  { type: 'vim_move_left', count: 3, description: '3h - 左移3个字符' },
  { type: 'vim_move_line_start', count: 1, description: '0 - 移动到行首' },
  { type: 'vim_move_line_end', count: 1, description: '$ - 移动到行尾' },
  { type: 'vim_delete_to_line_end', count: 1, description: 'D - 删除到行尾' },
];

const INITIAL_TEXT = `function hello(name) {
  const greeting = "Hello, " + name;
  console.log(greeting);
  return greeting;
}`;

// Unicode 词字符检测（简化版）
const isWordChar = (char: string): boolean => {
  return /[\w\p{L}\p{N}]/u.test(char);
};

const isCombiningMark = (char: string): boolean => {
  return /\p{M}/u.test(char);
};

export default function VimCompositeActionsAnimation() {
  const [state, setState] = useState<TextBufferState>(() => ({
    lines: INITIAL_TEXT.split('\n'),
    cursorRow: 0,
    cursorCol: 0,
    undoStack: [],
  }));
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightRange, setHighlightRange] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [wordBoundaries, setWordBoundaries] = useState<number[]>([]);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [...prev.slice(-12), msg]);
  };

  const sleep = (ms: number) => new Promise(resolve => {
    timeoutRef.current = setTimeout(resolve, ms);
  });

  // 查找当前行的词边界
  const findWordBoundaries = useCallback((line: string): number[] => {
    const boundaries: number[] = [0];
    let inWord = isWordChar(line[0] || '');

    for (let i = 1; i < line.length; i++) {
      const charIsWord = isWordChar(line[i]);
      if (charIsWord !== inWord && !isCombiningMark(line[i])) {
        boundaries.push(i);
        inWord = charIsWord;
      }
    }

    return boundaries;
  }, []);

  // 查找下一个词的位置
  const findNextWord = useCallback((lines: string[], row: number, col: number): { row: number; col: number } | null => {
    let currentRow = row;
    let currentCol = col;

    // 跳过当前词
    while (currentRow < lines.length) {
      const line = lines[currentRow];

      // 跳过当前词字符
      while (currentCol < line.length && isWordChar(line[currentCol])) {
        currentCol++;
      }

      // 跳过空白和标点
      while (currentCol < line.length && !isWordChar(line[currentCol])) {
        currentCol++;
      }

      if (currentCol < line.length) {
        return { row: currentRow, col: currentCol };
      }

      // 移到下一行
      currentRow++;
      currentCol = 0;
    }

    return null;
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState({
      lines: INITIAL_TEXT.split('\n'),
      cursorRow: 0,
      cursorCol: 0,
      undoStack: [],
    });
    setCurrentActionIndex(-1);
    setIsPlaying(false);
    setHighlightRange(null);
    setLog([]);
    setWordBoundaries([]);
  }, []);

  // 执行 Vim 动作
  const executeAction = useCallback(async (action: VimAction) => {
    addLog(`执行: ${action.description}`);

    switch (action.type) {
      case 'vim_move_word_forward': {
        let newRow = state.cursorRow;
        let newCol = state.cursorCol;

        for (let i = 0; i < action.count; i++) {
          const next = findNextWord(state.lines, newRow, newCol);
          if (next) {
            // 显示中间步骤
            setHighlightRange({
              startRow: newRow,
              startCol: newCol,
              endRow: next.row,
              endCol: next.col,
            });
            await sleep(300);

            newRow = next.row;
            newCol = next.col;
            addLog(`  → 移动到 (${newRow}, ${newCol})`);
          }
        }

        setState(prev => ({
          ...prev,
          cursorRow: newRow,
          cursorCol: newCol,
          undoStack: [...prev.undoStack, prev],
        }));
        break;
      }

      case 'vim_delete_word_forward': {
        const startCol = state.cursorCol;
        const next = findNextWord(state.lines, state.cursorRow, state.cursorCol);
        const endCol = next?.row === state.cursorRow ? next.col : state.lines[state.cursorRow].length;

        setHighlightRange({
          startRow: state.cursorRow,
          startCol: startCol,
          endRow: state.cursorRow,
          endCol: endCol,
        });
        addLog(`  删除范围: [${startCol}, ${endCol})`);
        await sleep(500);

        const line = state.lines[state.cursorRow];
        const newLine = line.slice(0, startCol) + line.slice(endCol);
        const newLines = [...state.lines];
        newLines[state.cursorRow] = newLine;

        setState(prev => ({
          ...prev,
          lines: newLines,
          undoStack: [...prev.undoStack, prev],
        }));
        addLog(`  删除完成`);
        break;
      }

      case 'vim_move_left': {
        const newCol = Math.max(0, state.cursorCol - action.count);
        addLog(`  左移 ${action.count} → 列 ${newCol}`);

        setState(prev => ({
          ...prev,
          cursorCol: newCol,
          undoStack: [...prev.undoStack, prev],
        }));
        break;
      }

      case 'vim_move_line_start': {
        addLog(`  移动到行首`);
        setState(prev => ({
          ...prev,
          cursorCol: 0,
          undoStack: [...prev.undoStack, prev],
        }));
        break;
      }

      case 'vim_move_line_end': {
        const lineEnd = state.lines[state.cursorRow].length - 1;
        addLog(`  移动到行尾: 列 ${lineEnd}`);
        setState(prev => ({
          ...prev,
          cursorCol: Math.max(0, lineEnd),
          undoStack: [...prev.undoStack, prev],
        }));
        break;
      }

      case 'vim_delete_to_line_end': {
        const startCol = state.cursorCol;
        const endCol = state.lines[state.cursorRow].length;

        setHighlightRange({
          startRow: state.cursorRow,
          startCol: startCol,
          endRow: state.cursorRow,
          endCol: endCol,
        });
        addLog(`  删除范围: [${startCol}, ${endCol})`);
        await sleep(500);

        const line = state.lines[state.cursorRow];
        const newLine = line.slice(0, startCol);
        const newLines = [...state.lines];
        newLines[state.cursorRow] = newLine;

        setState(prev => ({
          ...prev,
          lines: newLines,
          undoStack: [...prev.undoStack, prev],
        }));
        addLog(`  删除完成`);
        break;
      }
    }

    await sleep(300);
    setHighlightRange(null);
  }, [state, findNextWord]);

  const runDemo = useCallback(async () => {
    if (isPlaying) return;
    reset();
    await sleep(500);
    setIsPlaying(true);

    for (let i = 0; i < DEMO_ACTIONS.length; i++) {
      setCurrentActionIndex(i);
      await executeAction(DEMO_ACTIONS[i]);
      await sleep(800);
    }

    setIsPlaying(false);
  }, [isPlaying, reset, executeAction]);

  const undo = useCallback(() => {
    if (state.undoStack.length === 0) return;

    const prevState = state.undoStack[state.undoStack.length - 1];
    setState({
      ...prevState,
      undoStack: state.undoStack.slice(0, -1),
    });
    addLog('撤销操作');
  }, [state]);

  // 更新词边界显示
  useEffect(() => {
    const currentLine = state.lines[state.cursorRow] || '';
    setWordBoundaries(findWordBoundaries(currentLine));
  }, [state.cursorRow, state.lines, findWordBoundaries]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Vim 复合操作动画</h1>
      <p className="text-gray-400 mb-4">
        基于 vim-buffer-actions.ts | 状态不可变、词边界检测、范围替换
      </p>

      {/* 介绍部分 */}
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      {/* 控制面板 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runDemo}
          disabled={isPlaying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          运行演示
        </button>
        <button
          onClick={undo}
          disabled={state.undoStack.length === 0}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded"
        >
          撤销 (u)
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          重置
        </button>
      </div>

      {/* 动作列表 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Vim 动作序列</h2>
        <div className="flex gap-2 flex-wrap">
          {DEMO_ACTIONS.map((action, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded text-sm ${
                i === currentActionIndex
                  ? 'bg-blue-600 ring-2 ring-blue-400'
                  : i < currentActionIndex
                  ? 'bg-green-700'
                  : 'bg-gray-700'
              }`}
            >
              {action.description}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：编辑器 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">文本缓冲区</h2>
          <div className="bg-black rounded p-4 font-mono text-sm overflow-x-auto">
            {state.lines.map((line, rowIdx) => (
              <div key={rowIdx} className="flex">
                {/* 行号 */}
                <span className="text-gray-500 w-8 select-none">{rowIdx + 1}</span>

                {/* 行内容 */}
                <div className="flex-1">
                  {line.split('').map((char, colIdx) => {
                    const isCursor = rowIdx === state.cursorRow && colIdx === state.cursorCol;
                    const isHighlighted = highlightRange &&
                      rowIdx >= highlightRange.startRow &&
                      rowIdx <= highlightRange.endRow &&
                      colIdx >= highlightRange.startCol &&
                      colIdx < highlightRange.endCol;
                    const isWordBoundary = rowIdx === state.cursorRow && wordBoundaries.includes(colIdx);

                    return (
                      <span
                        key={colIdx}
                        className={`${
                          isCursor
                            ? 'bg-white text-black'
                            : isHighlighted
                            ? 'bg-red-500/50'
                            : ''
                        } ${isWordBoundary ? 'border-l border-yellow-500' : ''}`}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {rowIdx === state.cursorRow && state.cursorCol >= line.length && (
                    <span className="bg-white text-black"> </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 光标位置 */}
          <div className="mt-4 p-3 bg-gray-800 rounded flex gap-6">
            <div>
              <span className="text-gray-400">行: </span>
              <span className="text-yellow-400">{state.cursorRow}</span>
            </div>
            <div>
              <span className="text-gray-400">列: </span>
              <span className="text-yellow-400">{state.cursorCol}</span>
            </div>
            <div>
              <span className="text-gray-400">撤销栈: </span>
              <span className="text-purple-400">{state.undoStack.length}</span>
            </div>
          </div>

          {/* 词边界可视化 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">词边界检测</h2>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-sm text-gray-400 mb-2">当前行词边界位置:</div>
            <div className="flex gap-2 flex-wrap">
              {wordBoundaries.map((pos, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs ${
                    pos === state.cursorCol ? 'bg-yellow-600' : 'bg-gray-700'
                  }`}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：日志和说明 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">操作日志</h2>
          <div className="bg-black rounded p-4 h-48 overflow-y-auto font-mono text-xs">
            {log.length === 0 ? (
              <span className="text-gray-500">等待操作...</span>
            ) : (
              log.map((entry, i) => (
                <div key={i} className="text-gray-300">{entry}</div>
              ))
            )}
          </div>

          {/* 状态不可变说明 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">核心设计</h2>
          <div className="bg-gray-800 rounded p-4 space-y-3 text-sm">
            <div>
              <div className="text-cyan-400 font-semibold">不可变状态</div>
              <div className="text-gray-400">
                每次操作返回新的 state 对象，旧状态保存到 undoStack
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">纯函数处理</div>
              <div className="text-gray-400">
                handleVimAction(state, action) → newState
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">Unicode 支持</div>
              <div className="text-gray-400">
                <code className="text-green-400">/[\w\p{'{L}'}\p{'{N}'}]/u</code> 匹配词字符
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">组合标记</div>
              <div className="text-gray-400">
                <code className="text-green-400">/\p{'{M}'}/u</code> 处理 diacritics
              </div>
            </div>
          </div>

          {/* 动作类型 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">动作类型示例</h2>
          <div className="bg-gray-800 rounded p-4 font-mono text-xs space-y-1">
            <div><span className="text-purple-400">vim_move_word_forward</span> - w/W</div>
            <div><span className="text-purple-400">vim_move_word_backward</span> - b/B</div>
            <div><span className="text-purple-400">vim_delete_word_forward</span> - dw</div>
            <div><span className="text-purple-400">vim_delete_to_line_end</span> - D</div>
            <div><span className="text-purple-400">vim_move_line_start</span> - 0</div>
            <div><span className="text-purple-400">vim_move_line_end</span> - $</div>
            <div className="text-gray-500">// 共 30+ 动作类型</div>
          </div>
        </div>
      </div>
    </div>
  );
}
