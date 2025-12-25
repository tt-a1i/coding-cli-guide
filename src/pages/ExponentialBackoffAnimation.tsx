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
            error: '触发配额回退: Pro → Generic → Qwen',
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
    if (status === 200) return 'text-green-400 bg-green-900/30';
    if (status === 429) return 'text-orange-400 bg-orange-900/30';
    if (status >= 500) return 'text-red-400 bg-red-900/30';
    return 'text-gray-400 bg-gray-800';
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'requesting': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'backoff': return 'bg-yellow-500';
      case 'fallback': return 'bg-purple-500';
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-100">指数退避重试系统</h1>
      <p className="text-gray-400 mb-6">
        展示指数退避、抖动计算、Retry-After 处理和配额回退机制
      </p>

      {/* Configuration */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-800 rounded-lg">
          <label className="text-xs text-gray-500 block mb-1">最大重试次数</label>
          <input
            type="number"
            value={config.maxAttempts}
            onChange={(e) => setConfig(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 5 }))}
            disabled={isRunning}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm"
          />
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <label className="text-xs text-gray-500 block mb-1">初始延迟 (ms)</label>
          <input
            type="number"
            value={config.initialDelayMs}
            onChange={(e) => setConfig(prev => ({ ...prev, initialDelayMs: parseInt(e.target.value) || 1000 }))}
            disabled={isRunning}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm"
          />
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <label className="text-xs text-gray-500 block mb-1">最大延迟 (ms)</label>
          <input
            type="number"
            value={config.maxDelayMs}
            onChange={(e) => setConfig(prev => ({ ...prev, maxDelayMs: parseInt(e.target.value) || 30000 }))}
            disabled={isRunning}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm"
          />
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <label className="text-xs text-gray-500 block mb-1">抖动百分比</label>
          <input
            type="number"
            step="0.1"
            value={config.jitterPercent}
            onChange={(e) => setConfig(prev => ({ ...prev, jitterPercent: parseFloat(e.target.value) || 0.3 }))}
            disabled={isRunning}
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as keyof typeof ERROR_SCENARIOS)}
          disabled={isRunning}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
        >
          {Object.entries(ERROR_SCENARIOS).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isRunning}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
        >
          <option value={0.5}>0.5x 速度</option>
          <option value={1}>1x 速度</option>
          <option value={2}>2x 速度</option>
          <option value={4}>4x 速度</option>
        </select>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-sm font-medium transition-colors"
        >
          {isRunning ? '运行中...' : '开始模拟'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 text-sm transition-colors"
        >
          重置
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">当前阶段</div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getPhaseColor()} ${phase === 'requesting' || phase === 'backoff' ? 'animate-pulse' : ''}`} />
            <span className="text-gray-200 font-medium">
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
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">尝试次数</div>
          <div className="text-2xl font-bold text-gray-200">
            {currentAttempt} / {config.maxAttempts}
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">当前延迟</div>
          <div className="text-2xl font-bold text-gray-200">
            {currentDelay.toLocaleString()}ms
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">连续 429</div>
          <div className={`text-2xl font-bold ${consecutive429 >= 2 ? 'text-orange-400' : 'text-gray-200'}`}>
            {consecutive429}
            {consecutive429 >= 2 && <span className="text-sm ml-2">触发回退!</span>}
          </div>
        </div>
      </div>

      {/* Countdown Bar */}
      {phase === 'backoff' && countdown > 0 && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-sm">退避等待中...</span>
            <span className="text-yellow-300 font-mono">{countdown}ms</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-100"
              style={{ width: `${(countdown / currentDelay) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Attempt Timeline */}
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">重试时间线</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {attempts.map((attempt, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-l-4 ${
                attempt.action === 'success' ? 'border-green-500 bg-green-900/20' :
                attempt.action === 'fail' ? 'border-red-500 bg-red-900/20' :
                attempt.action === 'fallback' ? 'border-purple-500 bg-purple-900/20' :
                attempt.action === 'backoff' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-gray-600 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">@{attempt.timestamp}ms</span>
                  {attempt.status > 0 && (
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(attempt.status)}`}>
                      {attempt.status}
                    </span>
                  )}
                  {attempt.error && (
                    <span className="text-xs text-gray-400">{attempt.error}</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  attempt.action === 'success' ? 'bg-green-800 text-green-300' :
                  attempt.action === 'fail' ? 'bg-red-800 text-red-300' :
                  attempt.action === 'fallback' ? 'bg-purple-800 text-purple-300' :
                  attempt.action === 'backoff' ? 'bg-yellow-800 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {attempt.action === 'request' ? '请求' :
                   attempt.action === 'backoff' ? '退避' :
                   attempt.action === 'fallback' ? '回退' :
                   attempt.action === 'success' ? '成功' : '失败'}
                </span>
              </div>

              {attempt.action === 'backoff' && (
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="p-2 bg-black/30 rounded">
                    <span className="text-gray-500">基础延迟:</span>
                    <span className="ml-2 text-gray-300">{attempt.delay}ms</span>
                  </div>
                  <div className="p-2 bg-black/30 rounded">
                    <span className="text-gray-500">抖动:</span>
                    <span className={`ml-2 ${attempt.jitter && attempt.jitter > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {attempt.jitter && attempt.jitter > 0 ? '+' : ''}{attempt.jitter}ms
                    </span>
                  </div>
                  <div className="p-2 bg-black/30 rounded">
                    <span className="text-gray-500">实际延迟:</span>
                    <span className="ml-2 text-yellow-300">{attempt.delayWithJitter}ms</span>
                  </div>
                  {attempt.retryAfter && (
                    <div className="col-span-3 p-2 bg-orange-900/30 rounded">
                      <span className="text-orange-400">Retry-After 头:</span>
                      <span className="ml-2 text-orange-300">{attempt.retryAfter}ms</span>
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
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600/50 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">配额回退已触发</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-gray-400">Pro 配额</span>
            </div>
            <span className="text-gray-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400">Generic 配额</span>
            </div>
            <span className="text-gray-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-gray-300 font-medium">Qwen 限流</span>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">指数退避公式</h4>
          <div className="font-mono text-xs text-gray-300 space-y-2">
            <div className="p-2 bg-black/30 rounded">
              <span className="text-blue-400">delay</span> = min(maxDelay, initialDelay × 2<sup>attempt</sup>)
            </div>
            <div className="p-2 bg-black/30 rounded">
              <span className="text-yellow-400">jitter</span> = delay × jitterPercent × random(-1, 1)
            </div>
            <div className="p-2 bg-black/30 rounded">
              <span className="text-green-400">actualDelay</span> = max(0, delay + jitter)
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">回退触发条件</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-black/30 rounded flex items-center gap-2">
              <span className="text-orange-400">429</span>
              <span className="text-gray-500">×2 连续 →</span>
              <span className="text-purple-400">触发 onPersistent429</span>
            </div>
            <div className="p-2 bg-black/30 rounded text-gray-400">
              回退后重置: attempt=0, 429Count=0, delay=initial
            </div>
            <div className="p-2 bg-black/30 rounded text-gray-400">
              回退顺序: Pro → Generic → Qwen Throttling
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">延迟增长可视化</h3>
        <div className="flex items-end gap-2 h-24">
          {Array.from({ length: config.maxAttempts }).map((_, idx) => {
            const delay = Math.min(config.maxDelayMs, config.initialDelayMs * Math.pow(2, idx));
            const height = (delay / config.maxDelayMs) * 100;
            const isActive = idx < currentAttempt;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isActive ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">{idx + 1}</span>
                <span className="text-xs text-gray-600 font-mono">
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
