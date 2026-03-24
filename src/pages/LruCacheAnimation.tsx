import { useState, useCallback } from 'react';
import { CodeBlock } from '../components/CodeBlock';

type OperationType = 'get' | 'set' | 'evict';

interface CacheEntry {
 key: string;
 value: string;
 order: number;
 isNew?: boolean;
 isAccessed?: boolean;
 isEvicted?: boolean;
}

interface Operation {
 type: OperationType;
 key: string;
 value?: string;
 result?: string;
 evictedKey?: string;
 timestamp: number;
}

interface LruCacheState {
 entries: CacheEntry[];
 maxSize: number;
 operationCount: number;
}

// Predefined operation sequences
const OPERATION_SEQUENCES = {
 basic: {
 name: '基本操作',
 operations: [
 { type: 'set' as const, key: 'A', value: '数据A' },
 { type: 'set' as const, key: 'B', value: '数据B' },
 { type: 'set' as const, key: 'C', value: '数据C' },
 { type: 'get' as const, key: 'A' },
 { type: 'set' as const, key: 'D', value: '数据D' },
 { type: 'get' as const, key: 'B' },
 ],
 },
 eviction: {
 name: '淘汰演示',
 operations: [
 { type: 'set' as const, key: 'X', value: '1' },
 { type: 'set' as const, key: 'Y', value: '2' },
 { type: 'set' as const, key: 'Z', value: '3' },
 { type: 'set' as const, key: 'W', value: '4' },
 { type: 'set' as const, key: 'V', value: '5' },
 ],
 },
 accessPattern: {
 name: '访问模式',
 operations: [
 { type: 'set' as const, key: 'file1', value: 'content1' },
 { type: 'set' as const, key: 'file2', value: 'content2' },
 { type: 'set' as const, key: 'file3', value: 'content3' },
 { type: 'get' as const, key: 'file1' },
 { type: 'get' as const, key: 'file2' },
 { type: 'set' as const, key: 'file4', value: 'content4' },
 { type: 'get' as const, key: 'file1' },
 { type: 'set' as const, key: 'file5', value: 'content5' },
 ],
 },
 miss: {
 name: '缓存未命中',
 operations: [
 { type: 'set' as const, key: 'K1', value: 'V1' },
 { type: 'get' as const, key: 'K2' },
 { type: 'set' as const, key: 'K2', value: 'V2' },
 { type: 'get' as const, key: 'K3' },
 { type: 'get' as const, key: 'K1' },
 ],
 },
};

