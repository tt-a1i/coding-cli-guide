import { useState, useCallback, useRef, useEffect, Fragment } from 'react';

/**
 * PTY 生命周期动画
 * 基于 shellExecutionService.ts 的实现
 * 展示 PTY 的 spawn → 数据处理 → 渲染 → 退出 完整流程
 */

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-surface rounded-lg overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-elevated transition-colors"
 >
 <span className="text-lg font-semibold">📖 什么是 PTY 生命周期？</span>
 <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 space-y-4 text-sm">
 {/* 核心概念 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">🎯 核心概念</h3>
 <p className="text-body">
 <strong>PTY (Pseudo-Terminal)</strong> 是一个虚拟终端设备，让 CLI 能够像真实终端一样执行命令。
 当你在 Gemini CLI 中使用 <code className="bg-elevated px-1 rounded">run_shell_command</code> 工具执行 <code className="bg-elevated px-1 rounded">ls</code>、
 <code className="bg-elevated px-1 rounded">git status</code> 等命令时，背后就是 PTY 在工作。
 </p>
 </div>

 {/* 为什么需要 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">❓ 为什么需要 PTY？</h3>
 <ul className="text-body space-y-1 list-disc list-inside">
 <li><strong>彩色输出</strong>：支持 ANSI 转义序列，显示彩色的命令输出</li>
 <li><strong>交互式命令</strong>：支持需要终端的命令（如 vim、top）</li>
 <li><strong>信号处理</strong>：正确处理 Ctrl+C 等中断信号</li>
 <li><strong>输出格式</strong>：保持命令输出的原始格式（列对齐等）</li>
 </ul>
 </div>

 {/* 触发场景 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">⚡ 何时触发？</h3>
 <div className="bg-base p-3 rounded font-mono text-xs">
 <div className="text-body"># 用户请求 AI 执行命令</div>
 <div className="text-heading">User: 帮我查看当前目录的文件</div>
 <div className="text-body"># AI 调用 run_shell_command 工具</div>
 <div className="text-heading">→ run_shell_command: ls -la</div>
 <div className="text-body"># 触发 PTY 生命周期</div>
 <div className="text-heading">→ shellExecutionService.execute()</div>
 </div>
 </div>

 {/* 关键设计 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">🔧 关键设计决策</h3>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-base p-2 rounded">
 <div className="text-heading">执行方法回退</div>
 <div className="text-body">lydell-node-pty → node-pty → child_process</div>
 </div>
 <div className="bg-base p-2 rounded">
 <div className="text-heading">Binary 检测</div>
 <div className="text-body">前 4KB 嗅探，避免乱码输出</div>
 </div>
 <div className="bg-base p-2 rounded">
 <div className="text-heading">渲染节流</div>
 <div className="text-body">17ms 间隔 ≈ 60fps，避免闪烁</div>
 </div>
 <div className="bg-base p-2 rounded">
 <div className="text-heading">优雅中止</div>
 <div className="text-body">SIGINT → 200ms → SIGKILL</div>
 </div>
 </div>
 </div>

 {/* 源码位置 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">📁 源码位置</h3>
 <code className="text-xs bg-base p-2 rounded block">
 packages/core/src/services/shellExecutionService.ts
 </code>
 </div>

 {/* 相关机制 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">🔗 相关机制</h3>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/50 text-heading rounded text-xs">run_shell_command 工具</span>
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">工具调度器</span>
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">终端序列化</span>
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">沙箱系统</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

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
 'drwxr-xr-x 12 user staff 384 Dec 25 10:00 .',
 'drwxr-xr-x 5 user staff 160 Dec 24 09:00 ..',
 '-rw-r--r-- 1 user staff 1234 Dec 25 09:30 package.json',
 '-rw-r--r-- 1 user staff 567 Dec 25 09:30 tsconfig.json',
 'drwxr-xr-x 8 user staff 256 Dec 25 10:00 src',
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
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

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
 idle: ' bg-elevated',
 spawning: 'bg-[var(--color-warning)]',
 running: ' bg-elevated',
 processing: ' bg-elevated',
 rendering: 'bg-[var(--color-success)]',
 aborting: 'bg-[var(--color-danger)]',
 exiting: 'bg-[var(--color-warning)]',
 done: 'bg-[var(--color-success)]',
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
 <div className="p-6 bg-base text-heading min-h-screen">
 <h1 className="text-2xl font-bold mb-2">PTY 生命周期动画</h1>
 <p className="text-body mb-4">
 基于 shellExecutionService.ts | 展示 PTY spawn → 数据处理 → 渲染 → 退出 流程
 </p>

 {/* 介绍部分 */}
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* 控制面板 */}
 <div className="flex gap-4 mb-6">
 <button
 onClick={runDemo}
 disabled={isAutoPlaying}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated rounded"
 >
 运行演示
 </button>
 <button
 onClick={simulateAbort}
 disabled={phase !== 'running' && phase !== 'processing'}
 className="px-4 py-2 bg-[var(--color-danger)] hover:bg-[var(--color-danger)] disabled:bg-elevated rounded"
 >
 模拟中止 (Ctrl+C)
 </button>
 <button
 onClick={nextCommand}
 className="px-4 py-2 bg-elevated hover:bg-elevated rounded"
 >
 下一命令
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-elevated hover:bg-elevated rounded"
 >
 重置
 </button>
 </div>

 {/* 当前命令 */}
 <div className="mb-6 p-4 bg-surface rounded">
 <span className="text-body">当前命令：</span>
 <code className="ml-2 text-heading">{DEMO_COMMANDS[currentCommand].cmd}</code>
 {DEMO_COMMANDS[currentCommand].isBinary && (
 <span className="ml-4 px-2 py-1 bg-[var(--color-danger)] text-xs rounded">Binary</span>
 )}
 </div>

 {/* 状态流程图 */}
 <div className="mb-6">
 <h2 className="text-lg font-semibold mb-3">状态流程</h2>
 <div className="flex items-center gap-2 flex-wrap">
 {(['idle', 'spawning', 'running', 'processing', 'rendering', 'exiting', 'done'] as PtyPhase[]).map((p, i) => (
 <Fragment key={p}>
 <div
 className={`px-3 py-2 rounded ${
 phase === p ? getPhaseColor(p) + ' ring-2 ring-white' : ' bg-elevated'
 }`}
 >
 {getPhaseLabel(p)}
 </div>
 {i < 6 && <span className="text-dim">→</span>}
 </Fragment>
 ))}
 </div>
 {phase === 'aborting' && (
 <div className="mt-2 px-3 py-2 bg-[var(--color-danger)] rounded inline-block">
 中止分支: SIGINT → SIGKILL
 </div>
 )}
 </div>

 <div className="grid grid-cols-2 gap-6">
 {/* 左侧：PTY 状态 */}
 <div>
 <h2 className="text-lg font-semibold mb-3">PTY 状态</h2>
 <div className="bg-surface rounded p-4 space-y-3">
 <div className="flex justify-between">
 <span className="text-body">执行方法:</span>
 <span className={executionMethod ? 'text-heading' : 'text-dim'}>
 {executionMethod || '-'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-body">PID:</span>
 <span className={ptyPid ? 'text-heading' : 'text-dim'}>
 {ptyPid || '-'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-body">终端尺寸:</span>
 <span className="text-heading">{CONSTANTS.TERM_COLS}×{CONSTANTS.TERM_ROWS}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-body">Sniffed 字节:</span>
 <span className={sniffedBytes >= CONSTANTS.MAX_SNIFF_SIZE ? 'text-heading' : 'text-heading'}>
 {sniffedBytes} / {CONSTANTS.MAX_SNIFF_SIZE}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-body">Binary 检测:</span>
 <span className={isBinaryDetected ? 'text-heading' : 'text-heading'}>
 {isBinaryDetected ? '是' : '否'}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-body">渲染节流:</span>
 <span className="text-heading">{CONSTANTS.RENDER_THROTTLE_MS}ms (~60fps)</span>
 </div>
 {signal && (
 <div className="flex justify-between">
 <span className="text-body">信号:</span>
 <span className="text-heading">{signal}</span>
 </div>
 )}
 {exitCode !== null && (
 <div className="flex justify-between">
 <span className="text-body">退出码:</span>
 <span className={exitCode === 0 ? 'text-heading' : 'text-heading'}>{exitCode}</span>
 </div>
 )}
 </div>

 {/* 输出块队列 */}
 <h2 className="text-lg font-semibold mb-3 mt-6">输出块队列</h2>
 <div className="bg-surface rounded p-4 max-h-48 overflow-y-auto">
 {outputChunks.length === 0 ? (
 <span className="text-dim">等待输出...</span>
 ) : (
 outputChunks.map((chunk, i) => (
 <div
 key={i}
 className={`text-xs mb-1 p-2 rounded ${
 chunk.isBinary ? 'bg-elevated' : ' bg-elevated'
 }`}
 >
 <span className="text-body">[{new Date(chunk.timestamp).toLocaleTimeString()}]</span>
 <span className="ml-2">{chunk.data.substring(0, 50)}{chunk.data.length > 50 ? '...' : ''}</span>
 </div>
 ))
 )}
 </div>

 {/* 渲染队列 */}
 <h2 className="text-lg font-semibold mb-3 mt-6">渲染队列</h2>
 <div className="bg-surface rounded p-4">
 <div className="text-sm text-body mb-2">待渲染: {renderQueue.length} 行</div>
 {renderQueue.slice(0, 3).map((line, i) => (
 <div key={i} className="text-xs text-heading truncate">
 {line}
 </div>
 ))}
 {renderQueue.length > 3 && (
 <div className="text-xs text-dim">+{renderQueue.length - 3} more...</div>
 )}
 </div>
 </div>

 {/* 右侧：终端输出 */}
 <div>
 <h2 className="text-lg font-semibold mb-3">xterm.js 终端</h2>
 <div className="bg-base rounded p-4 font-mono text-sm h-80 overflow-y-auto border border-edge">
 {terminalLines.map((line, i) => (
 <div
 key={i}
 className={`${
 line.content.startsWith('$') ? 'text-heading' :
 line.content.includes('BINARY') ? 'text-heading' : 'text-heading'
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
 <div className="bg-surface rounded p-4 font-mono text-sm">
 <div className="text-body">// shellExecutionService.ts</div>
 <div><span className="text-heading">SIGKILL_TIMEOUT_MS</span> = <span className="text-heading">{CONSTANTS.SIGKILL_TIMEOUT_MS}</span></div>
 <div><span className="text-heading">MAX_SNIFF_SIZE</span> = <span className="text-heading">{CONSTANTS.MAX_SNIFF_SIZE}</span></div>
 <div><span className="text-heading">renderTimeout</span> = <span className="text-heading">{CONSTANTS.RENDER_THROTTLE_MS}</span> <span className="text-dim">// ≈60fps</span></div>
 </div>
 </div>
 </div>

 {/* 执行方法回退链 */}
 <div className="mt-6">
 <h2 className="text-lg font-semibold mb-3">执行方法回退链</h2>
 <div className="flex items-center gap-4">
 {['lydell-node-pty', 'node-pty', 'child_process'].map((method, i) => (
 <Fragment key={method}>
 <div
 className={`px-4 py-2 rounded ${
 executionMethod === method
 ? 'bg-[var(--color-success)] ring-2 ring-[var(--color-success)]'
 : ' bg-elevated'
 }`}
 >
 {method}
 </div>
 {i < 2 && (
 <span className="text-dim">
 <span className="text-heading">fail</span> →
 </span>
 )}
 </Fragment>
 ))}
 </div>
 </div>

 {/* 中止流程说明 */}
 <div className="mt-6 p-4 bg-surface rounded">
 <h3 className="text-md font-semibold mb-2">中止处理流程</h3>
 <div className="text-sm text-body space-y-1">
 <div>1. 发送 <span className="text-heading">SIGINT</span> 信号</div>
 <div>2. 等待 <span className="text-heading">{CONSTANTS.SIGKILL_TIMEOUT_MS}ms</span></div>
 <div>3. 如果进程未终止，发送 <span className="text-heading">SIGKILL</span></div>
 <div>4. Unix: <code className="text-heading">kill(-pid)</code> 终止进程组</div>
 <div>5. Windows: <code className="text-heading">taskkill /pid /f /t</code></div>
 </div>
 </div>
 </div>
 );
}
