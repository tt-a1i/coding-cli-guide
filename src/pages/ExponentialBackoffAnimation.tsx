import { useState, useCallback, useRef } from 'react';

type RetryPhase = 'idle' | 'requesting' | 'error' | 'backoff' | 'retrying' | 'fallback' | 'success' | 'failed';

interface RetryAttempt {
 attempt: number;
 timestamp: number;
 status: number;
 error?: string;
 delay?: number;
 delayWithJitter?: number;
 jitter?: number;
 retryAfter?: number;
 action: 'request' | 'backoff' | 'fallback' | 'success' | 'fail';
}

interface RetryConfig {
 maxAttempts: number;
 initialDelayMs: number;
 maxDelayMs: number;
 jitterPercent: number;
}

const DEFAULT_CONFIG: RetryConfig = {
 maxAttempts: 5,
 initialDelayMs: 1000,
 maxDelayMs: 30000,
 jitterPercent: 0.3,
};

// Error scenarios for simulation
interface ErrorScenario {
 name: string;
 sequence: number[];
 retryAfter?: number;
}

const ERROR_SCENARIOS: Record<string, ErrorScenario> = {
 'success_first': { name: '首次成功', sequence: [200] },
 'success_second': { name: '第二次成功', sequence: [500, 200] },
 'rate_limit': { name: '429 限流', sequence: [429, 429, 200] },
 'rate_limit_fallback': { name: '429 触发回退', sequence: [429, 429, 429, 200] },
 'server_error': { name: '服务器错误恢复', sequence: [503, 503, 200] },
 'all_fail': { name: '全部失败', sequence: [500, 500, 500, 500, 500] },
 'retry_after': { name: 'Retry-After 头', sequence: [429, 429, 200], retryAfter: 5000 },
};

