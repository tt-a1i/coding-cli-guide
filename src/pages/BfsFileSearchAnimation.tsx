import React, { useState, useCallback, useRef } from 'react';

type SearchPhase = 'idle' | 'initializing' | 'searching' | 'processing' | 'complete';

interface DirectoryNode {
 path: string;
 depth: number;
 children: string[];
 files: string[];
 status: 'queued' | 'visiting' | 'visited' | 'ignored';
}

interface SearchState {
 queue: string[];
 queueHead: number;
 visited: Set<string>;
 currentBatch: string[];
 foundFiles: string[];
 scannedDirs: number;
 maxDirs: number;
}

// Sample file tree for demonstration
const SAMPLE_TREE: Record<string, { files: string[]; dirs: string[] }> = {
 '/project': { files: ['package.json', 'README.md'], dirs: ['src', 'node_modules', 'dist', 'tests'] },
 '/project/src': { files: ['index.ts', 'app.tsx'], dirs: ['components', 'utils', 'services'] },
 '/project/src/components': { files: ['Button.tsx', 'Input.tsx', 'Modal.tsx'], dirs: ['forms', 'layout'] },
 '/project/src/components/forms': { files: ['LoginForm.tsx', 'SignupForm.tsx'], dirs: [] },
 '/project/src/components/layout': { files: ['Header.tsx', 'Footer.tsx', 'Sidebar.tsx'], dirs: [] },
 '/project/src/utils': { files: ['helpers.ts', 'constants.ts', 'types.ts'], dirs: [] },
 '/project/src/services': { files: ['api.ts', 'auth.ts', 'storage.ts'], dirs: [] },
 '/project/node_modules': { files: ['.package-lock.json'], dirs: ['react', 'typescript', 'lodash'] },
 '/project/node_modules/react': { files: ['index.js', 'package.json'], dirs: [] },
 '/project/node_modules/typescript': { files: ['index.js', 'package.json'], dirs: [] },
 '/project/node_modules/lodash': { files: ['index.js', 'package.json'], dirs: [] },
 '/project/dist': { files: ['bundle.js', 'bundle.js.map'], dirs: [] },
 '/project/tests': { files: ['setup.ts'], dirs: ['unit', 'e2e'] },
 '/project/tests/unit': { files: ['utils.test.ts', 'api.test.ts'], dirs: [] },
 '/project/tests/e2e': { files: ['login.spec.ts', 'dashboard.spec.ts'], dirs: [] },
};

const DEFAULT_IGNORE = new Set(['node_modules', 'dist', '.git', '__pycache__', '.next', 'coverage']);

const PARALLEL_BATCH_SIZE = 3; // Smaller for visualization (source uses 15)
const MAX_DIRS = 20;

