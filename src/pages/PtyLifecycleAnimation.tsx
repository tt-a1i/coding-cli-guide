import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * PTY 生命周期动画
 * 基于 shellExecutionService.ts 的实现
 * 展示 PTY 的 spawn → 数据处理 → 渲染 → 退出 完整流程
 */

type PtyPhase = 'idle' | 'spawning' | 'running' | 'processing' | 'rendering' | 'aborting' | 'exiting' | 'done';

interface TerminalLine {
  content: string;
  timestamp: number;
}

interface OutputChunk {
  data: string;
  isBinary: boolean;
  timestamp: number;
}

// 模拟命令和输出
const DEMO_COMMANDS = [
  {
    cmd: 'ls -la',
    outputs: [
      'total 48',
      'drwxr-xr-x  12 user  staff   384 Dec 25 10:00 .',
      'drwxr-xr-x   5 user  staff   160 Dec 24 09:00 ..',
      '-rw-r--r--   1 user  staff  1234 Dec 25 09:30 package.json',
      '-rw-r--r--   1 user  staff   567 Dec 25 09:30 tsconfig.json',
      'drwxr-xr-x   8 user  staff   256 Dec 25 10:00 src',
    ],
  },
  {
    cmd: 'cat binary.png',
    outputs: ['[BINARY DETECTED: PNG header 0x89504E47]'],
    isBinary: true,
  },
  {
    cmd: 'echo "Hello World"',
    outputs: ['Hello World'],
  },
];

// 常量（来自 shellExecutionService.ts）
const CONSTANTS = {
  SIGKILL_TIMEOUT_MS: 200,
  MAX_SNIFF_SIZE: 4096,
  RENDER_THROTTLE_MS: 17, // ≈60fps
  TERM_COLS: 80,
  TERM_ROWS: 24,
};

