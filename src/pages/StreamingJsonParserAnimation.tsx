import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 流式 JSON 解析器动画
 * 基于 streamingToolCallParser.ts 的实现
 * 展示字符级深度跟踪、字符串状态、碰撞检测和自动修复
 */

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-6 bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
      >
        <span className="text-lg font-semibold">📖 什么是流式 JSON 解析器？</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          {/* 核心概念 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🎯 核心概念</h3>
            <p className="text-gray-300">
              当 AI 返回工具调用时，JSON 参数是<strong>流式传输</strong>的——一次只收到几个字符。
              解析器需要在数据不完整时就开始解析，并能处理多个并发的工具调用。
            </p>
          </div>

          {/* 为什么需要 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">❓ 解决什么问题？</h3>
            <ul className="text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>流式解析</strong>：不等待完整 JSON，边收边解析</li>
              <li><strong>索引碰撞</strong>：多个工具调用可能使用相同索引</li>
              <li><strong>字符串修复</strong>：自动闭合未完成的引号</li>
              <li><strong>深度跟踪</strong>：精确判断 JSON 何时完整</li>
            </ul>
          </div>

          {/* 触发场景 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">⚡ 何时触发？</h3>
            <div className="bg-gray-900 p-3 rounded font-mono text-xs">
              <div className="text-gray-400"># AI 决定调用工具</div>
              <div className="text-blue-400">AI: 我需要读取文件...</div>
              <div className="text-gray-400"># 流式返回 tool_call</div>
              <div className="text-yellow-400">chunk1: {'{"file":'}</div>
              <div className="text-yellow-400">chunk2: {'"src/in'}</div>
              <div className="text-yellow-400">chunk3: {'dex.ts"}'}</div>
              <div className="text-gray-400"># 解析器逐字符跟踪深度</div>
            </div>
          </div>

          {/* 关键算法 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🔧 关键算法</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">深度计数</div>
                <div className="text-gray-400">{'{ [ → depth++, } ] → depth--'}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">字符串状态</div>
                <div className="text-gray-400">" 翻转 inString（除非转义）</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">完成检测</div>
                <div className="text-gray-400">depth == 0 且 buffer 非空</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-yellow-400">碰撞处理</div>
                <div className="text-gray-400">同索引不同ID → 分配新索引</div>
              </div>
            </div>
          </div>

          {/* 源码位置 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">📁 源码位置</h3>
            <code className="text-xs bg-gray-900 p-2 rounded block">
              packages/core/src/core/openaiContentGenerator/streamingToolCallParser.ts
            </code>
          </div>

          {/* 相关机制 */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">🔗 相关机制</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">OpenAI 管道</span>
              <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">工具调度器</span>
              <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">流式响应</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ParseState = 'idle' | 'parsing' | 'complete' | 'repaired' | 'error';

interface ToolCallBuffer {
  index: number;
  id: string;
  name: string;
  buffer: string;
  depth: number;
  inString: boolean;
  escape: boolean;
  complete: boolean;
  repaired: boolean;
}

// 模拟的流式 chunks
const DEMO_SCENARIOS = [
  {
    name: '正常解析',
    chunks: [
      { index: 0, chunk: '{"file_path":', id: 'call_1', name: 'read_file' },
      { index: 0, chunk: '"/src/test.ts",', id: 'call_1' },
      { index: 0, chunk: '"offset":0,', id: 'call_1' },
      { index: 0, chunk: '"limit":200}', id: 'call_1' },
    ],
  },
  {
    name: '索引碰撞',
    chunks: [
      { index: 0, chunk: '{"file_path":', id: 'call_1', name: 'read_file' },
      { index: 0, chunk: '"a.ts"}', id: 'call_1' },
      { index: 0, chunk: '{"file_path":', id: 'call_2', name: 'write_file' }, // 碰撞！同索引不同 ID
      { index: 0, chunk: '"b.ts","content":"hello"}', id: 'call_2' },
    ],
  },
  {
    name: '未闭合字符串修复',
    chunks: [
      { index: 0, chunk: '{"file_path":"out.txt","content":', id: 'call_1', name: 'write_file' },
      { index: 0, chunk: '"Hello World', id: 'call_1' }, // 未闭合的字符串
      { index: 0, chunk: '}', id: 'call_1' }, // depth=0 但 inString=true
    ],
  },
  {
    name: '嵌套对象',
    chunks: [
      { index: 0, chunk: '{"outer":{', id: 'call_1', name: 'nested' },
      { index: 0, chunk: '"inner":{', id: 'call_1' },
      { index: 0, chunk: '"value":1', id: 'call_1' },
      { index: 0, chunk: '}}}', id: 'call_1' },
    ],
  },
];

export default function StreamingJsonParserAnimation() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [buffers, setBuffers] = useState<Map<number, ToolCallBuffer>>(new Map());
  const [idToIndexMap, setIdToIndexMap] = useState<Map<string, number>>(new Map());
  const [nextAvailableIndex, setNextAvailableIndex] = useState(0);
  const [highlightChar, setHighlightChar] = useState<{ index: number; pos: number } | null>(null);
  const [parseState, setParseState] = useState<ParseState>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scenario = DEMO_SCENARIOS[scenarioIndex];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const addLog = (msg: string) => {
    setLog(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setCurrentChunkIndex(-1);
    setBuffers(new Map());
    setIdToIndexMap(new Map());
    setNextAvailableIndex(0);
    setHighlightChar(null);
    setParseState('idle');
    setLog([]);
  }, []);

  const sleep = (ms: number) => new Promise(resolve => {
    timeoutRef.current = setTimeout(resolve, ms);
  });

  // 模拟 findNextAvailableIndex
  const findNextAvailableIndex = useCallback((currentBuffers: Map<number, ToolCallBuffer>, startIndex: number): number => {
    let idx = startIndex;
    while (currentBuffers.has(idx) && currentBuffers.get(idx)!.complete) {
      idx++;
    }
    return idx;
  }, []);

  // 处理单个 chunk
  const processChunk = useCallback(async (
    chunkData: { index: number; chunk: string; id?: string; name?: string },
    currentBuffers: Map<number, ToolCallBuffer>,
    currentIdMap: Map<string, number>,
    currentNextIdx: number
  ) => {
    const { index, chunk, id, name } = chunkData;
    let actualIndex = index;
    let newNextIdx = currentNextIdx;

    // 碰撞检测逻辑
    if (id) {
      if (currentIdMap.has(id)) {
        // 已知 ID，使用映射的索引
        actualIndex = currentIdMap.get(id)!;
        addLog(`ID ${id} 已映射到索引 ${actualIndex}`);
      } else {
        // 新 ID，检查索引碰撞
        const existingBuffer = currentBuffers.get(index);
        if (existingBuffer && existingBuffer.complete && existingBuffer.id !== id) {
          // 碰撞！分配新索引
          actualIndex = findNextAvailableIndex(currentBuffers, newNextIdx);
          newNextIdx = actualIndex + 1;
          addLog(`⚠️ 索引碰撞！ID ${id} 分配新索引 ${actualIndex}`);
        }
        currentIdMap.set(id, actualIndex);
      }
    }

    // 获取或创建 buffer
    let buffer = currentBuffers.get(actualIndex);
    if (!buffer) {
      buffer = {
        index: actualIndex,
        id: id || '',
        name: name || '',
        buffer: '',
        depth: 0,
        inString: false,
        escape: false,
        complete: false,
        repaired: false,
      };
      currentBuffers.set(actualIndex, buffer);
      addLog(`创建新 buffer: 索引 ${actualIndex}`);
    }

    // 逐字符处理
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];
      buffer.buffer += char;

      setHighlightChar({ index: actualIndex, pos: buffer.buffer.length - 1 });
      await sleep(80);

      // 更新状态
      if (!buffer.inString) {
        if (char === '{' || char === '[') {
          buffer.depth++;
          addLog(`深度 +1 → ${buffer.depth} (遇到 '${char}')`);
        } else if (char === '}' || char === ']') {
          buffer.depth--;
          addLog(`深度 -1 → ${buffer.depth} (遇到 '${char}')`);
        }
      }

      if (char === '"' && !buffer.escape) {
        buffer.inString = !buffer.inString;
        addLog(`字符串状态: ${buffer.inString ? '进入' : '退出'}`);
      }

      buffer.escape = char === '\\' && !buffer.escape;

      // 更新 UI
      currentBuffers.set(actualIndex, { ...buffer });
      setBuffers(new Map(currentBuffers));
    }

    setHighlightChar(null);

    // 检查完成状态
    if (buffer.depth === 0 && buffer.buffer.trim().length > 0) {
      try {
        JSON.parse(buffer.buffer);
        buffer.complete = true;
        addLog(`✓ 解析成功！`);
        setParseState('complete');
      } catch {
        // 尝试修复未闭合字符串
        if (buffer.inString) {
          try {
            JSON.parse(buffer.buffer + '"');
            buffer.buffer += '"';
            buffer.complete = true;
            buffer.repaired = true;
            addLog(`🔧 自动修复：添加闭合引号`);
            setParseState('repaired');
          } catch {
            addLog(`✗ 解析失败，无法修复`);
            setParseState('error');
          }
        }
      }
    }

    currentBuffers.set(actualIndex, { ...buffer });
    setBuffers(new Map(currentBuffers));
    setNextAvailableIndex(newNextIdx);
    setIdToIndexMap(new Map(currentIdMap));
  }, [findNextAvailableIndex]);

  const runDemo = useCallback(async () => {
    if (isPlaying) return;
    reset();
    setIsPlaying(true);
    setParseState('parsing');

    const localBuffers = new Map<number, ToolCallBuffer>();
    const localIdMap = new Map<string, number>();
    let localNextIdx = 0;

    for (let i = 0; i < scenario.chunks.length; i++) {
      setCurrentChunkIndex(i);
      addLog(`处理 chunk ${i + 1}/${scenario.chunks.length}`);

      await processChunk(scenario.chunks[i], localBuffers, localIdMap, localNextIdx);
      localNextIdx = Math.max(localNextIdx, ...Array.from(localBuffers.keys())) + 1;

      await sleep(500);
    }

    setIsPlaying(false);
  }, [isPlaying, reset, scenario.chunks, processChunk]);

  const getDepthColor = (depth: number) => {
    const colors = ['text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400'];
    return colors[Math.min(depth, colors.length - 1)];
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-2">流式 JSON 解析器动画</h1>
      <p className="text-gray-400 mb-4">
        基于 streamingToolCallParser.ts | 字符级深度跟踪、碰撞检测、自动修复
      </p>

      {/* 介绍部分 */}
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      {/* 控制面板 */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={runDemo}
          disabled={isPlaying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          运行演示
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          重置
        </button>
        <select
          value={scenarioIndex}
          onChange={(e) => {
            reset();
            setScenarioIndex(Number(e.target.value));
          }}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          {DEMO_SCENARIOS.map((s, i) => (
            <option key={i} value={i}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 状态指示 */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-gray-400">解析状态:</span>
        <span className={`px-3 py-1 rounded ${
          parseState === 'idle' ? 'bg-gray-600' :
          parseState === 'parsing' ? 'bg-blue-600 animate-pulse' :
          parseState === 'complete' ? 'bg-green-600' :
          parseState === 'repaired' ? 'bg-yellow-600' :
          'bg-red-600'
        }`}>
          {parseState === 'idle' ? '空闲' :
           parseState === 'parsing' ? '解析中' :
           parseState === 'complete' ? '完成' :
           parseState === 'repaired' ? '已修复' : '错误'}
        </span>
      </div>

      {/* Chunks 进度 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Chunks 流</h2>
        <div className="flex gap-2 flex-wrap">
          {scenario.chunks.map((chunk, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded font-mono text-sm ${
                i === currentChunkIndex
                  ? 'bg-blue-600 ring-2 ring-blue-400'
                  : i < currentChunkIndex
                  ? 'bg-green-700'
                  : 'bg-gray-700'
              }`}
            >
              <div className="text-xs text-gray-400">idx:{chunk.index} {chunk.id && `id:${chunk.id.slice(-4)}`}</div>
              <div className="truncate max-w-32">{chunk.chunk}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：Buffer 状态 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Tool Call Buffers</h2>
          <div className="space-y-4">
            {buffers.size === 0 ? (
              <div className="bg-gray-800 rounded p-4 text-gray-500">等待数据...</div>
            ) : (
              Array.from(buffers.values()).map((buffer) => (
                <div
                  key={buffer.index}
                  className={`bg-gray-800 rounded p-4 ${
                    buffer.complete
                      ? buffer.repaired
                        ? 'ring-2 ring-yellow-500'
                        : 'ring-2 ring-green-500'
                      : ''
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">索引: {buffer.index}</span>
                    <span className="text-blue-400">{buffer.name}</span>
                  </div>

                  {/* Buffer 内容（带高亮） */}
                  <div className="font-mono text-sm bg-black p-2 rounded mb-2 break-all">
                    {buffer.buffer.split('').map((char, i) => (
                      <span
                        key={i}
                        className={
                          highlightChar?.index === buffer.index && highlightChar?.pos === i
                            ? 'bg-yellow-500 text-black'
                            : char === '{' || char === '['
                            ? 'text-cyan-400'
                            : char === '}' || char === ']'
                            ? 'text-cyan-400'
                            : char === '"'
                            ? 'text-green-400'
                            : ''
                        }
                      >
                        {char}
                      </span>
                    ))}
                    <span className="animate-pulse text-gray-500">│</span>
                  </div>

                  {/* 状态指标 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">深度: </span>
                      <span className={getDepthColor(buffer.depth)}>{buffer.depth}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">字符串内: </span>
                      <span className={buffer.inString ? 'text-yellow-400' : 'text-gray-500'}>
                        {buffer.inString ? '是' : '否'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">转义: </span>
                      <span className={buffer.escape ? 'text-orange-400' : 'text-gray-500'}>
                        {buffer.escape ? '是' : '否'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">状态: </span>
                      <span className={
                        buffer.complete
                          ? buffer.repaired
                            ? 'text-yellow-400'
                            : 'text-green-400'
                          : 'text-blue-400'
                      }>
                        {buffer.complete ? (buffer.repaired ? '已修复' : '完成') : '进行中'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ID 到索引映射 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">ID → Index 映射</h2>
          <div className="bg-gray-800 rounded p-4 font-mono text-sm">
            {idToIndexMap.size === 0 ? (
              <span className="text-gray-500">空</span>
            ) : (
              Array.from(idToIndexMap.entries()).map(([id, idx]) => (
                <div key={id}>
                  <span className="text-purple-400">{id}</span>
                  <span className="text-gray-500"> → </span>
                  <span className="text-yellow-400">{idx}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：日志和算法说明 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">解析日志</h2>
          <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-xs">
            {log.length === 0 ? (
              <span className="text-gray-500">等待开始...</span>
            ) : (
              log.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.includes('⚠️') ? 'text-yellow-400' :
                    entry.includes('✓') ? 'text-green-400' :
                    entry.includes('✗') ? 'text-red-400' :
                    entry.includes('🔧') ? 'text-orange-400' :
                    'text-gray-300'
                  }
                >
                  {entry}
                </div>
              ))
            )}
          </div>

          {/* 算法说明 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">核心算法</h2>
          <div className="bg-gray-800 rounded p-4 text-sm space-y-3">
            <div>
              <div className="text-cyan-400 font-semibold">深度跟踪</div>
              <div className="text-gray-400">
                遇到 <code className="text-green-400">{'{['}</code> depth++，
                遇到 <code className="text-green-400">{'}]'}</code> depth--
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">字符串状态</div>
              <div className="text-gray-400">
                遇到 <code className="text-green-400">"</code> 且非转义，翻转 inString
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">完成检测</div>
              <div className="text-gray-400">
                depth == 0 且 buffer 非空 → 尝试 JSON.parse()
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">字符串修复</div>
              <div className="text-gray-400">
                如果 inString && depth == 0，尝试 parse(buffer + '"')
              </div>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold">碰撞处理</div>
              <div className="text-gray-400">
                同索引不同 ID → findNextAvailableIndex()
              </div>
            </div>
          </div>

          {/* 下一可用索引 */}
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <span className="text-gray-400">nextAvailableIndex: </span>
            <span className="text-yellow-400 font-mono">{nextAvailableIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