export default function BfsFileSearchAnimation() {
 const [_phase, setPhase] = useState<SearchPhase>('idle');
 void _phase; // Used for state management
 const [searchPattern, setSearchPattern] = useState<string>('*.tsx');
 const [state, setState] = useState<SearchState>({
 queue: [],
 queueHead: 0,
 visited: new Set(),
 currentBatch: [],
 foundFiles: [],
 scannedDirs: 0,
 maxDirs: MAX_DIRS,
 });
 const [directories, setDirectories] = useState<Map<string, DirectoryNode>>(new Map());
 const [logs, setLogs] = useState<string[]>([]);
 const [speed, setSpeed] = useState(1);
 const [isRunning, setIsRunning] = useState(false);

 const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 const sleep = (ms: number) => new Promise(resolve => {
 timeoutRef.current = setTimeout(resolve, ms / speed);
 });

 const addLog = (message: string) => {
 setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${message}`]);
 };

 const matchPattern = useCallback((filename: string, pattern: string): boolean => {
 if (pattern.startsWith('*.')) {
 const ext = pattern.slice(1);
 return filename.endsWith(ext);
 }
 return filename.includes(pattern);
 }, []);

 const runSearch = useCallback(async () => {
 if (isRunning) return;

 setIsRunning(true);
 setPhase('initializing');
 setLogs([]);

 // Initialize state
 const initialQueue = ['/project'];
 const initialDirs = new Map<string, DirectoryNode>();

 // Build directory tree visualization
 Object.entries(SAMPLE_TREE).forEach(([path, content]) => {
 initialDirs.set(path, {
 path,
 depth: path.split('/').length - 2,
 children: content.dirs.map(d => `${path}/${d}`),
 files: content.files,
 status: 'queued',
 });
 });

 // Mark initial as queued
 const rootDir = initialDirs.get('/project');
 if (rootDir) {
 rootDir.status = 'queued';
 initialDirs.set('/project', rootDir);
 }

 setDirectories(initialDirs);
 setState({
 queue: initialQueue,
 queueHead: 0,
 visited: new Set(),
 currentBatch: [],
 foundFiles: [],
 scannedDirs: 0,
 maxDirs: MAX_DIRS,
 });

 addLog(`初始化 BFS 搜索，模式: ${searchPattern}`);
 addLog(`根目录: /project`);
 addLog(`忽略目录: ${[...DEFAULT_IGNORE].join(', ')}`);
 await sleep(800);

 // BFS Loop
 setPhase('searching');
 let queue = [...initialQueue];
 let queueHead = 0;
 let visited = new Set<string>();
 let foundFiles: string[] = [];
 let scannedDirs = 0;

 while (queueHead < queue.length && scannedDirs < MAX_DIRS) {
 // Build current batch
 const currentBatch: string[] = [];
 const tempQueueHead = queueHead;

 while (currentBatch.length < PARALLEL_BATCH_SIZE && queueHead < queue.length) {
 const currentDir = queue[queueHead];
 queueHead++;

 // Check if already visited
 if (visited.has(currentDir)) {
 addLog(`跳过已访问: ${currentDir}`);
 continue;
 }

 // Check if ignored
 const dirName = currentDir.split('/').pop() || '';
 if (DEFAULT_IGNORE.has(dirName)) {
 addLog(`忽略目录: ${currentDir}`);
 setDirectories(prev => {
 const newMap = new Map(prev);
 const dir = newMap.get(currentDir);
 if (dir) {
 dir.status = 'ignored';
 newMap.set(currentDir, dir);
 }
 return newMap;
 });
 continue;
 }

 visited.add(currentDir);
 currentBatch.push(currentDir);
 }

 if (currentBatch.length === 0) continue;

 // Update state for visualization
 setState(prev => ({
 ...prev,
 queue,
 queueHead,
 visited: new Set(visited),
 currentBatch,
 }));

 // Mark batch as visiting
 setDirectories(prev => {
 const newMap = new Map(prev);
 currentBatch.forEach(dir => {
 const node = newMap.get(dir);
 if (node) {
 node.status = 'visiting';
 newMap.set(dir, node);
 }
 });
 return newMap;
 });

 addLog(`并行处理批次: ${currentBatch.length} 个目录 (queueHead: ${tempQueueHead} → ${queueHead})`);
 await sleep(600);

 // Process batch in parallel
 setPhase('processing');
 const batchResults = await Promise.all(
 currentBatch.map(async (dir) => {
 await sleep(200); // Simulate async read
 const content = SAMPLE_TREE[dir];
 if (!content) return { dir, files: [], children: [] };

 // Find matching files
 const matchingFiles = content.files.filter(f => matchPattern(f, searchPattern));
 const fullPaths = matchingFiles.map(f => `${dir}/${f}`);

 // Get child directories
 const children = content.dirs.map(d => `${dir}/${d}`);

 return { dir, files: fullPaths, children };
 })
 );

 // Process results
 for (const result of batchResults) {
 // Add found files
 if (result.files.length > 0) {
 foundFiles = [...foundFiles, ...result.files];
 addLog(`发现 ${result.files.length} 个匹配文件: ${result.files.map(f => f.split('/').pop()).join(', ')}`);
 }

 // Add children to queue
 for (const child of result.children) {
 if (!visited.has(child) && !queue.includes(child)) {
 queue.push(child);
 setDirectories(prev => {
 const newMap = new Map(prev);
 const node = newMap.get(child);
 if (node) {
 node.status = 'queued';
 newMap.set(child, node);
 }
 return newMap;
 });
 }
 }

 // Mark as visited
 setDirectories(prev => {
 const newMap = new Map(prev);
 const node = newMap.get(result.dir);
 if (node) {
 node.status = 'visited';
 newMap.set(result.dir, node);
 }
 return newMap;
 });
 }

 scannedDirs += currentBatch.length;
 setState(prev => ({
 ...prev,
 queue,
 queueHead,
 visited: new Set(visited),
 currentBatch: [],
 foundFiles,
 scannedDirs,
 }));

 setPhase('searching');
 await sleep(400);
 }

 addLog(`搜索完成! 扫描 ${scannedDirs} 个目录，找到 ${foundFiles.length} 个文件`);
 setPhase('complete');
 setIsRunning(false);
 }, [isRunning, searchPattern, matchPattern, speed]);

 const reset = () => {
 if (timeoutRef.current) clearTimeout(timeoutRef.current);
 setPhase('idle');
 setState({
 queue: [],
 queueHead: 0,
 visited: new Set(),
 currentBatch: [],
 foundFiles: [],
 scannedDirs: 0,
 maxDirs: MAX_DIRS,
 });
 setDirectories(new Map());
 setLogs([]);
 setIsRunning(false);
 };

 const getStatusColor = (status: DirectoryNode['status']) => {
 switch (status) {
 case 'queued': return 'bg-elevated/50 border-edge';
 case 'visiting': return 'bg-elevated border-edge animate-pulse';
 case 'visited': return 'bg-elevated border-edge/60';
 case 'ignored': return ' bg-surface border-edge opacity-50';
 default: return ' bg-surface border-edge';
 }
 };

 const renderTree = (path: string, depth: number = 0): React.ReactNode => {
 const node = directories.get(path);
 if (!node) return null;

 const isInBatch = state.currentBatch.includes(path);

 return (
 <div key={path} style={{ marginLeft: depth * 16 }}>
 <div className={`flex items-center gap-2 px-2 py-1 my-0.5 rounded text-xs border ${getStatusColor(node.status)} ${isInBatch ? 'ring-2 ring-[var(--color-warning)]' : ''}`}>
 <span className="text-dim">📁</span>
 <span className={node.status === 'ignored' ? 'text-dim line-through' : 'text-body'}>
 {path.split('/').pop()}
 </span>
 {node.status === 'visiting' && <span className="text-heading text-xs">处理中...</span>}
 {node.files.filter(f => matchPattern(f, searchPattern)).length > 0 && node.status === 'visited' && (
 <span className="text-heading text-xs">
 {node.files.filter(f => matchPattern(f, searchPattern)).length} 匹配
 </span>
 )}
 </div>
 {node.children.map(child => renderTree(child, depth + 1))}
 </div>
 );
 };

 return (
 <div className="p-6 max-w-6xl mx-auto">
 <h1 className="text-2xl font-bold mb-2 text-heading">BFS 文件搜索算法</h1>
 <p className="text-body mb-6">
 展示广度优先搜索、指针队列优化和并行批处理机制
 </p>

 {/* Algorithm Overview */}
 <div className="mb-6 p-4 bg-surface rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">算法特点</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
 <div className="p-2 bg-surface rounded">
 <span className="text-heading">指针队列</span>
 <div className="text-dim mt-1">queueHead 替代 splice()</div>
 </div>
 <div className="p-2 bg-surface rounded">
 <span className="text-heading">并行批处理</span>
 <div className="text-dim mt-1">{PARALLEL_BATCH_SIZE} 个目录/批次</div>
 </div>
 <div className="p-2 bg-surface rounded">
 <span className="text-heading">Set 查找</span>
 <div className="text-dim mt-1">O(1) 忽略检查</div>
 </div>
 <div className="p-2 bg-surface rounded">
 <span className="text-heading">防重复</span>
 <div className="text-dim mt-1">visited Set 追踪</div>
 </div>
 </div>
 </div>

 {/* Controls */}
 <div className="flex flex-wrap gap-3 mb-6">
 <input
 type="text"
 value={searchPattern}
 onChange={(e) => setSearchPattern(e.target.value)}
 disabled={isRunning}
 placeholder="搜索模式 (如 *.tsx)"
 className="px-3 py-2 bg-surface border border-edge rounded text-heading text-sm w-40"
 />
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
 onClick={runSearch}
 disabled={isRunning}
 className="px-4 py-2 bg-elevated hover:bg-elevated disabled:bg-elevated disabled:cursor-not-allowed rounded text-heading text-sm font-medium transition-colors"
 >
 {isRunning ? '搜索中...' : '开始搜索'}
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-elevated hover:bg-elevated rounded text-heading text-sm transition-colors"
 >
 重置
 </button>
 </div>

 {/* Status Cards */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">队列长度</div>
 <div className="text-xl font-bold text-heading">{state.queue.length}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">队列头指针</div>
 <div className="text-xl font-bold text-heading">{state.queueHead}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">待处理</div>
 <div className="text-xl font-bold text-heading">
 {Math.max(0, state.queue.length - state.queueHead)}
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">已扫描</div>
 <div className="text-xl font-bold text-heading">{state.scannedDirs}/{state.maxDirs}</div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs text-dim">找到文件</div>
 <div className="text-xl font-bold text-heading">{state.foundFiles.length}</div>
 </div>
 </div>

 {/* Queue Visualization */}
 <div className="mb-6 p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3">队列状态</h3>
 <div className="flex flex-wrap gap-1 font-mono text-xs">
 {state.queue.map((dir, idx) => {
 const isHead = idx === state.queueHead;
 const isProcessed = idx < state.queueHead;
 const isInBatch = state.currentBatch.includes(dir);
 return (
 <div
 key={idx}
 className={`px-2 py-1 rounded border ${
 isInBatch ? 'bg-elevated border-edge text-heading' :
 isProcessed ? ' bg-surface border-edge text-dim' :
 isHead ? ' bg-elevated/50 border-edge text-heading' :
 ' bg-surface border-edge text-body'
 }`}
 >
 {dir.split('/').pop()}
 {isHead && <span className="ml-1 text-heading">←</span>}
 </div>
 );
 })}
 {state.queue.length === 0 && <span className="text-dim">队列为空</span>}
 </div>
 {state.queueHead > 0 && (
 <div className="mt-2 text-xs text-dim">
 已处理 {state.queueHead} 项 | 剩余 {state.queue.length - state.queueHead} 项
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Directory Tree */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-elevated" />
 目录树
 </h3>
 <div className="max-h-80 overflow-y-auto">
 {directories.size > 0 ? renderTree('/project') : (
 <div className="text-dim text-sm">点击"开始搜索"启动</div>
 )}
 </div>

 {/* Legend */}
 <div className="mt-4 pt-3 border-t border-edge flex flex-wrap gap-3 text-xs">
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-elevated/50 border border-edge" />
 <span className="text-body">待处理</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-elevated border-l-2 border-l-edge-hover" />
 <span className="text-body">处理中</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-elevated border-l-2 border-l-edge-hover/60" />
 <span className="text-body">已完成</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-3 h-3 rounded bg-surface border border-edge opacity-50" />
 <span className="text-body">已忽略</span>
 </div>
 </div>
 </div>

 {/* Logs */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <h3 className="text-sm font-semibold text-body mb-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
 执行日志
 </h3>
 <div className="h-80 overflow-y-auto font-mono text-xs space-y-1">
 {logs.map((log, idx) => (
 <div key={idx} className="text-body hover:text-heading">
 {log}
 </div>
 ))}
 {logs.length === 0 && <span className="text-dim">等待开始...</span>}
 </div>
 </div>
 </div>

 {/* Found Files */}
 {state.foundFiles.length > 0 && (
 <div className="mt-6 p-4 bg-elevated border-l-2 border-l-edge-hover/40 rounded-lg">
 <h3 className="text-sm font-semibold text-heading mb-3">
 找到的文件 ({state.foundFiles.length})
 </h3>
 <div className="flex flex-wrap gap-2">
 {state.foundFiles.map((file, idx) => (
 <div key={idx} className="px-2 py-1 bg-elevated rounded text-xs text-heading font-mono">
 {file}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Algorithm Code */}
 <div className="mt-6 p-4 bg-surface rounded-lg">
 <h4 className="text-sm font-semibold text-body mb-3">核心算法 (简化)</h4>
 <pre className="text-xs text-body font-mono overflow-x-auto">
{`let queueHead = 0; // 指针替代 splice

while (queueHead < queue.length && scannedDirs < maxDirs) {
 // 构建批次
 const batch = [];
 while (batch.length < BATCH_SIZE && queueHead < queue.length) {
 const dir = queue[queueHead++]; // 移动指针
 if (!visited.has(dir)) {
 visited.add(dir);
 batch.push(dir);
 }
 }

 // 并行处理批次
 const results = await Promise.all(
 batch.map(dir => readdir(dir))
 );

 // 添加子目录到队列
 results.forEach(r => queue.push(...r.children));
}`}
 </pre>
 </div>
 </div>
 );
}
