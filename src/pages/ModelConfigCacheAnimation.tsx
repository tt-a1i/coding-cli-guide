import { useState, useEffect, useCallback } from 'react';

interface ModelConfig {
  id: string;
  baseURL: string;
  apiKey: string;
}

interface CacheStats {
  size: number;
  lastFetchTime: number;
  isExpired: boolean;
  ttlRemaining: number;
}

interface LogEntry {
  timestamp: number;
  action: string;
  detail: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const CACHE_TTL = 10000; // 10 seconds for demo (real: 5 minutes)
const MODELS: ModelConfig[] = [
  { id: 'qwen-coder-plus', baseURL: 'https://api.qwen.ai/v1', apiKey: 'sk-***1' },
  { id: 'qwen-coder-turbo', baseURL: 'https://api.qwen.ai/v1', apiKey: 'sk-***2' },
  { id: 'gpt-4o', baseURL: 'https://api.openai.com/v1', apiKey: 'sk-***3' },
];

export default function ModelConfigCacheAnimation() {
  const [cache, setCache] = useState<Map<string, ModelConfig>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [stats, setStats] = useState<CacheStats>({
    size: 0,
    lastFetchTime: 0,
    isExpired: true,
    ttlRemaining: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queryModel, setQueryModel] = useState('qwen-coder-plus');
  const [queryResult, setQueryResult] = useState<ModelConfig | null>(null);
  const [highlightedModel, setHighlightedModel] = useState<string | null>(null);

  // Update TTL countdown every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastFetchTime;
      const remaining = Math.max(0, CACHE_TTL - elapsed);
      const isExpired = remaining === 0 || lastFetchTime === 0;

      setStats({
        size: cache.size,
        lastFetchTime,
        isExpired,
        ttlRemaining: remaining,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [cache, lastFetchTime]);

  const addLog = useCallback((action: string, detail: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [{
      timestamp: Date.now(),
      action,
      detail,
      type,
    }, ...prev].slice(0, 10));
  }, []);

  const refreshCache = useCallback(async () => {
    setIsRefreshing(true);
    addLog('refreshCache()', '开始刷新缓存...', 'info');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Clear and repopulate cache
    const newCache = new Map<string, ModelConfig>();
    for (const model of MODELS) {
      newCache.set(model.id, model);
    }

    setCache(newCache);
    setLastFetchTime(Date.now());
    setIsRefreshing(false);

    addLog('refreshCache()', `成功加载 ${MODELS.length} 个模型配置`, 'success');
  }, [addLog]);

  const getModelConfig = useCallback(async (modelId: string, forceRefresh: boolean = false) => {
    const now = Date.now();
    const isCacheExpired = now - lastFetchTime > CACHE_TTL;

    addLog('getModelConfig()', `查询模型: ${modelId}, forceRefresh: ${forceRefresh}`, 'info');

    // Check if refresh needed
    if (forceRefresh || isCacheExpired || cache.size === 0) {
      addLog('检查缓存', isCacheExpired ? '缓存已过期，需要刷新' : forceRefresh ? '强制刷新' : '缓存为空', 'warning');
      await refreshCache();
    }

    // Get from cache
    const config = cache.get(modelId);
    setHighlightedModel(modelId);
    setTimeout(() => setHighlightedModel(null), 1000);

    if (config) {
      addLog('缓存命中', `找到模型配置: ${modelId}`, 'success');
      setQueryResult(config);
      return config;
    } else {
      addLog('缓存未命中', `未找到模型: ${modelId}`, 'error');
      setQueryResult(null);
      return null;
    }
  }, [cache, lastFetchTime, refreshCache, addLog]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setLastFetchTime(0);
    setQueryResult(null);
    addLog('clearCache()', '缓存已清空', 'warning');
  }, [addLog]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const remaining = ms % 1000;
    return `${seconds}.${Math.floor(remaining / 100)}s`;
  };

  const getTtlColor = (remaining: number) => {
    const percent = (remaining / CACHE_TTL) * 100;
    if (percent > 60) return 'bg-green-500';
    if (percent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          ModelConfigCache TTL 刷新机制
        </h1>
        <p className="text-gray-400 mb-6">
          演示模型配置缓存的 TTL 过期和自动刷新逻辑
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Cache State */}
          <div className="space-y-4">
            {/* TTL Progress */}
            <div className="bg-black/40 backdrop-blur border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">⏱️</span> TTL 倒计时
              </h3>
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-100 ${getTtlColor(stats.ttlRemaining)}`}
                  style={{ width: `${(stats.ttlRemaining / CACHE_TTL) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-mono">
                  {stats.isExpired ? '已过期' : formatTime(stats.ttlRemaining)}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>TTL: {CACHE_TTL / 1000}s</span>
                <span className={stats.isExpired ? 'text-red-400' : 'text-green-400'}>
                  {stats.isExpired ? '⚠️ 需要刷新' : '✓ 缓存有效'}
                </span>
              </div>
            </div>

            {/* Cache Stats */}
            <div className="bg-black/40 backdrop-blur border border-cyan-500/30 rounded-xl p-4">
              <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">📊</span> 缓存统计
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-cyan-500/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-cyan-400">{stats.size}</div>
                  <div className="text-xs text-gray-400">缓存条目</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="text-lg font-mono text-purple-400">
                    {stats.lastFetchTime ? new Date(stats.lastFetchTime).toLocaleTimeString() : '--:--:--'}
                  </div>
                  <div className="text-xs text-gray-400">上次刷新</div>
                </div>
                <div className={`${stats.isExpired ? 'bg-red-500/10' : 'bg-green-500/10'} rounded-lg p-3`}>
                  <div className={`text-2xl ${stats.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                    {stats.isExpired ? '❌' : '✓'}
                  </div>
                  <div className="text-xs text-gray-400">缓存状态</div>
                </div>
              </div>
            </div>

            {/* Cache Content */}
            <div className="bg-black/40 backdrop-blur border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">🗄️</span> 缓存内容
              </h3>
              {cache.size === 0 ? (
                <div className="text-gray-500 text-center py-4">缓存为空</div>
              ) : (
                <div className="space-y-2">
                  {Array.from(cache.entries()).map(([id, config]) => (
                    <div
                      key={id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        highlightedModel === id
                          ? 'border-yellow-400 bg-yellow-500/20 scale-105'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-sm text-white">{config.id}</div>
                          <div className="text-xs text-gray-500 mt-1">{config.baseURL}</div>
                        </div>
                        <code className="text-xs text-gray-600">{config.apiKey}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls & Logs */}
          <div className="space-y-4">
            {/* Query Control */}
            <div className="bg-black/40 backdrop-blur border border-orange-500/30 rounded-xl p-4">
              <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">🔍</span> 查询模型配置
              </h3>
              <div className="flex gap-2 mb-3">
                <select
                  value={queryModel}
                  onChange={(e) => setQueryModel(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="qwen-coder-plus">qwen-coder-plus</option>
                  <option value="qwen-coder-turbo">qwen-coder-turbo</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="unknown-model">unknown-model (未知)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => getModelConfig(queryModel, false)}
                  disabled={isRefreshing}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  getModelConfig()
                </button>
                <button
                  onClick={() => getModelConfig(queryModel, true)}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  强制刷新
                </button>
              </div>

              {queryResult && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-xs text-green-400 mb-1">查询结果:</div>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
{JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-black/40 backdrop-blur border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">🎮</span> 操作控制
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={refreshCache}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <span className="animate-spin">⏳</span> 刷新中...
                    </>
                  ) : (
                    <>🔄 手动刷新</>
                  )}
                </button>
                <button
                  onClick={clearCache}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  🗑️ 清空缓存
                </button>
              </div>
            </div>

            {/* Operation Logs */}
            <div className="bg-black/40 backdrop-blur border border-gray-500/30 rounded-xl p-4">
              <h3 className="text-gray-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span> 操作日志
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-4">暂无日志</div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border text-sm ${
                        log.type === 'success' ? 'border-green-500/30 bg-green-500/10' :
                        log.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10' :
                        log.type === 'error' ? 'border-red-500/30 bg-red-500/10' :
                        'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-mono text-xs ${
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                          log.type === 'error' ? 'text-red-400' :
                          'text-cyan-400'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{log.detail}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Reference */}
        <div className="mt-6 bg-black/40 backdrop-blur border border-purple-500/30 rounded-xl p-4">
          <h3 className="text-purple-400 font-bold mb-3">📄 源码参考</h3>
          <pre className="text-xs text-gray-400 overflow-x-auto">
{`// packages/core/src/innies/modelConfigCache.ts

export class ModelConfigCache {
  private cache: Map<string, { baseURL: string; apiKey: string }> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getModelConfig(modelId: string, forceRefresh: boolean = false) {
    const now = Date.now();
    const isCacheExpired = now - this.lastFetchTime > this.CACHE_TTL;

    if (forceRefresh || isCacheExpired || this.cache.size === 0) {
      await this.refreshCache();  // 刷新缓存
    }

    return this.cache.get(modelId) || null;
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
