import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * SharedTokenManager 动画
 *
 * 可视化 sharedTokenManager.ts 的核心逻辑：
 * 1. 跨进程文件锁机制 (acquireLock/releaseLock)
 * 2. Token 刷新与缓存失效
 * 3. 内存缓存与文件修改时间追踪
 * 4. 指数退避重试策略
 *
 * 源码位置:
 * - packages/core/src/innies/sharedTokenManager.ts
 */

// 配置常量
const CONFIG = {
  TOKEN_REFRESH_BUFFER_MS: 5 * 60 * 1000, // 5分钟
  LOCK_TIMEOUT_MS: 10000, // 10秒
  CACHE_CHECK_INTERVAL_MS: 5000, // 5秒
  MAX_ATTEMPTS: 20,
  ATTEMPT_INTERVAL: 100,
  MAX_INTERVAL: 2000,
};

// Token 错误类型
type TokenError = 'REFRESH_FAILED' | 'NO_REFRESH_TOKEN' | 'LOCK_TIMEOUT' | 'FILE_ACCESS_ERROR' | 'NETWORK_ERROR';

const TokenErrors = {
  REFRESH_FAILED: 'REFRESH_FAILED' as TokenError,
  NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN' as TokenError,
  LOCK_TIMEOUT: 'LOCK_TIMEOUT' as TokenError,
  FILE_ACCESS_ERROR: 'FILE_ACCESS_ERROR' as TokenError,
  NETWORK_ERROR: 'NETWORK_ERROR' as TokenError,
};

interface MemoryCache {
  credentials: {
    access_token: string;
    expiry_date: number;
    refresh_token: string;
  } | null;
  fileModTime: number;
  lastCheck: number;
}

interface ProcessState {
  id: string;
  name: string;
  action: string;
  hasLock: boolean;
  waitingForLock: boolean;
  attempt: number;
  interval: number;
}

interface AnimationState {
  phase: 'idle' | 'checking_cache' | 'acquiring_lock' | 'refreshing' | 'saving' | 'releasing' | 'done' | 'error';
  memoryCache: MemoryCache;
  lockFile: { exists: boolean; ownerId: string | null; age: number };
  processes: ProcessState[];
  currentProcess: string | null;
  message: string;
  errorType: TokenError | null;
}