export default function PtyLifecycleAnimation() {
  const [phase, setPhase] = useState<PtyPhase>('idle');
  const [currentCommand, setCurrentCommand] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [outputChunks, setOutputChunks] = useState<OutputChunk[]>([]);
  const [sniffedBytes, setSniffedBytes] = useState(0);
  const [isBinaryDetected, setIsBinaryDetected] = useState(false);
  const [ptyPid, setPtyPid] = useState<number | null>(null);
  const [executionMethod, setExecutionMethod] = useState<string>('');
  const [renderQueue, setRenderQueue] = useState<string[]>([]);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [signal, setSignal] = useState<string | null>(null);

  const animationRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setTerminalLines([]);
    setOutputChunks([]);
    setSniffedBytes(0);
    setIsBinaryDetected(false);
    setPtyPid(null);
    setExecutionMethod('');
    setRenderQueue([]);
    setLastRenderTime(0);
    setExitCode(null);
    setSignal(null);
    setIsAutoPlaying(false);
  }, [cleanup]);

  const sleep = (ms: number) => new Promise(resolve => {
    timeoutRef.current = setTimeout(resolve, ms);
  });

  const runDemo = useCallback(async () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);

    const cmd = DEMO_COMMANDS[currentCommand];

    // Phase 1: Spawning
    setPhase('spawning');
    await sleep(500);

    // 尝试 PTY 方法
    const methods = ['lydell-node-pty', 'node-pty', 'child_process'];
    for (const method of methods) {
      setExecutionMethod(method);
      await sleep(200);
      if (method === 'lydell-node-pty') {
        // 假设第一个方法成功
        break;
      }
    }

    // 分配 PID
    const pid = 12345 + Math.floor(Math.random() * 1000);
    setPtyPid(pid);
    await sleep(300);

    // Phase 2: Running
    setPhase('running');
    setTerminalLines([{ content: `$ ${cmd.cmd}`, timestamp: Date.now() }]);
    await sleep(400);

    // Phase 3: Processing output
    setPhase('processing');

    for (let i = 0; i < cmd.outputs.length; i++) {
      const output = cmd.outputs[i];
      const chunk: OutputChunk = {
        data: output,
        isBinary: !!cmd.isBinary,
        timestamp: Date.now(),
      };

      setOutputChunks(prev => [...prev, chunk]);

      // 模拟 sniffing
      const bytes = new TextEncoder().encode(output).length;
      setSniffedBytes(prev => {
        const newBytes = prev + bytes;
        if (cmd.isBinary && newBytes > 0) {
          setIsBinaryDetected(true);
        }
        return Math.min(newBytes, CONSTANTS.MAX_SNIFF_SIZE);
      });

      // 添加到渲染队列
      setRenderQueue(prev => [...prev, output]);

      await sleep(150);
    }

    // Phase 4: Rendering (throttled)
    setPhase('rendering');

    for (const line of cmd.outputs) {
      const now = Date.now();
      const elapsed = now - lastRenderTime;

      if (elapsed < CONSTANTS.RENDER_THROTTLE_MS) {
        await sleep(CONSTANTS.RENDER_THROTTLE_MS - elapsed);
      }

      setTerminalLines(prev => [...prev, { content: line, timestamp: Date.now() }]);
      setLastRenderTime(Date.now());
      setRenderQueue(prev => prev.slice(1));

      await sleep(100);
    }

    // Phase 5: Exiting
    setPhase('exiting');
    await sleep(300);

    setExitCode(0);
    await sleep(200);

    // Done
    setPhase('done');
    setIsAutoPlaying(false);
  }, [currentCommand, isAutoPlaying, lastRenderTime]);

  const simulateAbort = useCallback(async () => {
    if (phase !== 'running' && phase !== 'processing') return;

    setPhase('aborting');
    setSignal('SIGINT');
    await sleep(100);

    // 等待 SIGKILL_TIMEOUT_MS
    await sleep(CONSTANTS.SIGKILL_TIMEOUT_MS);

    setSignal('SIGKILL');
    await sleep(100);

    setExitCode(null);
    setPhase('done');
    setIsAutoPlaying(false);
  }, [phase]);

  const nextCommand = () => {
    reset();
    setCurrentCommand((prev) => (prev + 1) % DEMO_COMMANDS.length);
  };

  const getPhaseColor = (p: PtyPhase) => {
    const colors: Record<PtyPhase, string> = {
      idle: 'bg-gray-500',
      spawning: 'bg-yellow-500',
      running: 'bg-blue-500',
      processing: 'bg-purple-500',
      rendering: 'bg-green-500',
      aborting: 'bg-red-500',
      exiting: 'bg-orange-500',
      done: 'bg-emerald-500',
    };
    return colors[p];
  };

  const getPhaseLabel = (p: PtyPhase) => {
    const labels: Record<PtyPhase, string> = {
      idle: '空闲',
      spawning: '启动中',
      running: '运行中',
      processing: '处理输出',
      rendering: '渲染中',
      aborting: '中止中',
      exiting: '退出中',
      done: '完成',
    };
    return labels[p];
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-2">PTY 生命周期动画</h1>
      <p className="text-gray-400 mb-6">
        基于 shellExecutionService.ts | 展示 PTY spawn → 数据处理 → 渲染 → 退出 流程
      </p>

      {/* 控制面板 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runDemo}
          disabled={isAutoPlaying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          运行演示
        </button>
        <button
          onClick={simulateAbort}
          disabled={phase !== 'running' && phase !== 'processing'}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded"
        >
          模拟中止 (Ctrl+C)
        </button>
        <button
          onClick={nextCommand}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          下一命令
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          重置
        </button>
      </div>

      {/* 当前命令 */}
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <span className="text-gray-400">当前命令：</span>
        <code className="ml-2 text-green-400">{DEMO_COMMANDS[currentCommand].cmd}</code>
        {DEMO_COMMANDS[currentCommand].isBinary && (
          <span className="ml-4 px-2 py-1 bg-red-600 text-xs rounded">Binary</span>
        )}
      </div>

      {/* 状态流程图 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">状态流程</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(['idle', 'spawning', 'running', 'processing', 'rendering', 'exiting', 'done'] as PtyPhase[]).map((p, i) => (
            <React.Fragment key={p}>
              <div
                className={`px-3 py-2 rounded ${
                  phase === p ? getPhaseColor(p) + ' ring-2 ring-white' : 'bg-gray-700'
                }`}
              >
                {getPhaseLabel(p)}
              </div>
              {i < 6 && <span className="text-gray-500">→</span>}
            </React.Fragment>
          ))}
        </div>
        {phase === 'aborting' && (
          <div className="mt-2 px-3 py-2 bg-red-500 rounded inline-block">
            中止分支: SIGINT → SIGKILL
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：PTY 状态 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">PTY 状态</h2>
          <div className="bg-gray-800 rounded p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">执行方法:</span>
              <span className={executionMethod ? 'text-green-400' : 'text-gray-500'}>
                {executionMethod || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PID:</span>
              <span className={ptyPid ? 'text-blue-400' : 'text-gray-500'}>
                {ptyPid || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">终端尺寸:</span>
              <span className="text-purple-400">{CONSTANTS.TERM_COLS}×{CONSTANTS.TERM_ROWS}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sniffed 字节:</span>
              <span className={sniffedBytes >= CONSTANTS.MAX_SNIFF_SIZE ? 'text-yellow-400' : 'text-white'}>
                {sniffedBytes} / {CONSTANTS.MAX_SNIFF_SIZE}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Binary 检测:</span>
              <span className={isBinaryDetected ? 'text-red-400' : 'text-green-400'}>
                {isBinaryDetected ? '是' : '否'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">渲染节流:</span>
              <span className="text-cyan-400">{CONSTANTS.RENDER_THROTTLE_MS}ms (~60fps)</span>
            </div>
            {signal && (
              <div className="flex justify-between">
                <span className="text-gray-400">信号:</span>
                <span className="text-red-400">{signal}</span>
              </div>
            )}
            {exitCode !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">退出码:</span>
                <span className={exitCode === 0 ? 'text-green-400' : 'text-red-400'}>{exitCode}</span>
              </div>
            )}
          </div>

          {/* 输出块队列 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">输出块队列</h2>
          <div className="bg-gray-800 rounded p-4 max-h-48 overflow-y-auto">
            {outputChunks.length === 0 ? (
              <span className="text-gray-500">等待输出...</span>
            ) : (
              outputChunks.map((chunk, i) => (
                <div
                  key={i}
                  className={`text-xs mb-1 p-2 rounded ${
                    chunk.isBinary ? 'bg-red-900/50' : 'bg-gray-700'
                  }`}
                >
                  <span className="text-gray-400">[{new Date(chunk.timestamp).toLocaleTimeString()}]</span>
                  <span className="ml-2">{chunk.data.substring(0, 50)}{chunk.data.length > 50 ? '...' : ''}</span>
                </div>
              ))
            )}
          </div>

          {/* 渲染队列 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">渲染队列</h2>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-sm text-gray-400 mb-2">待渲染: {renderQueue.length} 行</div>
            {renderQueue.slice(0, 3).map((line, i) => (
              <div key={i} className="text-xs text-yellow-400 truncate">
                {line}
              </div>
            ))}
            {renderQueue.length > 3 && (
              <div className="text-xs text-gray-500">+{renderQueue.length - 3} more...</div>
            )}
          </div>
        </div>

        {/* 右侧：终端输出 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">xterm.js 终端</h2>
          <div className="bg-black rounded p-4 font-mono text-sm h-80 overflow-y-auto border border-gray-700">
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`${
                  line.content.startsWith('$') ? 'text-green-400' :
                  line.content.includes('BINARY') ? 'text-red-400' : 'text-white'
                }`}
              >
                {line.content}
              </div>
            ))}
            {phase === 'running' && (
              <span className="animate-pulse">▌</span>
            )}
          </div>

          {/* 关键常量 */}
          <h2 className="text-lg font-semibold mb-3 mt-6">关键常量</h2>
          <div className="bg-gray-800 rounded p-4 font-mono text-sm">
            <div className="text-gray-400">// shellExecutionService.ts</div>
            <div><span className="text-purple-400">SIGKILL_TIMEOUT_MS</span> = <span className="text-yellow-400">{CONSTANTS.SIGKILL_TIMEOUT_MS}</span></div>
            <div><span className="text-purple-400">MAX_SNIFF_SIZE</span> = <span className="text-yellow-400">{CONSTANTS.MAX_SNIFF_SIZE}</span></div>
            <div><span className="text-purple-400">renderTimeout</span> = <span className="text-yellow-400">{CONSTANTS.RENDER_THROTTLE_MS}</span> <span className="text-gray-500">// ≈60fps</span></div>
          </div>
        </div>
      </div>

      {/* 执行方法回退链 */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">执行方法回退链</h2>
        <div className="flex items-center gap-4">
          {['lydell-node-pty', 'node-pty', 'child_process'].map((method, i) => (
            <React.Fragment key={method}>
              <div
                className={`px-4 py-2 rounded ${
                  executionMethod === method
                    ? 'bg-green-600 ring-2 ring-green-400'
                    : 'bg-gray-700'
                }`}
              >
                {method}
              </div>
              {i < 2 && (
                <span className="text-gray-500">
                  <span className="text-red-400">fail</span> →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 中止流程说明 */}
      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h3 className="text-md font-semibold mb-2">中止处理流程</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <div>1. 发送 <span className="text-yellow-400">SIGINT</span> 信号</div>
          <div>2. 等待 <span className="text-yellow-400">{CONSTANTS.SIGKILL_TIMEOUT_MS}ms</span></div>
          <div>3. 如果进程未终止，发送 <span className="text-red-400">SIGKILL</span></div>
          <div>4. Unix: <code className="text-cyan-400">kill(-pid)</code> 终止进程组</div>
          <div>5. Windows: <code className="text-cyan-400">taskkill /pid /f /t</code></div>
        </div>
      </div>
    </div>
  );
}
