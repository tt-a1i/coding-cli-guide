// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 缓存阶段
type CachePhase =
  | 'init'
  | 'exact_match_hit'
  | 'exact_match_miss'
  | 'prefix_scan'
  | 'prefix_match_found'
  | 'prefix_search'
  | 'cache_update'
  | 'stats_update'
  | 'optimization_demo'
  | 'complete';

// 缓存步骤
interface CacheStep {
  phase: CachePhase;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// 缓存流程
const cacheSequence: CacheStep[] = [
  {
    phase: 'init',
    title: '初始化 ResultCache',
    description: '创建文件搜索结果缓存，使用前缀匹配优化',
    codeSnippet: `// result-cache.ts:10-30
class ResultCache {
  private cache = new Map<string, string[]>();
  private hits = 0;
  private misses = 0;

  constructor() {
    // 使用 Map 存储查询 → 结果映射
    // key: 搜索查询字符串
    // value: 匹配的文件路径数组
  }

  // 核心优化思想：
  // 如果用户搜索 "foo"，结果是 [a.ts, b.ts, foo.ts]
  // 然后搜索 "foobar"
  // 不需要搜索所有文件！
  // 只需要在 "foo" 的结果中搜索 "bar"
}`,
    visualData: {
      cache: new Map(),
      hits: 0,
      misses: 0
    },
  },
  {
    phase: 'exact_match_hit',
    title: '精确匹配命中',
    description: '查询字符串完全存在于缓存中，直接返回',
    codeSnippet: `// result-cache.ts:40-55
get(query: string): string[] | undefined {
  // 精确匹配检查
  if (this.cache.has(query)) {
    this.hits++;
    return this.cache.get(query);
  }

  // 未命中，尝试前缀匹配优化
  this.misses++;
  return undefined;
}

// 示例
query = "component"
cache = {
  "component": ["Button.tsx", "Modal.tsx", "Input.tsx"]
}
// → 命中！直接返回结果`,
    visualData: {
      query: 'component',
      cache: {
        'component': ['Button.tsx', 'Modal.tsx', 'Input.tsx'],
        'util': ['helper.ts', 'format.ts'],
      },
      result: 'HIT',
      files: ['Button.tsx', 'Modal.tsx', 'Input.tsx']
    },
    highlight: 'Cache HIT',
  },
  {
    phase: 'exact_match_miss',
    title: '精确匹配未命中',
    description: '查询不在缓存中，需要尝试前缀优化或完整搜索',
    codeSnippet: `// result-cache.ts:60-75
get(query: string): string[] | undefined {
  if (this.cache.has(query)) {
    this.hits++;
    return this.cache.get(query);
  }

  // 精确匹配失败
  // 但可能存在可用的前缀缓存！
  this.misses++;

  return undefined;  // 触发前缀扫描
}

// 示例
query = "componentButton"
cache = {
  "component": [...],  // 存在！可作为前缀
  "util": [...]
}
// → 未命中，但可优化`,
    visualData: {
      query: 'componentButton',
      cache: {
        'component': ['Button.tsx', 'Modal.tsx', 'Input.tsx'],
        'util': ['helper.ts', 'format.ts'],
      },
      result: 'MISS',
      hasPrefixPotential: true
    },
    highlight: 'Cache MISS',
  },
  {
    phase: 'prefix_scan',
    title: '前缀扫描',
    description: '遍历缓存 key，寻找最长的匹配前缀',
    codeSnippet: `// result-cache.ts:80-105
findBestPrefix(query: string): [string, string[]] | undefined {
  let bestPrefix = '';
  let bestResults: string[] = [];

  // 遍历所有缓存条目
  for (const [cachedQuery, results] of this.cache.entries()) {
    // 检查 query 是否以 cachedQuery 开头
    if (query.startsWith(cachedQuery)) {
      // 选择最长的前缀（更精确的结果集）
      if (cachedQuery.length > bestPrefix.length) {
        bestPrefix = cachedQuery;
        bestResults = results;
      }
    }
  }

  if (bestPrefix) {
    return [bestPrefix, bestResults];
  }

  return undefined;
}`,
    visualData: {
      query: 'componentButton',
      scanning: [
        { key: 'component', isPrefix: true, length: 9 },
        { key: 'util', isPrefix: false, length: 0 },
        { key: 'comp', isPrefix: true, length: 4 },
      ],
      bestPrefix: 'component',
      bestLength: 9
    },
    highlight: '最长前缀: "component"',
  },
  {
    phase: 'prefix_match_found',
    title: '前缀匹配成功',
    description: '找到可用前缀，使用其结果作为搜索基础',
    codeSnippet: `// 前缀匹配优化成功！
query = "componentButton"
bestPrefix = "component"
prefixResults = ["Button.tsx", "Modal.tsx", "Input.tsx"]

// 关键优化：
// 不需要搜索所有 10,000+ 文件
// 只需要在 3 个文件中搜索 "Button"

// 时间复杂度对比：
// 无优化: O(所有文件) = O(10000)
// 有优化: O(前缀结果) = O(3)

remainingQuery = query.slice(bestPrefix.length)
// = "componentButton".slice(9)
// = "Button"`,
    visualData: {
      originalScope: 10000,
      optimizedScope: 3,
      reduction: '99.97%',
      remainingQuery: 'Button',
      prefixResults: ['Button.tsx', 'Modal.tsx', 'Input.tsx']
    },
    highlight: '搜索范围: 10000 → 3',
  },
  {
    phase: 'prefix_search',
    title: '缩小范围搜索',
    description: '在前缀结果中搜索剩余查询',
    codeSnippet: `// result-cache.ts:110-130
searchWithPrefix(
  query: string,
  prefix: string,
  prefixResults: string[]
): string[] {
  // 提取剩余查询部分
  const remaining = query.slice(prefix.length);

  // 在缩小的范围内搜索
  const filtered = prefixResults.filter(file => {
    // 检查文件名是否包含剩余查询
    const fileName = path.basename(file);
    return fileName.toLowerCase()
      .includes(remaining.toLowerCase());
  });

  return filtered;
}

// "Button.tsx".includes("Button") → ✓
// "Modal.tsx".includes("Button") → ✗
// "Input.tsx".includes("Button") → ✗
// 结果: ["Button.tsx"]`,
    visualData: {
      remaining: 'Button',
      checking: [
        { file: 'Button.tsx', matches: true },
        { file: 'Modal.tsx', matches: false },
        { file: 'Input.tsx', matches: false },
      ],
      result: ['Button.tsx']
    },
    highlight: '过滤后: 1 个匹配',
  },
  {
    phase: 'cache_update',
    title: '缓存更新',
    description: '将新的查询结果存入缓存供后续使用',
    codeSnippet: `// result-cache.ts:135-150
set(query: string, results: string[]): void {
  // 存储新的查询结果
  this.cache.set(query, results);

  // 可选：限制缓存大小
  if (this.cache.size > this.maxSize) {
    // LRU 驱逐策略
    const oldestKey = this.cache.keys().next().value;
    this.cache.delete(oldestKey);
  }
}

// 缓存更新后
cache = {
  "component": [...],
  "util": [...],
  "componentButton": ["Button.tsx"]  // 新增！
}`,
    visualData: {
      before: {
        'component': 3,
        'util': 2,
      },
      after: {
        'component': 3,
        'util': 2,
        'componentButton': 1,
      },
      newEntry: { key: 'componentButton', value: ['Button.tsx'] }
    },
    highlight: '缓存已更新',
  },
  {
    phase: 'stats_update',
    title: '统计更新',
    description: '追踪缓存命中率用于性能分析',
    codeSnippet: `// result-cache.ts:155-175
getStats(): CacheStats {
  const total = this.hits + this.misses;
  const hitRate = total > 0 ? this.hits / total : 0;

  return {
    hits: this.hits,
    misses: this.misses,
    total: total,
    hitRate: hitRate,
    cacheSize: this.cache.size,
    efficiency: this.calculateEfficiency(),
  };
}

// 当前统计
{
  hits: 15,
  misses: 5,
  total: 20,
  hitRate: 0.75,  // 75% 命中率
  cacheSize: 12,
  efficiency: 0.92  // 搜索效率提升 92%
}`,
    visualData: {
      stats: {
        hits: 15,
        misses: 5,
        total: 20,
        hitRate: 0.75,
        cacheSize: 12
      }
    },
    highlight: '命中率: 75%',
  },
  {
    phase: 'optimization_demo',
    title: '优化效果演示',
    description: '展示前缀匹配如何显著减少搜索时间',
    codeSnippet: `// 搜索序列演示
1. 搜索 "src" → 扫描 10000 文件 → 500 结果
2. 搜索 "src/comp" → 只扫描 500 文件 → 50 结果
3. 搜索 "src/components" → 只扫描 50 文件 → 30 结果
4. 搜索 "src/components/Button" → 只扫描 30 文件 → 3 结果

// 累积节省
// 无优化: 10000 + 10000 + 10000 + 10000 = 40000 次文件扫描
// 有优化: 10000 + 500 + 50 + 30 = 10580 次文件扫描
// 节省: 73.5%

// 关键洞察：
// 用户搜索通常是渐进式的
// "f" → "fo" → "foo" → "foobar"
// 前缀缓存完美适配这种模式`,
    visualData: {
      sequence: [
        { query: 'src', scans: 10000, results: 500 },
        { query: 'src/comp', scans: 500, results: 50 },
        { query: 'src/components', scans: 50, results: 30 },
        { query: 'src/components/Button', scans: 30, results: 3 },
      ],
      totalWithout: 40000,
      totalWith: 10580,
      savings: '73.5%'
    },
    highlight: '节省 73.5% 扫描',
  },
  {
    phase: 'complete',
    title: '缓存优化完成',
    description: '前缀匹配缓存大幅提升文件搜索性能',
    codeSnippet: `// 核心优势总结

1. 精确匹配: O(1) 查找
   - 完全相同的查询直接返回

2. 前缀匹配: O(n) 扫描 + O(m) 过滤
   - n = 缓存条目数（通常 < 100）
   - m = 前缀结果数（通常 << 全部文件）

3. 渐进式搜索优化
   - 用户输入越多，搜索越快
   - "f" → "fo" → "foo" 每步都更快

4. 自适应学习
   - 常用搜索模式自动缓存
   - 热点查询几乎瞬时响应

// 性能对比
传统搜索: O(文件数 × 查询次数)
缓存搜索: O(缓存条目 + 前缀结果)`,
    visualData: {
      benefits: [
        { name: '精确匹配', complexity: 'O(1)' },
        { name: '前缀优化', complexity: 'O(n+m)' },
        { name: '渐进加速', complexity: '递减' },
        { name: '热点缓存', complexity: '≈O(1)' },
      ]
    },
    highlight: '优化完成',
  },
];

// 缓存可视化
function CacheVisualizer({
  cache,
  query,
  result,
  hasPrefixPotential
}: {
  cache: Record<string, string[]>;
  query?: string;
  result?: string;
  hasPrefixPotential?: boolean;
}) {
  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500 font-mono">Cache Storage</div>
        {result && (
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              result === 'HIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {result}
          </span>
        )}
      </div>

      {query && (
        <div className="mb-3 p-2 rounded bg-black/30">
          <span className="text-gray-500 text-xs">Query: </span>
          <span className="text-[var(--terminal-green)] font-mono">{query}</span>
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(cache).map(([key, files]) => {
          const isMatch = query === key;
          const isPrefix = query?.startsWith(key) && query !== key;

          return (
            <div
              key={key}
              className={`p-2 rounded border transition-all ${
                isMatch
                  ? 'border-green-500 bg-green-500/10'
                  : isPrefix
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-gray-700 bg-black/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">"{key}"</span>
                {isMatch && <span className="text-xs text-green-400">← 精确匹配</span>}
                {isPrefix && <span className="text-xs text-amber-400">← 可用前缀</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Array.isArray(files) ? files.slice(0, 3).join(', ') : `${files} 个文件`}
                {Array.isArray(files) && files.length > 3 && ` +${files.length - 3} more`}
              </div>
            </div>
          );
        })}
      </div>

      {hasPrefixPotential && (
        <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
          存在可用前缀，可优化搜索
        </div>
      )}
    </div>
  );
}

// 前缀扫描可视化
function PrefixScanVisualizer({
  scanning,
  bestPrefix,
  query
}: {
  scanning?: Array<{ key: string; isPrefix: boolean; length: number }>;
  bestPrefix?: string;
  query?: string;
}) {
  if (!scanning) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">
        扫描前缀: "{query}"
      </div>
      <div className="space-y-2">
        {scanning.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-3 p-2 rounded ${
              item.key === bestPrefix
                ? 'bg-green-500/20 border border-green-500'
                : item.isPrefix
                  ? 'bg-amber-500/10'
                  : 'bg-black/20'
            }`}
          >
            <span className="font-mono text-sm text-white">"{item.key}"</span>
            <div className="flex-1" />
            {item.isPrefix ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">length: {item.length}</span>
                {item.key === bestPrefix && (
                  <span className="px-2 py-0.5 rounded text-xs bg-green-500 text-white">
                    最优
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-600">不匹配</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 范围优化可视化
function ScopeOptimizationVisualizer({
  originalScope,
  optimizedScope,
  reduction,
  prefixResults
}: {
  originalScope?: number;
  optimizedScope?: number;
  reduction?: string;
  prefixResults?: string[];
}) {
  if (!originalScope) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/10">
      <div className="text-sm font-bold text-green-400 mb-3">搜索范围优化</div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400 line-through">
            {originalScope?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">原始范围</div>
        </div>
        <div className="flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {optimizedScope}
          </div>
          <div className="text-xs text-gray-500">优化后</div>
        </div>
      </div>
      <div className="text-center">
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
          减少 {reduction}
        </span>
      </div>
      {prefixResults && (
        <div className="mt-4 pt-3 border-t border-green-500/20">
          <div className="text-xs text-gray-500 mb-2">只搜索这些文件:</div>
          <div className="flex flex-wrap gap-1">
            {prefixResults.map((file, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-black/30 text-xs text-gray-300 font-mono">
                {file}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 过滤可视化
function FilterVisualizer({
  remaining,
  checking,
  result
}: {
  remaining?: string;
  checking?: Array<{ file: string; matches: boolean }>;
  result?: string[];
}) {
  if (!checking) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">
        过滤: 包含 "{remaining}"
      </div>
      <div className="space-y-2">
        {checking.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2 rounded ${
              item.matches ? 'bg-green-500/20' : 'bg-black/20'
            }`}
          >
            <span className="font-mono text-sm text-white">{item.file}</span>
            <div className="flex-1" />
            {item.matches ? (
              <span className="text-green-400">✓ 匹配</span>
            ) : (
              <span className="text-gray-600">✗</span>
            )}
          </div>
        ))}
      </div>
      {result && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500">结果: </span>
          <span className="text-[var(--terminal-green)] font-mono">
            [{result.join(', ')}]
          </span>
        </div>
      )}
    </div>
  );
}

// 统计可视化
function StatsVisualizer({
  stats
}: {
  stats?: { hits: number; misses: number; total: number; hitRate: number; cacheSize: number };
}) {
  if (!stats) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">缓存统计</div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-3 rounded bg-green-500/10 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.hits}</div>
          <div className="text-xs text-gray-500">命中</div>
        </div>
        <div className="p-3 rounded bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.misses}</div>
          <div className="text-xs text-gray-500">未命中</div>
        </div>
        <div className="p-3 rounded bg-blue-500/10 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.cacheSize}</div>
          <div className="text-xs text-gray-500">条目数</div>
        </div>
      </div>
      <div className="relative h-4 bg-black/30 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${stats.hitRate * 100}%` }}
        />
      </div>
      <div className="mt-2 text-center text-sm">
        <span className="text-gray-400">命中率: </span>
        <span className="text-green-400 font-bold">{(stats.hitRate * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

// 序列演示可视化
function SequenceVisualizer({
  sequence,
  totalWithout,
  totalWith,
  savings
}: {
  sequence?: Array<{ query: string; scans: number; results: number }>;
  totalWithout?: number;
  totalWith?: number;
  savings?: string;
}) {
  if (!sequence) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">渐进式搜索序列</div>
      <div className="space-y-2 mb-4">
        {sequence.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded bg-black/20">
            <span className="text-gray-500 text-xs w-4">{i + 1}.</span>
            <span className="font-mono text-sm text-[var(--terminal-green)]">
              "{item.query}"
            </span>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">
              扫描 <span className="text-amber-400">{item.scans.toLocaleString()}</span>
            </span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs text-gray-400">
              结果 <span className="text-green-400">{item.results}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 p-3 rounded bg-black/30">
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">无优化</div>
          <div className="text-xl font-bold text-red-400 line-through">
            {totalWithout?.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">有优化</div>
          <div className="text-xl font-bold text-green-400">
            {totalWith?.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 font-bold">
          节省 {savings}
        </span>
      </div>
    </div>
  );
}

export function ResultCacheAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = cacheSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < cacheSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(cacheSequence.length - 1, prev + 1));
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
          文件搜索结果缓存
        </h1>
        <p className="text-gray-400">
          ResultCache - 前缀匹配优化的智能缓存
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/utils/filesearch/result-cache.ts
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {cacheSequence.map((s, i) => (
            <button
              key={s.phase}
              onClick={() => setCurrentStep(i)}
              className={`
                flex-1 h-2 rounded-full transition-all cursor-pointer
                ${i === currentStep
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
          <span>步骤 {currentStep + 1} / {cacheSequence.length}</span>
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
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.8))' }}
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

          {/* 缓存可视化 */}
          {step.visualData?.cache !== undefined && (
            <CacheVisualizer
              cache={step.visualData.cache as Record<string, string[]>}
              query={step.visualData.query as string}
              result={step.visualData.result as string}
              hasPrefixPotential={step.visualData.hasPrefixPotential as boolean}
            />
          )}

          {/* 前缀扫描 */}
          {Boolean(step.visualData && step.visualData.scanning !== undefined) && (
            <PrefixScanVisualizer
              scanning={step.visualData!.scanning as Array<{ key: string; isPrefix: boolean; length: number }>}
              bestPrefix={step.visualData!.bestPrefix as string}
              query={step.visualData!.query as string}
            />
          )}

          {/* 范围优化 */}
          {Boolean(step.visualData && step.visualData.originalScope !== undefined) && (
            <ScopeOptimizationVisualizer
              originalScope={step.visualData!.originalScope as number}
              optimizedScope={step.visualData!.optimizedScope as number}
              reduction={step.visualData!.reduction as string}
              prefixResults={step.visualData!.prefixResults as string[]}
            />
          )}

          {/* 过滤可视化 */}
          {step.visualData?.checking && (
            <FilterVisualizer
              remaining={step.visualData.remaining as string}
              checking={step.visualData.checking as Array<{ file: string; matches: boolean }>}
              result={step.visualData.result as string[]}
            />
          )}

          {/* 统计 */}
          {step.visualData?.stats && (
            <StatsVisualizer
              stats={step.visualData.stats as { hits: number; misses: number; total: number; hitRate: number; cacheSize: number }}
            />
          )}

          {/* 序列演示 */}
          {step.visualData?.sequence && (
            <SequenceVisualizer
              sequence={step.visualData.sequence as Array<{ query: string; scans: number; results: number }>}
              totalWithout={step.visualData.totalWithout as number}
              totalWith={step.visualData.totalWith as number}
              savings={step.visualData.savings as string}
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
                result-cache.ts
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
            ${isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-[var(--terminal-green)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === cacheSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>
    </div>
  );
}