export default function SharedTokenManagerAnimation() {
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<'single' | 'concurrent' | 'stale_lock' | 'network_error'>('single');
  const [state, setState] = useState<AnimationState>({
    phase: 'idle',
    memoryCache: {
      credentials: {
        access_token: 'old_token_abc123',
        expiry_date: Date.now() - 60000, // 已过期
        refresh_token: 'refresh_xyz789',
      },
      fileModTime: Date.now() - 300000,
      lastCheck: Date.now() - 10000,
    },
    lockFile: { exists: false, ownerId: null, age: 0 },
    processes: [
      { id: 'P1', name: 'CLI 进程 1', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
    ],
    currentProcess: null,
    message: '点击开始演示 Token 管理流程',
    errorType: null,
  });

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runAnimation = useCallback(async () => {
    setIsRunning(true);

    // 根据场景初始化
    const initialProcesses: ProcessState[] = scenario === 'concurrent' ? [
      { id: 'P1', name: 'CLI 进程 1', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
      { id: 'P2', name: 'CLI 进程 2', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
      { id: 'P3', name: 'CLI 进程 3', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
    ] : [
      { id: 'P1', name: 'CLI 进程 1', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
    ];

    const initialLock = scenario === 'stale_lock'
      ? { exists: true, ownerId: 'dead_process', age: 15000 }
      : { exists: false, ownerId: null, age: 0 };

    setState(s => ({
      ...s,
      phase: 'checking_cache',
      processes: initialProcesses,
      lockFile: initialLock,
      message: '检查内存缓存...',
    }));
    await sleep(800);

    // 阶段1: 检查缓存
    setState(s => ({
      ...s,
      currentProcess: 'P1',
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '检查缓存有效性' } : p
      ),
      message: '检查 Token 是否过期: Date.now() < expiry_date - 5min',
    }));
    await sleep(1000);

    // Token 已过期，需要刷新
    setState(s => ({
      ...s,
      message: '⚠️ Token 已过期，需要刷新',
    }));
    await sleep(800);

    // 阶段2: 尝试获取锁
    setState(s => ({
      ...s,
      phase: 'acquiring_lock',
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '尝试获取文件锁', waitingForLock: true, attempt: 1 } : p
      ),
      message: '尝试创建锁文件: fs.writeFile(lockPath, lockId, { flag: "wx" })',
    }));
    await sleep(800);

    // 处理过期锁场景
    if (scenario === 'stale_lock') {
      setState(s => ({
        ...s,
        message: '⚠️ 发现锁文件已存在，检查锁龄...',
      }));
      await sleep(800);

      setState(s => ({
        ...s,
        message: `锁龄: ${s.lockFile.age}ms > LOCK_TIMEOUT: ${CONFIG.LOCK_TIMEOUT_MS}ms，锁已过期`,
      }));
      await sleep(800);

      setState(s => ({
        ...s,
        lockFile: { exists: false, ownerId: null, age: 0 },
        message: '移除过期锁: fs.rename(lockPath, tempPath) → fs.unlink(tempPath)',
      }));
      await sleep(800);
    }

    // 并发场景
    if (scenario === 'concurrent') {
      setState(s => ({
        ...s,
        processes: s.processes.map(p =>
          p.id !== 'P1' ? { ...p, action: '尝试获取锁', waitingForLock: true, attempt: 1 } : p
        ),
        message: '多个进程同时尝试获取锁...',
      }));
      await sleep(600);
    }

    // P1 获取锁成功
    setState(s => ({
      ...s,
      lockFile: { exists: true, ownerId: 'P1', age: 0 },
      processes: s.processes.map(p =>
        p.id === 'P1'
          ? { ...p, action: '获取锁成功', hasLock: true, waitingForLock: false }
          : { ...p, action: '锁已被占用，等待...', waitingForLock: true }
      ),
      message: 'P1 成功获取锁，其他进程进入等待状态',
    }));
    await sleep(800);

    // 展示指数退避
    if (scenario === 'concurrent') {
      for (let attempt = 2; attempt <= 4; attempt++) {
        setState(s => ({
          ...s,
          processes: s.processes.map(p => {
            if (p.id !== 'P1' && p.waitingForLock) {
              const newInterval = Math.min(p.interval * 1.5, CONFIG.MAX_INTERVAL);
              return { ...p, attempt, interval: Math.round(newInterval), action: `重试 #${attempt}，间隔 ${Math.round(newInterval)}ms` };
            }
            return p;
          }),
          message: `指数退避: interval = min(${Math.round(CONFIG.ATTEMPT_INTERVAL * Math.pow(1.5, attempt - 1))}ms, ${CONFIG.MAX_INTERVAL}ms)`,
        }));
        await sleep(500);
      }
    }

    // 阶段3: 刷新 Token
    setState(s => ({
      ...s,
      phase: 'refreshing',
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '调用 refreshAccessToken()' } : p
      ),
      message: '调用 OAuth2 服务刷新 Token...',
    }));
    await sleep(1000);

    // 网络错误场景
    if (scenario === 'network_error') {
      setState(s => ({
        ...s,
        phase: 'error',
        errorType: TokenErrors.NETWORK_ERROR,
        message: '❌ 网络错误: 请求超时',
      }));
      await sleep(1000);

      setState(s => ({
        ...s,
        phase: 'releasing',
        processes: s.processes.map(p =>
          p.id === 'P1' ? { ...p, action: '释放锁（finally 块）' } : p
        ),
        lockFile: { exists: false, ownerId: null, age: 0 },
        message: 'finally 块确保锁被释放: await releaseLock(lockPath)',
      }));
      await sleep(800);

      setState(s => ({
        ...s,
        phase: 'done',
        processes: s.processes.map(p => ({ ...p, action: '错误已处理', hasLock: false, waitingForLock: false })),
        message: '抛出 TokenManagerError(NETWORK_ERROR)',
      }));
      setIsRunning(false);
      return;
    }

    // Token 刷新成功
    const newExpiry = Date.now() + 3600000;
    setState(s => ({
      ...s,
      memoryCache: {
        ...s.memoryCache,
        credentials: {
          access_token: 'new_token_def456',
          expiry_date: newExpiry,
          refresh_token: 'refresh_xyz789',
        },
      },
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '收到新 Token' } : p
      ),
      message: `刷新成功！新 Token 有效期: ${new Date(newExpiry).toLocaleTimeString()}`,
    }));
    await sleep(800);

    // 阶段4: 保存到文件
    setState(s => ({
      ...s,
      phase: 'saving',
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '原子写入凭证文件' } : p
      ),
      message: '原子写入: writeFile(tempPath) → rename(tempPath, filePath)',
    }));
    await sleep(800);

    setState(s => ({
      ...s,
      memoryCache: {
        ...s.memoryCache,
        fileModTime: Date.now(),
        lastCheck: Date.now(),
      },
      message: '更新 fileModTime 缓存时间戳',
    }));
    await sleep(600);

    // 阶段5: 释放锁
    setState(s => ({
      ...s,
      phase: 'releasing',
      processes: s.processes.map(p =>
        p.id === 'P1' ? { ...p, action: '释放文件锁' } : p
      ),
      message: '释放锁: fs.unlink(lockPath)',
    }));
    await sleep(600);

    setState(s => ({
      ...s,
      lockFile: { exists: false, ownerId: null, age: 0 },
      processes: s.processes.map(p =>
        p.id === 'P1'
          ? { ...p, action: '完成', hasLock: false }
          : { ...p, action: '检测到文件更新', waitingForLock: false }
      ),
    }));
    await sleep(600);

    // 并发场景: 其他进程检测到文件更新
    if (scenario === 'concurrent') {
      setState(s => ({
        ...s,
        processes: s.processes.map(p =>
          p.id !== 'P1' ? { ...p, action: '从文件重新加载凭证' } : p
        ),
        message: '其他进程通过 forceFileCheck() 检测到文件更新，直接复用新 Token',
      }));
      await sleep(800);

      setState(s => ({
        ...s,
        processes: s.processes.map(p => ({ ...p, action: '使用新 Token', waitingForLock: false })),
        message: '所有进程现在使用相同的有效 Token',
      }));
      await sleep(600);
    }

    // 完成
    setState(s => ({
      ...s,
      phase: 'done',
      message: '✅ Token 刷新流程完成',
    }));
    setIsRunning(false);
  }, [scenario]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const reset = () => {
    setIsRunning(false);
    setState({
      phase: 'idle',
      memoryCache: {
        credentials: {
          access_token: 'old_token_abc123',
          expiry_date: Date.now() - 60000,
          refresh_token: 'refresh_xyz789',
        },
        fileModTime: Date.now() - 300000,
        lastCheck: Date.now() - 10000,
      },
      lockFile: { exists: false, ownerId: null, age: 0 },
      processes: [
        { id: 'P1', name: 'CLI 进程 1', action: '空闲', hasLock: false, waitingForLock: false, attempt: 0, interval: 100 },
      ],
      currentProcess: null,
      message: '点击开始演示 Token 管理流程',
      errorType: null,
    });
  };

  const phaseColors: Record<AnimationState['phase'], string> = {
    idle: 'bg-gray-800',
    checking_cache: 'bg-blue-900/50',
    acquiring_lock: 'bg-yellow-900/50',
    refreshing: 'bg-purple-900/50',
    saving: 'bg-cyan-900/50',
    releasing: 'bg-green-900/50',
    done: 'bg-emerald-900/50',
    error: 'bg-red-900/50',
  };

  const phaseLabels: Record<AnimationState['phase'], string> = {
    idle: '空闲',
    checking_cache: '检查缓存',
    acquiring_lock: '获取锁',
    refreshing: '刷新 Token',
    saving: '保存文件',
    releasing: '释放锁',
    done: '完成',
    error: '错误',
  };

  return (
    <div className="space-y-6">
      {/* 标题和说明 */}
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">SharedTokenManager 分布式锁动画</h1>
        <p className="text-gray-400 text-sm">
          可视化跨进程 Token 管理：文件锁机制、Token 刷新、缓存同步、指数退避重试
        </p>
        <p className="text-gray-500 text-xs mt-1">
          源码: packages/core/src/innies/sharedTokenManager.ts
        </p>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">场景:</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as typeof scenario)}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
          >
            <option value="single">单进程刷新</option>
            <option value="concurrent">多进程并发</option>
            <option value="stale_lock">过期锁清理</option>
            <option value="network_error">网络错误</option>
          </select>
        </div>
        <button
          onClick={isRunning ? reset : runAnimation}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
          }`}
        >
          {isRunning ? '重置' : '开始演示'}
        </button>
      </div>

      {/* 当前阶段指示器 */}
      <div className={`rounded-lg p-4 ${phaseColors[state.phase]} transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">当前阶段:</span>
            <span className="text-white font-medium">{phaseLabels[state.phase]}</span>
          </div>
          {state.errorType && (
            <span className="px-2 py-1 bg-red-600/30 rounded text-red-400 text-sm">
              {state.errorType}
            </span>
          )}
        </div>
        <p className="text-cyan-300 text-sm mt-2 font-mono">{state.message}</p>
      </div>

      {/* 主要可视化区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧: 进程状态 */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            进程状态
          </h3>
          <div className="space-y-3">
            {state.processes.map((process) => (
              <div
                key={process.id}
                className={`p-3 rounded border transition-all duration-300 ${
                  process.hasLock
                    ? 'border-green-500 bg-green-900/20'
                    : process.waitingForLock
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{process.name}</span>
                  <div className="flex items-center gap-2">
                    {process.hasLock && (
                      <span className="px-2 py-0.5 bg-green-600/30 rounded text-green-400 text-xs">
                        🔒 持有锁
                      </span>
                    )}
                    {process.waitingForLock && (
                      <span className="px-2 py-0.5 bg-yellow-600/30 rounded text-yellow-400 text-xs">
                        ⏳ 等待锁
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400 text-sm">{process.action}</div>
                {process.waitingForLock && process.attempt > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    重试次数: {process.attempt} | 当前间隔: {process.interval}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧: 锁文件和缓存状态 */}
        <div className="space-y-4">
          {/* 锁文件状态 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              锁文件状态
            </h3>
            <div className="font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">路径:</span>
                <span className="text-gray-300">~/.innies/innies_oauth_creds.lock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">存在:</span>
                <span className={state.lockFile.exists ? 'text-red-400' : 'text-green-400'}>
                  {state.lockFile.exists ? '是' : '否'}
                </span>
              </div>
              {state.lockFile.exists && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">持有者:</span>
                    <span className="text-cyan-400">{state.lockFile.ownerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">锁龄:</span>
                    <span className={state.lockFile.age > CONFIG.LOCK_TIMEOUT_MS ? 'text-red-400' : 'text-gray-300'}>
                      {state.lockFile.age}ms
                      {state.lockFile.age > CONFIG.LOCK_TIMEOUT_MS && ' (已过期)'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 内存缓存状态 */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              内存缓存 (MemoryCache)
            </h3>
            <div className="font-mono text-xs space-y-2">
              <div className="p-2 bg-gray-800 rounded">
                <div className="text-gray-400 mb-1">credentials:</div>
                {state.memoryCache.credentials ? (
                  <div className="pl-2 space-y-1">
                    <div className="text-cyan-400 truncate">
                      access_token: "{state.memoryCache.credentials.access_token}"
                    </div>
                    <div className={`${
                      state.memoryCache.credentials.expiry_date > Date.now()
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      expiry_date: {new Date(state.memoryCache.credentials.expiry_date).toLocaleTimeString()}
                      {state.memoryCache.credentials.expiry_date <= Date.now() && ' (已过期)'}
                    </div>
                  </div>
                ) : (
                  <div className="pl-2 text-gray-500">null</div>
                )}
              </div>
              <div className="flex justify-between text-gray-400">
                <span>fileModTime:</span>
                <span className="text-gray-300">{new Date(state.memoryCache.fileModTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>lastCheck:</span>
                <span className="text-gray-300">{new Date(state.memoryCache.lastCheck).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 流程图 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-white font-semibold mb-4">Token 刷新流程</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {[
            { key: 'checking_cache', label: '检查缓存', icon: '🔍' },
            { key: 'acquiring_lock', label: '获取锁', icon: '🔒' },
            { key: 'refreshing', label: '刷新Token', icon: '🔄' },
            { key: 'saving', label: '保存文件', icon: '💾' },
            { key: 'releasing', label: '释放锁', icon: '🔓' },
            { key: 'done', label: '完成', icon: '✅' },
          ].map((step, i, arr) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                state.phase === step.key
                  ? 'bg-cyan-600/30 border-2 border-cyan-500 scale-110'
                  : arr.findIndex(s => s.key === state.phase) > i
                  ? 'bg-green-600/20 border border-green-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}>
                <span className="text-2xl mb-1">{step.icon}</span>
                <span className="text-xs text-gray-300 whitespace-nowrap">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                  arr.findIndex(s => s.key === state.phase) > i
                    ? 'bg-green-500'
                    : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 配置说明 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-white font-semibold mb-3">核心配置常量</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-mono">
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">TOKEN_REFRESH_BUFFER</div>
            <div className="text-cyan-400">5 分钟</div>
          </div>
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">LOCK_TIMEOUT</div>
            <div className="text-yellow-400">10 秒</div>
          </div>
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">CACHE_CHECK_INTERVAL</div>
            <div className="text-purple-400">5 秒</div>
          </div>
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">MAX_ATTEMPTS</div>
            <div className="text-orange-400">20 次</div>
          </div>
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">ATTEMPT_INTERVAL</div>
            <div className="text-green-400">100ms</div>
          </div>
          <div className="p-2 bg-gray-800 rounded">
            <div className="text-gray-400 text-xs">MAX_INTERVAL</div>
            <div className="text-red-400">2000ms</div>
          </div>
        </div>
      </div>

      {/* 关键代码片段 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-white font-semibold mb-3">关键代码逻辑</h3>
        <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-800 p-3 rounded">
{`// 获取有效凭证的核心逻辑
async getValidCredentials(inniesClient, forceRefresh = false) {
  // 1. 检查文件是否被其他进程更新
  await this.checkAndReloadIfNeeded(inniesClient);

  // 2. 如果缓存有效，直接返回
  if (!forceRefresh && this.memoryCache.credentials && this.isTokenValid(this.memoryCache.credentials)) {
    return this.memoryCache.credentials;
  }

  // 3. 需要刷新，使用分布式锁
  if (!this.refreshPromise) {
    this.refreshPromise = this.performTokenRefresh(inniesClient, forceRefresh);
  }

  return await this.refreshPromise;
}

// 指数退避锁获取
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  try {
    await fs.writeFile(lockPath, lockId, { flag: 'wx' }); // 原子创建
    return; // 成功
  } catch (error) {
    if (error.code === 'EEXIST') {
      await sleep(currentInterval);
      currentInterval = Math.min(currentInterval * 1.5, maxInterval);
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