export default function ExponentialBackoffAnimation() {
 const [phase, setPhase] = useState<RetryPhase>('idle');
 const [config, setConfig] = useState<RetryConfig>(DEFAULT_CONFIG);
 const [scenario, setScenario] = useState<keyof typeof ERROR_SCENARIOS>('success_second');
 const [attempts, setAttempts] = useState<RetryAttempt[]>([]);
 const [currentAttempt, setCurrentAttempt] = useState(0);
 const [currentDelay, setCurrentDelay] = useState(0);
 const [countdown, setCountdown] = useState(0);
 const [consecutive429, setConsecutive429] = useState(0);
 const [fallbackTriggered, setFallbackTriggered] = useState(false);
 const [isRunning, setIsRunning] = useState(false);
 const [speed, setSpeed] = useState(1);

 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 const sleep = (ms: number) => new Promise(resolve => {
 timeoutRef.current = setTimeout(resolve, ms / speed);
 });

 const calculateJitter = useCallback((delay: number): { jitter: number; delayWithJitter: number } => {
 const jitterRange = delay * config.jitterPercent;
 const jitter = jitterRange * (Math.random() * 2 - 1);
 const delayWithJitter = Math.max(0, delay + jitter);
 return { jitter: Math.round(jitter), delayWithJitter: Math.round(delayWithJitter) };
 }, [config.jitterPercent]);

 const runSimulation = useCallback(async () => {
 if (isRunning) return;

 setIsRunning(true);
 setAttempts([]);
 setCurrentAttempt(0);
 setCurrentDelay(config.initialDelayMs);
 setConsecutive429(0);
 setFallbackTriggered(false);
 setCountdown(0);

 const scenarioData = ERROR_SCENARIOS[scenario];
 let delay = config.initialDelayMs;
 let count429 = 0;
 let attempt = 0;
 const startTime = Date.now();

 while (attempt < config.maxAttempts) {
 // Request phase
 setPhase('requesting');
 setCurrentAttempt(attempt + 1);
 await sleep(500);

 const status = scenarioData.sequence[Math.min(attempt, scenarioData.sequence.length - 1)];

 if (status === 200) {
 // Success
 const successAttempt: RetryAttempt = {
 attempt: attempt + 1,
 timestamp: Date.now() - startTime,
 status: 200,
 action: 'success',
 };
 setAttempts(prev => [...prev, successAttempt]);
 setPhase('success');
 setIsRunning(false);
 return;
 }

 // Error occurred
 setPhase('error');
 const errorAttempt: RetryAttempt = {
 attempt: attempt + 1,
 timestamp: Date.now() - startTime,
 status,
 error: status === 429 ? 'Rate Limited' : status === 503 ? 'Service Unavailable' : 'Server Error',
 action: 'request',
 };
 setAttempts(prev => [...prev, errorAttempt]);
 await sleep(400);

 // Track 429s
 if (status === 429) {
 count429++;
 setConsecutive429(count429);

 // Check for fallback trigger
 if (count429 >= 2) {
 setPhase('fallback');
 setFallbackTriggered(true);
 const fallbackAttempt: RetryAttempt = {
 attempt: attempt + 1,
 timestamp: Date.now() - startTime,
 status: 429,
 action: 'fallback',
 error: '触发配额回退: Pro → Generic → Gemini',
 };
 setAttempts(prev => [...prev, fallbackAttempt]);
 await sleep(800);

 // Reset counters after fallback
 count429 = 0;
 setConsecutive429(0);
 attempt = 0;
 delay = config.initialDelayMs;
 continue;
 }
 } else {
 count429 = 0;
 setConsecutive429(0);
 }

 attempt++;
 if (attempt >= config.maxAttempts) break;

 // Calculate backoff
 let effectiveDelay = delay;
 if (status === 429 && scenarioData.retryAfter) {
 effectiveDelay = scenarioData.retryAfter;
 }

 const { jitter, delayWithJitter } = calculateJitter(effectiveDelay);
 setCurrentDelay(effectiveDelay);

 const backoffAttempt: RetryAttempt = {
 attempt,
 timestamp: Date.now() - startTime,
 status,
 delay: effectiveDelay,
 delayWithJitter,
 jitter,
 retryAfter: status === 429 && scenarioData.retryAfter ? scenarioData.retryAfter : undefined,
 action: 'backoff',
 };
 setAttempts(prev => [...prev, backoffAttempt]);

 // Backoff countdown
 setPhase('backoff');
 const countdownSteps = Math.ceil(delayWithJitter / 100);
 for (let i = countdownSteps; i >= 0; i--) {
 setCountdown(Math.round((i / countdownSteps) * delayWithJitter));
 await sleep(100);
 }
 setCountdown(0);

 // Double delay for next attempt
 delay = Math.min(config.maxDelayMs, delay * 2);
 setCurrentDelay(delay);
 }

 // All attempts exhausted
 const failAttempt: RetryAttempt = {
 attempt: config.maxAttempts,
 timestamp: Date.now() - startTime,
 status: 0,
 action: 'fail',
 error: '已达最大重试次数',
 };
 setAttempts(prev => [...prev, failAttempt]);
 setPhase('failed');
 setIsRunning(false);
 }, [isRunning, config, scenario, calculateJitter, speed]);

 const reset = () => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 if (timeoutRef.current) clearTimeout(timeoutRef.current);
 setPhase('idle');
 setAttempts([]);
 setCurrentAttempt(0);
 setCurrentDelay(0);
 setCountdown(0);
 setConsecutive429(0);
 setFallbackTriggered(false);
 setIsRunning(false);
 };

 const getStatusColor = (status: number) => {
 if (status === 200) return 'text-heading bg-elevated';
 if (status === 429) return 'text-heading bg-elevated';
 if (status >= 500) return 'text-heading bg-elevated';
 return 'text-body bg-surface';
 };

 const getPhaseColor = () => {
 switch (phase) {
 case 'requesting': return ' bg-elevated';
 case 'error': return 'bg-[var(--color-danger)]';
 case 'backoff': return 'bg-[var(--color-warning)]';
 case 'fallback': return ' bg-elevated';
 case 'success': return 'bg-[var(--color-success)]';
 case 'failed': return 'bg-[var(--color-danger)]';
 default: return ' bg-elevated';
 }
 };

 return (
 <div className="p-6 max-w-6xl mx-auto">
 <h1 className="text-2xl font-bold mb-2 text-heading">指数退避重试系统</h1>
 <p className="text-body mb-6">
 展示指数退避、抖动计算、Retry-After 处理和配额回退机制
 </p>

 {/* Configuration */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="p-3 bg-surface rounded-lg">
 <label className="text-xs text-dim block mb-1">最大重试次数</label>
 <input
 type="number"
 value={config.maxAttempts}
 onChange={(e) => setConfig(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 5 }))}
 disabled={isRunning}
 className="w-full bg-base border border-edge rounded px-2 py-1 text-heading text-sm"
 />
 </div>
 <div className="p-3 bg-surface rounded-lg">
 <label className="text-xs text-dim block mb-1">初始延迟 (ms)</label>
 <input
 type="number"
 value={config.initialDelayMs}
 onChange={(e) => setConfig(prev => ({ ...prev, initialDelayMs: parseInt(e.target.value) || 1000 }))}
 disabled={isRunning}
 className="w-full bg-base border border-edge rounded px-2 py-1 text-heading text-sm"
 />
 </div>
 <div className="p-3 bg-surface rounded-lg">
 <label className="text-xs text-dim block mb-1">最大延迟 (ms)</label>
 <input
 type="number"
 value={config.maxDelayMs}
 onChange={(e) => setConfig(prev => ({ ...prev, maxDelayMs: parseInt(e.target.value) || 30000 }))}
 disabled={isRunning}
 className="w-full bg-base border border-edge rounded px-2 py-1 text-heading text-sm"
 />
 </div>
 <div className="p-3 bg-surface rounded-lg">
 <label className="text-xs text-dim block mb-1">抖动百分比</label>
 <input
 type="number"
 step="0.1"
 value={config.jitterPercent}
 onChange={(e) => setConfig(prev => ({ ...prev, jitterPercent: parseFloat(e.target.value) || 0.3 }))}
 disabled={isRunning}
 className="w-full bg-base border border-edge rounded px-2 py-1 text-heading text-sm"
 />
 </div>
 </div>

 {/* Controls */}
 <div className="flex flex-wrap gap-3 mb-6">
 <select
 value={scenario}
 onChange={(e) => setScenario(e.target.value as keyof typeof ERROR_SCENARIOS)}
 disabled={isRunning}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 {Object.entries(ERROR_SCENARIOS).map(([key, value]) => (
 <option key={key} value={key}>{value.name}</option>
 ))}
 </select>
 <select
 value={speed}
 onChange={(e) => setSpeed(Number(e.target.value))}
 disabled={isRunning}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 <option value={0.5}>0.5x 速度</option>
 <option value={1}>1x 速度</option>
 <option value={2}>2x 速度</option>
 <option value={4}>4x 速度</option>
 </select>
 <button
 onClick={runSimulation}
 disabled={isRunning}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm font-medium transition-colors"
 >
 {isRunning ? '运行中...' : '开始模拟'}
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-elevated hover:bg-elevated rounded text-heading text-sm transition-colors"
 >
 重置
 </button>
 </div>

 {/* Current Status */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim mb-1">当前阶段</div>
 <div className="flex items-center gap-2">
 <span className={`w-3 h-3 rounded-full ${getPhaseColor()} ${phase === 'requesting' || phase === 'backoff' ? 'animate-pulse' : ''}`} />
 <span className="text-heading font-medium">
 {phase === 'idle' ? '待命' :
 phase === 'requesting' ? '请求中' :
 phase === 'error' ? '错误' :
 phase === 'backoff' ? '退避等待' :
 phase === 'fallback' ? '配额回退' :
 phase === 'success' ? '成功' :
 phase === 'failed' ? '失败' : phase}
 </span>
 </div>
 </div>
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim mb-1">尝试次数</div>
 <div className="text-2xl font-bold text-heading">
 {currentAttempt} / {config.maxAttempts}
 </div>
 </div>
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim mb-1">当前延迟</div>
 <div className="text-2xl font-bold text-heading">
 {currentDelay.toLocaleString()}ms
 </div>
 </div>
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim mb-1">连续 429</div>
 <div className={`text-2xl font-bold ${consecutive429 >= 2 ? 'text-heading' : 'text-heading'}`}>
 {consecutive429}
 {consecutive429 >= 2 && <span className="text-sm ml-2">触发回退!</span>}
 </div>
 </div>
 </div>

 {/* Countdown Bar */}
 {phase === 'backoff' && countdown > 0 && (
 <div className="mb-6 p-4 bg-elevated border-l-2 border-l-edge-hover/40 rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <span className="text-heading text-sm">退避等待中...</span>
 <span className="text-heading font-mono">{countdown}ms</span>
 </div>
 <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--color-warning)] transition-all duration-100"
 style={{ width: `${(countdown / currentDelay) * 100}%` }}
 />
 </div>
 </div>
 )}

 {/* Attempt Timeline */}
 <div className="p-4 bg-base rounded-lg border border-edge mb-6">
 <h3 className="text-sm font-semibold text-body mb-4">重试时间线</h3>
 <div className="space-y-2 max-h-80 overflow-y-auto">
 {attempts.map((attempt, idx) => (
 <div
 key={idx}
 className={`p-3 rounded-lg border-l-2 ${
 attempt.action === 'success' ? 'border-edge bg-elevated' :
 attempt.action === 'fail' ? 'border-edge bg-elevated' :
 attempt.action === 'fallback' ? ' border-edge bg-elevated' :
 attempt.action === 'backoff' ? 'border-edge bg-elevated' :
 ' border-edge bg-surface'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <span className="text-xs text-dim">@{attempt.timestamp}ms</span>
 {attempt.status > 0 && (
 <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(attempt.status)}`}>
 {attempt.status}
 </span>
 )}
 {attempt.error && (
 <span className="text-xs text-body">{attempt.error}</span>
 )}
 </div>
 <span className={`text-xs px-2 py-0.5 rounded ${
 attempt.action === 'success' ? 'bg-elevated text-heading' :
 attempt.action === 'fail' ? 'bg-elevated text-heading' :
 attempt.action === 'fallback' ? ' bg-elevated text-heading' :
 attempt.action === 'backoff' ? 'bg-elevated text-heading' :
 ' bg-elevated text-body'
 }`}>
 {attempt.action === 'request' ? '请求' :
 attempt.action === 'backoff' ? '退避' :
 attempt.action === 'fallback' ? '回退' :
 attempt.action === 'success' ? '成功' : '失败'}
 </span>
 </div>

 {attempt.action === 'backoff' && (
 <div className="grid grid-cols-3 gap-2 text-xs mt-2">
 <div className="p-2 bg-base/30 rounded">
 <span className="text-dim">基础延迟:</span>
 <span className="ml-2 text-body">{attempt.delay}ms</span>
 </div>
 <div className="p-2 bg-base/30 rounded">
 <span className="text-dim">抖动:</span>
 <span className={`ml-2 ${attempt.jitter && attempt.jitter > 0 ? 'text-heading' : 'text-heading'}`}>
 {attempt.jitter && attempt.jitter > 0 ? '+' : ''}{attempt.jitter}ms
 </span>
 </div>
 <div className="p-2 bg-base/30 rounded">
 <span className="text-dim">实际延迟:</span>
 <span className="ml-2 text-heading">{attempt.delayWithJitter}ms</span>
 </div>
 {attempt.retryAfter && (
 <div className="col-span-3 p-2 bg-elevated rounded">
 <span className="text-heading">Retry-After 头:</span>
 <span className="ml-2 text-heading">{attempt.retryAfter}ms</span>
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Fallback Status */}
 {fallbackTriggered && (
 <div className="mb-6 p-4 bg-elevated border border-edge rounded-lg">
 <h3 className="text-sm font-semibold text-heading mb-2">配额回退已触发</h3>
 <div className="flex items-center gap-4 text-xs">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-accent" />
 <span className="text-body">Pro 配额</span>
 </div>
 <span className="text-dim">→</span>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
 <span className="text-body">Generic 配额</span>
 </div>
 <span className="text-dim">→</span>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
 <span className="text-body font-medium">Gemini 限流</span>
 </div>
 </div>
 </div>
 )}

 {/* Algorithm Reference */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 bg-surface rounded-lg">
 <h4 className="text-sm font-semibold text-body mb-3">指数退避公式</h4>
 <div className="font-mono text-xs text-body space-y-2">
 <div className="p-2 bg-base/30 rounded">
 <span className="text-heading">delay</span> = min(maxDelay, initialDelay × 2<sup>attempt</sup>)
 </div>
 <div className="p-2 bg-base/30 rounded">
 <span className="text-heading">jitter</span> = delay × jitterPercent × random(-1, 1)
 </div>
 <div className="p-2 bg-base/30 rounded">
 <span className="text-heading">actualDelay</span> = max(0, delay + jitter)
 </div>
 </div>
 </div>
 <div className="p-4 bg-surface rounded-lg">
 <h4 className="text-sm font-semibold text-body mb-3">回退触发条件</h4>
 <div className="space-y-2 text-xs">
 <div className="p-2 bg-base/30 rounded flex items-center gap-2">
 <span className="text-heading">429</span>
 <span className="text-dim">×2 连续 →</span>
 <span className="text-heading">触发 onPersistent429</span>
 </div>
 <div className="p-2 bg-base/30 rounded text-body">
 回退后重置: attempt=0, 429Count=0, delay=initial
 </div>
 <div className="p-2 bg-base/30 rounded text-body">
 回退顺序: Pro → Generic → Gemini Throttling
 </div>
 </div>
 </div>
 </div>

 {/* Visual Timeline */}
 <div className="mt-6 p-4 bg-surface rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-4">延迟增长可视化</h3>
 <div className="flex items-end gap-2 h-24">
 {Array.from({ length: config.maxAttempts }).map((_, idx) => {
 const delay = Math.min(config.maxDelayMs, config.initialDelayMs * Math.pow(2, idx));
 const height = (delay / config.maxDelayMs) * 100;
 const isActive = idx < currentAttempt;
 return (
 <div key={idx} className="flex-1 flex flex-col items-center gap-1">
 <div
 className={`w-full rounded-t transition-all duration-300 ${
 isActive ? ' bg-elevated' : ' bg-elevated'
 }`}
 style={{ height: `${height}%` }}
 />
 <span className="text-xs text-dim">{idx + 1}</span>
 <span className="text-xs text-dim font-mono">
 {delay >= 1000 ? `${delay / 1000}s` : `${delay}ms`}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}