export default function LruCacheAnimation() {
 const [cacheState, setCacheState] = useState<LruCacheState>({
 entries: [],
 maxSize: 4,
 operationCount: 0,
 });
 const [operations, setOperations] = useState<Operation[]>([]);
 const [currentOpIndex, setCurrentOpIndex] = useState(-1);
 const [selectedSequence, setSelectedSequence] = useState<keyof typeof OPERATION_SEQUENCES>('basic');
 const [customKey, setCustomKey] = useState('');
 const [customValue, setCustomValue] = useState('');
 const [isAnimating, setIsAnimating] = useState(false);
 const [speed, setSpeed] = useState(1);
 const [stats, setStats] = useState({ hits: 0, misses: 0, evictions: 0 });

 const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms / speed));

 // Simulate Map behavior: delete + set moves to end
 const get = useCallback(async (key: string) => {
 const entry = cacheState.entries.find(e => e.key === key);

 if (entry) {
 // Hit: Mark as accessed, move to end
 setCacheState(prev => {
 const newEntries = prev.entries.filter(e => e.key !== key);
 newEntries.push({
 ...entry,
 order: prev.operationCount + 1,
 isAccessed: true,
 isNew: false,
 });
 return { ...prev, entries: newEntries, operationCount: prev.operationCount + 1 };
 });
 setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
 setOperations(prev => [...prev, {
 type: 'get',
 key,
 result: entry.value,
 timestamp: Date.now(),
 }]);
 return entry.value;
 } else {
 // Miss
 setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
 setOperations(prev => [...prev, {
 type: 'get',
 key,
 result: 'undefined',
 timestamp: Date.now(),
 }]);
 return undefined;
 }
 }, [cacheState.entries]);

 const set = useCallback(async (key: string, value: string) => {
 let evictedKey: string | undefined;

 setCacheState(prev => {
 let newEntries = [...prev.entries];
 const existingIndex = newEntries.findIndex(e => e.key === key);

 if (existingIndex !== -1) {
 // Update existing: delete + set (move to end)
 newEntries = newEntries.filter(e => e.key !== key);
 } else if (newEntries.length >= prev.maxSize) {
 // Evict first (oldest) entry
 evictedKey = newEntries[0].key;
 newEntries[0].isEvicted = true;
 newEntries = newEntries.slice(1);
 }

 // Add to end
 newEntries.push({
 key,
 value,
 order: prev.operationCount + 1,
 isNew: true,
 });

 return { ...prev, entries: newEntries, operationCount: prev.operationCount + 1 };
 });

 if (evictedKey) {
 setStats(prev => ({ ...prev, evictions: prev.evictions + 1 }));
 }

 setOperations(prev => [...prev, {
 type: 'set',
 key,
 value,
 evictedKey,
 timestamp: Date.now(),
 }]);
 }, []);

 const runSequence = useCallback(async () => {
 if (isAnimating) return;

 setIsAnimating(true);
 setCacheState({ entries: [], maxSize: 4, operationCount: 0 });
 setOperations([]);
 setStats({ hits: 0, misses: 0, evictions: 0 });
 setCurrentOpIndex(-1);

 const sequence = OPERATION_SEQUENCES[selectedSequence].operations;

 for (let i = 0; i < sequence.length; i++) {
 setCurrentOpIndex(i);
 await sleep(300);

 const op = sequence[i];
 if (op.type === 'get') {
 await get(op.key);
 } else {
 await set(op.key, op.value!);
 }

 await sleep(800);

 // Clear animation flags
 setCacheState(prev => ({
 ...prev,
 entries: prev.entries.map(e => ({
 ...e,
 isNew: false,
 isAccessed: false,
 })),
 }));
 }

 setCurrentOpIndex(-1);
 setIsAnimating(false);
 }, [isAnimating, selectedSequence, get, set, speed]);

 const executeCustomGet = async () => {
 if (!customKey || isAnimating) return;
 setIsAnimating(true);
 await get(customKey);
 await sleep(500);
 setCacheState(prev => ({
 ...prev,
 entries: prev.entries.map(e => ({ ...e, isNew: false, isAccessed: false })),
 }));
 setIsAnimating(false);
 setCustomKey('');
 };

 const executeCustomSet = async () => {
 if (!customKey || isAnimating) return;
 setIsAnimating(true);
 await set(customKey, customValue || `value_${customKey}`);
 await sleep(500);
 setCacheState(prev => ({
 ...prev,
 entries: prev.entries.map(e => ({ ...e, isNew: false, isAccessed: false })),
 }));
 setIsAnimating(false);
 setCustomKey('');
 setCustomValue('');
 };

 const reset = () => {
 setCacheState({ entries: [], maxSize: 4, operationCount: 0 });
 setOperations([]);
 setCurrentOpIndex(-1);
 setStats({ hits: 0, misses: 0, evictions: 0 });
 setIsAnimating(false);
 };

 return (
 <div className="p-6 max-w-6xl mx-auto">
 <h1 className="text-2xl font-bold mb-2 text-heading">LRU 缓存淘汰</h1>
 <p className="text-body mb-6">
 展示 Map 顺序保持特性实现的 LRU (最近最少使用) 缓存淘汰策略
 </p>

 {/* Algorithm Overview */}
 <div className="mb-6 p-4 bg-surface rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">算法原理</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
 <div className="p-3 bg-surface rounded">
 <span className="text-heading font-medium">GET 操作</span>
 <div className="text-dim mt-1">
 命中时: delete(key) + set(key, value)<br />
 移动到 Map 末尾 (最新)
 </div>
 </div>
 <div className="p-3 bg-surface rounded">
 <span className="text-heading font-medium">SET 操作</span>
 <div className="text-dim mt-1">
 已存在: delete + set (更新位置)<br />
 满容量: 淘汰 first key (最旧)
 </div>
 </div>
 <div className="p-3 bg-surface rounded">
 <span className="text-heading font-medium">淘汰策略</span>
 <div className="text-dim mt-1">
 Map.keys().next().value<br />
 获取第一个 key 并删除
 </div>
 </div>
 </div>
 </div>

 {/* Controls */}
 <div className="flex flex-wrap gap-3 mb-6">
 <select
 value={selectedSequence}
 onChange={(e) => setSelectedSequence(e.target.value as keyof typeof OPERATION_SEQUENCES)}
 disabled={isAnimating}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 {Object.entries(OPERATION_SEQUENCES).map(([key, value]) => (
 <option key={key} value={key}>{value.name}</option>
 ))}
 </select>
 <select
 value={speed}
 onChange={(e) => setSpeed(Number(e.target.value))}
 disabled={isAnimating}
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 >
 <option value={0.5}>0.5x 速度</option>
 <option value={1}>1x 速度</option>
 <option value={2}>2x 速度</option>
 <option value={4}>4x 速度</option>
 </select>
 <button
 onClick={runSequence}
 disabled={isAnimating}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm font-medium transition-colors"
 >
 {isAnimating ? '执行中...' : '运行序列'}
 </button>
 <button
 onClick={reset}
 disabled={isAnimating}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-surface rounded text-heading text-sm transition-colors"
 >
 重置
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">缓存大小</div>
 <div className="text-xl font-bold text-heading">
 {cacheState.entries.length} / {cacheState.maxSize}
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">命中次数</div>
 <div className="text-xl font-bold text-heading">{stats.hits}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">未命中次数</div>
 <div className="text-xl font-bold text-heading">{stats.misses}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">淘汰次数</div>
 <div className="text-xl font-bold text-heading">{stats.evictions}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">命中率</div>
 <div className="text-xl font-bold text-heading">
 {stats.hits + stats.misses > 0
 ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
 : 0}%
 </div>
 </div>
 </div>

 {/* Cache Visualization */}
 <div className="mb-6 p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-4 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-elevated" />
 缓存状态 (Map 顺序)
 <span className="text-xs text-dim ml-2">← 最旧 (LRU) | 最新 →</span>
 </h3>

 <div className="flex items-center gap-2 min-h-24 overflow-x-auto pb-2">
 {cacheState.entries.length === 0 ? (
 <div className="text-dim text-sm">缓存为空</div>
 ) : (
 cacheState.entries.map((entry, idx) => (
 <div
 key={`${entry.key}-${entry.order}`}
 className={`flex-shrink-0 w-32 p-3 rounded-lg border-2 transition-all duration-300 ${
 entry.isNew ? 'border-edge bg-elevated scale-105' :
 entry.isAccessed ? ' border-edge bg-elevated/30 scale-105' :
 idx === 0 ? 'border-edge/40 bg-elevated' :
 ' border-edge bg-surface'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="font-bold text-heading">{entry.key}</span>
 <span className="text-xs text-dim">#{idx + 1}</span>
 </div>
 <div className="text-xs text-body truncate">{entry.value}</div>
 {idx === 0 && cacheState.entries.length >= cacheState.maxSize && (
 <div className="mt-2 text-xs text-heading">← 下次淘汰</div>
 )}
 {entry.isNew && <div className="mt-2 text-xs text-heading">新增</div>}
 {entry.isAccessed && <div className="mt-2 text-xs text-heading">已访问</div>}
 </div>
 ))
 )}

 {/* Empty slots */}
 {Array.from({ length: cacheState.maxSize - cacheState.entries.length }).map((_, idx) => (
 <div
 key={`empty-${idx}`}
 className="flex-shrink-0 w-32 h-24 p-3 rounded-lg border-2 border-dashed border-edge bg-surface/30 flex items-center justify-center"
 >
 <span className="text-dim text-sm">空位</span>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Operation History */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
 操作历史
 </h3>
 <div className="h-60 overflow-y-auto space-y-2">
 {operations.map((op, idx) => (
 <div
 key={idx}
 className={`p-2 rounded text-xs ${
 op.type === 'get' && op.result !== 'undefined'
 ? 'bg-elevated border-l-2 border-edge'
 : op.type === 'get'
 ? 'bg-elevated border-l-2 border-edge'
 : op.evictedKey
 ? 'bg-elevated border-l-2 border-edge'
 : ' bg-elevated/30' }`}
 >
 <div className="flex items-center gap-2">
 <span className={`font-medium ${
 op.type === 'get' ? 'text-heading' : 'text-heading'
 }`}>
 {op.type.toUpperCase()}
 </span>
 <span className="text-body">({op.key})</span>
 {op.type === 'set' && op.value && (
 <span className="text-dim">= "{op.value}"</span>
 )}
 </div>
 {op.type === 'get' && (
 <div className={`mt-1 ${op.result !== 'undefined' ? 'text-heading' : 'text-heading'}`}>
 → {op.result !== 'undefined' ? `"${op.result}" (HIT)` : 'undefined (MISS)'}
 </div>
 )}
 {op.evictedKey && (
 <div className="mt-1 text-heading">
 ⚠ 淘汰: {op.evictedKey}
 </div>
 )}
 </div>
 ))}
 {operations.length === 0 && (
 <span className="text-dim">等待操作...</span>
 )}
 </div>
 </div>

 {/* Custom Operations */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">自定义操作</h3>
 <div className="space-y-3">
 <div className="flex gap-2">
 <input
 type="text"
 value={customKey}
 onChange={(e) => setCustomKey(e.target.value)}
 placeholder="Key"
 disabled={isAnimating}
 className="flex-1 px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 />
 <input
 type="text"
 value={customValue}
 onChange={(e) => setCustomValue(e.target.value)}
 placeholder="Value (可选)"
 disabled={isAnimating}
 className="flex-1 px-3 py-2 bg-surface border border-edge rounded text-heading text-sm"
 />
 </div>
 <div className="flex gap-2">
 <button
 onClick={executeCustomGet}
 disabled={!customKey || isAnimating}
 className="flex-1 px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm transition-colors"
 >
 GET
 </button>
 <button
 onClick={executeCustomSet}
 disabled={!customKey || isAnimating}
 className="flex-1 px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm transition-colors"
 >
 SET
 </button>
 </div>
 </div>

 {/* Pending Operations Preview */}
 {currentOpIndex >= 0 && (
 <div className="mt-4 pt-3 border-t border-edge">
 <div className="text-xs text-dim mb-2">当前操作序列:</div>
 <div className="flex flex-wrap gap-1">
 {OPERATION_SEQUENCES[selectedSequence].operations.map((op, idx) => (
 <span
 key={idx}
 className={`px-2 py-1 rounded text-xs ${
 idx === currentOpIndex
 ? 'bg-elevated text-heading ring-1 ring-[var(--color-warning)]'
 : idx < currentOpIndex
 ? 'bg-elevated text-heading'
 : ' bg-surface text-dim'
 }`}
 >
 {op.type}({op.key})
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Code Reference */}
 <div className="mt-6 p-4 bg-surface rounded-lg">
 <h4 className="text-sm font-semibold text-body mb-3">核心代码</h4>
 <CodeBlock
   language="typescript"
   title="LruCache"
   code={`class LruCache<K, V> {
  private cache = new Map<K, V>();

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // 移动到末尾 (最新)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key); // 更新位置
    } else if (this.cache.size >= this.maxSize) {
      // 淘汰第一个 (最旧)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}`}
 />
 </div>
 </div>
 );
}
